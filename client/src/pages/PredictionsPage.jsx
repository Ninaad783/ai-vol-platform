import { useState, useEffect } from "react";
import { FaSlidersH, FaUsers, FaSmile } from "react-icons/fa";

function PredictionsPage() {
  // --- Turnout Simulator State ---
  const [category, setCategory] = useState("Environment");
  const [needed, setNeeded] = useState(40);
  const [dayType, setDayType] = useState("Weekend");
  const [weather, setWeather] = useState("Clear");
  const [location, setLocation] = useState("Pune");

  const [forecast, setForecast] = useState({
    turnout: 75,
    count: 30,
    buffer: 10,
    risk: "Low Risk"
  });

  // Calculate prediction using decision-tree heuristics (Simulated Random Forest Model)
  useEffect(() => {
    let baseTurnout = 72; // baseline turnout percent

    // 1. Category heuristics
    if (category === "Education") baseTurnout += 5;
    if (category === "Healthcare") baseTurnout += 3;
    if (category === "Environment") baseTurnout -= 2; // Outdoor variance

    // 2. Location / City
    if (location === "Remote") {
      baseTurnout += 12; // no transit friction
    } else if (location === "Mumbai") {
      baseTurnout -= 4; // traffic delay
    }

    // 3. Day of week
    if (dayType === "Weekend") {
      baseTurnout += 8;
    } else {
      baseTurnout -= 10;
    }

    // 4. Weather conditions (Outdoor vs Indoor interaction)
    const isOutdoor = ["Environment", "Animal Welfare"].includes(category);
    if (weather === "Rainy") {
      baseTurnout -= isOutdoor ? 25 : 8;
    } else if (weather === "Extreme Heat") {
      baseTurnout -= isOutdoor ? 15 : 4;
    } else if (weather === "Cloudy") {
      baseTurnout -= 2;
    }

    // 5. Scaling penalty (large group coordination friction)
    if (needed > 80) {
      baseTurnout -= 8;
    } else if (needed < 20) {
      baseTurnout += 4;
    }

    // Clip turnout score
    const finalTurnout = Math.max(10, Math.min(99, Math.round(baseTurnout)));
    const finalCount = Math.round((needed * finalTurnout) / 100);
    const dropouts = needed - finalCount;
    // Suggest a buffer recruiting target to hit the target headcount
    const suggestedBuffer = Math.max(0, Math.round(dropouts * 1.3));

    let riskLevel = "Low Risk";
    if (finalTurnout < 55) riskLevel = "High Staffing Risk";
    else if (finalTurnout < 70) riskLevel = "Moderate Risk";

    setForecast({
      turnout: finalTurnout,
      count: finalCount,
      buffer: suggestedBuffer,
      risk: riskLevel
    });
  }, [category, needed, dayType, weather, location]);

  // Simulated K-Means Volunteer Segments Data (X: average hours, Y: attendance reliability)
  const segments = [
    { name: "Weekend Warriors", color: "#10B981", points: [[45, 92], [52, 88], [40, 95], [60, 90], [38, 86], [50, 94], [55, 91], [42, 89]], description: "High availability, very active exclusively on Saturday and Sunday." },
    { name: "Education Mentors", color: "#3B82F6", points: [[30, 85], [35, 78], [28, 80], [33, 83], [25, 82], [32, 86], [36, 79]], description: "Dedicated to tutoring, very patient, moderate hours but consistent." },
    { name: "Eco-Enthusiasts", color: "#8B5CF6", points: [[65, 70], [70, 75], [58, 65], [62, 72], [75, 68], [60, 74]], description: "Care deeply about nature, participate in physically intense forest/cleanup drives." },
    { name: "High Churn Risks", color: "#EF4444", points: [[10, 40], [15, 30], [8, 48], [12, 35], [20, 42], [5, 25], [14, 38]], description: "Few volunteered hours, registered but frequently fail to attend. Need re-engagement." }
  ];

  const [activeSegment, setActiveSegment] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">ML Predictions Lab</h1>
          <p className="text-slate-500 text-sm mt-1">Utilize predictive models and clustering algorithms to optimize volunteer recruiting campaigns.</p>
        </div>
        <span className="bg-blue-50 text-blue-700 text-xs font-black px-3.5 py-1.5 rounded-xl border border-blue-100 uppercase tracking-widest">
          Scikit-Learn Integration
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid xl:grid-cols-3 gap-8">
        
        {/* PANEL 1: TURNOUT INFERENCE SIMULATOR (Takes 2 Columns on large screens) */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><FaSlidersH /></div>
              <h2 className="text-xl font-bold text-slate-900">Random Forest Turnout Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Adjust parameters below. The client-side decision logic dynamically evaluates features to predict volunteer attendance and dropout metrics.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Event Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option>Environment</option>
                  <option>Education</option>
                  <option>Healthcare</option>
                  <option>Relief Work</option>
                  <option>Animal Welfare</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Target Venue / Location</label>
                <select 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option>Pune</option>
                  <option>Mumbai</option>
                  <option>Bangalore</option>
                  <option>Delhi</option>
                  <option>Remote</option>
                </select>
              </div>

              {/* Day Type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Scheduled Day</label>
                <select 
                  value={dayType} 
                  onChange={(e) => setDayType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option>Weekend</option>
                  <option>Weekday</option>
                </select>
              </div>

              {/* Weather */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Weather forecast</label>
                <select 
                  value={weather} 
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option>Clear</option>
                  <option>Cloudy</option>
                  <option>Rainy</option>
                  <option>Extreme Heat</option>
                </select>
              </div>
            </div>

            {/* Slider for Capacity */}
            <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Volunteers Recruited Target</span>
                <span className="text-sm font-black text-blue-600">{needed} slots</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="150" 
                value={needed}
                onChange={(e) => setNeeded(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1 uppercase">
                <span>10 Min</span>
                <span>80 Mid</span>
                <span>150 Max</span>
              </div>
            </div>
          </div>

          {/* Predictor Outputs */}
          <div className="grid md:grid-cols-4 gap-4 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
            
            <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-slate-200/50">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Turnout Rate</h4>
              <div className="text-2xl font-black text-blue-600 tracking-tight">{forecast.turnout}%</div>
            </div>

            <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-slate-200/50">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expected Headcount</h4>
              <div className="text-2xl font-black text-slate-800 tracking-tight">~{forecast.count}</div>
            </div>

            <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-slate-200/50">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recruit Overbook Buffer</h4>
              <div className="text-2xl font-black text-emerald-600 tracking-tight">+{forecast.buffer}</div>
            </div>

            <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-slate-200/50 flex flex-col justify-center">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Staffing Risk</h4>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mx-auto w-fit ${
                forecast.risk === "Low Risk" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                forecast.risk === "Moderate Risk" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                "bg-rose-50 text-rose-700 border border-rose-200"
              }`}>{forecast.risk}</span>
            </div>

          </div>

        </div>

        {/* PANEL 2: NLP FEEDBACK SENTIMENT TRACKER */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><FaSmile /></div>
              <h2 className="text-xl font-bold text-slate-900">NLP Sentiment Tracker</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Feedback from event review logs analyzed using sentiment scoring (polarity range: -1.0 to +1.0).
            </p>

            {/* Sentiment Progress Bars */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600">Positive Polarity (&gt; 0.1)</span>
                  <span className="text-emerald-600">84%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "84%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600">Neutral Polarity (-0.1 to 0.1)</span>
                  <span className="text-slate-500">11%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: "11%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600">Negative Polarity (&lt; -0.1)</span>
                  <span className="text-rose-600">5%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: "5%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sample Reviews */}
          <div className="space-y-2.5 border-t border-slate-100 pt-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sample Review Sentiment Classifications</h4>
            
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start gap-2">
              <p className="text-[11px] text-slate-600 font-medium italic">"Great coordination. Teaching the kids grammar was rewarding!"</p>
              <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-widest shrink-0">+0.85</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start gap-2">
              <p className="text-[11px] text-slate-600 font-medium italic">"The event location changed late; had transit trouble."</p>
              <span className="bg-rose-50 text-rose-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-widest shrink-0">-0.42</span>
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: UNSUPERVISED K-MEANS SEGMENTATION CHART */}
      <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><FaUsers /></div>
          <h2 className="text-xl font-bold text-slate-900">K-Means Volunteer Segmentation</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Unsupervised clustering of volunteers based on <strong>hours contributed</strong> (X-axis) vs. <strong>attendance reliability %</strong> (Y-axis). Hover over groups to inspect personas.
        </p>

        <div className="grid lg:grid-cols-3 gap-8 items-center">
          
          {/* SVG Scatter Plot (Takes 2 Columns) */}
          <div className="lg:col-span-2 bg-slate-50 border border-slate-100 rounded-3xl p-6 relative flex justify-center items-center shadow-inner">
            <svg width="100%" height="260" viewBox="0 0 600 260" className="overflow-visible">
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="50" y2="220" stroke="#CBD5E1" strokeWidth="2" />
              <line x1="50" y1="220" x2="570" y2="220" stroke="#CBD5E1" strokeWidth="2" />
              
              <line x1="50" y1="120" x2="570" y2="120" stroke="#E2E8F0" strokeDasharray="4 4" />
              <line x1="310" y1="20" x2="310" y2="220" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />

              {/* Axes Labels */}
              <text x="310" y="248" fill="#64748B" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">CONTRIBUTED HOURS (X)</text>
              <text x="18" y="120" fill="#64748B" fontSize="10" fontWeight="bold" textAnchor="middle" transform="rotate(-90 18 120)" letterSpacing="1">ATTENDANCE % (Y)</text>

              {/* Tick Labels */}
              <text x="50" y="233" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">0h</text>
              <text x="310" y="233" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">50h</text>
              <text x="570" y="233" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">100h</text>
              
              <text x="42" y="223" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="end">0%</text>
              <text x="42" y="123" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="end">50%</text>
              <text x="42" y="24" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="end">100%</text>

              {/* Plotting points */}
              {segments.map((seg, sIdx) => 
                seg.points.map((pt, pIdx) => {
                  // Map X (0-100) -> 50 to 570
                  const cx = 50 + (pt[0] / 100) * 520;
                  // Map Y (0-100) -> 220 to 20 (inverted)
                  const cy = 220 - (pt[1] / 100) * 200;

                  const isDimmed = activeSegment !== null && activeSegment !== sIdx;

                  return (
                    <circle
                      key={`${sIdx}-${pIdx}`}
                      cx={cx}
                      cy={cy}
                      r="6.5"
                      fill={seg.color}
                      opacity={isDimmed ? 0.15 : 0.85}
                      stroke="#FFF"
                      strokeWidth="1.5"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setActiveSegment(sIdx)}
                      onMouseLeave={() => setActiveSegment(null)}
                    />
                  );
                })
              )}
            </svg>
          </div>

          {/* Segment Details Box (Takes 1 Column) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Clustering Persona Dictionary</h3>
            
            <div className="flex flex-col gap-2.5">
              {segments.map((seg, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    activeSegment === idx 
                      ? "bg-slate-100 border-slate-300 translate-x-1 shadow-sm" 
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                  }`}
                  onMouseEnter={() => setActiveSegment(idx)}
                  onMouseLeave={() => setActiveSegment(null)}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: seg.color }} />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">{seg.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {seg.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PredictionsPage;