import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  '🔥 Best phones under ₹20,000',
  '🛡️ How does 7-Day Replacement work?',
  '📸 Best camera phone under ₹30,000',
  '📦 Delivery time & COD payment rules',
  '⚖️ iPhone 13 vs Galaxy S21'
];

export const ChatbotWidget: React.FC = () => {
  const { setIsOrderTrackingOpen, settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialGreeting: ChatMessage = {
    id: 'welcome-1',
    role: 'model',
    text: 'Namaste! 🙏 Welcome to Phone Bazar. I am your personal AI Smartphone Advisor.\n\nAsk me anything about our 670+ certified pre-owned smartphones, variant pricing, condition grades, or our 7-day replacement guarantee!',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('phonebajar_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [initialGreeting];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('phonebajar_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const getLocalAdvisorReply = (message: string): string => {
    const m = message.toLowerCase();

    if (m.includes('15,000') || m.includes('15000') || m.includes('15k')) {
      return "🔥 Top Certified 5G Smartphones Under ₹15,000 at Phone Bazar:\n\n1. Samsung Galaxy S20+ (₹14,999 · 62% OFF) - 8GB/128GB, 120Hz Dynamic AMOLED 2X.\n2. Redmi Note 12 Pro 5G (₹12,499) - 50MP Sony IMX766 OIS & 67W Turbo Charge.\n3. OnePlus Nord CE 3 Lite 5G (₹11,999) - 108MP camera, 67W SuperVOOC.\n4. POCO X5 Pro 5G (₹13,499) - Snapdragon 778G & 120Hz AMOLED.\n\nEvery device comes with 6 Months Warranty + 7-Day Replacement Guarantee!";
    }

    if (m.includes('20,000') || m.includes('20000') || m.includes('20k') || m.includes('budget')) {
      return "🔥 Top Certified Smartphones Under ₹20,000 at Phone Bazar:\n\n1. Samsung Galaxy S20+ (₹14,999 · 62% OFF) - 8GB/128GB, 6.7\" 120Hz Dynamic AMOLED 2X.\n2. Apple iPhone 11 (₹15,999) - A13 Bionic, Dual 12MP 4K cameras.\n3. Samsung Galaxy S21 5G (₹18,999) - 120Hz AMOLED & OIS triple cameras.\n4. Redmi Note 12 Pro 5G (₹12,499) - 50MP Sony IMX766 OIS & 67W Turbo Charge.\n\nAll devices include our 7-Day Replacement Guarantee & 6 Months Warranty!";
    }

    if (m.includes('30,000') || m.includes('30000') || m.includes('30k')) {
      return "📸 Best Flagship Smartphones Under ₹30,000 at Phone Bazar:\n\n1. Apple iPhone 13 (₹26,999) - A15 Bionic, Sensor-Shift OIS 4K Dolby Vision.\n2. Samsung Galaxy S22 5G (₹23,999) - 50MP Pro-grade OIS & Dynamic AMOLED 2X.\n3. OnePlus 11R 5G (₹24,999) - Snapdragon 8+ Gen 1, 100W SuperVOOC.\n4. Google Pixel 7 (₹25,499) - Google Tensor G2 computational camera.\n\nAll tested across 32 hardware checkpoints!";
    }

    if (m.includes('replacement') || m.includes('return') || m.includes('refund') || m.includes('guarantee')) {
      return "🛡️ Phone Bazar 7-Day Replacement Guarantee:\n\nIf you experience any functional hardware issue within 7 days of delivery, Phone Bazar provides a free reverse pickup and immediate replacement or 100% full refund. Every smartphone also includes a 6-Month Store Warranty!";
    }

    if (m.includes('warranty')) {
      return "🛡️ Store Warranty Details:\n\nEvery smartphone at Phone Bazar includes:\n• 6 Months Store Warranty covering internal hardware, motherboard, display touch, and battery.\n• 7-Day Doorstep Replacement Guarantee.\n• 32-Point Quality Testing Certificate included in the box.";
    }

    if (m.includes('camera') || m.includes('photo')) {
      return "📸 Best Camera Smartphones at Phone Bazar:\n\n1. Apple iPhone 14 Pro / 15 Pro - 48MP Main Pro camera, 4K Cinematic mode.\n2. Samsung Galaxy S23 Ultra / S24 Ultra - 200MP sensor with 100x Space Zoom.\n3. Google Pixel 7 Pro / 8 Pro - Google Tensor AI photography.\n\nWhich price range would you like to explore?";
    }

    if (m.includes('iphone') && (m.includes('samsung') || m.includes('galaxy') || m.includes('vs'))) {
      return "⚖️ iPhone vs Samsung Galaxy Comparison:\n\n• Choose Apple iPhone for industry-leading video recording, long-term iOS updates, and Face ID security.\n• Choose Samsung Galaxy for 120Hz Dynamic AMOLED 2X displays, versatile telephoto zoom, and fast multitasking.\n\nYou can also click the Compare icon on any 3 phones in our catalog to compare all 16 specifications side by side!";
    }

    if (m.includes('delivery') || m.includes('shipping') || m.includes('cod') || m.includes('cash on delivery')) {
      return "📦 Delivery & Payment Policy:\n\n• Free Insured Express Delivery across all Indian PIN codes (24–48 hours in metro cities, 2–4 business days nationwide).\n• Enter your 6-digit PIN code on any product page to check exact delivery timelines.\n• Both Online Prepaid (UPI, Cards, NetBanking) and Cash on Delivery (COD) are supported!";
    }

    if (m.includes('track') || m.includes('order')) {
      return `📦 To track your order status live across all 7 stages, click 'Track Order' in the top navigation bar and enter your Order ID (e.g. PB-729401). For assistance, email us at ${settings.officialEmail}.`;
    }

    if (m.includes('cashify') || m.includes('sell') || m.includes('exchange') || m.includes('trade')) {
      return "🔄 Exchange Your Old Phone at Phone Bazar:\n\nClick 'Exchange Your Phone' in the header or on any product page to calculate your existing phone's trade-in value in 6 simple steps and apply the discount directly to your purchase!";
    }

    return `Namaste! 🙏 Welcome to Phone Bazar. We offer 672+ certified pre-owned smartphones across Apple, Samsung, OnePlus, Google Pixel, Xiaomi, Redmi, Realme, Vivo, OPPO, Motorola, POCO, and iQOO. Every phone includes a 7-Day Replacement Guarantee and 6 Months Warranty.\n\nHow can I help you today? Ask me for recommendations by budget, brand, or specifications, or reach our team at ${settings.officialEmail}!`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          history: history
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Fallback to local advisor');
      }

      const data = await res.json();
      const replyText = data.reply || data.fallbackReply || getLocalAdvisorReply(query);

      const botMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const fallbackMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: getLocalAdvisorReply(query),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialGreeting]);
    localStorage.removeItem('phonebajar_chat_history');
    setError(null);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 sm:px-5 py-3.5 bg-slate-950 hover:bg-[#FF6A00] text-white rounded-full shadow-2xl hover:shadow-[#FF6A00]/30 transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-orange-500/40 group"
            aria-label="Open AI Shopping Advisor"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#FF6A00] group-hover:text-white transition-colors" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-tight font-display">Ask Phone Bazar</div>
              <div className="text-[10px] text-slate-300 group-hover:text-orange-100 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>AI Advisor Online</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md h-[540px] sm:h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-950 text-white px-4 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6A00] to-orange-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold font-display text-white">Phone Bazar AI Advisor</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Smart Shopping Assistant</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-medium">Online</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={handleClearChat}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Reset conversation"
                aria-label="Clear Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close chat"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-orange-50 border-b border-orange-100 px-3 py-1.5 text-[11px] text-orange-950 font-medium flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1 font-semibold text-orange-800">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF6A00]" /> 7-Day Replacement · 6M Warranty
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsOrderTrackingOpen(true);
              }}
              className="text-[10px] text-orange-700 hover:text-orange-950 underline font-bold cursor-pointer"
            >
              Track Order
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs sm:text-sm">
            {messages.length <= 2 && (
              <div className="space-y-1.5 pb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Questions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1.5 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 rounded-xl border border-slate-200/90 hover:border-orange-200 text-xs font-medium transition-colors text-left cursor-pointer shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF6A00] flex items-center justify-center shrink-0 mt-0.5 border border-orange-200/60">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                      isUser
                        ? 'bg-slate-950 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <div className="text-[9px] mt-1 text-right text-slate-400">{msg.timestamp}</div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF6A00] flex items-center justify-center shrink-0 border border-orange-200/60">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-bounce" />
                  <span className="text-[11px] text-slate-400 ml-1.5 font-medium">Thinking...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => handleSendMessage(messages[messages.length - 1]?.text)}
                  className="text-rose-800 font-bold underline ml-2"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 shrink-0"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. 'Best 5G phone under ₹15,000'..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6A00] focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-slate-950 hover:bg-[#FF6A00] disabled:bg-slate-300 text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
