/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Reports & Analytics View: Auto Export to Excel (.xlsx) and Formal PDF Documents
 */

import React, { useState } from 'react';
import { 
  TOSDatabaseState, 
  GateLog, 
  ContainerItem, 
  VesselBerth, 
  OperationalInvoice 
} from '../../types/tos';
import { exportToExcel, exportToPdfDocument } from '../../services/exportService';
import { 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  Layers, 
  Truck, 
  Ship, 
  CreditCard 
} from 'lucide-react';

interface ReportsViewProps {
  data: TOSDatabaseState;
  onNotify: (title: string, message: string, cat?: 'system') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  data,
  onNotify,
}) => {
  const { gateLogs, containers, vessels, invoices, metrics } = data;
  const [selectedReport, setSelectedReport] = useState<'gate' | 'yard' | 'vessel' | 'billing'>('gate');
  const [dateFilter, setDateFilter] = useState('2026-09-28');

  // --- 1. Export Gate Report ---
  const handleExportGateExcel = () => {
    exportToExcel<GateLog>(
      gateLogs,
      [
        { header: 'No. Tiket', accessor: (i: GateLog) => i.ticketNumber, width: 22 },
        { header: 'Arah', accessor: (i: GateLog) => (i.direction === 'gate_in' ? 'Gate In' : 'Gate Out'), width: 12 },
        { header: 'Jalur', accessor: (i: GateLog) => i.lane, width: 24 },
        { header: 'Plat Truk', accessor: (i: GateLog) => i.truckPlate, width: 14 },
        { header: 'Supir', accessor: (i: GateLog) => i.driverName, width: 20 },
        { header: 'No. Peti Kemas', accessor: (i: GateLog) => i.containerNumber, width: 16 },
        { header: 'Ukuran', accessor: (i: GateLog) => i.containerSize, width: 10 },
        { header: 'Tipe', accessor: (i: GateLog) => i.containerType, width: 12 },
        { header: 'No. Segel', accessor: (i: GateLog) => i.sealNumber, width: 16 },
        { header: 'Gross (Kg)', accessor: (i: GateLog) => i.weighbridgeGrossKg, width: 14 },
        { header: 'Netto (Kg)', accessor: (i: GateLog) => i.netWeightKg, width: 14 },
        { header: 'Slot Yard', accessor: (i: GateLog) => i.assignedYardSlot, width: 14 },
        { header: 'Waktu', accessor: (i: GateLog) => i.timestamp, width: 22 },
      ],
      'KICT_Laporan_Gerbang_Gate_Throughput'
    );
    onNotify('Ekspor Excel Berhasil', 'File KICT_Laporan_Gerbang_Gate_Throughput.xlsx berhasil diunduh.', 'system');
  };

  const handleExportGatePdf = () => {
    const headers = ['No. Tiket', 'Arah', 'Plat Truk', 'No. Kontainer', 'Ukuran', 'Gross (Kg)', 'Slot Yard'];
    const rows = gateLogs.map((l: GateLog) => [
      l.ticketNumber,
      l.direction === 'gate_in' ? 'In' : 'Out',
      l.truckPlate,
      l.containerNumber,
      l.containerSize,
      l.weighbridgeGrossKg.toLocaleString(),
      l.assignedYardSlot,
    ]);
    exportToPdfDocument(
      'Laporan Operasional Arus Gerbang Peti Kemas (Gate System)',
      `Periode: ${dateFilter} · Total Transaksi: ${gateLogs.length} Armada`,
      headers,
      rows,
      'KICT_Laporan_Gate_Pass'
    );
    onNotify('Ekspor PDF Berhasil', 'Dokumen PDF Laporan Gerbang resmi KICT berhasil dibuat.', 'system');
  };

  // --- 2. Export Yard Report ---
  const handleExportYardExcel = () => {
    exportToExcel<ContainerItem>(
      containers,
      [
        { header: 'No. Kontainer', accessor: (c: ContainerItem) => c.containerNumber, width: 18 },
        { header: 'Ukuran', accessor: (c: ContainerItem) => c.size, width: 10 },
        { header: 'Tipe', accessor: (c: ContainerItem) => c.type, width: 12 },
        { header: 'Kode ISO', accessor: (c: ContainerItem) => c.isoCode, width: 12 },
        { header: 'Pelayaran', accessor: (c: ContainerItem) => c.shippingLine, width: 22 },
        { header: 'Gross (Kg)', accessor: (c: ContainerItem) => c.weightGrossKg, width: 14 },
        { header: 'Blok', accessor: (c: ContainerItem) => c.yardLocation?.block || '-', width: 8 },
        { header: 'Bay', accessor: (c: ContainerItem) => c.yardLocation?.bay || 0, width: 8 },
        { header: 'Row', accessor: (c: ContainerItem) => c.yardLocation?.row || 0, width: 8 },
        { header: 'Tier', accessor: (c: ContainerItem) => c.yardLocation?.tier || 0, width: 8 },
        { header: 'Dwell (Hari)', accessor: (c: ContainerItem) => c.dwellDays, width: 12 },
        { header: 'Tujuan Akhir', accessor: (c: ContainerItem) => c.finalDestination, width: 24 },
      ],
      'KICT_Laporan_Inventori_Yard_Stacking'
    );
    onNotify('Ekspor Excel Berhasil', 'File KICT_Laporan_Inventori_Yard_Stacking.xlsx berhasil diunduh.', 'system');
  };

  const handleExportYardPdf = () => {
    const headers = ['Kontainer', 'Ukuran', 'Tipe', 'Pelayaran', 'Gross', 'Blok-Bay-Row-Tier', 'Dwell'];
    const rows = containers.map((c: ContainerItem) => [
      c.containerNumber,
      c.size,
      c.type,
      c.shippingLine,
      `${(c.weightGrossKg / 1000).toFixed(1)}T`,
      `${c.yardLocation?.block || 'A'}-${c.yardLocation?.bay || 1}-${c.yardLocation?.row || 1}-${c.yardLocation?.tier || 1}`,
      `${c.dwellDays} Hari`,
    ]);
    exportToPdfDocument(
      'Laporan Inventori Penataan Lapangan Peti Kemas (Yard Stacking)',
      `Status Utilisasi: ${metrics.yardOccupancyRatePercent}% · Total Kontainer: ${containers.length} Box`,
      headers,
      rows,
      'KICT_Laporan_Yard_Inventory'
    );
    onNotify('Ekspor PDF Berhasil', 'Dokumen PDF Laporan Yard resmi KICT berhasil dibuat.', 'system');
  };

  // --- 3. Export Vessel Report ---
  const handleExportVesselExcel = () => {
    exportToExcel<VesselBerth>(
      vessels,
      [
        { header: 'Nama Kapal', accessor: (v: VesselBerth) => v.vesselName, width: 24 },
        { header: 'Call Sign', accessor: (v: VesselBerth) => v.callSign, width: 12 },
        { header: 'Pelayaran', accessor: (v: VesselBerth) => v.shippingLine, width: 20 },
        { header: 'Dermaga', accessor: (v: VesselBerth) => v.berthLocation, width: 24 },
        { header: 'Status', accessor: (v: VesselBerth) => v.status, width: 14 },
        { header: 'Bongkar (TEU)', accessor: (v: VesselBerth) => `${v.dischargedTeus}/${v.totalDischargeTeus}`, width: 16 },
        { header: 'Muat (TEU)', accessor: (v: VesselBerth) => `${v.loadedTeus}/${v.totalLoadTeus}`, width: 16 },
        { header: 'BCH Aktual', accessor: (v: VesselBerth) => v.currentBch, width: 12 },
        { header: 'Crane Gang', accessor: (v: VesselBerth) => v.assignedCranes.join(', '), width: 18 },
      ],
      'KICT_Laporan_Bongkar_Muat_Kapal_Stevedoring'
    );
    onNotify('Ekspor Excel Berhasil', 'File KICT_Laporan_Bongkar_Muat_Kapal_Stevedoring.xlsx berhasil diunduh.', 'system');
  };

  const handleExportVesselPdf = () => {
    const headers = ['Nama Kapal', 'Pelayaran', 'Dermaga', 'Status', 'Bongkar', 'Muat', 'BCH Real'];
    const rows = vessels.map((v: VesselBerth) => [
      v.vesselName,
      v.shippingLine,
      v.berthLocation.split(' ')[0] + ' ' + v.berthLocation.split(' ')[1],
      v.status,
      `${v.dischargedTeus}/${v.totalDischargeTeus}`,
      `${v.loadedTeus}/${v.totalLoadTeus}`,
      `${v.currentBch} m/h`,
    ]);
    exportToPdfDocument(
      'Laporan Stevedoring & Produktivitas Dermaga Kapal (BCH Report)',
      `Target BCH: > 28 moves/jam · Realisasi: ${metrics.bchCurrent} moves/jam`,
      headers,
      rows,
      'KICT_Laporan_Vessel_Stevedoring'
    );
    onNotify('Ekspor PDF Berhasil', 'Dokumen PDF Laporan Stevedoring resmi KICT berhasil dibuat.', 'system');
  };

  // --- 4. Export Billing Report ---
  const handleExportBillingExcel = () => {
    exportToExcel<OperationalInvoice>(
      invoices,
      [
        { header: 'Nomor Faktur', accessor: (i: OperationalInvoice) => i.invoiceNumber, width: 24 },
        { header: 'Tanggal', accessor: (i: OperationalInvoice) => i.issueDate, width: 14 },
        { header: 'Pelanggan', accessor: (i: OperationalInvoice) => i.customerName, width: 26 },
        { header: 'No. Kontainer', accessor: (i: OperationalInvoice) => i.containerNumber, width: 16 },
        { header: 'Pelayaran', accessor: (i: OperationalInvoice) => i.shippingLine, width: 20 },
        { header: 'Subtotal (Rp)', accessor: (i: OperationalInvoice) => i.subtotal, width: 16 },
        { header: 'PPN 11% (Rp)', accessor: (i: OperationalInvoice) => i.taxPpn, width: 16 },
        { header: 'Total (Rp)', accessor: (i: OperationalInvoice) => i.grandTotal, width: 18 },
        { header: 'Status', accessor: (i: OperationalInvoice) => (i.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'), width: 14 },
      ],
      'KICT_Laporan_Keuangan_Pendapatan_Billing'
    );
    onNotify('Ekspor Excel Berhasil', 'File KICT_Laporan_Keuangan_Pendapatan_Billing.xlsx berhasil diunduh.', 'system');
  };

  const handleExportBillingPdf = () => {
    const headers = ['Nomor Faktur', 'Tanggal', 'Pelanggan', 'Kontainer', 'Total Tagihan', 'Status'];
    const rows = invoices.map((i: OperationalInvoice) => [
      i.invoiceNumber,
      i.issueDate,
      i.customerName,
      i.containerNumber,
      `Rp ${i.grandTotal.toLocaleString('id-ID')}`,
      i.status.toUpperCase(),
    ]);
    exportToPdfDocument(
      'Laporan Rekapitulasi Pendapatan Operasional & Faktur Tagihan',
      `Total Terbayar: Rp ${invoices.filter((i: OperationalInvoice) => i.status === 'paid').reduce((a: number, b: OperationalInvoice) => a + b.grandTotal, 0).toLocaleString('id-ID')}`,
      headers,
      rows,
      'KICT_Laporan_Billing_Invoices'
    );
    onNotify('Ekspor PDF Berhasil', 'Dokumen PDF Laporan Finansial resmi KICT berhasil dibuat.', 'system');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Pusat Laporan & Ekspor Otomatis (Excel .xlsx & PDF)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Dukungan ekspor data instan berstandar pelabuhan internasional. Unduh spreadsheet tabel penuh atau cetak dokumen resmi ber-kop KICT.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-purple-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono"
          />
        </div>
      </div>

      {/* 4 Report Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gate */}
        <div 
          onClick={() => setSelectedReport('gate')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedReport === 'gate'
              ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-purple-800/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Laporan Arus Gerbang</span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Pencatatan truk masuk/keluar, plat nomor OCR, timbangan, dan slot yard.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-purple-300 font-mono">
            {gateLogs.length} Data Transaksi
          </div>
        </div>

        {/* Card 2: Yard */}
        <div 
          onClick={() => setSelectedReport('yard')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedReport === 'yard'
              ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-purple-800/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Laporan Utilisasi Yard</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Inventori penumpukan peti kemas, klasifikasi ISO, dwell time, dan blok yard.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-purple-300 font-mono">
            {containers.length} Peti Kemas Aktif
          </div>
        </div>

        {/* Card 3: Vessel */}
        <div 
          onClick={() => setSelectedReport('vessel')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedReport === 'vessel'
              ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-purple-800/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Laporan Bongkar Muat</span>
              <Ship className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Produktivitas stevedoring, alokasi crane gang, realisasi BCH kapal bersandar.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-cyan-300 font-mono">
            {vessels.length} Kapal Terdaftar
          </div>
        </div>

        {/* Card 4: Billing */}
        <div 
          onClick={() => setSelectedReport('billing')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedReport === 'billing'
              ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-purple-800/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Laporan Rekapitulasi Billing</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Pendapatan THC, demurrage inap penumpukan, Lo-Lo, dan penerbitan faktur pajak.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-amber-300 font-mono">
            {invoices.length} Faktur Pajak
          </div>
        </div>

      </div>

      {/* Selected Report Action & Preview Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-xl space-y-6">
        
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              {selectedReport === 'gate' && 'Laporan Arus Gerbang Peti Kemas (Gate System Throughput)'}
              {selectedReport === 'yard' && 'Laporan Inventori & Alokasi Penumpukan Yard (Bay-Row-Tier)'}
              {selectedReport === 'vessel' && 'Laporan Bongkar Muat Stevedoring & Produktivitas BCH Kapal'}
              {selectedReport === 'billing' && 'Laporan Rekapitulasi Tagihan Operasional & Faktur Pajak KICT'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih format ekspor yang diinginkan untuk mengunduh laporan secara instan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Excel Button */}
            <button
              onClick={() => {
                if (selectedReport === 'gate') handleExportGateExcel();
                else if (selectedReport === 'yard') handleExportYardExcel();
                else if (selectedReport === 'vessel') handleExportVesselExcel();
                else handleExportBillingExcel();
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-emerald-950 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor ke Excel (.xlsx)</span>
            </button>

            {/* PDF Button */}
            <button
              onClick={() => {
                if (selectedReport === 'gate') handleExportGatePdf();
                else if (selectedReport === 'yard') handleExportYardPdf();
                else if (selectedReport === 'vessel') handleExportVesselPdf();
                else handleExportBillingPdf();
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-purple-950 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Ekspor PDF Resmi</span>
            </button>
          </div>
        </div>

        {/* Live Table Preview */}
        <div className="rounded-xl border border-slate-800 overflow-x-auto">
          {selectedReport === 'gate' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">No. Tiket</th>
                  <th className="p-3">Arah</th>
                  <th className="p-3">Plat Truk</th>
                  <th className="p-3">No. Kontainer</th>
                  <th className="p-3">Ukuran</th>
                  <th className="p-3 text-right">Gross (Kg)</th>
                  <th className="p-3">Slot Yard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {gateLogs.map((l: GateLog) => (
                  <tr key={l.id}>
                    <td className="p-3 font-mono font-bold text-purple-300">{l.ticketNumber}</td>
                    <td className="p-3 capitalize">{l.direction.replace('_', ' ')}</td>
                    <td className="p-3 font-mono font-bold text-white">{l.truckPlate}</td>
                    <td className="p-3 font-mono">{l.containerNumber}</td>
                    <td className="p-3">{l.containerSize}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{l.weighbridgeGrossKg.toLocaleString()}</td>
                    <td className="p-3 font-mono text-purple-300">{l.assignedYardSlot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'yard' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">No. Kontainer</th>
                  <th className="p-3">Ukuran & Tipe</th>
                  <th className="p-3">Shipping Line</th>
                  <th className="p-3">Koordinat (Blok-Bay-Row-Tier)</th>
                  <th className="p-3 text-right">Berat (Kg)</th>
                  <th className="p-3 text-center">Dwell Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {containers.map((c: ContainerItem) => (
                  <tr key={c.id}>
                    <td className="p-3 font-mono font-bold text-white">{c.containerNumber}</td>
                    <td className="p-3">{c.size} · {c.type}</td>
                    <td className="p-3">{c.shippingLine}</td>
                    <td className="p-3 font-mono text-purple-300 font-bold">
                      Blok {c.yardLocation?.block}-{c.yardLocation?.bay}-{c.yardLocation?.row}-{c.yardLocation?.tier}
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums">{c.weightGrossKg.toLocaleString()}</td>
                    <td className="p-3 text-center font-mono text-amber-400">{c.dwellDays} Hari</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'vessel' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Nama Kapal</th>
                  <th className="p-3">Call Sign</th>
                  <th className="p-3">Pelayaran</th>
                  <th className="p-3">Dermaga</th>
                  <th className="p-3 text-right">Realisasi Bongkar</th>
                  <th className="p-3 text-right">Realisasi Muat</th>
                  <th className="p-3 text-right">BCH Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {vessels.map((v: VesselBerth) => (
                  <tr key={v.id}>
                    <td className="p-3 font-bold text-white">{v.vesselName}</td>
                    <td className="p-3 font-mono text-purple-300">{v.callSign}</td>
                    <td className="p-3">{v.shippingLine}</td>
                    <td className="p-3">{v.berthLocation}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{v.dischargedTeus} / {v.totalDischargeTeus}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{v.loadedTeus} / {v.totalLoadTeus}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">{v.currentBch} m/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'billing' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">No. Faktur</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Kontainer</th>
                  <th className="p-3 text-right">Subtotal</th>
                  <th className="p-3 text-right">Total Tagihan</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {invoices.map((i: OperationalInvoice) => (
                  <tr key={i.id}>
                    <td className="p-3 font-mono font-bold text-purple-300">{i.invoiceNumber}</td>
                    <td className="p-3 font-mono text-[11px]">{i.issueDate}</td>
                    <td className="p-3 font-semibold text-white">{i.customerName}</td>
                    <td className="p-3 font-mono">{i.containerNumber}</td>
                    <td className="p-3 text-right font-mono">Rp {i.subtotal.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">Rp {i.grandTotal.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        i.status === 'paid' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
};
