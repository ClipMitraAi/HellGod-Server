/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Play, 
  Activity, 
  FileCode,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { ApiKeyItem } from '../../types';

const ENDPOINTS = [
  { method: 'GET', path: '/api/health', desc: 'Core system vital signs & uptime status', auth: 'None' },
  { method: 'GET', path: '/api/system/metrics', desc: 'Hardware CPU, RAM, Disk, and Network telemetry', auth: 'Bearer / Token' },
  { method: 'GET', path: '/api/services', desc: 'List all 7 active server microservices', auth: 'Bearer / Token' },
  { method: 'GET', path: '/api/files/list', desc: 'Browse sandboxed server storage directory', auth: 'Bearer / Token' },
  { method: 'POST', path: '/api/ai/chat', desc: 'Dispatch query to Gemini 2.5 Flash / Rule Engine', auth: 'Bearer / Token' },
  { method: 'POST', path: '/api/network/ping', desc: 'Execute server latency ping to target host', auth: 'Bearer / Token' },
];

export const ApiCenter: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRole, setNewKeyRole] = useState('SYS_OPERATOR');

  // Interactive tester
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<number | null>(null);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/apikeys');
      const data = await res.json();
      setKeys(data || []);
    } catch (e) {
      console.error('Failed to load API keys', e);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      const res = await fetch('/api/apikeys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim(), role: newKeyRole })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewKeyName('');
        fetchKeys();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API token? Any client using it will lose access immediately.')) return;
    try {
      const res = await fetch(`/api/apikeys/${id}`, { method: 'DELETE' });
      if (res.ok) fetchKeys();
    } catch (e) {
      alert('Revocation failed');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunTest = async () => {
    setTestLoading(true);
    setTestResponse(null);
    setTestStatus(null);
    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer hg_live_demo_session'
        }
      };

      if (selectedEndpoint.method === 'POST') {
        if (selectedEndpoint.path === '/api/ai/chat') {
          options.body = JSON.stringify({ prompt: 'HELLGOD API Test' });
        } else if (selectedEndpoint.path === '/api/network/ping') {
          options.body = JSON.stringify({ host: '127.0.0.1' });
        }
      }

      const res = await fetch(selectedEndpoint.path, options);
      const data = await res.json();
      setTestStatus(res.status);
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestStatus(500);
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">
              API CENTER & ACCESS TOKEN VAULT
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Granular Scoped Tokens &bull; Interactive Swagger Explorer &bull; Request Health Benchmarks
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,60,0.4)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>GENERATE API KEY</span>
        </button>
      </div>

      {/* API Key Vault Table */}
      <div className="cyber-panel rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-red-600/20">
          <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
            ACTIVE ACCESS CREDENTIALS
          </span>
          <span className="text-xs font-mono text-slate-400">
            {keys.length} KEYS DEPLOYED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">NAME</th>
                <th className="pb-3">KEY TOKEN</th>
                <th className="pb-3">ROLE SCOPE</th>
                <th className="pb-3">REQUESTS COUNT</th>
                <th className="pb-3">CREATED</th>
                <th className="pb-3 text-right pr-2">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {keys.map(k => (
                <tr key={k.id} className="hover:bg-red-950/20 transition-colors">
                  <td className="py-3 pl-2 font-bold text-white">
                    {k.name}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-mono bg-[#0c0c12] px-2 py-0.5 rounded border border-slate-800">
                        {k.key}
                      </span>
                      <button
                        onClick={() => handleCopy(k.key, k.id)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Copy Key"
                      >
                        {copiedKey === k.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-600/30">
                      {k.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{k.requestsCount.toLocaleString()}</td>
                  <td className="py-3 text-slate-400">{k.createdAt}</td>
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={() => handleRevokeKey(k.id)}
                      className="p-1 rounded bg-[#161622] hover:bg-red-950 text-slate-400 hover:text-red-400"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive API Explorer / Documentation */}
      <div className="cyber-panel rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-red-600/20">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-red-500" />
            <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
              INTERACTIVE API SPECIFICATION EXPLORER
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400">REST v1.0</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Endpoint selector list */}
          <div className="space-y-2">
            {ENDPOINTS.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedEndpoint(ep);
                  setTestResponse(null);
                  setTestStatus(null);
                }}
                className={`w-full text-left p-3 rounded border transition-all ${
                  selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method
                    ? 'bg-red-950/40 border-red-600/60 shadow-[0_0_10px_rgba(255,0,60,0.2)]'
                    : 'bg-[#101018] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ep.method === 'GET' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs text-white font-semibold">{ep.path}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{ep.auth}</span>
                </div>
                <p className="text-xs font-mono text-slate-400">{ep.desc}</p>
              </button>
            ))}
          </div>

          {/* Test Runner Console */}
          <div className="cyber-panel rounded p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <span className="text-xs font-mono font-bold text-slate-300">
                  ENDPOINT TEST: {selectedEndpoint.method} {selectedEndpoint.path}
                </span>
                <button
                  onClick={handleRunTest}
                  disabled={testLoading}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>{testLoading ? 'SENDING...' : 'DISPATCH REQUEST'}</span>
                </button>
              </div>

              {testStatus !== null && (
                <div className="flex items-center gap-2 mb-2 text-xs font-mono">
                  <span className="text-slate-400">HTTP STATUS:</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold ${
                    testStatus >= 200 && testStatus < 300 
                      ? 'bg-emerald-950 text-emerald-400' 
                      : 'bg-red-950 text-red-400'
                  }`}>
                    {testStatus} OK
                  </span>
                </div>
              )}

              <pre className="w-full bg-[#08080d] border border-slate-800 rounded p-3 text-xs font-mono text-emerald-400 max-h-64 overflow-y-auto leading-relaxed">
                {testResponse || '// Click "DISPATCH REQUEST" to query this endpoint in real time.'}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateKey} className="cyber-panel rounded-lg max-w-sm w-full p-5 space-y-4">
            <h3 className="font-display font-bold text-white text-base">GENERATE API TOKEN</h3>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">CLIENT NAME:</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Flutter Mobile Client"
                className="w-full bg-[#12121a] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">ACCESS ROLE:</label>
              <select
                value={newKeyRole}
                onChange={(e) => setNewKeyRole(e.target.value)}
                className="w-full bg-[#12121a] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              >
                <option value="ROOT_ADMIN">ROOT_ADMIN (Full Clearance)</option>
                <option value="SYS_OPERATOR">SYS_OPERATOR (Maintenance)</option>
                <option value="AUDITOR">AUDITOR (Read-Only)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 text-slate-300"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded text-xs font-mono bg-red-600 text-white font-semibold"
              >
                GENERATE
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
