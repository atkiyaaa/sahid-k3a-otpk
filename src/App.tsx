/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System (TOS)
 * Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, NeonDbStatus, PushNotification } from './types/tos';
import { dbService, TOSDatabaseState } from './services/db';
import { notificationService } from './services/notificationService';

// Modals & Navigation
import { LoginModal } from './components/LoginModal';
import { Header } from './components/Header';
import { Sidebar, TOSView } from './components/Sidebar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { DatabaseConfigModal } from './components/DatabaseConfigModal';
import { SystemArchitectureModal } from './components/SystemArchitectureModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { YardPlanningView } from './components/views/YardPlanningView';
import { GateSystemView } from './components/views/GateSystemView';
import { VesselBerthView } from './components/views/VesselBerthView';
import { EquipmentTrackingView } from './components/views/EquipmentTrackingView';
import { EEIRView } from './components/views/EEIRView';
import { BillingView } from './components/views/BillingView';
import { MasterDataView } from './components/views/MasterDataView';
import { ReportsView } from './components/views/ReportsView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<TOSView>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);

  // Live database state & unread notifications
  const [dbData, setDbData] = useState<TOSDatabaseState>(() => {
    return {
      containers: dbService.getContainers(),
      blocks: dbService.getBlocks(),
      gateLogs: dbService.getGateLogs(),
      vessels: dbService.getVessels(),
      equipment: dbService.getEquipment(),
      eeirInspections: dbService.getEEIRInspections(),
      invoices: dbService.getInvoices(),
      metrics: dbService.getMetrics(),
      shippingLines: dbService.getShippingLines(),
    };
  });

  const [neonStatus, setNeonStatus] = useState<NeonDbStatus>(dbService.getNeonStatus());
  const [activeDevicesCount, setActiveDevicesCount] = useState<number>(dbService.activeDevicesCount);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(notificationService.getUnreadCount());

  // Subscribe to real-time notifications & real-time DB changes
  useEffect(() => {
    const unsubNotifs = notificationService.subscribe((list) => {
      setUnreadNotifsCount(list.filter(n => !n.read).length);
    });
    const unsubDb = dbService.subscribe(() => {
      refreshData();
      setNeonStatus(dbService.getNeonStatus());
      setActiveDevicesCount(dbService.activeDevicesCount);
    });
    return () => {
      unsubNotifs();
      unsubDb();
    };
  }, []);

  const refreshData = () => {
    setDbData({
      containers: dbService.getContainers(),
      blocks: dbService.getBlocks(),
      gateLogs: dbService.getGateLogs(),
      vessels: dbService.getVessels(),
      equipment: dbService.getEquipment(),
      eeirInspections: dbService.getEEIRInspections(),
      invoices: dbService.getInvoices(),
      metrics: dbService.getMetrics(),
      shippingLines: dbService.getShippingLines(),
    });
  };

  const handleNotify = (title: string, message: string, cat?: PushNotification['category']) => {
    notificationService.push({
      title,
      message,
      category: cat || 'system',
      level: 'info',
    });
  };

  // If user is not logged in, show initial Login & Company Vision/Mission screen
  if (!currentUser) {
    return (
      <LoginModal 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          notificationService.push({
            title: `Selamat Datang di KICT TOS, ${user.name}`,
            message: `Autentikasi port guard berhasil untuk shift ${user.shift}. Terhubung ke Neon DB.`,
            category: 'system',
            level: 'success',
          });
        }} 
      />
    );
  }

  const getViewTitle = (view: TOSView): string => {
    switch (view) {
      case 'dashboard': return 'Dashboard Analitik Produktivitas';
      case 'yard_planning': return 'Manajemen Yard Planning (Peta 2D)';
      case 'gate_system': return 'Gate System & Otomasi OCR';
      case 'vessel_berth': return 'Vessel Berth Planning & Stevedoring';
      case 'equipment_tracking': return 'Pelacakan Armada Crane & Reach Stacker';
      case 'eeir_inspection': return 'Pencatatan Fisik Peti Kemas (e-EIR)';
      case 'billing_tariffs': return 'Billing & Faktur Tarif Operasional';
      case 'master_data': return 'Master Data CRUD';
      case 'reports_export': return 'Laporan & Ekspor Otomatis (Excel/PDF)';
      case 'architecture_workflow': return 'Arsitektur Sistem & Alur Kerja';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      {/* Top Bar Header adhering to Top Bar Contract */}
      <Header
        currentUser={currentUser}
        activeViewTitle={getViewTitle(activeView)}
        unreadCount={unreadNotifsCount}
        neonStatus={neonStatus}
        activeDevicesCount={activeDevicesCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenDatabaseConfig={() => setIsDbModalOpen(true)}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main Workspace: Sidebar Navigation + Content Canvas */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={(v) => {
            if (v === 'architecture_workflow') {
              setIsArchModalOpen(true);
            } else {
              setActiveView(v);
            }
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Primary Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/30 via-slate-950 to-slate-950">
          <div className="max-w-7xl mx-auto pb-12">
            
            {activeView === 'dashboard' && (
              <DashboardView
                data={dbData}
                onNavigate={(v) => setActiveView(v)}
                onTriggerEvent={() => notificationService.triggerMockEvent()}
              />
            )}

            {activeView === 'yard_planning' && (
              <YardPlanningView
                data={dbData}
                onRefresh={refreshData}
                onNotify={(t, m) => handleNotify(t, m, 'yard')}
              />
            )}

            {activeView === 'gate_system' && (
              <GateSystemView
                data={dbData}
                onRefresh={refreshData}
                onNotify={(t, m) => handleNotify(t, m, 'gate')}
              />
            )}

            {activeView === 'vessel_berth' && (
              <VesselBerthView
                data={dbData}
                onRefresh={refreshData}
                onNotify={(t, m) => handleNotify(t, m, 'vessel')}
              />
            )}

            {activeView === 'equipment_tracking' && (
              <EquipmentTrackingView
                data={dbData}
                onRefresh={refreshData}
                onNotify={(t, m) => handleNotify(t, m, 'equipment')}
              />
            )}

            {activeView === 'eeir_inspection' && (
              <EEIRView
                data={dbData}
                onRefresh={refreshData}
                onNotify={(t, m) => handleNotify(t, m, 'system')}
              />
            )}

            {activeView === 'billing_tariffs' && (
              <BillingView
                data={dbData}
                onRefresh={refreshData}
                onNotify={(t, m) => handleNotify(t, m, 'billing')}
              />
            )}

            {activeView === 'master_data' && (
              <MasterDataView
                data={dbData}
                onRefresh={refreshData}
                onNotify={(t, m) => handleNotify(t, m, 'system')}
              />
            )}

            {activeView === 'reports_export' && (
              <ReportsView
                data={dbData}
                onNotify={(t, m) => handleNotify(t, m, 'system')}
              />
            )}

          </div>
        </main>
      </div>

      {/* Real-Time Push Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Neon DB PostgreSQL Configuration Modal */}
      <DatabaseConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onStatusChange={(newStatus) => setNeonStatus(newStatus)}
      />

      {/* System Architecture & Workflow Modal */}
      <SystemArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* Floating Mobile Sidebar Trigger */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="fixed bottom-4 right-4 z-40 lg:hidden p-3 rounded-full bg-purple-600 text-white shadow-xl shadow-purple-950 flex items-center justify-center cursor-pointer"
        aria-label="Buka Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

    </div>
  );
}
