'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, X } from 'lucide-react';
import { useHelpChats } from '@/lib/storage';
import { 
  triggerIncomingMessageNotification, 
  hasMessageBeenNotified,
  markMessageAsNotified
} from '@/lib/notifications';

interface GlobalMessageNotifierProps {
  /** The current active user ID (if any) */
  activeUserId?: string;
  /** Current active view */
  currentView?: string;
  /** Callback to navigate to chat if user clicks on the notification banner */
  onOpenChat?: () => void;
}

export default function GlobalMessageNotifier({
  activeUserId,
  currentView,
  onOpenChat,
}: GlobalMessageNotifierProps) {
  const helpChats = useHelpChats();
  const [activeToast, setActiveToast] = useState<{
    id: string;
    text: string;
    sender: string;
  } | null>(null);

  const prevChatsCountRef = useRef<number>(helpChats.length);
  const isInitialMount = useRef<boolean>(true);

  // Monitor incoming messages in real-time (cross-tab via BroadcastChannel & storage)
  useEffect(() => {
    // Skip checking on very first render to avoid notifying old messages
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevChatsCountRef.current = helpChats.length;
      return;
    }

    if (helpChats.length > prevChatsCountRef.current) {
      // Find new messages sent by admin
      const newMessages = helpChats.slice(prevChatsCountRef.current);
      for (const msg of newMessages) {
        if (msg.sender === 'admin' && !hasMessageBeenNotified(msg.id)) {
          // If activeUserId is provided, only notify if message belongs to this user
          if (!activeUserId || msg.memberId === activeUserId) {
            markMessageAsNotified(msg.id);

            // Don't sound alarm if user is currently inside Admin panel
            if (currentView !== 'admin') {
              triggerIncomingMessageNotification('Special One ❤️', msg.text, msg.id);

              // Show floating in-app banner
              setActiveToast({
                id: msg.id,
                text: msg.text,
                sender: 'Special One ❤️',
              });

              // Auto dismiss toast after 7 seconds
              setTimeout(() => {
                setActiveToast(prev => (prev?.id === msg.id ? null : prev));
              }, 7000);
            }
          }
        }
      }
    }

    prevChatsCountRef.current = helpChats.length;
  }, [helpChats, activeUserId, currentView]);

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 right-4 z-[9999] max-w-sm w-full p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-pink-200 overflow-hidden"
        >
          <div className="flex items-start gap-3">
            {/* Romantic Heart Avatar */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff477e] to-[#ff0055] text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
              <Heart className="w-6 h-6 fill-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-black text-[#ff0055] uppercase tracking-wider flex items-center gap-1">
                  <span>{activeToast.sender}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                </span>
                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-bold text-[#2D3436] mt-1 line-clamp-2 leading-relaxed">
                &ldquo;{activeToast.text}&rdquo;
              </p>

              {onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveToast(null);
                    onOpenChat();
                  }}
                  className="mt-2 text-[11px] font-black text-white bg-gradient-to-r from-[#ff477e] to-[#ff0055] px-3 py-1.5 rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>Reply Karein / Chat Kholein</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
