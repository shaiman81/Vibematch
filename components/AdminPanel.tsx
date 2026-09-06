'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  ArrowLeft, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Heart, 
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  ShieldCheck,
  UserCheck,
  Flame,
  Settings,
  Phone,
  MessageSquare,
  Send,
  Save,
  Check,
  ExternalLink,
  Edit3,
  Smile,
  Ban,
  UserX,
  CheckSquare,
  Square,
  AlertTriangle,
  ShieldAlert,
  MessageCircle,
  Globe,
  Database,
  Cloud,
  Copy
} from 'lucide-react';
import { Member, VERY_ROMANTIC_TOPIC, RomanticPageConfig } from '@/lib/types';
import { 
  useMembers, 
  updateMemberStatus, 
  deleteMember,
  clearAllMembers,
  deleteMembersBatch,
  useRomanticConfig,
  saveRomanticConfig,
  useFriendlyConfig,
  useWhatsAppRegistrations,
  deleteWhatsAppRegistration,
  useHelpChats,
  sendHelpChatMessage,
  clearHelpChatForMember,
  deleteHelpChatMessage,
  useBlockedMembers,
  toggleBlockMember,
  getFirebaseProjectInfo
} from '@/lib/storage';
import FriendlySectionAdmin from './admin/FriendlySectionAdmin';

interface AdminPanelProps {
  onBackToApp: () => void;
}

export default function AdminPanel({ onBackToApp }: AdminPanelProps) {
  const [activeMenu, setActiveMenu] = useState<'members' | 'romantic_section' | 'friendly_section' | 'overview' | 'firebase_hosting'>('members');
  const [romanticSubTab, setRomanticSubTab] = useState<'settings' | 'whatsapp' | 'chats'>('settings');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fbInfo = getFirebaseProjectInfo();

  const members = useMembers();
  const romanticConfig = useRomanticConfig();
  const friendlyConfig = useFriendlyConfig();
  const whatsappLeads = useWhatsAppRegistrations();
  const helpChats = useHelpChats();
  const blockedMembers = useBlockedMembers();

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Romantic Settings Form State
  const [romanticForm, setRomanticForm] = useState<RomanticPageConfig>(romanticConfig);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // In-app Confirm Modal State (bypasses browser iframe window.confirm blocks)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Admin Reply in Help Chat State
  const [replyText, setReplyText] = useState('');
  const [selectedChatMemberId, setSelectedChatMemberId] = useState<string>('');

  // Handle status update
  const handleStatusChange = (id: string, newStatus: Member['status']) => {
    updateMemberStatus(id, newStatus);
    if (selectedMember && selectedMember.id === id) {
      setSelectedMember({ ...selectedMember, status: newStatus });
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Member Delete Karein?',
      description: `Kya aap sach me "${name}" ko member list se delete karna chahte hain? Yeh record hat jayega.`,
      confirmText: 'Haan, Delete Karein',
      onConfirm: () => {
        deleteMember(id);
        if (selectedMember && selectedMember.id === id) {
          setSelectedMember(null);
        }
        setSelectedMemberIds(prev => prev.filter(mId => mId !== id));
        setConfirmDialog(null);
      },
    });
  };

  // Bulk Delete and Clear All Members Handlers
  const handleClearAllMembers = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Sabhi Members Delete Karein?',
      description: 'Kya aap poori member list ko delete karna chahte hain? Sabhi members ka record permanently hat jayega.',
      confirmText: 'Sabhi Delete Karein',
      onConfirm: () => {
        clearAllMembers();
        setSelectedMember(null);
        setSelectedMemberIds([]);
        setConfirmDialog(null);
      },
    });
  };

  const handleDeleteSelectedMembers = () => {
    if (selectedMemberIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: `${selectedMemberIds.length} Members Delete Karein?`,
      description: `Kya aap chuninda ${selectedMemberIds.length} members ko delete karna chahte hain?`,
      confirmText: 'Delete Selected',
      onConfirm: () => {
        deleteMembersBatch(selectedMemberIds);
        if (selectedMember && selectedMemberIds.includes(selectedMember.id)) {
          setSelectedMember(null);
        }
        setSelectedMemberIds([]);
        setConfirmDialog(null);
      },
    });
  };

  const handleToggleSelectMember = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (allIds: string[]) => {
    if (selectedMemberIds.length === allIds.length && allIds.length > 0) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(allIds);
    }
  };

  const handleSaveRomanticSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveRomanticConfig(romanticForm);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Group help chats by member
  const uniqueChatMembers = React.useMemo(() => {
    return Array.from(
      new Set(helpChats.map(c => c.memberId))
    ).map(mId => {
      const msgs = helpChats.filter(c => c.memberId === mId);
      const lastMsg = msgs[msgs.length - 1];
      const userMsg = msgs.find(c => c.sender === 'user');
      const isBlocked = blockedMembers.includes(mId);
      return {
        memberId: mId,
        memberName: userMsg?.memberName || 'User',
        lastMessage: lastMsg?.text || '',
        lastTime: lastMsg?.timestamp || '',
        count: msgs.length,
        hasUserMsg: msgs.some(m => m.sender === 'user'),
        isBlocked,
      };
    });
  }, [helpChats, blockedMembers]);

  // Derive active chat member ID without useEffect setState
  const activeChatMemberId = selectedChatMemberId || (uniqueChatMembers.length > 0 ? uniqueChatMembers[0].memberId : '');
  const isRomanticChatBlocked = activeChatMemberId ? blockedMembers.includes(activeChatMemberId) : false;
  const activeRomanticChatMember = uniqueChatMembers.find(m => m.memberId === activeChatMemberId);

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChatMemberId) return;

    sendHelpChatMessage({
      memberId: activeChatMemberId,
      memberName: 'Admin',
      sender: 'admin',
      text: replyText.trim(),
    });

    setReplyText('');
  };

  const handleToggleBlock = (mId: string) => {
    toggleBlockMember(mId);
  };

  const handleDeleteChatMessage = (msgId: string) => {
    deleteHelpChatMessage(msgId);
  };

  const handleClearChatForMember = (mId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Chat History Delete Karein?',
      description: 'Kya aap is user ke sath ki gayi saari help chat history delete karna chahte hain? Yeh wapas nahi aayegi.',
      confirmText: 'Chat Clear Karein',
      onConfirm: () => {
        clearHelpChatForMember(mId);
        setConfirmDialog(null);
      },
    });
  };

  // Filtered members list
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const veryRomanticCount = members.filter(
    m => m.mode === 'very_romantic' || m.interests.includes(VERY_ROMANTIC_TOPIC) || m.interests.includes(romanticConfig.optionTitle)
  ).length;

  return (
    <div className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-md border border-[#ffe0e6] rounded-3xl shadow-[0_20px_50px_-20px_rgba(255,107,107,0.25)] overflow-hidden">
      {/* Top Header inside Admin */}
      <div className="bg-gradient-to-r from-[#FF6B6B] to-[#ff8585] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">VibeMatch Admin</h1>
              <span className="bg-[#FFD93D] text-[#2D3436] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Full Control
              </span>
            </div>
            <p className="text-white/85 text-xs sm:text-sm font-medium mt-0.5">
              Yaha se aap sabhi members, Very Romantic screen customization, WhatsApp leads aur live chats control kar sakte hain.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToApp}
          className="self-start sm:self-center inline-flex items-center gap-2 bg-white text-[#FF6B6B] hover:bg-[#FFF5F7] font-bold text-sm px-5 py-2.5 rounded-full transition-all shadow-sm cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>User Screen Par Jayein</span>
        </button>
      </div>

      {/* Admin Body: Sidebar Navigation & Content */}
      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#ffe0e6] bg-[#FFF5F7]/70 p-4 sm:p-6 flex md:flex-col gap-2">
          <div className="text-xs font-black uppercase tracking-wider text-[#A0A0A0] px-3 py-1 hidden md:block">
            Main Navigation
          </div>

          {/* Member List Tab */}
          <button
            type="button"
            onClick={() => setActiveMenu('members')}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeMenu === 'members'
                ? 'bg-[#FF6B6B] text-white shadow-md'
                : 'text-[#2D3436] hover:bg-white/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Member List</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-black ${
                activeMenu === 'members'
                  ? 'bg-white text-[#FF6B6B]'
                  : 'bg-[#ffe4e9] text-[#FF6B6B]'
              }`}
            >
              {members.length}
            </span>
          </button>

          {/* VERY ROMANTIC SPECIAL SECTION TAB */}
          <button
            type="button"
            onClick={() => setActiveMenu('romantic_section')}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeMenu === 'romantic_section'
                ? 'bg-gradient-to-r from-[#ff477e] to-[#ff0055] text-white shadow-md'
                : 'text-[#ff477e] hover:bg-pink-50 border border-pink-200/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 fill-current" />
              <span className="font-black">Very Romantic Section</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeMenu === 'romantic_section'
                  ? 'bg-white text-[#ff477e]'
                  : 'bg-[#ff477e] text-white'
              }`}
            >
              NEW
            </span>
          </button>

          {/* FRIENDLY CONNECT SPECIAL SECTION TAB */}
          <button
            type="button"
            onClick={() => setActiveMenu('friendly_section')}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeMenu === 'friendly_section'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Smile className="w-4 h-4 fill-current" />
              <span className="font-black">Friendly Section</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeMenu === 'friendly_section'
                  ? 'bg-white text-emerald-700'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              NEW
            </span>
          </button>

          {/* Overview & Stats Tab */}
          <button
            type="button"
            onClick={() => setActiveMenu('overview')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeMenu === 'overview'
                ? 'bg-[#FF6B6B] text-white shadow-md'
                : 'text-[#2D3436] hover:bg-white/80'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Overview & Stats</span>
          </button>

          {/* Firebase Cloud & Domain Tab */}
          <button
            type="button"
            onClick={() => setActiveMenu('firebase_hosting')}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeMenu === 'firebase_hosting'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-amber-800 hover:bg-amber-50 border border-amber-200/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-current" />
              <span className="font-black">Firebase & Domain</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeMenu === 'firebase_hosting'
                  ? 'bg-white text-amber-600'
                  : 'bg-amber-500 text-white'
              }`}
            >
              LIVE
            </span>
          </button>

          {/* Quick info in sidebar */}
          <div className="hidden md:block mt-auto pt-6 border-t border-[#ffd1dc] space-y-2 text-xs text-[#636E72]">
            <div className="flex justify-between items-center font-semibold">
              <span>Very Romantic Leads:</span>
              <span className="font-bold text-[#ff477e]">{veryRomanticCount}</span>
            </div>
            <div className="flex justify-between items-center font-semibold">
              <span>WhatsApp Leads:</span>
              <span className="font-bold text-[#25D366]">{whatsappLeads.length}</span>
            </div>
            <div className="flex justify-between items-center font-semibold">
              <span>Help Chat Users:</span>
              <span className="font-bold text-[#0088cc]">{uniqueChatMembers.length}</span>
            </div>
            {blockedMembers.length > 0 && (
              <div className="flex justify-between items-center font-semibold text-red-600">
                <span>Blocked Users:</span>
                <span className="font-black bg-red-100 px-1.5 py-0.5 rounded-md">{blockedMembers.length}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 bg-white/60">
          {/* ========================================================================= */}
          {/* 1. MEMBERS LIST VIEW */}
          {/* ========================================================================= */}
          {activeMenu === 'members' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#2D3436] tracking-tight">
                    Registered Member List
                  </h2>
                  <p className="text-sm text-[#636E72] font-medium mt-0.5">
                    Kul {members.length} ladkiyon ne baat karne ke liye information submit kiya hai.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {members.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllMembers}
                      className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Sabhi Members Delete Karein</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new Event('members_updated'))}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#636E72] hover:text-[#FF6B6B] transition-colors cursor-pointer bg-white border border-[#ffe0e6] px-3 py-2 rounded-xl"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh List</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Naam ya topic se khojein..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ffe0e6] rounded-2xl text-xs sm:text-sm text-[#2D3436] placeholder-[#A0A0A0] focus:outline-none focus:border-[#FF6B6B] transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#636E72] shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-[#ffe0e6] text-[#2D3436] text-xs sm:text-sm font-bold rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-[#FF6B6B] cursor-pointer"
                  >
                    <option value="all">Sabhi Status ({members.length})</option>
                    <option value="New">New</option>
                    <option value="Connected">Connected</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Bulk Action Bar */}
              {filteredMembers.length > 0 && (
                <div className="bg-[#FFF5F7] p-3 rounded-2xl border border-[#ffe0e6] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(filteredMembers.map(m => m.id))}
                      className="flex items-center gap-1.5 font-bold text-[#2D3436] hover:text-[#FF6B6B] cursor-pointer"
                    >
                      {selectedMemberIds.length === filteredMembers.length && filteredMembers.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#FF6B6B]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#A0A0A0]" />
                      )}
                      <span>Select All ({selectedMemberIds.length}/{filteredMembers.length})</span>
                    </button>
                  </div>

                  {selectedMemberIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteSelectedMembers}
                      className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedMemberIds.length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Member Cards List */}
              {filteredMembers.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white/80 rounded-3xl border border-dashed border-[#ffd1dc] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FFF5F7] text-[#FF6B6B] flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-base font-bold text-[#2D3436]">
                    Koi member nahi mila
                  </div>
                  <p className="text-xs text-[#636E72]">
                    Aapne jo filter ya search kiya hai uske anusaar koi entry nahi hai.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredMembers.map((member) => {
                    const isVeryRomantic = 
                      member.mode === 'very_romantic' || 
                      member.interests.includes(VERY_ROMANTIC_TOPIC) || 
                      member.interests.includes(romanticConfig.optionTitle);
                    const isSelected = selectedMemberIds.includes(member.id);

                    return (
                      <div
                        key={member.id}
                        className={`p-5 sm:p-6 rounded-3xl border transition-all hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden ${
                          isSelected ? 'ring-2 ring-[#FF6B6B] bg-[#fff0f3]' : ''
                        } ${
                          isVeryRomantic
                            ? 'bg-gradient-to-r from-[#fff9fa] via-white to-[#fff0f4] border-[#ff477e]/40 shadow-xs'
                            : 'bg-white border-[#ffe0e6]'
                        }`}
                      >
                        {isVeryRomantic && (
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff477e]" />
                        )}

                        <div className="space-y-3 flex-1 flex items-start gap-3">
                          {/* Selection Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleSelectMember(member.id)}
                            className="mt-1 text-[#FF6B6B] hover:scale-110 transition-transform cursor-pointer"
                            title={isSelected ? "Deselect member" : "Select member for bulk delete"}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-[#FF6B6B]" />
                            ) : (
                              <Square className="w-5 h-5 text-[#A0A0A0]" />
                            )}
                          </button>

                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] text-white font-black text-base flex items-center justify-center shadow-xs">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-[#2D3436] tracking-tight">
                                {member.name}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-[#636E72] font-semibold mt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-[#A0A0A0]" />
                                <span>{member.registeredAt}</span>
                              </div>
                            </div>

                            <span className="bg-[#FFF5F7] text-[#FF6B6B] border border-[#ffd1dc] text-xs font-black px-3 py-1 rounded-full">
                              Age: {member.age} saal
                            </span>

                            {isVeryRomantic && (
                              <span className="bg-gradient-to-r from-[#ff477e] to-[#ff0055] text-white text-xs font-black px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                                <Flame className="w-3 h-3 fill-white" />
                                <span>Very Romantic Mode</span>
                              </span>
                            )}

                            <span
                              className={`text-xs font-extrabold px-3 py-0.5 rounded-full ${
                                member.status === 'New'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : member.status === 'Connected'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {member.status}
                            </span>
                          </div>

                          {/* Interests Pills */}
                          <div>
                            <div className="text-[11px] font-bold text-[#A0A0A0] uppercase tracking-wider mb-1.5">
                              Pasandida Baat Cheet Ke Topics:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {member.interests && member.interests.length > 0 ? (
                                member.interests.map((interest, idx) => {
                                  const isSpecial = 
                                    interest === VERY_ROMANTIC_TOPIC || 
                                    interest === romanticConfig.optionTitle;
                                  return (
                                    <span
                                      key={idx}
                                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl border ${
                                        isSpecial
                                          ? 'bg-pink-100 text-[#ff477e] border-pink-300 font-black shadow-2xs'
                                          : 'bg-[#FFF5F7] text-[#FF6B6B] border-[#ffd1dc]'
                                      }`}
                                    >
                                      {isSpecial ? (
                                        <Flame className="w-3 h-3 text-[#ff477e] fill-[#ff477e]" />
                                      ) : (
                                        <Heart className="w-3 h-3 text-[#FF6B6B]" />
                                      )}
                                      <span>{interest}</span>
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-xs text-[#A0A0A0] italic">General baatein</span>
                              )}
                            </div>
                          </div>
                        </div>
                        </div>

                        {/* Status & Actions Right Column */}
                        <div className="flex flex-wrap lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#f1f2f6]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#636E72]">Status badlein:</span>
                            <select
                              value={member.status}
                              onChange={(e) =>
                                handleStatusChange(member.id, e.target.value as Member['status'])
                              }
                              className="bg-white border border-[#ffe0e6] text-xs font-extrabold text-[#2D3436] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FF6B6B] cursor-pointer"
                            >
                              <option value="New">New</option>
                              <option value="Connected">Connected</option>
                              <option value="Pending">Pending</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedMember(member)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#2D3436] hover:text-[#FF6B6B] bg-[#FFF5F7] hover:bg-[#ffebee] border border-[#ffd1dc] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(member.id, member.name)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. VERY ROMANTIC SPECIAL SECTION (CONFIG + WHATSAPP + HELP CHAT) */}
          {/* ========================================================================= */}
          {activeMenu === 'romantic_section' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ffe0e6] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-[#ff477e] fill-[#ff477e]" />
                    <h2 className="text-2xl font-black text-[#2D3436] tracking-tight">
                      Very Romantic Section Control
                    </h2>
                  </div>
                  <p className="text-sm text-[#636E72] font-medium mt-0.5">
                    Yaha se aap Very Romantic page ke texts, social media handles, WhatsApp leads aur live chat control kar sakte hain.
                  </p>
                </div>
              </div>

              {/* Subtabs for Romantic Section */}
              <div className="flex flex-wrap gap-2 border-b border-[#ffe4e9] pb-3">
                <button
                  type="button"
                  onClick={() => setRomanticSubTab('settings')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    romanticSubTab === 'settings'
                      ? 'bg-[#ff477e] text-white shadow-sm'
                      : 'bg-white text-[#2D3436] hover:bg-pink-50 border border-pink-200'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Page Text & Social Links Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRomanticSubTab('whatsapp')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    romanticSubTab === 'whatsapp'
                      ? 'bg-[#25D366] text-black shadow-sm'
                      : 'bg-white text-[#2D3436] hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  <Phone className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Registrations</span>
                  <span className="bg-[#25D366] text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                    {whatsappLeads.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRomanticSubTab('chats')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    romanticSubTab === 'chats'
                      ? 'bg-[#0088cc] text-white shadow-sm'
                      : 'bg-white text-[#2D3436] hover:bg-sky-50 border border-sky-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#0088cc]" />
                  <span>Help & Support Live Chats</span>
                  <span className="bg-[#0088cc] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {uniqueChatMembers.length}
                  </span>
                </button>
              </div>

              {/* Subtab 1: Edit Romantic Text & Social Media Handles */}
              {romanticSubTab === 'settings' && (
                <form onSubmit={handleSaveRomanticSettings} className="space-y-6">
                  {saveSuccessNotice && (
                    <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in fade-in">
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span>Very Romantic Screen aur Option Settings safaltapoorvak save ho gayi hain!</span>
                    </div>
                  )}

                  {/* 1. Profile Form Option Name & Description */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ffe0e6] space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-sm font-black text-[#ff477e] uppercase tracking-wider">
                      <Flame className="w-4 h-4 fill-current" />
                      <span>1. Profile Form Par Dikhne Wala Option Name & Details</span>
                    </div>
                    <p className="text-xs text-[#636E72]">
                      Yaha aap jo likhenge, wahi naam ladkiyon ke form me option ke roop me dikhega.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                          Option Title (Jaise: Very Romantic & Special Baatein) *
                        </label>
                        <input
                          type="text"
                          value={romanticForm.optionTitle}
                          onChange={(e) =>
                            setRomanticForm({ ...romanticForm, optionTitle: e.target.value })
                          }
                          required
                          className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-[#ff477e] rounded-xl px-4 py-2.5 text-sm text-[#2D3436] font-bold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                          Option Badge (Jaise: EXCLUSIVE / SPECIAL)
                        </label>
                        <input
                          type="text"
                          value={romanticForm.optionBadge}
                          onChange={(e) =>
                            setRomanticForm({ ...romanticForm, optionBadge: e.target.value })
                          }
                          className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-[#ff477e] rounded-xl px-4 py-2.5 text-sm text-[#2D3436] font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                        Option Description (Form me neeche choti details)
                      </label>
                      <textarea
                        rows={2}
                        value={romanticForm.optionDescription}
                        onChange={(e) =>
                          setRomanticForm({ ...romanticForm, optionDescription: e.target.value })
                        }
                        className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-[#ff477e] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#2D3436] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 2. Romantic Screen Content Customization */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ffe0e6] space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-sm font-black text-[#ff477e] uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-[#ff477e]" />
                      <span>2. Very Romantic Page Ka Text & Mast Baatein</span>
                    </div>
                    <p className="text-xs text-[#636E72]">
                      Screen khulne par user ko kya likha hua dikhega, wo sab yaha se badal sakte hain.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                          Screen Top Tag / Title
                        </label>
                        <input
                          type="text"
                          value={romanticForm.pageTitle}
                          onChange={(e) =>
                            setRomanticForm({ ...romanticForm, pageTitle: e.target.value })
                          }
                          className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-[#ff477e] rounded-xl px-4 py-2.5 text-sm text-[#2D3436] font-bold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                          Banner Tagline / Subtitle
                        </label>
                        <input
                          type="text"
                          value={romanticForm.bannerMessage}
                          onChange={(e) =>
                            setRomanticForm({ ...romanticForm, bannerMessage: e.target.value })
                          }
                          className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-[#ff477e] rounded-xl px-4 py-2.5 text-sm text-[#2D3436] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                        Romantic Subtitle / Introduction Line
                      </label>
                      <textarea
                        rows={2}
                        value={romanticForm.pageSubtitle}
                        onChange={(e) =>
                          setRomanticForm({ ...romanticForm, pageSubtitle: e.target.value })
                        }
                        className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-[#ff477e] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#2D3436] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                        Mast Romantic Shayari / Quote (Box me highlighted dikhta hai)
                      </label>
                      <textarea
                        rows={2}
                        value={romanticForm.quoteText}
                        onChange={(e) =>
                          setRomanticForm({ ...romanticForm, quoteText: e.target.value })
                        }
                        className="w-full bg-[#FFF5F7] border border-[#ffd1dc] focus:border-[#ff477e] rounded-xl px-4 py-2.5 text-sm font-serif italic text-[#2D3436] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 3. Social Media Handles & WhatsApp Config */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ffe0e6] space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-sm font-black text-[#2D3436] uppercase tracking-wider">
                      <Settings className="w-4 h-4 text-[#FF6B6B]" />
                      <span>3. Social Media Buttons & Links Configuration</span>
                    </div>
                    <p className="text-xs text-[#636E72]">
                      User jis button par click karega wo direct aapke is username ya number par connect hoga.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Instagram */}
                      <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-[#833ab4] uppercase tracking-wider">
                            Instagram Username
                          </label>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-[#636E72] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={romanticForm.socialLinks.instagramEnabled}
                              onChange={(e) =>
                                setRomanticForm({
                                  ...romanticForm,
                                  socialLinks: {
                                    ...romanticForm.socialLinks,
                                    instagramEnabled: e.target.checked,
                                  },
                                })
                              }
                            />
                            <span>Active</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={romanticForm.socialLinks.instagramUsername}
                          onChange={(e) =>
                            setRomanticForm({
                              ...romanticForm,
                              socialLinks: {
                                ...romanticForm.socialLinks,
                                instagramUsername: e.target.value,
                              },
                            })
                          }
                          placeholder="your_instagram_id"
                          className="w-full bg-white border border-[#ffd1dc] rounded-xl px-3 py-2 text-xs font-bold text-[#2D3436] focus:outline-none"
                        />
                        <p className="text-[11px] text-[#A0A0A0]">
                          Click par direct message URL open hoga: ig.me/m/{romanticForm.socialLinks.instagramUsername || 'username'}
                        </p>
                      </div>

                      {/* Telegram */}
                      <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-[#0088cc] uppercase tracking-wider">
                            Telegram Username
                          </label>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-[#636E72] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={romanticForm.socialLinks.telegramEnabled}
                              onChange={(e) =>
                                setRomanticForm({
                                  ...romanticForm,
                                  socialLinks: {
                                    ...romanticForm.socialLinks,
                                    telegramEnabled: e.target.checked,
                                  },
                                })
                              }
                            />
                            <span>Active</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={romanticForm.socialLinks.telegramUsername}
                          onChange={(e) =>
                            setRomanticForm({
                              ...romanticForm,
                              socialLinks: {
                                ...romanticForm.socialLinks,
                                telegramUsername: e.target.value,
                              },
                            })
                          }
                          placeholder="your_telegram_id"
                          className="w-full bg-white border border-[#ffd1dc] rounded-xl px-3 py-2 text-xs font-bold text-[#2D3436] focus:outline-none"
                        />
                        <p className="text-[11px] text-[#A0A0A0]">
                          Click par direct message: t.me/{romanticForm.socialLinks.telegramUsername || 'username'}
                        </p>
                      </div>

                      {/* Snapchat */}
                      <div className="p-4 rounded-2xl bg-yellow-50/50 border border-yellow-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-[#855B00] uppercase tracking-wider">
                            Snapchat Username
                          </label>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-[#636E72] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={romanticForm.socialLinks.snapchatEnabled}
                              onChange={(e) =>
                                setRomanticForm({
                                  ...romanticForm,
                                  socialLinks: {
                                    ...romanticForm.socialLinks,
                                    snapchatEnabled: e.target.checked,
                                  },
                                })
                              }
                            />
                            <span>Active</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={romanticForm.socialLinks.snapchatUsername}
                          onChange={(e) =>
                            setRomanticForm({
                              ...romanticForm,
                              socialLinks: {
                                ...romanticForm.socialLinks,
                                snapchatUsername: e.target.value,
                              },
                            })
                          }
                          placeholder="your_snapchat_id"
                          className="w-full bg-white border border-[#ffd1dc] rounded-xl px-3 py-2 text-xs font-bold text-[#2D3436] focus:outline-none"
                        />
                        <p className="text-[11px] text-[#A0A0A0]">
                          Click par snapchat profile khulegi: snapchat.com/add/{romanticForm.socialLinks.snapchatUsername || 'username'}
                        </p>
                      </div>

                      {/* WhatsApp Registration Feature */}
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-[#25D366] uppercase tracking-wider flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4 text-[#25D366]" />
                            <span>WhatsApp Lead Button</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-[#636E72] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={romanticForm.socialLinks.whatsappEnabled}
                              onChange={(e) =>
                                setRomanticForm({
                                  ...romanticForm,
                                  socialLinks: {
                                    ...romanticForm.socialLinks,
                                    whatsappEnabled: e.target.checked,
                                  },
                                })
                              }
                            />
                            <span>Active</span>
                          </label>
                        </div>
                        <p className="text-xs text-[#2D3436] font-medium leading-relaxed">
                          User popup me apna WhatsApp number submit karega. Saari information direct neeche <strong>WhatsApp Registered Leads</strong> table me save hogi.
                        </p>
                        <div className="text-[11px] text-emerald-800 bg-emerald-100/70 p-2.5 rounded-xl font-semibold">
                          ✓ <strong>Aapka number hidden hai:</strong> User ko WhatsApp par redirect nahi kiya jayega, sirf uska number register hokar aapko milega.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      id="save-romantic-settings-btn"
                      className="bg-gradient-to-r from-[#ff477e] to-[#ff0055] hover:from-[#ff3366] hover:to-[#e6004c] text-white font-black text-sm px-8 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>Settings & Text Update Karein</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Subtab 2: WhatsApp Registered Numbers Table */}
              {romanticSubTab === 'whatsapp' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-[#2D3436]">
                        WhatsApp Registrations Data ({whatsappLeads.length})
                      </h3>
                      <p className="text-xs text-[#636E72]">
                        Jin ladkiyon ne WhatsApp button par click karke popup me apna number save kiya hai.
                      </p>
                    </div>

                    <span className="bg-[#25D366]/20 text-emerald-900 border border-[#25D366]/40 text-xs font-black px-3 py-1 rounded-full">
                      Total Leads: {whatsappLeads.length}
                    </span>
                  </div>

                  {whatsappLeads.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#ffd1dc] space-y-2">
                      <Phone className="w-8 h-8 text-[#25D366] mx-auto opacity-60" />
                      <div className="font-bold text-sm text-[#2D3436]">
                        Abhi tak koi WhatsApp number register nahi hua hai.
                      </div>
                      <p className="text-xs text-[#A0A0A0]">
                        Jaise hi koi user WhatsApp button se register karega, uska number yaha dikhega.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-[#ffe0e6] overflow-hidden shadow-2xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-[#FFF5F7] border-b border-[#ffd1dc] text-[#636E72] font-black uppercase text-[11px] tracking-wider">
                            <tr>
                              <th className="p-4">User Name</th>
                              <th className="p-4">WhatsApp Mobile Number</th>
                              <th className="p-4">Date & Time</th>
                              <th className="p-4">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#ffe8ed]">
                            {whatsappLeads.map((lead) => {
                              const cleanNum = lead.phone.replace(/\D/g, '');
                              return (
                                <tr key={lead.id} className="hover:bg-pink-50/30 transition-colors">
                                  <td className="p-4 font-black text-[#2D3436] flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs font-black">
                                      {lead.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{lead.name}</span>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-[#25D366] text-sm">
                                    {lead.phone}
                                  </td>
                                  <td className="p-4 text-xs text-[#636E72]">
                                    {lead.submittedAt}
                                  </td>
                                  <td className="p-4 flex items-center gap-2">
                                    <a
                                      href={`https://wa.me/${cleanNum}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#1ebc59] text-black font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-xs"
                                    >
                                      <span>Chat Now</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() => deleteWhatsAppRegistration(lead.id)}
                                      className="p-1.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Delete Record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
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

              {/* Subtab 3: Help & In-App Support Live Chats */}
              {romanticSubTab === 'chats' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Left Column: List of Chat Conversations */}
                  <div className="bg-white rounded-3xl border border-[#ffe0e6] p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#ffe8ed]">
                      <h3 className="font-black text-sm text-[#2D3436]">
                        Users Seeking Help ({uniqueChatMembers.length})
                      </h3>
                      <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                        Live Web Chat
                      </span>
                    </div>

                    {uniqueChatMembers.length === 0 ? (
                      <div className="text-center py-8 text-xs text-[#A0A0A0]">
                        Abhi tak kisi user ne help chat start nahi kiya hai.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {uniqueChatMembers.map((chat) => {
                          const isSelected = selectedChatMemberId === chat.memberId;
                          return (
                            <button
                              key={chat.memberId}
                              type="button"
                              onClick={() => setSelectedChatMemberId(chat.memberId)}
                              className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'bg-[#0088cc] text-white shadow-sm'
                                  : 'bg-[#FFF5F7] hover:bg-pink-100/60 text-[#2D3436]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isSelected ? 'bg-white text-[#0088cc]' : 'bg-[#FF6B6B] text-white'
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
                                      isSelected ? 'text-sky-100' : 'text-[#636E72]'
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

                  {/* Right Column: Chat Window & Admin Reply Box */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-[#ffe0e6] overflow-hidden flex flex-col h-[520px]">
                    {activeChatMemberId ? (
                      <>
                        {/* Chat Header */}
                        <div className="p-4 bg-gradient-to-r from-sky-50 to-pink-50 border-b border-[#ffe8ed] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${isRomanticChatBlocked ? 'bg-red-500' : 'bg-[#0088cc]'}`}>
                              {activeRomanticChatMember?.memberName.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-sm text-[#2D3436]">
                                  {activeRomanticChatMember?.memberName || 'User'}
                                </h4>
                                {isRomanticChatBlocked && (
                                  <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Ban className="w-3 h-3" />
                                    <span>BLOCKED</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#636E72]">
                                ID: {activeChatMemberId}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(activeChatMemberId)}
                              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                isRomanticChatBlocked
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                  : 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300'
                              }`}
                            >
                              {isRomanticChatBlocked ? (
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
                              onClick={() => handleClearChatForMember(activeChatMemberId)}
                              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 font-bold px-2.5 py-1.5 rounded-xl border border-red-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Clear Chat</span>
                            </button>
                          </div>
                        </div>

                        {/* Blocked notification banner */}
                        {isRomanticChatBlocked && (
                          <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-800 font-bold flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Yeh user blocked hai. User ab naye help messages nahi bhej sakti.</span>
                          </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fafafa]">
                          {helpChats
                            .filter(c => c.memberId === activeChatMemberId)
                            .map((msg) => {
                              const isAdmin = msg.sender === 'admin';
                              return (
                                <div
                                  key={msg.id}
                                  className={`group flex items-start gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                >
                                  {!isAdmin && (
                                    <div className="w-7 h-7 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-1">
                                      {msg.memberName.charAt(0).toUpperCase()}
                                    </div>
                                  )}

                                  {isAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteChatMessage(msg.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded self-center cursor-pointer"
                                      title="Delete message"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}

                                  <div
                                    className={`max-w-[75%] rounded-2xl p-3 text-xs sm:text-sm ${
                                      isAdmin
                                        ? 'bg-[#0088cc] text-white rounded-tr-none shadow-xs'
                                        : 'bg-white text-[#2D3436] border border-[#e0e0e0] rounded-tl-none shadow-xs'
                                    }`}
                                  >
                                    <div className="text-[10px] font-bold opacity-75 mb-0.5">
                                      {isAdmin ? 'Admin (Aap)' : msg.memberName} • {msg.timestamp}
                                    </div>
                                    <div className="leading-relaxed break-words">{msg.text}</div>
                                  </div>

                                  {!isAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteChatMessage(msg.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded self-center cursor-pointer"
                                      title="Delete message"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}

                                  {isAdmin && (
                                    <div className="w-7 h-7 rounded-full bg-sky-100 text-[#0088cc] flex items-center justify-center text-[10px] font-black shrink-0 mt-1">
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
                            className="flex-1 bg-[#FFF5F7] border border-[#ffd1dc] focus:border-[#0088cc] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#2D3436] focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
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
          )}

          {/* ========================================================================= */}
          {/* 3. FRIENDLY CONNECT SPECIAL SECTION (CONFIG + WHATSAPP + HELP CHAT) */}
          {/* ========================================================================= */}
          {activeMenu === 'friendly_section' && (
            <FriendlySectionAdmin />
          )}

          {/* ========================================================================= */}
          {/* 4. OVERVIEW & STATS VIEW */}
          {/* ========================================================================= */}
          {activeMenu === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#2D3436] tracking-tight">
                  Overview & Analytics
                </h2>
                <p className="text-sm text-[#636E72] font-medium mt-0.5">
                  App usage, Very Romantic, Friendly Connect aur members interest ka consolidated analysis.
                </p>
              </div>

              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FFF5F7] to-[#ffe9ed] border border-[#ffd1dc]">
                  <div className="text-xs font-black text-[#FF6B6B] uppercase tracking-wider mb-2">
                    Total Members
                  </div>
                  <div className="text-4xl font-black text-[#FF6B6B]">{members.length}</div>
                  <div className="text-xs text-[#636E72] mt-1">Registrations received</div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#fff0f4] to-[#ffe3eb] border border-[#ff477e]/30">
                  <div className="text-xs font-black text-[#ff477e] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-[#ff477e]" />
                    <span>Very Romantic</span>
                  </div>
                  <div className="text-4xl font-black text-[#ff477e]">
                    {veryRomanticCount}
                  </div>
                  <div className="text-xs text-[#ff477e]/80 mt-1">Romantic section leads</div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#86efac]">
                  <div className="text-xs font-black text-[#15803d] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 fill-[#15803d]" />
                    <span>Friendly Connect</span>
                  </div>
                  <div className="text-4xl font-black text-[#15803d]">
                    {members.filter(m => m.mode === 'friendly' || (friendlyConfig.optionTitle && m.interests.includes(friendlyConfig.optionTitle))).length}
                  </div>
                  <div className="text-xs text-[#15803d]/80 mt-1">Friendly section leads</div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#e6fcf5] to-[#d3f9ec] border border-[#b2f2bb]">
                  <div className="text-xs font-black text-[#2b8a3e] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#2b8a3e]" />
                    <span>WhatsApp Leads</span>
                  </div>
                  <div className="text-4xl font-black text-[#2b8a3e]">
                    {whatsappLeads.length}
                  </div>
                  <div className="text-xs text-[#2b8a3e]/80 mt-1">Phone numbers collected</div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#e7f5ff] to-[#d0ebff] border border-[#a5d8ff]">
                  <div className="text-xs font-black text-[#1c7ed6] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#1c7ed6]" />
                    <span>Live Help Chats</span>
                  </div>
                  <div className="text-4xl font-black text-[#1c7ed6]">
                    {uniqueChatMembers.length}
                  </div>
                  <div className="text-xs text-[#1c7ed6]/80 mt-1">
                    {blockedMembers.length > 0 ? `${blockedMembers.length} blocked` : 'Active conversations'}
                  </div>
                </div>
              </div>

              {/* Progress Bars of Topics */}
              <div className="p-6 bg-white rounded-3xl border border-[#ffe0e6] space-y-4">
                <h3 className="font-black text-base text-[#2D3436]">
                  Ladkiyon ke Sabse Zyada Chune Gaye Topics:
                </h3>
                <div className="space-y-3">
                  {[
                    romanticConfig.optionTitle || VERY_ROMANTIC_TOPIC,
                    friendlyConfig.optionTitle || 'Acha & Friendly Baatein (Social Connect)',
                    'Dil Ki Baatein & Feelings',
                    'Romantic & Sweet Baatein',
                    'Late Night Deep Talks',
                    'Fun, Masti & Casual Gupshup',
                    'Daily Life & Routine Sharing',
                    'Care & Emotional Support'
                  ].map((topic, i) => {
                    const count = members.filter(m => m.interests.includes(topic)).length;
                    const pct = members.length > 0 ? Math.round((count / members.length) * 100) : 0;
                    const isSpecial = topic === (romanticConfig.optionTitle || VERY_ROMANTIC_TOPIC);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-[#2D3436]">
                          <span className={isSpecial ? 'text-[#ff477e] font-black flex items-center gap-1' : ''}>
                            {isSpecial && <Flame className="w-3.5 h-3.5 fill-[#ff477e]" />}
                            {topic}
                          </span>
                          <span className={isSpecial ? 'text-[#ff477e] font-black' : 'text-[#FF6B6B]'}>
                            {count} members ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#f1f2f6] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isSpecial
                                ? 'bg-gradient-to-r from-[#ff477e] to-[#ff0055]'
                                : 'bg-gradient-to-r from-[#FF6B6B] to-[#FFD93D]'
                            }`}
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. FIREBASE CLOUD & HOSTING / DOMAIN SECTION */}
          {/* ========================================================================= */}
          {activeMenu === 'firebase_hosting' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#2D3436] tracking-tight flex items-center gap-2.5">
                  <Cloud className="w-6 h-6 text-amber-500" />
                  <span>Firebase Cloud & Hosting Integration</span>
                </h2>
                <p className="text-sm text-[#636E72] font-medium mt-0.5">
                  Aapka app Google Firebase Firestore database aur Firebase Hosting se successfully connected hai.
                </p>
              </div>

              {/* Live Connection Status Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-white border border-amber-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-amber-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-[#2D3436]">Cloud Firestore Database</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>CONNECTED & ACTIVE</span>
                        </span>
                      </div>
                      <p className="text-xs text-[#636E72] font-medium mt-0.5">
                        Real-time automatic sync enabled for all members, chats, WhatsApp leads & settings.
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://console.firebase.google.com/project/${fbInfo.projectId}/firestore`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <span>Open Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Configuration Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/50">
                    <span className="text-[11px] font-bold text-[#A0A0A0] uppercase tracking-wider block">
                      Firebase Project ID
                    </span>
                    <span className="font-mono text-sm font-black text-[#2D3436] break-all">
                      {fbInfo.projectId}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/50">
                    <span className="text-[11px] font-bold text-[#A0A0A0] uppercase tracking-wider block">
                      Firestore Database ID
                    </span>
                    <span className="font-mono text-xs font-bold text-[#2D3436] break-all">
                      {fbInfo.databaseId}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/50">
                    <span className="text-[11px] font-bold text-[#A0A0A0] uppercase tracking-wider block">
                      Real-time Collections
                    </span>
                    <span className="font-bold text-xs text-amber-700">
                      members, config, whatsapp_leads, help_chats
                    </span>
                  </div>
                </div>
              </div>

              {/* Firebase Hosting & Domains Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#ffe0e6] shadow-xs space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4D96FF]/15 text-[#4D96FF] flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#2D3436]">Hosting & Live Domains</h3>
                    <p className="text-xs text-[#636E72]">
                      Aapke Firebase project ke official hosting URLs aur domain configuration.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Primary Domain */}
                  <div className="p-4 rounded-2xl bg-[#FFF5F7] border border-[#ffd1dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#FF6B6B] uppercase tracking-wider">Primary Firebase Web App</span>
                        <span className="text-[10px] bg-white border border-[#ffd1dc] text-[#636E72] px-2 py-0.5 rounded-md font-bold">Default SSL</span>
                      </div>
                      <a
                        href={fbInfo.defaultHostingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono font-bold text-sm sm:text-base text-[#2D3436] hover:text-[#FF6B6B] transition-colors flex items-center gap-1.5 mt-0.5"
                      >
                        <span>{fbInfo.defaultHostingUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#A0A0A0]" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(fbInfo.defaultHostingUrl);
                          setCopiedUrl('primary');
                          setTimeout(() => setCopiedUrl(null), 2500);
                        }}
                        className="inline-flex items-center gap-1 bg-white border border-pink-200 text-xs font-bold px-3 py-1.5 rounded-xl text-[#2D3436] hover:border-[#FF6B6B] cursor-pointer"
                      >
                        {copiedUrl === 'primary' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#636E72]" />}
                        <span>{copiedUrl === 'primary' ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Secondary Domain */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#636E72] uppercase tracking-wider">Secondary Firebase App Domain</span>
                      <a
                        href={fbInfo.secondaryHostingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono font-bold text-sm text-[#2D3436] hover:text-[#4D96FF] transition-colors flex items-center gap-1.5 mt-0.5"
                      >
                        <span>{fbInfo.secondaryHostingUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#A0A0A0]" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(fbInfo.secondaryHostingUrl);
                          setCopiedUrl('secondary');
                          setTimeout(() => setCopiedUrl(null), 2500);
                        }}
                        className="inline-flex items-center gap-1 bg-white border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl text-[#2D3436] hover:border-gray-400 cursor-pointer"
                      >
                        {copiedUrl === 'secondary' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#636E72]" />}
                        <span>{copiedUrl === 'secondary' ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Custom Domain Linking Guide */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-50/70 via-white to-purple-50/50 border border-blue-200/80 shadow-xs space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#2D3436]">
                      Apna Custom Domain Kaise Link Karein (e.g. yourname.com)?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#636E72] font-medium mt-0.5">
                      Agar aapke paas GoDaddy, Namecheap, Hostinger ya Cloudflare par koi apna domain hai, toh use Firebase se connect karna behad asaan hai:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                      1
                    </div>
                    <h4 className="font-bold text-sm text-[#2D3436]">Firebase Console Kholein</h4>
                    <p className="text-xs text-[#636E72] leading-relaxed">
                      Neeche diye gaye link se apne Firebase project ke Hosting dashboard par jayein:
                    </p>
                    <a
                      href={`https://console.firebase.google.com/project/${fbInfo.projectId}/hosting/sites`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-1"
                    >
                      <span>Open Firebase Hosting Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                      2
                    </div>
                    <h4 className="font-bold text-sm text-[#2D3436]">Add Custom Domain Par Click Karein</h4>
                    <p className="text-xs text-[#636E72] leading-relaxed">
                      Dashboard me <strong>&quot;Add custom domain&quot;</strong> button par click karein aur apna domain name (jaise <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">mywebsite.com</code>) type karein.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                      3
                    </div>
                    <h4 className="font-bold text-sm text-[#2D3436]">DNS Records Copy Karein</h4>
                    <p className="text-xs text-[#636E72] leading-relaxed">
                      Firebase aapko <strong>2 A Records (IP Addresses)</strong> aur <strong>1 TXT Record</strong> dikhayega. Inhe copy kar lein.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                      4
                    </div>
                    <h4 className="font-bold text-sm text-[#2D3436]">Domain Provider me Paste Karein</h4>
                    <p className="text-xs text-[#636E72] leading-relaxed">
                      GoDaddy ya Hostinger ke DNS Management me jakar wo A Records add karein. 15-30 minute me automatic <strong>Free SSL Certificate</strong> activate ho jayega!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Member Details Modal */}
      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#ffe0e6] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#ffe8ed]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
                <h3 className="font-black text-xl text-[#2D3436]">Member Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="text-[#A0A0A0] hover:text-[#2D3436] font-bold text-sm px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                  Naam & Age
                </div>
                <div className="text-xl font-black text-[#2D3436] mt-0.5">
                  {selectedMember.name}
                </div>
                <div className="text-sm font-semibold text-[#636E72] mt-0.5">
                  Age: <span className="text-[#2D3436] font-bold">{selectedMember.age} saal</span>
                </div>
                {(selectedMember.mode === 'very_romantic' || 
                  selectedMember.interests.includes(VERY_ROMANTIC_TOPIC) || 
                  selectedMember.interests.includes(romanticConfig.optionTitle)) && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 bg-[#ff477e] text-white text-xs font-black px-3 py-1 rounded-xl shadow-2xs">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Special Very Romantic Profile</span>
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-2">
                  Pasandida Baat Cheet Ke Topics:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.interests.map((it, idx) => {
                    const isSpecial = it === VERY_ROMANTIC_TOPIC || it === romanticConfig.optionTitle;
                    return (
                      <span
                        key={idx}
                        className={`font-bold text-xs px-3 py-1.5 rounded-xl border ${
                          isSpecial
                            ? 'bg-pink-100 text-[#ff477e] border-pink-300 font-black shadow-xs'
                            : 'bg-[#FFF5F7] border border-[#ffd1dc] text-[#FF6B6B]'
                        }`}
                      >
                        {it}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                  Registration Time
                </div>
                <div className="text-sm font-semibold text-[#2D3436] mt-0.5">
                  {selectedMember.registeredAt}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="bg-[#2D3436] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-black transition-colors cursor-pointer"
                >
                  Band Karein
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal (Works 100% in iFrame) */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-red-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#2D3436]">{confirmDialog.title}</h3>
                <p className="text-xs text-[#636E72] mt-0.5 leading-relaxed">{confirmDialog.description}</p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2.5 text-xs font-bold text-[#636E72] hover:text-[#2D3436] hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className="px-5 py-2.5 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                {confirmDialog.confirmText || 'Haan, Delete Karein'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
