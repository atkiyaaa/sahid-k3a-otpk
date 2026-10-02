/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System (TOS)
 * Full-Stack Real-Time Multi-Device Online Server
 * With Neon DB PostgreSQL & Instant SSE Broadcast
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { getInitialDatabaseState } from './src/data/initialTosData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Active Neon Connection String (env var or runtime override from UI)
let activeDatabaseUrl: string = process.env.DATABASE_URL || '';

// Canonical in-memory shared state for all connected devices
let canonicalState = getInitialDatabaseState();
let stateRevision = 1;

// Connected SSE clients for live push events across devices
interface SseConnection {
  id: string;
  res: Response;
  deviceIp: string;
  connectedAt: string;
}
const sseConnections: SseConnection[] = [];

// Helper to broadcast real-time events to all connected devices
export function broadcastEvent(event: {
  type: string;
  data: any;
  senderClientId?: string;
  timestamp?: string;
}) {
  stateRevision++;
  const payload = `data: ${JSON.stringify({
    ...event,
    revision: stateRevision,
    activeDevicesCount: sseConnections.length,
    timestamp: event.timestamp || new Date().toISOString(),
  })}\n\n`;

  sseConnections.forEach((conn) => {
    try {
      conn.res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// Get configured Neon SQL executor
function getNeonSql(customUrl?: string) {
  const connStr = customUrl || activeDatabaseUrl;
  if (!connStr || connStr.includes('password@ep-sample')) {
    return null;
  }
  return neon(connStr);
}

// -------------------------------------------------------------
// API: SSE Real-Time Event Stream for Multi-Device Sync
// -------------------------------------------------------------
app.get('/api/events/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const connectionId = 'conn-' + Math.random().toString(36).substring(2, 9);
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  const newConn: SseConnection = {
    id: connectionId,
    res,
    deviceIp: clientIp,
    connectedAt: new Date().toISOString(),
  };

  sseConnections.push(newConn);

  // Send initial welcome & sync packet
  res.write(
    `data: ${JSON.stringify({
      type: 'connected',
      connectionId,
      revision: stateRevision,
      activeDevicesCount: sseConnections.length,
      message: 'KICT TOS Multi-Device Real-Time Online Stream Connected'
    })}\n\n`
  );

  // Notify all devices of updated device count
  broadcastEvent({
    type: 'device_joined',
    data: {
      activeDevicesCount: sseConnections.length,
      deviceIp: clientIp,
    },
  });

  // Send periodic heartbeat to keep persistent mobile / desktop socket open
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat ${Date.now()}\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 10000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const index = sseConnections.findIndex(c => c.id === connectionId);
    if (index !== -1) {
      sseConnections.splice(index, 1);
    }
    broadcastEvent({
      type: 'device_left',
      data: {
        activeDevicesCount: sseConnections.length,
      },
    });
  });
});

// -------------------------------------------------------------
// API: Canonical Shared State (Used when opening on any new device)
// -------------------------------------------------------------
app.get('/api/state', (req: Request, res: Response) => {
  return res.json({
    success: true,
    revision: stateRevision,
    activeDevicesCount: sseConnections.length,
    data: canonicalState,
  });
});

// -------------------------------------------------------------
// API: Neon DB Connectivity & Health Check
// -------------------------------------------------------------
app.get('/api/neon/status', async (req: Request, res: Response) => {
  const customUrl = req.query.url as string | undefined;
  const targetUrl = customUrl || activeDatabaseUrl;

  if (!targetUrl || targetUrl.includes('password@ep-sample')) {
    return res.json({
      isConnected: false,
      databaseHost: 'ep-not-configured.neon.tech',
      databaseName: 'neondb',
      latencyMs: 0,
      activeDevicesCount: sseConnections.length,
      lastSyncTime: new Date().toISOString(),
      syncMode: 'local_cached',
      message: 'Belum ada connection string Neon DB yang aktif.',
      tablesFound: [],
    });
  }

  const startTime = Date.now();
  try {
    const sql = neon(targetUrl);
    const result = await sql`SELECT NOW() as current_time, version() as db_version, current_database() as db_name`;
    const latency = Date.now() - startTime;

    // Check existing KICT tables
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE 'kict_%'
    `;

    const tablesFound = (tablesResult as any[]).map((r) => r.table_name);

    let host = 'aws.neon.tech';
    try {
      const parsed = new URL(targetUrl);
      host = parsed.host;
    } catch {}

    return res.json({
      isConnected: true,
      databaseHost: host,
      databaseName: (result[0] as any)?.db_name || 'neondb',
      dbVersion: (result[0] as any)?.db_version || 'PostgreSQL (Neon)',
      latencyMs: latency,
      activeDevicesCount: sseConnections.length,
      lastSyncTime: new Date().toISOString(),
      syncMode: 'neon_online',
      message: `Terhubung langsung ke Neon DB Serverless (${latency}ms).`,
      tablesFound,
    });
  } catch (error: any) {
    return res.status(200).json({
      isConnected: false,
      databaseHost: 'neon.tech',
      databaseName: 'neondb',
      latencyMs: Date.now() - startTime,
      activeDevicesCount: sseConnections.length,
      lastSyncTime: new Date().toISOString(),
      syncMode: 'local_cached',
      error: error.message || 'Gagal menyambungkan ke Neon DB',
      message: `Koneksi gagal: ${error.message || 'Cek kembali URL Neon DB Anda'}`,
      tablesFound: [],
    });
  }
});

// -------------------------------------------------------------
// API: Connect / Set Active Neon DB URL
// -------------------------------------------------------------
app.post('/api/neon/connect', async (req: Request, res: Response) => {
  const { connectionString } = req.body;
  if (!connectionString) {
    return res.status(400).json({ error: 'Connection string harus disertakan.' });
  }

  const startTime = Date.now();
  try {
    const sql = neon(connectionString);
    const testResult = await sql`SELECT NOW() as current_time, version() as db_version, current_database() as db_name`;
    const latency = Date.now() - startTime;

    // Set as active
    activeDatabaseUrl = connectionString;

    broadcastEvent({
      type: 'neon_connected',
      data: {
        host: new URL(connectionString).host,
        latency,
      },
    });

    return res.json({
      success: true,
      message: `Koneksi ke Neon DB berhasil diverifikasi (${latency}ms).`,
      databaseName: (testResult[0] as any)?.db_name || 'neondb',
      latencyMs: latency,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Gagal memverifikasi connection string Neon DB.',
    });
  }
});

// -------------------------------------------------------------
// API: Setup / Initialize Real Schema on Neon DB
// -------------------------------------------------------------
app.post('/api/neon/setup-schema', async (req: Request, res: Response) => {
  const { connectionString, seedData } = req.body;
  const sql = getNeonSql(connectionString);

  if (!sql) {
    return res.status(400).json({
      error: 'Tidak ada koneksi Neon DB aktif. Harap masukkan connection string terlebih dahulu.',
    });
  }

  try {
    // 1. Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS kict_yard_blocks (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        bays_count INT NOT NULL DEFAULT 8,
        rows_count INT NOT NULL DEFAULT 6,
        max_tiers INT NOT NULL DEFAULT 5,
        total_capacity_teus INT NOT NULL,
        current_teus INT NOT NULL DEFAULT 0,
        crane_assigned VARCHAR(50)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS kict_vessels (
        id VARCHAR(50) PRIMARY KEY,
        vessel_name VARCHAR(150) NOT NULL,
        call_sign VARCHAR(50) NOT NULL,
        imo_number VARCHAR(50) NOT NULL,
        shipping_line VARCHAR(100) NOT NULL,
        voyage_in VARCHAR(50) NOT NULL,
        voyage_out VARCHAR(50) NOT NULL,
        loa_meters NUMERIC NOT NULL,
        draft_meters NUMERIC NOT NULL,
        berth_location VARCHAR(100) NOT NULL,
        eta TIMESTAMP WITH TIME ZONE NOT NULL,
        etd TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(50) NOT NULL,
        total_discharge INT NOT NULL DEFAULT 0,
        total_load INT NOT NULL DEFAULT 0,
        discharged_count INT NOT NULL DEFAULT 0,
        loaded_count INT NOT NULL DEFAULT 0,
        assigned_cranes TEXT[] DEFAULT '{}'
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS kict_equipment (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        manufacturer VARCHAR(100),
        safe_working_load_tons NUMERIC NOT NULL,
        status VARCHAR(50) NOT NULL,
        operator_name VARCHAR(100) NOT NULL,
        location_area VARCHAR(100) NOT NULL,
        coordinates_x NUMERIC,
        coordinates_y NUMERIC,
        current_job VARCHAR(200),
        moves_completed_today INT NOT NULL DEFAULT 0,
        fuel_battery_percent INT NOT NULL DEFAULT 100,
        operating_hours INT NOT NULL DEFAULT 0
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS kict_containers (
        id VARCHAR(50) PRIMARY KEY,
        container_number VARCHAR(50) NOT NULL UNIQUE,
        size VARCHAR(10) NOT NULL,
        type VARCHAR(50) NOT NULL,
        iso_code VARCHAR(20) NOT NULL,
        weight_gross_kg NUMERIC NOT NULL,
        tare_weight_kg NUMERIC NOT NULL,
        payload_kg NUMERIC NOT NULL,
        seal_number VARCHAR(50) NOT NULL,
        shipping_line VARCHAR(100) NOT NULL,
        owner VARCHAR(150) NOT NULL,
        consignee VARCHAR(150) NOT NULL,
        status VARCHAR(50) NOT NULL,
        yard_block VARCHAR(10),
        yard_bay INT,
        yard_row INT,
        yard_tier INT,
        temperature_celsius NUMERIC,
        hazard_class VARCHAR(50),
        discharge_port VARCHAR(50) NOT NULL,
        loading_port VARCHAR(50) NOT NULL,
        final_destination VARCHAR(150) NOT NULL,
        dwell_days INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS kict_gate_logs (
        id VARCHAR(50) PRIMARY KEY,
        ticket_number VARCHAR(50) NOT NULL UNIQUE,
        direction VARCHAR(20) NOT NULL,
        lane VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        truck_plate VARCHAR(50) NOT NULL,
        driver_name VARCHAR(100) NOT NULL,
        driver_id_number VARCHAR(50),
        trucking_company VARCHAR(150) NOT NULL,
        container_number VARCHAR(50) NOT NULL,
        container_size VARCHAR(10) NOT NULL,
        container_type VARCHAR(50) NOT NULL,
        seal_number VARCHAR(50) NOT NULL,
        weighbridge_gross_kg NUMERIC NOT NULL,
        weighbridge_tare_kg NUMERIC NOT NULL,
        net_weight_kg NUMERIC NOT NULL,
        eir_number VARCHAR(50) NOT NULL,
        assigned_yard_slot VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        remarks TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS kict_eeir (
        id VARCHAR(50) PRIMARY KEY,
        eir_number VARCHAR(50) NOT NULL UNIQUE,
        inspection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        container_number VARCHAR(50) NOT NULL,
        container_size VARCHAR(10) NOT NULL,
        container_type VARCHAR(50) NOT NULL,
        truck_plate VARCHAR(50) NOT NULL,
        driver_name VARCHAR(100) NOT NULL,
        shipping_line VARCHAR(100) NOT NULL,
        seal_number VARCHAR(50) NOT NULL,
        seal_condition VARCHAR(50) NOT NULL,
        clean_condition VARCHAR(50) NOT NULL,
        physical_damages JSONB DEFAULT '[]'::jsonb,
        inspector_name VARCHAR(100) NOT NULL,
        inspector_signature_verified BOOLEAN DEFAULT TRUE,
        remarks TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS kict_invoices (
        id VARCHAR(50) PRIMARY KEY,
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        issue_date VARCHAR(20) NOT NULL,
        due_date VARCHAR(20) NOT NULL,
        customer_name VARCHAR(150) NOT NULL,
        shipping_line VARCHAR(100) NOT NULL,
        container_number VARCHAR(50) NOT NULL,
        service_items JSONB DEFAULT '[]'::jsonb,
        subtotal NUMERIC NOT NULL,
        tax_ppn NUMERIC NOT NULL,
        grand_total NUMERIC NOT NULL,
        status VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50),
        paid_at TIMESTAMP WITH TIME ZONE
      );
    `;

    // 2. If seed data provided, sync to Neon DB
    const dataToSeed = seedData || canonicalState;
    if (dataToSeed) {
      if (dataToSeed.containers) {
        for (const c of dataToSeed.containers) {
          await sql`
            INSERT INTO kict_containers (
              id, container_number, size, type, iso_code, weight_gross_kg, 
              tare_weight_kg, payload_kg, seal_number, shipping_line, owner, 
              consignee, status, yard_block, yard_bay, yard_row, yard_tier, 
              temperature_celsius, hazard_class, discharge_port, loading_port, 
              final_destination, dwell_days, updated_at
            ) VALUES (
              ${c.id}, ${c.containerNumber}, ${c.size}, ${c.type}, ${c.isoCode}, 
              ${c.weightGrossKg}, ${c.tareWeightKg}, ${c.payloadKg}, ${c.sealNumber}, 
              ${c.shippingLine}, ${c.owner}, ${c.consignee}, ${c.status}, 
              ${c.yardLocation?.block || null}, ${c.yardLocation?.bay || null}, 
              ${c.yardLocation?.row || null}, ${c.yardLocation?.tier || null}, 
              ${c.temperatureCelsius ?? null}, ${c.hazardClass || null}, 
              ${c.dischargePort}, ${c.loadingPort}, ${c.finalDestination}, 
              ${c.dwellDays || 0}, ${c.updatedAt || new Date().toISOString()}
            ) ON CONFLICT (id) DO UPDATE SET
              yard_block = EXCLUDED.yard_block,
              yard_bay = EXCLUDED.yard_bay,
              yard_row = EXCLUDED.yard_row,
              yard_tier = EXCLUDED.yard_tier,
              status = EXCLUDED.status;
          `;
        }
      }

      if (dataToSeed.vessels) {
        for (const v of dataToSeed.vessels) {
          await sql`
            INSERT INTO kict_vessels (
              id, vessel_name, call_sign, imo_number, shipping_line, voyage_in, 
              voyage_out, loa_meters, draft_meters, berth_location, eta, etd, 
              status, total_discharge, total_load, discharged_count, loaded_count, 
              assigned_cranes
            ) VALUES (
              ${v.id}, ${v.vesselName}, ${v.callSign}, ${v.imoNumber}, ${v.shippingLine}, 
              ${v.voyageIn}, ${v.voyageOut}, ${v.loaMeters}, ${v.draftMeters}, 
              ${v.berthLocation}, ${v.eta}, ${v.etd}, ${v.status}, ${v.totalDischarge}, 
              ${v.totalLoad}, ${v.dischargedCount || 0}, ${v.loadedCount || 0}, 
              ${v.assignedCranes || []}
            ) ON CONFLICT (id) DO UPDATE SET
              status = EXCLUDED.status,
              berth_location = EXCLUDED.berth_location;
          `;
        }
      }

      if (dataToSeed.blocks) {
        for (const b of dataToSeed.blocks) {
          await sql`
            INSERT INTO kict_yard_blocks (
              id, code, name, category, bays_count, rows_count, max_tiers, 
              total_capacity_teus, current_teus, crane_assigned
            ) VALUES (
              ${b.id}, ${b.code}, ${b.name}, ${b.category}, ${b.baysCount}, 
              ${b.rowsCount}, ${b.maxTiers}, ${b.totalCapacityTeus}, ${b.currentTeus}, 
              ${b.craneAssigned || null}
            ) ON CONFLICT (id) DO NOTHING;
          `;
        }
      }
    }

    broadcastEvent({
      type: 'schema_initialized',
      data: {
        message: 'Tabel KICT TOS di Neon DB berhasil dibuat dan diinisialisasi!',
      },
    });

    return res.json({
      success: true,
      message: 'Inisialisasi skema tabel KICT di Neon DB PostgreSQL berhasil!',
    });
  } catch (err: any) {
    console.error('Neon DB schema init error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Gagal inisialisasi tabel di Neon DB',
    });
  }
});

// -------------------------------------------------------------
// API: Full Data Sync from Neon DB (or Canonical Memory)
// -------------------------------------------------------------
app.get('/api/neon/data', async (req: Request, res: Response) => {
  const sql = getNeonSql();

  // If Neon DB not connected, return the canonical shared state
  if (!sql) {
    return res.json({
      connected: false,
      revision: stateRevision,
      activeDevicesCount: sseConnections.length,
      data: canonicalState,
    });
  }

  try {
    const [containersRes, vesselsRes, blocksRes, equipRes, gateRes, invoicesRes, eeirRes] =
      await Promise.all([
        sql`SELECT * FROM kict_containers ORDER BY updated_at DESC`,
        sql`SELECT * FROM kict_vessels ORDER BY eta ASC`,
        sql`SELECT * FROM kict_yard_blocks ORDER BY code ASC`,
        sql`SELECT * FROM kict_equipment ORDER BY code ASC`,
        sql`SELECT * FROM kict_gate_logs ORDER BY timestamp DESC LIMIT 100`,
        sql`SELECT * FROM kict_invoices ORDER BY issue_date DESC LIMIT 100`,
        sql`SELECT * FROM kict_eeir ORDER BY inspection_date DESC LIMIT 100`,
      ]);

    if ((containersRes as any[]).length > 0) {
      canonicalState.containers = (containersRes as any[]).map((r) => ({
        id: r.id,
        containerNumber: r.container_number,
        size: r.size,
        type: r.type,
        isoCode: r.iso_code,
        weightGrossKg: Number(r.weight_gross_kg),
        tareWeightKg: Number(r.tare_weight_kg),
        payloadKg: Number(r.payload_kg),
        sealNumber: r.seal_number,
        shippingLine: r.shipping_line,
        owner: r.owner,
        consignee: r.consignee,
        status: r.status,
        yardLocation: r.yard_block
          ? {
              block: r.yard_block,
              bay: Number(r.yard_bay),
              row: Number(r.yard_row),
              tier: Number(r.yard_tier),
            }
          : undefined,
        temperatureCelsius: r.temperature_celsius ? Number(r.temperature_celsius) : undefined,
        hazardClass: r.hazard_class || undefined,
        dischargePort: r.discharge_port,
        loadingPort: r.loading_port,
        finalDestination: r.final_destination,
        dwellDays: Number(r.dwell_days),
        updatedAt: r.updated_at,
      }));
    }

    if ((vesselsRes as any[]).length > 0) {
      canonicalState.vessels = (vesselsRes as any[]).map((r) => ({
        id: r.id,
        vesselName: r.vessel_name,
        callSign: r.call_sign,
        imoNumber: r.imo_number,
        shippingLine: r.shipping_line,
        voyageIn: r.voyage_in,
        voyageOut: r.voyage_out,
        loaMeters: Number(r.loa_meters),
        draftMeters: Number(r.draft_meters),
        berthLocation: r.berth_location,
        eta: r.eta,
        etd: r.etd,
        status: r.status,
        totalDischarge: Number(r.total_discharge),
        totalLoad: Number(r.total_load),
        dischargedCount: Number(r.discharged_count),
        loadedCount: Number(r.loaded_count),
        assignedCranes: r.assigned_cranes || [],
      }));
    }

    return res.json({
      connected: true,
      revision: stateRevision,
      activeDevicesCount: sseConnections.length,
      data: canonicalState,
    });
  } catch (err: any) {
    console.error('Error fetching Neon DB data, falling back to shared state:', err);
    return res.json({
      connected: false,
      revision: stateRevision,
      activeDevicesCount: sseConnections.length,
      data: canonicalState,
    });
  }
});

// -------------------------------------------------------------
// Real-Time CRUD API for Containers (Multi-Device Synchronized)
// -------------------------------------------------------------
app.post(['/api/containers', '/api/neon/containers'], async (req: Request, res: Response) => {
  const c = req.body;
  const senderClientId = req.headers['x-client-id'] as string | undefined;

  // 1. Update in-memory canonical state immediately
  const existingIdx = canonicalState.containers.findIndex((x: any) => x.id === c.id || x.containerNumber === c.containerNumber);
  if (existingIdx !== -1) {
    canonicalState.containers[existingIdx] = c;
  } else {
    canonicalState.containers.unshift(c);
  }

  // 2. Broadcast to all connected devices instantly
  broadcastEvent({
    type: 'container_created',
    data: c,
    senderClientId,
  });

  // 3. Persist to Neon DB asynchronously if connected
  const sql = getNeonSql();
  if (sql) {
    sql`
      INSERT INTO kict_containers (
        id, container_number, size, type, iso_code, weight_gross_kg, 
        tare_weight_kg, payload_kg, seal_number, shipping_line, owner, 
        consignee, status, yard_block, yard_bay, yard_row, yard_tier, 
        temperature_celsius, hazard_class, discharge_port, loading_port, 
        final_destination, dwell_days, updated_at
      ) VALUES (
        ${c.id}, ${c.containerNumber}, ${c.size}, ${c.type}, ${c.isoCode}, 
        ${c.weightGrossKg}, ${c.tareWeightKg}, ${c.payloadKg}, ${c.sealNumber}, 
        ${c.shippingLine}, ${c.owner}, ${c.consignee}, ${c.status}, 
        ${c.yardLocation?.block || null}, ${c.yardLocation?.bay || null}, 
        ${c.yardLocation?.row || null}, ${c.yardLocation?.tier || null}, 
        ${c.temperatureCelsius ?? null}, ${c.hazardClass || null}, 
        ${c.dischargePort}, ${c.loadingPort}, ${c.finalDestination}, 
        ${c.dwellDays || 0}, ${c.updatedAt || new Date().toISOString()}
      ) ON CONFLICT (id) DO UPDATE SET
        yard_block = EXCLUDED.yard_block,
        yard_bay = EXCLUDED.yard_bay,
        yard_row = EXCLUDED.yard_row,
        yard_tier = EXCLUDED.yard_tier,
        status = EXCLUDED.status,
        updated_at = NOW();
    `.catch(err => console.error('Neon container sync error:', err));
  }

  return res.json({ success: true, container: c });
});

app.put(['/api/containers/:id', '/api/neon/containers/:id'], async (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const senderClientId = req.headers['x-client-id'] as string | undefined;

  // 1. Update in-memory state
  const idx = canonicalState.containers.findIndex((x: any) => x.id === id);
  if (idx !== -1) {
    canonicalState.containers[idx] = {
      ...canonicalState.containers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  // 2. Broadcast to other devices
  broadcastEvent({
    type: 'container_updated',
    data: { id, ...updates },
    senderClientId,
  });

  // 3. Neon DB async
  const sql = getNeonSql();
  if (sql && updates.yardLocation) {
    sql`
      UPDATE kict_containers
      SET yard_block = ${updates.yardLocation.block},
          yard_bay = ${updates.yardLocation.bay},
          yard_row = ${updates.yardLocation.row},
          yard_tier = ${updates.yardLocation.tier},
          status = COALESCE(${updates.status}, status),
          updated_at = NOW()
      WHERE id = ${id}
    `.catch(err => console.error('Neon container update error:', err));
  }

  return res.json({ success: true, id });
});

app.delete(['/api/containers/:id', '/api/neon/containers/:id'], async (req: Request, res: Response) => {
  const id = req.params.id;
  const senderClientId = req.headers['x-client-id'] as string | undefined;

  canonicalState.containers = canonicalState.containers.filter((x: any) => x.id !== id);

  broadcastEvent({
    type: 'container_deleted',
    data: { id },
    senderClientId,
  });

  const sql = getNeonSql();
  if (sql) {
    sql`DELETE FROM kict_containers WHERE id = ${id}`.catch(err => console.error('Neon container delete error:', err));
  }

  return res.json({ success: true, id });
});

// -------------------------------------------------------------
// Real-Time CRUD API for Gate Logs (Multi-Device Synchronized)
// -------------------------------------------------------------
app.post(['/api/gate-logs', '/api/neon/gate-logs'], async (req: Request, res: Response) => {
  const g = req.body;
  const senderClientId = req.headers['x-client-id'] as string | undefined;

  canonicalState.gateLogs.unshift(g);

  // If gate in, ensure container location is in yard
  if (g.direction === 'gate_in' && g.assignedYardSlot) {
    const existing = canonicalState.containers.find((c: any) => c.containerNumber === g.containerNumber);
    const parts = g.assignedYardSlot.split('-');
    if (existing) {
      existing.status = 'yard_stacked';
      existing.yardLocation = {
        block: parts[0] || 'A',
        bay: parseInt(parts[1]) || 1,
        row: parseInt(parts[2]) || 1,
        tier: parseInt(parts[3]) || 1,
      };
    }
  }

  broadcastEvent({
    type: 'gate_transaction',
    data: g,
    senderClientId,
  });

  const sql = getNeonSql();
  if (sql) {
    sql`
      INSERT INTO kict_gate_logs (
        id, ticket_number, direction, lane, timestamp, truck_plate, 
        driver_name, driver_id_number, trucking_company, container_number, 
        container_size, container_type, seal_number, weighbridge_gross_kg, 
        weighbridge_tare_kg, net_weight_kg, eir_number, assigned_yard_slot, 
        status, remarks
      ) VALUES (
        ${g.id}, ${g.ticketNumber}, ${g.direction}, ${g.lane}, 
        ${g.timestamp}, ${g.truckPlate}, ${g.driverName}, ${g.driverIdNumber || null}, 
        ${g.truckingCompany}, ${g.containerNumber}, ${g.containerSize}, 
        ${g.containerType}, ${g.sealNumber}, ${g.weighbridgeGrossKg}, 
        ${g.weighbridgeTareKg}, ${g.netWeightKg}, ${g.eirNumber}, 
        ${g.assignedYardSlot}, ${g.status}, ${g.remarks || null}
      )
    `.catch(err => console.error('Neon gate log sync error:', err));
  }

  return res.json({ success: true, log: g });
});

// -------------------------------------------------------------
// Real-Time CRUD API for Vessels (Multi-Device Synchronized)
// -------------------------------------------------------------
app.post(['/api/vessels', '/api/neon/vessels'], async (req: Request, res: Response) => {
  const v = req.body;
  const senderClientId = req.headers['x-client-id'] as string | undefined;

  const idx = canonicalState.vessels.findIndex((x: any) => x.id === v.id);
  if (idx !== -1) {
    canonicalState.vessels[idx] = { ...canonicalState.vessels[idx], ...v };
  } else {
    canonicalState.vessels.unshift(v);
  }

  broadcastEvent({
    type: 'vessel_updated',
    data: v,
    senderClientId,
  });

  const sql = getNeonSql();
  if (sql) {
    sql`
      INSERT INTO kict_vessels (
        id, vessel_name, call_sign, imo_number, shipping_line, voyage_in, 
        voyage_out, loa_meters, draft_meters, berth_location, eta, etd, 
        status, total_discharge, total_load, discharged_count, loaded_count, 
        assigned_cranes
      ) VALUES (
        ${v.id}, ${v.vesselName}, ${v.callSign}, ${v.imoNumber}, ${v.shippingLine}, 
        ${v.voyageIn}, ${v.voyageOut}, ${v.loaMeters}, ${v.draftMeters}, 
        ${v.berthLocation}, ${v.eta}, ${v.etd}, ${v.status}, ${v.totalDischarge || 0}, 
        ${v.totalLoad || 0}, ${v.dischargedCount || 0}, ${v.loadedCount || 0}, 
        ${v.assignedCranes || []}
      ) ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        berth_location = EXCLUDED.berth_location,
        discharged_count = EXCLUDED.discharged_count,
        loaded_count = EXCLUDED.loaded_count,
        assigned_cranes = EXCLUDED.assigned_cranes
    `.catch(err => console.error('Neon vessel sync error:', err));
  }

  return res.json({ success: true, vessel: v });
});

app.delete(['/api/vessels/:id', '/api/neon/vessels/:id'], async (req: Request, res: Response) => {
  const id = req.params.id;
  const senderClientId = req.headers['x-client-id'] as string | undefined;

  canonicalState.vessels = canonicalState.vessels.filter((x: any) => x.id !== id);

  broadcastEvent({
    type: 'vessel_deleted',
    data: { id },
    senderClientId,
  });

  const sql = getNeonSql();
  if (sql) {
    sql`DELETE FROM kict_vessels WHERE id = ${id}`.catch(err => console.error('Neon vessel delete error:', err));
  }

  return res.json({ success: true, id });
});

// -------------------------------------------------------------
// Real-Time CRUD API for Equipment & Invoices & EEIR
// -------------------------------------------------------------
app.put('/api/equipment/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const senderClientId = req.headers['x-client-id'] as string | undefined;

  const idx = canonicalState.equipment.findIndex((e: any) => e.id === id);
  if (idx !== -1) {
    canonicalState.equipment[idx] = { ...canonicalState.equipment[idx], ...updates };
  }

  broadcastEvent({
    type: 'equipment_updated',
    data: { id, ...updates },
    senderClientId,
  });

  return res.json({ success: true });
});

app.post('/api/invoices', (req: Request, res: Response) => {
  const inv = req.body;
  canonicalState.invoices.unshift(inv);
  broadcastEvent({
    type: 'invoice_created',
    data: inv,
  });
  return res.json({ success: true, invoice: inv });
});

app.post('/api/eeir', (req: Request, res: Response) => {
  const eir = req.body;
  canonicalState.eeirInspections.unshift(eir);
  broadcastEvent({
    type: 'eeir_created',
    data: eir,
  });
  return res.json({ success: true, inspection: eir });
});

app.post('/api/reset', (req: Request, res: Response) => {
  canonicalState = getInitialDatabaseState();
  broadcastEvent({
    type: 'state_reset',
    data: canonicalState,
  });
  return res.json({ success: true, message: 'Server state reset to initial KICT master data' });
});

// -------------------------------------------------------------
// Vite Middlewares (Dev) or Static Server (Prod)
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Hook Vite middleware into Express
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built dist files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KICT TOS] Multi-Device Real-Time Server running on http://0.0.0.0:${PORT}`);
    console.log(`[KICT TOS] Initial canonical state loaded with ${canonicalState.containers.length} containers, ${canonicalState.vessels.length} vessels.`);
  });
}

startServer();
