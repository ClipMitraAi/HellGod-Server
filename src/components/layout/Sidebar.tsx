/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Server, 
  FolderTree, 
  ShieldCheck, 
  Database, 
  Key, 
  Activity, 
  Archive, 
  Github, 
  Smartphone, 
  BookOpen,
  X
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: NavigationTab; label: string; sublabel: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD', sublabel: 'Live Telemetry & Status', icon: LayoutDashboard },
  { id: 'ai', label: 'AI ASSISTANT', sublabel: 'HELLGOD Neural Core', icon: Bot, badge: 'AI' },
  { id: 'services', label: 'SERVER MANAGER', sublabel: 'Daemons & Log Stream', icon: Server, badge: '7 Online' },
  { id: 'files', label: 'FILE MANAGER', sublabel: 'Storage & Permissions', icon: FolderTree },
  { id: 'security', label: 'SECURITY CENTER', sublabel: 'Auth, RBAC & Firewall', icon: ShieldCheck, badge: 'Hardened' },
  { id: 'database', label: 'DATABASE CENTER', sublabel: 'SQLite & PostgreSQL', icon: Database },
  { id: 'api', label: 'API CENTER', sublabel: 'Key Vault & Explorer', icon: Key },
  { id: 'network', label: 'NETWORK TOOLS', sublabel: 'Ping, DNS & Sockets', icon: Activity },
  { id: 'backup', label: 'BACKUP VAULT', sublabel: 'Snapshots & Restore', icon: Archive },
  { id: 'github', label: 'GITHUB CENTER', sublabel: 'Repo & CI/CD Actions', icon: Github },
  { id: 'android', label: 'ANDROID APK', sublabel: 'APK Build & Simulator', icon: Smartphone, badge: 'APK' },
  { id: 'docs', label: 'DOCUMENTATION', sublabel: 'Hindi + English Master', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-[53px] bottom-0 left-0 z-50
        w-64 bg-[#0a0a10] border-r border-red-600/20 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-screen lg:h-[calc(100vh-53px)] overflow-y-auto
      `}>
        {/* Mobile Header in drawer */}
        <div className="flex items-center justify-between p-4 border-b border-red-600/20 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-white">HELLGOD</span>
            <span className="text-[10px] font-mono text-red-500 bg-red-950 px-1 py-0.5 rounded">v1.0.0</span>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Item List */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            OPERATIONAL MODULES
          </div>

          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full group text-left px-3 py-2.5 rounded transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-gradient-to-r from-red-950/80 to-[#14141e] border-l-4 border-red-600 text-white shadow-[0_0_15px_rgba(255,0,60,0.18)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#12121a] border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-red-500' : 'text-slate-400 group-hover:text-red-400'
                  }`} />
                  <div className="truncate">
                    <div className={`font-display text-xs tracking-wider leading-tight ${isActive ? 'text-white font-bold' : ''}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                    isActive 
                      ? 'bg-red-600 text-white font-bold' 
                      : 'bg-red-950/60 text-red-400 border border-red-600/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Info Box */}
        <div className="p-3 border-t border-red-600/20 bg-[#07070b]">
          <div className="rounded bg-[#0e0e16] border border-slate-800 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>ZERO-BUDGET ARCH</span>
              <span className="text-red-400 font-bold">$0.00</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-amber-500 h-full w-full animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1.5 leading-tight">
              100% Free & Open-Source. Run locally on Android via Termux or Free Cloud.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
