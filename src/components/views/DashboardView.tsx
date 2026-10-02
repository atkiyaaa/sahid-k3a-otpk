/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Dashboard View: Productivity Analytics, Operational Metrics, Live Berth & Yard Status
 */

import React, { useState } from 'react';
import { 
  TOSDatabaseState, 
  ContainerItem, 
  VesselBerth, 
  TerminalEquipment 
} from '../../types/tos';
import { TOSView } from '../Sidebar';
import { 
  Gauge, 
  Clock, 
  Layers, 
  Boxes, 
  Ship, 
  Truck, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight,
  Anchor,
  Zap,
  Sparkles,
  Download
} from 'lucide-react';

interface DashboardViewProps {
  data: TOSDatabaseState;
  onNavigate: (view: TOSView) => void;
  onTriggerEvent: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigate,
  onTriggerEvent,
}) => {
  const { metrics, vessels, blocks, equipment, gateLogs, containers } = data;

  const totalYardCapacity = blocks.reduce((acc, b) => acc + b.totalCapacityTeus, 0);
  const totalYardUsed = blocks.reduce((acc, b) => acc + b.currentTeus, 0);

  const activeCranes = equipment.filter(e => e.type === 'quay_crane' && e.status === 'operating').length;
  const activeRtgs = equipment.filter(e => e.type === 'rtg' && e.status === 'operating').length;
  const activeReachStackers = equipment.filter(e => e.type === 'reach_stacker' && e.status === 'operating').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Terminal Welcome & Live Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 border border-purple-800/40 shadow-xl">
        <div 
          className="absolute inset-0 bg-cover bg-right opacity-25 pointer-events-none mix-blend-luminosity"
          style={{
            backgroundImage: `url('/src/assets/images/kict_yard_cranes_1790644194938.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/95 via-slate-900/85 to-indigo-950/70 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/50 text-purple-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TERMINAL OPERASIONAL 24/7 · PELABUHAN INTERNASIONAL KEBUMEN</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Ringkasan Kinerja & Produktivitas Lapangan KICT
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1">
              Sistem Operasi Terminal (TOS) terintegrasi real-time dengan Neon DB. Memantau pergerakan kapal, alokasi penumpukan kontainer, antrian gerbang otomatis, dan telematika crane.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onTriggerEvent}
              className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Simulasi Event IoT</span>
            </button>
            <button
              onClick={() => onNavigate('reports_export')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Laporan Harian</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Productivity Metrics Cards (4 Core Indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: BCH */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Berth Crane Hour (BCH)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold font-mono text-white tabular-nums">
                {metrics.bchCurrent}
              </span>
              <span className="text-xs text-slate-400">moves/jam</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
            <span>Target: &gt; {metrics.bchTarget} moves/jam</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +1.4 Diatas Target
            </span>
          </div>
        </div>

        {/* Metric 2: TRT */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Truck Roundabout Time (TRT)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold font-mono text-white tabular-nums">
                {metrics.trtAverageMinutes}
              </span>
              <span className="text-xs text-slate-400">menit/truk</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
            <span>SLA Maksimal: {metrics.trtTargetMinutes} Menit</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Efisien (Optimal)
            </span>
          </div>
        </div>

        {/* Metric 3: YOR */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Yard Occupancy Rate (YOR)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold font-mono text-white tabular-nums">
                {metrics.yardOccupancyRatePercent}%
              </span>
              <span className="text-xs text-slate-400">
                ({totalYardUsed} / {totalYardCapacity} TEU)
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full"
              style={{ width: `${metrics.yardOccupancyRatePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 mt-2 border-t border-slate-800 text-slate-400">
            <span>Ambang Aman: &lt; 80%</span>
            <span className="text-purple-300 font-semibold">Terkendali</span>
          </div>
        </div>

        {/* Metric 4: Throughput */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Throughput Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold font-mono text-white tabular-nums">
                {metrics.totalTeusToday.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-400">TEUs</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
            <span>Bongkar: {metrics.totalDischargeTeusToday}</span>
            <span className="text-cyan-400 font-semibold">Muat: {metrics.totalLoadTeusToday}</span>
          </div>
        </div>

      </div>

      {/* Live Operational Grid: Vessel Berth + Yard Layout Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Live Vessel Berth Status */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                <Ship className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Status Dermaga & Kapal Bersandar</h3>
                <p className="text-[11px] text-slate-400">Quay Crane Gang & Progress Bongkar Muat (Stevedoring)</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('vessel_berth')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Jadwal Lengkap</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {vessels.map((vsl) => {
              const dischargePercent = Math.round((vsl.dischargedTeus / (vsl.totalDischargeTeus || 1)) * 100);
              const loadPercent = Math.round((vsl.loadedTeus / (vsl.totalLoadTeus || 1)) * 100);
              const isOperating = vsl.status === 'operating';

              return (
                <div 
                  key={vsl.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-800/50 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isOperating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="font-bold text-white text-sm">{vsl.vesselName}</span>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/40">
                        {vsl.callSign}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">{vsl.berthLocation}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isOperating 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {vsl.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 mb-3 font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">OPERATOR</span>
                      <span className="text-slate-200">{vsl.shippingLine}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CRANE GANG</span>
                      <span className="text-purple-300 font-semibold">{vsl.assignedCranes.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">LOA / DRAFT</span>
                      <span className="text-slate-200">{vsl.loaMeters}m / {vsl.draftMeters}m</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">BCH REAL</span>
                      <span className="text-emerald-400 font-bold">{vsl.currentBch} m/h</span>
                    </div>
                  </div>

                  {/* Stevedoring Progress Bars */}
                  {isOperating && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-900">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Bongkar (Discharge)</span>
                          <span className="font-mono text-slate-200">{vsl.dischargedTeus} / {vsl.totalDischargeTeus} TEU ({dischargePercent}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${dischargePercent}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Muat (Load)</span>
                          <span className="font-mono text-slate-200">{vsl.loadedTeus} / {vsl.totalLoadTeus} TEU ({loadPercent}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${loadPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 cols: Yard Utilization & Fleet Telemetry Snapshot */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Yard Blocks Capacity Overview */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Utilisasi Blok Yard KICT</h3>
              </div>
              <button
                onClick={() => onNavigate('yard_planning')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
              >
                Peta 2D
              </button>
            </div>

            <div className="space-y-3">
              {blocks.map((blk) => {
                const percent = Math.round((blk.currentTeus / (blk.totalCapacityTeus || 1)) * 100);
                return (
                  <div key={blk.id} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-5 rounded bg-purple-900/60 border border-purple-700/50 flex items-center justify-center font-bold text-purple-200 font-mono text-[10px]">
                          {blk.code}
                        </span>
                        <span className="font-medium text-slate-300 truncate max-w-[160px]">
                          {blk.name}
                        </span>
                      </div>
                      <div className="font-mono tabular-nums text-slate-300">
                        <span className="text-purple-300 font-bold">{blk.currentTeus}</span>
                        <span className="text-slate-500"> / {blk.totalCapacityTeus} TEU</span>
                        <span className="text-slate-400 ml-2 font-semibold">({percent}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${
                          percent > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equipment Fleet Status Summary */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Kesiapan Armada Alat Berat</h3>
              </div>
              <button
                onClick={() => onNavigate('equipment_tracking')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
              >
                Tracking
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">STS Quay Crane</span>
                <span className="text-xl font-bold font-mono text-purple-300 tabular-nums">4 / 4</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">100% Siap</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">E-RTG Gantry</span>
                <span className="text-xl font-bold font-mono text-indigo-300 tabular-nums">3 / 3</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">100% Siap</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reach Stacker</span>
                <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">1 / 2</span>
                <span className="text-[10px] text-amber-400 block mt-0.5">1 Servis</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Access Shortcuts for Operations */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
          Pintasan Cepat Operasional:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('gate_system')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/40 hover:border-purple-600/50 border border-slate-700 text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gate In Tiket Baru</span>
          </button>

          <button
            onClick={() => onNavigate('yard_planning')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/40 hover:border-purple-600/50 border border-slate-700 text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Alokasi Slot Yard</span>
          </button>

          <button
            onClick={() => onNavigate('eeir_inspection')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/40 hover:border-purple-600/50 border border-slate-700 text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>e-EIR Inspeksi Kerusakan</span>
          </button>

          <button
            onClick={() => onNavigate('billing_tariffs')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/40 hover:border-purple-600/50 border border-slate-700 text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Terbitkan Faktur THC</span>
          </button>
        </div>
      </div>

    </div>
  );
};
