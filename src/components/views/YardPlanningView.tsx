/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Yard Planning View: 2D Interactive Container Stacking Map (Bay, Row, Tier) & Management
 */

import React, { useState } from 'react';
import { 
  TOSDatabaseState, 
  ContainerItem, 
  YardBlock, 
  ContainerSize, 
  ContainerType, 
  ContainerStatus 
} from '../../types/tos';
import { dbService } from '../../services/db';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Move, 
  Filter, 
  X, 
  Check, 
  Thermometer, 
  AlertOctagon, 
  Anchor, 
  Maximize2,
  Boxes,
  Info
} from 'lucide-react';

interface YardPlanningViewProps {
  data: TOSDatabaseState;
  onRefresh: () => void;
  onNotify: (title: string, message: string, cat?: 'yard') => void;
}

export const YardPlanningView: React.FC<YardPlanningViewProps> = ({
  data,
  onRefresh,
  onNotify,
}) => {
  const { blocks, containers, shippingLines } = data;

  const [selectedBlockCode, setSelectedBlockCode] = useState<string>('A');
  const [selectedBay, setSelectedBay] = useState<number>(2);
  const [filterLine, setFilterLine] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [containerSearch, setContainerSearch] = useState<string>('');
  const [highlightedContainerId, setHighlightedContainerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cross_section' | 'stacked_3d'>('cross_section');

  // Quick container search & auto locate
  const handleQuickLocate = (query: string) => {
    setContainerSearch(query);
    if (!query.trim()) {
      setHighlightedContainerId(null);
      return;
    }
    const found = containers.find((c: ContainerItem) => 
      c.containerNumber.toLowerCase().includes(query.toLowerCase())
    );
    if (found && found.yardLocation) {
      setSelectedBlockCode(found.yardLocation.block);
      setSelectedBay(found.yardLocation.bay);
      setHighlightedContainerId(found.id);
      onNotify(
        'Kontainer Ditemukan!',
        `Kontainer ${found.containerNumber} berada di Blok ${found.yardLocation.block}, Bay ${found.yardLocation.bay}, Row ${found.yardLocation.row}, Tier ${found.yardLocation.tier}.`,
        'yard'
      );
    }
  };

  // Selected container for detail modal / relocation / edit
  const [selectedContainer, setSelectedContainer] = useState<ContainerItem | null>(null);
  const [isRelocating, setIsRelocating] = useState<boolean>(false);
  const [isEditingContainer, setIsEditingContainer] = useState<boolean>(false);
  const [targetBlock, setTargetBlock] = useState<string>('A');
  const [targetBay, setTargetBay] = useState<number>(2);
  const [targetRow, setTargetRow] = useState<number>(1);
  const [targetTier, setTargetTier] = useState<number>(1);

  // Edit fields
  const [editNum, setEditNum] = useState<string>('');
  const [editLine, setEditLine] = useState<string>('');
  const [editWeight, setEditWeight] = useState<number>(0);
  const [editSeal, setEditSeal] = useState<string>('');
  const [editConsignee, setEditConsignee] = useState<string>('');
  const [editDwell, setEditDwell] = useState<number>(0);
  const [editSize, setEditSize] = useState<ContainerSize>('40ft');
  const [editType, setEditType] = useState<ContainerType>('dry');
  const [editTemp, setEditTemp] = useState<number>(-18.0);
  const [editHazard, setEditHazard] = useState<string>('');

  const handleStartEdit = (c: ContainerItem) => {
    setEditNum(c.containerNumber);
    setEditLine(c.shippingLine);
    setEditWeight(c.weightGrossKg);
    setEditSeal(c.sealNumber);
    setEditConsignee(c.consignee);
    setEditDwell(c.dwellDays);
    setEditSize(c.size);
    setEditType(c.type);
    setEditTemp(c.temperatureCelsius ?? -18.0);
    setEditHazard(c.hazardClass ?? 'IMO Class 3');
    setIsEditingContainer(true);
    setIsRelocating(false);
  };

  const handleSaveContainerEdit = () => {
    if (!selectedContainer) return;
    const updated = dbService.updateContainer(selectedContainer.id, {
      containerNumber: editNum.toUpperCase(),
      shippingLine: editLine,
      weightGrossKg: Number(editWeight),
      sealNumber: editSeal,
      consignee: editConsignee,
      dwellDays: Number(editDwell),
      size: editSize,
      type: editType,
      temperatureCelsius: editType === 'reefer' ? Number(editTemp) : undefined,
      hazardClass: editType === 'hazardous_dg' ? editHazard : undefined,
    });
    if (updated) {
      setSelectedContainer(updated);
    }
    setIsEditingContainer(false);
    onRefresh();
    onNotify('Data Kontainer Diperbarui', `Spesifikasi ${editNum.toUpperCase()} berhasil disimpan (CRUD Update).`, 'yard');
  };

  // New Container Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newContainerNum, setNewContainerNum] = useState<string>('');
  const [newSize, setNewSize] = useState<ContainerSize>('40ft');
  const [newType, setNewType] = useState<ContainerType>('dry');
  const [newLine, setNewLine] = useState<string>('Maersk Line');
  const [newWeight, setNewWeight] = useState<number>(26500);
  const [newSeal, setNewSeal] = useState<string>('SL-881290');
  const [newConsignee, setNewConsignee] = useState<string>('PT Kargo Sentosa');
  const [newRow, setNewRow] = useState<number>(1);
  const [newTier, setNewTier] = useState<number>(1);
  const [newReeferTemp, setNewReeferTemp] = useState<number>(-18.0);
  const [newDgClass, setNewDgClass] = useState<string>('IMO Class 3 (Flammable Liquid)');

  const currentBlock = blocks.find((b: YardBlock) => b.code === selectedBlockCode) || blocks[0];

  // Filter containers in current block
  const blockContainers = containers.filter((c: ContainerItem) => {
    if (!c.yardLocation) return false;
    if (c.yardLocation.block !== selectedBlockCode) return false;
    if (filterLine !== 'all' && c.shippingLine !== filterLine) return false;
    if (filterType !== 'all' && c.type !== filterType) return false;
    return true;
  });

  const handleSelectContainer = (container: ContainerItem) => {
    setSelectedContainer(container);
    setIsRelocating(false);
  };

  const handleDeleteContainer = (id: string, number: string) => {
    if (window.confirm(`Yakin ingin menghapus kontainer ${number} dari sistem yard?`)) {
      dbService.deleteContainer(id);
      setSelectedContainer(null);
      onRefresh();
      onNotify('Kontainer Dihapus', `Kontainer ${number} berhasil dihapus dari slot yard.`, 'yard');
    }
  };

  const handleSaveRelocation = () => {
    if (!selectedContainer) return;
    dbService.updateContainer(selectedContainer.id, {
      yardLocation: {
        block: targetBlock,
        bay: targetBay,
        row: targetRow,
        tier: targetTier,
      }
    });
    setIsRelocating(false);
    setSelectedContainer(null);
    onRefresh();
    onNotify(
      'Relokasi Kontainer Berhasil',
      `Kontainer ${selectedContainer.containerNumber} dipindahkan ke Blok ${targetBlock}-Bay ${targetBay}-Row ${targetRow}-Tier ${targetTier}.`,
      'yard'
    );
  };

  const handleCreateContainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContainerNum) return;

    dbService.addContainer({
      containerNumber: newContainerNum.toUpperCase(),
      size: newSize,
      type: newType,
      isoCode: newSize === '20ft' ? (newType === 'reefer' ? '22R1' : '22G1') : (newType === 'reefer' ? '45R1' : '42G1'),
      weightGrossKg: Number(newWeight),
      tareWeightKg: newSize === '20ft' ? 2200 : 3800,
      payloadKg: Number(newWeight) - (newSize === '20ft' ? 2200 : 3800),
      sealNumber: newSeal,
      shippingLine: newLine,
      owner: newLine,
      consignee: newConsignee,
      status: 'yard_stacked',
      yardLocation: {
        block: selectedBlockCode,
        bay: selectedBay,
        row: Number(newRow),
        tier: Number(newTier),
      },
      temperatureCelsius: newType === 'reefer' ? newReeferTemp : undefined,
      hazardClass: newType === 'hazardous_dg' ? newDgClass : undefined,
      dischargePort: 'IDKCT',
      loadingPort: 'IDKCT Yard Desk',
      finalDestination: 'Gudang Logistik Konsinyasi',
      dwellDays: 0,
    });

    setIsAddModalOpen(false);
    setNewContainerNum('');
    onRefresh();
    onNotify('Kontainer Baru Ditambahkan', `Kontainer ${newContainerNum.toUpperCase()} dialokasikan di Blok ${selectedBlockCode} Bay ${selectedBay}.`, 'yard');
  };

  const getContainerColor = (c: ContainerItem) => {
    if (c.type === 'reefer') return 'bg-cyan-900/60 border-cyan-500 text-cyan-200';
    if (c.type === 'hazardous_dg') return 'bg-amber-900/60 border-amber-500 text-amber-200';
    if (c.size === '20ft') return 'bg-purple-900/60 border-purple-500 text-purple-200';
    return 'bg-indigo-900/60 border-indigo-500 text-indigo-200';
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Block Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Manajemen Yard Planning & Tata Letak Kontainer
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Pemetaan ruang penumpukan peti kemas (Bay, Row, Tier) terotomasi berstandar ISO 6346.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Alokasikan Kontainer Baru</span>
          </button>
        </div>
      </div>

      {/* Block Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {blocks.map((blk: YardBlock) => {
          const isSelected = blk.code === selectedBlockCode;
          return (
            <button
              key={blk.id}
              onClick={() => {
                setSelectedBlockCode(blk.code);
                setSelectedBay(1);
              }}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                isSelected
                  ? 'bg-purple-600 text-white font-semibold border-purple-500 shadow-md shadow-purple-955'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <span className="font-mono font-bold text-[11px] bg-slate-950/40 px-1.5 py-0.5 rounded">
                Blok {blk.code}
              </span>
              <span>{blk.name.split('-')[1]?.trim() || blk.name}</span>
              <span className="text-[10px] text-purple-200/80">
                ({blk.currentTeus}/{blk.totalCapacityTeus} TEU)
              </span>
            </button>
          );
        })}
      </div>

      {/* Control Filters & Bay Navigation */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Bay Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] mr-1 shrink-0">
            Pilih Bay:
          </span>
          {Array.from({ length: currentBlock.baysCount }, (_, i) => i + 1).map((bayNum) => {
            const hasContainers = containers.some(
              (c: ContainerItem) => c.yardLocation?.block === selectedBlockCode && c.yardLocation?.bay === bayNum
            );
            const isSelected = selectedBay === bayNum;
            return (
              <button
                key={bayNum}
                onClick={() => setSelectedBay(bayNum)}
                className={`w-8 h-8 rounded-lg font-mono font-bold flex items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-purple-600 border-purple-500 text-white shadow-sm ring-1 ring-purple-400'
                    : hasContainers
                    ? 'bg-slate-800 border-purple-900/50 text-purple-300 hover:bg-slate-700'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {String(bayNum).padStart(2, '0')}
              </button>
            );
          })}
        </div>

        {/* Quick Search & Auto Locate Container */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari & Temukan No. ISO..."
              value={containerSearch}
              onChange={(e) => handleQuickLocate(e.target.value)}
              className="w-48 pl-3 pr-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {containerSearch && (
              <button 
                onClick={() => { setContainerSearch(''); setHighlightedContainerId(null); }}
                className="absolute right-2 top-1.5 text-slate-500 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterLine}
              onChange={(e) => setFilterLine(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">Semua Pelayaran</option>
              {shippingLines.map((sl: string) => (
                <option key={sl} value={sl}>{sl}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">Semua Tipe Peti Kemas</option>
              <option value="dry">Dry Standard (20/40ft)</option>
              <option value="reefer">Reefer (Pendingin)</option>
              <option value="hazardous_dg">Dangerous Goods (DG)</option>
              <option value="tank">ISO Tank</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2D Interactive Stacking Grid Matrix (Rows x Tiers) */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Potongan Melintang 2D: Blok {selectedBlockCode} — Bay {String(selectedBay).padStart(2, '0')}</span>
              <span className="text-[10px] text-purple-400 font-normal">
                (Kapasitas: {currentBlock.rowsCount} Row × {currentBlock.maxTiers} Tier)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Klik pada kontainer untuk melihat spesifikasi ISO, bobot, status segel, atau melakukan relokasi.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-purple-900/60 border border-purple-500 inline-block" /> 20ft Dry
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-indigo-900/60 border border-indigo-500 inline-block" /> 40ft Dry
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-cyan-900/60 border border-cyan-500 inline-block" /> Reefer
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-900/60 border border-amber-500 inline-block" /> Dangerous Goods
            </span>
          </div>
        </div>

        {/* Matrix Visualization */}
        <div className="min-w-[640px] space-y-2">
          {/* Tiers rendered from top (Tier 5 down to Tier 1) */}
          {Array.from({ length: currentBlock.maxTiers }, (_, tIdx) => {
            const tierNumber = currentBlock.maxTiers - tIdx;
            return (
              <div key={tierNumber} className="flex items-center gap-2">
                {/* Tier Label */}
                <div className="w-14 text-right pr-2 text-xs font-mono font-bold text-slate-500 shrink-0">
                  Tier {tierNumber}
                </div>

                {/* Rows Grid */}
                <div className="flex-1 grid grid-cols-6 gap-2">
                  {Array.from({ length: currentBlock.rowsCount }, (_, rIdx) => {
                    const rowNumber = rIdx + 1;
                    const containerInSlot = containers.find(
                      (c: ContainerItem) =>
                        c.yardLocation?.block === selectedBlockCode &&
                        c.yardLocation?.bay === selectedBay &&
                        c.yardLocation?.row === rowNumber &&
                        c.yardLocation?.tier === tierNumber
                    );

                    if (containerInSlot) {
                      const isHighlighted = highlightedContainerId === containerInSlot.id;
                      return (
                        <div
                          key={rowNumber}
                          onClick={() => handleSelectContainer(containerInSlot)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] shadow-sm relative group ${getContainerColor(
                            containerInSlot
                          )} ${isHighlighted ? 'ring-4 ring-amber-400 border-amber-300 scale-105 shadow-xl animate-pulse z-10' : ''}`}
                        >
                          {isHighlighted && (
                            <span className="absolute -top-2 -right-1 bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full shadow">
                              MATCH!
                            </span>
                          )}
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                            <span className="truncate">{containerInSlot.containerNumber}</span>
                            <span className="text-[9px] uppercase">{containerInSlot.size}</span>
                          </div>
                          <div className="text-[10px] text-slate-300 truncate mt-0.5">
                            {containerInSlot.shippingLine}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                            <span>{(containerInSlot.weightGrossKg / 1000).toFixed(1)} T</span>
                            {containerInSlot.type === 'reefer' && (
                              <span className="text-cyan-300 font-bold">{containerInSlot.temperatureCelsius}°C</span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Empty slot
                    return (
                      <div
                        key={rowNumber}
                        onClick={() => {
                          setNewRow(rowNumber);
                          setNewTier(tierNumber);
                          setIsAddModalOpen(true);
                        }}
                        className="h-16 rounded-lg border border-dashed border-slate-800 bg-slate-950/40 hover:bg-purple-950/20 hover:border-purple-600/40 transition-colors flex flex-col items-center justify-center text-slate-600 hover:text-purple-400 cursor-pointer text-[10px]"
                        title={`Slot Kosong: Row ${rowNumber}, Tier ${tierNumber}. Klik untuk isi kontainer.`}
                      >
                        <span className="font-mono text-[9px] opacity-40">R{rowNumber}-T{tierNumber}</span>
                        <span className="text-[9px] opacity-60">+ Isi Slot</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Row axis labels at bottom */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <div className="w-14 text-right pr-2 text-[10px] text-slate-600 font-mono">Row:</div>
            <div className="flex-1 grid grid-cols-6 gap-2 text-center text-xs font-mono font-bold text-slate-400">
              {Array.from({ length: currentBlock.rowsCount }, (_, rIdx) => (
                <div key={rIdx}>Row {rIdx + 1}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Container Details Modal */}
      {selectedContainer && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-purple-800/50 rounded-2xl shadow-2xl p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  {selectedContainer.containerNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedContainer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Slot location badge */}
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Koordinat Slot Yard</span>
                  <div className="text-sm font-mono font-bold text-purple-300">
                    Blok {selectedContainer.yardLocation?.block} — Bay {selectedContainer.yardLocation?.bay} — Row {selectedContainer.yardLocation?.row} — Tier {selectedContainer.yardLocation?.tier}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(selectedContainer)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Ubah Data (CRUD Edit)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRelocating(true);
                      setIsEditingContainer(false);
                      setTargetBlock(selectedContainer.yardLocation?.block || 'A');
                      setTargetBay(selectedContainer.yardLocation?.bay || 1);
                      setTargetRow(selectedContainer.yardLocation?.row || 1);
                      setTargetTier(selectedContainer.yardLocation?.tier || 1);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Move className="w-3.5 h-3.5" />
                    <span>Relokasi Slot</span>
                  </button>
                </div>
              </div>

              {/* Edit Container Form if triggered */}
              {isEditingContainer && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/70 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Ubah Spesifikasi Peti Kemas (CRUD Update)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingContainer(false)}
                      className="text-slate-500 hover:text-white text-xs"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Nomor Kontainer</label>
                      <input
                        type="text"
                        value={editNum}
                        onChange={(e) => setEditNum(e.target.value.toUpperCase())}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Shipping Line</label>
                      <select
                        value={editLine}
                        onChange={(e) => setEditLine(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                      >
                        {shippingLines.map(sl => <option key={sl} value={sl}>{sl}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Berat Kotor (Gross Kg)</label>
                      <input
                        type="number"
                        value={editWeight}
                        onChange={(e) => setEditWeight(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Nomor Segel (Seal)</label>
                      <input
                        type="text"
                        value={editSeal}
                        onChange={(e) => setEditSeal(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Ukuran</label>
                      <select
                        value={editSize}
                        onChange={(e) => setEditSize(e.target.value as ContainerSize)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                      >
                        <option value="20ft">20ft</option>
                        <option value="40ft">40ft</option>
                        <option value="45ft">45ft</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Tipe Kargo</label>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as ContainerType)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                      >
                        <option value="dry">Dry</option>
                        <option value="reefer">Reefer</option>
                        <option value="hazardous_dg">DG (Hazardous)</option>
                        <option value="tank">Tank</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Konsinyee / Pemilik</label>
                      <input
                        type="text"
                        value={editConsignee}
                        onChange={(e) => setEditConsignee(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Dwell Time (Hari)</label>
                      <input
                        type="number"
                        value={editDwell}
                        onChange={(e) => setEditDwell(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingContainer(false)}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-400 text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveContainerEdit}
                      className="px-4 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan (CRUD Update)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Relocation Form if triggered */}
              {isRelocating && (
                <div className="p-3 rounded-xl bg-slate-950 border border-purple-600/50 space-y-2">
                  <span className="text-xs font-bold text-purple-300 block">Pindahkan ke Slot Baru:</span>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Blok</label>
                      <select
                        value={targetBlock}
                        onChange={(e) => setTargetBlock(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                      >
                        {blocks.map((b: YardBlock) => <option key={b.code} value={b.code}>Blok {b.code}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Bay</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={targetBay}
                        onChange={(e) => setTargetBay(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Row</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={targetRow}
                        onChange={(e) => setTargetRow(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Tier</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={targetTier}
                        onChange={(e) => setTargetTier(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsRelocating(false)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-xs"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveRelocation}
                      className="px-3 py-1 rounded bg-purple-600 text-white font-semibold text-xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Konfirmasi Pindah</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Data Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">UKURAN & TIPE ISO</span>
                  <span className="font-semibold text-slate-200">{selectedContainer.size} · {selectedContainer.type.toUpperCase()} ({selectedContainer.isoCode})</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">OPERATOR PELAYARAN</span>
                  <span className="font-semibold text-slate-200">{selectedContainer.shippingLine}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">BERAT KOTOR (GROSS)</span>
                  <span className="font-mono text-purple-300 font-bold">{selectedContainer.weightGrossKg.toLocaleString()} Kg</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">NOMOR SEGEL RESMI</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedContainer.sealNumber}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">KONSINYEE / PEMILIK</span>
                  <span className="text-slate-200 truncate block">{selectedContainer.consignee}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">MASA INAP (DWELL TIME)</span>
                  <span className="font-mono text-amber-400 font-semibold">{selectedContainer.dwellDays} Hari</span>
                </div>
              </div>

              {selectedContainer.type === 'reefer' && (
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-between text-cyan-200">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-cyan-400" />
                    <span>Suhu Sensor Pendingin:</span>
                  </div>
                  <span className="font-mono font-bold text-sm">{selectedContainer.temperatureCelsius}°C</span>
                </div>
              )}

              {selectedContainer.type === 'hazardous_dg' && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-between text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-amber-400" />
                    <span>Klasifikasi Bahaya IMO:</span>
                  </div>
                  <span className="font-mono font-bold text-xs">{selectedContainer.hazardClass}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => handleDeleteContainer(selectedContainer.id, selectedContainer.containerNumber)}
                className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 border border-red-800/50 text-red-300 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Kontainer (CRUD Delete)</span>
              </button>

              <button
                onClick={() => setSelectedContainer(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Container Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-purple-800/50 rounded-2xl shadow-2xl p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Alokasi Kontainer Baru ke Blok {selectedBlockCode} Bay {selectedBay}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContainer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                  Nomor Kontainer ISO 6346
                </label>
                <input
                  type="text"
                  placeholder="Contoh: MSKU9284710 / MRTU1029482"
                  value={newContainerNum}
                  onChange={(e) => setNewContainerNum(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm uppercase focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Ukuran Kontainer
                  </label>
                  <select
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value as ContainerSize)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="20ft">20 Feet (1 TEU)</option>
                    <option value="40ft">40 Feet (2 TEU)</option>
                    <option value="45ft">45 Feet High Cube</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Tipe Kargo
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ContainerType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="dry">Dry General Cargo</option>
                    <option value="reefer">Reefer (Pendingin)</option>
                    <option value="hazardous_dg">Dangerous Goods (DG)</option>
                    <option value="tank">ISO Tank Liquid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Shipping Line
                  </label>
                  <select
                    value={newLine}
                    onChange={(e) => setNewLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  >
                    {shippingLines.map((sl: string) => (
                      <option key={sl} value={sl}>{sl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Berat Kotor (Kg)
                  </label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Nomor Segel
                  </label>
                  <input
                    type="text"
                    value={newSeal}
                    onChange={(e) => setNewSeal(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Konsinyee / Shipper
                  </label>
                  <input
                    type="text"
                    value={newConsignee}
                    onChange={(e) => setNewConsignee(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Target Row (1 - {currentBlock.rowsCount})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={currentBlock.rowsCount}
                    value={newRow}
                    onChange={(e) => setNewRow(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Target Tier (1 - {currentBlock.maxTiers})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={currentBlock.maxTiers}
                    value={newTier}
                    onChange={(e) => setNewTier(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              {newType === 'reefer' && (
                <div>
                  <label className="block text-cyan-300 font-semibold mb-1 uppercase text-[11px]">
                    Target Temperatur (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newReeferTemp}
                    onChange={(e) => setNewReeferTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-cyan-800 text-cyan-200 font-mono text-xs focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Kontainer ke Yard (CRUD Create)</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
