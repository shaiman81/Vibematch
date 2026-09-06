'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smile, 
  Settings, 
  Phone, 
  MessageSquare, 
  Save, 
  Send, 
  Trash2, 
  Ban, 
  UserCheck, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  ShieldAlert, 
  MessageCircle,
  Clock,
  UserX
} from 'lucide-react';
import { FriendlyPageConfig, WhatsAppRegistration, HelpChatMessage } from '@/lib/types';
import { 
  useFriendlyConfig, 
  saveFriendlyConfig,
  useWhatsAppRegistrations,
  deleteWhatsAppRegistration,
  useHelpChats,
  sendHelpChatMessage,
  clearHelpChatForMember,
  deleteHelpChatMessage,
  useBlockedMembers,
  toggleBlockMember
} from '@/lib/storage';

interface FriendlySectionAdminProps {
  whatsappLeads?: WhatsAppRegistration[];
  helpChats?: HelpChatMessage[];
  blockedMembers?: string[];
  onToggleBlock?: (memberId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onClearChat?: (memberId: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onSendReply?: (memberId: string, text: string) => void;
}

export default function FriendlySectionAdmin({
  whatsappLeads,
  helpChats,
  blockedMembers,
  onToggleBlock,
  onDeleteMessage,
  onClearChat,
  onDeleteLead,
  onSendReply,
}: FriendlySectionAdminProps = {}) {
  const [subTab, setSubTab] = useState<'settings' | 'whatsapp' | 'chats'>('settings');
  const friendlyConfig = useFriendlyConfig();
  const hookLeads = useWhatsAppRegistrations();
  const hookChats = useHelpChats();
  const hookBlocked = useBlockedMembers();

  const leadsList = whatsappLeads ?? hookLeads;
  const chatsList = helpChats ?? hookChats;
  const blockedList = blockedMembers ?? hookBlocked;

  const handleToggleBlock = onToggleBlock ?? toggleBlockMember;
  const handleDeleteMessage = onDeleteMessage ?? deleteHelpChatMessage;
  const handleClearChat = onClearChat ?? clearHelpChatForMember;
  const handleDeleteLead = onDeleteLead ?? deleteWhatsAppRegistration;
  const handleSendReply = onSendReply ?? ((mId: string, text: string) => {
    sendHelpChatMessage({
      memberId: mId,
      memberName: 'Admin',
      sender: 'admin',
      text,
    });
  });

  const [friendlyForm, setFriendlyForm] = useState<FriendlyPageConfig>(friendlyConfig);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Admin reply state
  const [selectedChatMemberId, setSelectedChatMemberId] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  // Save friendly settings handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveFriendlyConfig(friendlyForm);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Group chats by member
  const uniqueChatMembers = React.useMemo(() => {
    return Array.from(
      new Set(chatsList.map(c => c.memberId))
    ).map(mId => {
      const msgs = chatsList.filter(c => c.memberId === mId);
      const lastMsg = msgs[msgs.length - 1];
      const userMsg = msgs.find(c => c.sender === 'user');
      const isBlocked = blockedList.includes(mId);
      return {
        memberId: mId,
        memberName: userMsg?.memberName || 'User',
        lastMessage: lastMsg?.text || '',
        lastTime: lastMsg?.timestamp || '',
        count: msgs.length,
        isBlocked,
      };
    });
  }, [chatsList, blockedList]);

  // Active chat member
  const activeChatMemberId = selectedChatMemberId || (uniqueChatMembers.length > 0 ? uniqueChatMembers[0].memberId : '');
  const activeMemberInfo = uniqueChatMembers.find(m => m.memberId === activeChatMemberId);
  const isSelectedUserBlocked = activeChatMemberId ? blockedList.includes(activeChatMemberId) : false;

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChatMemberId) return;
    handleSendReply(activeChatMemberId, replyText.trim());
    setReplyText('');
  };

  // Filter WhatsApp leads for friendly source (or include all if not specified)
  const friendlyLeads = leadsList.filter(l => l.source === 'friendly' || !l.source);

  return (
    <div id="friendly-section-admin" className="space-y-6">
      {/* Friendly Section Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              <Smile className="w-3.5 h-3.5" />
              <span>Sweet & Friendly Connect Admin</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Friendly Section Control Center
            </h2>
            <p className="text-white/85 text-xs sm:text-sm font-medium max-w-2xl">
              Yaha se aap Sweet & Friendly Connect page ka content, social media links (Instagram, Telegram, Snapchat, WhatsApp) aur users ke sath help chat control kar sakte hain.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 text-center min-w-[90px]">
              <div className="text-lg font-black text-white">{friendlyLeads.length}</div>
              <div className="text-[10px] uppercase font-bold text-white/80">WhatsApp Leads</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 text-center min-w-[90px]">
              <div className="text-lg font-black text-white">{uniqueChatMembers.length}</div>
              <div className="text-[10px] uppercase font-bold text-white/80">Help Chats</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#FFF5F7] rounded-2xl border border-[#ffe0e6] w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-[#2D3436] hover:bg-white/80'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Page & Links Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-[#2D3436] hover:bg-white/80'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>WhatsApp Registrations</span>
          <span className="text-[11px] bg-white/30 text-white px-2 py-0.5 rounded-full font-black">
            {friendlyLeads.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('chats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'chats'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-[#2D3436] hover:bg-white/80'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Help & Support Chats</span>
          <span className="text-[11px] bg-white/30 text-white px-2 py-0.5 rounded-full font-black">
            {uniqueChatMembers.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* Subtab 1: Friendly Page & Links Settings */}
      {/* ========================================================================= */}
      {subTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-5">
          {saveSuccessNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Friendly Connect Section ki settings safalta-purvak update ho gayi hain!</span>
            </div>
          )}

          {/* 1. Page Content Details */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ffe0e6] space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-sm font-black text-emerald-700 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>1. Friendly Page Content & Headlines</span>
            </div>
            <p className="text-xs text-[#636E72]">
              User jab Friendly / Baaki koi option chunta hai, toh use kaisa title, subtitle aur sweet thought dikhega:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                  Page Main Title
                </label>
                <input
                  type="text"
                  value={friendlyForm.pageTitle}
                  onChange={(e) => setFriendlyForm({ ...friendlyForm, pageTitle: e.target.value })}
                  className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-[#2D3436] font-bold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                  Badge Tag (Jaise: SWEET & FRIENDLY CONNECT)
                </label>
                <input
                  type="text"
                  value={friendlyForm.badgeText}
                  onChange={(e) => setFriendlyForm({ ...friendlyForm, badgeText: e.target.value })}
                  className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-[#2D3436] font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                Banner Tagline / Subtitle
              </label>
              <input
                type="text"
                value={friendlyForm.bannerMessage}
                onChange={(e) => setFriendlyForm({ ...friendlyForm, bannerMessage: e.target.value })}
                className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#2D3436] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                Sweet Thought / Quote
              </label>
              <textarea
                rows={2}
                value={friendlyForm.quoteText}
                onChange={(e) => setFriendlyForm({ ...friendlyForm, quoteText: e.target.value })}
                className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#2D3436] focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Social Media Accounts & Direct Links */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ffe0e6] space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-sm font-black text-emerald-700 uppercase tracking-wider">
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              <span>2. Social Media Handles & Direct Message Links</span>
            </div>
            <p className="text-xs text-[#636E72]">
              User button click karega toh direct aapke handles par message ka page open hoga:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Instagram */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#FFF5F7] to-white border border-[#ffd1dc] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#E1306C]">Instagram Username</span>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#636E72] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={friendlyForm.socialLinks.instagramEnabled}
                      onChange={(e) =>
                        setFriendlyForm({
                          ...friendlyForm,
                          socialLinks: {
                            ...friendlyForm.socialLinks,
                            instagramEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded accent-[#E1306C]"
                    />
                    <span>Active</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={friendlyForm.socialLinks.instagramUsername}
                  onChange={(e) =>
                    setFriendlyForm({
                      ...friendlyForm,
                      socialLinks: {
                        ...friendlyForm.socialLinks,
                        instagramUsername: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. your_instagram"
                  className="w-full bg-white border border-[#ffd1dc] rounded-xl px-3 py-2 text-xs font-bold text-[#2D3436] focus:outline-none"
                />
              </div>

              {/* Telegram */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#f0f8ff] to-white border border-[#cfe2ff] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0088cc]">Telegram Username</span>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#636E72] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={friendlyForm.socialLinks.telegramEnabled}
                      onChange={(e) =>
                        setFriendlyForm({
                          ...friendlyForm,
                          socialLinks: {
                            ...friendlyForm.socialLinks,
                            telegramEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded accent-[#0088cc]"
                    />
                    <span>Active</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={friendlyForm.socialLinks.telegramUsername}
                  onChange={(e) =>
                    setFriendlyForm({
                      ...friendlyForm,
                      socialLinks: {
                        ...friendlyForm.socialLinks,
                        telegramUsername: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. your_telegram"
                  className="w-full bg-white border border-[#cfe2ff] rounded-xl px-3 py-2 text-xs font-bold text-[#2D3436] focus:outline-none"
                />
              </div>

              {/* Snapchat */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#fffde6] to-white border border-[#fae8a4] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#b38f00]">Snapchat Username</span>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#636E72] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={friendlyForm.socialLinks.snapchatEnabled}
                      onChange={(e) =>
                        setFriendlyForm({
                          ...friendlyForm,
                          socialLinks: {
                            ...friendlyForm.socialLinks,
                            snapchatEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded accent-[#b38f00]"
                    />
                    <span>Active</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={friendlyForm.socialLinks.snapchatUsername}
                  onChange={(e) =>
                    setFriendlyForm({
                      ...friendlyForm,
                      socialLinks: {
                        ...friendlyForm.socialLinks,
                        snapchatUsername: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. your_snapchat"
                  className="w-full bg-white border border-[#fae8a4] rounded-xl px-3 py-2 text-xs font-bold text-[#2D3436] focus:outline-none"
                />
              </div>
            </div>

            {/* WhatsApp Integration */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#e8f8ed] to-white border border-[#b2e5c4] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#25D366] flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Lead Registration Button</span>
                </span>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#636E72] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={friendlyForm.socialLinks.whatsappEnabled}
                    onChange={(e) =>
                      setFriendlyForm({
                        ...friendlyForm,
                        socialLinks: {
                          ...friendlyForm.socialLinks,
                          whatsappEnabled: e.target.checked,
                        },
                      })
                    }
                    className="rounded accent-[#25D366]"
                  />
                  <span>Active</span>
                </label>
              </div>

              <p className="text-xs text-[#2D3436] font-medium leading-relaxed">
                Friendly page par WhatsApp button dikhega. Ladkiyan apna number register karengi jo seedha neeche Leads table me save hoga.
              </p>
              <div className="text-[11px] text-emerald-800 bg-emerald-100/70 p-2.5 rounded-xl font-semibold">
                ✓ <strong>Aapka number hidden hai:</strong> User ko WhatsApp par redirect nahi kiya jayega, sirf uska number register hokar aapko milega.
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm px-8 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Friendly Settings Update Karein</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* Subtab 2: WhatsApp Registrations Table */}
      {/* ========================================================================= */}
      {subTab === 'whatsapp' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-black text-[#2D3436]">
                Friendly Connect WhatsApp Leads ({friendlyLeads.length})
              </h3>
              <p className="text-xs text-[#636E72]">
                Jin ladkiyon ne Friendly page par WhatsApp button click karke number register kiya hai.
              </p>
            </div>

            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-3 py-1 rounded-full">
              Total Friendly Leads: {friendlyLeads.length}
            </span>
          </div>

          {friendlyLeads.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#ffd1dc] space-y-2">
              <Phone className="w-8 h-8 text-emerald-600 mx-auto opacity-60" />
              <div className="font-bold text-sm text-[#2D3436]">
                Abhi tak Friendly section se koi WhatsApp number register nahi hua hai.
              </div>
              <p className="text-xs text-[#A0A0A0]">
                Jaise hi koi user register karega, uska number turant yaha dikhega.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#ffe0e6] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FFF5F7] border-b border-[#ffd1dc] text-[#636E72] font-black uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-4">User Name</th>
                      <th className="p-4">WhatsApp Number</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ffe8ed]">
                    {friendlyLeads.map((lead) => {
                      const cleanNum = lead.phone.replace(/\D/g, '');
                      return (
                        <tr key={lead.id} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="p-4 font-black text-[#2D3436] flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{lead.name}</span>
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                            {lead.phone}
                          </td>
                          <td className="p-4 text-[#636E72] text-xs">
                            {lead.submittedAt}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://wa.me/${cleanNum}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp Open</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteLead(lead.id)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete lead"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Subtab 3: Help & Support Live Chats with Delete & Block Options */}
      {/* ========================================================================= */}
      {subTab === 'chats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: List of Chat Conversations */}
          <div className="bg-white rounded-3xl border border-[#ffe0e6] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#ffe8ed]">
              <h3 className="font-black text-sm text-[#2D3436]">
                Help Chats ({uniqueChatMembers.length})
              </h3>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                Live Support
              </span>
            </div>

            {uniqueChatMembers.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#A0A0A0]">
                Abhi tak kisi user ne help chat start nahi kiya hai.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {uniqueChatMembers.map((chat) => {
                  const isSelected = selectedChatMemberId === chat.memberId;
                  return (
                    <button
                      key={chat.memberId}
                      type="button"
                      onClick={() => setSelectedChatMemberId(chat.memberId)}
                      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-[#FFF5F7] hover:bg-emerald-50 text-[#2D3436]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            chat.isBlocked
                              ? 'bg-red-500 text-white'
                              : isSelected
                              ? 'bg-white text-emerald-700'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {chat.memberName.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-xs truncate flex items-center gap-1.5">
                            <span>{chat.memberName}</span>
                            {chat.isBlocked && (
                              <span className="text-[9px] bg-red-100 text-red-700 border border-red-200 px-1 py-0.2 rounded font-extrabold uppercase">
                                Blocked
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[11px] truncate ${
                              isSelected ? 'text-emerald-100' : 'text-[#636E72]'
                            }`}
                          >
                            {chat.lastMessage}
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] font-semibold shrink-0 opacity-80">
                        {chat.lastTime}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Chat Window, Moderation Controls & Admin Reply Box */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#ffe0e6] overflow-hidden flex flex-col h-[520px]">
            {activeChatMemberId ? (
              <>
                {/* Chat Header with Block and Delete Actions */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-[#ffe8ed] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                        isSelectedUserBlocked ? 'bg-red-500' : 'bg-emerald-600'
                      }`}
                    >
                      {activeMemberInfo?.memberName.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-[#2D3436]">
                          {activeMemberInfo?.memberName || 'User'}
                        </h4>
                        {isSelectedUserBlocked && (
                          <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            <span>BLOCKED</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#636E72]">
                        Member ID: {activeChatMemberId}
                      </p>
                    </div>
                  </div>

                  {/* Moderation Controls: Block/Unblock & Delete Chat */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(activeChatMemberId)}
                      className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        isSelectedUserBlocked
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300'
                      }`}
                    >
                      {isSelectedUserBlocked ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Unblock User</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5 text-red-600" />
                          <span>Block User</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClearChat(activeChatMemberId)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 font-bold px-3 py-1.5 rounded-xl border border-red-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Poori Chat Delete</span>
                    </button>
                  </div>
                </div>

                {/* Blocked notification banner */}
                {isSelectedUserBlocked && (
                  <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-800 font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Yeh user blocked hai. User ab naye help messages nahi bhej sakti.</span>
                  </div>
                )}

                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fafafa]">
                  {chatsList
                    .filter(c => c.memberId === activeChatMemberId)
                    .map((msg) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`group flex items-start gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isAdmin && (
                            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-1">
                              {msg.memberName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Delete Message Button for Admin */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded self-center cursor-pointer"
                              title="Delete this message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}

                          <div
                            className={`max-w-[75%] rounded-2xl p-3 text-xs sm:text-sm ${
                              isAdmin
                                ? 'bg-emerald-600 text-white rounded-tr-none shadow-xs'
                                : 'bg-white text-[#2D3436] border border-[#e0e0e0] rounded-tl-none shadow-xs'
                            }`}
                          >
                            <div className="text-[10px] font-bold opacity-75 mb-0.5 flex items-center justify-between gap-3">
                              <span>{isAdmin ? 'Admin (Aap)' : msg.memberName} • {msg.timestamp}</span>
                            </div>
                            <div className="leading-relaxed break-words">{msg.text}</div>
                          </div>

                          {!isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded self-center cursor-pointer"
                              title="Delete user message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}

                          {isAdmin && (
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black shrink-0 mt-1">
                              A
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Admin Reply Form */}
                <form
                  onSubmit={handleSendAdminReply}
                  className="p-3 bg-white border-t border-[#ffe8ed] flex gap-2"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Apna reply likhein... (User ke screen par live dikhega)"
                    className="flex-1 bg-[#FFF5F7] border border-[#ffd1dc] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#2D3436] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-xs">Reply Bhejein</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-[#A0A0A0] p-6 text-center">
                Left column se kisi user ki conversation select kijiye.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
