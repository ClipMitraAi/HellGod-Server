/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  UserX, 
  Users, 
  Key, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  Ban,
  Plus
} from 'lucide-react';
import { AuditItem, FirewallRule } from '../../types';

export const SecurityCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rbac' | 'audit' | 'firewall' | 'checklist'>('audit');
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([]);
  const [newBanIp, setNewBanIp] = useState('');
  const [newBanReason, setNewBanReason] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);

  const fetchSecurityData = async () => {
    try {
      const [auditRes, fwRes] = await Promise.all([
        fetch('/api/security/audit'),
        fetch('/api/security/firewall')
      ]);
      const audits = await auditRes.json();
      const fws = await fwRes.json();
      setAuditLogs(audits || []);
      setFirewallRules(fws || []);
    } catch (e) {
      console.error('Failed to load security telemetry', e);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleToggleBan = async (ip: string, reason?: string) => {
    try {
      const res = await fetch('/api/security/firewall/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, reason })
      });
      if (res.ok) {
        setShowBanModal(false);
        setNewBanIp('');
        setNewBanReason('');
        fetchSecurityData();
      }
    } catch (e) {
      alert('Firewall rule update failed');
    }
  };

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">
              SECURITY CENTER & CYBER SHIELD
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Role-Based Access Control (RBAC) &bull; Tamper-Evident Audit Logs &bull; Firewall Sentinel
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-[#101018] p-1 rounded border border-slate-800">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'audit' ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            AUDIT TRAIL ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('firewall')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'firewall' ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            FIREWALL RULES ({firewallRules.length})
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'rbac' ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            RBAC MATRIX
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'checklist' ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            HARDENING
          </button>
        </div>
      </div>

      {/* Tab 1: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="cyber-panel rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-red-600/20">
            <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
              IMMUTABLE AUDIT TRAIL
            </span>
            <span className="text-xs font-mono text-emerald-400">
              ANTI-TAMPER SHA-256 ACTIVE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pl-2">TIMESTAMP</th>
                  <th className="pb-3">ACTOR</th>
                  <th className="pb-3">ACTION</th>
                  <th className="pb-3">IP ADDRESS</th>
                  <th className="pb-3">DETAILS</th>
                  <th className="pb-3 text-right pr-2">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map(item => (
                  <tr key={item.id} className="hover:bg-red-950/20 transition-colors">
                    <td className="py-3 pl-2 text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 font-semibold text-white">
                      {item.actor}
                    </td>
                    <td className="py-3 text-red-400 font-bold">
                      {item.action}
                    </td>
                    <td className="py-3 text-slate-300">
                      {item.ip}
                    </td>
                    <td className="py-3 text-slate-300">
                      {item.details}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'SUCCESS' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/30' 
                          : 'bg-red-950 text-red-400 border border-red-600/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Firewall Rules */}
      {activeTab === 'firewall' && (
        <div className="cyber-panel rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-red-600/20">
            <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
              ACTIVE IP BAN LIST (SENTINEL MITIGATION)
            </span>
            <button
              onClick={() => setShowBanModal(true)}
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>BAN IP ADDRESS</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pl-2">BLOCKED IP</th>
                  <th className="pb-3">REASON / SIGNATURE</th>
                  <th className="pb-3">BLOCKED AT</th>
                  <th className="pb-3">MITIGATED HITS</th>
                  <th className="pb-3 text-right pr-2">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {firewallRules.map(fw => (
                  <tr key={fw.id} className="hover:bg-red-950/20 transition-colors">
                    <td className="py-3 pl-2 font-bold text-red-400">
                      {fw.ip}
                    </td>
                    <td className="py-3 text-slate-200">
                      {fw.reason}
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(fw.blockedAt).toLocaleString()}
                    </td>
                    <td className="py-3 text-slate-300">
                      {fw.hits} scans blocked
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => handleToggleBan(fw.ip)}
                        className="px-2.5 py-1 rounded bg-[#161622] hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500 text-xs font-mono"
                      >
                        UNBAN IP
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="cyber-panel rounded-lg p-5 space-y-4">
          <div className="pb-2 border-b border-red-600/20">
            <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
              ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded bg-[#101018] border border-red-600/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-base text-red-400">ROOT_ADMIN</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400">Full Superuser</span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Unrestricted administrative clearance across all daemons, databases, files, and firewall rules.
              </p>
              <ul className="text-xs font-mono text-slate-300 space-y-1 pt-2">
                <li>&bull; Service Stop / Restart / Configure</li>
                <li>&bull; File Upload / Delete / chmod</li>
                <li>&bull; SQL Execution & DB Restore</li>
                <li>&bull; Firewall IP Bans & Policy</li>
                <li>&bull; API Key Generation</li>
              </ul>
            </div>

            <div className="p-4 rounded bg-[#101018] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-base text-amber-400">SYS_OPERATOR</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400">Operational</span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Day-to-day server maintenance, service restart, and diagnostics without permission to edit security policies.
              </p>
              <ul className="text-xs font-mono text-slate-300 space-y-1 pt-2">
                <li>&bull; Restart Services</li>
                <li>&bull; View & Query Databases</li>
                <li>&bull; Run Ping & Network Diagnostics</li>
                <li>&bull; Create System Snapshots</li>
                <li>&times; No User or Firewall Edit</li>
              </ul>
            </div>

            <div className="p-4 rounded bg-[#101018] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-base text-slate-200">AUDITOR</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Read-Only</span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Compliance and observability inspection clearance. Cannot manipulate files, restart daemons, or execute mutations.
              </p>
              <ul className="text-xs font-mono text-slate-300 space-y-1 pt-2">
                <li>&bull; View System Metrics & Logs</li>
                <li>&bull; Audit Security Events</li>
                <li>&bull; Read-Only Database Queries</li>
                <li>&times; No File Modifications</li>
                <li>&times; No Daemon Controls</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Hardening Checklist */}
      {activeTab === 'checklist' && (
        <div className="cyber-panel rounded-lg p-5 space-y-4">
          <div className="pb-2 border-b border-red-600/20">
            <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
              PRODUCTION CYBER-SECURITY CHECKLIST
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-start gap-3 p-3 rounded bg-[#101018] border border-emerald-600/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Rate-Limiting & Anti-Brute-Force Shield</div>
                <div className="text-slate-400">Locks out IP after 5 consecutive failed authentications for 60 seconds.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded bg-[#101018] border border-emerald-600/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Path Traversal Defense</div>
                <div className="text-slate-400">Filesystem operations are strictly sandboxed inside ./hellgod-storage. Root breakout attempts are rejected.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded bg-[#101018] border border-emerald-600/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Command Injection Allowlist</div>
                <div className="text-slate-400">Shell execution is restricted to safe predefined commands. Arbitrary command chaining is prevented.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded bg-[#101018] border border-emerald-600/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Zero Hardcoded Secrets</div>
                <div className="text-slate-400">No passwords or API keys are committed. User-supplied keys live in memory/session.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban IP Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (newBanIp.trim()) handleToggleBan(newBanIp.trim(), newBanReason.trim());
            }} 
            className="cyber-panel rounded-lg max-w-sm w-full p-5 space-y-4"
          >
            <h3 className="font-display font-bold text-white text-base">BAN IP ADDRESS</h3>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">IP ADDRESS:</label>
              <input
                type="text"
                value={newBanIp}
                onChange={(e) => setNewBanIp(e.target.value)}
                placeholder="e.g. 198.51.100.24"
                className="w-full bg-[#12121a] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">REASON / SIGNATURE:</label>
              <input
                type="text"
                value={newBanReason}
                onChange={(e) => setNewBanReason(e.target.value)}
                placeholder="e.g. Distributed SYN flood probe"
                className="w-full bg-[#12121a] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBanModal(false)}
                className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 text-slate-300"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded text-xs font-mono bg-red-600 text-white font-semibold"
              >
                APPLY BLOCK
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
