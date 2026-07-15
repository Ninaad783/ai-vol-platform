import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPaperPlane, FaRobot } from "react-icons/fa";

function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm VolunBot. Ask me about active events or requirements." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/chat`, { message: query });
      setMessages((prev) => [...prev, { role: "bot", text: res.data.reply }]);
    } catch (err) {
      console.error("Dashboard AI assistant communication failure:", err);
      setMessages((prev) => [
        ...prev, 
        { role: "bot", text: "I'm having trouble connecting right now. Please verify server status." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const chips = [
    { label: "🌱 Cleanups", query: "Show me environmental events" },
    { label: "📚 Teaching", query: "Tell me about education events" }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-md border border-slate-100 h-[400px] flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
      
      {/* 🚀 Premium Styled Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30 shadow-inner">
            <FaRobot className="text-sm" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wide uppercase">VolunBot Assistant</h2>
            <p className="text-[10px] text-green-400 font-semibold tracking-wide flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
              RAG Analytics Online
            </p>
          </div>
        </div>
      </div>
      
      {/* 💬 Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-sm font-medium ${
              m.role === 'user' 
                ? 'bg-green-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 💡 Quick Action Chips */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 py-1.5 bg-slate-50 flex gap-2 border-t border-slate-100 shrink-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide self-center mr-1">Ask:</span>
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(chip.query)}
              className="px-2.5 py-1 text-[10px] font-black bg-white hover:bg-green-50 text-slate-600 hover:text-green-700 rounded-lg border border-slate-200 hover:border-green-300 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* ✍️ Form Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center shrink-0">
        <input 
          className="flex-1 border border-slate-200 focus:border-green-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 bg-slate-50/50 text-black placeholder:text-slate-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Pune drives, required skills..."
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:bg-slate-200 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <FaPaperPlane className="text-[10px]" />
        </button>
      </form>
    </div>
  );
}

export default AIAssistant;