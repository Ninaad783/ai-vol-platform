function StatsCards({ events = [] }) {
  // 1. Calculate macro metrics dynamically from master array
  const totalEvents = events.length;

  const totalVolunteers = events.reduce(
    (sum, event) => sum + Number(event.volunteersNeeded || 0),
    0
  );

  // 2. Reduce the master events array into a clean key-value dictionary object
  // Example result: { "Environment": 2, "Education": 2, "Healthcare": 0 }
  const categoryCounts = events.reduce((acc, event) => {
    if (event.category) {
      // Normalize layout text spacing values
      const cat = event.category.trim();
      acc[cat] = (acc[cat] || 0) + 1;
    }
    return acc;
  }, {});

  // Convert the dictionary keys into a loopable array of objects
  const dynamicCategories = Object.keys(categoryCounts).map((key) => ({
    name: key,
    count: categoryCounts[key],
  }));

  // Helper mapping array to style border accents dynamically based on name entries
  const getBorderColor = (name) => {
    switch (name.toLowerCase()) {
      case "environment": return "border-emerald-500 text-emerald-600";
      case "education": return "border-blue-500 text-blue-600";
      case "healthcare": return "border-rose-500 text-rose-600";
      case "relief work": return "border-amber-500 text-amber-600";
      case "animal welfare": return "border-purple-500 text-purple-600";
      default: return "border-slate-400 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Core Macro Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* Total Active Events Monitor */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-b-4 border-green-600 hover:shadow-xl transition-all duration-300">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Events Directory</h3>
          <h1 className="text-5xl font-black text-green-600 mt-2">
            {totalEvents}
          </h1>
        </div>

        {/* Combined System Open Allocation Targets */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-b-4 border-blue-600 hover:shadow-xl transition-all duration-300">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Placement Vacancies Remaining</h3>
          <h1 className="text-5xl font-black text-blue-600 mt-2">
            {totalVolunteers}
          </h1>
        </div>

      </div>

      {/* Bottom Segment Section: Auto-Generated Live Distribution Array */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Live Active Operational Tracks</h3>
        
        {dynamicCategories.length === 0 ? (
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-400 font-medium">
            No categorization parameters found inside cloud query logs.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {dynamicCategories.map((cat) => (
              <div 
                key={cat.name} 
                className={`bg-white rounded-xl shadow-sm p-4 border-l-4 hover:shadow-md transition-all duration-300 ${getBorderColor(cat.name)}`}
              >
                <p className="text-xs font-bold text-slate-400 tracking-wide truncate">{cat.name} Drives</p>
                <p className="text-2xl font-black mt-1">{cat.count}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCards;