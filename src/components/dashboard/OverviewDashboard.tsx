/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Activity, 
  Clock, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Play, 
  Square, 
  ShieldCheck, 
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Radio
} from 'lucide-react';
import { SystemMetrics, ServiceItem, ActivityLog } from '../../types';

interface OverviewDashboardProps {
  metrics: SystemMetrics | null;
  services: ServiceItem[];
  logs: ActivityLog[];
  onRefresh: () => void;
  onServiceAction: (serviceId: string, action: 'start' | 'stop' | 'restart') => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  metrics,
  services,
  logs,
  onRefresh,
  onServiceAction,
  onNavigateTab
}) => {
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(`${serviceId}-${action}`);
    try {
      await onServiceAction(serviceId, action);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLogs = logFilter === 'ALL' 
    ? logs 
    : logs.filter(l => l.level === logFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner / System Banner */}
      <div className="cyber-panel rounded-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h1 className="font-display font-bold text-xl sm:text-2xl text-white tracking-wide">
              HELLGOD COMMAND NEXUS
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950/80 border border-red-600/40 text-red-400">
              PRODUCTION 1.0.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Host: <span className="text-slate-200">{metrics?.hostname || 'HELLGOD-NODE-01'}</span> &bull; 
            Platform: <span className="text-slate-200">{metrics?.platform || 'Linux x64'}</span> &bull; 
            Uptime: <span className="text-red-400 font-bold">{metrics?.uptimeFormatted || '00h 14m 20s'}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('ai')}
            className="px-3 py-1.5 rounded text-xs font-mono font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,60,0.4)] transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AI DIAGNOSTICS</span>
          </button>
          <button
            onClick={() => onNavigateTab('backup')}
            className="px-3 py-1.5 rounded text-xs font-mono bg-[#1a1a24] hover:bg-[#252535] text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Database className="w-3.5 h-3.5 text-red-400" />
            <span>SNAPSHOT</span>
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded text-slate-300 hover:text-white bg-[#14141e] border border-slate-700 hover:border-red-500 transition-all"
            title="Refresh Server Metrics"
            aria-label="Refresh Server Metrics"
          >
            <RotateCw className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* 4 Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <div className="cyber-panel rounded-lg p-4 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">CPU UTILIZATION</span>
            <div className="p-1.5 rounded bg-red-950/60 text-red-400 border border-red-600/30">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display font-extrabold text-3xl text-white">
              {metrics ? `${metrics.cpu.usagePercent}%` : '24%'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({metrics?.cpu.cores || 8} Logical Cores)
            </span>
          </div>
          <div className="w-full bg-[#1b1b26] h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-500"
              style={{ width: `${metrics ? metrics.cpu.usagePercent : 24}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Load Avg:</span>
            <span className="text-slate-300">
              {metrics?.cpu.loadAverages.join(', ') || '0.24, 0.18, 0.12'}
            </span>
          </div>
        </div>

        {/* RAM Card */}
        <div className="cyber-panel rounded-lg p-4 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">SYSTEM RAM (MEMORY)</span>
            <div className="p-1.5 rounded bg-red-950/60 text-red-400 border border-red-600/30">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display font-extrabold text-3xl text-white">
              {metrics ? `${metrics.memory.usagePercent}%` : '62%'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {metrics?.memory.usedFormatted || '8.2 GB'} / {metrics?.memory.totalFormatted || '16.0 GB'}
            </span>
          </div>
          <div className="w-full bg-[#1b1b26] h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-amber-500 h-full transition-all duration-500"
              style={{ width: `${metrics ? metrics.memory.usagePercent : 62}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Free RAM:</span>
            <span className="text-emerald-400 font-semibold">
              {metrics?.memory.freeFormatted || '7.8 GB'}
            </span>
          </div>
        </div>

        {/* Storage Card */}
        <div className="cyber-panel rounded-lg p-4 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">NVME STORAGE</span>
            <div className="p-1.5 rounded bg-red-950/60 text-red-400 border border-red-600/30">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display font-extrabold text-3xl text-white">
              {metrics?.disk.usagePercent || 17}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              {metrics?.disk.usedFormatted || '42.8 GB'} Used
            </span>
          </div>
          <div className="w-full bg-[#1b1b26] h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-gradient-to-r from-red-600 to-emerald-500 h-full"
              style={{ width: `${metrics?.disk.usagePercent || 17}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Available:</span>
            <span className="text-slate-300 font-medium">
              {metrics?.disk.freeFormatted || '213.2 GB'}
            </span>
          </div>
        </div>

        {/* Network Card */}
        <div className="cyber-panel rounded-lg p-4 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">NETWORK THROUGHPUT</span>
            <div className="p-1.5 rounded bg-red-950/60 text-red-400 border border-red-600/30">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="bg-[#12121c] p-2 rounded border border-slate-800">
              <div className="flex items-center text-[10px] font-mono text-slate-400 gap-1">
                <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                <span>RX SPEED</span>
              </div>
              <div className="font-display font-bold text-sm text-white">
                {metrics?.network.rxSpeed || '2.4 MB/s'}
              </div>
            </div>
            <div className="bg-[#12121c] p-2 rounded border border-slate-800">
              <div className="flex items-center text-[10px] font-mono text-slate-400 gap-1">
                <ArrowUpRight className="w-3 h-3 text-red-400" />
                <span>TX SPEED</span>
              </div>
              <div className="font-display font-bold text-sm text-white">
                {metrics?.network.txSpeed || '1.1 MB/s'}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Total Packets:</span>
            <span className="text-slate-300 font-mono">
              {metrics?.network.totalPackets.toLocaleString() || '2,849,102'}
            </span>
          </div>
        </div>
      </div>

      {/* Services Grid & Live Activity Log split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Status (2 cols on large) */}
        <div className="lg:col-span-2 cyber-panel rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-red-600/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <h2 className="font-display font-bold text-base text-white tracking-wide">
                DAEMONS & MICROSERVICES
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {services.filter(s => s.status === 'running').length}/{services.length} ACTIVE
            </span>
          </div>

          <div className="space-y-2.5">
            {services.map(svc => (
              <div 
                key={svc.id}
                className="bg-[#12121b] border border-slate-800/80 hover:border-red-600/40 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`mt-1 sm:mt-0 w-2.5 h-2.5 rounded-full shrink-0 ${
                    svc.status === 'running' 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' 
                      : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-white">
                        {svc.name}
                      </span>
                      {svc.port > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          :{svc.port}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {svc.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right text-[11px] font-mono text-slate-400">
                    <div>CPU: <span className="text-slate-200">{svc.cpu}%</span></div>
                    <div>MEM: <span className="text-slate-200">{svc.memory} MB</span></div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {svc.status === 'running' ? (
                      <>
                        <button
                          onClick={() => handleAction(svc.id, 'restart')}
                          disabled={actionLoading === `${svc.id}-restart`}
                          className="px-2 py-1 rounded bg-[#1b1b28] hover:bg-red-950/80 text-xs font-mono text-slate-200 hover:text-red-300 border border-slate-700 hover:border-red-500 flex items-center gap-1 transition-all"
                          title="Restart Service"
                        >
                          <RotateCw className={`w-3 h-3 ${actionLoading === `${svc.id}-restart` ? 'animate-spin text-red-400' : ''}`} />
                          <span className="text-[11px]">RESTART</span>
                        </button>
                        <button
                          onClick={() => handleAction(svc.id, 'stop')}
                          disabled={actionLoading === `${svc.id}-stop`}
                          className="p-1 rounded bg-[#1b1b28] hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800"
                          title="Stop Service"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAction(svc.id, 'start')}
                        disabled={actionLoading === `${svc.id}-start`}
                        className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 hover:bg-emerald-900 border border-emerald-600/40 text-xs font-mono flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>START</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="cyber-panel rounded-lg p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-red-600/20">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <h3 className="font-display font-bold text-sm text-white tracking-wide">
                  ACTIVITY LOG STREAM
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-1.5 py-0.5 rounded ${
                      logFilter === lvl 
                        ? 'bg-red-600 text-white font-bold' 
                        : 'text-slate-400 hover:text-white bg-[#14141e]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-xs font-mono text-slate-500">
                  No activity logs matching filter.
                </div>
              ) : (
                filteredLogs.map(log => (
                  <div 
                    key={log.id} 
                    className="p-2 rounded bg-[#101018] border border-slate-800/80 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1 py-0.2 rounded font-bold ${
                          log.level === 'CRITICAL' || log.level === 'ERROR'
                            ? 'bg-red-950 text-red-400 border border-red-600/50'
                            : (log.level === 'WARN' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-300')
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-red-400">[{log.category}]</span>
                      </div>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed break-words">
                      {log.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => onNavigateTab('services')}
              className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
            >
              View Full Server Logs & Daemon Management &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
