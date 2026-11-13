import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, showToast } = useStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-500 shrink-0" />
  };

  const bgStyles = {
    success: 'border-emerald-500/20 bg-slate-900/95 text-white shadow-xl',
    error: 'border-red-500/20 bg-slate-900/95 text-white shadow-xl',
    info: 'border-amber-500/20 bg-slate-900/95 text-white shadow-xl'
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:bottom-6 md:right-6 z-50 max-w-sm md:w-full mx-auto md:mx-0 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center justify-between gap-3 p-4 rounded-xl border backdrop-blur-md ${bgStyles[toast.type]}`}>
        <div className="flex items-center gap-3">
          {icons[toast.type]}
          <p className="text-sm font-medium tracking-tight">{toast.message}</p>
        </div>
        <button
          onClick={() => showToast('', 'info')}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
