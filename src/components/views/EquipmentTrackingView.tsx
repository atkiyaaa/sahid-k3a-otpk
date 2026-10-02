/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Equipment Tracking View: Quay Cranes, RTG & Reach Stacker Fleet Telemetry & Job Dispatch
 */

import React, { useState } from 'react';
import { 
  TOSDatabaseState, 
  TerminalEquipment, 
  EquipmentStatus, 
  EquipmentType 
} from '../../types/tos';
import { dbService } from '../../services/db';
import { 
  Crosshair, 
  Battery, 
  BatteryCharging, 
  User, 
  Wrench, 
  Radio, 
  Play, 
  Pause, 
  CheckCircle2, 
  Fuel, 
  Send, 
  X,
  Gauge,
  Edit3,
  Check
} from 'lucide-react';

interface EquipmentTrackingViewProps {
  data: TOSDatabaseState;
  onRefresh: () => void;
  onNotify: (title: string, message: string, cat?: 'equipment') => void;
}

export const EquipmentTrackingView: React.FC<EquipmentTrackingViewProps> = ({
  data,
  onRefresh,
  onNotify,
}) => {
  const { equipment } = data;
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<TerminalEquipment | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [newJobDescription, setNewJobDescription] = useState('Pindahkan kontainer export dari Blok A ke Quay 01');

  // Edit Equipment State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEq, setEditingEq] = useState<TerminalEquipment | null>(null);
  const [editOperator, setEditOperator] = useState('');
  const [editSwl, setEditSwl] = useState(65);
  const [editLocation, setEditLocation] = useState('');
  const [editFuel, setEditFuel] = useState(90);
  const [editStatus, setEditStatus] = useState<EquipmentStatus>('operating');

  const handleOpenEdit = (eq: TerminalEquipment) => {
    setEditingEq(eq);
    setEditOperator(eq.operatorName);
    setEditSwl(eq.safeWorkingLoadTons);
    setEditLocation(eq.locationArea);
    setEditFuel(eq.fuelBatteryPercent);
    setEditStatus(eq.status);
    setIsEditModalOpen(true);
  };

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEq) return;
    dbService.updateEquipment(editingEq.id, {
      operatorName: editOperator,
      safeWorkingLoadTons: Number(editSwl),
      locationArea: editLocation,
      fuelBatteryPercent: Number(editFuel),
      status: editStatus,
    });
    setIsEditModalOpen(false);
    onRefresh();
    onNotify('Data Armada Diperbarui', `Informasi ${editingEq.code} berhasil disimpan (CRUD Update).`, 'equipment');
  };

  const filtered = equipment.filter(eq => {
    if (filterType === 'all') return true;
    return eq.type === filterType;
  });

  const handleUpdateStatus = (id: string, status: EquipmentStatus) => {
    dbService.updateEquipment(id, { status });
    onRefresh();
    onNotify('Status Alat Berubah', `Armada ${id} status diubah menjadi: ${status}.`, 'equipment');
  };

  const handleDispatchJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !newJobDescription) return;

    dbService.updateEquipment(selectedEquipment.id, {
      currentJob: newJobDescription,
      status: 'operating',
      movesCompletedToday: selectedEquipment.movesCompletedToday + 1,
    });

    setIsDispatchModalOpen(false);
    onRefresh();
    onNotify(
      'Work Order Terkirim ke Alat',
      `Tugas baru berhasil dikirim ke RDT ${selectedEquipment.code} (${selectedEquipment.operatorName}).`,
      'equipment'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crosshair className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Pelacakan & Telematika Armada Alat Berat (Fleet Dispatch)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Pemantauan posisi real-time STS Quay Crane, E-RTG Gantry, dan Reach Stacker di seluruh area pelabuhan KICT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'quay_crane', 'rtg', 'reach_stacker'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer border ${
                filterType === t
                  ? 'bg-purple-600 border-purple-500 text-white font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'Semua Armada' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Terminal 2D Map with Live Equipment Coordinates */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Peta Telematika Area Terminal KICT</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Sistem IoT GPS Aktif · Pembaruan Tiap 3 Detik
          </span>
        </div>

        {/* Map Canvas Visualizer */}
        <div 
          className="relative w-full h-80 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(rgba(147, 51, 234, 0.15) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        >
          {/* Waterway / Quay Berth area at top */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-cyan-950/20 border-b border-cyan-800/30 flex items-center justify-between px-6">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-widest">
              DERMAGA KICT (NORTH & SOUTH QUAY BERTH)
            </span>
            <span className="text-[9px] text-cyan-500 font-mono">KEDALAMAN -16m</span>
          </div>

          {/* Central Container Yard Blocks */}
          <div className="absolute top-24 left-10 right-10 bottom-16 flex items-center justify-around gap-4 pointer-events-none">
            {['A', 'B', 'C', 'R', 'DG'].map(b => (
              <div 
                key={b}
                className="flex-1 h-full border border-purple-900/30 bg-purple-950/10 rounded-lg flex flex-col items-center justify-center p-2"
              >
                <span className="font-mono font-bold text-xs text-purple-400/50">BLOK {b}</span>
                <span className="text-[9px] text-slate-600">Yard Stacking</span>
              </div>
            ))}
          </div>

          {/* Gate System at Bottom Left */}
          <div className="absolute bottom-2 left-6 px-4 py-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[10px] font-mono text-emerald-400">
            GERBANG UTAMA (LANE 1-3 OCR)
          </div>

          {/* Workshop at Bottom Right */}
          <div className="absolute bottom-2 right-6 px-4 py-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[10px] font-mono text-amber-400">
            WORKSHOP & MAINTENANCE BAY
          </div>

          {/* Live Equipment Markers */}
          {equipment.map((eq) => {
            const isOperating = eq.status === 'operating';
            const isMaintenance = eq.status === 'maintenance';
            return (
              <div
                key={eq.id}
                onClick={() => setSelectedEquipment(eq)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-700 hover:scale-125 z-10"
                style={{
                  left: `${eq.coordinates.x}%`,
                  top: `${eq.coordinates.y}%`,
                }}
              >
                <div className={`p-1.5 rounded-lg font-mono text-[10px] font-bold shadow-lg flex items-center gap-1 border ${
                  isMaintenance 
                    ? 'bg-red-900/90 text-white border-red-500 animate-bounce' 
                    : isOperating 
                    ? 'bg-purple-600 text-white border-purple-300 shadow-purple-900' 
                    : 'bg-slate-800 text-slate-300 border-slate-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOperating ? 'bg-emerald-300 animate-ping' : 'bg-slate-400'}`} />
                  <span>{eq.code}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((eq) => {
          const isOperating = eq.status === 'operating';
          const isMaintenance = eq.status === 'maintenance';

          return (
            <div 
              key={eq.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg space-y-3 hover:border-purple-600/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-white">{eq.code}</span>
                  <span className="text-[10px] font-mono bg-purple-950 px-2 py-0.5 rounded text-purple-300 border border-purple-800/40">
                    SWL {eq.safeWorkingLoadTons} Ton
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  isMaintenance
                    ? 'bg-red-950 text-red-300 border border-red-800/40'
                    : isOperating
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {eq.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-200">{eq.name}</h4>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Area: <span className="text-purple-300">{eq.locationArea}</span> · Manufaktur: {eq.manufacturer}
                </div>
              </div>

              {/* Active Job */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Tugas Aktif (Work Order)</span>
                <span className="text-slate-200 font-medium line-clamp-1">
                  {eq.currentJob || 'Menunggu penugasan dari TOS'}
                </span>
              </div>

              {/* Telemetry info */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[9px]">MOVES TODAY</span>
                  <span className="text-purple-300 font-bold tabular-nums">{eq.movesCompletedToday}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">BATERAI / FUEL</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{eq.fuelBatteryPercent}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">OPERATOR</span>
                  <span className="text-slate-300 text-[10px] truncate block">{eq.operatorName.split(' ')[0]}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(eq)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Edit Data Armada (CRUD Update)"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(eq.id, isOperating ? 'idle' : 'operating')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title={isOperating ? 'Set Idle' : 'Set Operating'}
                  >
                    {isOperating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(eq.id, 'maintenance')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                    title="Set Pemeliharaan (Maintenance)"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedEquipment(eq);
                    setIsDispatchModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Kirim Tugas (Dispatch)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Job Dispatch Modal */}
      {isDispatchModalOpen && selectedEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-purple-800/50 rounded-2xl shadow-2xl p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Kirim Work Order ke {selectedEquipment.code}
                </h3>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchJob} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Operator Bertugas:</div>
                <div className="font-bold text-white text-sm">{selectedEquipment.operatorName}</div>
                <div className="text-[11px] text-purple-300 font-mono mt-0.5">
                  Lokasi: {selectedEquipment.locationArea} · SWL {selectedEquipment.safeWorkingLoadTons} Ton
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                  Deskripsi Tugas / Kontainer Terjadwal
                </label>
                <textarea
                  rows={3}
                  value={newJobDescription}
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  required
                  placeholder="Contoh: Pindahkan kontainer MSCU9918231 dari Blok B-03-01 ke Dermaga 01"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke RDT Operator</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {isEditModalOpen && editingEq && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-purple-800/50 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Ubah Data Armada: {editingEq.code} (CRUD Update)
                </h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                  Nama Operator Lapangan
                </label>
                <input
                  type="text"
                  value={editOperator}
                  onChange={(e) => setEditOperator(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    SWL Kapasitas (Ton)
                  </label>
                  <input
                    type="number"
                    value={editSwl}
                    onChange={(e) => setEditSwl(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Baterai / Bahan Bakar (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editFuel}
                    onChange={(e) => setEditFuel(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                  Area Penugasan Terminal
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                  Status Operasional
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as EquipmentStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                >
                  <option value="operating">Operating (Beroperasi)</option>
                  <option value="idle">Idle (Standby)</option>
                  <option value="maintenance">Maintenance (Pemeliharaan)</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Armada (CRUD Update)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
