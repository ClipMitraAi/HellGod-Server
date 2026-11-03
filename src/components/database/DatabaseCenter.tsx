/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  Play, 
  RotateCcw, 
  Archive, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  HardDrive
} from 'lucide-react';
import { DbTable } from '../../types';

export const DatabaseCenter: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [tables, setTables] = useState<DbTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [queryInput, setQueryInput] = useState('SELECT * FROM users;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const fetchDatabaseInfo = async () => {
    try {
      const [statsRes, tablesRes] = await Promise.all([
        fetch('/api/database/stats'),
        fetch('/api/database/tables')
      ]);
      const s = await statsRes.json();
      const t = await tablesRes.json();
      setStats(s);
      setTables(t || []);
    } catch (e) {
      console.error('Failed to load database info', e);
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
    runQuery('SELECT * FROM users;');
  }, []);

  const runQuery = async (sqlToRun?: string) => {
    const sql = (sqlToRun || queryInput).trim();
    if (!sql) return;

    setIsExecuting(true);
    setQueryError(null);
    try {
      const res = await fetch('/api/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql })
      });
      const data = await res.json();
      if (res.ok) {
        setQueryResult(data);
      } else {
        setQueryError(data.error || 'SQL execution failed');
        setQueryResult(null);
      }
    } catch (err: any) {
      setQueryError(err.message || 'Execution error');
      setQueryResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectTable = (name: string) => {
    setSelectedTable(name);
    const sql = `SELECT * FROM ${name};`;
    setQueryInput(sql);
    runQuery(sql);
  };

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">
              DATABASE CENTER & STORAGE ENGINE
            </h1>
            <p className="text-xs font-mono text-slate-400">
              SQLite 3.42 (WAL Mode) &bull; PostgreSQL Zero-Cost Driver &bull; Interactive SQL Console
            </p>
          </div>
        </div>

        {/* Database Quick Stats */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded bg-[#12121a] border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">TABLES: </span>
            <span className="text-white font-bold">{tables.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-[#12121a] border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">TOTAL ROWS: </span>
            <span className="text-emerald-400 font-bold">{stats?.totalRows || 13}</span>
          </div>
        </div>
      </div>

      {/* SQL Query Console Panel */}
      <div className="cyber-panel rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-red-600/20">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-red-500" />
            <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
              SQL QUERY CONSOLE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runQuery()}
              disabled={isExecuting}
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,60,0.4)]"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isExecuting ? 'EXECUTING...' : 'EXECUTE SQL'}</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            rows={3}
            placeholder="e.g. SELECT * FROM users;"
            className="w-full bg-[#08080d] border border-slate-800 rounded p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Quick query buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">QUICK TABLES:</span>
          {tables.map(t => (
            <button
              key={t.name}
              onClick={() => handleSelectTable(t.name)}
              className={`px-2.5 py-1 rounded border transition-all ${
                selectedTable === t.name 
                  ? 'bg-red-950 text-red-400 border-red-600/50 font-bold' 
                  : 'bg-[#12121a] text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {t.name} ({t.rowCount})
            </button>
          ))}
        </div>

        {/* Query Output Table */}
        {queryError ? (
          <div className="p-3 rounded bg-red-950/60 border border-red-600/50 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{queryError}</span>
          </div>
        ) : queryResult ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Execution Time: <span className="text-emerald-400 font-bold">{queryResult.executionTimeMs} ms</span></span>
              <span>{queryResult.rowCount !== undefined ? `${queryResult.rowCount} rows returned` : (queryResult.message || 'Success')}</span>
            </div>

            {queryResult.columns && queryResult.rows && (
              <div className="overflow-x-auto border border-slate-800 rounded max-h-80">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#12121c] border-b border-slate-800 sticky top-0">
                    <tr className="text-slate-400 uppercase text-[11px]">
                      {queryResult.columns.map((col: string) => (
                        <th key={col} className="p-2.5">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#0b0b10]">
                    {queryResult.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-red-950/20">
                        {queryResult.columns.map((col: string) => (
                          <td key={col} className="p-2.5 text-slate-300">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* PostgreSQL Integration & Migration Card */}
      <div className="cyber-panel rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-red-600/20">
          <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
            POSTGRESQL & CLOUD SQL SCALABILITY DRIVER
          </span>
          <span className="text-xs font-mono text-emerald-400">READY</span>
        </div>
        <p className="text-xs font-mono text-slate-300 leading-relaxed">
          HELLGOD uses embedded SQLite 3.42 (WAL mode) by default for zero-cost operation on Android & Linux.
          To connect to an external PostgreSQL or Neon/Supabase database at any time, configure the connection URI in your environment:
        </p>
        <div className="p-2.5 rounded bg-[#08080d] border border-slate-800 text-xs font-mono text-red-400">
          DATABASE_URL="postgresql://hellgod_admin:secret@localhost:5432/hellgod_production?sslmode=require"
        </div>
      </div>
    </div>
  );
};
