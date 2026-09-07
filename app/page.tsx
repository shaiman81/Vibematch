'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck, Heart, UserCheck, RefreshCw, Lock, Sparkles } from 'lucide-react';
import ProfileFormScreen from '@/components/ProfileFormScreen';
import SuccessScreen from '@/components/SuccessScreen';
import VeryRomanticScreen from '@/components/VeryRomanticScreen';
import FriendlyConnectScreen from '@/components/FriendlyConnectScreen';
import LegalModals, { LegalModalType } from '@/components/LegalModals';
import NotificationPermissionModal from '@/components/NotificationPermissionModal';
import { useActiveUser, clearActiveUserSession } from '@/lib/storage';
import { trackEvent } from '@/lib/analytics';

export default function HomePage() {
  const activeUser = useActiveUser();

  // Legal Modal State (Google Ads Compliance)
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);

  // View override allows manual navigation (e.g. going back to landing, or filling new profile)
  const [viewOverride, setViewOverride] = useState<'landing' | 'profile' | 'friendly_connect' | 'very_romantic' | 'success' | null>(null);

  // Compute active view based on device user session
  // If active user is saved on device -> directly opens their zone!
  // If admin deleted the user -> automatically returns to landing!
  const currentView: 'landing' | 'profile' | 'friendly_connect' | 'very_romantic' | 'success' = (() => {
    if (viewOverride === 'profile') return 'profile';
    if (viewOverride === 'landing') return 'landing';

    if (activeUser) {
      if (viewOverride === 'very_romantic' || viewOverride === 'friendly_connect' || viewOverride === 'success') {
        return viewOverride;
      }
      return activeUser.mode === 'very_romantic' ? 'very_romantic' : 'friendly_connect';
    }

    // No active user saved or user was deleted by admin
    return 'landing';
  })();

  // Full-screen native mobile app views for Friendly Connect and Very Romantic screens
  if (currentView === 'friendly_connect' && activeUser) {
    return (
      <main className="w-full min-h-screen bg-[#FFF9FA]">
        <FriendlyConnectScreen
          member={activeUser}
          onBackToApp={() => setViewOverride('landing')}
        />
      </main>
    );
  }

  if (currentView === 'very_romantic' && activeUser) {
    return (
      <main className="w-full min-h-screen bg-[#FFF9FA]">
        <VeryRomanticScreen
          member={activeUser}
          onBackToApp={() => setViewOverride('landing')}
        />
      </main>
    );
  }

  return (
    <main
      id="main-app-container"
      className="min-h-screen bg-[#FFF5F7] text-[#2D3436] flex flex-col justify-between selection:bg-[#FFD93D] selection:text-[#2D3436] relative overflow-hidden font-sans"
    >
      {/* Vibrant Ambient Glow Blobs */}
      <div
        aria-hidden="true"
        className="absolute top-[-100px] left-[-100px] w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] bg-[#FFD93D] rounded-full opacity-30 pointer-events-none blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-140px] right-[-60px] w-[420px] sm:w-[550px] h-[420px] sm:h-[550px] bg-[#6BCB77] rounded-full opacity-20 pointer-events-none blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute top-[12%] right-[10%] w-[160px] sm:w-[220px] h-[160px] sm:h-[220px] bg-[#4D96FF] rounded-full opacity-30 blur-2xl pointer-events-none"
      />

      {/* Decorative vertical indicator dots (Desktop) */}
      <div
        aria-hidden="true"
        className="hidden xl:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-3.5 pointer-events-none z-10"
      >
        <div className="w-3 h-3 rounded-full bg-[#FF6B6B] shadow-sm" />
        <div className="w-3 h-3 rounded-full bg-[#DEDEDE]" />
        <div className="w-3 h-3 rounded-full bg-[#DEDEDE]" />
        <div className="w-3 h-3 rounded-full bg-[#DEDEDE]" />
      </div>

      {/* Header Bar */}
      <header
        id="app-header"
        className="w-full border-b border-[#ffe0e6]/70 bg-[#FFF5F7]/80 backdrop-blur-md sticky top-0 z-30"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div 
            onClick={() => setViewOverride('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              id="app-logo-badge"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B6B] to-[#ff477e] text-white flex items-center justify-center font-black text-lg shadow-sm transition-transform group-hover:scale-105"
            >
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-[#FF6B6B] leading-none">
                VIBEMATCH
              </span>
              <span className="text-[10px] font-bold text-[#A0A0A0] tracking-wider uppercase">
                Connect & Match
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Active User Pill in Header if logged in */}
            {activeUser && (
              <button
                type="button"
                onClick={() => setViewOverride(activeUser.mode === 'very_romantic' ? 'very_romantic' : 'friendly_connect')}
                className="inline-flex items-center gap-1.5 bg-white/90 border border-pink-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#2D3436] shadow-2xs cursor-pointer hover:border-[#FF6B6B] transition-colors"
                title="Active Profile"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#FF6B6B]" />
                <span>{activeUser.name}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 z-10">
        <div className="w-full max-w-4xl flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentView === 'landing' && (
              <motion.section
                key="landing-screen"
                id="landing-screen"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-2xl bg-white/85 backdrop-blur-md border border-[#ffe4e9] rounded-3xl p-8 sm:p-14 shadow-[0_20px_50px_-20px_rgba(255,107,107,0.2)] text-center relative"
              >
                {/* Special Welcome Pill Badge */}
                <div
                  id="special-welcome-pill"
                  className="inline-block bg-[#FF6B6B] text-white px-5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-6 shadow-md transform -rotate-2"
                >
                  {activeUser ? 'Saved Session Active' : 'Special Welcome'}
                </div>

                {/* Primary Welcome Heading */}
                <h1
                  id="welcome-heading"
                  className="text-4xl sm:text-6xl font-black text-[#2D3436] leading-[1.12] mb-6 tracking-tight"
                >
                  {activeUser ? (
                    <>
                      Hello Dear{' '}
                      <span className="text-[#FF6B6B] underline decoration-wavy decoration-[#FF6B6B]">
                        {activeUser.name}
                      </span>
                    </>
                  ) : (
                    <>
                      Hello Dear{' '}
                      <span className="text-[#FF6B6B] underline decoration-wavy decoration-[#FF6B6B]">
                        Welcome
                      </span>
                    </>
                  )}
                </h1>

                {/* Descriptive Subtext */}
                <p
                  id="welcome-description"
                  className="text-xl sm:text-2xl font-medium text-[#636E72] leading-relaxed max-w-lg mx-auto mb-10"
                >
                  {activeUser ? (
                    `Aapka profile device me saved hai. Direct apne ${activeUser.mode === 'very_romantic' ? 'Romantic Zone' : 'Friendly Connect'} me enter karein.`
                  ) : (
                    'aap sahi jagah aayi ho yaha par aapko Bahut maja aayega aap bahut acha feel karogi'
                  )}
                </p>

                {/* Action CTA Button */}
                <div className="flex flex-col items-center justify-center gap-4">
                  {activeUser ? (
                    <>
                      <button
                        type="button"
                        id="get-started-btn"
                        onClick={() => {
                          trackEvent('click_return_zone', { component: 'landing_hero' });
                          setViewOverride(activeUser.mode === 'very_romantic' ? 'very_romantic' : 'friendly_connect');
                        }}
                        className="group relative bg-[#FFD93D] hover:bg-[#ffcf00] text-[#2D3436] text-xl sm:text-2xl font-black py-5 px-10 sm:px-14 rounded-[40px] shadow-[0_10px_0_0_#D4A500] hover:shadow-[0_8px_0_0_#D4A500] active:shadow-none active:translate-y-2 transition-all cursor-pointer inline-flex items-center gap-3"
                      >
                        <span>Apne Zone Me Jayein</span>
                        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />

                        <span className="absolute -top-3.5 -right-3.5 bg-[#6BCB77] text-white text-xs font-extrabold py-1 px-2.5 rounded-lg rotate-12 shadow-sm pointer-events-none">
                          DIRECT OPEN
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          clearActiveUserSession();
                          setViewOverride('profile');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#636E72] hover:text-[#FF6B6B] transition-colors py-2 px-4 rounded-full hover:bg-pink-50 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Naya Profile Banayein (Fresh Start)</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      id="get-started-btn"
                      onClick={() => {
                        trackEvent('click_get_started', { component: 'landing_hero' });
                        setViewOverride('profile');
                      }}
                      className="group relative bg-[#FFD93D] hover:bg-[#ffcf00] text-[#2D3436] text-xl sm:text-2xl font-black py-5 px-12 sm:px-14 rounded-[40px] shadow-[0_10px_0_0_#D4A500] hover:shadow-[0_8px_0_0_#D4A500] active:shadow-none active:translate-y-2 transition-all cursor-pointer inline-flex items-center gap-3"
                    >
                      <span>Get started</span>
                      <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />

                      {/* Playful Floating Tag */}
                      <span className="absolute -top-3.5 -right-3.5 bg-[#4D96FF] text-white text-xs font-extrabold py-1 px-2.5 rounded-lg rotate-12 shadow-sm pointer-events-none">
                        CLICK HERE!
                      </span>
                    </button>
                  )}

                  {/* Google Ads Friendly Trust Indicators */}
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-6 mt-6 border-t border-[#ffe4e9]/80 text-xs text-[#636E72]">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#2D3436]">
                      <ShieldCheck className="w-4 h-4 text-[#6BCB77]" />
                      <span>100% Private &amp; Verified</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#2D3436]">
                      <Lock className="w-4 h-4 text-[#4D96FF]" />
                      <span>256-Bit SSL Secured</span>
                    </span>
                    <span className="bg-[#FFF5F7] border border-[#ffd1dc] px-2.5 py-0.5 rounded-full text-[10px] font-black text-[#FF6B6B]">
                      18+ Only
                    </span>
                  </div>
                </div>
              </motion.section>
            )}

            {currentView === 'profile' && (
              <div key="profile-view" className="w-full max-w-2xl">
                <ProfileFormScreen
                  onBack={() => setViewOverride('landing')}
                  onSuccess={(created) => {
                    if (created.mode === 'very_romantic') {
                      setViewOverride('very_romantic');
                    } else {
                      setViewOverride('friendly_connect');
                    }
                  }}
                />
              </div>
            )}

            {currentView === 'friendly_connect' && activeUser && (
              <div key="friendly-connect-view" className="w-full flex justify-center">
                <FriendlyConnectScreen
                  member={activeUser}
                  onBackToApp={() => setViewOverride('landing')}
                />
              </div>
            )}

            {currentView === 'success' && activeUser && (
              <div key="success-view" className="w-full max-w-xl">
                <SuccessScreen
                  member={activeUser}
                  onReset={() => {
                    clearActiveUserSession();
                    setViewOverride('landing');
                  }}
                />
              </div>
            )}

            {currentView === 'very_romantic' && activeUser && (
              <div key="very-romantic-view" className="w-full flex justify-center">
                <VeryRomanticScreen
                  member={activeUser}
                  onBackToApp={() => setViewOverride('landing')}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer
        id="app-footer"
        className="w-full border-t border-[#ffe0e6]/70 py-6 px-4 text-center z-10 bg-[#FFF5F7]/90 backdrop-blur-sm space-y-3"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#636E72]">
          <div className="font-bold text-[#2D3436]">
            &copy; {new Date().getFullYear()} <span className="text-[#FF6B6B]">VibeMatch</span>. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacy')}
              className="text-[#636E72] hover:text-[#FF6B6B] hover:underline cursor-pointer transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-[#DEDEDE]">&bull;</span>
            <button
              type="button"
              onClick={() => setActiveLegalModal('terms')}
              className="text-[#636E72] hover:text-[#FF6B6B] hover:underline cursor-pointer transition-colors"
            >
              Terms of Service
            </button>
            <span className="text-[#DEDEDE]">&bull;</span>
            <button
              type="button"
              onClick={() => setActiveLegalModal('contact')}
              className="text-[#636E72] hover:text-[#FF6B6B] hover:underline cursor-pointer transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#A0A0A0] max-w-2xl mx-auto leading-relaxed">
          VibeMatch is a social connect &amp; matchmaking community strictly for consenting adults aged 18+. We adhere to standard privacy and data safety policies.
        </p>
      </footer>

      {/* Google Ads Compliance Legal Modals */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

      {/* Message Notification Permission Modal */}
      <NotificationPermissionModal />
    </main>
  );
}
