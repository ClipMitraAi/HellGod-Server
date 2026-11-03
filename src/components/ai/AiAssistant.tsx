/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Key, 
  Terminal, 
  Copy, 
  Check, 
  Trash2, 
  Cpu, 
  Server, 
  ShieldAlert,
  HelpCircle,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Analyze live server status & recommend performance tuning',
  'Generate secure Nginx reverse proxy SSL configuration',
  'Explain Android APK build & automated GitHub Actions workflow',
  'How to run HELLGOD zero-budget server locally on Android Termux?',
  'Check SQLite WAL mode & recommend backup strategy',
  'Inspect security audit trail for unauthorized intrusion attempts'
];

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `[HELLGOD AI CORE v1.0.0 // ONLINE]
Cyberpunk DevOps & Server Intelligence Matrix initialized.
All operational modules linked:
• Microservices Telemetry
• Sandboxed File Manager
• Database & WAL-mode SQLite
• Android APK Compiler & Gradle Pipeline
• Zero-Budget Termux / Free Cloud Deployment

Select a quick diagnostic prompt below or input your server command / DevOps inquiry.`,
      provider: 'HELLGOD Autonomous Core',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customKey, setCustomKey] = useState<string>(() => localStorage.getItem('hellgod_user_gemini_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('hellgod_user_gemini_key', customKey.trim());
    setShowKeyModal(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.content
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          customApiKey: customKey.trim() || undefined,
          chatHistory: historyPayload
        })
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || '[HELLGOD] Response generated.',
        provider: data.provider || 'HELLGOD Engine',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: `[HELLGOD ERROR] Neural uplink failed: ${err.message || 'Connection lost'}. Check server connection.`,
          provider: 'Local Error Handler',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: '[HELLGOD AI CORE] Neural buffer purged. Ready for new operational queries.',
        provider: 'HELLGOD Autonomous Core',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar for AI */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide flex items-center gap-2">
              <span>HELLGOD AI ASSISTANT</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-red-950 text-red-400 border border-red-600/30 rounded">
                NEURAL CORE
              </span>
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Autonomous Server Troubleshooting &bull; Gemini 2.5 Flash + Local Rule Engine Fallback
            </p>
          </div>
        </div>

        {/* Config / Key / Clear controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyModal(true)}
            className={`px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 border transition-all ${
              customKey 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40' 
                : 'bg-[#14141e] text-slate-300 border-slate-700 hover:border-red-500'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-red-400" />
            <span>{customKey ? 'KEY CONFIGURED' : 'CUSTOM GEMINI KEY'}</span>
          </button>

          <button
            onClick={clearHistory}
            className="p-1.5 rounded text-slate-400 hover:text-red-400 bg-[#14141e] border border-slate-800 hover:border-red-600/40"
            title="Clear Chat History"
            aria-label="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap flex items-center gap-1">
          <Zap className="w-3 h-3 text-red-500" />
          PROMPTS:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            disabled={isLoading}
            className="text-xs font-mono px-2.5 py-1 rounded bg-[#101018] border border-slate-800 hover:border-red-600/50 text-slate-300 hover:text-white whitespace-nowrap transition-all"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="cyber-panel rounded-lg p-4 h-[500px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono text-slate-400">
                <span>{isUser ? 'ROOT_ADMIN' : (msg.provider || 'HELLGOD AI')}</span>
                <span>&bull;</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-lg p-3.5 text-xs sm:text-sm font-mono leading-relaxed relative group ${
                  isUser
                    ? 'bg-red-950/70 border border-red-600/40 text-white'
                    : 'bg-[#101017] border border-slate-800 text-slate-200'
                }`}
              >
                <pre className="whitespace-pre-wrap font-mono break-words">
                  {msg.content}
                </pre>

                {/* Copy button for code/text */}
                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="absolute top-2 right-2 p-1 rounded bg-black/50 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy response"
                    aria-label="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-xs font-mono text-red-400 bg-[#12121c] rounded border border-red-600/30 w-fit animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin text-red-500" />
            <span>[HELLGOD NEURAL LINK] Synthesizing diagnostic response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-[#0c0c12] p-2 rounded-lg border border-red-600/30 focus-within:border-red-500 transition-all shadow-[0_0_15px_rgba(255,0,60,0.1)]"
      >
        <span className="text-red-500 font-mono pl-2 text-sm">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask HELLGOD AI about server logs, Nginx config, APK build, SQLite, Termux..."
          disabled={isLoading}
          className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,60,0.4)] transition-all"
        >
          <span>SEND</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Modal for User-Provided API Key (Zero Budget & No Hardcoded Secrets) */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="cyber-panel rounded-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-red-600/30 pb-2">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-red-500" />
                <span>AI PROVIDER CONFIGURATION</span>
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              HELLGOD is 100% Zero-Budget:
              <br />
              • If no key is entered, HELLGOD automatically runs on the autonomous **Local Rule-Based Diagnostics Engine** ($0.00).
              <br />
              • You can optionally provide a free Google Gemini API key to activate Gemini 2.5 Flash cloud intelligence.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  OPTIONAL GEMINI API KEY (Stored in browser session only):
                </label>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#12121a] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomKey('');
                    localStorage.removeItem('hellgod_user_gemini_key');
                    setShowKeyModal(false);
                  }}
                  className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 text-slate-300 hover:text-white"
                >
                  USE LOCAL ENGINE
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded text-xs font-mono bg-red-600 text-white font-semibold hover:bg-red-500"
                >
                  SAVE KEY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
