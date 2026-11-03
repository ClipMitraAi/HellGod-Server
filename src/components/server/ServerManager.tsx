/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Play, 
  Square, 
  RotateCw, 
  FileText, 
  Sliders, 
  Save, 
  Check, 
  Search, 
  Pause, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ServiceItem, ActivityLog } from '../../types';

interface ServerManagerProps {
  services: ServiceItem[];
  logs: ActivityLog[];
  onServiceAction: (serviceId: string, action: 'start' | 'stop' | 'restart') => Promise<void>;
  onRefresh: () => void;
}

export const ServerManager: React.FC<ServerManagerProps> = ({
  services,
  logs,
  onServiceAction,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'logs' | 'config'>('services');
  const [logSearch, setLogSearch] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Config editor state
  const [activeConfig, setActiveConfig] = useState('hellgod.conf');
  const [configContent, setConfigContent] = useState('');
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const fetchConfig = async (filename: string) => {
    setConfigLoading(true);
    try {
      const res = await fetch(`/api/files/read?path=${encodeURIComponent(filename)}`);
      const data = await res.json();
      setConfigContent(data.content || '');
    } catch (e) {
      setConfigContent('# Failed to load configuration.');
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'config') {
      fetchConfig(activeConfig);
    }
  }, [activeTab, activeConfig]);

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: activeConfig,
          content: configContent
        })
      });
      if (res.ok) {
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2500);
      }
    } catch (e) {
      alert('Failed to save configuration');
    }
  };

  const handleAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(`${serviceId}-${action}`);
    try {
      await onServiceAction(serviceId, action);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLogs = logs.filter(l => 
    !logSearch || 
    l.message.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.category.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Module Title Header */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">
              SERVER MANAGEMENT & DAEMON ORCHESTRATION
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Process Lifecycle Controller &bull; Real-time Log Stream &bull; Live Config Editor
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#101018] p-1 rounded border border-slate-800">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'services' 
                ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SERVICES ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'logs' 
                ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LIVE LOGS
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'config' 
                ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CONFIG EDITOR
          </button>
        </div>
      </div>

      {/* Tab 1: Services Matrix */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="cyber-panel rounded-lg p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-red-600/20">
              <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
                ACTIVE DAEMON REGISTRY
              </span>
              <button
                onClick={onRefresh}
                className="px-2.5 py-1 rounded bg-[#161622] hover:bg-[#202030] text-xs font-mono text-slate-300 border border-slate-700 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-red-400" />
                <span>POLL STATUS</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-3 pl-2">SERVICE</th>
                    <th className="pb-3">STATUS</th>
                    <th className="pb-3">PORT</th>
                    <th className="pb-3">CPU</th>
                    <th className="pb-3">MEMORY</th>
                    <th className="pb-3 text-right pr-2">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {services.map(svc => (
                    <tr key={svc.id} className="hover:bg-red-950/20 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="font-bold text-white text-sm">{svc.name}</div>
                        <div className="text-[11px] text-slate-500">{svc.description}</div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          svc.status === 'running'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-600/40'
                            : 'bg-red-950/80 text-red-400 border border-red-600/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${svc.status === 'running' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {svc.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">
                        {svc.port > 0 ? `:${svc.port}` : 'KERNEL'}
                      </td>
                      <td className="py-3 text-slate-300">{svc.cpu}%</td>
                      <td className="py-3 text-slate-300">{svc.memory} MB</td>
                      <td className="py-3 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          {svc.status === 'running' ? (
                            <>
                              <button
                                onClick={() => handleAction(svc.id, 'restart')}
                                disabled={actionLoading === `${svc.id}-restart`}
                                className="px-2.5 py-1 rounded bg-[#161622] hover:bg-red-950 text-slate-200 hover:text-red-400 border border-slate-700 flex items-center gap-1"
                              >
                                <RotateCw className={`w-3 h-3 ${actionLoading === `${svc.id}-restart` ? 'animate-spin' : ''}`} />
                                <span>RESTART</span>
                              </button>
                              <button
                                onClick={() => handleAction(svc.id, 'stop')}
                                disabled={actionLoading === `${svc.id}-stop`}
                                className="p-1 rounded bg-[#161622] hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700"
                                title="Stop Service"
                              >
                                <Square className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAction(svc.id, 'start')}
                              disabled={actionLoading === `${svc.id}-start`}
                              className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-600/40 flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>START</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Log Stream */}
      {activeTab === 'logs' && (
        <div className="cyber-panel rounded-lg p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-600/20">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" />
              <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
                SYSTEM LOG STREAM TERMINAL
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter logs by keyword..."
                  className="bg-[#12121a] border border-slate-700 rounded pl-8 pr-3 py-1 text-xs font-mono text-white focus:outline-none focus:border-red-500 w-48 sm:w-60"
                />
              </div>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1 border ${
                  isPaused 
                    ? 'bg-amber-950/80 text-amber-400 border-amber-600/40' 
                    : 'bg-[#14141e] text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Pause className="w-3 h-3" />
                <span>{isPaused ? 'PAUSED' : 'LIVE'}</span>
              </button>
            </div>
          </div>

          <div className="bg-[#08080d] border border-slate-800 rounded p-4 font-mono text-xs max-h-[500px] overflow-y-auto space-y-1.5">
            {filteredLogs.map(log => (
              <div key={log.id} className="flex items-start gap-2 text-slate-300 hover:bg-[#12121c] p-1 rounded">
                <span className="text-slate-500 shrink-0">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className={`px-1 rounded text-[10px] font-bold shrink-0 ${
                  log.level === 'CRITICAL' || log.level === 'ERROR'
                    ? 'bg-red-950 text-red-400'
                    : (log.level === 'WARN' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-300')
                }`}>
                  {log.level}
                </span>
                <span className="text-red-400 shrink-0">[{log.category}]</span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Config Editor */}
      {activeTab === 'config' && (
        <div className="cyber-panel rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-600/20">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
                CONFIGURATION FILE MATRIX
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeConfig}
                onChange={(e) => setActiveConfig(e.target.value)}
                className="bg-[#12121c] border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              >
                <option value="hellgod.conf">hellgod.conf (Master Server)</option>
                <option value="security.yaml">security.yaml (Cyber Shield)</option>
                <option value="scripts/healthcheck.sh">scripts/healthcheck.sh (Daemon Watcher)</option>
              </select>

              <button
                onClick={handleSaveConfig}
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,60,0.4)]"
              >
                {configSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>SAVED</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>SAVE CONFIG</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={configContent}
              onChange={(e) => setConfigContent(e.target.value)}
              disabled={configLoading}
              rows={16}
              className="w-full bg-[#08080d] border border-slate-800 rounded p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-red-600/60 leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};
