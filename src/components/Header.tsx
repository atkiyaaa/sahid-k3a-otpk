/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Top Bar Header Component (adhering to Top Bar Contract)
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, NeonDbStatus } from '../types/tos';
import { 
  Anchor, 
  Bell, 
  Database, 
  LogOut, 
  Network,
  Clock,
  Radio,
  FileCode2
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  activeViewTitle: string;
  unreadCount: number;
  neonStatus: NeonDbStatus;
  activeDevicesCount?: number;
  onOpenNotifications: () => void;
  onOpenDatabaseConfig: () => void;
  onOpenArchitecture: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeViewTitle,
  unreadCount,
  neonStatus,
  activeDevicesCount = 1,
  onOpenNotifications,
  onOpenDatabaseConfig,
  onOpenArchitecture,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 bg-slate-950/90 backdrop-blur-md border-b border-purple-950/60 shadow-lg">
      
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
          <Anchor className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-white tracking-tight leading-tight">
            KICT <span className="text-purple-400 font-semibold">TOS</span>
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline-block leading-tight">
            Kebumen International Container Terminal
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Breadcrumbs, Live Terminal Status & Neon DB Bridge */}
      <div className="hidden lg:flex items-center gap-5 text-xs text-slate-300">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 font-medium text-slate-400">
          <span className="text-slate-500">Operasi</span>
          <span>/</span>
          <span className="text-purple-300 font-semibold">{activeViewTitle}</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] tabular-nums">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>{currentTime}</span>
        </div>

        {/* Multi-Device Live Sync Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 font-medium"
          title="Koneksi real-time multi-device aktif. Perubahan di perangkat ini otomatis terlihat di perangkat lain seketika."
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Multi-Device: <strong className="text-white">{activeDevicesCount} Online</strong></span>
        </div>

        {/* Neon DB Live Status Indicator */}
        <button
          onClick={onOpenDatabaseConfig}
          className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/50 border border-purple-800/40 hover:bg-purple-900/40 transition-colors text-[11px] text-purple-200 cursor-pointer"
          title="Klik untuk konfigurasi dan status koneksi Neon DB PostgreSQL"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-purple-400" />
          <span>Neon DB: {neonStatus.latencyMs}ms</span>
        </button>

        {/* Arsitektur & Alur Kerja Quick Action */}
        <button
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 text-slate-400 hover:text-purple-300 transition-colors text-xs cursor-pointer"
        >
          <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Arsitektur & Alur Kerja</span>
        </button>
      </div>

      {/* Zone 3: Primary Actions (Notifications, Profile & Logout) */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-600/50 text-slate-300 hover:text-white transition-all cursor-pointer"
          aria-label="Pemberitahuan real-time"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-950">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-300">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-purple-400 font-medium capitalize">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-red-950/40 hover:border-red-800/50 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
          title="Keluar / Ganti Akun"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
