'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Flame, 
  ArrowLeft, 
  Phone, 
  Send, 
  X, 
  ExternalLink,
  MessageCircle,
  Home,
  ShieldCheck,
  AlertCircle,
  Check
} from 'lucide-react';
import { Member } from '@/lib/types';
import { 
  useRomanticConfig, 
  saveWhatsAppRegistration, 
  useHelpChats, 
  sendHelpChatMessage,
  useBlockedMembers 
} from '@/lib/storage';
import { trackEvent } from '@/lib/analytics';
import { 
  triggerIncomingMessageNotification, 
  hasMessageBeenNotified, 
  markMessageAsNotified 
} from '@/lib/notifications';

interface VeryRomanticScreenProps {
  member: Member;
  onBackToApp: () => void;
  onOpenAdmin?: () => void;
}

export default function VeryRomanticScreen({ member, onBackToApp }: VeryRomanticScreenProps) {
  const romanticConfig = useRomanticConfig();
  const helpChats = useHelpChats();
  const blockedMembers = useBlockedMembers();
  const isBlocked = blockedMembers.includes(member.id);

  // Active Tab: 'home' (left) or 'chat' (right)
  const [activeTab, setActiveTab] = useState<'home' | 'chat'>('home');

  // WhatsApp Dialog State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [waName, setWaName] = useState(member.name || '');
  const [waSuccess, setWaSuccess] = useState(false);
  const [waError, setWaError] = useState('');

  // In-app Chat state (User <-> Admin)
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Filter messages for this specific member
  const memberChats = helpChats.filter(c => c.memberId === member.id);
  const unreadCount = memberChats.filter(c => c.sender === 'admin').length;

  // Real-time Push Notification when Admin sends a message
  const previousChatsLenRef = useRef(memberChats.length);
  useEffect(() => {
    if (memberChats.length > previousChatsLenRef.current) {
      const latestMsg = memberChats[memberChats.length - 1];
      if (latestMsg && latestMsg.sender === 'admin' && !hasMessageBeenNotified(latestMsg.id)) {
        markMessageAsNotified(latestMsg.id);
        triggerIncomingMessageNotification('Special One ❤️', latestMsg.text, latestMsg.id);
      }
    }
    previousChatsLenRef.current = memberChats.length;
  }, [memberChats]);

  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [activeTab, memberChats.length]);

  // Social Links
  const links = romanticConfig.socialLinks;

  const handleOpenInstagram = () => {
    trackEvent('click_instagram', { component: 'very_romantic' });
    const user = links.instagramUsername?.replace('@', '').trim() || 'instagram';
    window.open(`https://ig.me/m/${user}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenTelegram = () => {
    trackEvent('click_telegram', { component: 'very_romantic' });
    const user = links.telegramUsername?.replace('@', '').trim() || 'telegram';
    window.open(`https://t.me/${user}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenSnapchat = () => {
    trackEvent('click_snapchat', { component: 'very_romantic' });
    const user = links.snapchatUsername?.replace('@', '').trim() || 'snapchat';
    window.open(`https://www.snapchat.com/add/${user}`, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp Popup Submit
  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWaError('');
    const cleanPhone = waPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setWaError('Kripya valid 10-digit mobile number enter karein.');
      return;
    }

    trackEvent('submit_whatsapp_lead', { component: 'very_romantic' });

    saveWhatsAppRegistration({
      memberId: member.id,
      name: waName.trim() || member.name,
      phone: waPhone.trim(),
      source: 'romantic',
      notes: `Registered via WhatsApp button from Romantic Screen (${member.age} saal)`,
    });

    setWaSuccess(true);

    setTimeout(() => {
      setShowWhatsAppModal(false);
      setWaSuccess(false);
      setWaPhone('');
    }, 3200);
  };

  // Send Chat Message
  const handleSendHelpMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isBlocked) return;

    sendHelpChatMessage({
      memberId: member.id,
      memberName: member.name,
      sender: 'user',
      text: chatInput.trim(),
    });
    setChatInput('');
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#FFF9FA] text-[#2D3436] relative overscroll-none">
      {/* Sticky Mobile App Top Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#ffe0e6] shadow-xs px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToApp}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#636E72] hover:text-[#2D3436] transition-colors py-1.5 px-3 rounded-full bg-pink-50/80 hover:bg-pink-100/80 border border-[#ffd1dc] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff477e] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#ff477e] bg-[#FFF0F3] px-2.5 py-0.5 rounded-full border border-[#ffccd5]">
              {romanticConfig.optionBadge || 'EXCLUSIVE MODE'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col">
        {/* ========================================================================= */}
        {/* TAB 1: HOME (Original Romantic Content - Scrollable, Nav remains fixed) */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <motion.div
            key="romantic-home-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full px-4 pt-5 pb-28 space-y-4"
          >
            {/* Greeting Header */}
            <div className="text-center bg-white border border-[#ffe0e6] rounded-3xl p-5 shadow-xs">
              <div className="inline-flex items-center gap-1.5 bg-[#FFF0F3] text-[#ff477e] border border-[#ffccd5] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2.5">
                <Flame className="w-3.5 h-3.5 text-[#ff477e] fill-[#ff477e]" />
                <span>{romanticConfig.pageTitle || 'Special Romantic Zone'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2D3436]">
                Hello My Dear,{' '}
                <span className="text-[#ff477e] underline decoration-wavy decoration-[#ff477e]">
                  {member.name}
                </span>
              </h1>

              <p className="text-[#636E72] text-xs sm:text-sm font-medium mt-2 leading-relaxed">
                {romanticConfig.pageSubtitle || 'Aapne chuna hai sabse pyara aur behad romantic andaaz. Yaha par humari har baat dil se shuru hokar dil tak jayegi.'}
              </p>

              {/* Selected Interests if any */}
              {member.interests && member.interests.length > 0 && (
                <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#636E72]">Aapki Pasand:</span>
                  {member.interests.map((topic, i) => (
                    <span
                      key={i}
                      className="bg-pink-50 border border-[#ffccd5] text-[#ff477e] text-xs font-bold px-3 py-0.5 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Romantic Quote Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FFF5F7] via-[#FFF0F3] to-[#FFF5F7] border border-[#ffccd5] shadow-xs text-center">
              <p className="text-xs sm:text-sm font-bold text-[#2D3436] italic leading-relaxed">
                &ldquo;{romanticConfig.quoteText || 'Tere bina ab dil lagta nahi, har saans me tera hi khayal rehta hai...'}&rdquo;
              </p>
              <div className="text-xs text-[#ff477e] font-semibold mt-2 flex items-center justify-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-[#ff477e] text-[#ff477e]" />
                <span>{romanticConfig.bannerMessage || 'Direct Connect Karein ✨'}</span>
              </div>
            </div>

            {/* Social Media Connect Buttons */}
            <div className="space-y-2.5 pt-2">
              <div className="text-center mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#636E72]">
                  Mujhse Baat Karne Ke Liye Platform Chunein
                </span>
              </div>

              {/* Instagram */}
              {links.instagramEnabled !== false && (
                <button
                  type="button"
                  onClick={handleOpenInstagram}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-[#FFF5F7] border border-[#ffccd5] text-[#2D3436] font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-xs shrink-0">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-[#2D3436]">Instagram Direct</div>
                      <div className="text-xs text-[#ff477e] font-semibold">Instagram par baat karne ke liye yahan click karein</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#ff477e]" />
                </button>
              )}

              {/* Telegram */}
              {links.telegramEnabled !== false && (
                <button
                  type="button"
                  onClick={handleOpenTelegram}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-[#f0f9ff] border border-[#b9e6fe] text-[#2D3436] font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0088cc] flex items-center justify-center text-white shadow-xs shrink-0">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.34-.674.34l.205-3.056 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.895z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-[#2D3436]">Telegram Chat</div>
                      <div className="text-xs text-[#0088cc] font-semibold">Telegram par baat karne ke liye yahan click karein</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#0088cc]" />
                </button>
              )}

              {/* Snapchat */}
              {links.snapchatEnabled !== false && (
                <button
                  type="button"
                  onClick={handleOpenSnapchat}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-[#fffae6] border border-[#ffec99] text-[#2D3436] font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFFC00] flex items-center justify-center text-black shadow-xs shrink-0">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.001 2c-3.792 0-6.177 2.656-6.177 5.766 0 .914.305 2.113.805 3.039.148.275.244.527.051.777-.184.238-.57.389-.961.502-.451.131-.926.268-.926.689 0 .346.33.648.744.828.828.361 1.707.135 2.051.729.176.305-.037.951-.629 1.723-.699.914-1.059 1.771-1.059 2.531 0 1.258.98 2.096 2.887 2.469.75.146 1.574-.016 2.373-.396.447-.213.914-.383 1.346-.383.432 0 .898.17 1.346.383.8.381 1.623.543 2.373.396 1.906-.373 2.887-1.211 2.887-2.469 0-.76-.359-1.617-1.059-2.531-.592-.771-.805-1.418-.629-1.723.344-.594 1.223-.367 2.051-.729.414-.179.744-.482.744-.828 0-.422-.475-.559-.926-.689-.391-.113-.777-.264-.961-.502-.193-.25-.098-.502.051-.777.5-.926.805-2.125.805-3.039 0-3.11-2.385-5.766-6.177-5.766z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-[#2D3436]">Snapchat Connect</div>
                      <div className="text-xs text-[#b89500] font-semibold">Snapchat par baat karne ke liye yahan click karein</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#d4b106]" />
                </button>
              )}

              {/* WhatsApp */}
              {links.whatsappEnabled !== false && (
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('click_whatsapp_open_popup', { component: 'very_romantic' });
                    setWaError('');
                    setShowWhatsAppModal(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-[#bbf7d0] text-[#2D3436] font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-xs shrink-0">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-[#2D3436]">WhatsApp Connect</div>
                      <div className="text-xs text-[#16a34a] font-semibold">WhatsApp par baat karne ke liye yahan click karein</div>
                    </div>
                  </div>
                  <span className="bg-[#25D366] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-2xs">
                    POPUP
                  </span>
                </button>
              )}
            </div>

            {/* Bottom Safe Note */}
            <div className="pt-3 text-center flex items-center justify-center gap-1.5 text-xs text-[#636E72]">
              <ShieldCheck className="w-4 h-4 text-[#6BCB77]" />
              <span>Aapki identity secure hai aur direct conversation hoti hai.</span>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CHAT (Full height in-app live romantic chat) */}
        {/* ========================================================================= */}
        {activeTab === 'chat' && (
          <motion.div
            key="romantic-chat-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col bg-[#FFF9FA] pb-36"
          >
            {/* Chat Sub-Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#ff477e] to-[#ff0055] text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shadow-xs">
                  ❤️
                </div>
                <div>
                  <h3 className="font-black text-sm">Special One ✨</h3>
                  <p className="text-[11px] text-pink-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Online abhi active hai
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-pink-100 bg-white/20 px-3 py-1 rounded-full">
                {member.name}
              </span>
            </div>

            {/* Blocked Alert */}
            {isBlocked && (
              <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-600 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>Chat access restrict hai. Message nahi bheje ja sakte.</span>
              </div>
            )}

            {/* Chat Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FFF9FA] min-h-[340px]">
              {memberChats.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-2.5">
                  <div className="w-14 h-14 rounded-full bg-pink-100 text-[#ff477e] flex items-center justify-center mx-auto">
                    <MessageCircle className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-base text-[#2D3436]">Dil Ki Baat Karein!</h4>
                  <p className="text-xs text-[#636E72] max-w-xs mx-auto leading-relaxed">
                    Aap yahan seedhe mujhse koi bhi sawal ya romantic baat likh sakti hain.
                  </p>
                  <p className="text-[11px] text-pink-500">
                    Aapka message private aur direct milta hai.
                  </p>
                </div>
              ) : (
                memberChats.map((c) => {
                  const isUser = c.sender === 'user';
                  return (
                    <div
                      key={c.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff477e] to-[#ff0055] text-white flex items-center justify-center text-[10px] font-black shrink-0 self-end mb-1 shadow-xs">
                          ❤️
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-sm ${
                          isUser
                            ? 'bg-gradient-to-r from-[#ff477e] to-[#ff0055] text-white rounded-br-none shadow-xs'
                            : 'bg-white text-[#2D3436] border border-[#ffe0e6] rounded-bl-none shadow-xs'
                        }`}
                      >
                        <div className="font-bold text-[10px] opacity-75 mb-0.5">
                          {isUser ? 'Aap' : 'Special One ❤️'} &bull; {c.timestamp}
                        </div>
                        <div className="leading-relaxed break-words font-medium">{c.text}</div>
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-full bg-pink-200 text-pink-950 flex items-center justify-center text-[10px] font-black shrink-0 self-end mb-1">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Pinned Above Navigation */}
            <div className="fixed bottom-16 sm:bottom-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ffe0e6] p-2.5">
              <form
                onSubmit={handleSendHelpMessage}
                className="max-w-lg mx-auto flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  disabled={isBlocked}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isBlocked ? "Aap block hain" : "Message yahan likhein..."}
                  className="flex-1 bg-[#FFF5F7] border border-[#ffccd5] focus:border-[#ff477e] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#2D3436] placeholder-[#a0aec0] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isBlocked || !chatInput.trim()}
                  className="w-10 h-10 rounded-full bg-[#ff477e] hover:bg-[#ff0055] disabled:opacity-40 text-white flex items-center justify-center shadow-md cursor-pointer transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 100% FIXED BOTTOM NAVIGATION BAR (Permanently pinned at bottom) */}
      {/* ========================================================================= */}
      <nav
        id="romantic-fixed-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#ffe0e6] shadow-[0_-4px_25px_rgba(255,71,126,0.08)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-lg mx-auto h-16 px-8 flex items-center justify-around">
          {/* Left: HOME */}
          <button
            type="button"
            id="nav-romantic-home-btn"
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#ff477e] font-black'
                : 'text-[#a0aec0] hover:text-[#636E72] font-semibold'
            }`}
          >
            <div
              className={`p-1.5 rounded-2xl transition-all ${
                activeTab === 'home' ? 'bg-[#ff477e]/15 scale-110' : 'bg-transparent'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs tracking-tight mt-0.5">Home</span>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-[#ffe0e6]" />

          {/* Right: CHAT */}
          <button
            type="button"
            id="nav-romantic-chat-btn"
            onClick={() => {
              setActiveTab('chat');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative ${
              activeTab === 'chat'
                ? 'text-[#ff477e] font-black'
                : 'text-[#a0aec0] hover:text-[#636E72] font-semibold'
            }`}
          >
            <div
              className={`p-1.5 rounded-2xl transition-all relative ${
                activeTab === 'chat' ? 'bg-[#ff477e]/15 scale-110' : 'bg-transparent'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && activeTab !== 'chat' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff477e] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs tracking-tight mt-0.5">Chat</span>
          </button>
        </div>
      </nav>

      {/* WhatsApp Modal */}
      <AnimatePresence>
        {showWhatsAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white border border-[#ffe0e6] rounded-3xl p-6 shadow-2xl relative text-[#2D3436]"
            >
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center mb-3.5 shadow-xs">
                <Phone className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-black text-[#2D3436]">
                WhatsApp Number Darj Karein
              </h3>
              <p className="text-xs text-[#636E72] mt-1">
                Apna number darj karein taaki hum aapse WhatsApp par connect kar sakein.
              </p>

              {waSuccess ? (
                <div className="my-5 p-4 rounded-2xl bg-[#25D366]/15 border border-[#25D366] text-center space-y-2">
                  <Check className="w-6 h-6 text-[#25D366] mx-auto stroke-[3]" />
                  <div className="text-sm font-black text-[#2D3436]">Request Darj Ho Gayi!</div>
                  <p className="text-xs text-[#636E72]">
                    Hum aapse bohot jald WhatsApp par baat shuru karenge.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWhatsAppSubmit} className="space-y-3.5 mt-4">
                  {waError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                      {waError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-black uppercase text-[#636E72] mb-1">
                      Aapka Naam
                    </label>
                    <input
                      type="text"
                      value={waName}
                      onChange={(e) => setWaName(e.target.value)}
                      placeholder="Aapka naam..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#ffccd5] text-sm font-bold text-[#2D3436] focus:outline-none focus:border-[#25D366]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-[#636E72] mb-1">
                      WhatsApp Mobile No. *
                    </label>
                    <input
                      type="tel"
                      required
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#ffccd5] text-sm font-bold text-[#2D3436] focus:outline-none focus:border-[#25D366]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3 rounded-xl text-sm shadow-sm transition-all cursor-pointer mt-2"
                  >
                    Connect on WhatsApp
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
