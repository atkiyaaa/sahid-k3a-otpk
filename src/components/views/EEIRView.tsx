/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * e-EIR View: Electronic Equipment Interchange Receipt & Physical Inspection (5-Side Damage Mapping)
 */

import React, { useState } from 'react';
import { 
  TOSDatabaseState, 
  EEIRInspection 
} from '../../types/tos';
import { dbService } from '../../services/db';
import { 
  FileCheck2, 
  Plus, 
  Trash2, 
  Printer, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Camera, 
  PenTool, 
  FileText,
  Search,
  Sparkles
} from 'lucide-react';

interface EEIRViewProps {
  data: TOSDatabaseState;
  onRefresh: () => void;
  onNotify: (title: string, message: string, cat?: 'system') => void;
}

export const EEIRView: React.FC<EEIRViewProps> = ({
  data,
  onRefresh,
  onNotify,
}) => {
  const { eeirInspections, containers, gateLogs } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<EEIRInspection | null>(null);

  // Form State
  const [containerNumber, setContainerNumber] = useState('MSKU9284710');
  const [isoCode, setIsoCode] = useState('42G1');
  const [truckPlate, setTruckPlate] = useState('AA 8912 KD');
  const [driverName, setDriverName] = useState('Joko Widodo Santoso');
  const [shippingLine, setShippingLine] = useState('Maersk Line');
  const [sealNumber, setSealNumber] = useState('MSK-771890');
  const [sealIntact, setSealIntact] = useState<boolean>(true);
  const [cleanliness, setCleanliness] = useState<'clean' | 'swept' | 'dirty_requires_wash' | 'odor_detected'>('clean');
  const [inspectorName, setInspectorName] = useState('Ferry Hermawan (Field Inspector)');
  const [damages, setDamages] = useState<EEIRInspection['damages']>([]);
  const [status, setStatus] = useState<'accepted' | 'accepted_with_defect' | 'rejected'>('accepted');

  // Damage click mapping state
  const [activeSide, setActiveSide] = useState<'front' | 'rear_door' | 'left_side' | 'right_side' | 'roof' | 'floor'>('left_side');
  const [selectedDamageType, setSelectedDamageType] = useState<'dent' | 'scratch' | 'hole' | 'rust' | 'bent_frame'>('scratch');
  const [selectedSeverity, setSelectedSeverity] = useState<'minor' | 'moderate' | 'critical'>('minor');
  const [damageNotes, setDamageNotes] = useState('Goresan pelindung luar');

  const filtered = eeirInspections.filter(item => {
    if (!searchTerm) return true;
    return (
      item.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.eirNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.truckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.driverName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newDamage = {
      id: 'dmg-' + Date.now(),
      section: activeSide,
      damageType: selectedDamageType,
      severity: selectedSeverity,
      positionX: x,
      positionY: y,
      notes: damageNotes || `Kerusakan ${selectedDamageType} pada sisi ${activeSide}`,
    };

    setDamages([...damages, newDamage]);
    if (status === 'accepted') {
      setStatus('accepted_with_defect');
    }
    onNotify('Titik Kerusakan Ditandai', `Kerusakan ${selectedDamageType} dicatat pada sisi ${activeSide} (${x}%, ${y}%).`, 'system');
  };

  const handleRemoveDamage = (id: string) => {
    setDamages(damages.filter(d => d.id !== id));
  };

  const handleCreateEEIR = (e: React.FormEvent) => {
    e.preventDefault();
    const newEIR = dbService.addEEIRInspection({
      transactionType: 'gate_in',
      containerNumber: containerNumber.toUpperCase(),
      isoCode,
      truckPlate: truckPlate.toUpperCase(),
      driverName,
      shippingLine,
      sealNumber: sealNumber.toUpperCase(),
      sealIntact,
      cleanliness,
      damages,
      inspectorName,
      inspectorSignature: `VERIFIED_${Date.now().toString(36).toUpperCase()}`,
      status,
    });

    setIsModalOpen(false);
    onRefresh();
    setSelectedInspection(newEIR);
    onNotify('Dokumen e-EIR Diterbitkan', `e-EIR ${newEIR.eirNumber} untuk kontainer ${newEIR.containerNumber} telah disahkan.`, 'system');
  };

  const handleDeleteEEIR = (id: string, eirNum: string) => {
    if (window.confirm(`Yakin ingin menghapus dokumen e-EIR ${eirNum}?`)) {
      dbService.deleteEEIR(id);
      onRefresh();
      onNotify('Dokumen e-EIR Dihapus', `Data ${eirNum} berhasil dihapus.`, 'system');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Pencatatan Kondisi Fisik Kontainer (e-EIR)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Electronic Equipment Interchange Receipt: inspeksi visual 5 sisi kontainer, verifikasi integritas segel, dan berita acara kerusakan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setDamages([]);
              setIsModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Berita Acara e-EIR Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor e-EIR, nomor kontainer, plat truk, supir..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <span className="text-slate-400 text-xs font-mono">
          {filtered.length} Dokumen e-EIR Terarsip
        </span>
      </div>

      {/* e-EIR Documents Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">No. e-EIR</th>
                <th className="py-3 px-3">Nomor Kontainer</th>
                <th className="py-3 px-3">Plat Truk & Supir</th>
                <th className="py-3 px-3">Pelayaran</th>
                <th className="py-3 px-3">Integritas Segel</th>
                <th className="py-3 px-3">Cacat / Kerusakan</th>
                <th className="py-3 px-3">Status Penerimaan</th>
                <th className="py-3 px-3">Inspektur & Waktu</th>
                <th className="py-3 px-4 text-center">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ada arsip dokumen e-EIR yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const hasDamage = item.damages.length > 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">
                        {item.eirNumber}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {item.containerNumber}
                        <span className="text-[10px] text-slate-500 block font-sans">{item.isoCode}</span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="text-slate-200 block">{item.truckPlate}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{item.driverName}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{item.shippingLine}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-emerald-400 font-semibold block">{item.sealNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {item.sealIntact ? '✓ Segel Utuh' : '⚠ Segel Rusak'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {hasDamage ? (
                          <span className="text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {item.damages.length} Titik Cacat
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Bersih / Kondisi Baik
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === 'accepted'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                            : item.status === 'accepted_with_defect'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                            : 'bg-red-950 text-red-300 border border-red-800/40'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] tabular-nums text-slate-400">
                        <span className="text-slate-200 block font-sans">{item.inspectorName.split(' ')[0]}</span>
                        {new Date(item.inspectionDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedInspection(item)}
                            className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/60 border border-purple-500/40 text-purple-300 hover:text-white transition-colors cursor-pointer"
                            title="Lihat & Cetak e-EIR"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEEIR(item.id, item.eirNumber)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                            title="Hapus Dokumen (CRUD Delete)"
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

      {/* New e-EIR Inspection Modal with 5-Side Interactive Mapper */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-purple-800/50 rounded-2xl shadow-2xl p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Formulir Inspeksi Fisik Kontainer (e-EIR)
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEEIR} className="space-y-4 text-xs">
              
              {/* Container and truck basic data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Nomor Peti Kemas
                  </label>
                  <input
                    type="text"
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold uppercase text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Kode ISO
                  </label>
                  <input
                    type="text"
                    value={isoCode}
                    onChange={(e) => setIsoCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Plat Truk
                  </label>
                  <input
                    type="text"
                    value={truckPlate}
                    onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Nama Supir
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>
              </div>

              {/* Seal verification */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Nomor Segel (Seal No.)
                  </label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Kondisi Segel Fisik
                  </label>
                  <select
                    value={sealIntact ? 'true' : 'false'}
                    onChange={(e) => setSealIntact(e.target.value === 'true')}
                    className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  >
                    <option value="true">Utuh & Terkunci Rapat (Intact)</option>
                    <option value="false">Rusak / Tidak Sesuai Manifest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Kebersihan Interior
                  </label>
                  <select
                    value={cleanliness}
                    onChange={(e) => setCleanliness(e.target.value as typeof cleanliness)}
                    className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  >
                    <option value="clean">Bersih Layak Muat (Clean)</option>
                    <option value="swept">Disapu Rapi (Swept)</option>
                    <option value="dirty_requires_wash">Kotor Perlu Cuci</option>
                    <option value="odor_detected">Tercium Bau Asing</option>
                  </select>
                </div>
              </div>

              {/* Interactive 5-Side Damage Mapper */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/50">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-purple-400" />
                    <span>Pemetaan Kerusakan Visual (Klik pada Gambar Sisi Kontainer)</span>
                  </span>
                  
                  {/* Select Side to Inspect */}
                  <div className="flex items-center gap-1">
                    {(['left_side', 'right_side', 'front', 'rear_door', 'roof'] as const).map(side => (
                      <button
                        type="button"
                        key={side}
                        onClick={() => setActiveSide(side)}
                        className={`px-2.5 py-1 rounded capitalize text-[11px] font-semibold transition-colors ${
                          activeSide === side
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {side.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Damage Type & Severity Palette */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 shrink-0">Tipe Cacat:</span>
                    <select
                      value={selectedDamageType}
                      onChange={(e) => setSelectedDamageType(e.target.value as typeof selectedDamageType)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 w-full"
                    >
                      <option value="dent">Dent (Penyok)</option>
                      <option value="scratch">Scratch (Goresan)</option>
                      <option value="hole">Hole (Lubang Tembus)</option>
                      <option value="rust">Rust (Karat Parah)</option>
                      <option value="bent_frame">Bent Frame (Rangka Bengkok)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 shrink-0">Keparahan:</span>
                    <select
                      value={selectedSeverity}
                      onChange={(e) => setSelectedSeverity(e.target.value as typeof selectedSeverity)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 w-full"
                    >
                      <option value="minor">Minor (Ringan)</option>
                      <option value="moderate">Moderate (Sedang)</option>
                      <option value="critical">Critical (Kritis)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Catatan cacat..."
                      value={damageNotes}
                      onChange={(e) => setDamageNotes(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 w-full"
                    />
                  </div>
                </div>

                {/* Clickable Container Canvas */}
                <div
                  onClick={handleSideClick}
                  className="relative w-full h-44 rounded-xl border-2 border-dashed border-purple-500/50 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 cursor-crosshair flex items-center justify-center overflow-hidden"
                  title="Klik untuk menempatkan pin kerusakan"
                >
                  {/* Corrugated container wall texture lines */}
                  <div className="absolute inset-0 flex justify-between px-4 pointer-events-none opacity-20">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-full bg-purple-400" />
                    ))}
                  </div>

                  <div className="text-center pointer-events-none select-none">
                    <div className="font-mono text-sm font-black text-purple-300 tracking-wider">
                      PANEL SISI: {activeSide.toUpperCase().replace('_', ' ')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Klik di mana saja pada bidang ini untuk menandai koordinat kerusakan
                    </div>
                  </div>

                  {/* Render Damage Pins */}
                  {damages
                    .filter(d => d.section === activeSide)
                    .map(d => (
                      <div
                        key={d.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                        style={{ left: `${d.positionX}%`, top: `${d.positionY}%` }}
                      >
                        <div className="w-5 h-5 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                          !
                        </div>
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-slate-950 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 border border-slate-700">
                          {d.damageType.toUpperCase()} ({d.severity}) - {d.notes}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Damage List Tags */}
                {damages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    {damages.map(d => (
                      <div
                        key={d.id}
                        className="px-2.5 py-1 rounded-md bg-slate-900 border border-red-800/40 text-slate-300 flex items-center gap-1.5"
                      >
                        <span className="text-red-400 font-bold uppercase">{d.damageType}</span>
                        <span className="text-slate-400 font-mono">({d.section} {d.positionX}%,{d.positionY}%)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDamage(d.id)}
                          className="text-slate-500 hover:text-red-400 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status and inspector sign */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Status Penerimaan Peti Kemas
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                  >
                    <option value="accepted">Accepted (Diterima Bersih)</option>
                    <option value="accepted_with_defect">Accepted with Defect (Diterima dengan Cacat)</option>
                    <option value="rejected">Rejected (Ditolak Masuk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Inspektur Lapangan Bertugas
                  </label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
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
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Sahkan Dokumen e-EIR (CRUD Create)</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Printable Formal e-EIR Inspection Certificate Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-purple-800">
            
            {/* Header with KICT letterhead */}
            <div className="border-b-2 border-purple-900 pb-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-900">
                  KEBUMEN INTERNATIONAL CONTAINER TERMINAL (KICT)
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  ELECTRONIC EQUIPMENT INTERCHANGE RECEIPT (e-EIR)
                </h3>
                <p className="text-[10px] text-slate-600">
                  Sertifikat Bukti Serah Terima & Catatan Kondisi Fisik Kontainer · ISO 9001:2015
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-black text-purple-950">
                  {selectedInspection.eirNumber}
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(selectedInspection.inspectionDate).toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Spec details grid */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">NOMOR PETI KEMAS (ISO)</span>
                <span className="font-mono font-black text-base text-slate-900">{selectedInspection.containerNumber}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">OPERATOR PELAYARAN</span>
                <span className="font-bold text-slate-900">{selectedInspection.shippingLine}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">NOMOR SEGEL (SEAL)</span>
                <span className="font-mono font-bold text-emerald-800">{selectedInspection.sealNumber}</span>
                <span className="text-[10px] text-slate-600 ml-2">({selectedInspection.sealIntact ? 'Utuh' : 'Rusak'})</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">TRUK & PENGEMUDI</span>
                <span className="font-bold text-slate-900">{selectedInspection.truckPlate} ({selectedInspection.driverName})</span>
              </div>
            </div>

            {/* Damage list table */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-900 uppercase block mb-1.5">
                Daftar Temuan Cacat & Kerusakan Fisik:
              </span>
              {selectedInspection.damages.length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tidak ada cacat struktural. Kontainer dalam kondisi prima dan bersih.</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-semibold text-slate-700">
                      <tr>
                        <th className="p-2">Sisi Panel</th>
                        <th className="p-2">Jenis Cacat</th>
                        <th className="p-2">Tingkat Keparahan</th>
                        <th className="p-2">Deskripsi Kerusakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInspection.damages.map(d => (
                        <tr key={d.id}>
                          <td className="p-2 capitalize font-semibold">{d.section.replace('_', ' ')}</td>
                          <td className="p-2 uppercase font-mono font-bold text-red-700">{d.damageType}</td>
                          <td className="p-2 capitalize">{d.severity}</td>
                          <td className="p-2 text-slate-600">{d.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Signatures & Seal */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs text-center">
              <div>
                <span className="text-slate-500 block mb-8">Pengemudi Truk Pengangkut,</span>
                <span className="font-bold text-slate-900 border-t border-slate-300 pt-1 block">
                  ( {selectedInspection.driverName} )
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-2">Inspektur Lapangan KICT,</span>
                <div className="text-[10px] font-mono text-purple-800 bg-purple-50 p-1 rounded inline-block mb-1 border border-purple-200">
                  DIGITALLY SIGNED: {selectedInspection.inspectorSignature}
                </div>
                <span className="font-bold text-slate-900 border-t border-slate-300 pt-1 block">
                  ( {selectedInspection.inspectorName} )
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-6 mt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
              >
                Tutup Dokumen
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar e-EIR Resmi</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
