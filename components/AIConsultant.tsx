
import React, { useState, useRef, useEffect } from 'react';
import { generateProjectConsultation } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIConsultant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your LightDzyns AI Consultant. Tell me about a digital project you're dreaming of, and I'll help you sketch out a professional roadmap!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const response = await generateProjectConsultation(userMessage);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <section id="ai-consultant" className="py-24 bg-blue-600 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-blue-100 font-bold tracking-wider uppercase text-sm">AI Innovation</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white">
            Meet Your Project Planner
          </h3>
          <p className="text-blue-100 text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
            Not sure where to start? Describe your idea to our <span className="font-bold">LightDzyns</span> AI assistant and get an instant professional roadmap.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/40 overflow-hidden flex flex-col h-[650px] border border-white/20">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-gray-50 scroll-smooth"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="text-sm md:text-base whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 bg-white border-t border-gray-100 flex gap-4">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your project idea..."
              className="flex-1 bg-gray-100 border-none rounded-2xl px-6 py-4 text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center active:scale-95"
            >
              <i className="fa-solid fa-paper-plane text-lg"></i>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AIConsultant;
