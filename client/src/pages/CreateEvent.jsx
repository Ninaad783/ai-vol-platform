import { useState } from "react";
import axios from "axios";

function CreateEvent() {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    address: "",
    category: "",
    volunteersNeeded: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    organizerName: "",
    contactNumber: "",
    thingsToBring: "",
    minAge: "",
    requiredSkills: "",
    perks: "",
    description: "",
  });

  // UI Flow States
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [aiLoading, setAiLoading] = useState(false);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 4000);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:bg-slate-50 disabled:text-slate-400";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Trigger Gemini AI Generation Setup
  const handleAiGeneration = async () => {
    if (!formData.title.trim()) {
      showNotification("Please enter an Event Title first to guide the AI.", "error");
      return;
    }

    setAiLoading(true);
    showNotification("Gemini is analyzing title and generating logistics... 🧠", "success");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/generate-details`, {
        title: formData.title,
      });

      const { description, requiredSkills, thingsToBring } = response.data;

      setFormData((prev) => ({
        ...prev,
        description: description || prev.description,
        requiredSkills: requiredSkills || prev.requiredSkills,
        thingsToBring: thingsToBring || prev.thingsToBring,
      }));

      showNotification("Operational details successfully populated by AI! 🚀", "success");
    } catch (error) {
      console.error(error);
      showNotification("AI Generation pipeline timed out. Please input manually.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events`, formData);
      
      showNotification("Event Deployed Successfully to Cloud Cluster! 🚀", "success");

      setFormData({
        title: "",
        location: "",
        address: "",
        category: "",
        volunteersNeeded: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        organizerName: "",
        contactNumber: "",
        thingsToBring: "",
        minAge: "",
        requiredSkills: "",
        perks: "",
        description: "",
      });
    } catch (error) {
      console.log(error);
      showNotification("Failed to deploy operational record.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 flex justify-center items-center p-8 relative overflow-hidden">
      
      {/* Custom Sliding Toast System */}
      <div className={`fixed bottom-5 right-5 z-50 transform transition-all duration-500 ease-out flex items-center p-4 rounded-2xl shadow-2xl border ${
        toast.show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      } ${toast.type === "success" ? "bg-white border-green-500 text-slate-900" : "bg-white border-red-500 text-slate-900"}`}>
        <div className={`w-2 h-2 rounded-full mr-3 ${aiLoading ? "animate-ping bg-blue-500" : "animate-pulse " + (toast.type === "success" ? "bg-green-500" : "bg-red-500")}`} />
        <span className="font-semibold text-sm">{toast.message}</span>
      </div>

      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl p-8 z-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Create New Event 🚀
        </h1>
        <p className="text-slate-600 mb-8 text-lg">
          Create and publish volunteer events for your community.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Event Title Row with Smart AI Integration Toggle Button */}
          <div>
            <label className="block text-slate-800 font-semibold mb-2">Event Title</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="e.g., Slum Education Drive or Clean-up Drive" 
                className={inputClass} 
                disabled={aiLoading}
                required 
              />
              <button
                type="button"
                onClick={handleAiGeneration}
                disabled={aiLoading}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center gap-2 shrink-0 active:scale-95"
              >
                {aiLoading ? "Processing..." : "✨ AI Assist"}
              </button>
            </div>
          </div>

          {/* City & Category */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-800 font-semibold mb-2">City</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Pune" className={inputClass} disabled={aiLoading} required />
            </div>
            <div>
              <label className="block text-slate-800 font-semibold mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass} disabled={aiLoading} required>
                <option value="">Select Category</option>
                <option>Environment</option>
                <option>Education</option>
                <option>Healthcare</option>
                <option>Relief Work</option>
                <option>Animal Welfare</option>
              </select>
            </div>
          </div>

          {/* Exact Address */}
          <div>
            <label className="block text-slate-800 font-semibold mb-2">Exact Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Pashan Lake Main Gate, Pune" className={inputClass} disabled={aiLoading} required />
          </div>

          {/* Date, Start Time & End Time */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-slate-800 font-semibold mb-2">Event Date</label>
              <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className={inputClass} disabled={aiLoading} required />
            </div>
            <div>
              <label className="block text-slate-800 font-semibold mb-2">Start Time</label>
              <input type="text" name="startTime" value={formData.startTime} onChange={handleChange} placeholder="09:00 AM" className={inputClass} disabled={aiLoading} required />
            </div>
            <div>
              <label className="block text-slate-800 font-semibold mb-2">End Time</label>
              <input type="text" name="endTime" value={formData.endTime} onChange={handleChange} placeholder="01:00 PM" className={inputClass} disabled={aiLoading} required />
            </div>
          </div>

          {/* Volunteers Needed & Minimum Age */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-800 font-semibold mb-2">Volunteers Needed</label>
              <input type="number" name="volunteersNeeded" value={formData.volunteersNeeded} onChange={handleChange} placeholder="50" className={inputClass} disabled={aiLoading} required />
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-2">Minimum Age Required</label>
              <input type="number" name="minAge" value={formData.minAge} onChange={handleChange} placeholder="16" className={inputClass} disabled={aiLoading} />
            </div>
          </div>

          {/* Required Skills & Perks */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-800 font-semibold mb-2">Required Skills (AI Auto-fillable)</label>
              <input 
                type="text" 
                name="requiredSkills" 
                value={formData.requiredSkills} 
                onChange={handleChange} 
                placeholder="Basic Gardening, Teamwork" 
                className={inputClass} 
                disabled={aiLoading}
              />
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-2">Perks Provided</label>
              <input type="text" name="perks" value={formData.perks} onChange={handleChange} placeholder="Certificate, Refreshments" className={inputClass} disabled={aiLoading} />
            </div>
          </div>

          {/* Organizer Name & Contact Number */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-800 font-semibold mb-2">Organizer Name</label>
              <input type="text" name="organizerName" value={formData.organizerName} onChange={handleChange} placeholder="Green Earth NGO" className={inputClass} disabled={aiLoading} required />
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-2">Contact Number</label>
              <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="9876543210" className={inputClass} disabled={aiLoading} required />
            </div>
          </div>

          {/* Things To Bring */}
          <div>
            <label className="block text-slate-800 font-semibold mb-2">Things To Bring (AI Auto-fillable)</label>
            <input 
              type="text" 
              name="thingsToBring" 
              value={formData.thingsToBring} 
              onChange={handleChange} 
              placeholder="Water Bottle, Cap, Sports Shoes" 
              className={inputClass} 
              disabled={aiLoading}
            />
          </div>

          {/* Event Description */}
          <div>
            <label className="block text-slate-800 font-semibold mb-2">Event Description (AI Auto-fillable)</label>
            <textarea 
              rows="5" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Describe your event or let AI draft it..." 
              className={inputClass} 
              disabled={aiLoading}
              required 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={aiLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform active:scale-[0.99]"
          >
            Deploy Live Event 🚀
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;