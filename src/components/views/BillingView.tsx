/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Billing & Tariff Engine: THC, Storage Demurrage, Lo-Lo, Invoices & Receipt Generation
 */

import React, { useState } from 'react';
import { 
  TOSDatabaseState, 
  OperationalInvoice 
} from '../../types/tos';
import { dbService } from '../../services/db';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  DollarSign, 
  Receipt, 
  Building2, 
  X, 
  Check,
  TrendingUp
} from 'lucide-react';

interface BillingViewProps {
  data: TOSDatabaseState;
  onRefresh: () => void;
  onNotify: (title: string, message: string, cat?: 'billing') => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  data,
  onRefresh,
  onNotify,
}) => {
  const { invoices, shippingLines } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<OperationalInvoice | null>(null);

  // New Invoice Form State
  const [customerName, setCustomerName] = useState('PT Samudera Logistik Nusantara');
  const [shippingLine, setShippingLine] = useState('Maersk Line');
  const [containerNumber, setContainerNumber] = useState('MSKU9284710');
  const [thcType, setThcType] = useState<'20ft' | '40ft' | 'reefer'>('40ft');
  const [dwellDays, setDwellDays] = useState<number>(3);
  const [includeLolo, setIncludeLolo] = useState<boolean>(true);
  const [includeReeferMonitoring, setIncludeReeferMonitoring] = useState<boolean>(false);

  const filtered = invoices.filter(inv => {
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (searchTerm) {
      const match = 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.containerNumber.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const totalPaidRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + i.grandTotal, 0);

  const totalUnpaidReceivables = invoices
    .filter(i => i.status !== 'paid')
    .reduce((acc, i) => acc + i.grandTotal, 0);

  const handleTogglePaymentStatus = (inv: OperationalInvoice) => {
    const nextStatus = inv.status === 'paid' ? 'unpaid' : 'paid';
    dbService.updateInvoice(inv.id, {
      status: nextStatus,
      paidAt: nextStatus === 'paid' ? new Date().toISOString() : undefined,
      paymentMethod: nextStatus === 'paid' ? 'virtual_account' : undefined,
    });
    onRefresh();
    onNotify(
      'Status Pembayaran Diperbarui',
      `Faktur ${inv.invoiceNumber} ditandai sebagai: ${nextStatus.toUpperCase()}.`,
      'billing'
    );
  };

  const handleDeleteInvoice = (id: string, invNum: string) => {
    if (window.confirm(`Yakin ingin menghapus faktur ${invNum}?`)) {
      dbService.deleteInvoice(id);
      onRefresh();
      onNotify('Faktur Dihapus', `Faktur ${invNum} berhasil dihapus.`, 'billing');
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    const items = [];
    let subtotal = 0;

    // THC rate
    const thcPrice = thcType === '20ft' ? 1250000 : thcType === 'reefer' ? 1450000 : 1650000;
    items.push({
      description: `Terminal Handling Charges (THC) ${thcType.toUpperCase()}`,
      quantity: 1,
      unitPrice: thcPrice,
      totalAmount: thcPrice,
    });
    subtotal += thcPrice;

    // Lo-Lo rate
    if (includeLolo) {
      const loloPrice = thcType === '20ft' ? 320000 : 425000;
      items.push({
        description: `Lift On / Lift Off (Lo-Lo) Service ${thcType === '20ft' ? '20ft' : '40ft'}`,
        quantity: 1,
        unitPrice: loloPrice,
        totalAmount: loloPrice,
      });
      subtotal += loloPrice;
    }

    // Storage demurrage (Free 2 days, next days charged)
    const chargeableDays = Math.max(0, dwellDays - 2);
    if (chargeableDays > 0) {
      const storageRate = 160000;
      const storageTotal = chargeableDays * storageRate;
      items.push({
        description: `Yard Storage Demurrage (${chargeableDays} hari melebihi batas bebas)`,
        quantity: chargeableDays,
        unitPrice: storageRate,
        totalAmount: storageTotal,
      });
      subtotal += storageTotal;
    }

    // Reefer plug charge
    if (includeReeferMonitoring) {
      const reeferRate = 550000;
      items.push({
        description: 'Reefer Power Plug & Temperature Monitoring (24 Jam)',
        quantity: 1,
        unitPrice: reeferRate,
        totalAmount: reeferRate,
      });
      subtotal += reeferRate;
    }

    // Gate entry admin fee
    items.push({
      description: 'Automated Gate Entry Administration Fee',
      quantity: 1,
      unitPrice: 75000,
      totalAmount: 75000,
    });
    subtotal += 75000;

    const ppn = Math.round(subtotal * 0.11);
    const grandTotal = subtotal + ppn;

    const newInv = dbService.addInvoice({
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      customerName,
      shippingLine,
      containerNumber: containerNumber.toUpperCase(),
      serviceItems: items,
      subtotal,
      taxPpn: ppn,
      grandTotal,
      status: 'unpaid',
    });

    setIsModalOpen(false);
    onRefresh();
    setSelectedInvoice(newInv);
    onNotify('Faktur Tagihan Terbit', `Faktur ${newInv.invoiceNumber} terbit senilai Rp ${grandTotal.toLocaleString('id-ID')}.`, 'billing');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Billing & Tagihan Tarif Operasional Terminal
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Penghitungan otomatis THC (Terminal Handling Charges), storage demurrage inap gudang, Lo-Lo, dan penerbitan faktur pajak resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Faktur Tagihan Baru (CRUD Create)</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Pendapatan Terbayar</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-xl md:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              Rp {totalPaidRevenue.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Lunas via Virtual Account & H2H Bank
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Piutang Menunggu Pembayaran</span>
            <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-xl md:text-2xl font-bold font-mono text-amber-400 tabular-nums">
              Rp {totalUnpaidReceivables.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Jatuh tempo dalam 7 hari kerja
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tarif Resmi THC KICT</span>
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2 space-y-0.5 text-xs font-mono">
            <div className="text-slate-300">20ft Dry: <span className="text-purple-300 font-bold">Rp 1.250.000</span></div>
            <div className="text-slate-300">40ft Dry: <span className="text-purple-300 font-bold">Rp 1.650.000</span></div>
          </div>
          <div className="text-[11px] text-slate-400">
            PPN 11% sesuai regulasi perpajakan
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor invoice, customer, nomor kontainer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'paid', 'unpaid'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer border ${
                filterStatus === st
                  ? 'bg-purple-600 border-purple-500 text-white font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'Semua Faktur' : st === 'paid' ? 'Lunas' : 'Belum Lunas'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Nomor Faktur</th>
                <th className="py-3 px-3">Tanggal Terbit</th>
                <th className="py-3 px-3">Pelanggan / Consignee</th>
                <th className="py-3 px-3">Kontainer & Pelayaran</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">PPN 11%</th>
                <th className="py-3 px-3 text-right">Total Tagihan</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi Faktur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan data tagihan.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] tabular-nums text-slate-400">
                        {inv.issueDate}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {inv.customerName}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="text-purple-300 font-bold block">{inv.containerNumber}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{inv.shippingLine}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                        Rp {inv.subtotal.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">
                        Rp {inv.taxPpn.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-400 text-sm">
                        Rp {inv.grandTotal.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isPaid
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        }`}>
                          {isPaid ? 'Lunas' : 'Belum Bayar'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleTogglePaymentStatus(inv)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                              isPaid
                                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                : 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                            }`}
                            title={isPaid ? 'Tandai Belum Lunas' : 'Konfirmasi Pelunasan (Bayar)'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/60 border border-purple-500/40 text-purple-300 hover:text-white transition-colors cursor-pointer"
                            title="Cetak Faktur Pajak & Tagihan"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                            title="Hapus Faktur (CRUD Delete)"
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

      {/* New Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-slate-900 border border-purple-800/50 rounded-2xl shadow-2xl p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Penerbitan Faktur Tagihan Operasional (Invoicing)
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                  Nama Perusahaan / Pelanggan (Consignee)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Shipping Line
                  </label>
                  <select
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  >
                    {shippingLines.map(sl => (
                      <option key={sl} value={sl}>{sl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Nomor Kontainer
                  </label>
                  <input
                    type="text"
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Service packages */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-purple-300 block text-xs">Komponen Layanan Terminal:</span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Kategori THC</label>
                    <select
                      value={thcType}
                      onChange={(e) => setThcType(e.target.value as typeof thcType)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200"
                    >
                      <option value="20ft">20ft Dry (Rp 1.250.000)</option>
                      <option value="40ft">40ft Dry (Rp 1.650.000)</option>
                      <option value="reefer">20/40ft Reefer (Rp 1.450.000)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Masa Inap Yard (Hari)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={dwellDays}
                      onChange={(e) => setDwellDays(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeLolo}
                      onChange={(e) => setIncludeLolo(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-purple-600"
                    />
                    <span>Termasuk Jasa Lift On / Lift Off (Lo-Lo)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeReeferMonitoring}
                      onChange={(e) => setIncludeReeferMonitoring(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-purple-600"
                    />
                    <span>Termasuk Jasa Monitoring & Colokan Listrik Reefer (24 Jam)</span>
                  </label>
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
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Kalkulasi & Terbitkan Faktur (CRUD Create)</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Printable Invoice Modal with Official Receipt Format */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-purple-800">
            
            {/* Header */}
            <div className="border-b-2 border-purple-900 pb-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-900">
                  KEBUMEN INTERNATIONAL CONTAINER TERMINAL (KICT)
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  FAKTUR OPERASIONAL & BUKTI BAYAR
                </h3>
                <p className="text-[10px] text-slate-600">
                  Terminal Handling & Storage Charges Invoice · NPWP: 01.992.812.4-522.000
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-black text-purple-950">
                  {selectedInvoice.invoiceNumber}
                </div>
                <div className="text-[10px] text-slate-500">
                  Tanggal: {selectedInvoice.issueDate}
                </div>
              </div>
            </div>

            {/* Customer & Container Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Tagihan Ditujukan Kepada:</span>
                <span className="font-bold text-slate-900 text-sm block">{selectedInvoice.customerName}</span>
                <span className="text-slate-600 text-[11px]">Mitra Logistik Pelayaran: {selectedInvoice.shippingLine}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Peti Kemas Terkait:</span>
                <span className="font-mono font-black text-purple-900 text-sm block">{selectedInvoice.containerNumber}</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                  selectedInvoice.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  STATUS: {selectedInvoice.status === 'paid' ? 'LUNAS (PAID)' : 'BELUM DIBAYAR (UNPAID)'}
                </span>
              </div>
            </div>

            {/* Service Items Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2.5">Rincian Jasa Terminal</th>
                    <th className="p-2.5 text-center">Vol</th>
                    <th className="p-2.5 text-right">Tarif Satuan</th>
                    <th className="p-2.5 text-right">Jumlah Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.serviceItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 text-slate-800">{item.description}</td>
                      <td className="p-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono text-slate-600">Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                      <td className="p-2.5 text-right font-mono font-semibold text-slate-900">Rp {item.totalAmount.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-4 text-xs font-mono">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>Rp {selectedInvoice.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PPN (11%):</span>
                  <span>Rp {selectedInvoice.taxPpn.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-base font-black text-purple-950 pt-2 border-t-2 border-slate-300">
                  <span>Total Tagihan:</span>
                  <span>Rp {selectedInvoice.grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Payment details */}
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 mb-4 flex items-center justify-between">
              <div>
                <span className="font-bold block">Metode Pembayaran Online:</span>
                <span className="text-[11px] text-slate-600">Mandiri / BCA Virtual Account: 88102-9918-2041</span>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-500">
                Batas Waktu: {selectedInvoice.dueDate}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Faktur PDF Resmi</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
