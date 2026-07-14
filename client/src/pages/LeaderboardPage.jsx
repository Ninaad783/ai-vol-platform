import { FaTrophy, FaMedal, FaCrown, FaCheckCircle, FaLock } from "react-icons/fa";

function LeaderboardPage() {
  const topThree = [
    {
      rank: 1,
      name: "Avdhoot Patil",
      hours: 120,
      avatar: "👨‍💻",
      title: "Eco Guardian",
      color: "border-amber-400 bg-amber-50/50 text-amber-600",
      height: "h-48",
      crown: true
    },
    {
      rank: 2,
      name: "Snehal Shinde",
      hours: 95,
      avatar: "👩‍🏫",
      title: "Literacy Hero",
      color: "border-slate-300 bg-slate-50/50 text-slate-500",
      height: "h-40",
      crown: false
    },
    {
      rank: 3,
      name: "Rahul Mane",
      hours: 70,
      avatar: "👨‍⚕️",
      title: "Health Angel",
      color: "border-amber-600 bg-amber-50/30 text-amber-700",
      height: "h-32",
      crown: false
    }
  ];

  // Helper generator to populate exactly 100 volunteers for rankings
  const generateRunnersUp = () => {
    const firstNames = ["Amit", "Rohan", "Snehal", "Aditi", "Rahul", "Priya", "Vikram", "Neha", "Abhishek", "Tanvi", "Siddharth", "Anjali", "Karan", "Pooja", "Yash", "Ritu", "Sameer", "Divya", "Vivek", "Kriti", "Raj", "Deepika", "Sunil", "Aishwarya", "Sachin", "Kiran", "Sanjay", "Meera", "Ajay", "Shalini"];
    const lastNames = ["Patil", "Shinde", "Mane", "Kadam", "Pawar", "Gokhale", "Sen", "Sathe", "Joshi", "Deshmukh", "Kulkarni", "Deshpande", "More", "Bhosale", "Naik", "Rao", "Jadhav", "Tambe", "Mehta", "Sharma", "Verma", "Gupta", "Malhotra", "Kapoor", "Singhal", "Patel", "Shah", "Reddy", "Nair", "Iyer"];
    const categories = ["Education", "Environment", "Healthcare", "Relief Work", "Animal Welfare"];
    const badges = ["Bookworm", "Green Thumb", "First Responder", "Caregiver", "Pet Protector", "Local Hero", "Community Star", "Youth Icon", "Service Champion", "Kind Heart"];
    
    const list = [];
    let currentHours = 68; // Start just below Bronze medalist's hours (70)

    for (let i = 4; i <= 103; i++) {
      // Deterministically select combinations using index math
      const fIdx = (i * 3) % firstNames.length;
      const lIdx = (i * 7) % lastNames.length;
      const cIdx = (i * 11) % categories.length;
      const bIdx = (i * 13) % badges.length;
      
      // Gradually decrease hours so ranks look sequential
      currentHours = Math.max(2, currentHours - (i % 2 === 0 ? 1 : 0));
      
      list.push({
        rank: i,
        name: `${firstNames[fIdx]} ${lastNames[lIdx]}`,
        category: categories[cIdx],
        hours: currentHours,
        badge: badges[bIdx]
      });
    }
    return list;
  };

  const runnersUp = generateRunnersUp();

  const badges = [
    {
      id: 1,
      name: "Eco-Guardian",
      desc: "Completed 3 environmental cleanup drives.",
      unlocked: true,
      icon: "🌱",
      progress: "3/3"
    },
    {
      id: 2,
      name: "Literacy Hero",
      desc: "Completed 3 educational tutoring sessions.",
      unlocked: true,
      icon: "📚",
      progress: "3/3"
    },
    {
      id: 3,
      name: "Health Shield",
      desc: "Volunteered at 3 medical health camps.",
      unlocked: true,
      icon: "🩺",
      progress: "3/3"
    },
    {
      id: 4,
      name: "Disaster Relief Pro",
      desc: "Assist in 2 emergency distribution drives.",
      unlocked: false,
      icon: "📦",
      progress: "1/2"
    },
    {
      id: 5,
      name: "Community Champion",
      desc: "Achieved 100+ total volunteer hours.",
      unlocked: true,
      icon: "👑",
      progress: "120h/100h"
    }
  ];

  return (
    <div className="p-6 overflow-x-hidden w-full space-y-8 bg-slate-50 min-h-screen">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <FaTrophy className="text-amber-500 animate-bounce" />
          Volunteer Hall of Fame
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Honoring community leaders, tracking hours contributed, and unlocking achievement milestones.
        </p>
      </div>

      {/* Podium Display of Top 3 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-10">Top Placings This Season</h3>
        
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-2xl mx-auto">
          {/* Silver Medalist */}
          <div className="flex flex-col items-center flex-1 w-full order-2 md:order-1">
            <span className="text-3xl mb-1">{topThree[1].avatar}</span>
            <span className="font-bold text-slate-800 text-sm">{topThree[1].name}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{topThree[1].title}</span>
            
            <div className={`w-full mt-3 rounded-t-2xl border-t-4 flex flex-col justify-end items-center p-4 transition-all duration-500 ${topThree[1].height} ${topThree[1].color} shadow-md`}>
              <span className="text-sm font-black text-slate-500">2nd Place</span>
              <span className="text-2xl font-black text-slate-800 mt-1">{topThree[1].hours}h</span>
            </div>
          </div>

          {/* Gold Medalist */}
          <div className="flex flex-col items-center flex-1 w-full order-1 md:order-2">
            <FaCrown className="text-amber-400 text-2xl animate-pulse mb-1" />
            <span className="text-4xl mb-1">{topThree[0].avatar}</span>
            <span className="font-extrabold text-slate-950 text-sm">{topThree[0].name}</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">{topThree[0].title}</span>
            
            <div className={`w-full mt-3 rounded-t-2xl border-t-4 flex flex-col justify-end items-center p-4 transition-all duration-500 ${topThree[0].height} ${topThree[0].color} shadow-lg relative`}>
              <div className="absolute top-4 text-xs font-black text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-full border border-amber-200">Season MVP</div>
              <span className="text-sm font-black text-amber-600">1st Place</span>
              <span className="text-3xl font-black text-amber-950 mt-1">{topThree[0].hours}h</span>
            </div>
          </div>

          {/* Bronze Medalist */}
          <div className="flex flex-col items-center flex-1 w-full order-3">
            <span className="text-3xl mb-1">{topThree[2].avatar}</span>
            <span className="font-bold text-slate-800 text-sm">{topThree[2].name}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{topThree[2].title}</span>
            
            <div className={`w-full mt-3 rounded-t-2xl border-t-4 flex flex-col justify-end items-center p-4 transition-all duration-500 ${topThree[2].height} ${topThree[2].color} shadow-md`}>
              <span className="text-sm font-black text-amber-700">3rd Place</span>
              <span className="text-2xl font-black text-slate-800 mt-1">{topThree[2].hours}h</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Scrollable Leaderboard Table (Ranks 4-103) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FaMedal className="text-slate-400" />
                Roster Rankings (Top 100)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-wider">
                {runnersUp.length + 3} Total Ranked
              </span>
            </div>

            {/* Scrollable Container with max-height constraint */}
            <div className="overflow-y-auto max-h-96 pr-2 border border-slate-100 rounded-2xl shadow-inner bg-slate-50/20 p-2">
              <table className="table w-full text-xs">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="text-slate-400 font-extrabold border-b border-slate-200 text-left bg-white">
                    <th className="py-3 pl-3">Rank</th>
                    <th>Volunteer Name</th>
                    <th>Focus Path</th>
                    <th>Hours Logged</th>
                    <th className="pr-3">Achievement Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {runnersUp.map((v) => (
                    <tr key={v.rank} className="hover:bg-white transition-colors bg-white/40">
                      <td className="py-3 pl-3 font-bold text-slate-500">#{v.rank}</td>
                      <td className="font-bold text-slate-800">{v.name}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-[10px]">
                          {v.category}
                        </span>
                      </td>
                      <td className="font-bold text-slate-900">{v.hours} hrs</td>
                      <td className="text-emerald-600 font-bold pr-3">{v.badge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 border-t border-slate-100 pt-3">
            Rankings synchronized dynamically with logged certificate hours
          </div>
        </div>

        {/* Gamification Milestone Badges Gallery */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>🌟</span>
              Cognitive Milestones & Badges
            </h2>

            <div className="space-y-3.5">
              {badges.map((badge) => (
                <div 
                  key={badge.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-4 transition-all shadow-sm ${
                    badge.unlocked 
                      ? "bg-emerald-50/30 border-emerald-100" 
                      : "bg-slate-50/50 border-slate-100 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl p-2 bg-white rounded-xl shadow-inner shrink-0">{badge.icon}</span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-xs truncate flex items-center gap-1.5">
                        {badge.name}
                        {badge.unlocked ? (
                          <FaCheckCircle className="text-emerald-500 text-[10px]" />
                        ) : (
                          <FaLock className="text-slate-400 text-[9px]" />
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{badge.desc}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider ${
                      badge.unlocked 
                        ? "bg-emerald-100/50 text-emerald-700 border-emerald-200" 
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                      {badge.progress}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 border-t border-slate-100 pt-3">
            Milestones reset every calendar quarter
          </div>
        </div>
      </div>

    </div>
  );
}

export default LeaderboardPage;
