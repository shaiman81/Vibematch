'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Moon, 
  Smile, 
  Coffee, 
  Shield, 
  ShieldCheck,
  ArrowLeft, 
  ArrowRight, 
  Check, 
  User, 
  Flame,
  AlertCircle,
  X,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { AVAILABLE_TOPICS, Member, VERY_ROMANTIC_TOPIC } from '@/lib/types';
import { saveMember, useRomanticConfig, setActiveUserMemberId } from '@/lib/storage';
import { trackEvent } from '@/lib/analytics';

interface ProfileFormScreenProps {
  onBack: () => void;
  onSuccess: (newMember: Member) => void;
}

export default function ProfileFormScreen({ onBack, onSuccess }: ProfileFormScreenProps) {
  const romanticConfig = useRomanticConfig();
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper for topic icons
  const renderTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart':
        return <Heart className="w-5 h-5 text-[#FF6B6B]" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#FFD93D]" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-[#4D96FF]" />;
      case 'Smile':
        return <Smile className="w-5 h-5 text-[#6BCB77]" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-[#f39c12]" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-[#9b59b6]" />;
      default:
        return <Heart className="w-5 h-5 text-[#FF6B6B]" />;
    }
  };

  const dynamicRomanticTitle = romanticConfig.optionTitle || VERY_ROMANTIC_TOPIC;
  const isVeryRomanticSelected = selectedInterests.includes(dynamicRomanticTitle) || selectedInterests.includes(VERY_ROMANTIC_TOPIC);

  // Standard topics toggle: automatically unselects Very Romantic if chosen
  const toggleInterest = (title: string) => {
    setErrorMessage('');
    const cleanList = selectedInterests.filter(i => i !== dynamicRomanticTitle && i !== VERY_ROMANTIC_TOPIC);
    if (cleanList.includes(title)) {
      setSelectedInterests(cleanList.filter(i => i !== title));
    } else {
      setSelectedInterests([...cleanList, title]);
    }
  };

  // Exclusive Very Romantic option: automatically unselects all standard topics
  const selectVeryRomanticOnly = () => {
    setErrorMessage('');
    if (isVeryRomanticSelected) {
      setSelectedInterests([]);
    } else {
      setSelectedInterests([dynamicRomanticTitle]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Kripya aage badhne ke liye apna naam zaroor likhein! (Naam daalna compulsory hai)');
      const nameInput = document.getElementById('user-name');
      nameInput?.focus();
      return;
    }
    setIsSubmitting(true);
    
    try {
      const finalName = name.trim();
      const finalAge = Number(age) || 21;
      const isVeryRomantic = isVeryRomanticSelected;

      trackEvent('click_start_profile', {
        age: finalAge,
        is_very_romantic: isVeryRomantic,
        interests_count: selectedInterests.length,
      });

      const created = saveMember({
        name: finalName,
        age: finalAge,
        interests: selectedInterests,
        mode: isVeryRomantic ? 'very_romantic' : 'standard',
      });
      setActiveUserMemberId(created.id);
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(created);
      }, 400);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMessage('Kuch galat hua, kripya dobara koshish karein.');
    }
  };

  // Filter out any romantic titles from display count in topics selector button
  const standardSelectedTopics = selectedInterests.filter(
    i => i !== dynamicRomanticTitle && i !== VERY_ROMANTIC_TOPIC
  );

  return (
    <>
      <motion.section
        id="profile-setup-screen"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/90 backdrop-blur-md border border-[#ffe4e9] rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_-20px_rgba(255,107,107,0.2)]"
      >
        {/* Top bar with back button */}
        <div className="flex items-center justify-between border-b border-[#ffe8ed] pb-4 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FF6B6B] hover:text-white hover:bg-[#FF6B6B] transition-colors py-1.5 px-3.5 rounded-full border border-[#FF6B6B]/40 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wapas</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF6B6B] animate-pulse" />
            <span className="text-xs font-bold text-[#FF6B6B] uppercase tracking-wider">
              Special Profile
            </span>
          </div>
        </div>

        {/* Screen Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FFF5F7] text-[#FF6B6B] border border-[#ffd1dc] px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apne Baare Me Batayein</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#2D3436]">
            Aapki Pasand & Details
          </h2>
          <p className="text-[#636E72] text-sm sm:text-base font-medium mt-1 max-w-md mx-auto">
            Bas yeh thodi si information bharein (sab optional hai), taaki hum ek dusre se acche se connect ho sakein.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-[#fff2f2] border border-[#ffcdd2] text-[#d63031] text-xs sm:text-sm font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Input 1: Name & Age row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="user-name" className="block text-xs font-black uppercase tracking-wider text-[#2D3436]">
                Aapka Pyara Naam <span className="text-[#FF6B6B] font-black normal-case">* (Zaroori Hai)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A0A0A0] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="user-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Jaise: Priya, Ananya, Simran..."
                  className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-base font-bold text-[#2D3436] placeholder-[#b2bec3] focus:outline-none transition-all shadow-xs ${
                    !name.trim() && errorMessage
                      ? 'bg-red-50/50 border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                      : 'bg-[#FFF5F7] border-[#ffe0e6] focus:border-[#FF6B6B] focus:bg-white'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="user-age" className="block text-xs font-black uppercase tracking-wider text-[#2D3436]">
                Aapki Age <span className="text-[#A0A0A0] font-medium normal-case">(Optional)</span>
              </label>
              <input
                id="user-age"
                type="number"
                min={18}
                max={80}
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="e.g. 21"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#FFF5F7] border border-[#ffe0e6] text-base font-bold text-[#2D3436] placeholder-[#b2bec3] focus:outline-none focus:border-[#FF6B6B] focus:bg-white transition-all text-center shadow-xs"
              />
            </div>
          </div>

          {/* Input 2: Topic Selection Button (Opens Popup) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-[#2D3436]">
                Mujhse Kis-Kis Type Ki Baat Karna Pasand Karogi? <span className="text-[#A0A0A0] font-medium normal-case">(Optional)</span>
              </label>
              {standardSelectedTopics.length > 0 && (
                <span className="text-xs font-bold text-[#FF6B6B]">
                  {standardSelectedTopics.length} chune gaye
                </span>
              )}
            </div>

            <button
              type="button"
              id="open-topics-modal-btn"
              onClick={() => setIsTopicModalOpen(true)}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                standardSelectedTopics.length > 0
                  ? 'bg-[#FFF5F7] border-[#FF6B6B] shadow-[0_4px_16px_-4px_rgba(255,107,107,0.25)] ring-2 ring-[#FF6B6B]/20'
                  : 'bg-white border-[#ffe0e6] hover:border-[#FF6B6B]/50 hover:bg-[#fffdfd]'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    standardSelectedTopics.length > 0 ? 'bg-[#FF6B6B] text-white shadow-xs' : 'bg-[#FFF5F7] border border-[#ffe0e6] text-[#FF6B6B]'
                  }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-sm sm:text-base text-[#2D3436] truncate">
                    {standardSelectedTopics.length > 0 ? (
                      <span className="text-[#FF6B6B]">{standardSelectedTopics.join(', ')}</span>
                    ) : (
                      <span>Click karke pasand ke options chunein</span>
                    )}
                  </div>
                  <p className="text-xs text-[#636E72] mt-0.5 truncate">
                    {standardSelectedTopics.length > 0
                      ? `${standardSelectedTopics.length} topics select kiye hain (badalne ke liye click karein)`
                      : 'Romantic, Dosti, Deep talks, Late night baatein etc.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-black text-[#FF6B6B] bg-[#FFF0F3] border border-[#ffd1dc] px-3.5 py-1.5 rounded-full shrink-0">
                <span>{standardSelectedTopics.length > 0 ? 'Badlein' : 'Chunein'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* OR Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#ffe0e6]"></div>
            <span className="shrink-0 mx-4 px-3.5 py-1 bg-[#FFF5F7] border border-[#ffd1dc] rounded-full text-[11px] font-black tracking-widest text-[#FF6B6B] uppercase shadow-2xs">
              YA PHIR (OR)
            </span>
            <div className="flex-grow border-t border-[#ffe0e6]"></div>
          </div>

          {/* Exclusive Very Romantic Option (Stays right here on the main screen) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#ff477e] flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-[#ff477e] text-[#ff477e]" />
                <span>Special Exclusive Mode</span>
              </span>
              {isVeryRomanticSelected && (
                <span className="text-[11px] font-black text-[#ff477e] bg-pink-100 border border-pink-200 px-2.5 py-0.5 rounded-full animate-pulse">
                  ✓ Selected (Exclusive)
                </span>
              )}
            </div>

            <button
              type="button"
              id="very-romantic-option-btn"
              onClick={selectVeryRomanticOnly}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 relative ${
                isVeryRomanticSelected
                  ? 'bg-gradient-to-r from-[#fff0f4] via-[#ffe8ee] to-[#fff0f4] border-[#ff477e] shadow-[0_8px_24px_-4px_rgba(255,71,126,0.35)] ring-2 ring-[#ff477e]/40'
                  : 'bg-white border-[#ffd1dc] hover:border-[#ff477e]/50 hover:bg-[#fff9fa]'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                  isVeryRomanticSelected 
                    ? 'bg-[#ff477e] text-white shadow-md scale-105' 
                    : 'bg-pink-100 text-[#ff477e]'
                }`}
              >
                <Heart className={`w-6 h-6 ${isVeryRomanticSelected ? 'fill-white' : 'fill-[#ff477e]'}`} />
              </div>

              <div className="flex-1 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-base text-[#2D3436]">
                    {dynamicRomanticTitle}
                  </span>
                  <span className="bg-[#ff477e] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                    {romanticConfig.optionBadge || 'EXCLUSIVE'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#636E72] font-medium mt-1 leading-relaxed">
                  {romanticConfig.optionDescription || 'Agar aap sirf behad romantic, pyaar bhari aur dil ke sabse kareeb wali baatein chahti hain. Isko chunne par upar ke options hat jayenge aur aapke liye alag romantic screen khulegi.'}
                </p>
              </div>

              {/* Checkbox badge */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center absolute top-5 right-4 transition-all ${
                  isVeryRomanticSelected ? 'bg-[#ff477e] text-white shadow-xs' : 'border-2 border-[#DEDEDE]'
                }`}
              >
                {isVeryRomanticSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            <p className="text-[11px] text-[#888] text-center italic">
              * Upar ke options me se chunein, YA FIR bas yeh akela &ldquo;Very Romantic&rdquo; option chunein.
            </p>
          </div>

          {/* Start Button */}
          <div className="pt-4 flex flex-col items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              id="start-chat-btn"
              className="group relative bg-[#FFD93D] hover:bg-[#ffcf00] text-[#2D3436] text-xl sm:text-2xl font-black py-5 px-12 sm:px-16 rounded-[40px] shadow-[0_10px_0_0_#D4A500] hover:shadow-[0_8px_0_0_#D4A500] active:shadow-none active:translate-y-2 transition-all cursor-pointer inline-flex items-center gap-3 disabled:opacity-70"
            >
              <span>{isSubmitting ? 'Starting...' : 'START'}</span>
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />

              {/* Playful Floating Tag */}
              <span className="absolute -top-3.5 -right-3.5 bg-[#FF6B6B] text-white text-xs font-extrabold py-1 px-2.5 rounded-lg rotate-12 shadow-sm pointer-events-none">
                LET&apos;S TALK!
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#636E72] mt-4 text-center">
              <ShieldCheck className="w-4 h-4 text-[#6BCB77]" />
              <span>100% Secure &amp; Confidential. Aapka data safe aur protected hai.</span>
            </div>
          </div>
        </form>
      </motion.section>

      {/* Topics Selection Popup Modal */}
      <AnimatePresence>
        {isTopicModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-[#ffe0e6]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#ffe8ed]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF5F7] border border-[#ffd1dc] flex items-center justify-center text-[#FF6B6B]">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-[#2D3436]">
                      Kis Type Ki Baat Pasand Karogi?
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#636E72]">
                      Ek ya zyada options chun sakti hain (Optional)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#f5f5f4] hover:bg-[#ffe4e9] text-[#636E72] hover:text-[#FF6B6B] flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Topics Grid */}
              <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_TOPICS.map((topic) => {
                    const isSelected = selectedInterests.includes(topic.title);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleInterest(topic.title)}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                          isSelected
                            ? 'bg-[#FFF5F7] border-[#FF6B6B] shadow-[0_4px_16px_-4px_rgba(255,107,107,0.3)] ring-2 ring-[#FF6B6B]/20'
                            : 'bg-white border-[#ffe4e9] hover:border-[#ffd1dc] hover:bg-[#fffdfd]'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-[#FF6B6B]/15' : 'bg-[#f5f5f4]'
                          }`}
                        >
                          {renderTopicIcon(topic.iconName)}
                        </div>
                        <div className="flex-1 pr-5">
                          <div className="font-extrabold text-xs sm:text-sm text-[#2D3436] leading-tight">
                            {topic.title}
                          </div>
                          <div className="text-[11px] text-[#636E72] mt-1 line-clamp-2">
                            {topic.description}
                          </div>
                        </div>
                        {/* Checkbox badge */}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center absolute top-3.5 right-3 transition-all ${
                            isSelected ? 'bg-[#FF6B6B] text-white shadow-xs' : 'border-2 border-[#DEDEDE]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#ffe8ed] flex items-center justify-between gap-3">
                {standardSelectedTopics.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSelectedInterests([])}
                    className="text-xs font-bold text-[#636E72] hover:text-[#FF6B6B] px-3 py-2 cursor-pointer"
                  >
                    Clear All
                  </button>
                ) : (
                  <span className="text-xs text-[#A0A0A0] italic">Koi bhi chunna zaroori nahi hai</span>
                )}

                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white text-sm font-black py-2.5 px-6 rounded-full shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5 ml-auto"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Ho Gaya ({standardSelectedTopics.length} Selected)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
