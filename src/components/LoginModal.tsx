/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Initial Screen: Login Form & Company Vision & Mission
 */

import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types/tos';
import { dbService } from '../services/db';
import { 
  Anchor, 
  ShieldCheck, 
  Ship, 
  Layers, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Database,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck
} from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const DEMO_USERS: Record<UserRole, UserProfile> = {
  super_admin: {
    id: 'usr-admin',
    name: 'Capt. Ardiansyah, M.Mar',
    username: 'admin.ardiansyah',
    role: 'super_admin',
    shift: 'Shift A (General Operations Manager)',
  },
  yard_planner: {
    id: 'usr-yard',
    name: 'Bima Satria Wicaksono, S.T.',
    username: 'planner.bima',
    role: 'yard_planner',
    shift: 'Shift 1 (Yard Control Desk)',
  },
  gate_officer: {
    id: 'usr-gate',
    name: 'Ferry Hermawan',
    username: 'officer.ferry',
    role: 'gate_officer',
    shift: 'Shift 1 (Gate In/Out Inspector)',
  },
  vessel_stevedore: {
    id: 'usr-vessel',
    name: 'Hendra Gunawan',
    username: 'stevedore.hendra',
    role: 'vessel_stevedore',
    shift: 'Shift 1 (Berth & Quay Crane Lead)',
  },
  billing_officer: {
    id: 'usr-billing',
    name: 'Ratna Kusuma Dewi, S.E.',
    username: 'finance.ratna',
    role: 'billing_officer',
    shift: 'Finance & Billing Division',
  },
};

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin.ardiansyah');
  const [password, setPassword] = useState('••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [isLoading, setIsLoading] = useState(false);
  const neonStatus = dbService.getNeonStatus();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setUsername(DEMO_USERS[role].username);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(DEMO_USERS[selectedRole]);
    }, 450);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-x-hidden bg-slate-950">
      {/* Background container image with purple & violet gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-35 scale-105"
        style={{
          backgroundImage: `url('/src/assets/images/hero_container_terminal_purple_1790644180321.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-purple-950/80 to-slate-950/90 pointer-events-none" />

      {/* Grid Pattern overlay for high-tech maritime feel */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(168, 85, 247, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Brand Identity, Visi & Misi Perusahaan */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 md:p-10 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-purple-900/40 shadow-2xl">
          <div>
            {/* Header Badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-inner">
                <Anchor className="w-6 h-6 text-purple-300 animate-pulse" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
                  Terminal Operating System · Smart Port Hub
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  Kebumen International Container Terminal
                </h1>
                <p className="text-xs text-slate-400">
                  Gerbang Maritim Modern Pesisir Selatan Jawa (KICT) · Kode Pelabuhan: IDKCT
                </p>
              </div>
            </div>

            {/* Visi Perusahaan */}
            <div className="mb-6 p-5 rounded-xl bg-purple-950/40 border border-purple-800/30">
              <div className="flex items-center gap-2 mb-2 text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs uppercase tracking-wider font-bold">Visi Perusahaan KICT</h3>
              </div>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
                &ldquo;Menjadi hub pelabuhan peti kemas internasional berbasis <span className="text-purple-300 font-semibold">smart port</span>, ramah lingkungan, dan terintegrasi digital kelas dunia di pesisir selatan Jawa guna mempercepat konektivitas logistik global.&rdquo;
              </p>
            </div>

            {/* Misi Perusahaan */}
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Misi Strategis Terminal (3 Pilar Keunggulan)
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Otomasi Berstandar Internasional & Zero Incident</h4>
                    <p className="text-xs text-slate-400 leading-normal">
                      Mengoperasikan sistem STS Quay Crane, E-RTG, dan gerbang OCR otomatis dengan standar keselamatan maritime ISPS Code tingkat tertinggi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Efisiensi Ekosistem Real-Time Online</h4>
                    <p className="text-xs text-slate-400 leading-normal">
                      Menghubungkan Yard Planning, Gate Automation, Berth Scheduling, dan e-EIR secara langsung dengan database online Neon DB dan telematika lapangan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Pelayanan 24/7 Prima & Akuntabilitas Finansial</h4>
                    <p className="text-xs text-slate-400 leading-normal">
                      Memberikan transparansi penanganan kargo, penagihan tarif operasional terotomasi, serta pelaporan eksekutif instan (Excel & PDF).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Database & Infrastructure Status Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300 font-medium">Database Neon DB:</span>
              <span className="text-purple-300 font-mono text-[11px] bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                {neonStatus.databaseHost.slice(0, 24)}... (Online)
              </span>
            </div>
            <div className="text-slate-500">
              Versi TOS v4.2.0-Prod · 2026
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login Form & Quick Role Switcher */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-purple-600/40 shadow-2xl relative overflow-hidden">
          
          {/* Subtle purple accent banner */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600" />

          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-900/50 border border-purple-700/40 text-purple-300 text-xs font-semibold mb-2">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                Autentikasi Port Access Guard
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Masuk Sistem Operasi Terminal
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Pilih profil peran operasional atau gunakan akun kredensial Anda.
              </p>
            </div>

            {/* Quick Demo Role Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Pilih Peran Operasional (Quick Access Demo):
              </label>
              <div className="grid grid-cols-2 gap-2 text-left">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('super_admin')}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedRole === 'super_admin'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold truncate">Super Admin</div>
                    <div className="text-[10px] text-slate-400 truncate">GM Terminal</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('yard_planner')}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedRole === 'yard_planner'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold truncate">Yard Planner</div>
                    <div className="text-[10px] text-slate-400 truncate">Stacking Stoker</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('gate_officer')}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedRole === 'gate_officer'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold truncate">Gate Officer</div>
                    <div className="text-[10px] text-slate-400 truncate">OCR & Timbangan</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('vessel_stevedore')}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedRole === 'vessel_stevedore'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Ship className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold truncate">Berth Planner</div>
                    <div className="text-[10px] text-slate-400 truncate">Quay & Stevedore</div>
                  </div>
                </button>
              </div>

              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('billing_officer')}
                  className={`w-full p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedRole === 'billing_officer'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold">Billing & Finance Officer</span>
                    <span className="text-[10px] text-slate-400 ml-2">THC, Dwell Time & Invoice</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  ID Pengguna / Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
                  />
                  <div className="absolute right-3 top-3 text-slate-500 text-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Kata Sandi Keamanan
                  </label>
                  <span className="text-[11px] text-purple-400 hover:underline cursor-pointer">
                    Lupa PIN Lapangan?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>

              {/* Officer summary info */}
              <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/30 text-xs text-slate-300">
                <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {DEMO_USERS[selectedRole].name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Tugas: {DEMO_USERS[selectedRole].shift}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/40 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengotentikasi ke Neon DB...</span>
                  </div>
                ) : (
                  <>
                    <span>Buka Portal Operasi KICT</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
            Sistem terenkripsi TLS 1.3 · Single Sign-On (SSO) Port Authority ID
          </div>
        </div>
      </div>
    </div>
  );
};
