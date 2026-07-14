from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for your React app

# 1. GENERATE SYNTHETIC HISTORICAL DATASET FOR MODEL TRAINING
# We build a mock history of 200 events so the model can learn real volunteer behaviors
np.random.seed(42)
categories = ['environment', 'education', 'healthcare', 'relief work', 'animal welfare']
cities = ['pune', 'mumbai', 'delhi', 'bangalore']

mock_data = {
    'category': np.random.choice(categories, 200),
    'location': np.random.choice(cities, 200),
    'volunteersNeeded': np.random.randint(5, 60, 200),
}

df = pd.DataFrame(mock_data)

# Feature Engineering: Turnout depends on category and target size
# Environment and Healthcare drives generally attract higher turnouts in our mock rules
def calculate_mock_turnout(row):
    base = 75.0
    if row['category'] in ['environment', 'healthcare']:
        base += 10.0
    if row['volunteersNeeded'] > 40:
        base -= 15.0  # Large events are harder to fill completely
    return min(max(base + np.random.normal(0, 5), 30.0), 100.0)

df['expected_turnout_pct'] = df.apply(calculate_mock_turnout, axis=1)

# 2. ENCODE TEXT DATA INTO NUMERICAL TOKENS FOR MACHINE LEARNING
le_category = LabelEncoder()
le_location = LabelEncoder()

df['category_encoded'] = le_category.fit_transform(df['category'])
df['location_encoded'] = le_location.fit_transform(df['location'])

# Train the Random Forest Regressor Model
X = df[['category_encoded', 'location_encoded', 'volunteersNeeded']]
y = df['expected_turnout_pct']

model = RandomForestRegressor(n_estimators=50, random_state=42)
model.fit(X, y)

print("🚀 Scikit-Learn Predictive Model Trained Successfully inside Python Ecosystem!")

# 3. LIVE ENDPOINT TO PROCESS MERN REQUESTS
@app.route('/api/predict', methods=['POST'])
def predict_turnout():
    data = request.json
    try:
        category = str(data.get('category', 'environment')).lower().strip()
        location = str(data.get('location', 'pune')).lower().strip()
        volunteers_needed = int(data.get('volunteersNeeded', 10))

        # Handle unseen categories or locations gracefully using fallback defaults
        try:
            cat_encoded = le_category.transform([category])[0]
        except ValueError:
            cat_encoded = le_category.transform(['environment'])[0]

        try:
            loc_encoded = le_location.transform([location])[0]
        except ValueError:
            loc_encoded = le_location.transform(['pune'])[0]

        # Process standard ML inference prediction
        prediction_input = np.array([[cat_encoded, loc_encoded, volunteers_needed]])
        predicted_pct = model.predict(prediction_input)[0]
        
        # Calculate concrete headcounts based on target percentages
        predicted_count = int(round((predicted_pct / 100.0) * volunteers_needed))

        return jsonify({
            'success': True,
            'expectedTurnoutPercentage': round(predicted_pct, 1),
            'predictedAttendanceCount': min(predicted_count, volunteers_needed)
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)