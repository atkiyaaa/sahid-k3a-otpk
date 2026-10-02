/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Gate System View: Automated OCR, Weighbridge Integration & e-Ticket / Gate Pass Generator
 */

import React, { useState } from 'react';
import { 
  TOSDatabaseState, 
  GateLog, 
  ContainerSize, 
  ContainerType 
} from '../../types/tos';
import { dbService } from '../../services/db';
import { 
  Truck, 
  Scan, 
  Scale, 
  Ticket, 
  Plus, 
  Printer, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  QrCode, 
  Barcode, 
  Radio, 
  FileText,
  X,
  Sparkles
} from 'lucide-react';

interface GateSystemViewProps {
  data: TOSDatabaseState;
  onRefresh: () => void;
  onNotify: (title: string, message: string, cat?: 'gate') => void;
}

export const GateSystemView: React.FC<GateSystemViewProps> = ({
  data,
  onRefresh,
  onNotify,
}) => {
  const { gateLogs } = data;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDirection, setFilterDirection] = useState<'all' | 'gate_in' | 'gate_out'>('all');

  // New / Edit Gate Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<GateLog | null>(null);
  const [direction, setDirection] = useState<'gate_in' | 'gate_out'>('gate_in');
  const [lane, setLane] = useState<'Lane 1 (Export/Inbound)' | 'Lane 2 (Import/Inbound)' | 'Lane 3 (Outbound)'>('Lane 1 (Export/Inbound)');
  const [truckPlate, setTruckPlate] = useState('AA 8912 KD');
  const [driverName, setDriverName] = useState('Budi Prasetya');
  const [driverIdNumber, setDriverIdNumber] = useState('3305129901840003');
  const [truckingCompany, setTruckingCompany] = useState('PT Kebumen Trans Jaya');
  const [containerNumber, setContainerNumber] = useState('MSKU9810291');
  const [containerSize, setContainerSize] = useState<ContainerSize>('40ft');
  const [containerType, setContainerType] = useState<ContainerType>('dry');
  const [sealNumber, setSealNumber] = useState('SEAL-889102');
  const [grossWeight, setGrossWeight] = useState<number>(37800);
  const [tareWeight, setTareWeight] = useState<number>(9800);
  const [assignedYardSlot, setAssignedYardSlot] = useState<string>('A-03-02-1');
  const [remarks, setRemarks] = useState('Hasil scan OCR normal, segel utuh.');

  const handleOpenEdit = (log: GateLog) => {
    setEditingLog(log);
    setDirection(log.direction);
    setLane(log.lane);
    setTruckPlate(log.truckPlate);
    setDriverName(log.driverName);
    setDriverIdNumber(log.driverIdNumber);
    setTruckingCompany(log.truckingCompany);
    setContainerNumber(log.containerNumber);
    setContainerSize(log.containerSize);
    setContainerType(log.containerType);
    setSealNumber(log.sealNumber);
    setGrossWeight(log.weighbridgeGrossKg);
    setTareWeight(log.weighbridgeTareKg);
    setAssignedYardSlot(log.assignedYardSlot);
    setRemarks(log.remarks || '');
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingLog(null);
    handleSimulateOCR();
    setIsModalOpen(true);
  };

  // Printable e-Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState<GateLog | null>(null);

  // Filtered list
  const filteredLogs = gateLogs.filter((log: GateLog) => {
    if (filterDirection !== 'all' && log.direction !== filterDirection) return false;
    if (searchTerm) {
      const match = 
        log.truckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.driverName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const netWeight = Math.max(0, grossWeight - tareWeight);

  const handleSimulateOCR = () => {
    const plates = ['AA 7182 DD', 'R 8820 HA', 'B 9201 TX', 'AA 4410 KD', 'H 8192 BA'];
    const containersList = ['MSKU4491021', 'MEDU8829104', 'EMCU3301928', 'MRTU7719203', 'ONEY1928374'];
    const seals = ['MSK-88192', 'MSC-44129', 'EMC-09182', 'MRT-22019', 'ONE-66190'];

    const rndIdx = Math.floor(Math.random() * plates.length);
    setTruckPlate(plates[rndIdx]);
    setContainerNumber(containersList[rndIdx]);
    setSealNumber(seals[rndIdx]);

    const rndGross = Math.floor(28000 + Math.random() * 12000);
    setGrossWeight(rndGross);
    setTareWeight(9500);

    onNotify('OCR Scan Selesai', `Truk ${plates[rndIdx]} dan kontainer ${containersList[rndIdx]} teridentifikasi otomatis.`, 'gate');
  };

  const handleCreateGateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLog) {
      dbService.updateGateLog(editingLog.id, {
        direction,
        lane,
        truckPlate: truckPlate.toUpperCase(),
        driverName,
        driverIdNumber,
        truckingCompany,
        containerNumber: containerNumber.toUpperCase(),
        containerSize,
        containerType,
        sealNumber: sealNumber.toUpperCase(),
        weighbridgeGrossKg: Number(grossWeight),
        weighbridgeTareKg: Number(tareWeight),
        netWeightKg: netWeight,
        assignedYardSlot,
        remarks,
      });
      setIsModalOpen(false);
      onRefresh();
      onNotify('Gate Log Diperbarui', `Data transaksi ${editingLog.ticketNumber} berhasil diupdate (CRUD Update).`, 'gate');
    } else {
      const newLog = dbService.addGateLog({
        direction,
        lane,
        truckPlate: truckPlate.toUpperCase(),
        driverName,
        driverIdNumber,
        truckingCompany,
        containerNumber: containerNumber.toUpperCase(),
        containerSize,
        containerType,
        sealNumber: sealNumber.toUpperCase(),
        weighbridgeGrossKg: Number(grossWeight),
        weighbridgeTareKg: Number(tareWeight),
        netWeightKg: netWeight,
        eirNumber: `EIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        assignedYardSlot,
        status: 'completed',
        remarks,
      });

      setIsModalOpen(false);
      onRefresh();
      setSelectedTicket(newLog); // Show e-ticket right away!
      onNotify(
        'Gate Pass Terbit',
        `Tiket ${newLog.ticketNumber} terbit untuk ${newLog.truckPlate}. Alokasi: ${assignedYardSlot}.`,
        'gate'
      );
    }
  };

  const handleDeleteGateLog = (id: string, ticketNum: string) => {
    if (window.confirm(`Yakin ingin menghapus riwayat gate pass ${ticketNum}?`)) {
      dbService.deleteGateLog(id);
      onRefresh();
      onNotify('Gate Log Dihapus', `Data tiket ${ticketNum} berhasil dihapus.`, 'gate');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Gate System & Otomasi Gerbang Truk Peti Kemas
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Pencatatan truk masuk/keluar otomatis, kamera Optical Character Recognition (OCR), dan timbangan jembatan (weighbridge).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setIsModalOpen(true);
              handleSimulateOCR();
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Gate In / Out Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* 3 Live Gates Lane Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Lane 1 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Lane 1 (Export / Inbound)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded">
              OPEN / ACTIVE
            </span>
          </div>
          <div className="my-3 text-xs text-slate-300">
            <div className="flex justify-between text-slate-400 text-[11px] mb-1">
              <span>Sensor OCR:</span>
              <span className="text-emerald-400 font-semibold">Ready (Hikvision ANPR)</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Jembatan Timbang:</span>
              <span className="text-slate-200 font-mono">Kalibrasi Valid</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Kecepatan Pemrosesan:</span>
            <span className="text-emerald-400 font-bold font-mono">1.8 Menit / Truk</span>
          </div>
        </div>

        {/* Lane 2 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Lane 2 (Import / Inbound)
            </span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/70 border border-purple-800/40 px-2 py-0.5 rounded">
              OPEN / ACTIVE
            </span>
          </div>
          <div className="my-3 text-xs text-slate-300">
            <div className="flex justify-between text-slate-400 text-[11px] mb-1">
              <span>Sensor OCR:</span>
              <span className="text-emerald-400 font-semibold">Ready (ISO Container Code)</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Pemeriksaan Segel:</span>
              <span className="text-slate-200">Kamera HD 4K</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Kecepatan Pemrosesan:</span>
            <span className="text-purple-300 font-bold font-mono">2.1 Menit / Truk</span>
          </div>
        </div>

        {/* Lane 3 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Lane 3 (Delivery / Outbound)
            </span>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/70 border border-indigo-800/40 px-2 py-0.5 rounded">
              BARRIER AUTO
            </span>
          </div>
          <div className="my-3 text-xs text-slate-300">
            <div className="flex justify-between text-slate-400 text-[11px] mb-1">
              <span>Validasi SPPB:</span>
              <span className="text-emerald-400 font-semibold">Online Bea Cukai (OK)</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Status Pelunasan:</span>
              <span className="text-slate-200">Billing Engine Linked</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Kecepatan Pemrosesan:</span>
            <span className="text-indigo-300 font-bold font-mono">1.2 Menit / Truk</span>
          </div>
        </div>

      </div>

      {/* Live Optical OCR Camera & Weighbridge Sensor Visualizer */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Live Monitor Kamera OCR & Jembatan Timbang (Lane 1 ANPR)</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              CAMERA 1080p 60FPS AI-RECOGNITION ACTIVE
            </span>
            <button
              onClick={handleSimulateOCR}
              className="px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Pindai Truk Baru</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Simulated Camera Feed Viewfinder */}
          <div className="md:col-span-8 relative h-48 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Viewfinder crosshairs */}
            <div className="absolute inset-4 border border-dashed border-emerald-500/40 pointer-events-none rounded flex flex-col justify-between p-2">
              <div className="flex justify-between text-[10px] font-mono text-emerald-400/70">
                <span>KICT-GATE-CAM-01 [INBOUND]</span>
                <span>ISO 6346 OCR: ACTIVE</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-emerald-400/70">
                <span>FPS: 59.8 · EXPOSURE: AUTO</span>
                <span>CONFIDENCE: 99.4%</span>
              </div>
            </div>

            {/* Scanning line animation */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

            {/* Target recognition boxes */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              {/* Container number bounding box */}
              <div className="p-2 rounded border-2 border-emerald-400 bg-emerald-950/60 text-center font-mono shadow-lg shadow-emerald-950">
                <span className="text-[9px] uppercase tracking-wider text-emerald-300 block font-bold">
                  OCR HASIL BACA KONTAINER:
                </span>
                <span className="text-xl font-black text-white tracking-widest">
                  {containerNumber}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">
                  Tipe: {containerSize} {containerType.toUpperCase()} · Segel: {sealNumber}
                </span>
              </div>

              {/* Truck license plate box */}
              <div className="px-3 py-1 rounded border border-purple-400 bg-purple-950/70 text-center font-mono">
                <span className="text-[9px] text-purple-300 mr-2">PLAT TRUK:</span>
                <span className="text-sm font-bold text-white tracking-wider">{truckPlate}</span>
              </div>
            </div>
          </div>

          {/* Digital Weighbridge Meter */}
          <div className="md:col-span-4 p-4 rounded-xl bg-slate-950 border border-purple-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-purple-400" />
                  Jembatan Timbang Digital
                </span>
                <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                  STABIL (LOCK)
                </span>
              </div>

              <div className="my-2 p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 text-center">
                <span className="text-[9px] text-purple-300 uppercase font-semibold block">Berat Total (Gross)</span>
                <div className="text-2xl font-black font-mono text-purple-200 tabular-nums">
                  {grossWeight.toLocaleString()} <span className="text-xs font-normal text-slate-400">Kg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span>TARE TRUK:</span>
                  <span className="text-slate-200 font-bold block">{tareWeight.toLocaleString()} Kg</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span>NETTO KARGO:</span>
                  <span className="text-emerald-400 font-bold block">{netWeight.toLocaleString()} Kg</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Proses & Terbitkan Gate Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nopol truk, nomor kontainer, nomor tiket, supir..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'gate_in', 'gate_out'] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => setFilterDirection(dir)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer border ${
                filterDirection === dir
                  ? 'bg-purple-600 border-purple-500 text-white font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {dir === 'all' ? 'Semua Log' : dir === 'gate_in' ? 'Gate In' : 'Gate Out'}
            </button>
          ))}
        </div>
      </div>

      {/* Gate Transactions Data Table (CRUD Read, Update, Delete) */}
      <div className="rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No. Tiket</th>
                <th className="py-3.5 px-3">Arah / Lane</th>
                <th className="py-3.5 px-3">Truk & Supir</th>
                <th className="py-3.5 px-3">Nomor Kontainer</th>
                <th className="py-3.5 px-3">Tipe / Ukuran</th>
                <th className="py-3.5 px-3 text-right">Berat Kotor</th>
                <th className="py-3.5 px-3">Slot Yard</th>
                <th className="py-3.5 px-3">Waktu Transaksi</th>
                <th className="py-3.5 px-4 text-center">Aksi (Cetak / Hapus)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan data transaksi gerbang yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: GateLog) => {
                  const isGateIn = log.direction === 'gate_in';
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">
                        {log.ticketNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isGateIn 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' 
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800/40'
                        }`}>
                          {isGateIn ? 'Gate In' : 'Gate Out'}
                        </span>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px] mt-0.5">
                          {log.lane.split(' ')[0]} {log.lane.split(' ')[1]}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-white block">{log.truckPlate}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{log.driverName}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">
                        {log.containerNumber}
                        <div className="text-[10px] text-slate-400 font-sans">
                          Segel: <span className="font-mono text-emerald-400">{log.sealNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-200">{log.containerSize}</span>
                        <span className="text-[10px] text-slate-400 capitalize block">{log.containerType}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200 font-semibold">
                        {(log.weighbridgeGrossKg / 1000).toFixed(2)} Ton
                        <div className="text-[10px] text-slate-500">
                          Net: {(log.netWeightKg / 1000).toFixed(2)} T
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-purple-300 font-bold">
                        {log.assignedYardSlot}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px] tabular-nums">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(log)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Transaksi Gerbang (CRUD Update)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedTicket(log)}
                            className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/60 border border-purple-500/40 text-purple-300 hover:text-white transition-colors cursor-pointer"
                            title="Cetak Gate Pass / e-Ticket"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGateLog(log.id, log.ticketNumber)}
                            className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                            title="Hapus Transaksi (CRUD Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Gate Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-800/50 rounded-2xl shadow-2xl p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  {editingLog ? `Ubah Data Transaksi Gerbang: ${editingLog.ticketNumber} (CRUD Update)` : 'Pencatatan Gerbang Otomatis (Gate In / Gate Out)'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* OCR Auto Simulation Button */}
            <div className="mb-4 p-3 rounded-xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-purple-200">
                <Scan className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Simulasi Kamera OCR ANPR & Timbangan Sensor</span>
              </div>
              <button
                type="button"
                onClick={handleSimulateOCR}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 shadow cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deteksi Ulang OCR</span>
              </button>
            </div>

            <form onSubmit={handleCreateGateTransaction} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Arah Pergerakan
                  </label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as 'gate_in' | 'gate_out')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="gate_in">Gate In (Masuk Terminal)</option>
                    <option value="gate_out">Gate Out (Keluar Terminal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Jalur Gerbang (Lane)
                  </label>
                  <select
                    value={lane}
                    onChange={(e) => setLane(e.target.value as typeof lane)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="Lane 1 (Export/Inbound)">Lane 1 (Export / Inbound)</option>
                    <option value="Lane 2 (Import/Inbound)">Lane 2 (Import / Inbound)</option>
                    <option value="Lane 3 (Outbound)">Lane 3 (Outbound / Delivery)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Plat Truk (OCR)
                  </label>
                  <input
                    type="text"
                    value={truckPlate}
                    onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold text-sm uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Nama Pengemudi
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Perusahaan Ekspedisi
                  </label>
                  <input
                    type="text"
                    value={truckingCompany}
                    onChange={(e) => setTruckingCompany(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Nomor Kontainer (OCR)
                  </label>
                  <input
                    type="text"
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold text-sm uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Ukuran & Tipe
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={containerSize}
                      onChange={(e) => setContainerSize(e.target.value as ContainerSize)}
                      className="w-1/2 px-2 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    >
                      <option value="20ft">20ft</option>
                      <option value="40ft">40ft</option>
                      <option value="45ft">45ft</option>
                    </select>
                    <select
                      value={containerType}
                      onChange={(e) => setContainerType(e.target.value as ContainerType)}
                      className="w-1/2 px-2 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    >
                      <option value="dry">Dry</option>
                      <option value="reefer">Reefer</option>
                      <option value="hazardous_dg">DG</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Nomor Segel (Seal)
                  </label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs uppercase focus:outline-none"
                  />
                </div>
              </div>

              {/* Weighbridge Numbers */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-2">
                  <Scale className="w-4 h-4 text-purple-400" />
                  <span>Jembatan Timbang (Weighbridge Scale Sensor)</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Berat Kotor (Gross Kg)</label>
                    <input
                      type="number"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Berat Truk Kosong (Tare Kg)</label>
                    <input
                      type="number"
                      value={tareWeight}
                      onChange={(e) => setTareWeight(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Berat Muatan Bersih (Netto)</label>
                    <div className="px-2.5 py-1.5 rounded bg-slate-900 border border-purple-900/60 font-mono text-emerald-400 font-bold text-xs">
                      {netWeight.toLocaleString()} Kg
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Alokasi Penumpukan Slot Yard (TOS Auto)
                  </label>
                  <input
                    type="text"
                    value={assignedYardSlot}
                    onChange={(e) => setAssignedYardSlot(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-purple-300 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Catatan Pemeriksa
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{editingLog ? 'Simpan Perubahan Transaksi (CRUD Update)' : 'Terbitkan Gate Pass & Simpan (CRUD Create)'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Printable Gate Pass / e-Ticket Modal with Barcode & QR */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl p-6 border-2 border-purple-600 overflow-hidden">
            
            {/* Ticket Header */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <span className="text-[10px] uppercase tracking-widest text-purple-700 font-extrabold block">
                KEBUMEN INTERNATIONAL CONTAINER TERMINAL (KICT)
              </span>
              <h3 className="text-xl font-black tracking-tight text-slate-900 mt-0.5">
                SURAT MASUK GERBANG (GATE PASS)
              </h3>
              <div className="text-xs font-mono font-bold text-purple-900 mt-1">
                {selectedTicket.ticketNumber}
              </div>
              <div className="text-[10px] text-slate-500">
                Waktu: {new Date(selectedTicket.timestamp).toLocaleString('id-ID')}
              </div>
            </div>

            {/* Barcode & QR Visualizer */}
            <div className="py-4 border-b border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 my-3 rounded-xl p-3">
              <div className="font-mono text-xs tracking-widest font-black text-slate-800 mb-1">
                * {selectedTicket.ticketNumber} *
              </div>
              {/* Simulated crisp barcode bars */}
              <div className="h-10 w-64 flex items-center justify-between px-2 bg-white border border-slate-300 py-1">
                {Array.from({ length: 42 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="h-full bg-slate-950" 
                    style={{ width: `${(idx % 3 === 0 ? 3 : idx % 2 === 0 ? 1 : 2)}px` }} 
                  />
                ))}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                PIN AUTENTIKASI: 9812-4410
              </div>
            </div>

            {/* Ticket Details Body */}
            <div className="space-y-2 text-xs py-2">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Nomor Plat Truk:</span>
                <span className="font-mono font-black text-sm text-slate-900">{selectedTicket.truckPlate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Nama Pengemudi:</span>
                <span className="font-bold text-slate-800">{selectedTicket.driverName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Nomor Peti Kemas:</span>
                <span className="font-mono font-black text-purple-900">{selectedTicket.containerNumber} ({selectedTicket.containerSize})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Nomor Segel (Seal):</span>
                <span className="font-mono font-bold text-emerald-700">{selectedTicket.sealNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Berat Kotor (Gross):</span>
                <span className="font-mono font-bold text-slate-900">{selectedTicket.weighbridgeGrossKg.toLocaleString()} Kg</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Berat Bersih (Netto):</span>
                <span className="font-mono text-slate-700">{selectedTicket.netWeightKg.toLocaleString()} Kg</span>
              </div>

              {/* Highlighting Target Yard Slot */}
              <div className="p-3 bg-purple-100 border border-purple-300 rounded-xl my-3 text-center">
                <span className="text-[10px] uppercase font-bold text-purple-800 block">
                  LOKASI PENUMPUKAN PETI KEMAS DI YARD:
                </span>
                <div className="text-2xl font-mono font-black text-purple-950 tracking-wider">
                  {selectedTicket.assignedYardSlot}
                </div>
                <span className="text-[10px] text-purple-700">
                  Ikuti rambu penunjuk arah menuju Blok {selectedTicket.assignedYardSlot.split('-')[0]}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center pt-2 border-t border-dashed border-slate-300">
              Perhatikan batas kecepatan maksimal 20 km/jam di dalam terminal area KICT. Harap simpan tiket ini hingga gate out.
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="w-1/2 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-1/2 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Tiket Fisik</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
