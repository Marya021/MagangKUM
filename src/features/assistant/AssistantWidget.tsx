import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Minus, Send, Lightbulb, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logoKemenkum from "@/assets/logo-kemenkum.png";
import { quickQuestions, findFaqAnswer, allFaqs, type FAQ } from "./faq-data";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  // For bot messages we may suggest related follow-up questions
  suggestions?: string[];
}

const WELCOME_TEXT =
  "Saya siap membantu Anda dengan informasi seputar program magang, layanan, dan kebijakan di Kementerian Hukum.";

const FALLBACK_TEXT =
  "Maaf, saya belum menemukan jawaban yang cocok di FAQ. Silakan coba pertanyaan lain, atau lihat halaman FAQ lengkap untuk informasi lebih detail.";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function getRelatedSuggestions(faq: FAQ, count = 3): string[] {
  return allFaqs
    .filter((f) => f.q !== faq.q)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((f) => f.q);
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show attention hint bubble shortly after mount (once per session)
  useEffect(() => {
    if (open || hintDismissed) return;
    const seen = sessionStorage.getItem("mkum-assistant-hint-seen");
    if (seen) return;
    const t = setTimeout(() => setShowHint(true), 2500);
    return () => clearTimeout(t);
  }, [open, hintDismissed]);

  const dismissHint = () => {
    setShowHint(false);
    setHintDismissed(true);
    sessionStorage.setItem("mkum-assistant-hint-seen", "1");
  };

  // Auto-scroll on new message
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, open, minimized]);

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open, minimized]);

  const sendQuestion = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate light "typing" delay for nicer UX
    setTimeout(() => {
      const faq = findFaqAnswer(trimmed);
      const botMsg: ChatMessage = faq
        ? {
            id: uid(),
            role: "bot",
            content: faq.a,
            suggestions: getRelatedSuggestions(faq),
          }
        : { id: uid(), role: "bot", content: FALLBACK_TEXT };
      setMessages((m) => [...m, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const resetChat = () => setMessages([]);

  // ---- Floating launcher ----
  if (!open) {
    return (
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {/* Attention hint bubble */}
        {showHint && (
          <div className="relative max-w-[260px] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              type="button"
              onClick={dismissHint}
              aria-label="Tutup hint"
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/80 text-background shadow-md hover:bg-foreground"
            >
              <X className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                dismissHint();
                setOpen(true);
              }}
              className="group block rounded-2xl rounded-br-sm border border-border bg-card px-4 py-3 text-left shadow-xl transition-all hover:border-primary hover:shadow-2xl"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                M-KUM Assistant
              </div>
              <p className="mt-1 text-sm font-medium text-foreground">
                Butuh bantuan? Tanya saya! 👋
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Klik di sini untuk mulai chat
              </p>
            </button>
          </div>
        )}

        {/* Launcher pill button */}
        <button
          type="button"
          onClick={() => {
            dismissHint();
            setOpen(true);
            setMinimized(false);
          }}
          aria-label="Buka M-KUM Assistant - Bantuan AI"
          className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40 ring-4 ring-primary/20 transition-all hover:scale-105 hover:shadow-2xl hover:ring-primary/30"
        >
          <MessageCircle className="h-5 w-5" />

          {/* Online dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </span>
        </button>
      </div>
    );
  }

  // ---- Minimized pill ----
  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg sm:bottom-6 sm:right-6"
      >
        <MessageCircle className="h-4 w-4" />
        M-KUM Assistant
      </button>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div
      className={cn(
        "fixed z-[60] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl",
        // Mobile: full width with safe insets
        "inset-x-3 bottom-3 top-3 sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto",
        // Desktop fixed size
        "sm:h-[640px] sm:max-h-[calc(100vh-3rem)] sm:w-[400px]",
      )}
      role="dialog"
      aria-label="M-KUM Assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/30">
            <img src={logoKemenkum} alt="" className="h-6 w-6 object-contain" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold sm:text-base">M-KUM Assistant</div>
            <div className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Online 24/7
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasMessages && (
            <button
              type="button"
              onClick={resetChat}
              aria-label="Mulai percakapan baru"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              title="Mulai percakapan baru"
            >
              <Lightbulb className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMinimized(true)}
            aria-label="Minimalkan"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/20 px-4 py-5">
        {!hasMessages ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
              <img src={logoKemenkum} alt="" className="h-12 w-12 object-contain" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Halo! Selamat datang di
              <br />
              M-KUM Assistant 👋
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{WELCOME_TEXT}</p>

            <div className="mt-6 flex w-full items-center justify-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Pertanyaan Cepat:
            </div>

            <div className="mt-3 w-full space-y-2">
              {quickQuestions.map((q) => {
                const Icon = q.icon;
                return (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => sendQuestion(q.match)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">{q.label}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onSuggestionClick={(text) => sendQuestion(text)}
              />
            ))}
            {isTyping && <TypingBubble />}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border bg-card p-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan Anda..."
          className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          maxLength={300}
          aria-label="Pesan untuk M-KUM Assistant"
        />
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          disabled={!input.trim() || isTyping}
          aria-label="Kirim"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  onSuggestionClick,
}: {
  message: ChatMessage;
  onSuggestionClick: (text: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] flex-col gap-2", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
            isUser
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-card text-foreground border border-border",
          )}
        >
          {message.content}
        </div>
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggestionClick(s)}
                className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 shadow-sm">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}
