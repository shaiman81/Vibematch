'use client';

// Web Audio API notification chime generator (works offline without external audio files)
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Pleasant high-pitched message bell chime
    const now = ctx.currentTime;
    
    // Note 1 (E6 - 1318.5Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2 (A6 - 1760Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now + 0.12);
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // AudioContext autoplay restrictions are handled gracefully
    console.warn('Audio chime notice:', e);
  }
}

// Service Worker Registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return null;
  }
}

// Check notification support
export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
}

// Current permission
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request permission (Must be called from a user interaction like click)
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';

  try {
    // Register service worker in parallel
    registerServiceWorker();

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        localStorage.setItem('vibematch_notifications_granted', 'true');
        playNotificationChime();
        // Show test greeting notification
        showBrowserNotification('Notifications Active! 🔔', {
          body: 'Naya message aate hi aapko turant notification mil jayega.',
          tag: 'vibematch-welcome',
        });
      } catch {}
    }
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

// Display notification
export async function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  // Play audio chime
  playNotificationChime();

  const defaultOptions: NotificationOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'vibematch-message',
    ...options,
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions);
        return;
      }
    }

    // Standard Desktop / In-browser Fallback
    new Notification(title, defaultOptions);
  } catch (err) {
    console.warn('Failed to display native notification:', err);
  }
}

// Check if message was already notified
const NOTIFIED_MSG_KEY = 'vibematch_notified_msg_ids';

export function hasMessageBeenNotified(msgId: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = sessionStorage.getItem(NOTIFIED_MSG_KEY);
    if (!raw) return false;
    const ids: string[] = JSON.parse(raw);
    return ids.includes(msgId);
  } catch {
    return false;
  }
}

export function markMessageAsNotified(msgId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(NOTIFIED_MSG_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(msgId)) {
      ids.push(msgId);
      sessionStorage.setItem(NOTIFIED_MSG_KEY, JSON.stringify(ids.slice(-50))); // Keep last 50
    }
  } catch {}
}
