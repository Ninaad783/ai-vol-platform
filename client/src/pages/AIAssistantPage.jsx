import { useState, useRef, useEffect } from "react";
import axios from "axios";

function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I am VolunBot, your cognitive volunteer alignment helper. How can I assist you with volunteer matching or event coordinates today?", source: "system" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeEngine, setActiveEngine] = useState("Gemini 2.5 Flash");
  const chatEndRef = useRef(null);

  // Auto-scroll chat to the bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Append user message
    const userMsg = { role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/chat`, { message: query });
      
      // Check if backend responded from fallback or gemini
      if (res.data.source === "fallback") {
        setActiveEngine("Resilient Offline Core");
      } else {
        setActiveEngine("Gemini 2.5 Flash");
      }

      setMessages((prev) => [
        ...prev, 
        { role: "bot", text: res.data.reply, source: res.data.source || "gemini" }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { role: "bot", text: "My communications array is currently struggling to reach the cloud. Please verify your internet or local server configuration.", source: "error" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const quickPrompts = [
    { label: "🔍 Show Active Events", query: "Show me active volunteer events" },
    { label: "🌱 Environmental Drives", query: "Are there any clean up or environmental events?" },
    { label: "📚 Education Tutoring", query: "Tell me about teaching or school events" },
    { label: "👑 Admin Navigation Help", query: "How do I create a new volunteer event?" },
    { label: "🛠️ Skill Recommendation", query: "What events match skills like teaching or patient care?" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col font-sans">
      {/* Header Segment */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">AI Assistant</h1>
          <p className="text-slate-500 text-sm mt-1">Chat in real-time to find events, understand requirements, or draft descriptions.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${activeEngine === "Gemini 2.5 Flash" ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`} />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{activeEngine} Active</span>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid lg:grid-cols-4 gap-6 min-h-[500px]">
        
        {/* Left Suggestions Drawer Panel */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Quick Suggests</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any prompt to instantly query VolunBot.</p>
          </div>
          <div className="flex flex-col gap-3">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(prompt.query)}
                className="text-left w-full p-3 text-xs bg-slate-50 hover:bg-green-50 hover:text-green-700 rounded-xl border border-slate-100 hover:border-green-200 font-bold transition-all text-slate-600 active:scale-[0.98] cursor-pointer"
              >
                {prompt.label}
              </button>
            ))}
          </div>
          <div className="mt-auto bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">RAG Context Enabled</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">VolunBot reads live Mongo records to provide real-time details on schedules, locations, and open vacancy slots.</p>
          </div>
        </div>

        {/* Right Chat Thread Workspace Panel */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden h-[620px]">
          
          {/* Chat Bubble Thread Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-3.5 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-800 text-green-300'
                }`}>
                  {msg.role === 'user' ? 'U' : '🤖'}
                </div>

                {/* Message Body */}
                <div className="flex flex-col">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-green-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === 'bot' && msg.source && (
                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest px-1">
                      {msg.source === "fallback" ? "Offline Cache Matcher" : msg.source === "system" ? "Platform Core" : "Gemini Generative"}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3.5 mr-auto max-w-[80%] items-center">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-green-300 flex items-center justify-center font-bold text-sm shadow-sm animate-pulse">🤖</div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Area */}
          <form onSubmit={handleFormSubmit} className="p-4 border-t border-slate-200 bg-white flex gap-3">
            <input 
              className="flex-1 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-slate-50 focus:bg-white text-black placeholder:text-slate-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about events, required skills, or schedules..."
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
            >
              Send Response
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default AIAssistantPage;