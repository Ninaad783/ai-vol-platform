import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    description: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 4000);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all";

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events/${id}`)
      .then((res) => {
        const formattedDate = res.data.eventDate ? res.data.eventDate.split("T")[0] : "";
        setFormData({
          title: res.data.title || "",
          location: res.data.location || "",
          address: res.data.address || "",
          category: res.data.category || "",
          volunteersNeeded: res.data.volunteersNeeded || "",
          eventDate: formattedDate,
          startTime: res.data.startTime || "",
          endTime: res.data.endTime || "",
          organizerName: res.data.organizerName || "",
          contactNumber: res.data.contactNumber || "",
          thingsToBring: res.data.thingsToBring || "",
          description: res.data.description || "",
        });
      })
      .catch((err) => console.log(err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events/${id}`, formData);
      showNotification("Event Updated Successfully! ✏️", "success");
      setTimeout(() => navigate("/events"), 1500);
    } catch (error) {
      console.log(error);
      showNotification("Failed to update event.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 flex justify-center items-center p-8 relative">
      
      {/* Slick Notification */}
      <div className={`fixed bottom-5 right-5 z-50 transform transition-all duration-500 ease-out flex items-center p-4 rounded-2xl shadow-2xl border ${
        toast.show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      } bg-white border-green-500 text-slate-900`}>
        <div className="w-2 h-2 rounded-full mr-3 animate-pulse bg-green-500" />
        <span className="font-semibold text-sm">{toast.message}</span>
      </div>

      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-4xl font-bold text-slate-900">Edit Event ✏️</h1>
          <button onClick={() => navigate("/events")} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2 rounded-xl font-semibold transition-all">
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-800 font-semibold mb-2">Event Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-800 font-semibold mb-2">City</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-slate-800 font-semibold mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                <option>Environment</option>
                <option>Education</option>
                <option>Healthcare</option>
                <option>Relief Work</option>
                <option>Animal Welfare</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-2">Exact Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-slate-800 font-semibold mb-2">Event Date</label>
              <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-slate-800 font-semibold mb-2">Start Time</label>
              <input type="text" name="startTime" value={formData.startTime} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-slate-800 font-semibold mb-2">End Time</label>
              <input type="text" name="endTime" value={formData.endTime} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-semibold mb-2">Volunteers Needed</label>
            <input type="number" name="volunteersNeeded" value={formData.volunteersNeeded} onChange={handleChange} className={inputClass} />
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300">
            Save Structural Changes 🚀
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;