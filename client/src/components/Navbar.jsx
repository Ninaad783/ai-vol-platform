import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { FaBell, FaTimes, FaInbox } from "react-icons/fa";

function Navbar({ search, setSearch }) {
  const { user } = useUser();
  const userName = user?.firstName || "Volunteer";

  // Notification state synchronized with local storage
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Load and listen for changes in notifications
  const syncNotifications = () => {
    const saved = localStorage.getItem("platform_notifications");
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      const count = parsed.filter((n) => n.unread).length;
      setUnreadCount(count);
    } else {
      const defaultNotifs = [
        {
          id: 1,
          text: "Direct Alignment: Pashan Lake Cleanup matches your 'Gardening' skill!",
          time: "10m ago",
          type: "match",
          icon: "✨",
          unread: true
        },
        {
          id: 2,
          text: "Weather Alert: Rainy conditions predicted for Pashan cleanup. Wear sports shoes!",
          time: "1h ago",
          type: "weather",
          icon: "🌧️",
          unread: true
        },
        {
          id: 3,
          text: "Awarded: Your certificate for Slum tutoring is ready for download.",
          time: "4h ago",
          type: "certificate",
          icon: "🏆",
          unread: true
        }
      ];
      localStorage.setItem("platform_notifications", JSON.stringify(defaultNotifs));
      setNotifications(defaultNotifs);
      setUnreadCount(3);
    }
  };

  useEffect(() => {
    syncNotifications();

    // Event listeners to handle real-time synchronization on the same tab
    window.addEventListener("local-notifications-update", syncNotifications);
    window.addEventListener("storage", syncNotifications);

    return () => {
      window.removeEventListener("local-notifications-update", syncNotifications);
      window.removeEventListener("storage", syncNotifications);
    };
  }, []);

  const handleBellClick = () => {
    setShowNotif(!showNotif);
    setUnreadCount(0); // Clear badge
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    localStorage.setItem("platform_notifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 flex justify-between items-center w-full shrink-0 relative">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Hello, {userName}! 🚀
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Welcome back to your Volunteer Connect command deck.
        </p>
      </div>

      <div className="flex items-center gap-5">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search events by title, city, category..."
            value={search || ""}
            onChange={(e) => setSearch && setSearch(e.target.value)}
            className="w-80 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm pr-10"
          />
          <span className="absolute right-3.5 top-3.5 text-xs text-slate-400">🔍</span>
        </div>

        {/* 🔔 Notification Bell Icon */}
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer relative active:scale-95"
          >
            <FaBell className="text-sm" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {showNotif && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <FaInbox className="text-slate-400 text-xs" />
                  Command Center Notifications
                </span>
                <button
                  onClick={() => setShowNotif(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-xs italic text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border flex gap-2.5 transition-all text-[11px] leading-snug ${
                        n.unread
                          ? "bg-blue-50/50 border-blue-100 font-semibold text-slate-800"
                          : "bg-slate-50/50 border-slate-100 text-slate-600"
                      }`}
                    >
                      <span className="text-sm shrink-0">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="break-words">{n.text}</p>
                        <span className="text-[9px] text-slate-400 block mt-1 font-medium">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setShowNotif(false)}
                className="w-full text-center text-[10px] font-black text-green-600 hover:text-green-700 tracking-wider uppercase border-t border-slate-100 pt-2 cursor-pointer mt-1"
              >
                Close Alerts Drawer
              </button>
            </div>
          )}
        </div>

        {/* User Button */}
        <div className="border-l border-slate-200 pl-5 flex items-center h-9">
          <UserButton afterSignOutUrl="/login" />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
