import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent(
      `Hello Phone Bazar! I want to check availability and best deals on smartphones.`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center group">
      <button
        onClick={handleWhatsAppClick}
        className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-emerald-500/30 transition-all transform hover:scale-105 cursor-pointer relative"
        title="Chat on WhatsApp with Phone Bazar specialists"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-7 h-7 fill-white text-emerald-600" />
        
        {/* Subtle ping indicator */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
        </span>
      </button>

      {/* Hover tooltip label */}
      <div className="hidden sm:block ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <span>Chat with us on WhatsApp</span>
      </div>
    </div>
  );
};
