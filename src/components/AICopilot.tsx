import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiFetch } from "../api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  source?: string;
  at: string;
};

type CopilotContext = {
  courseTitle?: string;
  chapterTitle?: string;
  chapterBody?: string;
};

const QUICK_PROMPTS = [
  "Explain this chapter in 3 bullet points",
  "Give me a code example for this concept",
  "What are the best practices here?",
  "Quiz me on this topic",
  "What should I learn next after this?",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Simple markdown renderer (bold, code blocks, inline code, bullets, headings)
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={uid()} className="my-3 overflow-hidden rounded-xl border border-white/10">
          {lang && (
            <div className="flex items-center gap-2 border-b border-white/10 bg-slate-800/80 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-mono text-slate-400">{lang}</span>
            </div>
          )}
          <pre className="overflow-x-auto bg-slate-900 p-4 text-xs font-mono leading-6 text-emerald-200">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Heading H2
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={uid()} className="mt-4 mb-2 text-base font-bold text-cyan-300">
          {line.slice(3)}
        </h3>
      );
      i++;
      continue;
    }

    // Heading H3
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={uid()} className="mt-3 mb-1 text-sm font-semibold text-slate-200">
          {line.slice(4)}
        </h4>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <div key={uid()} className="my-2 rounded-lg border-l-2 border-amber-400 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">
          {renderInline(line.slice(2))}
        </div>
      );
      i++;
      continue;
    }

    // Table
    if (line.includes("|") && lines[i + 1]?.includes("---")) {
      const headers = line.split("|").map(c => c.trim()).filter(Boolean);
      i += 2; // skip separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map(c => c.trim()).filter(Boolean));
        i++;
      }
      elements.push(
        <div key={uid()} className="my-3 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-xs">
            <thead className="bg-slate-800">
              <tr>{headers.map((h, j) => <th key={j} className="px-3 py-2 text-left font-semibold text-slate-300">{renderInline(h)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-slate-900/60" : "bg-slate-900/30"}>
                  {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-slate-300">{renderInline(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Bullet list
    if (line.match(/^[-*]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={uid()} className="my-2 space-y-1 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      let num = 1;
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
        num++;
      }
      elements.push(
        <ol key={uid()} className="my-2 space-y-1 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm text-slate-300">
              <span className="shrink-0 font-mono text-cyan-400 text-xs mt-0.5">{j + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={uid()} className="h-2" />);
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={uid()} className="text-sm leading-7 text-slate-300">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // inline code, bold, italic
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic text-slate-200">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function AICopilot({ context, isOpen, onToggle }: {
  context?: CopilotContext;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<"unknown" | "online" | "offline">("unknown");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: msg,
      at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          context,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeminiStatus(data.source === "gemini" ? "online" : "offline");
        setMessages(prev => [...prev, {
          id: uid(),
          role: "assistant",
          content: data.reply,
          model: data.model,
          source: data.source,
          at: new Date().toISOString(),
        }]);
      } else {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gemini API error");
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: uid(),
        role: "assistant",
        content: err instanceof Error ? err.message : "Connection error. Please check that the Nalanda backend is running on port 8080 and GEMINI_API_KEY is configured.",
        at: new Date().toISOString(),
      }]);
      setGeminiStatus("offline");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => setMessages([]);

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 shadow-2xl shadow-violet-500/40 ring-2 ring-white/10"
        title="Nalanda AI Copilot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="text-xl text-white">✕</motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="text-xl">🤖</motion.span>
          )}
        </AnimatePresence>
        {geminiStatus === "online" && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 flex w-[420px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/60 backdrop-blur-2xl"
            style={{ height: "580px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-violet-900/60 via-purple-900/40 to-fuchsia-900/30 px-5 py-4">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg">
                <span className="text-lg">🤖</span>
                {geminiStatus === "online" && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">Nalanda AI Copilot</p>
                <p className="text-xs text-slate-400">
                  {geminiStatus === "online" ? "Gemini connected" :
                   geminiStatus === "offline" ? "Gemini unavailable" :
                   "Gemini AI"}
                </p>
              </div>
              {messages.length > 0 && (
                <button onClick={clearHistory} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 hover:bg-white/5" title="Clear chat">Clear</button>
              )}
            </div>

            {/* Context chip */}
            {context?.chapterTitle && (
              <div className="border-b border-white/5 bg-violet-500/10 px-4 py-2">
                <p className="text-xs text-violet-300">
                  📖 Context: <span className="font-medium text-white">{context.chapterTitle}</span>
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-3xl border border-violet-500/20">🤖</div>
                  <div>
                    <p className="font-semibold text-white">Software Engineering Expert</p>
                    <p className="mt-1 text-xs text-slate-400 max-w-[280px] leading-5">
                      Ask me anything — from basic HTML to advanced system design, security, DevOps, and beyond.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_PROMPTS.map(p => (
                      <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300 hover:bg-violet-500/20 transition"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-sm ${msg.role === "user" ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-gradient-to-br from-violet-500 to-fuchsia-600"}`}>
                      {msg.role === "user" ? "👤" : "🤖"}
                    </div>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "rounded-tr-sm bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20" : "rounded-tl-sm bg-slate-900/80 border border-white/10"}`}>
                      {msg.role === "assistant" ? (
                        <div className="prose-nalanda">{renderMarkdown(msg.content)}</div>
                      ) : (
                        <p className="text-sm text-slate-200">{msg.content}</p>
                      )}
                      {msg.model && msg.role === "assistant" && (
                        <p className="mt-2 text-[10px] text-slate-600">{msg.source === "gemini" ? msg.model : "AI unavailable"}</p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm">🤖</div>
                  <div className="rounded-2xl rounded-tl-sm bg-slate-900/80 border border-white/10 px-4 py-3">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="h-2 w-2 rounded-full bg-violet-400"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 bg-slate-900/50 p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 focus-within:border-violet-500/50">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask a software engineering question…"
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-white placeholder-slate-500 outline-none leading-6 max-h-32"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg transition disabled:opacity-40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-slate-600">Enter to send · Shift+Enter for new line</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
