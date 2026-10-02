/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * System Architecture, Operational Workflow & Priority Matrix Documentation View
 */

import React, { useState } from 'react';
import { 
  Network, 
  X, 
  Workflow, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Radio, 
  Server, 
  Database, 
  Truck, 
  Ship, 
  Layers, 
  CreditCard,
  FileCheck,
  Star,
  MonitorCheck
} from 'lucide-react';

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'workflow' | 'priorities' | 'uiux'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-purple-800/50 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Network className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Spesifikasi Teknis & Alur Operasional KICT TOS
              </h2>
              <p className="text-xs text-slate-400">
                Arsitektur Sistem, Alur Kerja (Workflow), UX Lapangan & Matriks Prioritas Fitur
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-800 shrink-0 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Arsitektur Sistem Terintegrasi</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'workflow'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Alur Kerja Operasional (Workflow)</span>
          </button>

          <button
            onClick={() => setActiveTab('priorities')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'priorities'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Daftar Fitur Utama Diprioritaskan</span>
          </button>

          <button
            onClick={() => setActiveTab('uiux')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'uiux'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MonitorCheck className="w-3.5 h-3.5" />
            <span>Prinsip Desain UI/UX Efisiensi Lapangan</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 text-slate-300 text-xs md:text-sm leading-relaxed">
          
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/30">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  Struktur Arsitektur 4-Tier KICT TOS Modern
                </h3>
                <p className="text-slate-300 text-xs">
                  Sistem dirancang dengan arsitektur mikro terdistribusi berlatensi rendah untuk menjamin ketersediaan 99.99% di pelabuhan peti kemas Kebumen International Container Terminal.
                </p>
              </div>

              {/* Architecture Tiers Visual */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Tier 1 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs uppercase mb-2">
                      <Radio className="w-4 h-4" />
                      <span>Tier 1: Edge & Field IoT</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      <li>· Kamera OCR Gate In/Out (Nopol & Nomor ISO Kontainer)</li>
                      <li>· Sensor Jembatan Timbang (Weighbridge Sensor)</li>
                      <li>· Telematika GPS & PLC Crane (STS, RTG, Reach Stacker)</li>
                      <li>· RDT (Radio Data Terminal) Operator Lapangan</li>
                    </ul>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800 text-[10px] text-purple-300 font-mono">
                    Protokol: MQTT / WebSockets / CoAP
                  </div>
                </div>

                {/* Tier 2 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-800/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs uppercase mb-2">
                      <Cpu className="w-4 h-4" />
                      <span>Tier 2: KICT Core TOS Engine</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      <li>· Yard Planning & Stacking Optimization Matrix</li>
                      <li>· Berth & Crane Gang Allocation Scheduler</li>
                      <li>· Gate Processing & e-Pass Barcode Generator</li>
                      <li>· e-EIR Inspection Damage Mapping Engine</li>
                    </ul>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800 text-[10px] text-purple-300 font-mono">
                    Runtime: Node.js / Express / React TS
                  </div>
                </div>

                {/* Tier 3 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-700/50 flex flex-col justify-between bg-purple-950/20">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase mb-2">
                      <Database className="w-4 h-4" />
                      <span>Tier 3: Neon DB Serverless</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      <li>· PostgreSQL High Availability Managed Cluster</li>
                      <li>· ACID Transactions untuk Keuangan & Inventori</li>
                      <li>· Row Level Security & TLS 1.3 Encryption</li>
                      <li>· Local Cache Fallback untuk Offline Resilience</li>
                    </ul>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-mono">
                    Storage: Neon DB PostgreSQL Cloud
                  </div>
                </div>

                {/* Tier 4 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs uppercase mb-2">
                      <Network className="w-4 h-4" />
                      <span>Tier 4: Ekosistem Eksternal</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      <li>· EDI BAPLIE & COPRAR (Shipping Lines)</li>
                      <li>· Bea Cukai INSW (CEISA 4.0 / SPPB Online)</li>
                      <li>· Banking Gateway & Virtual Account Auto-Billing</li>
                      <li>· Port Authority Traffic Management (VTS)</li>
                    </ul>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800 text-[10px] text-indigo-400 font-mono">
                    Standard: EDIFACT & REST APIs
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/30">
                <h3 className="text-sm font-bold text-white mb-1">
                  Alur Kerja Terpadu (End-to-End Operational Workflow KICT)
                </h3>
                <p className="text-xs text-slate-400">
                  Dari kapal tiba, penanganan dermaga, penataan lapangan, hingga keluar gerbang terminal secara mulus.
                </p>
              </div>

              {/* Step 1 to Step 5 flow */}
              <div className="space-y-3">
                
                {/* Stage 1 */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
                    <Ship className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase">
                        Tahap 1: Vessel Arrival & Berth Planning
                      </h4>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                        Modul: Berth Scheduler
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Kapal mengunggah manifest BAPLIE. Planner mengalokasikan tambatan (Berth 01/02), menentukan STS Quay Crane Gang (QC-01 s/d QC-04), dan menargetkan BCH $\ge$ 28 moves/jam.
                    </p>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase">
                        Tahap 2: Stevedoring & Yard Allocation (Discharge / Load)
                      </h4>
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded">
                        Modul: Yard Planner
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Quay crane menurunkan kontainer ke truk terminal. TOS otomatis mengalokasikan slot spesifik di yard (Bay, Row, Tier). E-RTG dan Reach Stacker memverifikasi penempatan fisik dengan update data instan ke Neon DB.
                    </p>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase">
                        Tahap 3: Gate System & e-EIR Inspection
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                        Modul: Gate OCR & e-EIR
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Truk luar tiba di gerbang. Kamera OCR membaca pelat truk dan nomor kontainer dalam &lt; 2 detik. Sensor timbangan mengukur berat kotor. Petugas lapangan memetakan kondisi fisik pada format e-EIR 5-sisi. Tiket gate pass terbit otomatis dengan QR Code.
                    </p>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase">
                        Tahap 4: Automated Tariff Billing & Payment
                      </h4>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                        Modul: Billing Engine
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Kalkulasi tarif THC, masa inap penumpukan (Storage Demurrage), Lo-Lo, dan monitoring reefer dihitung otomatis sesuai masa inap. Faktur ber-QR terbit dan lunas via Virtual Account Bank.
                    </p>
                  </div>
                </div>

                {/* Stage 5 */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase">
                        Tahap 5: Gate Out Delivery & Executive Reporting
                      </h4>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded">
                        Modul: Reporting & Analytics
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Validasi barcode SPPB Bea Cukai di Gate Out. Barrier gate terbuka otomatis. Laporan kinerja harian (BCH, TRT, Yard Occupancy) langsung siap diekspor ke format Excel (.xlsx) dan PDF resmi.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: PRIORITIZED FEATURES */}
          {activeTab === 'priorities' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-900/30">
                <h3 className="text-sm font-bold text-white">
                  Matriks Prioritas Pengembangan Fitur (P0 / P1 / P2)
                </h3>
                <p className="text-xs text-slate-400">
                  Klasifikasi modular berdasarkan urgensi operasional lapangan pelabuhan internasional.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Priority 0 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-600/40">
                  <div className="text-xs font-bold text-purple-300 uppercase flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Prioritas P0 (Fondasi Kritis)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span><strong>Yard Planning 2D:</strong> Visualisasi Bay-Row-Tier dengan penempatan kontainer 20ft/40ft/Reefer/DG.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span><strong>Gate System & Timbangan:</strong> Input truk masuk/keluar, nomor segel, dan pencetakan gate pass.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span><strong>Koneksi Database Neon DB:</strong> Master CRUD data tersimpan aman dan terenkripsi.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span><strong>Autentikasi Multi-Peran:</strong> Akses khusus Admin, Planner, Gate, dan Kasir.</span>
                    </li>
                  </ul>
                </div>

                {/* Priority 1 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Prioritas P1 (Otomasi Operasi)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>Vessel Berth Planning:</strong> Penjadwalan sandar kapal dan alokasi STS crane gang.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>e-EIR Inspection:</strong> Pencatatan digital kerusakan kontainer 5-sisi dengan tanda tangan digital.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>Pelacakan Crane & Reach Stacker:</strong> Telematika status kerja dan bahan bakar alat berat.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>Sistem Billing Otomatis:</strong> Penghitungan THC, inap gudang progresif, dan faktur resmi.</span>
                    </li>
                  </ul>
                </div>

                {/* Priority 2 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-indigo-300 uppercase flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>Prioritas P2 (Analitik & Integrasi)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Ekspor Otomatis Excel & PDF:</strong> Laporan operasional instan 1-klik dengan kop KICT resmi.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Push Notifikasi Real-Time:</strong> Notifikasi instan pergerakan crane dan gate throughput.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Dashboard Produktivitas:</strong> Live BCH, TRT, dan pemantauan utilisasi lapangan.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: UI/UX PHILOSOPHY */}
          {activeTab === 'uiux' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/30">
                <h3 className="text-sm font-bold text-white mb-1">
                  Filosofi UI/UX: Berfokus pada Efisiensi & Ketepatan Lapangan
                </h3>
                <p className="text-xs text-slate-300">
                  Lingkungan operasional dermaga dan gate berkecepatan tinggi memerlukan antarmuka dengan kontras tinggi, navigasi minimum-klik, dan kejelasan data mutlak.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-purple-300 mb-2">1. Palet Ungu Maritim Berdaya Kontras Tinggi</h4>
                  <p className="text-slate-400 leading-normal">
                    Menggunakan tema latar kontainer ungu modern (#3B0764 / #581C87) yang ramah mata operator saat shift malam dan tetap tajam di bawah terik matahari dermaga.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-purple-300 mb-2">2. Visualisasi Tata Letak Interaktif</h4>
                  <p className="text-slate-400 leading-normal">
                    Blok yard disajikan secara geometris modular dengan indikator warna status ISO, kapasitas tier, dan akses 1-klik untuk relokasi kontainer tanpa input manual rumit.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-purple-300 mb-2">3. Tabular Numerals & Monospace Alignment</h4>
                  <p className="text-slate-400 leading-normal">
                    Seluruh nomor kontainer ISO, bobot kotor kilogram, dan waktu sandar menggunakan font monospace tabular untuk mencegah pergeseran angka dan salah baca oleh checker.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-purple-300 mb-2">4. Zero-Click Critical Alerts & Audio Feedback</h4>
                  <p className="text-slate-400 leading-normal">
                    Perubahan status kritis (alat maintenance, seal rusak, suhu reefer abnormal) memicu push notifikasi visual dan audio lembut untuk respon segera tanpa refresh halaman.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-purple-950/60 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <div>Dokumen Teknis KICT-TOS-ARCH-2026 · Standar ISO/IEC 25010</div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors cursor-pointer"
          >
            Tutup Spesifikasi
          </button>
        </div>

      </div>
    </div>
  );
};
