/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Real-Time Push Notification Engine
 */

import { PushNotification } from '../types/tos';

type NotificationListener = (notifications: PushNotification[], latest?: PushNotification) => void;

class NotificationEngine {
  private notifications: PushNotification[] = [
    {
      id: 'notif-1',
      timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
      title: 'Gate In Otomatis Berhasil',
      message: 'Truk AA 8912 KD kontainer MSKU9284710 telah melewati Lane 1 dan diarahkan ke Blok A-02-03-2.',
      category: 'gate',
      level: 'success',
      read: false,
    },
    {
      id: 'notif-2',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      title: 'Pergerakan RTG-01 Update',
      message: 'E-RTG 01 menyelesaikan stacking kontainer export di Blok A Bay 04.',
      category: 'equipment',
      level: 'info',
      read: false,
    },
    {
      id: 'notif-3',
      timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
      title: 'Vessel Berthing Status',
      message: 'MV Samudera Kebumen Raya (Meratus) telah bersandar aman di Berth 01. Stevedoring dimulai.',
      category: 'vessel',
      level: 'info',
      read: true,
    }
  ];

  private listeners: Set<NotificationListener> = new Set();
  private audioEnabled: boolean = true;
  private simulationTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startLiveSimulation();
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.notifications);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getNotifications(): PushNotification[] {
    return [...this.notifications];
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public markAllAsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.emitChange();
  }

  public markAsRead(id: string): void {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.emitChange();
  }

  public clearAll(): void {
    this.notifications = [];
    this.emitChange();
  }

  public push(notif: Omit<PushNotification, 'id' | 'timestamp' | 'read'>): PushNotification {
    const newNotif: PushNotification = {
      ...notif,
      id: 'notif-' + Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(newNotif);
    // Keep max 50 items
    if (this.notifications.length > 50) {
      this.notifications.pop();
    }
    this.playChime();
    this.emitChange(newNotif);
    return newNotif;
  }

  private emitChange(latest?: PushNotification): void {
    this.listeners.forEach(listener => listener(this.notifications, latest));
  }

  public playChime(): void {
    if (!this.audioEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio autoplay policy might restrict until user gesture
    }
  }

  public triggerMockEvent(): void {
    const mockEvents: Array<Omit<PushNotification, 'id' | 'timestamp' | 'read'>> = [
      {
        title: 'OCR Gate Scan: Truk R 7729 ED',
        message: 'Kontainer ONEY8830192 terverifikasi. Berat kotor 29.500 Kg, diarahkan ke Blok DG.',
        category: 'gate',
        level: 'info',
      },
      {
        title: 'Crane QC-03 Produktivitas Tinggi',
        message: 'STS QC-03 mencatat 32 moves/jam pada MV MSC Pacific Horizon.',
        category: 'vessel',
        level: 'success',
      },
      {
        title: 'Tagihan THC & Lo-Lo Terbayar',
        message: 'Invoice INV/KICT/2026/09/0149 (PT Samudera Bahari) lunas via Virtual Account.',
        category: 'billing',
        level: 'success',
      },
      {
        title: 'Sensor Reefer Alert: Suhu Normal',
        message: 'Reefer MEDU4481029 di Blok R-01 stabil pada suhu -18.5°C.',
        category: 'yard',
        level: 'info',
      },
      {
        title: 'e-EIR Digital Sign-Off Disetujui',
        message: 'Inspektur lapangan telah mengesahkan kondisi fisik kontainer gate in.',
        category: 'system',
        level: 'info',
      }
    ];

    const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    this.push(randomEvent);
  }

  private startLiveSimulation(): void {
    // Occasionally simulate live events (every 50 seconds)
    if (this.simulationTimer) clearInterval(this.simulationTimer);
    this.simulationTimer = setInterval(() => {
      // 40% chance every 50 seconds to push real-time event
      if (Math.random() > 0.4) {
        this.triggerMockEvent();
      }
    }, 50000);
  }
}

export const notificationService = new NotificationEngine();
