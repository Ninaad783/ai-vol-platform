function UpcomingEvents({ events = [], loading }) {
  
  // Handled loading state block directly to prevent rendering layout glitches
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 flex flex-col justify-center items-center h-64">
        <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin" />
        <p className="text-slate-500 font-medium text-sm mt-3">Syncing events directory...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 border border-slate-100 flex flex-col justify-between">
      
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Upcoming Events
          </h2>

          <button className="text-green-600 font-semibold text-sm hover:text-green-700 transition-colors">
            View All
          </button>
        </div>

        <div className="space-y-5">
          {events.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">
              No events currently mapped to the directory database.
            </p>
          ) : (
            // Slicing the master synced array directly down to peak display targets
            events.slice(0, 5).map((event) => (
              <div
                key={event._id}
                className="flex justify-between items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0 group"
              >
                <div>
                  <h3 className="font-bold text-slate-800 tracking-tight group-hover:text-green-600 transition-colors">
                    📅 {event.title}
                  </h3>

                  <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                    📍 {event.location} • <span className="text-slate-500 font-bold">{event.volunteersNeeded} Slots open</span>
                  </p>
                </div>

                <button className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95">
                  View
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default UpcomingEvents;