/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Pure security utility functions (decoupled from UI)

export interface UserRole {
  name: 'ROOT_ADMIN' | 'SYS_OPERATOR' | 'AUDITOR';
  permissions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole['name'], string[]> = {
  ROOT_ADMIN: [
    'system:view',
    'system:control',
    'services:restart',
    'services:stop',
    'files:read',
    'files:write',
    'files:delete',
    'database:query',
    'database:modify',
    'database:backup',
    'security:manage',
    'apikeys:manage',
    'ai:chat',
    'network:diagnose'
  ],
  SYS_OPERATOR: [
    'system:view',
    'system:control',
    'services:restart',
    'files:read',
    'files:write',
    'database:query',
    'database:backup',
    'ai:chat',
    'network:diagnose'
  ],
  AUDITOR: [
    'system:view',
    'files:read',
    'database:query',
    'security:audit',
    'ai:chat'
  ]
};

/**
 * Check if a role is authorized for a specific permission
 */
export function hasPermission(role: UserRole['name'], requiredPermission: string): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  if (role === 'ROOT_ADMIN') return true;
  return allowed.includes(requiredPermission);
}

/**
 * Rate Limiter Tracking Class for brute-force prevention
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; lockedUntil: number }> = new Map();
  private maxAttempts: number;
  private lockoutDurationMs: number;

  constructor(maxAttempts: number = 5, lockoutDurationMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.lockoutDurationMs = lockoutDurationMs;
  }

  public recordAttempt(ip: string, success: boolean): { allowed: boolean; remaining: number; lockedUntil?: number } {
    const now = Date.now();
    const record = this.attempts.get(ip) || { count: 0, lockedUntil: 0 };

    if (record.lockedUntil > now) {
      return { allowed: false, remaining: 0, lockedUntil: record.lockedUntil };
    }

    if (success) {
      this.attempts.delete(ip);
      return { allowed: true, remaining: this.maxAttempts };
    }

    record.count += 1;
    if (record.count >= this.maxAttempts) {
      record.lockedUntil = now + this.lockoutDurationMs;
      this.attempts.set(ip, record);
      return { allowed: false, remaining: 0, lockedUntil: record.lockedUntil };
    }

    this.attempts.set(ip, record);
    return { allowed: true, remaining: this.maxAttempts - record.count };
  }

  public isLocked(ip: string): boolean {
    const record = this.attempts.get(ip);
    if (!record) return false;
    return record.lockedUntil > Date.now();
  }

  public reset(ip: string): void {
    this.attempts.delete(ip);
  }
}

/**
 * Basic cryptographic token generation (simple format for demo & session)
 */
export function generateApiKey(prefix = 'hg_live'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${token}`;
}
