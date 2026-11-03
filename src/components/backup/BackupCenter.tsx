/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  RotateCcw, 
  Download, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Clock,
  HardDrive
} from 'lucide-react';
import { BackupItem } from '../../types';

export const BackupCenter: React.FC = () => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backups');
      const data = await res.json();
      setBackups(data || []);
    } catch (e) {
      console.error('Failed to load backups', e);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/backups/create', { method: 'POST' });
      if (res.ok) {
        fetchBackups();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (backup: BackupItem) => {
    if (!confirm(`Are you sure you want to restore the system from snapshot '${backup.name}'? Current in-memory changes will roll back.`)) return;
    setRestoringId(backup.id);
    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: backup.id })
      });
      const data = await res.json();
      if (res.ok) {
        setRestoreSuccessMsg(`System state successfully restored to ${backup.name}`);
        setTimeout(() => setRestoreSuccessMsg(null), 4000);
      }
    } finally {
      setRestoringId(null);
    }
  };

  const handleDownloadBackup = (backup: BackupItem) => {
    const dummyBlob = new Blob([`HELLGOD BACKUP ARCHIVE: ${backup.name}\nCHECKSUM: ${backup.checksum}\nDATE: ${backup.createdAt}`], { type: 'application/gzip' });
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backup.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">
              BACKUP VAULT & SNAPSHOT RECOVERY
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Automated Hourly/Daily Cron &bull; SHA-256 Checksum Verification &bull; One-Click Rollback
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,60,0.4)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isCreating ? 'GENERATING SNAPSHOT...' : 'GENERATE SNAPSHOT'}</span>
        </button>
      </div>

      {restoreSuccessMsg && (
        <div className="p-3 rounded bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{restoreSuccessMsg}</span>
        </div>
      )}

      {/* Backup Schedule Configuration Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cyber-panel rounded-lg p-4">
          <div className="text-xs font-mono text-slate-400 mb-1">AUTO-BACKUP FREQUENCY</div>
          <div className="font-display font-bold text-lg text-white mb-1">
            Every 24 Hours (03:00 UTC)
          </div>
          <div className="text-xs font-mono text-emerald-400">
            Cron: <code className="bg-slate-900 px-1 py-0.5 rounded">0 3 * * *</code>
          </div>
        </div>

        <div className="cyber-panel rounded-lg p-4">
          <div className="text-xs font-mono text-slate-400 mb-1">RETENTION POLICY</div>
          <div className="font-display font-bold text-lg text-white mb-1">
            Keep Last 14 Snapshots
          </div>
          <div className="text-xs font-mono text-slate-300">
            Automated rotation saves disk space
          </div>
        </div>

        <div className="cyber-panel rounded-lg p-4">
          <div className="text-xs font-mono text-slate-400 mb-1">TARGET INCLUSIONS</div>
          <div className="font-display font-bold text-lg text-white mb-1">
            Databases + Configs + Storage
          </div>
          <div className="text-xs font-mono text-red-400">
            Encrypted with SHA-256 HMAC
          </div>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="cyber-panel rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-red-600/20">
          <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
            SNAPSHOT HISTORY & ROLLBACK POINTS
          </span>
          <span className="text-xs font-mono text-slate-400">
            {backups.length} SNAPSHOTS STORED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">SNAPSHOT NAME</th>
                <th className="pb-3">SIZE</th>
                <th className="pb-3">SHA-256 CHECKSUM</th>
                <th className="pb-3">CREATED AT</th>
                <th className="pb-3 text-right pr-2">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {backups.map(bk => (
                <tr key={bk.id} className="hover:bg-red-950/20 transition-colors">
                  <td className="py-3 pl-2 font-bold text-white">
                    {bk.name}
                  </td>
                  <td className="py-3 text-slate-300">{bk.size}</td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">
                    {bk.checksum.substring(0, 16)}...
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(bk.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 text-right pr-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRestore(bk)}
                        disabled={restoringId === bk.id}
                        className="px-2.5 py-1 rounded bg-[#161622] hover:bg-red-950 text-slate-300 hover:text-red-400 border border-slate-700 flex items-center gap-1"
                      >
                        <RotateCcw className={`w-3 h-3 ${restoringId === bk.id ? 'animate-spin' : ''}`} />
                        <span>RESTORE</span>
                      </button>
                      <button
                        onClick={() => handleDownloadBackup(bk)}
                        className="p-1 rounded bg-[#161622] hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Download archive"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
