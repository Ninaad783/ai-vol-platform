import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";

function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  const devRole = localStorage.getItem("devRole") || "volunteer";
  const isAdmin = (userEmail.includes("ninaad") || userEmail === "ninaadkumbhar@gmail.com") && devRole === "admin";

  // Custom UI Modals States
  const [toast, setToast] = useState({ show: false, message: "" });
  const [deleteModal, setDeleteModal] = useState({ show: false, targetId: null });
  const [activeDetails, setActiveDetails] = useState(null);

  // Active Certificate Modal State
  const [activeCert, setActiveCert] = useState(null);

  // Join Form State
  const [joinData, setJoinData] = useState({ name: "", email: "", phone: "" });
  const [joinLoading, setJoinLoading] = useState(false);

  // Live Registered Volunteers Roster (Admin Management View)
  const [signups, setSignups] = useState({
    "mock-1": [
      { name: "Avdhoot Patil", email: "avdhootpatil@gmail.com", phone: "9876543210" },
      { name: "Snehal Shinde", email: "snehalshinde@gmail.com", phone: "9823456789" }
    ],
    "mock-2": [
      { name: "Rahul Mane", email: "rahulmane@gmail.com", phone: "9988776655" }
    ]
  });

  // Interactive Reviews Feed (Sandbox NLP Sentiment model)
  const [reviews, setReviews] = useState({
    "mock-1": [
      { author: "Aditi S.", text: "Teaching english grammar to children was super fulfilling!", score: 0.85 },
      { author: "Rohan K.", text: "Nice NGO coordinators, very well organized.", score: 0.60 }
    ],
    "mock-2": [
      { author: "Amit P.", text: "Great cleanup campaign! Cleared lots of plastic around the lake.", score: 0.90 },
      { author: "Sneha G.", text: "A bit muddy, but worth the effort.", score: 0.40 }
    ]
  });
  const [newReviewText, setNewReviewText] = useState("");

  const showNotification = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3500);
  };

  const fetchEvents = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const executeDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events/${deleteModal.targetId}`);
      setEvents((prev) => prev.filter((e) => e._id !== deleteModal.targetId));
      setDeleteModal({ show: false, targetId: null });
      showNotification("Event cleared successfully from cluster 🚀");
    } catch (error) {
      console.log(error);
      showNotification("Network error occurred during execution.");
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinData.name || !joinData.email || !joinData.phone) {
      showNotification("Please fill out all registration fields.");
      return;
    }

    setJoinLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events/${activeDetails._id}/join`, joinData);
      showNotification(response.data.message);
      
      // Append new signup locally for real-time roster updates
      const newSignup = { name: joinData.name, email: joinData.email, phone: joinData.phone };
      setSignups(prev => ({
        ...prev,
        [activeDetails._id]: [...(prev[activeDetails._id] || []), newSignup]
      }));

      setEvents((prev) =>
        prev.map((evt) => (evt._id === activeDetails._id ? response.data.updatedEvent : evt))
      );

      // Add a dynamic volunteer notification to localStorage and dispatch update
      const saved = localStorage.getItem("platform_notifications");
      const list = saved ? JSON.parse(saved) : [];
      const newNotif = {
        id: Date.now(),
        text: `🚀 Joined Campaign: Your registration for "${activeDetails.title}" is confirmed.`,
        time: "Just now",
        type: "system",
        icon: "📅",
        unread: true
      };
      localStorage.setItem("platform_notifications", JSON.stringify([newNotif, ...list]));
      window.dispatchEvent(new Event("local-notifications-update"));

      setJoinData({ name: "", email: "", phone: "" });
      setActiveDetails(null);
    } catch (error) {
      console.log(error);
      showNotification(error.response?.data?.message || "Join request failed.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleAwardCertificate = (signup) => {
    setActiveCert({
      volunteerName: signup.name,
      eventTitle: activeDetails.title,
      organizer: activeDetails.organizerName,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    });

    // Add a dynamic certificate notification to localStorage and dispatch update
    const saved = localStorage.getItem("platform_notifications");
    const list = saved ? JSON.parse(saved) : [];
    const newNotif = {
      id: Date.now(),
      text: `🏆 Awarded: Certificate created for ${signup.name} ("${activeDetails.title}").`,
      time: "Just now",
      type: "certificate",
      icon: "🎓",
      unread: true
    };
    localStorage.setItem("platform_notifications", JSON.stringify([newNotif, ...list]));
    window.dispatchEvent(new Event("local-notifications-update"));
  };

  const handleReviewSubmit = () => {
    if (!newReviewText.trim()) return;

    const textLower = newReviewText.toLowerCase();
    let score = 0.0;

    const positives = ["good", "great", "awesome", "amazing", "wonderful", "nice", "fun", "love", "happy", "helpful", "rewarding", "cool", "clean"];
    const negatives = ["bad", "late", "poor", "difficult", "rain", "wet", "mess", "unorganized", "delay", "rude", "hard", "mud"];

    positives.forEach(w => { if (textLower.includes(w)) score += 0.3; });
    negatives.forEach(w => { if (textLower.includes(w)) score -= 0.3; });

    score = Math.max(-0.99, Math.min(0.99, score));
    if (score === 0.0) score = 0.15; // fallback positive if neutral

    const newRev = {
      author: "You (Simulated)",
      text: newReviewText,
      score: Number(score.toFixed(2))
    };

    setReviews(prev => ({
      ...prev,
      [activeDetails._id]: [...(prev[activeDetails._id] || []), newRev]
    }));
    setNewReviewText("");
  };

  const getCategoryStyles = (category) => {
    switch (category) {
      case "Environment": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Education": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Healthcare": return "bg-rose-50 text-rose-700 border-rose-200";
      case "Relief Work": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Animal Welfare": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

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
    <div className="min-h-screen bg-slate-50 p-6 relative font-sans text-slate-900 flex flex-col gap-6">
      
      {/* Navbar integration with search */}
      <Navbar search={search} setSearch={setSearch} />

      {/* Floating Notification Toast */}
      <div className={`fixed bottom-6 right-6 z-50 transform transition-all duration-500 ease-out bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 ${
        toast.show ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      }`}>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
        <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 text-xl font-bold">⚠️</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirm Deletion</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Are you sure you want to permanently delete this event record?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal({ show: false, targetId: null })} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button onClick={executeDelete} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📜 PDF CERTIFICATE MODAL POPUP */}
      {activeCert && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white p-2 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 relative">
            
            {/* Elegant double-border frame layout */}
            <div className="border-4 border-double border-green-800/80 rounded-2xl p-8 md:p-12 text-center flex flex-col gap-6 bg-amber-50/10 printable-cert">
              {/* CSS Print Styles targeting only the certificate container */}
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  .printable-cert, .printable-cert * { visibility: visible; }
                  .printable-cert { position: absolute; left: 0; top: 0; width: 100%; border: 4px double #14532d !important; padding: 2rem !important; }
                  .print-actions { display: none !important; }
                }
              `}</style>

              <div className="space-y-1">
                <span className="text-4xl">🏆</span>
                <h2 className="text-2xl md:text-3xl font-black text-green-950 uppercase tracking-widest font-serif">Certificate of Appreciation</h2>
                <p className="text-[10px] md:text-xs text-slate-400 font-bold tracking-widest uppercase">Volunteer Command Center recognition</p>
              </div>

              <div className="space-y-2">
                <p className="text-slate-500 text-xs italic">This certificate is proudly presented to</p>
                <h3 className="text-3xl font-extrabold text-slate-950 underline font-serif tracking-tight">{activeCert.volunteerName}</h3>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  For outstanding contribution and selfless service of **8 hours** towards the community volunteer drive **"{activeCert.eventTitle}"** hosted under the authorization of **{activeCert.organizer}**.
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Award Date: {activeCert.date}
                </p>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200/60 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="h-6 font-serif italic text-sm text-green-800">NGO Executive Council</div>
                  <div className="border-t border-slate-300 pt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wide">Authorized Signature</div>
                </div>
                <div className="text-center">
                  <div className="h-6 font-serif italic text-sm text-green-800">VolunConnect Core</div>
                  <div className="border-t border-slate-300 pt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wide">Platform Operations</div>
                </div>
              </div>
            </div>

            {/* Print and Close controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex gap-3 print-actions">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md active:scale-95 text-center"
              >
                Print / Save as PDF 📄
              </button>
              <button 
                onClick={() => setActiveCert(null)}
                className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Side Details Drawer */}
      {activeDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white w-full max-w-xl h-full p-8 shadow-2xl overflow-y-auto transform translate-x-0 transition-transform duration-500 flex flex-col justify-between border-l border-slate-100">
            <div>
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryStyles(activeDetails.category)}`}>
                    {activeDetails.category}
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-2">{activeDetails.title}</h2>
                </div>
                <button onClick={() => setActiveDetails(null)} className="text-slate-400 hover:text-slate-700 text-3xl font-light p-1 transition-all">×</button>
              </div>

              <div className="space-y-4 text-slate-700 text-sm">
                <p><strong>📍 Venue Location:</strong> {activeDetails.address || "Not Specified"}, {activeDetails.location}</p>
                <p><strong>📅 Event Date:</strong> {activeDetails.eventDate ? new Date(activeDetails.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Pending"}</p>
                <p><strong>⏰ Timing Window:</strong> {activeDetails.startTime} - {activeDetails.endTime}</p>
                <p><strong>👥 Vacancies Remaining:</strong> <span className="text-green-600 font-bold">{activeDetails.volunteersNeeded} slots</span></p>
                
                {activeDetails.minAge && <p><strong>🔞 Age gate restriction:</strong> {activeDetails.minAge}+ years old</p>}
                {activeDetails.requiredSkills && <p><strong>🛠️ Target Skillsets:</strong> {activeDetails.requiredSkills}</p>}
                {activeDetails.perks && <p><strong>🎁 Core Benefits:</strong> {activeDetails.perks}</p>}
                {activeDetails.thingsToBring && <p><strong>🎒 Items to Pack:</strong> {activeDetails.thingsToBring}</p>}

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed mb-4">
                  <p className="font-bold text-slate-900 mb-1">Operational Description</p>
                  {activeDetails.description}
                </div>

                {/* Google Maps Embed Iframe */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mt-3">
                  <p className="font-bold text-slate-800 text-xs mb-1.5 flex items-center gap-1">
                    <span>📍</span> Event Location Map
                  </p>
                  <iframe
                    title="Event Location Map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      activeDetails.address + ", " + activeDetails.location
                    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-40 rounded-xl border border-slate-100 shadow-inner"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {/* 🛡️ ADMIN ONLY: REGISTERED VOLUNTEERS ROSTER & CERTIFICATE DISPENSATORY */}
                {isAdmin && (
                  <div className="border-t border-slate-200 pt-5 mt-5">
                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span>👑</span> NGO Admin: Registered Roster & Awards
                    </h4>
                    <div className="space-y-2">
                      {(signups[activeDetails._id] || []).length === 0 ? (
                        <p className="text-slate-400 text-xs italic">No volunteers registered for this event yet.</p>
                      ) : (
                        (signups[activeDetails._id] || []).map((signup, idx) => (
                          <div 
                            key={idx} 
                            className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center gap-4 hover:border-slate-200 transition-all shadow-sm"
                          >
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-xs truncate">{signup.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{signup.email} • {signup.phone}</p>
                            </div>
                            <button
                              onClick={() => handleAwardCertificate(signup)}
                              className="bg-purple-50 border border-purple-100 hover:bg-purple-100 text-purple-700 font-bold text-[10px] px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                            >
                              Award Cert 🎓
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 💬 Interactive Reviews & Sentiment Analysis Sandbox */}
                <div className="border-t border-slate-200 pt-5 mt-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Volunteer Review Feed (NLP Sentiment)</h4>
                  
                  <div className="space-y-2.5 max-h-44 overflow-y-auto mb-3 pr-1">
                    {(reviews[activeDetails._id] || []).length === 0 ? (
                      <p className="text-slate-400 text-xs italic">No reviews posted yet. Be the first to share your experience!</p>
                    ) : (
                      (reviews[activeDetails._id] || []).map((rev, rIdx) => (
                        <div key={rIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-start gap-2 text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{rev.author}</p>
                            <p className="text-slate-500 mt-0.5 italic">"{rev.text}"</p>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest shrink-0 shadow-sm ${
                            rev.score >= 0.2 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            rev.score <= -0.2 ? "bg-rose-50 text-rose-700 border-rose-200" :
                            "bg-slate-50 text-slate-500 border-slate-200"
                          }`}>
                            {rev.score >= 0 ? "+" : ""}{rev.score}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a review (e.g. Great event, late coordination)..."
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReviewSubmit()}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-black placeholder:text-slate-400"
                    />
                    <button
                      onClick={handleReviewSubmit}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-all shadow-md active:scale-95 shrink-0"
                    >
                      Post review
                    </button>
                  </div>
                </div>

                {/* Registration Block - only visible to volunteers */}
                {!isAdmin && (
                  <div className="border-t border-dashed border-slate-200 pt-5 mt-5">
                    <h4 className="text-lg font-bold text-slate-900 mb-3">Sign Up For This Drive ✨</h4>
                    {activeDetails.volunteersNeeded <= 0 ? (
                      <div className="bg-amber-50 text-amber-800 p-4 rounded-xl font-bold text-center border border-amber-200">
                        🚫 Slot booking capped. Registration full!
                      </div>
                    ) : (
                      <form onSubmit={handleJoinSubmit} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Your Full Name"
                          value={joinData.name}
                          onChange={(e) => setJoinData({ ...joinData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-black"
                          required
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={joinData.email}
                            onChange={(e) => setJoinData({ ...joinData, email: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-black"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Contact Phone"
                            value={joinData.phone}
                            onChange={(e) => setJoinData({ ...joinData, phone: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-black"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={joinLoading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          {joinLoading ? "Processing Sync..." : "Confirm My Placement Slot 🚀"}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => setActiveDetails(null)} className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all mt-6 text-sm cursor-pointer">
              Dismiss Panel
            </button>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Events Directory</h1>
            <p className="text-slate-500 text-sm mt-1">Manage, update, and deploy community activities safely.</p>
          </div>
          {isAdmin && (
            <button onClick={() => navigate("/create-event")} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 transform active:scale-95 cursor-pointer">
              <span>+</span> Deploy New Event
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
            <p className="text-slate-400 font-medium text-lg">No events match your criteria or are currently registered in the database.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
                
                <div className={`h-1.5 w-full ${
                  event.category === "Environment" ? "bg-emerald-500" :
                  event.category === "Education" ? "bg-blue-500" :
                  event.category === "Healthcare" ? "bg-rose-500" : "bg-amber-500"
                }`} />

                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide uppercase ${getCategoryStyles(event.category)}`}>
                      {event.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium tracking-tight">📍 {event.location}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-snug group-hover:text-green-600 transition-colors mb-2">
                    {event.title}
                  </h2>

                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-4 bg-slate-50 px-3 py-1.5 rounded-xl w-fit border border-slate-100">
                    <span className="text-sm">👥</span> {event.volunteersNeeded} Slots Remaining
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                </div>

                <div className="p-6 pt-0 bg-gradient-to-t from-slate-50/50 to-transparent">
                  <div className="flex gap-2.5 border-t border-slate-100 pt-4">
                    <button onClick={() => setActiveDetails(event)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer">
                      View Details & Sign Up
                    </button>
                    {isAdmin && (
                      <>
                        <button onClick={() => navigate(`/edit-event/${event._id}`)} className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
                          Edit
                        </button>
                        <button onClick={() => setDeleteModal({ show: true, targetId: event._id })} className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl text-xs font-bold transition-all border border-rose-100 cursor-pointer">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;