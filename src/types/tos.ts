/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Domain Types Definition
 */

export type UserRole = 'super_admin' | 'yard_planner' | 'gate_officer' | 'vessel_stevedore' | 'billing_officer';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
  shift: string;
}

export type ContainerSize = '20ft' | '40ft' | '45ft';
export type ContainerType = 'dry' | 'reefer' | 'tank' | 'flat_rack' | 'open_top' | 'hazardous_dg';
export type ContainerStatus = 'yard_stacked' | 'gate_in_progress' | 'discharging' | 'loading' | 'gate_out' | 'customs_hold';

export interface ContainerItem {
  id: string;
  containerNumber: string; // ISO 6346 (e.g. MSKU9283710)
  size: ContainerSize;
  type: ContainerType;
  isoCode: string; // e.g. 22G1, 45R1
  weightGrossKg: number;
  tareWeightKg: number;
  payloadKg: number;
  sealNumber: string;
  shippingLine: string; // e.g. Maersk, MSC, Evergreen, Meratus
  owner: string;
  consignee: string;
  vesselId?: string;
  voyageNumber?: string;
  status: ContainerStatus;
  yardLocation?: {
    block: string;
    bay: number;
    row: number;
    tier: number;
  };
  temperatureCelsius?: number; // for reefer
  hazardClass?: string; // for dangerous goods (IMO)
  dischargePort: string;
  loadingPort: string;
  finalDestination: string;
  dwellDays: number;
  updatedAt: string;
}

export interface YardBlock {
  id: string;
  code: string; // Block A, B, C, D, R, DG
  name: string;
  category: 'dry_export' | 'dry_import' | 'transshipment' | 'reefer' | 'dangerous_goods';
  baysCount: number;
  rowsCount: number;
  maxTiers: number;
  totalCapacityTeus: number;
  currentTeus: number;
  craneAssigned?: string; // RTG ID
}

export interface GateLog {
  id: string;
  ticketNumber: string;
  direction: 'gate_in' | 'gate_out';
  lane: 'Lane 1 (Export/Inbound)' | 'Lane 2 (Import/Inbound)' | 'Lane 3 (Outbound)';
  timestamp: string;
  truckPlate: string;
  driverName: string;
  driverIdNumber: string;
  truckingCompany: string;
  containerNumber: string;
  containerSize: ContainerSize;
  containerType: ContainerType;
  sealNumber: string;
  weighbridgeGrossKg: number;
  weighbridgeTareKg: number;
  netWeightKg: number;
  eirNumber: string;
  assignedYardSlot: string; // e.g. B-04-02-3
  status: 'passed' | 'inspection_required' | 'rejected' | 'completed';
  remarks?: string;
}

export interface VesselBerth {
  id: string;
  vesselName: string;
  callSign: string;
  imoNumber: string;
  shippingLine: string;
  voyageIn: string;
  voyageOut: string;
  loaMeters: number; // Length overall
  draftMeters: number;
  berthLocation: 'Berth 01 (North Quay)' | 'Berth 02 (South Quay)';
  eta: string;
  etd: string;
  actualArrival?: string;
  actualDeparture?: string;
  status: 'scheduled' | 'berthing' | 'operating' | 'completed' | 'departed';
  totalDischargeTeus: number;
  dischargedTeus: number;
  totalLoadTeus: number;
  loadedTeus: number;
  assignedCranes: string[]; // ['QC-01', 'QC-02']
  bchTarget: number; // Berth Crane Hour
  currentBch: number;
}

export type EquipmentType = 'quay_crane' | 'rtg' | 'reach_stacker' | 'terminal_truck';
export type EquipmentStatus = 'operating' | 'idle' | 'maintenance' | 'offline';

export interface TerminalEquipment {
  id: string;
  code: string; // QC-01, RTG-03, RS-02
  name: string;
  type: EquipmentType;
  manufacturer: string;
  safeWorkingLoadTons: number;
  status: EquipmentStatus;
  operatorName: string;
  locationArea: string; // Berth 01, Yard Block B, Gate In
  coordinates: { x: number; y: number }; // Percentage for map
  currentJob?: string;
  movesCompletedToday: number;
  fuelBatteryPercent: number;
  operatingHours: number;
}

export interface EEIRInspection {
  id: string;
  eirNumber: string;
  transactionType: 'gate_in' | 'gate_out' | 'vessel_discharge' | 'vessel_load';
  containerNumber: string;
  isoCode: string;
  truckPlate: string;
  driverName: string;
  shippingLine: string;
  sealNumber: string;
  sealIntact: boolean;
  damages: Array<{
    id: string;
    section: 'front' | 'rear_door' | 'left_side' | 'right_side' | 'roof' | 'floor';
    damageType: 'dent' | 'scratch' | 'hole' | 'rust' | 'bent_frame' | 'cracked_weld';
    severity: 'minor' | 'moderate' | 'critical';
    positionX: number; // 0 - 100 percentage
    positionY: number; // 0 - 100 percentage
    notes: string;
  }>;
  cleanliness: 'clean' | 'swept' | 'dirty_requires_wash' | 'odor_detected';
  inspectorName: string;
  inspectionDate: string;
  inspectorSignature: string;
  status: 'accepted' | 'accepted_with_defect' | 'rejected';
}

export interface OperationalInvoice {
  id: string;
  invoiceNumber: string; // INV/KICT/2026/09/XXXX
  issueDate: string;
  dueDate: string;
  customerName: string;
  shippingLine: string;
  containerNumber: string;
  serviceItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }>;
  subtotal: number;
  taxPpn: number; // 11%
  grandTotal: number;
  status: 'paid' | 'unpaid' | 'overdue';
  paymentMethod?: 'virtual_account' | 'bank_transfer' | 'credit_term';
  paidAt?: string;
}

export interface TerminalProductivityMetrics {
  bchCurrent: number; // Moves per crane hour
  bchTarget: number;
  trtAverageMinutes: number; // Truck turnaround time
  trtTargetMinutes: number;
  yardOccupancyRatePercent: number; // YOR
  totalTeusToday: number;
  totalDischargeTeusToday: number;
  totalLoadTeusToday: number;
  vesselsAtBerth: number;
  activeEquipmentCount: number;
}

export interface PushNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  category: 'gate' | 'vessel' | 'yard' | 'equipment' | 'billing' | 'system';
  level: 'info' | 'success' | 'warning' | 'critical';
  read: boolean;
}

export interface NeonDbStatus {
  isConnected: boolean;
  databaseHost: string;
  databaseName: string;
  latencyMs: number;
  lastSyncTime: string;
  syncMode: 'neon_online' | 'local_cached';
}

export interface TOSDatabaseState {
  containers: ContainerItem[];
  blocks: YardBlock[];
  gateLogs: GateLog[];
  vessels: VesselBerth[];
  equipment: TerminalEquipment[];
  eeirInspections: EEIRInspection[];
  invoices: OperationalInvoice[];
  metrics: TerminalProductivityMetrics;
  shippingLines: string[];
}

