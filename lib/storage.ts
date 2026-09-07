import React from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { db } from './firebase';
import firebaseConfig from '@/firebase-applet-config.json';
import { 
  Member, 
  INITIAL_MEMBERS, 
  RomanticPageConfig, 
  DEFAULT_ROMANTIC_CONFIG, 
  FriendlyPageConfig, 
  DEFAULT_FRIENDLY_CONFIG, 
  WhatsAppRegistration, 
  HelpChatMessage,
  INITIAL_HELP_CHATS 
} from './types';

const STORAGE_KEY_MEMBERS = 'welcome_app_members_v1';
const STORAGE_KEY_CONFIG = 'welcome_app_romantic_config_v1';
const STORAGE_KEY_FRIENDLY_CONFIG = 'welcome_app_friendly_config_v1';
const STORAGE_KEY_WHATSAPP = 'welcome_app_whatsapp_leads_v1';
const STORAGE_KEY_CHATS = 'welcome_app_help_chats_v1';
const STORAGE_KEY_BLOCKED = 'welcome_app_blocked_users_v1';
const STORAGE_KEY_ACTIVE_USER = 'welcome_app_active_user_id_v1';

/* ------------------- FIREBASE PROJECT INFO ------------------- */
export function getFirebaseProjectInfo() {
  return {
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
    databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    authDomain: firebaseConfig.authDomain,
    defaultHostingUrl: `https://${firebaseConfig.projectId}.web.app`,
    secondaryHostingUrl: `https://${firebaseConfig.projectId}.firebaseapp.com`,
  };
}

/* ------------------- FIREBASE REAL-TIME SYNC ENGINE ------------------- */
let hasInitializedFirestore = false;

export function initFirestoreListeners(): void {
  if (typeof window === 'undefined' || hasInitializedFirestore) return;
  hasInitializedFirestore = true;

  try {
    // 1. Sync Members
    onSnapshot(collection(db, 'members'), (snapshot) => {
      const loaded: Member[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Member;
        // Purge any lingering mock members from Firestore permanently
        if (data.id === 'mem_1' || data.id === 'mem_2' || data.id === 'mem_3') {
          deleteDoc(doc(db, 'members', data.id)).catch(() => {});
        } else {
          loaded.push(data);
        }
      });
      cachedMembers = loaded;
      cachedRawMembers = JSON.stringify(loaded);
      try {
        localStorage.setItem(STORAGE_KEY_MEMBERS, cachedRawMembers);
      } catch (e) {
        console.error(e);
      }
      window.dispatchEvent(new Event('members_updated'));
    }, (err) => {
      console.warn('Firestore members listener warning:', err);
    });

    // 2. Sync Romantic Config
    onSnapshot(doc(db, 'config', 'romantic'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as RomanticPageConfig;
        const merged = { ...DEFAULT_ROMANTIC_CONFIG, ...data };
        cachedConfig = merged;
        cachedRawConfig = JSON.stringify(merged);
        try {
          localStorage.setItem(STORAGE_KEY_CONFIG, cachedRawConfig);
        } catch (e) {
          console.error(e);
        }
        window.dispatchEvent(new Event('romantic_config_updated'));
      }
    }, (err) => {
      console.warn('Firestore romantic config warning:', err);
    });

    // 3. Sync Friendly Config
    onSnapshot(doc(db, 'config', 'friendly'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as FriendlyPageConfig;
        const merged = { ...DEFAULT_FRIENDLY_CONFIG, ...data };
        cachedFriendlyConfig = merged;
        cachedRawFriendlyConfig = JSON.stringify(merged);
        try {
          localStorage.setItem(STORAGE_KEY_FRIENDLY_CONFIG, cachedRawFriendlyConfig);
        } catch (e) {
          console.error(e);
        }
        window.dispatchEvent(new Event('friendly_config_updated'));
      }
    }, (err) => {
      console.warn('Firestore friendly config warning:', err);
    });

    // 4. Sync WhatsApp Registrations
    onSnapshot(collection(db, 'whatsapp_leads'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: WhatsAppRegistration[] = [];
        snapshot.forEach(docSnap => {
          loaded.push(docSnap.data() as WhatsAppRegistration);
        });
        cachedWhatsApp = loaded;
        cachedRawWhatsApp = JSON.stringify(loaded);
        try {
          localStorage.setItem(STORAGE_KEY_WHATSAPP, cachedRawWhatsApp);
        } catch (e) {
          console.error(e);
        }
        window.dispatchEvent(new Event('whatsapp_leads_updated'));
      }
    }, (err) => {
      console.warn('Firestore whatsapp leads warning:', err);
    });

    // 5. Sync Help Chats
    onSnapshot(collection(db, 'help_chats'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: HelpChatMessage[] = [];
        snapshot.forEach(docSnap => {
          loaded.push(docSnap.data() as HelpChatMessage);
        });
        cachedChats = loaded;
        cachedRawChats = JSON.stringify(loaded);
        try {
          localStorage.setItem(STORAGE_KEY_CHATS, cachedRawChats);
        } catch (e) {
          console.error(e);
        }
        window.dispatchEvent(new Event('help_chats_updated'));
      }
    }, (err) => {
      console.warn('Firestore help chats warning:', err);
    });

    // 6. Sync Blocked Users
    onSnapshot(collection(db, 'blocked_users'), (snapshot) => {
      const loaded: string[] = [];
      snapshot.forEach(docSnap => {
        loaded.push(docSnap.id);
      });
      cachedBlocked = loaded;
      cachedRawBlocked = JSON.stringify(loaded);
      try {
        localStorage.setItem(STORAGE_KEY_BLOCKED, cachedRawBlocked);
      } catch (e) {
        console.error(e);
      }
      window.dispatchEvent(new Event('blocked_users_updated'));
    }, (err) => {
      console.warn('Firestore blocked users warning:', err);
    });
  } catch (err) {
    console.error('Error starting Firestore listeners:', err);
  }
}

/* ------------------- ACTIVE DEVICE USER SESSION ------------------- */
export function getActiveUserMemberId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
  } catch (err) {
    return null;
  }
}

export function setActiveUserMemberId(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
    }
    window.dispatchEvent(new Event('active_user_updated'));
  } catch (err) {
    console.error('Failed to set active user id:', err);
  }
}

export function getActiveUser(): Member | null {
  const activeId = getActiveUserMemberId();
  if (!activeId) return null;
  const members = getStoredMembers();
  const found = members.find(m => m.id === activeId);
  if (!found) {
    // If the member was deleted by admin, invalidate device session immediately
    setActiveUserMemberId(null);
    return null;
  }
  return found;
}

export function clearActiveUserSession(): void {
  setActiveUserMemberId(null);
}

const subscribeActiveUser = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('active_user_updated', callback);
  window.addEventListener('members_updated', callback);
  return () => {
    window.removeEventListener('active_user_updated', callback);
    window.removeEventListener('members_updated', callback);
  };
};
const getActiveUserSnapshot = () => getActiveUser();
const getActiveUserServerSnapshot = () => null;

export function useActiveUser(): Member | null {
  return React.useSyncExternalStore(subscribeActiveUser, getActiveUserSnapshot, getActiveUserServerSnapshot);
}

/* ------------------- MEMBERS STORE ------------------- */
let cachedMembers: Member[] | null = null;
let cachedRawMembers: string | null = null;

function readMembersInternal(): Member[] {
  if (typeof window === 'undefined') return [];
  initFirestoreListeners();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify([]));
      cachedRawMembers = JSON.stringify([]);
      cachedMembers = [];
      return [];
    }
    if (raw === cachedRawMembers && cachedMembers) return cachedMembers;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge any lingering mock members
      const clean = parsed.filter((m: Member) => m && m.id !== 'mem_1' && m.id !== 'mem_2' && m.id !== 'mem_3');
      if (clean.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(clean));
      }
      cachedRawMembers = JSON.stringify(clean);
      cachedMembers = clean;
      return clean;
    }
    cachedRawMembers = JSON.stringify([]);
    cachedMembers = [];
    return [];
  } catch (err) {
    console.error('Error reading members:', err);
    return [];
  }
}

export function getStoredMembers(): Member[] {
  return readMembersInternal();
}

export function saveMember(newMemberData: Omit<Member, 'id' | 'registeredAt' | 'status'>): Member {
  const current = getStoredMembers();
  const dateStr = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const newMember: Member = {
    ...newMemberData,
    id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    registeredAt: dateStr,
    status: 'New',
  };

  const updated = [newMember, ...current];
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_MEMBERS, raw);
      cachedRawMembers = raw;
      cachedMembers = updated;
      // Auto-set as active device user
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, newMember.id);
      window.dispatchEvent(new Event('active_user_updated'));
      window.dispatchEvent(new Event('members_updated'));
    } catch (e) {
      console.error('Failed to save member:', e);
    }

    // Persist to Cloud Firestore
    setDoc(doc(db, 'members', newMember.id), newMember).catch((err) => {
      console.error('Failed to save member to Firestore:', err);
    });
  }
  return newMember;
}

export function updateMemberStatus(id: string, status: Member['status']): Member[] {
  const current = getStoredMembers();
  const updated = current.map(m => (m.id === id ? { ...m, status } : m));
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_MEMBERS, raw);
      cachedRawMembers = raw;
      cachedMembers = updated;
      window.dispatchEvent(new Event('members_updated'));
    } catch (e) {
      console.error('Failed to update member status:', e);
    }

    // Update in Firestore
    updateDoc(doc(db, 'members', id), { status }).catch((err) => {
      console.error('Failed to update member status in Firestore:', err);
    });
  }
  return updated;
}

export function deleteMember(id: string): Member[] {
  const current = getStoredMembers();
  const updated = current.filter(m => m.id !== id);
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_MEMBERS, raw);
      cachedRawMembers = raw;
      cachedMembers = updated;

      // If active user was deleted, reset session
      if (getActiveUserMemberId() === id) {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
        window.dispatchEvent(new Event('active_user_updated'));
      }

      window.dispatchEvent(new Event('members_updated'));
    } catch (e) {
      console.error('Failed to delete member:', e);
    }

    // Delete from Firestore
    deleteDoc(doc(db, 'members', id)).catch((err) => {
      console.error('Failed to delete member from Firestore:', err);
    });
  }
  return updated;
}

export function deleteMembersBatch(ids: string[]): Member[] {
  const current = getStoredMembers();
  const idSet = new Set(ids);
  const updated = current.filter(m => !idSet.has(m.id));
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_MEMBERS, raw);
      cachedRawMembers = raw;
      cachedMembers = updated;

      // Check if active user was among deleted
      const activeId = getActiveUserMemberId();
      if (activeId && idSet.has(activeId)) {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
        window.dispatchEvent(new Event('active_user_updated'));
      }

      window.dispatchEvent(new Event('members_updated'));
    } catch (e) {
      console.error('Failed to batch delete members:', e);
    }

    // Delete batch in Firestore
    ids.forEach((id) => {
      deleteDoc(doc(db, 'members', id)).catch(() => {});
    });
  }
  return updated;
}

export function clearAllMembers(): Member[] {
  const updated: Member[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_MEMBERS, raw);
      cachedRawMembers = raw;
      cachedMembers = updated;

      localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
      window.dispatchEvent(new Event('active_user_updated'));

      window.dispatchEvent(new Event('members_updated'));
    } catch (e) {
      console.error('Failed to clear all members:', e);
    }

    // Clear Firestore collection
    getDocs(collection(db, 'members')).then((snapshot) => {
      snapshot.forEach(docSnap => {
        deleteDoc(doc(db, 'members', docSnap.id)).catch(() => {});
      });
    }).catch(console.error);
  }
  return updated;
}

const subscribeMembers = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('members_updated', callback);
  return () => window.removeEventListener('members_updated', callback);
};
const getMembersSnapshot = () => readMembersInternal();
const getMembersServerSnapshot = () => [];

export function useMembers(): Member[] {
  return React.useSyncExternalStore(subscribeMembers, getMembersSnapshot, getMembersServerSnapshot);
}

/* ------------------- ROMANTIC PAGE CONFIG STORE ------------------- */
let cachedConfig: RomanticPageConfig | null = null;
let cachedRawConfig: string | null = null;

function readConfigInternal(): RomanticPageConfig {
  if (typeof window === 'undefined') return DEFAULT_ROMANTIC_CONFIG;
  initFirestoreListeners();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(DEFAULT_ROMANTIC_CONFIG));
      cachedRawConfig = JSON.stringify(DEFAULT_ROMANTIC_CONFIG);
      cachedConfig = DEFAULT_ROMANTIC_CONFIG;
      return DEFAULT_ROMANTIC_CONFIG;
    }
    if (raw === cachedRawConfig && cachedConfig) return cachedConfig;
    const parsed = JSON.parse(raw);
    const merged = {
      ...DEFAULT_ROMANTIC_CONFIG,
      ...parsed,
      socialLinks: {
        ...DEFAULT_ROMANTIC_CONFIG.socialLinks,
        ...(parsed.socialLinks || {}),
      },
    };
    cachedRawConfig = raw;
    cachedConfig = merged;
    return merged;
  } catch (err) {
    console.error('Error reading romantic config:', err);
    return DEFAULT_ROMANTIC_CONFIG;
  }
}

export function getRomanticConfig(): RomanticPageConfig {
  return readConfigInternal();
}

export function saveRomanticConfig(newConfig: RomanticPageConfig): RomanticPageConfig {
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(newConfig);
      localStorage.setItem(STORAGE_KEY_CONFIG, raw);
      cachedRawConfig = raw;
      cachedConfig = newConfig;
      window.dispatchEvent(new Event('romantic_config_updated'));
    } catch (e) {
      console.error('Failed to save romantic config:', e);
    }

    // Save to Firestore
    setDoc(doc(db, 'config', 'romantic'), newConfig).catch((err) => {
      console.error('Failed to save romantic config to Firestore:', err);
    });
  }
  return newConfig;
}

const subscribeRomanticConfig = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('romantic_config_updated', callback);
  return () => window.removeEventListener('romantic_config_updated', callback);
};
const getRomanticSnapshot = () => readConfigInternal();
const getRomanticServerSnapshot = () => DEFAULT_ROMANTIC_CONFIG;

export function useRomanticConfig(): RomanticPageConfig {
  return React.useSyncExternalStore(subscribeRomanticConfig, getRomanticSnapshot, getRomanticServerSnapshot);
}

/* ------------------- FRIENDLY PAGE CONFIG STORE ------------------- */
let cachedFriendlyConfig: FriendlyPageConfig | null = null;
let cachedRawFriendlyConfig: string | null = null;

function readFriendlyConfigInternal(): FriendlyPageConfig {
  if (typeof window === 'undefined') return DEFAULT_FRIENDLY_CONFIG;
  initFirestoreListeners();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FRIENDLY_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FRIENDLY_CONFIG, JSON.stringify(DEFAULT_FRIENDLY_CONFIG));
      cachedRawFriendlyConfig = JSON.stringify(DEFAULT_FRIENDLY_CONFIG);
      cachedFriendlyConfig = DEFAULT_FRIENDLY_CONFIG;
      return DEFAULT_FRIENDLY_CONFIG;
    }
    if (raw === cachedRawFriendlyConfig && cachedFriendlyConfig) return cachedFriendlyConfig;
    const parsed = JSON.parse(raw);
    const merged: FriendlyPageConfig = {
      ...DEFAULT_FRIENDLY_CONFIG,
      ...parsed,
      socialLinks: {
        ...DEFAULT_FRIENDLY_CONFIG.socialLinks,
        ...(parsed.socialLinks || {}),
      },
    };
    cachedRawFriendlyConfig = raw;
    cachedFriendlyConfig = merged;
    return merged;
  } catch (err) {
    console.error('Error reading friendly config:', err);
    return DEFAULT_FRIENDLY_CONFIG;
  }
}

export function getFriendlyConfig(): FriendlyPageConfig {
  return readFriendlyConfigInternal();
}

export function saveFriendlyConfig(newConfig: FriendlyPageConfig): FriendlyPageConfig {
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(newConfig);
      localStorage.setItem(STORAGE_KEY_FRIENDLY_CONFIG, raw);
      cachedRawFriendlyConfig = raw;
      cachedFriendlyConfig = newConfig;
      window.dispatchEvent(new Event('friendly_config_updated'));
    } catch (e) {
      console.error('Failed to save friendly config:', e);
    }

    // Save to Firestore
    setDoc(doc(db, 'config', 'friendly'), newConfig).catch((err) => {
      console.error('Failed to save friendly config to Firestore:', err);
    });
  }
  return newConfig;
}

const subscribeFriendlyConfig = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('friendly_config_updated', callback);
  return () => window.removeEventListener('friendly_config_updated', callback);
};
const getFriendlySnapshot = () => readFriendlyConfigInternal();
const getFriendlyServerSnapshot = () => DEFAULT_FRIENDLY_CONFIG;

export function useFriendlyConfig(): FriendlyPageConfig {
  return React.useSyncExternalStore(subscribeFriendlyConfig, getFriendlySnapshot, getFriendlyServerSnapshot);
}

/* ------------------- WHATSAPP REGISTRATIONS STORE ------------------- */
const INITIAL_WHATSAPP_LEADS: WhatsAppRegistration[] = [];

let cachedWhatsApp: WhatsAppRegistration[] | null = null;
let cachedRawWhatsApp: string | null = null;

function readWhatsAppInternal(): WhatsAppRegistration[] {
  if (typeof window === 'undefined') return [];
  initFirestoreListeners();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WHATSAPP);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_WHATSAPP, JSON.stringify([]));
      cachedRawWhatsApp = JSON.stringify([]);
      cachedWhatsApp = [];
      return [];
    }
    if (raw === cachedRawWhatsApp && cachedWhatsApp) return cachedWhatsApp;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const clean = parsed.filter((w: WhatsAppRegistration) => w && w.id !== 'wa_1');
      if (clean.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY_WHATSAPP, JSON.stringify(clean));
      }
      cachedRawWhatsApp = JSON.stringify(clean);
      cachedWhatsApp = clean;
      return clean;
    }
    return [];
  } catch (err) {
    console.error('Error reading WhatsApp registrations:', err);
    return [];
  }
}

export function getWhatsAppRegistrations(): WhatsAppRegistration[] {
  return readWhatsAppInternal();
}

export function saveWhatsAppRegistration(lead: Omit<WhatsAppRegistration, 'id' | 'submittedAt'>): WhatsAppRegistration {
  const current = getWhatsAppRegistrations();
  const dateStr = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const newLead: WhatsAppRegistration = {
    ...lead,
    id: 'wa_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    submittedAt: dateStr,
  };

  const updated = [newLead, ...current];
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_WHATSAPP, raw);
      cachedRawWhatsApp = raw;
      cachedWhatsApp = updated;
      window.dispatchEvent(new Event('whatsapp_leads_updated'));
    } catch (e) {
      console.error('Failed to save WhatsApp registration:', e);
    }

    // Save to Firestore
    setDoc(doc(db, 'whatsapp_leads', newLead.id), newLead).catch((err) => {
      console.error('Failed to save WhatsApp lead to Firestore:', err);
    });
  }
  return newLead;
}

export function deleteWhatsAppRegistration(id: string): WhatsAppRegistration[] {
  const current = getWhatsAppRegistrations();
  const updated = current.filter(w => w.id !== id);
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_WHATSAPP, raw);
      cachedRawWhatsApp = raw;
      cachedWhatsApp = updated;
      window.dispatchEvent(new Event('whatsapp_leads_updated'));
    } catch (e) {
      console.error('Failed to delete WhatsApp registration:', e);
    }

    // Delete in Firestore
    deleteDoc(doc(db, 'whatsapp_leads', id)).catch((err) => {
      console.error('Failed to delete WhatsApp lead in Firestore:', err);
    });
  }
  return updated;
}

const subscribeWhatsApp = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('whatsapp_leads_updated', callback);
  return () => window.removeEventListener('whatsapp_leads_updated', callback);
};
const getWhatsAppSnapshot = () => readWhatsAppInternal();
const getWhatsAppServerSnapshot = () => [];

export function useWhatsAppRegistrations(): WhatsAppRegistration[] {
  return React.useSyncExternalStore(subscribeWhatsApp, getWhatsAppSnapshot, getWhatsAppServerSnapshot);
}

/* ------------------- HELP CHAT MESSAGES STORE ------------------- */
let cachedChats: HelpChatMessage[] | null = null;
let cachedRawChats: string | null = null;

// Cross-tab broadcast channel for instantaneous zero-latency chat sync across multiple tabs
const chatBroadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('vibematch_cross_tab_chat')
    : null;

function readHelpChatsInternal(): HelpChatMessage[] {
  if (typeof window === 'undefined') return [];
  initFirestoreListeners();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHATS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify([]));
      cachedRawChats = JSON.stringify([]);
      cachedChats = [];
      return [];
    }
    if (raw === cachedRawChats && cachedChats) return cachedChats;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const clean = parsed.filter((c: HelpChatMessage) => c && c.id !== 'msg_init_1' && c.id !== 'msg_init_2');
      if (clean.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(clean));
      }
      cachedRawChats = JSON.stringify(clean);
      cachedChats = clean;
      return clean;
    }
    return [];
  } catch (err) {
    console.error('Error reading help chats:', err);
    return [];
  }
}

export function getHelpChatMessages(): HelpChatMessage[] {
  return readHelpChatsInternal();
}

export function sendHelpChatMessage(msg: Omit<HelpChatMessage, 'id' | 'timestamp'>): HelpChatMessage {
  const current = getHelpChatMessages();
  const timeStr = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date());

  const newMsg: HelpChatMessage = {
    ...msg,
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: timeStr,
  };

  const updated = [...current, newMsg];
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_CHATS, raw);
      cachedRawChats = raw;
      cachedChats = updated;
      window.dispatchEvent(new Event('help_chats_updated'));

      // Broadcast to other browser tabs instantly
      try {
        chatBroadcastChannel?.postMessage({
          type: 'NEW_CHAT_MESSAGE',
          message: newMsg,
        });
      } catch (bcErr) {
        console.warn('Broadcast error:', bcErr);
      }
    } catch (e) {
      console.error('Failed to send help chat message:', e);
    }

    // Save to Firestore
    setDoc(doc(db, 'help_chats', newMsg.id), newMsg).catch((err) => {
      console.error('Failed to save help chat message in Firestore:', err);
    });
  }
  return newMsg;
}

export function clearHelpChatForMember(memberId: string): HelpChatMessage[] {
  const current = getHelpChatMessages();
  const updated = current.filter(c => c.memberId !== memberId);
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_CHATS, raw);
      cachedRawChats = raw;
      cachedChats = updated;
      window.dispatchEvent(new Event('help_chats_updated'));
    } catch (e) {
      console.error('Failed to clear chat:', e);
    }

    // Delete for member in Firestore
    getDocs(collection(db, 'help_chats')).then((snapshot) => {
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as HelpChatMessage;
        if (data.memberId === memberId) {
          deleteDoc(doc(db, 'help_chats', docSnap.id)).catch(() => {});
        }
      });
    }).catch(console.error);
  }
  return updated;
}

export function deleteHelpChatMessage(messageId: string): HelpChatMessage[] {
  const current = getHelpChatMessages();
  const updated = current.filter(c => c.id !== messageId);
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_CHATS, raw);
      cachedRawChats = raw;
      cachedChats = updated;
      window.dispatchEvent(new Event('help_chats_updated'));
    } catch (e) {
      console.error('Failed to delete chat message:', e);
    }

    // Delete in Firestore
    deleteDoc(doc(db, 'help_chats', messageId)).catch((err) => {
      console.error('Failed to delete chat message in Firestore:', err);
    });
  }
  return updated;
}

export function clearAllHelpChats(): HelpChatMessage[] {
  const updated: HelpChatMessage[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_CHATS, raw);
      cachedRawChats = raw;
      cachedChats = updated;
      window.dispatchEvent(new Event('help_chats_updated'));
    } catch (e) {
      console.error('Failed to clear all chats:', e);
    }

    // Clear in Firestore
    getDocs(collection(db, 'help_chats')).then((snapshot) => {
      snapshot.forEach(docSnap => {
        deleteDoc(doc(db, 'help_chats', docSnap.id)).catch(() => {});
      });
    }).catch(console.error);
  }
  return updated;
}

const subscribeHelpChats = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_CHATS) {
      cachedChats = null;
      cachedRawChats = null;
      callback();
    }
  };

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'NEW_CHAT_MESSAGE') {
      cachedChats = null;
      cachedRawChats = null;
      callback();
    }
  };

  window.addEventListener('help_chats_updated', callback);
  window.addEventListener('storage', handleStorage);
  if (chatBroadcastChannel) {
    chatBroadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('help_chats_updated', callback);
    window.removeEventListener('storage', handleStorage);
    if (chatBroadcastChannel) {
      chatBroadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
};
const getHelpChatsSnapshot = () => readHelpChatsInternal();
const getHelpChatsServerSnapshot = () => [];

export function useHelpChats(): HelpChatMessage[] {
  return React.useSyncExternalStore(subscribeHelpChats, getHelpChatsSnapshot, getHelpChatsServerSnapshot);
}

/* ------------------- BLOCKED USERS STORE ------------------- */
const EMPTY_BLOCKED: string[] = [];
let cachedBlocked: string[] | null = null;
let cachedRawBlocked: string | null = null;

function readBlockedInternal(): string[] {
  if (typeof window === 'undefined') return EMPTY_BLOCKED;
  initFirestoreListeners();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BLOCKED);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(EMPTY_BLOCKED));
      cachedRawBlocked = JSON.stringify(EMPTY_BLOCKED);
      cachedBlocked = EMPTY_BLOCKED;
      return EMPTY_BLOCKED;
    }
    if (raw === cachedRawBlocked && cachedBlocked) return cachedBlocked;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedRawBlocked = raw;
      cachedBlocked = parsed;
      return parsed;
    }
    cachedRawBlocked = raw;
    cachedBlocked = EMPTY_BLOCKED;
    return EMPTY_BLOCKED;
  } catch (err) {
    console.error('Error reading blocked users:', err);
    return EMPTY_BLOCKED;
  }
}

export function getBlockedMembers(): string[] {
  return readBlockedInternal();
}

export function isMemberBlocked(memberId: string): boolean {
  return readBlockedInternal().includes(memberId);
}

export function toggleBlockMember(memberId: string): boolean {
  const current = readBlockedInternal();
  const isBlocked = current.includes(memberId);
  const updated = isBlocked ? current.filter(id => id !== memberId) : [...current, memberId];
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY_BLOCKED, raw);
      cachedRawBlocked = raw;
      cachedBlocked = updated;
      window.dispatchEvent(new Event('blocked_users_updated'));
    } catch (e) {
      console.error('Failed to update blocked members:', e);
    }

    // Update in Firestore
    if (!isBlocked) {
      setDoc(doc(db, 'blocked_users', memberId), { blockedAt: new Date().toISOString() }).catch(() => {});
    } else {
      deleteDoc(doc(db, 'blocked_users', memberId)).catch(() => {});
    }
  }
  return !isBlocked;
}

const subscribeBlocked = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('blocked_users_updated', callback);
  return () => window.removeEventListener('blocked_users_updated', callback);
};
const getBlockedSnapshot = () => readBlockedInternal();
const getBlockedServerSnapshot = () => EMPTY_BLOCKED;

export function useBlockedMembers(): string[] {
  return React.useSyncExternalStore(subscribeBlocked, getBlockedSnapshot, getBlockedServerSnapshot);
}
