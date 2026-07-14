require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Enable Global CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Primary Vite dev port
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin === "http://localhost:5173" || origin === "http://localhost:5174")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// 2. Programmatic generator to create exactly 100 unique, realistic mock events
const generateMockEvents = () => {
  const categories = ["Education", "Environment", "Healthcare", "Relief Work", "Animal Welfare"];
  const locations = ["Pune", "Mumbai", "Bangalore", "Delhi", "Hyderabad"];
  
  const titles = {
    "Education": [
      "Slum Education tutoring", "English Literacy Workshop", "Primary Math Coaching", 
      "Interactive Storytelling", "Computer Literacy Camp", "Maths Homework Club", 
      "Science Experiment Camp", "Underprivileged Library Setup", "Creative Writing Seminar", 
      "Adult Literacy Class"
    ],
    "Environment": [
      "Pashan Lake Cleanup", "Reforestation Campaign", "Beach Cleanliness Drive", 
      "Public Park Plantation", "Waste Segregation Camp", "Community Gardening", 
      "Anti-Plastic Awareness Rally", "River Bank De-weeding", "Urban Green Corridor", 
      "Composting Workshop"
    ],
    "Healthcare": [
      "Neighborhood Medical Camp", "Blood Donation Drive", "First Aid Safety Seminar", 
      "Mental Health Awareness Meet", "Hygiene Kit Distribution", "Nutrition & Diet Workshop", 
      "Free Eye Checkup Camp", "Elderly Care Health Drive", "Dental Hygiene Clinic", 
      "Vaccination Guidance Desk"
    ],
    "Relief Work": [
      "Disaster ration sorting", "Emergency food distribution", "Clothing Donation Drive", 
      "Warm Blanket Distribution", "Flood Relief Logistics", "Hot Meal Soup Kitchen", 
      "Shelter Construction", "Winter Apparel Sorting", "Clean Water Can Distribution", 
      "Ration Packaging Shift"
    ],
    "Animal Welfare": [
      "Stray Dog Feeding", "Animal Shelter Cleaning", "Veterinary Help Camp", 
      "Incentive Vaccination", "Adopt-a-Pet Meetup", "Bird Feeder Crafting", 
      "Stray Cat Rescue", "Feral Dog Census Walk", "Animal Adoption Campaign", 
      "Shelter Wall Painting"
    ]
  };

  const organizers = {
    "Education": "Teach India NGO",
    "Environment": "Green Earth NGO",
    "Healthcare": "Red Cross Chapter",
    "Relief Work": "Universal Relief NGO",
    "Animal Welfare": "Compassion Foundation"
  };

  const skills = {
    "Education": "Basic Teaching, Patience, Child Communication, English Literacy",
    "Environment": "Physical Fitness, Teamwork, Outdoor Motivation, Gardening",
    "Healthcare": "Basic First Aid, Empathy, Customer Service, Clinical Guidance",
    "Relief Work": "Organization, Teamwork, Active Listening, Physical Stamina",
    "Animal Welfare": "Patience, Animal Handling, Compassion, Public Relations"
  };

  const things = {
    "Education": "Notebooks, Pens, Water bottle, Smile",
    "Environment": "Gloves, Sports shoes, Cap, Water bottle",
    "Healthcare": "Face mask, Hand sanitizer, ID card, Water bottle",
    "Relief Work": "ID card, Face mask, Gloves, Comfortable clothing",
    "Animal Welfare": "Hand sanitizer, Face mask, Treats, Closed shoes"
  };

  const list = [];
  for (let i = 1; i <= 100; i++) {
    const cat = categories[i % categories.length];
    const loc = locations[i % locations.length];
    const titleArr = titles[cat];
    const title = titleArr[i % titleArr.length] + ` (Batch #${Math.floor(i / 5) + 1})`;
    
    list.push({
      _id: `mock-${i}`,
      title: title,
      description: `Join us in our community program for "${title}". Volunteers will collaborate with NGO staff on-site to handle logistics, engage with beneficiaries, and drive local social impact.`,
      location: loc,
      address: `${loc} Central Area, Zone ${i % 4 + 1}`,
      category: cat,
      volunteersNeeded: 15 + (i * 3) % 35,
      eventDate: new Date(Date.now() + 86400000 * (i % 20 + 2)).toISOString().split("T")[0],
      startTime: "09:00 AM",
      endTime: "01:00 PM",
      organizerName: organizers[cat],
      contactNumber: `98765${String(10000 + i).slice(-5)}`,
      requiredSkills: skills[cat],
      thingsToBring: things[cat],
      perks: "Certificate, Meals, T-Shirt"
    });
  }
  return list;
};

global.isOfflineMode = false;
global.mockEvents = generateMockEvents();

// Helper to encode password in MONGO_URI if it contains unencoded special characters
function getSanitizedMongoUri(uri) {
  if (!uri) return uri;
  const prefix = "mongodb://";
  if (!uri.startsWith(prefix)) return uri;

  const body = uri.slice(prefix.length);
  const lastAtIdx = body.lastIndexOf("@");
  if (lastAtIdx === -1) return uri;

  const credentials = body.slice(0, lastAtIdx);
  const hostsAndOptions = body.slice(lastAtIdx);
  
  const colonIdx = credentials.indexOf(":");
  if (colonIdx === -1) return uri;

  const username = credentials.slice(0, colonIdx);
  const password = credentials.slice(colonIdx + 1);

  const encodedUser = encodeURIComponent(decodeURIComponent(username));
  const encodedPass = encodeURIComponent(decodeURIComponent(password));

  return `${prefix}${encodedUser}:${encodedPass}${hostsAndOptions}`;
}

// 3. Mount REST API Routes
const eventRoutes = require("./routes/eventRoutes");
const aiRoutes = require("./routes/aiRoutes");
const matchRoutes = require("./routes/matchRoutes");

app.use("/api/events", eventRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/recommend", matchRoutes);

// 4. Start Server with Connection-Failure Bypass
const MONGO_URI = getSanitizedMongoUri(process.env.MONGO_URI);

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected Successfully!");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB Connection Failed:", err.message);
      console.warn("⚠️ Bypassing connection. Starting server in Offline Resilient Mode (using Mock DB).");
      global.isOfflineMode = true;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (Offline Resilient Mode)`);
      });
    });
} else {
  console.warn("⚠️ No MONGO_URI found in env. Starting server in Offline Resilient Mode (using Mock DB).");
  global.isOfflineMode = true;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (Offline Resilient Mode)`);
  });
}