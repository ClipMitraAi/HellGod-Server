/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, CornerDownLeft, Trash2 } from 'lucide-react';
import { isCommandAllowed } from '../../utils/serverLogic';

interface QuickTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandHistoryItem {
  cmd: string;
  output: string;
  isError?: boolean;
}

export const QuickTerminalModal: React.FC<QuickTerminalModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      cmd: 'hellgod --status',
      output: `HELLGOD Cyber Sentinel v1.0.0 [Online]
Kernel: Linux 6.1.0-cyber-x86_64
Memory: 16 GB Total / 9.8 GB Free
Type 'help' for allowlist commands or 'clear' to reset terminal.`
    }
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, history]);

  if (!isOpen) return null;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = input.trim();
    if (!clean) return;

    if (clean.toLowerCase() === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (clean.toLowerCase() === 'help') {
      setHistory(prev => [
        ...prev,
        {
          cmd: clean,
          output: `AUTHORIZED COMMAND ALLOWLIST:
• status                 - Check master server and microservices state
• uptime                 - Current kernel uptime counter
• free -m                - Memory usage in megabytes
• df -h                  - Disk partition filesystem breakdown
• nginx -t               - Test Nginx reverse proxy syntax
• python3 --version      - Installed Python environment
• node -v                - Installed Node.js environment
• netstat -tuln          - Listening network ports
• ping -c 3 127.0.0.1    - Loopback network latency test
• git status             - Current repository branch status`
        }
      ]);
      setInput('');
      return;
    }

    // Check allowlist
    const allowed = isCommandAllowed(clean);
    if (!allowed) {
      setHistory(prev => [
        ...prev,
        {
          cmd: clean,
          output: `SECURITY ALERT: Command '${clean}' is not in the authorized server allowlist.
HELLGOD prevents arbitrary shell injection for zero-budget cloud and Android safety.
Type 'help' to see authorized commands.`,
          isError: true
        }
      ]);
      setInput('');
      return;
    }

    // Execute simulated output for allowed commands
    let simulatedOutput = '';
    const lower = clean.toLowerCase();

    if (lower === 'status' || lower.includes('status hellgod')) {
      simulatedOutput = `● hellgod.service - HELLGOD All-in-One Server Daemon
   Loaded: loaded (/etc/systemd/system/hellgod.service; enabled)
   Active: active (running) since Mon 2026-11-02 18:00:00 UTC
   Main PID: 4096 (tsx)
   Tasks: 16 (limit: 4915)
   Memory: 84.2M (limit: 2.0G)
   CGroup: /system.slice/hellgod.service
           ├─4096 /usr/bin/node server.ts
           └─4120 /usr/bin/python3 backend/main.py`;
    } else if (lower === 'uptime') {
      simulatedOutput = ' 18:45:10 up 14 days,  3:22,  2 users,  load average: 0.24, 0.18, 0.12';
    } else if (lower === 'free -m') {
      simulatedOutput = `               total        used        free      shared  buff/cache   available
Mem:           15920        9840        6080         210        2450        5870
Swap:           4096           0        4096`;
    } else if (lower === 'df -h') {
      simulatedOutput = `Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p1  256G   43G  214G  17% /
/dev/nvme0n1p2  512M  8.4M  504M   2% /boot/efi
tmpfs           7.8G     0  7.8G   0% /dev/shm`;
    } else if (lower === 'nginx -t') {
      simulatedOutput = `nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful`;
    } else if (lower === 'python3 --version') {
      simulatedOutput = 'Python 3.11.8 (FastAPI / Uvicorn runtime ready)';
    } else if (lower === 'node -v') {
      simulatedOutput = 'v20.18.0 (Express / Vite / TypeScript engine)';
    } else if (lower === 'netstat -tuln') {
      simulatedOutput = `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:8000            0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN`;
    } else if (lower.startsWith('ping')) {
      simulatedOutput = `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.045 ms
64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.038 ms
64 bytes from 127.0.0.1: icmp_seq=3 ttl=64 time=0.041 ms
--- 127.0.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2048ms
rtt min/avg/max/mdev = 0.038/0.041/0.045/0.003 ms`;
    } else if (lower === 'git status') {
      simulatedOutput = `On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean (v1.0.0 Release)`;
    } else {
      simulatedOutput = `[OK] Command executed: ${clean}`;
    }

    setHistory(prev => [
      ...prev,
      { cmd: clean, output: simulatedOutput }
    ]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="cyber-panel rounded-lg max-w-3xl w-full h-[520px] flex flex-col justify-between shadow-[0_0_40px_rgba(255,0,60,0.3)]">
        {/* Terminal Header */}
        <div className="px-4 py-2.5 bg-[#09090f] border-b border-red-600/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-red-500" />
            <span className="font-display font-bold text-sm text-white">
              HELLGOD SECURE SHELL NEXUS
            </span>
            <span className="text-[10px] font-mono bg-red-950 text-red-400 px-1.5 py-0.2 rounded border border-red-600/30">
              SANDBOXED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistory([])}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Clear terminal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white text-base"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Output Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs bg-[#050508]">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <span>root@hellgod:~#</span>
                <span className="text-white">{item.cmd}</span>
              </div>
              <pre className={`whitespace-pre-wrap pl-3 leading-relaxed ${
                item.isError ? 'text-red-400 bg-red-950/20 p-2 rounded border border-red-900/40' : 'text-emerald-400'
              }`}>
                {item.output}
              </pre>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Terminal Input Bar */}
        <form onSubmit={handleExecute} className="p-3 bg-[#0a0a10] border-t border-slate-800 flex items-center gap-2">
          <span className="text-red-500 font-mono font-bold text-xs">root@hellgod:~#</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type 'help', 'status', 'free -m', 'df -h'..."
            className="flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-600 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="p-1.5 rounded bg-red-600 hover:bg-red-500 text-white"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
