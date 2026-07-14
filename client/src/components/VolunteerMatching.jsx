import { useEffect, useState, useRef } from "react";
import axios from "axios";

function VolunteerMatching() {
  const [matches, setMatches] = useState([]);
  const [skills, setSkills] = useState("Basic Teaching, Public Speaking, Patience, Child Communication");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const [source, setSource] = useState("gemini");
  const hasFetched = useRef(false);

  // States for interactive skills editing sandbox
  const [isEditing, setIsEditing] = useState(false);
  const [skillsInput, setSkillsInput] = useState(skills);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    axios
      .post("http://localhost:5000/api/recommend/suggest-matches", { skills })
      .then((res) => {
        if (res.data && res.data.matches) {
          setMatches(res.data.matches);
          setSource(res.data.source || "gemini");
          if (res.data.source === "fallback") {
            setError("Running in resilient local matching mode.");
          } else {
            setError(null);
          }
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setSource("fallback");
        setError("AI Service busy. Operating in offline-resilient mode.");
      })
      .finally(() => setLoading(false));
  }, [skills]);

  const handleSaveSkills = () => {
    hasFetched.current = false; // Reset the fetch guard
    setLoading(true);
    setSkills(skillsInput);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 flex flex-col justify-center items-center h-80">
        <span className="w-6 h-6 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
        <p className="text-slate-400 text-xs font-semibold mt-3 uppercase tracking-wider animate-pulse">Aligning Cognitive Vectors...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-slate-100 h-80 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Volunteer Matching</h2>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide mt-0.5 uppercase">
              {source === "fallback" ? "Offline Matcher" : "Gemini 2.5 Flash"}
            </p>
          </div>
          {source === "fallback" ? (
            <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-200 uppercase tracking-widest flex items-center gap-1 animate-pulse shadow-sm">
              ⚠️ Resilient Fallback
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest">
              NLP Engine
            </span>
          )}
        </div>

        {error && <p className="text-amber-600 text-[9px] font-bold mb-2 bg-amber-50 p-1.5 rounded">{error}</p>}

        {/* ✏️ Profile Skills Sandbox Drawer Box */}
        <div className="mb-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1 relative group">
          <div className="flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Volunteer Profile Skillsets (Interactive):</p>
            {!isEditing && (
              <button 
                onClick={() => { setSkillsInput(skills); setIsEditing(true); }}
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
              >
                Edit skills ✏️
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white text-black focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="e.g. Gardening, Teamwork, Care..."
              />
              <button 
                onClick={handleSaveSkills}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg cursor-pointer"
              >
                Save
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-700 italic">"{skills}"</p>
          )}
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto flex-grow pr-1">
        {matches.length === 0 ? (
          <p className="text-slate-400 text-sm py-6 text-center font-medium">No matches available. Please add events to search matches.</p>
        ) : (
          matches.map((match, index) => {
            // Find event title in global mock events if in offline mode
            const activeEvent = global.isOfflineMode 
              ? global.mockEvents?.find(e => e._id === match.eventId)
              : null;
            const eventTitle = activeEvent ? activeEvent.title : `Event ID: ${match.eventId.slice(-4)}`;

            return (
              <div key={index} className="p-3 bg-white border border-slate-100 rounded-xl flex items-start gap-4 hover:border-emerald-200 transition-all shadow-sm">
                <div className="bg-emerald-50 text-emerald-600 font-black text-xs rounded-xl p-2.5 shrink-0 min-w-[42px] text-center">
                  {match.matchScore || 0}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate">{eventTitle}</p>
                  <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">{match.matchReason}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default VolunteerMatching;