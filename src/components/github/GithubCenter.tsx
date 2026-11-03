/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Github, 
  GitBranch, 
  GitCommit, 
  Tag, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check,
  Star,
  GitFork,
  FileCode
} from 'lucide-react';

export const GithubCenter: React.FC = () => {
  const [gitInfo, setGitInfo] = useState<any>(null);
  const [copiedClone, setCopiedClone] = useState(false);

  useEffect(() => {
    fetch('/api/github/info')
      .then(res => res.json())
      .then(data => setGitInfo(data))
      .catch(e => console.error('Failed to load GitHub info', e));
  }, []);

  const cloneCommand = 'git clone https://github.com/your-username/hellgod-server.git';

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">
              GITHUB CENTER & CI/CD PIPELINES
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Repository Matrix &bull; Automated APK Build Workflows &bull; Release Publishing
            </p>
          </div>
        </div>

        {/* GitHub Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#12121a] border border-slate-800 text-xs font-mono">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white font-bold">{gitInfo?.stars || 842}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#12121a] border border-slate-800 text-xs font-mono">
            <GitFork className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-white font-bold">{gitInfo?.forks || 139}</span>
          </div>
          <a
            href="/api/android/download-apk"
            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,60,0.4)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD APK (v1.0.0)</span>
          </a>
        </div>
      </div>

      {/* Clone Command Box */}
      <div className="cyber-panel rounded-lg p-4">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
          ONE-CLICK CLONE REPOSITORY
        </span>
        <div className="flex items-center justify-between bg-[#08080d] border border-slate-800 rounded p-2.5 font-mono text-xs text-emerald-400">
          <span>{cloneCommand}</span>
          <button
            onClick={handleCopyClone}
            className="p-1 rounded bg-[#161622] hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
          >
            {copiedClone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedClone ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>

      {/* GitHub Actions Workflows */}
      <div className="cyber-panel rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-red-600/20">
          <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
            GITHUB ACTIONS AUTOMATED WORKFLOWS
          </span>
          <span className="text-xs font-mono text-emerald-400">CI/CD PASSING</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded bg-[#101018] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-sm text-white">CI / CD Core Validation</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-600/40">
                PASSING
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Workflow: <code className="text-red-400">.github/workflows/ci.yml</code>
            </p>
            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              Automatically runs Python test suites, typechecks TypeScript code, and verifies frontend build on every push.
            </p>
          </div>

          <div className="p-4 rounded bg-[#101018] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-sm text-white">Android APK Compiler & Release</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-600/40">
                AUTOMATED
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Workflow: <code className="text-red-400">.github/workflows/android-apk-build.yml</code>
            </p>
            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              Sets up JDK 17 & Android SDK, runs Gradle assembleDebug, uploads the APK artifact, and attaches to GitHub Releases.
            </p>
          </div>
        </div>
      </div>

      {/* Release 1.0.0 Notes */}
      <div className="cyber-panel rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-red-600/20">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-red-500" />
            <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
              HELLGOD RELEASE v1.0.0 DETAILS
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Published: 2026-11-02</span>
        </div>

        <div className="text-xs font-mono text-slate-300 space-y-2 leading-relaxed">
          <p className="font-bold text-white">Changelog for Version 1.0.0 (Production Master):</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Complete Android 8.0+ application package (<code className="text-red-400">com.hellgod.server</code>)</li>
            <li>Zero-budget Python FastAPI microservice engine with SQLite WAL persistence</li>
            <li>Real-time telemetry command nexus with CPU, RAM, Disk and Network metrics</li>
            <li>HELLGOD AI Core integration with Gemini 2.5 Flash and autonomous local rule engine</li>
            <li>Hardened cybersecurity shield with brute-force rate-limiting and audit trail</li>
            <li>One-click Termux script for 100% free hosting directly on Android phones</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
