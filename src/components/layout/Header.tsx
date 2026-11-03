/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Smartphone, 
  Cpu, 
  Server, 
  Radio, 
  UserCheck, 
  LogOut, 
  Menu,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SystemMetrics } from '../../types';

interface HeaderProps {
  metrics: SystemMetrics | null;
  onToggleMobileNav: () => void;
  onToggleAndroidSimulator: () => void;
  isSimulatorOpen: boolean;
  onOpenQuickTerminal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  onToggleMobileNav,
  onToggleAndroidSimulator,
  isSimulatorOpen,
  onOpenQuickTerminal
}) => {
  const { user, logout, switchRoleQuick } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#09090e]/95 backdrop-blur-md border-b border-red-600/25 px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-[0_4px_20px_rgba(255,0,60,0.08)]">
      {/* Left: Mobile Nav toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-1.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-950/30 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded bg-gradient-to-br from-red-600 to-black p-0.5 shadow-[0_0_12px_rgba(255,0,60,0.6)]">
            <div className="w-full h-full bg-[#0a0a0f] rounded flex items-center justify-center">
              <span className="font-display font-extrabold text-red-500 text-base tracking-tighter">⚡</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg lg:text-xl tracking-wider text-white glow-text-red">
                HELLGOD
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-widest bg-red-950/80 text-red-400 border border-red-600/40 rounded">
                v1.0.0 CORE
              </span>
            </div>
            <p className="text-[10px] font-mono tracking-wider text-slate-400 hidden md:block">
              ULTIMATE ALL-IN-ONE SERVER & AI PLATFORM
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Server Telemetry Badges (Desktop) */}
      <div className="hidden md:flex items-center gap-3">
        {/* Status pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#12121a] border border-red-600/20 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="text-slate-300">CORE STATUS:</span>
          <span className="text-emerald-400 font-semibold tracking-wider">ONLINE</span>
        </div>

        {/* CPU badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#12121a] border border-slate-800 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-red-400" />
          <span className="text-slate-400">CPU:</span>
          <span className="text-white font-medium">
            {metrics ? `${metrics.cpu.usagePercent}%` : '24%'}
          </span>
        </div>

        {/* RAM badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#12121a] border border-slate-800 text-xs font-mono">
          <Server className="w-3.5 h-3.5 text-red-400" />
          <span className="text-slate-400">RAM:</span>
          <span className="text-white font-medium">
            {metrics ? `${metrics.memory.usagePercent}%` : '64%'}
          </span>
        </div>
      </div>

      {/* Right: Quick actions, Android Simulator toggle & User Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Terminal Button */}
        <button
          onClick={onOpenQuickTerminal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-red-950/40 border border-red-600/30 text-red-300 hover:bg-red-900/60 hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,60,0.15)]"
          title="Launch Cyber Terminal"
        >
          <Terminal className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">TERMINAL</span>
        </button>

        {/* Android Simulator Toggle Button */}
        <button
          onClick={onToggleAndroidSimulator}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all border ${
            isSimulatorOpen
              ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(255,0,60,0.5)] font-semibold'
              : 'bg-[#14141e] text-slate-300 border-slate-700 hover:border-red-600/50 hover:text-white'
          }`}
          title="Open Android Phone Simulator"
        >
          <Smartphone className={`w-3.5 h-3.5 ${isSimulatorOpen ? 'text-white' : 'text-red-400'}`} />
          <span className="hidden sm:inline">ANDROID VIEW</span>
        </button>

        {/* User Role Badge / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161622] border border-red-600/30 hover:border-red-500 text-xs font-mono text-slate-200 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-red-500" />
            <span className="text-red-400 font-bold tracking-wider">{user?.role || 'ROOT_ADMIN'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded bg-[#11111a] border border-red-600/40 shadow-[0_8px_30px_rgba(0,0,0,0.8)] py-1.5 z-50">
              <div className="px-3 py-1 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                SWITCH ACTIVE ROLE:
              </div>
              <button
                onClick={() => { switchRoleQuick('ROOT_ADMIN'); setRoleDropdownOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-red-950/50 ${user?.role === 'ROOT_ADMIN' ? 'text-red-400 font-bold' : 'text-slate-300'}`}
              >
                <span>ROOT_ADMIN</span>
                {user?.role === 'ROOT_ADMIN' && <span className="text-[10px] text-red-500">●</span>}
              </button>
              <button
                onClick={() => { switchRoleQuick('SYS_OPERATOR'); setRoleDropdownOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-red-950/50 ${user?.role === 'SYS_OPERATOR' ? 'text-red-400 font-bold' : 'text-slate-300'}`}
              >
                <span>SYS_OPERATOR</span>
                {user?.role === 'SYS_OPERATOR' && <span className="text-[10px] text-red-500">●</span>}
              </button>
              <button
                onClick={() => { switchRoleQuick('AUDITOR'); setRoleDropdownOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-red-950/50 ${user?.role === 'AUDITOR' ? 'text-red-400 font-bold' : 'text-slate-300'}`}
              >
                <span>AUDITOR</span>
                {user?.role === 'AUDITOR' && <span className="text-[10px] text-red-500">●</span>}
              </button>
              <div className="border-t border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => { logout(); setRoleDropdownOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs font-mono text-red-400 hover:bg-red-950/80 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOGOUT</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
