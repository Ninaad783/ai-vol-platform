import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  FaHome,
  FaCalendarAlt,
  FaRobot,
  FaChartBar,
  FaTrophy
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();
  const { user } = useUser();
  const [role, setRole] = useState("volunteer");

  useEffect(() => {
    const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
    const isAuthorized = userEmail.includes("ninaad") || userEmail === "ninaadkumbhar@gmail.com";

    if (!isAuthorized) {
      localStorage.setItem("devRole", "volunteer");
      setRole("volunteer");
      return;
    }

    const savedRole = localStorage.getItem("devRole");
    if (savedRole) {
      setRole(savedRole);
    } else {
      localStorage.setItem("devRole", "admin"); // Default to admin for ninaad
      setRole("admin");
    }
  }, [user]);

  const toggleRole = () => {
    const nextRole = role === "admin" ? "volunteer" : "admin";
    localStorage.setItem("devRole", nextRole);
    setRole(nextRole);
    window.location.reload();
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) => {
    const base = "flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200";
    if (isActive(path)) {
      return `${base} bg-green-800 text-white shadow-lg border-l-4 border-emerald-400 font-bold`;
    }
    return `${base} text-green-100 hover:bg-green-900/60 hover:text-white`;
  };

  const emailLower = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  const showSwitcher = emailLower.includes("ninaad") || emailLower === "ninaadkumbhar@gmail.com";

  return (
    <div className="w-72 bg-gradient-to-b from-green-950 to-green-900 text-white p-6 min-h-screen flex flex-col justify-between shadow-2xl shrink-0">
      <div>
        <div className="flex items-center gap-3 mb-8 border-b border-green-800 pb-5">
          <span className="text-3xl">🤝</span>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-none">VolunConnect</h1>
            <p className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-widest">Command deck</p>
          </div>
        </div>

        <ul className="space-y-2">
          <li>
            <Link to="/" className={linkClass("/")}>
              <FaHome className="text-xl" />
              <span>Dashboard</span>
            </Link>
          </li>

          <li>
            <Link to="/events" className={linkClass("/events")}>
              <FaCalendarAlt className="text-xl" />
              <span>Events Directory</span>
            </Link>
          </li>

          <li>
            <Link to="/ai-assistant" className={linkClass("/ai-assistant")}>
              <FaRobot className="text-xl" />
              <span>AI Assistant</span>
            </Link>
          </li>

          <li>
            <Link to="/predictions" className={linkClass("/predictions")}>
              <FaChartBar className="text-xl" />
              <span>ML Predictions</span>
            </Link>
          </li>

          <li>
            <Link to="/leaderboard" className={linkClass("/leaderboard")}>
              <FaTrophy className="text-xl" />
              <span>Leaderboard</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Role Switcher Sandbox Toggle Widget - strictly visible to ninaad */}
      {showSwitcher && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-2xl mt-auto">
          <p className="text-[10px] font-black text-emerald-400 tracking-wider uppercase mb-2">Demo Space Settings</p>
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-white capitalize flex items-center gap-1.5">
              {role === "admin" ? "👑 Admin View" : "🤝 Volunteer View"}
            </span>
            <button 
              onClick={toggleRole}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[10px] rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              {role === "admin" ? "Sim Vol" : "Sim Admin"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;