import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  FaMagic,
  FaCalendarPlus,
  FaFileAlt,
  FaGraduationCap,
  FaTimes,
  FaBrain
} from "react-icons/fa";

function QuickActions() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showReport, setShowReport] = useState(false);
  const [showTraining, setShowTraining] = useState(false);

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const devRole = localStorage.getItem("devRole") || "volunteer";
  const isAdmin = userEmail === "ninaadkumbhar@gmail.com" && devRole === "admin";

  const handleCreateClick = () => {
    if (isAdmin) {
      navigate("/create-event");
    } else {
      if (userEmail === "ninaadkumbhar@gmail.com") {
        alert("⚠️ Access Restricted: You are simulating the Volunteer view. Switch your role to 'Admin' in the Sidebar to create events!");
      } else {
        alert("⚠️ Access Denied: You must be logged in as an authorized administrator to deploy volunteer events.");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-5">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* 1. Create Event */}
        <button 
          onClick={handleCreateClick}
          className="col-span-2 flex flex-col items-center justify-center gap-2 h-24 bg-blue-50 hover:bg-blue-100/80 text-blue-700 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all font-bold text-sm cursor-pointer shadow-sm active:scale-95"
        >
          <FaCalendarPlus className="text-lg" />
          <span>Create Event</span>
        </button>

        {/* 3. AI Report */}
        <button 
          onClick={() => setShowReport(true)}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-amber-50 hover:bg-amber-100/80 text-amber-700 rounded-2xl border border-amber-100 hover:border-amber-200 transition-all font-bold text-sm cursor-pointer shadow-sm active:scale-95"
        >
          <FaFileAlt className="text-lg" />
          <span>AI Report</span>
        </button>

        {/* 4. Training Material */}
        <button 
          onClick={() => setShowTraining(true)}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-purple-50 hover:bg-purple-100/80 text-purple-700 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all font-bold text-sm cursor-pointer shadow-sm active:scale-95"
        >
          <FaGraduationCap className="text-lg" />
          <span>Training Material</span>
        </button>
      </div>

      {/* 📊 MODAL: AI OPERATIONS EXECUTIVE REPORT */}
      {showReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FaBrain className="text-amber-500 text-lg" />
                <h3 className="text-xl font-bold text-slate-900">AI Operations Report</h3>
              </div>
              <button 
                onClick={() => setShowReport(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3.5 text-slate-700 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wide">Cognitive Match Rate</span>
                  <span className="text-xl font-black text-slate-800">86.4%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wide">Volunteer Sentiment</span>
                  <span className="text-xl font-black text-emerald-600">+0.82 Polarity</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <h4 className="font-bold text-amber-800 mb-1">🤖 Model Insights & Recommendations</h4>
                <ul className="list-disc pl-4 space-y-1.5 font-medium text-slate-600 text-[11px]">
                  <li>Rainy forecasts in Pune will affect upcoming outdoor cleanup campaigns. Recommend recruiting a **+20% buffer** of slots.</li>
                  <li>Education drives report a **92% attendance rate**; suggest scaling this layout to healthcare camps.</li>
                  <li>K-Means logs show Kothrud has high volunteer density. Suggest redirecting relief work to Pashan to distribute load.</li>
                </ul>
              </div>
            </div>

            <button 
              onClick={() => setShowReport(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all text-xs mt-2"
            >
              Close Operations Panel
            </button>
          </div>
        </div>
      )}

      {/* 📚 MODAL: VOLUNTEER TRAINING MATERIAL */}
      {showTraining && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-purple-600 text-lg" />
                <h3 className="text-xl font-bold text-slate-900">Training & Orientation</h3>
              </div>
              <button 
                onClick={() => setShowTraining(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3.5 text-slate-700 text-xs leading-relaxed max-h-[300px] overflow-y-auto pr-1">
              <p className="font-medium text-slate-500">Welcome to VolunConnect. Use this guide to ensure safe, effective, and impactful community contributions.</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    1. On-Site Safety Protocols
                  </h4>
                  <p className="text-slate-500 text-[11px] pl-3.5 mt-0.5">Always pack a water bottle, cap, and wears comfortable athletic shoes. Inspect turnout predictions and weather status on your command dashboard before heading out.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    2. Communication & Empathy Guidelines
                  </h4>
                  <p className="text-slate-500 text-[11px] pl-3.5 mt-0.5">For education drives, practice child safety guidelines, patience, and positive reinforcement. Let NGO organizers coordinate the group activities.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    3. Impact Hours Log
                  </h4>
                  <p className="text-slate-500 text-[11px] pl-3.5 mt-0.5">Ensure you check-in at the coordinator desk on arrival. Check-out is mandatory to record hours worked, which helps train our K-Means volunteer segment classifications.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowTraining(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all text-xs mt-2"
            >
              Dismiss Orientation Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickActions;