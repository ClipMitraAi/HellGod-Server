/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Pure server logic: path sanitization, command allowlists, metric calculations

const ALLOWED_SHELL_COMMANDS = new Set([
  'status',
  'uptime',
  'free -m',
  'df -h',
  'systemctl status hellgod',
  'nginx -t',
  'sqlite3 --version',
  'python3 --version',
  'node -v',
  'netstat -tuln',
  'ping -c 3 127.0.0.1',
  'docker ps',
  'git status'
]);

/**
 * Validate that a command is in the authorized server allowlist
 */
export function isCommandAllowed(command: string): boolean {
  if (!command) return false;
  const trimmed = command.trim().toLowerCase();
  
  // Direct match
  if (ALLOWED_SHELL_COMMANDS.has(trimmed)) return true;

  // Safe prefix match for ping
  if (trimmed.startsWith('ping -c') && !trimmed.includes(';') && !trimmed.includes('&&') && !trimmed.includes('|')) {
    return true;
  }

  // Safe prefix match for status checks
  if (trimmed.startsWith('systemctl status ') && !trimmed.includes(';') && !trimmed.includes('&&') && !trimmed.includes('|')) {
    return true;
  }

  return false;
}

/**
 * Prevent path traversal attacks (e.g. ../../etc/passwd)
 * Returns a normalized relative path safe inside the sandbox root, or throws error
 */
export function sanitizeFilePath(userPath: string): string {
  if (!userPath) return '';
  // Normalize forward and back slashes
  let clean = userPath.replace(/\\/g, '/');
  
  // Strip leading slashes to prevent absolute breakout
  clean = clean.replace(/^\/+/, '');

  // Detect traversal patterns
  const segments = clean.split('/');
  const safeSegments: string[] = [];

  for (const seg of segments) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      if (safeSegments.length > 0) {
        safeSegments.pop();
      } else {
        // Attempting to traverse above root
        throw new Error('Path traversal attempt detected');
      }
    } else {
      // Disallow null bytes or dangerous chars
      if (seg.includes('\0') || /[\x00-\x1f]/.test(seg)) {
        throw new Error('Invalid path characters detected');
      }
      safeSegments.push(seg);
    }
  }

  return safeSegments.join('/');
}

/**
 * Format bytes into human readable KB, MB, GB
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format uptime seconds to DD:HH:MM:SS format
 */
export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  parts.push(`${h.toString().padStart(2, '0')}h`);
  parts.push(`${m.toString().padStart(2, '0')}m`);
  parts.push(`${s.toString().padStart(2, '0')}s`);

  return parts.join(' ');
}
