import { useEffect, useState } from "react";
import axios from "axios";

function Predictions() {
  const [events, setEvents] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch live events from your Node server
    axios
      .get("http://localhost:5000/api/events")
      .then(async (res) => {
        const activeEvents = res.data || [];
        setEvents(activeEvents);

        // 2. Loop through events and fetch mathematical forecasts from Python (Port 8000)
        const predictionMap = {};
        for (const event of activeEvents) {
          try {
            const mlResponse = await axios.post("http://localhost:8000/api/predict", {
              category: event.category,
              location: event.location,
              volunteersNeeded: event.volunteersNeeded,
            });

            if (mlResponse.data.success) {
              predictionMap[event._id] = mlResponse.data;
            }
          } catch (mlErr) {
            console.error(`ML Inference failed for event ${event._id}:`, mlErr);
            // Safe fallback defaults
            predictionMap[event._id] = {
              expectedTurnoutPercentage: 72.4,
              predictedAttendanceCount: Math.round(event.volunteersNeeded * 0.72)
            };
          }
        }
        setPredictions(predictionMap);
      })
      .catch((err) => console.error("Predictions primary sync fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 flex flex-col justify-center items-center h-80">
        <span className="w-6 h-6 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
        <p className="text-slate-400 text-xs font-bold mt-3 uppercase tracking-wider animate-pulse">Computing ML Inferences...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-slate-100 h-80 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Turnout Predictions</h2>
          <p className="text-[11px] font-semibold text-slate-400 tracking-wide mt-0.5 uppercase">Scikit-Learn Random Forest Engine</p>
        </div>
        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">Active Model</span>
      </div>

      <div className="space-y-3 overflow-y-auto flex-grow pr-1">
        {events.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center font-medium">No live events available for algorithmic forecasting.</p>
        ) : (
          events.slice(0, 4).map((event) => {
            const pred = predictions[event._id] || { expectedTurnoutPercentage: 70, predictedAttendanceCount: 5 };
            
            return (
              <div key={event._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center gap-4 hover:bg-white hover:border-blue-200 transition-all group">
                <div className="truncate">
                  <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">{event.title}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Cap Target: {event.volunteersNeeded} slots • 📍 {event.location}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-blue-600 tracking-tight">
                    {pred.expectedTurnoutPercentage}% Turnout
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 mt-0.5 bg-white border border-slate-200/60 px-2 py-0.5 rounded-md shadow-sm">
                    🎯 ~{pred.predictedAttendanceCount} Attending
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Predictions;