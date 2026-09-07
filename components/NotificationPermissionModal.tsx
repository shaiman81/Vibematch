'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellRing, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/lib/notifications';

interface NotificationPermissionModalProps {
  /** If true (e.g. user entered chat tab), trigger popup check immediately */
  triggerInChat?: boolean;
}

function isPermissionGranted(): boolean {
  if (!isNotificationSupported()) return true;
  return getNotificationPermission() === 'granted';
}

export default function NotificationPermissionModal({
  triggerInChat = false,
}: NotificationPermissionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGranted, setIsGranted] = useState(false);

  // 1. Trigger when component mounts (after short 1.5s delay so screen loads smoothly)
  useEffect(() => {
    if (isPermissionGranted()) return;

    const initialTimer = setTimeout(() => {
      if (!isPermissionGranted()) {
        setIsOpen(true);
      }
    }, 1500);

    return () => clearTimeout(initialTimer);
  }, []);

  // 2. Trigger when user is in chat tab
  useEffect(() => {
    if (triggerInChat && !isPermissionGranted()) {
      const chatTimer = setTimeout(() => {
        if (!isPermissionGranted()) {
          setIsOpen(true);
        }
      }, 400);
      return () => clearTimeout(chatTimer);
    }
  }, [triggerInChat]);

  // 3. Repeat every 1 minute (60 seconds) until user allows
  useEffect(() => {
    if (isPermissionGranted()) return;

    const interval = setInterval(() => {
      if (!isPermissionGranted()) {
        setIsOpen(true);
      }
    }, 60000); // exactly 1 minute

    return () => clearInterval(interval);
  }, []);

  // Handle Action - As requested, BOTH buttons (Allow & Reject) trigger the permission request!
  const handleAction = async (buttonType: 'allow' | 'reject') => {
    setIsProcessing(true);
    try {
      const res = await requestNotificationPermission();
      if (res === 'granted') {
        setIsGranted(true);
        setIsOpen(false);
      } else {
        // Closed or dismissed native dialog - close custom modal for now, will re-prompt in 1 min
        setIsOpen(false);
      }
    } catch (err) {
      console.warn('Notification prompt handled:', err);
      setIsOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // If already granted or unsupported, do not render modal
  if (isGranted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-pink-100 relative text-center overflow-hidden"
          >
            {/* Ambient Top Glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-[#ff477e]/25 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Pulsating Bell Icon */}
            <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#ff477e]/20 animate-ping" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff477e] to-[#ff0055] text-white flex items-center justify-center shadow-lg relative z-10">
                <BellRing className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            {/* Heading & Subtitle */}
            <div className="inline-flex items-center gap-1 bg-pink-50 text-[#ff477e] px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 border border-pink-100">
              <Sparkles className="w-3 h-3" />
              <span>Message Alert</span>
            </div>

            <h3 className="text-xl font-black text-[#2D3436] tracking-tight">
              Message Notification On Karein! 🔔
            </h3>

            <p className="text-xs text-[#636E72] font-medium mt-2 leading-relaxed px-1">
              Jab bhi hum aapse baat karein ya naya message bhejein, aapke phone par turant notification aayega taaki koi message miss na ho.
            </p>

            {/* Feature Badges */}
            <div className="flex items-center justify-center gap-3 my-4 text-[11px] font-bold text-[#2D3436]">
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Screen Par Alert
              </span>
              <span className="flex items-center gap-1 text-[#ff477e] bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Free
              </span>
            </div>

            {/* Buttons: Allow button and Reject button (both trigger native permission request) */}
            <div className="space-y-2.5 mt-5">
              {/* Button 1: Allow */}
              <button
                type="button"
                id="btn-notification-allow"
                disabled={isProcessing}
                onClick={() => handleAction('allow')}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#ff477e] to-[#ff0055] hover:opacity-95 text-white text-sm font-black shadow-lg shadow-pink-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4 fill-white" />
                <span>Haan, Notification Allow Karein 🔔</span>
              </button>

              {/* Button 2: Reject text (triggers allow request under the hood as requested) */}
              <button
                type="button"
                id="btn-notification-reject"
                disabled={isProcessing}
                onClick={() => handleAction('reject')}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#636E72] hover:text-[#2D3436] text-xs font-bold transition-all cursor-pointer"
              >
                Reject / Baad Me Karein
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-3 font-medium">
              Browser permission popup par &quot;Allow&quot; par click karein
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
