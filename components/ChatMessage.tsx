
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole } from '../types';
// Added Globe to the imports
import { Bot, User, FileImage, Link as LinkIcon, Download, Terminal, Copy, Check, Globe } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[92%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        
        {/* Avatar with Glow */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
          isUser 
            ? 'bg-slate-800 border border-slate-700 text-slate-400' 
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
        }`}>
          {isUser ? <User size={20} /> : <Terminal size={20} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-6 py-5 rounded-2xl shadow-xl transition-all border ${
            isUser 
              ? 'bg-slate-900 border-slate-800 text-slate-200 rounded-tr-none' 
              : 'bg-slate-900/50 backdrop-blur-md border-slate-800/50 text-slate-100 rounded-tl-none'
          }`}>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {message.attachments.map((att, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700">
                    {att.mimeType.startsWith('image/') ? (
                      <img src={`data:${att.mimeType};base64,${att.data}`} className="max-w-sm max-h-80 object-cover" />
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-slate-800">
                        <FileImage size={24} className="text-indigo-400" />
                        <span className="text-sm font-medium">{att.name || 'Video Analizado'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Markdown Text / Code */}
            <div className="prose prose-invert prose-slate max-w-none leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-code:text-indigo-400">
              {message.isThinking ? (
                <div className="flex items-center gap-3 py-1">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Paolo3 Procesando...</span>
                </div>
              ) : (
                <ReactMarkdown
                  components={{
                    pre: ({node, ...props}) => (
                      <div className="relative group my-4">
                        <pre {...props} className="p-4 rounded-xl font-mono text-sm overflow-x-auto border border-slate-800 bg-slate-950/80" />
                        <button 
                          onClick={() => handleCopy(String(props.children))}
                          className="absolute top-3 right-3 p-2 bg-slate-800/80 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-700 hover:text-white"
                        >
                          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    )
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              )}
            </div>

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-1.5">
                  <Globe size={12} /> Referencias Bibliográficas
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      className="text-xs bg-slate-950 border border-slate-800 text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all truncate max-w-[220px]"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-600 mt-2 font-medium tracking-wide">
             {isUser ? 'CONSULTA USUARIO' : `PAOLO3 AI v2.0 • ${new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
