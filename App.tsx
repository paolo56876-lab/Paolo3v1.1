
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Search, 
  Sparkles,
  Menu,
  X,
  Globe,
  Zap,
  Trash2,
  History,
  Plus,
  Rocket
} from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import ImageGenerator from './components/ImageGenerator';
import { Message, MessageRole, AppMode, Attachment, SearchSource, ChatSession } from './types';
import { sendMessageStream, generateImage, fileToBase64, analyzeVideo } from './services/geminiService';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('paolo3_v3_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
        setMessages(parsed[0].messages);
      } else {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('paolo3_v3_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: messages, title: messages.find(m => m.role === MessageRole.USER)?.text?.slice(0, 30) || s.title } 
          : s
      ));
    }
  }, [messages]);

  const createNewChat = () => {
    const newId = generateId();
    const welcomeMsg: Message = {
      id: 'w-' + newId,
      role: MessageRole.MODEL,
      text: "Paolo3 Ultra Fast activado. ¿Qué app quieres crear hoy? Estoy listo para responder en menos de un segundo.",
      timestamp: Date.now()
    };
    const newSession: ChatSession = { id: newId, title: 'Chat Relámpago', messages: [welcomeMsg], timestamp: Date.now() };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([welcomeMsg]);
    setMode(AppMode.CHAT);
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setMode(AppMode.CHAT);
    setIsSidebarOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      if (filtered.length > 0) loadSession(filtered[0]);
      else createNewChat();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }); // 'auto' para velocidad instantánea
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMsg: Message = { id: generateId(), role: MessageRole.USER, text: input, attachments: [...attachments], timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    const botMsgId = generateId();
    setMessages(prev => [...prev, { id: botMsgId, role: MessageRole.MODEL, text: '', timestamp: Date.now(), isThinking: true }]);

    try {
      await sendMessageStream(userMsg.text, messages, userMsg.attachments || [], useSearch, (chunk, sources) => {
        setMessages(prev => prev.map(m => m.id === botMsgId ? { 
          ...m, 
          text: m.text + chunk, 
          isThinking: false, 
          sources: sources ? [...(m.sources || []), ...sources] : m.sources 
        } : m));
      });
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "Error de conexión. Paolo3 sigue aquí, reintenta.", isThinking: false } : m));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden">
      {/* Sidebar Ultra Thin */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/5 transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="text-cyan-400" size={20} />
            <span className="font-black text-sm tracking-tighter">PAOLO3 ULTRA</span>
          </div>
          <button onClick={createNewChat} className="p-2 hover:bg-slate-800 rounded-lg text-cyan-400"><Plus size={18}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(s => (
            <div key={s.id} onClick={() => loadSession(s)} className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${currentSessionId === s.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800 text-slate-500'}`}>
              <span className="text-xs font-medium truncate">{s.title}</span>
              <button onClick={(e) => deleteSession(s.id, e)} className="opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col md:ml-64 relative bg-[#020617]">
        <header className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-black/20 backdrop-blur-xl">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden"><Menu/></button>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
            Motor: Flash-X1
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {mode === AppMode.IMAGE_GEN ? <ImageGenerator onGenerate={generateImage} /> : messages.map(m => <ChatMessage key={m.id} message={m} />)}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {mode !== AppMode.IMAGE_GEN && (
          <div className="p-4 bg-gradient-to-t from-[#020617] via-[#020617]">
            <div className="max-w-3xl mx-auto bg-slate-900/50 border border-white/10 rounded-2xl p-2 flex items-center gap-2">
              <button onClick={() => setUseSearch(!useSearch)} className={`p-2 rounded-lg ${useSearch ? 'bg-cyan-500 text-black' : 'text-slate-500'}`}><Globe size={18}/></button>
              <textarea 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder="Crea una app, escribe código o hablemos..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none h-10"
              />
              <button onClick={handleSendMessage} disabled={isLoading} className="p-2 bg-cyan-500 text-black rounded-xl hover:scale-105 active:scale-95 transition-all">
                {isLoading ? <Zap className="animate-spin" size={18}/> : <Send size={18}/>}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
