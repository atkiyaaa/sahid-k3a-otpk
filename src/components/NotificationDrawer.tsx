/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Real-Time Push Notification Drawer
 */

import React, { useState, useEffect } from 'react';
import { PushNotification } from '../types/tos';
import { notificationService } from '../services/notificationService';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  Radio, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Truck, 
  Ship, 
  CreditCard, 
  Layers,
  Sparkles
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list) => {
      setNotifications(list);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filterCategory === 'all') return true;
    return n.category === filterCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'gate': return <Truck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'vessel': return <Ship className="w-3.5 h-3.5 text-cyan-400" />;
      case 'yard': return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'billing': return <CreditCard className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Info className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getLevelBorder = (level: string) => {
    switch (level) {
      case 'critical': return 'border-l-red-500 bg-red-950/20';
      case 'warning': return 'border-l-amber-500 bg-amber-950/20';
      case 'success': return 'border-l-emerald-500 bg-emerald-950/20';
      default: return 'border-l-purple-500 bg-purple-950/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-purple-900/40 shadow-2xl h-full flex flex-col z-10">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-purple-950/80 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Bell className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Notifikasi Push Real-Time</h3>
              <p className="text-[10px] text-slate-400">Pembaruan transaksi operasional terminal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Simulation Trigger Bar */}
        <div className="p-3 bg-purple-950/30 border-b border-purple-900/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-purple-300 font-medium">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Telemetry Hub KICT Online</span>
          </div>
          <button
            onClick={() => notificationService.triggerMockEvent()}
            className="px-2.5 py-1 rounded bg-purple-600/40 hover:bg-purple-600 border border-purple-500/50 text-[11px] font-semibold text-purple-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Simulasi Event Lapangan</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="p-2 border-b border-slate-800 flex items-center gap-1 overflow-x-auto text-[11px]">
          {['all', 'gate', 'vessel', 'yard', 'billing', 'equipment'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors whitespace-nowrap cursor-pointer ${
                filterCategory === cat
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'Semua' : cat}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Tidak ada notifikasi pada kategori ini.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => notificationService.markAsRead(item.id)}
                className={`p-3 rounded-lg border border-slate-800 border-l-4 ${getLevelBorder(
                  item.level
                )} transition-all cursor-pointer hover:border-slate-700 relative`}
              >
                {!item.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-500" />
                )}
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryIcon(item.category)}
                  <span className="text-xs font-bold text-slate-200">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pr-3">
                  {item.message}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-mono tabular-nums">
                    {new Date(item.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span className="uppercase text-[9px] px-1 rounded bg-slate-800/80 text-slate-400">
                    {item.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <button
            onClick={() => notificationService.markAllAsRead()}
            className="text-slate-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Tandai Semua Dibaca</span>
          </button>
          <button
            onClick={() => notificationService.clearAll()}
            className="text-slate-500 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua</span>
          </button>
        </div>
      </div>
    </div>
  );
};
