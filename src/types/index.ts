/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NavigationTab = 
  | 'dashboard' 
  | 'ai' 
  | 'services' 
  | 'files' 
  | 'security' 
  | 'database' 
  | 'api' 
  | 'network' 
  | 'backup' 
  | 'github' 
  | 'android' 
  | 'docs';

export interface SystemMetrics {
  hostname: string;
  platform: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  cpu: {
    model: string;
    cores: number;
    usagePercent: number;
    loadAverages: number[];
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    totalFormatted: string;
    usedFormatted: string;
    freeFormatted: string;
    usagePercent: number;
  };
  disk: {
    totalFormatted: string;
    usedFormatted: string;
    freeFormatted: string;
    usagePercent: number;
  };
  network: {
    rxSpeed: string;
    txSpeed: string;
    totalPackets: number;
  };
}

export interface ServiceItem {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'restarting';
  cpu: number;
  memory: number;
  port: number;
  description: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  category: 'SYSTEM' | 'SERVICES' | 'AUTH' | 'STORAGE' | 'SECURITY' | 'AI' | 'BACKUP' | 'NETWORK';
  message: string;
}

export interface AuditItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ip: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FAILED';
}

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  sizeFormatted: string;
  modifiedAt: string;
  permissions: string;
}

export interface DbTable {
  name: string;
  columns: string[];
  rowCount: number;
  schema: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  prefix: string;
  role: string;
  createdAt: string;
  requestsCount: number;
  active: boolean;
}

export interface BackupItem {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  checksum: string;
  status: string;
}

export interface FirewallRule {
  id: string;
  ip: string;
  reason: string;
  blockedAt: string;
  hits: number;
}

export interface UserSession {
  username: string;
  role: 'ROOT_ADMIN' | 'SYS_OPERATOR' | 'AUDITOR';
  token: string;
  permissions: string[];
}
