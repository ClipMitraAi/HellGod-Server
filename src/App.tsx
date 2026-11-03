/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { AiAssistant } from './components/ai/AiAssistant';
import { ServerManager } from './components/server/ServerManager';
import { FileManager } from './components/files/FileManager';
import { SecurityCenter } from './components/security/SecurityCenter';
import { DatabaseCenter } from './components/database/DatabaseCenter';
import { ApiCenter } from './components/api/ApiCenter';
import { NetworkCenter } from './components/network/NetworkCenter';
import { BackupCenter } from './components/backup/BackupCenter';
import { GithubCenter } from './components/github/GithubCenter';
import { AndroidCenter } from './components/android/AndroidCenter';
import { BilingualDocs } from './components/docs/BilingualDocs';
import { QuickTerminalModal } from './components/terminal/QuickTerminalModal';
import { NavigationTab, SystemMetrics, ServiceItem, ActivityLog } from './types';
import { Lock, ShieldAlert, KeyRound, UserCheck } from 'lucide-react';

function HellgodCore() {
  const { user, isAuthenticated, login } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // Modals & UI states
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('HellGod');
  const [loginPassword, setLoginPassword] = useState('HellGod@1122');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Poll system telemetry
  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, servicesRes, logsRes] = await Promise.all([
        fetch('/api/system/metrics'),
        fetch('/api/services'),
        fetch('/api/system/logs')
      ]);

      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (e) {
      console.warn('Telemetry polling error:', e);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleServiceAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      await fetch(`/api/services/${serviceId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      await fetchData();
    } catch (e) {
      console.error('Service action failed:', e);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const result = await login(loginUsername, loginPassword);
    if (!result.success) {
      setLoginError(result.error || 'Authentication rejected');
    }
    setLoginLoading(false);
  };

  // If user explicitly logged out, render elite Cyberpunk Login Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050508] cyber-grid flex items-center justify-center p-4">
        <div className="cyber-panel rounded-xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(255,0,60,0.3)]">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-black p-0.5 mx-auto shadow-[0_0_20px_rgba(255,0,60,0.6)]">
              <div className="w-full h-full bg-[#09090f] rounded-lg flex items-center justify-center">
                <span className="font-display font-black text-red-500 text-2xl">⚡</span>
              </div>
            </div>
            <h1 className="font-display font-bold text-2xl text-white tracking-wider glow-text-red">
              HELLGOD
            </h1>
            <p className="text-xs font-mono text-slate-400">
              ULTIMATE ALL-IN-ONE SERVER & AI PLATFORM
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded bg-red-950/80 border border-red-600/50 text-red-300 text-xs font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                SECURITY PRINCIPAL (USERNAME):
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="HellGod"
                className="w-full bg-[#101018] border border-slate-700 focus:border-red-500 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                CRYPTOGRAPHIC CREDENTIAL (PASSWORD):
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="HellGod@1122"
                className="w-full bg-[#101018] border border-slate-700 focus:border-red-500 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(255,0,60,0.5)] transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loginLoading ? 'AUTHENTICATING...' : 'ACCESS CONTROL NEXUS'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center text-[11px] font-mono text-slate-400">
            Admin Login: <span className="text-red-400 font-bold">HellGod / HellGod@1122</span> (Full Root Admin)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 flex flex-col font-sans cyber-grid">
      {/* Top Header */}
      <Header
        metrics={metrics}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        onToggleAndroidSimulator={() => setIsSimulatorOpen(!isSimulatorOpen)}
        isSimulatorOpen={isSimulatorOpen}
        onOpenQuickTerminal={() => setIsTerminalOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'android') {
              setIsSimulatorOpen(false);
            }
          }}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <OverviewDashboard
              metrics={metrics}
              services={services}
              logs={logs}
              onRefresh={fetchData}
              onServiceAction={handleServiceAction}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'ai' && <AiAssistant />}
          {activeTab === 'services' && (
            <ServerManager
              services={services}
              logs={logs}
              onServiceAction={handleServiceAction}
              onRefresh={fetchData}
            />
          )}
          {activeTab === 'files' && <FileManager />}
          {activeTab === 'security' && <SecurityCenter />}
          {activeTab === 'database' && <DatabaseCenter />}
          {activeTab === 'api' && <ApiCenter />}
          {activeTab === 'network' && <NetworkCenter />}
          {activeTab === 'backup' && <BackupCenter />}
          {activeTab === 'github' && <GithubCenter />}
          {activeTab === 'android' && <AndroidCenter />}
          {activeTab === 'docs' && <BilingualDocs />}
        </main>
      </div>

      {/* Floating Quick Terminal Modal */}
      <QuickTerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HellgodCore />
    </AuthProvider>
  );
}
