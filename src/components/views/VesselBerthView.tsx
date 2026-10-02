/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Vessel Berth Planning View: Berthing Schedules, Crane Gang Allocation & Stevedoring Progress
 */

import React, { useState } from 'react';
import { 
  TOSDatabaseState, 
  VesselBerth,
  TerminalEquipment 
} from '../../types/tos';
import { dbService } from '../../services/db';
import { 
  Ship, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  Anchor, 
  Gauge, 
  CheckCircle2, 
  PlayCircle, 
  Check, 
  X,
  Boxes
} from 'lucide-react';

interface VesselBerthViewProps {
  data: TOSDatabaseState;
  onRefresh: () => void;
  onNotify: (title: string, message: string, cat?: 'vessel') => void;
}

export const VesselBerthView: React.FC<VesselBerthViewProps> = ({
  data,
  onRefresh,
  onNotify,
}) => {
  const { vessels, equipment, shippingLines } = data;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<VesselBerth | null>(null);

  // Form State
  const [vesselName, setVesselName] = useState('MV Meratus Java Explorer');
  const [callSign, setCallSign] = useState('YBMK8');
  const [imoNumber, setImoNumber] = useState('9812904');
  const [shippingLine, setShippingLine] = useState('Meratus Line');
  const [voyageIn, setVoyageIn] = useState('MJ-092');
  const [voyageOut, setVoyageOut] = useState('MJ-093');
  const [loaMeters, setLoaMeters] = useState<number>(185);
  const [draftMeters, setDraftMeters] = useState<number>(10.5);
  const [berthLocation, setBerthLocation] = useState<'Berth 01 (North Quay)' | 'Berth 02 (South Quay)'>('Berth 01 (North Quay)');
  const [eta, setEta] = useState(new Date().toISOString().slice(0, 16));
  const [etd, setEtd] = useState(new Date(Date.now() + 36 * 3600000).toISOString().slice(0, 16));
  const [totalDischarge, setTotalDischarge] = useState<number>(540);
  const [totalLoad, setTotalLoad] = useState<number>(480);
  const [selectedCranes, setSelectedCranes] = useState<string[]>(['QC-01', 'QC-02']);

  const quayCranes = equipment.filter((e: TerminalEquipment) => e.type === 'quay_crane');

  const handleOpenAdd = () => {
    setEditingVessel(null);
    setVesselName('MV Samudera Pasifik 88');
    setCallSign('VRST2');
    setImoNumber('9712093');
    setShippingLine(shippingLines[0] || 'Maersk Line');
    setVoyageIn('MS-101');
    setVoyageOut('MS-102');
    setLoaMeters(195);
    setDraftMeters(11.2);
    setBerthLocation('Berth 01 (North Quay)');
    setEta(new Date().toISOString().slice(0, 16));
    setEtd(new Date(Date.now() + 48 * 3600000).toISOString().slice(0, 16));
    setTotalDischarge(450);
    setTotalLoad(380);
    setSelectedCranes(['QC-01']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VesselBerth) => {
    setEditingVessel(v);
    setVesselName(v.vesselName);
    setCallSign(v.callSign);
    setImoNumber(v.imoNumber);
    setShippingLine(v.shippingLine);
    setVoyageIn(v.voyageIn);
    setVoyageOut(v.voyageOut);
    setLoaMeters(v.loaMeters);
    setDraftMeters(v.draftMeters);
    setBerthLocation(v.berthLocation);
    setEta(v.eta.slice(0, 16));
    setEtd(v.etd.slice(0, 16));
    setTotalDischarge(v.totalDischargeTeus);
    setTotalLoad(v.totalLoadTeus);
    setSelectedCranes(v.assignedCranes);
    setIsModalOpen(true);
  };

  const handleSaveVessel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVessel) {
      dbService.updateVessel(editingVessel.id, {
        vesselName,
        callSign,
        imoNumber,
        shippingLine,
        voyageIn,
        voyageOut,
        loaMeters: Number(loaMeters),
        draftMeters: Number(draftMeters),
        berthLocation,
        eta: new Date(eta).toISOString(),
        etd: new Date(etd).toISOString(),
        totalDischargeTeus: Number(totalDischarge),
        totalLoadTeus: Number(totalLoad),
        assignedCranes: selectedCranes,
      });
      onNotify('Jadwal Kapal Diperbarui', `Data kapal ${vesselName} berhasil diperbarui.`, 'vessel');
    } else {
      dbService.addVessel({
        vesselName,
        callSign,
        imoNumber,
        shippingLine,
        voyageIn,
        voyageOut,
        loaMeters: Number(loaMeters),
        draftMeters: Number(draftMeters),
        berthLocation,
        eta: new Date(eta).toISOString(),
        etd: new Date(etd).toISOString(),
        status: 'scheduled',
        totalDischargeTeus: Number(totalDischarge),
        dischargedTeus: 0,
        totalLoadTeus: Number(totalLoad),
        loadedTeus: 0,
        assignedCranes: selectedCranes,
        bchTarget: 28,
        currentBch: 0,
      });
      onNotify('Jadwal Kapal Ditambahkan', `Kapal ${vesselName} dialokasikan di ${berthLocation}.`, 'vessel');
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const handleDeleteVessel = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus jadwal kapal ${name}?`)) {
      dbService.deleteVessel(id);
      onRefresh();
      onNotify('Jadwal Kapal Dihapus', `Data kapal ${name} berhasil dihapus dari sistem.`, 'vessel');
    }
  };

  const handleToggleOperatingStatus = (v: VesselBerth) => {
    const nextStatus = v.status === 'scheduled' ? 'operating' : v.status === 'operating' ? 'completed' : 'operating';
    dbService.updateVessel(v.id, {
      status: nextStatus,
      actualArrival: nextStatus === 'operating' && !v.actualArrival ? new Date().toISOString() : v.actualArrival,
      currentBch: nextStatus === 'operating' ? 29.5 : v.currentBch,
    });
    onRefresh();
    onNotify('Status Sandar Berubah', `Kapal ${v.vesselName} kini berstatus: ${nextStatus}.`, 'vessel');
  };

  const handleSimulateMove = (v: VesselBerth) => {
    const newDischarged = Math.min(v.totalDischargeTeus, v.dischargedTeus + 15);
    const newLoaded = Math.min(v.totalLoadTeus, v.loadedTeus + 12);
    dbService.updateVessel(v.id, {
      dischargedTeus: newDischarged,
      loadedTeus: newLoaded,
      currentBch: Math.round((28 + Math.random() * 4) * 10) / 10,
    });
    onRefresh();
    onNotify('Stevedoring Progress Update', `STS Crane membongkar 15 TEU & memuat 12 TEU pada ${v.vesselName}.`, 'vessel');
  };

  const toggleCraneSelection = (code: string) => {
    if (selectedCranes.includes(code)) {
      setSelectedCranes(selectedCranes.filter(c => c !== code));
    } else {
      setSelectedCranes([...selectedCranes, code]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ship className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Penjadwalan Sandar & Stevedoring Kapal (Berth Planning)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Alokasi dermaga, penjadwalan tambatan kapal peti kemas, penugasan STS Quay Crane Gang, dan monitor BCH real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Kapal (CRUD Create)</span>
          </button>
        </div>
      </div>

      {/* 750-Meter Continuous Quay Berth Visual Footprint Map */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Visualisasi Panjang Garis Dermaga Terpadu (0m s/d 750m)</h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-300">
            Total Panjang Tambatan: 750 Meter · Kedalaman Alur: -16m LWS
          </span>
        </div>

        {/* Quay Meter Ruler Canvas */}
        <div className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
          {/* Waterway top */}
          <div className="relative h-28 rounded-lg bg-gradient-to-b from-cyan-950/40 to-slate-950 border border-cyan-900/30 overflow-hidden flex items-end p-2 min-w-[700px]">
            {/* Docked Ship 1 (North Quay Berth 01) */}
            <div 
              className="absolute bottom-2 left-[8%] w-[26%] h-16 rounded-xl bg-purple-900/80 border-2 border-purple-400 p-2 shadow-lg shadow-purple-950/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white">
                <span className="truncate">MV Samudera Kebumen Raya</span>
                <span className="text-purple-300 text-[9px]">LOA 172.5m</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-purple-200">
                <span>Berth 01 (North)</span>
                <span className="bg-emerald-950 text-emerald-300 px-1 rounded font-mono">QC-01, QC-02</span>
              </div>
            </div>

            {/* Docked Ship 2 (South Quay Berth 02) */}
            <div 
              className="absolute bottom-2 left-[50%] w-[38%] h-18 rounded-xl bg-indigo-900/80 border-2 border-indigo-400 p-2 shadow-lg shadow-indigo-950/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white">
                <span className="truncate">MV MSC Pacific Horizon</span>
                <span className="text-indigo-300 text-[9px]">LOA 260.0m</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-indigo-200">
                <span>Berth 02 (South)</span>
                <span className="bg-emerald-950 text-emerald-300 px-1 rounded font-mono">QC-03, QC-04</span>
              </div>
            </div>
          </div>

          {/* Quay Edge Concrete Line */}
          <div className="h-2 w-full bg-slate-700 min-w-[700px] my-1" />

          {/* Bollard / Meter Tick Marks */}
          <div className="flex justify-between text-[9px] font-mono text-slate-500 min-w-[700px] px-1">
            <span>0m (North)</span>
            <span>100m</span>
            <span>200m</span>
            <span className="text-purple-400 font-bold">350m [Batas Dermaga 01 & 02]</span>
            <span>500m</span>
            <span>600m</span>
            <span>750m (South)</span>
          </div>
        </div>
      </div>

      {/* Berth Visual Timeline / Allocation Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Berth 01: North Quay */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/50 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Dermaga 01 (North Quay)</h3>
              <span className="text-[10px] text-slate-400 font-mono">Panjang: 350m · Kedalaman: -14m LWS</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
              QC-01, QC-02
            </span>
          </div>

          {vessels.filter((v: VesselBerth) => v.berthLocation.includes('Berth 01')).length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Tidak ada kapal yang sedang bersandar di Dermaga 01.
            </div>
          ) : (
            vessels.filter((v: VesselBerth) => v.berthLocation.includes('Berth 01')).map((vsl: VesselBerth) => renderVesselCard(vsl))
          )}
        </div>

        {/* Berth 02: South Quay */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-900/50 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Dermaga 02 (South Quay)</h3>
              <span className="text-[10px] text-slate-400 font-mono">Panjang: 400m · Kedalaman: -16m LWS</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded">
              QC-03, QC-04
            </span>
          </div>

          {vessels.filter((v: VesselBerth) => v.berthLocation.includes('Berth 02')).length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Tidak ada kapal yang sedang bersandar di Dermaga 02.
            </div>
          ) : (
            vessels.filter((v: VesselBerth) => v.berthLocation.includes('Berth 02')).map((vsl: VesselBerth) => renderVesselCard(vsl))
          )}
        </div>

      </div>

      {/* Vessel Master Schedule Table (CRUD Read, Update, Delete) */}
      <div className="rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Jadwal Kedatangan & Keberangkatan Kapal Peti Kemas (BAPLIE TOS)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Total {vessels.length} Kapal Terdaftar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Kapal & Call Sign</th>
                <th className="py-3 px-3">Pelayaran</th>
                <th className="py-3 px-3">Voyage In/Out</th>
                <th className="py-3 px-3">Lokasi Sandar</th>
                <th className="py-3 px-3">ETA / ETD</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Bongkar (TEU)</th>
                <th className="py-3 px-3 text-right">Muat (TEU)</th>
                <th className="py-3 px-4 text-center">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {vessels.map((vsl: VesselBerth) => (
                <tr key={vsl.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-white block">{vsl.vesselName}</span>
                    <span className="text-[10px] text-purple-400">CS: {vsl.callSign} · IMO: {vsl.imoNumber}</span>
                  </td>
                  <td className="py-3 px-3">{vsl.shippingLine}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                    {vsl.voyageIn} / {vsl.voyageOut}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{vsl.berthLocation.split(' ')[0]} {vsl.berthLocation.split(' ')[1]}</td>
                  <td className="py-3 px-3 font-mono text-[11px] tabular-nums text-slate-400">
                    <div>ETA: {new Date(vsl.eta).toLocaleDateString('id-ID')}</div>
                    <div>ETD: {new Date(vsl.etd).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      vsl.status === 'operating'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        : vsl.status === 'scheduled'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {vsl.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                    {vsl.dischargedTeus} / {vsl.totalDischargeTeus}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                    {vsl.loadedTeus} / {vsl.totalLoadTeus}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(vsl)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit Kapal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVessel(vsl.id, vsl.vesselName)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-200 transition-colors"
                        title="Hapus Kapal (CRUD Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vessel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-800/50 rounded-2xl shadow-2xl p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
              <div className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  {editingVessel ? 'Ubah Data Sandar Kapal (CRUD Update)' : 'Booking Jadwal Sandar Kapal Baru (CRUD Create)'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVessel} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Nama Kapal Peti Kemas
                  </label>
                  <input
                    type="text"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-bold text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Shipping Line
                  </label>
                  <select
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  >
                    {shippingLines.map((sl: string) => (
                      <option key={sl} value={sl}>{sl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Call Sign
                  </label>
                  <input
                    type="text"
                    value={callSign}
                    onChange={(e) => setCallSign(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Nomor IMO
                  </label>
                  <input
                    type="text"
                    value={imoNumber}
                    onChange={(e) => setImoNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Voyage In
                  </label>
                  <input
                    type="text"
                    value={voyageIn}
                    onChange={(e) => setVoyageIn(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Voyage Out
                  </label>
                  <input
                    type="text"
                    value={voyageOut}
                    onChange={(e) => setVoyageOut(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    LOA Panjang (Meter)
                  </label>
                  <input
                    type="number"
                    value={loaMeters}
                    onChange={(e) => setLoaMeters(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Draft Kedalaman (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={draftMeters}
                    onChange={(e) => setDraftMeters(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Lokasi Tambatan Dermaga (Berth)
                  </label>
                  <select
                    value={berthLocation}
                    onChange={(e) => setBerthLocation(e.target.value as typeof berthLocation)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="Berth 01 (North Quay)">Berth 01 (North Quay - 350m)</option>
                    <option value="Berth 02 (South Quay)">Berth 02 (South Quay - 400m)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Estimated Time Arrival (ETA)
                  </label>
                  <input
                    type="datetime-local"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Estimated Time Departure (ETD)
                  </label>
                  <input
                    type="datetime-local"
                    value={etd}
                    onChange={(e) => setEtd(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Rencana Bongkar (Discharge TEU)
                  </label>
                  <input
                    type="number"
                    value={totalDischarge}
                    onChange={(e) => setTotalDischarge(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Rencana Muat (Load TEU)
                  </label>
                  <input
                    type="number"
                    value={totalLoad}
                    onChange={(e) => setTotalLoad(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Crane Gang Allocation */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                  Alokasi STS Quay Crane Gang
                </label>
                <div className="flex flex-wrap gap-2">
                  {quayCranes.map((qc: TerminalEquipment) => {
                    const isSelected = selectedCranes.includes(qc.code);
                    return (
                      <button
                        type="button"
                        key={qc.code}
                        onClick={() => toggleCraneSelection(qc.code)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {qc.code} ({qc.manufacturer})
                      </button>
                    );
                  })}
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
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perencanaan Sandar</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );

  function renderVesselCard(vsl: VesselBerth) {
    const dischargePercent = Math.round((vsl.dischargedTeus / (vsl.totalDischargeTeus || 1)) * 100);
    const loadPercent = Math.round((vsl.loadedTeus / (vsl.totalLoadTeus || 1)) * 100);
    const isOperating = vsl.status === 'operating';

    return (
      <div 
        key={vsl.id}
        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-3 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-white text-sm">{vsl.vesselName}</h4>
            <div className="text-[10px] text-slate-400 font-mono">
              CS: <span className="text-purple-300">{vsl.callSign}</span> · IMO: {vsl.imoNumber} · {vsl.shippingLine}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              isOperating
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {vsl.status}
            </span>
            <button
              onClick={() => handleToggleOperatingStatus(vsl)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-900/50 text-[10px] font-semibold text-purple-200 border border-purple-800/40"
            >
              Ubah Status
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 font-mono">
          <div>
            <span className="text-slate-500 block text-[9px]">CRANE GANG</span>
            <span className="text-cyan-300 font-semibold">{vsl.assignedCranes.join(', ')}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">VOYAGE IN/OUT</span>
            <span className="text-slate-200">{vsl.voyageIn}/{vsl.voyageOut}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">BCH TARGET/AKTUAL</span>
            <span className="text-emerald-400 font-bold">{vsl.currentBch} / {vsl.bchTarget} m/h</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">ETA / ETD</span>
            <span className="text-slate-200">{new Date(vsl.eta).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2 pt-2 border-t border-slate-900">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Bongkar (Discharge Progress)</span>
              <span className="font-mono text-slate-200 font-bold">{vsl.dischargedTeus} / {vsl.totalDischargeTeus} TEU ({dischargePercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${dischargePercent}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Muat (Load Progress)</span>
              <span className="font-mono text-slate-200 font-bold">{vsl.loadedTeus} / {vsl.totalLoadTeus} TEU ({loadPercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${loadPercent}%` }} />
            </div>
          </div>
        </div>

        {isOperating && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => handleSimulateMove(vsl)}
              className="px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/60 border border-purple-500/50 text-[11px] text-purple-200 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <PlayCircle className="w-3 h-3" />
              <span>Simulasi Move Bongkar/Muat (+Moves)</span>
            </button>
          </div>
        )}
      </div>
    );
  }
};
