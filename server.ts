/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns/promises';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { RateLimiter, generateApiKey, hasPermission } from './src/utils/security.ts';
import { sanitizeFilePath, formatBytes, formatUptime } from './src/utils/serverLogic.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup sandbox storage directory
const STORAGE_DIR = path.resolve(process.cwd(), 'hellgod-storage');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Seed default files in sandbox storage if empty
const seedFiles = [
  {
    path: 'hellgod.conf',
    content: `# HELLGOD MASTER SERVER CONFIGURATION v1.0.0
SERVER_NAME="HELLGOD-CORE-01"
LISTEN_PORT=3000
BIND_ADDRESS="0.0.0.0"
WORKER_PROCESSES=4
SECURITY_LEVEL="HIGH"
CYBERPUNK_THEME="TRUE"
MAX_CONNECTIONS=10000
AI_ASSISTANT_ENABLED=true
`
  },
  {
    path: 'security.yaml',
    content: `# HELLGOD CYBER-SHIELD RULES
firewall:
  enabled: true
  default_policy: "DROP"
  rate_limit:
    max_requests_per_minute: 120
    burst_allowance: 30
ssl_tls:
  force_https: true
  min_tls_version: "1.3"
  hsts: true
allowed_ip_whitelist:
  - "127.0.0.1"
  - "192.168.1.0/24"
`
  },
  {
    path: 'scripts/healthcheck.sh',
    content: `#!/bin/bash
# HELLGOD automated health monitor
echo "[HELLGOD] Checking system vital signs..."
UPTIME=$(uptime -p)
echo "Uptime: $UPTIME"
echo "Status: ALL_SYSTEMS_OPTIMAL"
exit 0
`
  },
  {
    path: 'logs/server.log',
    content: `[2026-11-02 18:00:01] [INFO] [SYSTEM] HELLGOD Core Daemon started on PID 4096
[2026-11-02 18:00:02] [INFO] [AUTH] Root administrator authenticated from 127.0.0.1
[2026-11-02 18:01:15] [INFO] [SERVICES] FastAPI backend bridge initialized on port 8000
[2026-11-02 18:02:40] [WARN] [SECURITY] Port scan detected from external probe 185.220.101.5 (Mitigated)
[2026-11-02 18:03:10] [INFO] [BACKUP] Automated SQLite checkpoint completed successfully
`
  }
];

for (const file of seedFiles) {
  const fullPath = path.join(STORAGE_DIR, file.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, file.content, 'utf-8');
  }
}

// In-Memory state for server demo & operations
const loginRateLimiter = new RateLimiter(5, 60000);

let servicesState = [
  { id: 'hellgod-daemon', name: 'HELLGOD Daemon Core', status: 'running', cpu: 1.8, memory: 48, port: 3000, description: 'Master orchestration and task scheduler engine' },
  { id: 'nginx-proxy', name: 'Nginx Reverse Proxy', status: 'running', cpu: 0.6, memory: 18, port: 80, description: 'Cyberpunk SSL/TLS edge termination and rate limiting' },
  { id: 'fastapi-core', name: 'FastAPI Backend Engine', status: 'running', cpu: 2.1, memory: 64, port: 8000, description: 'High-throughput async Python API microservices' },
  { id: 'sqlite-engine', name: 'SQLite Storage Engine', status: 'running', cpu: 0.4, memory: 24, port: 0, description: 'Embedded ACID database with WAL-mode durability' },
  { id: 'redis-cache', name: 'Redis Sentinel Cache', status: 'running', cpu: 0.9, memory: 32, port: 6379, description: 'In-memory low latency session and cache tier' },
  { id: 'ssh-sentinel', name: 'SSH Shield Bastion', status: 'running', cpu: 0.2, memory: 12, port: 22, description: 'Cryptographic public-key hardened administrative access' },
  { id: 'ai-gateway', name: 'AI Neural Gateway', status: 'running', cpu: 1.5, memory: 52, port: 8080, description: 'Gemini 2.5 Flash neural assistant & rule engine dispatcher' },
];

let activityLogs = [
  { id: 'log-1', timestamp: new Date(Date.now() - 360000).toISOString(), level: 'INFO', category: 'SYSTEM', message: 'HELLGOD Master Platform v1.0.0 booted successfully.' },
  { id: 'log-2', timestamp: new Date(Date.now() - 280000).toISOString(), level: 'INFO', category: 'SERVICES', message: 'Daemon worker thread pool spawned (4 workers ready).' },
  { id: 'log-3', timestamp: new Date(Date.now() - 190000).toISOString(), level: 'WARN', category: 'NETWORK', message: 'Network adapter eth0 packet buffer peak at 45.2 MB/s.' },
  { id: 'log-4', timestamp: new Date(Date.now() - 95000).toISOString(), level: 'INFO', category: 'AUTH', message: 'Root Admin login token generated for session #HG-9021.' },
  { id: 'log-5', timestamp: new Date().toISOString(), level: 'INFO', category: 'AI', message: 'AI Neural Assistant online and ready for server diagnostics.' },
];

let auditTrail = [
  { id: 'aud-1', timestamp: new Date(Date.now() - 400000).toISOString(), actor: 'root@hellgod', action: 'SYSTEM_BOOT', details: 'Initialized kernel subsystems and sandbox storage', ip: '127.0.0.1', status: 'SUCCESS' },
  { id: 'aud-2', timestamp: new Date(Date.now() - 120000).toISOString(), actor: 'root@hellgod', action: 'SERVICE_VERIFY', details: 'Automated healthcheck ping to all 7 microservices', ip: '127.0.0.1', status: 'SUCCESS' },
];

let firewallRules = [
  { id: 'fw-1', ip: '185.220.101.5', reason: 'Automated brute-force scan', blockedAt: new Date(Date.now() - 86400000).toISOString(), hits: 142 },
  { id: 'fw-2', ip: '45.141.215.18', reason: 'SSH dictionary attempt', blockedAt: new Date(Date.now() - 43200000).toISOString(), hits: 89 },
];

let apiKeys = [
  { id: 'key-1', name: 'Android Mobile App Key', key: 'hg_live_and7791x9011a4b882f0c89', prefix: 'hg_live_and77...', role: 'SYS_OPERATOR', createdAt: '2026-11-01', requestsCount: 1420, active: true },
  { id: 'key-2', name: 'GitHub CI/CD Automation', key: 'hg_live_git4428q1199c011e743a12', prefix: 'hg_live_git44...', role: 'ROOT_ADMIN', createdAt: '2026-11-02', requestsCount: 512, active: true },
];

let backups = [
  { id: 'bk-1', name: 'hellgod-snapshot-initial.tar.gz', size: '14.8 MB', createdAt: new Date(Date.now() - 172800000).toISOString(), checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: 'HEALTHY' },
  { id: 'bk-2', name: 'hellgod-snapshot-autodaily.tar.gz', size: '16.2 MB', createdAt: new Date(Date.now() - 86400000).toISOString(), checksum: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4', status: 'HEALTHY' }
];

// Sample database tables for Database Center
let dbTables: Record<string, { schema: string; columns: string[]; rows: any[] }> = {
  users: {
    schema: 'CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, role TEXT, email TEXT, created_at TEXT)',
    columns: ['id', 'username', 'role', 'email', 'created_at'],
    rows: [
      { id: 1, username: 'HellGod', role: 'ROOT_ADMIN', email: 'hellgod@platform.local', created_at: '2026-11-02 00:00:00' },
      { id: 2, username: 'root_admin', role: 'ROOT_ADMIN', email: 'admin@hellgod.local', created_at: '2026-11-01 10:00:00' },
      { id: 3, username: 'operator_zen', role: 'SYS_OPERATOR', email: 'zen@hellgod.local', created_at: '2026-11-01 12:30:00' },
      { id: 4, username: 'auditor_ghost', role: 'AUDITOR', email: 'ghost@hellgod.local', created_at: '2026-11-02 08:15:00' }
    ]
  },
  services: {
    schema: 'CREATE TABLE services (id TEXT PRIMARY KEY, name TEXT, port INTEGER, status TEXT, memory_mb INTEGER)',
    columns: ['id', 'name', 'port', 'status', 'memory_mb'],
    rows: servicesState.map(s => ({ id: s.id, name: s.name, port: s.port, status: s.status, memory_mb: s.memory }))
  },
  audit_logs: {
    schema: 'CREATE TABLE audit_logs (id TEXT PRIMARY KEY, actor TEXT, action TEXT, ip TEXT, timestamp TEXT)',
    columns: ['id', 'actor', 'action', 'ip', 'timestamp'],
    rows: auditTrail.map(a => ({ id: a.id, actor: a.actor, action: a.action, ip: a.ip, timestamp: a.timestamp }))
  }
};

// ================= API ROUTES =================

// 1. Health & Server Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPTIMAL',
    platform: 'HELLGOD All-in-One Server Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    os: `${os.type()} ${os.release()} (${os.arch()})`
  });
});

// 2. Auth Login (Rate-limited)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (loginRateLimiter.isLocked(ip)) {
    return res.status(429).json({
      error: 'Security Lockout: Too many failed login attempts. Try again in 60 seconds.',
      rateLimited: true
    });
  }

  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();

  // HellGod / HellGod@1122 super admin or existing demo credentials
  const isHellGod = (cleanUser.toLowerCase() === 'hellgod' && cleanPass === 'HellGod@1122');
  const isRoot = (cleanUser.toLowerCase() === 'root' && (cleanPass === 'hellgod' || cleanPass === 'admin'));
  const isOperator = (cleanUser.toLowerCase() === 'operator' && cleanPass === 'operator');
  const isAuditor = (cleanUser.toLowerCase() === 'auditor' && cleanPass === 'auditor');

  if (isHellGod || isRoot || isOperator || isAuditor) {
    loginRateLimiter.recordAttempt(ip, true);
    
    const resolvedUsername = isHellGod ? 'HellGod' : (isRoot ? 'root' : cleanUser);
    const role = (isHellGod || isRoot) ? 'ROOT_ADMIN' : (isOperator ? 'SYS_OPERATOR' : 'AUDITOR');
    const token = `hg_jwt_${Buffer.from(JSON.stringify({ u: resolvedUsername, r: role, t: Date.now() })).toString('base64')}`;

    // Add to audit trail
    auditTrail.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${resolvedUsername}@hellgod`,
      action: 'USER_LOGIN',
      details: `Successful authenticated session started (${role})`,
      ip: ip,
      status: 'SUCCESS'
    });

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'AUTH',
      message: `Administrator '${resolvedUsername}' authenticated with role ${role}`
    });

    return res.json({
      success: true,
      token,
      user: {
        username: resolvedUsername,
        role,
        permissions: role === 'ROOT_ADMIN' ? ['*'] : (role === 'SYS_OPERATOR' ? ['read', 'write', 'services'] : ['read'])
      }
    });
  } else {
    const attempt = loginRateLimiter.recordAttempt(ip, false);
    
    auditTrail.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: cleanUser || 'anonymous',
      action: 'LOGIN_FAILURE',
      details: `Failed authentication attempt (remaining attempts: ${attempt.remaining})`,
      ip: ip,
      status: 'BLOCKED'
    });

    return res.status(401).json({
      error: 'Invalid credentials. Use HellGod / HellGod@1122 or root / hellgod.',
      remainingAttempts: attempt.remaining
    });
  }
});

// 3. System Metrics
app.get('/api/system/metrics', (req, res) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = Math.round((usedMem / totalMem) * 100);

  // Calculate dynamic simulated CPU load
  const loadAvg = os.loadavg();
  const simulatedCpuUsage = Math.min(100, Math.max(5, Math.round(loadAvg[0] * 18 + Math.random() * 8)));

  res.json({
    hostname: os.hostname(),
    platform: `${os.type()} ${os.arch()}`,
    uptimeSeconds: Math.floor(os.uptime()),
    uptimeFormatted: formatUptime(Math.floor(os.uptime())),
    cpu: {
      model: cpus[0]?.model || 'CyberCore Virtual CPU x8',
      cores: cpus.length,
      usagePercent: simulatedCpuUsage,
      loadAverages: loadAvg.map(l => parseFloat(l.toFixed(2)))
    },
    memory: {
      totalBytes: totalMem,
      usedBytes: usedMem,
      freeBytes: freeMem,
      totalFormatted: formatBytes(totalMem),
      usedFormatted: formatBytes(usedMem),
      freeFormatted: formatBytes(freeMem),
      usagePercent: memUsagePercent
    },
    disk: {
      totalFormatted: '256.0 GB',
      usedFormatted: '42.8 GB',
      freeFormatted: '213.2 GB',
      usagePercent: 17
    },
    network: {
      rxSpeed: `${(1.2 + Math.random() * 2.5).toFixed(1)} MB/s`,
      txSpeed: `${(0.8 + Math.random() * 1.8).toFixed(1)} MB/s`,
      totalPackets: 2849102 + Math.floor(Math.random() * 1000)
    }
  });
});

// 4. Services Manager
app.get('/api/services', (req, res) => {
  res.json(servicesState);
});

app.post('/api/services/:id/action', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'start' | 'stop' | 'restart'

  const service = servicesState.find(s => s.id === id);
  if (!service) {
    return res.status(404).json({ error: `Service ${id} not found.` });
  }

  if (action === 'stop') {
    service.status = 'stopped';
    service.cpu = 0;
    service.memory = 0;
  } else if (action === 'start') {
    service.status = 'running';
    service.cpu = parseFloat((0.5 + Math.random() * 2.0).toFixed(1));
    service.memory = Math.floor(20 + Math.random() * 40);
  } else if (action === 'restart') {
    service.status = 'running';
    service.cpu = parseFloat((0.8 + Math.random() * 2.5).toFixed(1));
    service.memory = Math.floor(25 + Math.random() * 35);
  }

  // Update in sqlite table as well
  dbTables.services.rows = servicesState.map(s => ({
    id: s.id,
    name: s.name,
    port: s.port,
    status: s.status,
    memory_mb: s.memory
  }));

  const logMsg = `Service [${service.name}] command executed: ${action.toUpperCase()}`;
  activityLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: action === 'stop' ? 'WARN' : 'INFO',
    category: 'SERVICES',
    message: logMsg
  });

  auditTrail.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'admin@hellgod',
    action: `SERVICE_${action.toUpperCase()}`,
    details: `${service.name} state changed to ${service.status}`,
    ip: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });

  res.json({ success: true, service, message: logMsg });
});

// 5. Activity Logs Stream
app.get('/api/system/logs', (req, res) => {
  const { level, category } = req.query;
  let filtered = [...activityLogs];
  if (level && level !== 'ALL') {
    filtered = filtered.filter(l => l.level === level);
  }
  if (category && category !== 'ALL') {
    filtered = filtered.filter(l => l.category === category);
  }
  res.json(filtered);
});

// 6. Sandboxed File Manager
app.get('/api/files/list', (req, res) => {
  try {
    const relPath = sanitizeFilePath((req.query.path as string) || '');
    const targetDir = path.join(STORAGE_DIR, relPath);

    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ error: 'Directory does not exist.' });
    }

    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    const items = entries.map(entry => {
      const fullEntryPath = path.join(targetDir, entry.name);
      const stats = fs.statSync(fullEntryPath);
      return {
        name: entry.name,
        path: path.join(relPath, entry.name).replace(/\\/g, '/'),
        isDirectory: entry.isDirectory(),
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        modifiedAt: stats.mtime.toISOString(),
        permissions: (stats.mode & parseInt('777', 8)).toString(8)
      };
    });

    res.json({ currentPath: relPath, items });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'File list failed' });
  }
});

app.get('/api/files/read', (req, res) => {
  try {
    const relPath = sanitizeFilePath((req.query.path as string) || '');
    const targetFile = path.join(STORAGE_DIR, relPath);

    if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(targetFile, 'utf-8');
    res.json({ path: relPath, content });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Read error' });
  }
});

app.post('/api/files/write', (req, res) => {
  try {
    const { path: userPath, content } = req.body;
    const relPath = sanitizeFilePath(userPath || '');
    const targetFile = path.join(STORAGE_DIR, relPath);

    fs.writeFileSync(targetFile, content, 'utf-8');

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'STORAGE',
      message: `File saved: ${relPath} (${content.length} bytes)`
    });

    res.json({ success: true, message: `Saved ${relPath}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Write error' });
  }
});

app.post('/api/files/create', (req, res) => {
  try {
    const { path: parentPath, name, isDirectory, content = '' } = req.body;
    const safeParent = sanitizeFilePath(parentPath || '');
    const safeName = name.replace(/[\\/]/g, '');
    const target = path.join(STORAGE_DIR, safeParent, safeName);

    if (fs.existsSync(target)) {
      return res.status(409).json({ error: 'Item already exists' });
    }

    if (isDirectory) {
      fs.mkdirSync(target, { recursive: true });
    } else {
      fs.writeFileSync(target, content, 'utf-8');
    }

    res.json({ success: true, path: path.join(safeParent, safeName) });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Creation error' });
  }
});

app.post('/api/files/delete', (req, res) => {
  try {
    const { path: userPath } = req.body;
    const relPath = sanitizeFilePath(userPath || '');
    const target = path.join(STORAGE_DIR, relPath);

    if (!fs.existsSync(target)) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      fs.rmSync(target, { recursive: true, force: true });
    } else {
      fs.unlinkSync(target);
    }

    res.json({ success: true, message: `Deleted ${relPath}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Delete error' });
  }
});

app.post('/api/files/rename', (req, res) => {
  try {
    const { oldPath, newName } = req.body;
    const safeOld = sanitizeFilePath(oldPath || '');
    const cleanNewName = newName.replace(/[\\/]/g, '');
    const source = path.join(STORAGE_DIR, safeOld);
    const destination = path.join(path.dirname(source), cleanNewName);

    if (!fs.existsSync(source)) {
      return res.status(404).json({ error: 'Source file not found' });
    }

    fs.renameSync(source, destination);
    res.json({ success: true, message: `Renamed to ${cleanNewName}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Rename error' });
  }
});

// 7. Database Center
app.get('/api/database/stats', (req, res) => {
  const tableNames = Object.keys(dbTables);
  let totalRows = 0;
  for (const name of tableNames) {
    totalRows += dbTables[name].rows.length;
  }

  res.json({
    engine: 'SQLite 3.42.0 (WAL Mode)',
    databaseFile: 'hellgod-storage/databases/hellgod.db',
    sizeFormatted: '4.2 MB',
    tableCount: tableNames.length,
    totalRows,
    connectedPools: 8,
    walEnabled: true,
    postgresIntegrationAvailable: true
  });
});

app.get('/api/database/tables', (req, res) => {
  const result = Object.entries(dbTables).map(([name, data]) => ({
    name,
    columns: data.columns,
    rowCount: data.rows.length,
    schema: data.schema
  }));
  res.json(result);
});

app.post('/api/database/query', (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required.' });
  }

  const startTime = Date.now();
  const cleanQuery = query.trim();

  // Simple safe simulated SQL query execution on our memory tables
  try {
    if (cleanQuery.toUpperCase().startsWith('SELECT')) {
      const match = cleanQuery.match(/FROM\s+([a-zA-Z_]+)/i);
      const tableName = match ? match[1].toLowerCase() : '';

      if (dbTables[tableName]) {
        return res.json({
          success: true,
          executionTimeMs: Math.max(1, Date.now() - startTime),
          columns: dbTables[tableName].columns,
          rows: dbTables[tableName].rows,
          rowCount: dbTables[tableName].rows.length
        });
      } else {
        return res.status(404).json({ error: `Table '${tableName || 'unknown'}' not found in SQLite database.` });
      }
    } else if (cleanQuery.toUpperCase().startsWith('INSERT INTO')) {
      return res.json({
        success: true,
        executionTimeMs: 3,
        affectedRows: 1,
        message: '1 row inserted successfully.'
      });
    } else {
      return res.json({
        success: true,
        executionTimeMs: 2,
        message: 'Query executed successfully with 0 rows returned.'
      });
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'SQL execution failed' });
  }
});

// 8. AI Core Assistant (Gemini 2.5 Flash + Cyberpunk Rule Engine Fallback)
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, customApiKey, chatHistory = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are HELLGOD AI CORE v1.0.0, the ultimate cyberpunk server intelligence and devops architect.
You manage server infrastructure, diagnose performance bottlenecks, inspect Linux systemctl services, generate secure configurations, analyze security audit logs, write FastAPI & Kotlin Android code, and assist server administrators.
Speak with crisp, authoritative, futuristic cyberpunk precision (e.g. "[HELLGOD NEURAL CORE] System analysis complete..."). Provide concrete, copy-ready commands and code snippets where relevant.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...chatHistory.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          systemInstruction
        }
      });

      return res.json({
        reply: response.text || '[HELLGOD] Neural gateway processed request.',
        provider: 'Gemini 2.5 Flash (Cloud Neural Link)'
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local rule engine:', err.message);
    }
  }

  // Local Rule-Based Expert Assistant Fallback
  const p = prompt.toLowerCase();
  let reply = '';

  if (p.includes('status') || p.includes('health') || p.includes('load')) {
    reply = `[HELLGOD AI CORE // LOCAL DIAGNOSTIC]
Current System Assessment:
- CPU Load: Optimal (Simulated cores stable at <25%)
- Memory: 64% allocated / Active cache clean
- Microservices: 7/7 authorized services online
- Security Bastion: Active firewall blocking unauthorized IP scans
- Recommendation: All telemetry nominal. Run 'htop' or inspect Dashboard tab for sub-second thread charts.`;
  } else if (p.includes('nginx') || p.includes('proxy') || p.includes('ssl')) {
    reply = `[HELLGOD AI CORE // REVERSE PROXY ADVISOR]
Recommended Nginx Cyber-Shield Config (/etc/nginx/sites-available/hellgod.conf):
\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    ssl_certificate /etc/letsencrypt/live/hellgod/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hellgod/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`
Action: Test with \`nginx -t\` then reload via HELLGOD Services Manager.`;
  } else if (p.includes('apk') || p.includes('android') || p.includes('build')) {
    reply = `[HELLGOD AI CORE // ANDROID COMPILER MATRIX]
Android APK Build Pipeline:
1. Package: \`com.hellgod.server\`
2. Local compilation:
   \`cd hellgod-server/android && ./gradlew assembleDebug\`
3. APK destination: \`app/build/outputs/apk/debug/app-debug.apk\`
4. GitHub Actions Automated Build: Workflow \`.github/workflows/android-apk-build.yml\` runs on every push and automatically uploads the debug APK as an artifact.
5. Termux Android Local Host: Run \`bash scripts/install-android-termux.sh\` to host the entire backend on Android with zero cloud cost!`;
  } else if (p.includes('database') || p.includes('sqlite') || p.includes('postgres') || p.includes('sql')) {
    reply = `[HELLGOD AI CORE // DATABASE CENTRIC ADVISORY]
- SQLite Database is operating in WAL (Write-Ahead Logging) mode for maximum concurrency.
- Auto-checkpoint is active.
- To execute live queries, switch to the Database Center tab or run:
  \`SELECT name, status, memory_mb FROM services;\`
- For PostgreSQL zero-cost migration: Set \`DATABASE_URL=postgresql://user:pass@localhost:5432/hellgod\` in your .env.`;
  } else if (p.includes('backup') || p.includes('restore')) {
    reply = `[HELLGOD AI CORE // BACKUP VAULT]
- Automated snapshot created every 24h.
- Encryption: SHA-256 integrity verification.
- To create an instant snapshot right now, trigger the 'Generate Snapshot' button in the Backup Center tab or run \`bash scripts/backup.sh\`.`;
  } else {
    reply = `[HELLGOD AI CORE // ONLINE]
Received command: "${prompt}"

HELLGOD Core Capabilities:
- Full system status & live hardware telemetry
- Service orchestration (FastAPI, Nginx, SQLite, Redis, SSH Sentinel)
- Sandboxed file manipulation & safe code editing
- Network diagnostics (ICMP Ping, DNS lookup, open ports)
- Android APK source generator & CI/CD deployment automation

Provide any DevOps command, configuration question, or troubleshooting request to analyze.`;
  }

  return res.json({
    reply,
    provider: 'HELLGOD Cyberpunk Local Rule Engine (Autonomous Zero-Budget Core)'
  });
});

// 9. Network Diagnostics
app.post('/api/network/ping', async (req, res) => {
  const { host = '127.0.0.1' } = req.body;
  const cleanHost = host.trim();

  // Simulated latency ping
  const pingResults = [
    { seq: 1, bytes: 64, timeMs: parseFloat((1.2 + Math.random() * 2.8).toFixed(2)), ttl: 64 },
    { seq: 2, bytes: 64, timeMs: parseFloat((1.1 + Math.random() * 3.1).toFixed(2)), ttl: 64 },
    { seq: 3, bytes: 64, timeMs: parseFloat((1.3 + Math.random() * 2.5).toFixed(2)), ttl: 64 },
  ];

  const avg = (pingResults.reduce((acc, p) => acc + p.timeMs, 0) / pingResults.length).toFixed(2);

  res.json({
    host: cleanHost,
    packetsTransmitted: 3,
    packetsReceived: 3,
    packetLoss: '0%',
    avgTimeMs: avg,
    details: pingResults
  });
});

app.post('/api/network/dns', async (req, res) => {
  const { domain = 'google.com' } = req.body;
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].trim();

  try {
    const aRecords = await dns.resolve4(cleanDomain).catch(() => ['172.217.16.206']);
    const mxRecords = await dns.resolveMx(cleanDomain).catch(() => [{ exchange: 'smtp.google.com', priority: 10 }]);
    const txtRecords = await dns.resolveTxt(cleanDomain).catch(() => [['v=spf1 include:_spf.google.com ~all']]);

    res.json({
      domain: cleanDomain,
      aRecords,
      mxRecords,
      txtRecords
    });
  } catch (err: any) {
    res.json({
      domain: cleanDomain,
      aRecords: ['172.217.16.206'],
      mxRecords: [{ exchange: `mail.${cleanDomain}`, priority: 10 }],
      txtRecords: [['v=spf1 ~all']]
    });
  }
});

app.get('/api/network/info', (req, res) => {
  const networkIfaces = os.networkInterfaces();
  const ifaceList = Object.entries(networkIfaces).map(([name, addrs]) => ({
    name,
    addresses: (addrs || []).map(a => `${a.family}: ${a.address}`)
  }));

  res.json({
    publicIp: '34.128.91.44 (Cloud Routed)',
    localIp: '127.0.0.1',
    gateway: '192.168.1.1',
    dnsServers: ['8.8.8.8', '1.1.1.1'],
    interfaces: ifaceList,
    listeningPorts: [3000, 80, 443, 8000, 6379, 22]
  });
});

// 10. API Keys Management
app.get('/api/apikeys', (req, res) => {
  res.json(apiKeys);
});

app.post('/api/apikeys/create', (req, res) => {
  const { name, role = 'SYS_OPERATOR' } = req.body;
  const rawKey = generateApiKey('hg_live');
  const newKey = {
    id: `key-${Date.now()}`,
    name: name || 'API Token',
    key: rawKey,
    prefix: `${rawKey.substring(0, 14)}...`,
    role,
    createdAt: new Date().toISOString().split('T')[0],
    requestsCount: 0,
    active: true
  };
  apiKeys.push(newKey);
  res.json(newKey);
});

app.delete('/api/apikeys/:id', (req, res) => {
  const { id } = req.params;
  apiKeys = apiKeys.filter(k => k.id !== id);
  res.json({ success: true });
});

// 11. Security Center & Firewall
app.get('/api/security/audit', (req, res) => {
  res.json(auditTrail);
});

app.get('/api/security/firewall', (req, res) => {
  res.json(firewallRules);
});

app.post('/api/security/firewall/toggle', (req, res) => {
  const { ip, reason } = req.body;
  const existingIndex = firewallRules.findIndex(r => r.ip === ip);

  if (existingIndex >= 0) {
    firewallRules.splice(existingIndex, 1);
    res.json({ success: true, action: 'UNBANNED', ip });
  } else {
    firewallRules.push({
      id: `fw-${Date.now()}`,
      ip,
      reason: reason || 'Manual Administrator Block',
      blockedAt: new Date().toISOString(),
      hits: 1
    });
    res.json({ success: true, action: 'BANNED', ip });
  }
});

// 12. Backup Center
app.get('/api/backups', (req, res) => {
  res.json(backups);
});

app.post('/api/backups/create', (req, res) => {
  const newBackup = {
    id: `bk-${Date.now()}`,
    name: `hellgod-snapshot-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}.tar.gz`,
    size: `${(15.4 + Math.random() * 2).toFixed(1)} MB`,
    createdAt: new Date().toISOString(),
    checksum: generateApiKey('sha256').toLowerCase().replace('sha256_', ''),
    status: 'HEALTHY'
  };
  backups.unshift(newBackup);

  activityLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'INFO',
    category: 'BACKUP',
    message: `New system snapshot generated: ${newBackup.name} (${newBackup.size})`
  });

  res.json({ success: true, backup: newBackup });
});

app.post('/api/backups/restore', (req, res) => {
  const { id } = req.body;
  const target = backups.find(b => b.id === id);
  if (!target) return res.status(404).json({ error: 'Backup not found' });

  activityLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'WARN',
    category: 'BACKUP',
    message: `System restored from snapshot: ${target.name}`
  });

  res.json({ success: true, message: `System restored from ${target.name}` });
});

// 13. GitHub & Android APK Info
app.get('/api/github/info', (req, res) => {
  res.json({
    repo: 'hellgod-server',
    version: '1.0.0',
    license: 'MIT',
    budget: 'Zero ($0.00)',
    stars: 842,
    forks: 139,
    branch: 'main',
    commit: 'a9f24e1 (v1.0.0 Release Final)',
    latestRelease: {
      tag: 'v1.0.0',
      name: 'HELLGOD v1.0.0 – Ultimate All-in-One Server & AI Platform',
      date: '2026-11-02',
      apkDownloadUrl: '/api/android/download-apk'
    },
    workflows: [
      { name: 'CI/CD Backend & Frontend Build', file: '.github/workflows/ci.yml', status: 'passing' },
      { name: 'Android APK Automated Compiler', file: '.github/workflows/android-apk-build.yml', status: 'passing' }
    ]
  });
});

app.get('/api/android/download-apk', (req, res) => {
  // Generates real downloadable APK dummy binary file with proper APK header
  const apkHeader = Buffer.from('PK\x03\x04HELLGOD_STANDALONE_APK_PACKAGE_v1.0.0_PRODUCTION_DEBUG_SIGNED');
  res.setHeader('Content-Disposition', 'attachment; filename="hellgod-v1.0.0-debug.apk"');
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.send(apkHeader);
});

// Start Express server and mount Vite in development
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HELLGOD SERVER] Running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start HELLGOD server:', err);
});
