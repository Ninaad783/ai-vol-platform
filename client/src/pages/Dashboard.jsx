import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import UpcomingEvents from "../components/UpcomingEvents";
import AIAssistant from "../components/AIAssistant";
import VolunteerMatching from "../components/VolunteerMatching";
import Predictions from "../components/Predictions";
import QuickActions from "../components/QuickActions";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Master synchronization fetch data pipeline
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events`)
      .then((res) => {
        setEvents(res.data || []);
      })
      .catch((err) => {
        console.error("Dashboard primary master fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter events dynamically based on search query
  const filteredEvents = events.filter((event) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      event.title.toLowerCase().includes(q) ||
      event.category.toLowerCase().includes(q) ||
      event.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 overflow-x-hidden w-full space-y-6">
      <Navbar search={search} setSearch={setSearch} />

      {/* Unified synchronization layer passing filtered events state down */}
      <div>
        <StatsCards events={filteredEvents} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <UpcomingEvents events={filteredEvents} loading={loading} />
        <AIAssistant />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <VolunteerMatching />
        <Predictions />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <QuickActions />

        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-4">
              AI Insights
            </h2>
            <div className="space-y-3.5 text-sm font-medium text-slate-600">
              <p className="flex items-center gap-2">
                <span className="text-emerald-500">📅</span>
                <span>Most volunteers prefer weekend events due to scheduling availability.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-500">📚</span>
                <span>Education events show the highest attendance consistency (+92%).</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-purple-500">📈</span>
                <span>Predicted turnout increased by 15% after introducing matching caches.</span>
              </p>
            </div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-3">
            Updated: Real-time Analytics Feed
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;