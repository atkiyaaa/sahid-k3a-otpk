/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Master Data Management View: Full CRUD for Vessels, Yard Blocks, Equipment & Tariffs
 */

import React, { useState } from 'react';
import { 
  TOSDatabaseState, 
  YardBlock, 
  TerminalEquipment, 
  VesselBerth 
} from '../../types/tos';
import { dbService } from '../../services/db';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Ship, 
  Layers, 
  Crosshair, 
  DollarSign, 
  Check, 
  X,
  Search
} from 'lucide-react';

interface MasterDataViewProps {
  data: TOSDatabaseState;
  onRefresh: () => void;
  onNotify: (title: string, message: string, cat?: 'system') => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  data,
  onRefresh,
  onNotify,
}) => {
  const { blocks, equipment, vessels, shippingLines } = data;
  const [activeTab, setActiveTab] = useState<'blocks' | 'equipment' | 'shipping' | 'tariffs'>('blocks');
  const [searchTerm, setSearchTerm] = useState('');

  // Block Modal
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockCode, setBlockCode] = useState('E');
  const [blockName, setBlockName] = useState('Blok E - Buffer Yard Export');
  const [blockCategory, setBlockCategory] = useState<YardBlock['category']>('dry_export');
  const [baysCount, setBaysCount] = useState<number>(6);
  const [rowsCount, setRowsCount] = useState<number>(6);
  const [maxTiers, setMaxTiers] = useState<number>(5);
  const [assignedRtg, setAssignedRtg] = useState<string>('RTG-05');

  // Shipping Line Modal
  const [newLineInput, setNewLineInput] = useState('');

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const capacity = baysCount * rowsCount * maxTiers;
    dbService.addBlock({
      code: blockCode.toUpperCase(),
      name: blockName,
      category: blockCategory,
      baysCount: Number(baysCount),
      rowsCount: Number(rowsCount),
      maxTiers: Number(maxTiers),
      totalCapacityTeus: capacity,
      currentTeus: 0,
      craneAssigned: assignedRtg,
    });
    setIsBlockModalOpen(false);
    onRefresh();
    onNotify('Master Blok Ditambahkan', `Blok ${blockCode} berhasil didaftarkan (Kapasitas ${capacity} TEU).`, 'system');
  };

  const handleAddShippingLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLineInput.trim()) return;
    dbService.addShippingLine(newLineInput.trim());
    setNewLineInput('');
    onRefresh();
    onNotify('Master Pelayaran Ditambahkan', `Shipping line ${newLineInput.trim()} berhasil didaftarkan.`, 'system');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Master Data Operasional Terminal (CRUD Center)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Pengelolaan data referensi utama: Master Blok Yard, Master Armada Crane/Stacker, dan Mitra Pelayaran Kontainer.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 cursor-pointer border ${
            activeTab === 'blocks'
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Master Blok Yard ({blocks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 cursor-pointer border ${
            activeTab === 'equipment'
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Master Armada Alat ({equipment.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 cursor-pointer border ${
            activeTab === 'shipping'
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Ship className="w-3.5 h-3.5" />
          <span>Master Shipping Lines ({shippingLines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tariffs')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 cursor-pointer border ${
            activeTab === 'tariffs'
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Master Matriks Tarif Resmi</span>
        </button>
      </div>

      {/* TAB 1: BLOCKS CRUD */}
      {activeTab === 'blocks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Daftar Zona Blok Penumpukan (Yard Capacity)
            </span>
            <button
              onClick={() => setIsBlockModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Master Blok Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.map((b: YardBlock) => (
              <div key={b.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500 font-mono font-black text-sm text-purple-200 flex items-center justify-center">
                      {b.code}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-xs">{b.name}</h4>
                      <span className="text-[10px] text-purple-400 capitalize">{b.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono p-2.5 rounded bg-slate-950 border border-slate-850">
                  <div>
                    <span className="text-slate-500 block text-[9px]">JUMLAH BAY</span>
                    <span className="text-slate-200 font-bold">{b.baysCount} Bay</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">JUMLAH ROW</span>
                    <span className="text-slate-200 font-bold">{b.rowsCount} Row</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">MAX TIER</span>
                    <span className="text-slate-200 font-bold">{b.maxTiers} Tier</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Total Daya Tampung:</span>
                  <span className="font-mono font-bold text-purple-300">{b.totalCapacityTeus} TEU</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: EQUIPMENT CRUD */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Kode Alat</th>
                  <th className="p-3">Deskripsi Alat</th>
                  <th className="p-3">Tipe</th>
                  <th className="p-3">Manufaktur</th>
                  <th className="p-3">SWL (Ton)</th>
                  <th className="p-3">Area Kerja</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {equipment.map((eq: TerminalEquipment) => (
                  <tr key={eq.id}>
                    <td className="p-3 font-mono font-bold text-purple-300">{eq.code}</td>
                    <td className="p-3 font-semibold text-white">{eq.name}</td>
                    <td className="p-3 uppercase text-[10px] text-slate-400">{eq.type.replace('_', ' ')}</td>
                    <td className="p-3">{eq.manufacturer}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{eq.safeWorkingLoadTons} Ton</td>
                    <td className="p-3">{eq.locationArea}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        eq.status === 'operating' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {eq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SHIPPING LINES */}
      {activeTab === 'shipping' && (
        <div className="space-y-4 max-w-2xl">
          <form onSubmit={handleAddShippingLine} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Nama Shipping Line Baru (Contoh: Hapag-Lloyd, Yang Ming)..."
              value={newLineInput}
              onChange={(e) => setNewLineInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </form>

          <div className="grid grid-cols-2 gap-3">
            {shippingLines.map((sl: string) => (
              <div key={sl} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between text-slate-200">
                <span className="font-semibold">{sl}</span>
                <span className="text-[10px] text-purple-400 font-mono">EDI Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TARIFFS */}
      {activeTab === 'tariffs' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-white">Struktur Tarif Pelayanan Peti Kemas (SK Direksi KICT 2026)</h3>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Terminal Handling Charge (THC) 20ft FCL</span>
              <span className="font-mono text-purple-300 font-bold">Rp 1.250.000 / Box</span>
            </div>
            <div className="flex justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Terminal Handling Charge (THC) 40ft FCL</span>
              <span className="font-mono text-purple-300 font-bold">Rp 1.650.000 / Box</span>
            </div>
            <div className="flex justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Lift On / Lift Off (Lo-Lo) 20ft</span>
              <span className="font-mono text-purple-300 font-bold">Rp 320.000 / Gerak</span>
            </div>
            <div className="flex justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Lift On / Lift Off (Lo-Lo) 40ft</span>
              <span className="font-mono text-purple-300 font-bold">Rp 425.000 / Gerak</span>
            </div>
            <div className="flex justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Penumpukan Lapangan (Masa Bebas 1-2 Hari)</span>
              <span className="font-mono text-emerald-400 font-bold">Gratis (Rp 0)</span>
            </div>
            <div className="flex justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Penumpukan Lapangan (Hari ke-3 s/d ke-7 Progresif)</span>
              <span className="font-mono text-amber-400 font-bold">Rp 160.000 / TEU / Hari</span>
            </div>
            <div className="flex justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Monitoring & Daya Listrik Reefer Container</span>
              <span className="font-mono text-cyan-400 font-bold">Rp 550.000 / Box / 24 Jam</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Block Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-purple-800/50 rounded-2xl shadow-2xl p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Tambah Master Blok Yard Baru</h3>
              </div>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Kode Blok (Huruf)
                  </label>
                  <input
                    type="text"
                    value={blockCode}
                    onChange={(e) => setBlockCode(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold uppercase text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Kategori Yard
                  </label>
                  <select
                    value={blockCategory}
                    onChange={(e) => setBlockCategory(e.target.value as typeof blockCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                  >
                    <option value="dry_export">Dry Export</option>
                    <option value="dry_import">Dry Import</option>
                    <option value="transshipment">Transshipment</option>
                    <option value="reefer">Reefer Plug</option>
                    <option value="dangerous_goods">Dangerous Goods</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                  Nama Lengkap Blok
                </label>
                <input
                  type="text"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Jumlah Bay
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={baysCount}
                    onChange={(e) => setBaysCount(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Jumlah Row
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={rowsCount}
                    onChange={(e) => setRowsCount(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                    Max Tier
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={maxTiers}
                    onChange={(e) => setMaxTiers(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Master Blok</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
