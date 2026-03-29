import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BookOpen, 
  Gamepad2, 
  Settings, 
  Moon, 
  Sun, 
  Trash2,
  Cpu,
  Zap,
  HelpCircle,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import { jack, Message, JackMode } from './lib/jackEngine';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<JackMode>('helper');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [userName, setUserName] = useState('User');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load state from local storage
  useEffect(() => {
    const savedMessages = localStorage.getItem('jack_messages');
    const savedMode = localStorage.getItem('jack_mode') as JackMode;
    const savedTheme = localStorage.getItem('jack_theme');
    const savedName = localStorage.getItem('jack_name');

    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedMode) {
      setMode(savedMode);
      jack.setMode(savedMode);
    }
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
    if (savedName) setUserName(savedName);

    // Initial greeting if no messages
    if (!savedMessages || JSON.parse(savedMessages).length === 0) {
      const greeting: Message = {
        id: '1',
        text: "Hello! I'm Jack, your offline AI assistant. How can I help you today?",
        sender: 'jack',
        timestamp: Date.now()
      };
      setMessages([greeting]);
    }
  }, []);

  // Save state to local storage
  useEffect(() => {
    localStorage.setItem('jack_messages', JSON.stringify(messages));
    localStorage.setItem('jack_mode', mode);
    localStorage.setItem('jack_theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('jack_name', userName);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [messages, mode, isDarkMode, userName]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const responseText = await jack.getResponse(textToSend, isEnhanced);
    
    const jackMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: 'jack',
      timestamp: Date.now(),
      isEnhanced: isEnhanced
    };

    setMessages(prev => [...prev, jackMsg]);
    setIsTyping(false);
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
      localStorage.removeItem('jack_messages');
    }
  };

  const changeMode = (newMode: JackMode) => {
    setMode(newMode);
    jack.setMode(newMode);
  };

  const suggestions = {
    helper: ["How does this work?", "Give me a productivity tip", "What's the date?"],
    study: ["Explain photosynthesis", "Solve 2x + 5 = 15", "Who was Napoleon?"],
    fun: ["Tell me a joke", "Tell me a story", "I'm bored"]
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="glass-panel sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-lg shadow-neon-blue/20">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight dark:text-white flex items-center gap-2">
              JACK <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-blue/20 text-neon-blue border border-neon-blue/30">OFFLINE</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">Local Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEnhanced(!isEnhanced)}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${
              isEnhanced 
                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
            title={isEnhanced ? "Enhanced Mode Active (Online)" : "Enable Enhanced Mode (Online)"}
          >
            <Zap className={`w-4 h-4 ${isEnhanced ? 'fill-neon-purple' : ''}`} />
            <span className="hidden sm:inline">{isEnhanced ? 'ENHANCED' : 'LOCAL'}</span>
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={clearChat}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6 gap-6 overflow-hidden">
        
        {/* Mode Selector */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl self-center shadow-inner">
          <button 
            onClick={() => changeMode('helper')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'helper' 
                ? 'bg-white dark:bg-dark-card text-neon-blue shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Helper
          </button>
          <button 
            onClick={() => changeMode('study')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'study' 
                ? 'bg-white dark:bg-dark-card text-neon-purple shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Study
          </button>
          <button 
            onClick={() => changeMode('fun')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'fun' 
                ? 'bg-white dark:bg-dark-card text-neon-pink shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Fun
          </button>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pr-2 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md ${
                    msg.sender === 'user' 
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' 
                      : 'bg-gradient-to-br from-neon-blue to-neon-purple text-white'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  
                  <div className={`relative p-4 rounded-2xl shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-neon-blue text-white rounded-tr-none' 
                      : 'glass-panel rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className={`text-[10px] mt-2 opacity-50 flex items-center gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.isEnhanced && <Sparkles className="w-3 h-3 text-neon-purple" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple text-white flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="glass-panel p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-neon-purple" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-neon-pink" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Suggestions */}
        {!isTyping && (
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions[mode].map((s, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-neon-blue hover:text-neon-blue transition-colors bg-white/50 dark:bg-dark-card/50"
              >
                {s}
              </motion.button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
          <div className="relative glass-panel rounded-2xl p-2 flex items-center gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask Jack anything in ${mode} mode...`}
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-sm dark:text-white placeholder-slate-400"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={`p-3 rounded-xl transition-all ${
                input.trim() && !isTyping
                  ? 'bg-neon-blue text-white shadow-lg shadow-neon-blue/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="p-4 text-center">
        <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] font-bold">
          Jack AI System v1.0.0 • Secure Local Environment
        </p>
      </footer>
    </div>
  );
}
