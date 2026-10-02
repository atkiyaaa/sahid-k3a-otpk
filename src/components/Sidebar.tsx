/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Sidebar Navigation Component
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Truck, 
  Ship, 
  Crosshair, 
  FileCheck2, 
  CreditCard, 
  Database, 
  FileSpreadsheet, 
  Network,
  ChevronRight
} from 'lucide-react';

export type TOSView = 
  | 'dashboard'
  | 'yard_planning'
  | 'gate_system'
  | 'vessel_berth'
  | 'equipment_tracking'
  | 'eeir_inspection'
  | 'billing_tariffs'
  | 'master_data'
  | 'reports_export'
  | 'architecture_workflow';

interface SidebarProps {
  activeView: TOSView;
  onSelectView: (view: TOSView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: TOSView;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Analitik',
      subLabel: 'BCH, TRT, YOR & Throughput',
      icon: LayoutDashboard,
    },
    {
      id: 'yard_planning',
      label: 'Yard Planning',
      subLabel: 'Pemetaan Bay-Row-Tier 2D',
      icon: Layers,
    },
    {
      id: 'gate_system',
      label: 'Gate System',
      subLabel: 'Otomasi OCR & Timbangan',
      icon: Truck,
      badge: 'Live',
    },
    {
      id: 'vessel_berth',
      label: 'Vessel Berth Planning',
      subLabel: 'Jadwal Sandar & Stevedoring',
      icon: Ship,
    },
    {
      id: 'equipment_tracking',
      label: 'Pelacakan Alat',
      subLabel: 'Quay Crane & Reach Stacker',
      icon: Crosshair,
    },
    {
      id: 'eeir_inspection',
      label: 'e-EIR Inspeksi',
      subLabel: 'Kondisi Fisik & Kerusakan',
      icon: FileCheck2,
    },
    {
      id: 'billing_tariffs',
      label: 'Billing & Tagihan',
      subLabel: 'THC, Storage & Faktur',
      icon: CreditCard,
    },
    {
      id: 'master_data',
      label: 'Master Data CRUD',
      subLabel: 'Kapal, Blok, Alat & Tarif',
      icon: Database,
    },
    {
      id: 'reports_export',
      label: 'Laporan & Ekspor',
      subLabel: 'Ekspor Excel (.xlsx) & PDF',
      icon: FileSpreadsheet,
      badge: 'XLSX/PDF',
    },
    {
      id: 'architecture_workflow',
      label: 'Arsitektur & Workflow',
      subLabel: 'Spesifikasi & Alur Sistem KICT',
      icon: Network,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 lg:top-[57px] left-0 h-screen lg:h-[calc(100vh-57px)]
        w-64 bg-slate-950 border-r border-purple-950/60 flex flex-col justify-between
        z-50 lg:z-20 transition-transform duration-300 ease-in-out shrink-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Terminal branding on mobile */}
        <div className="lg:hidden p-4 border-b border-purple-900/40 flex items-center justify-between">
          <span className="text-sm font-bold text-white tracking-wide">
            KICT PORT OPERATING SYSTEM
          </span>
          <button 
            onClick={onCloseMobile}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900"
          >
            Tutup
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-purple-400/80 uppercase tracking-wider">
            Modul Utama TOS KICT
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`
                  w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group cursor-pointer
                  ${isActive 
                    ? 'bg-purple-900/50 text-white font-semibold border border-purple-600/50 shadow-md shadow-purple-950/50' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`
                    w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                    ${isActive ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 group-hover:text-purple-300'}
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="truncate leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal truncate leading-tight mt-0.5">
                      {item.subLabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  {item.badge && (
                    <span className={`
                      text-[9px] font-bold px-1.5 py-0.5 rounded
                      ${isActive 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-purple-950/80 text-purple-300 border border-purple-800/40'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-purple-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Terminal Metrics Quick Peek */}
        <div className="p-3 m-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Yard Occupancy</span>
            <span className="font-mono text-purple-300 font-bold text-[11px] tabular-nums">72.4%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-400 h-1.5 rounded-full" style={{ width: '72.4%' }} />
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Dermaga: 2 Kapal Sandar</span>
            <span className="text-emerald-400 font-semibold">Aktif 24/7</span>
          </div>
        </div>
      </aside>
    </>
  );
};
