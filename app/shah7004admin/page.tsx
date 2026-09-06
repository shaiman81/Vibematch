'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-react';
import AdminPanel from '@/components/AdminPanel';

export default function SecretAdminPage() {
  const router = useRouter();

  const handleBackToPublicSite = () => {
    router.push('/');
  };

  return (
    <main
      id="secret-admin-portal"
      className="min-h-screen bg-[#FFF5F7] text-[#2D3436] p-3 sm:p-6 lg:p-8 flex flex-col justify-between relative overflow-x-hidden font-sans"
    >
      {/* Background glow effects */}
      <div
        aria-hidden="true"
        className="absolute top-[-100px] left-[-100px] w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] bg-[#FFD93D] rounded-full opacity-20 pointer-events-none blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-140px] right-[-60px] w-[420px] sm:w-[550px] h-[420px] sm:h-[550px] bg-[#FF6B6B] rounded-full opacity-15 pointer-events-none blur-3xl"
      />

      {/* Secret Route Top Header Bar */}
      <div className="w-full max-w-6xl mx-auto mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#ffe0e6] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2D3436] text-white flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#FFD93D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-[#2D3436] tracking-tight">
                /shah7004admin
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Confidential Admin URL
              </span>
            </div>
            <p className="text-[11px] text-[#636E72] font-medium">
              Yeh URL aam users ko site par kahin bhi nahi dikhta hai.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={handleBackToPublicSite}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#FFF5F7] hover:bg-[#ffe4e9] text-[#2D3436] font-bold text-xs px-4 py-2 rounded-xl border border-[#ffd1dc] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span>Public Site Kholein (/)</span>
          </button>
          
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#636E72] hover:text-[#FF6B6B] font-bold px-2 py-2"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Admin Dashboard Component */}
      <div className="flex-1 flex justify-center w-full z-10">
        <AdminPanel onBackToApp={handleBackToPublicSite} />
      </div>

      {/* Secret Route Footer */}
      <footer className="w-full text-center py-4 mt-6 text-xs text-[#A0A0A0] font-medium">
        Secure Admin Workspace &bull; Firebase Firestore Sync Active
      </footer>
    </main>
  );
}
