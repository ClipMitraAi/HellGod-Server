/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { hasPermission, RateLimiter, generateApiKey } from './security';
import { isCommandAllowed, sanitizeFilePath, formatBytes, formatUptime } from './serverLogic';

test('Security: role-based permissions validation', () => {
  // ROOT_ADMIN has all permissions
  assert.equal(hasPermission('ROOT_ADMIN', 'any:crazy:permission'), true);
  assert.equal(hasPermission('ROOT_ADMIN', 'security:manage'), true);

  // SYS_OPERATOR has operational permissions, but not security:manage
  assert.equal(hasPermission('SYS_OPERATOR', 'services:restart'), true);
  assert.equal(hasPermission('SYS_OPERATOR', 'security:manage'), false);

  // AUDITOR only has read/audit permissions
  assert.equal(hasPermission('AUDITOR', 'system:view'), true);
  assert.equal(hasPermission('AUDITOR', 'services:restart'), false);
  assert.equal(hasPermission('AUDITOR', 'files:delete'), false);
});

test('Security: RateLimiter locks out after max failed attempts', () => {
  const limiter = new RateLimiter(3, 5000); // 3 attempts, 5 sec lock
  const testIp = '192.168.1.100';

  assert.equal(limiter.recordAttempt(testIp, false).allowed, true); // attempt 1
  assert.equal(limiter.recordAttempt(testIp, false).allowed, true); // attempt 2
  const third = limiter.recordAttempt(testIp, false); // attempt 3 -> lockout triggered
  assert.equal(third.allowed, false);
  assert.equal(limiter.isLocked(testIp), true);

  // Success resets limiter
  limiter.reset(testIp);
  assert.equal(limiter.isLocked(testIp), false);
  assert.equal(limiter.recordAttempt(testIp, true).allowed, true);
});

test('Security: generateApiKey produces valid format', () => {
  const key = generateApiKey('hg_test');
  assert.equal(key.startsWith('hg_test_'), true);
  assert.equal(key.length, 8 + 32);
});

test('ServerLogic: isCommandAllowed blocks dangerous shell commands', () => {
  assert.equal(isCommandAllowed('uptime'), true);
  assert.equal(isCommandAllowed('nginx -t'), true);
  assert.equal(isCommandAllowed('rm -rf /'), false);
  assert.equal(isCommandAllowed('cat /etc/shadow'), false);
  assert.equal(isCommandAllowed('uptime; rm -rf /'), false);
  assert.equal(isCommandAllowed('ping -c 3 127.0.0.1'), true);
});

test('ServerLogic: sanitizeFilePath prevents directory traversal', () => {
  assert.equal(sanitizeFilePath('configs/server.json'), 'configs/server.json');
  assert.equal(sanitizeFilePath('subdir/./file.txt'), 'subdir/file.txt');
  assert.equal(sanitizeFilePath('foo/bar/../file.txt'), 'foo/file.txt');

  // Traversal above root throws error
  assert.throws(() => sanitizeFilePath('../../etc/passwd'), /traversal attempt/);
  assert.throws(() => sanitizeFilePath('../../../root/.ssh/id_rsa'), /traversal attempt/);
});

test('ServerLogic: formatBytes and formatUptime output correct values', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1048576), '1 MB');
  assert.equal(formatBytes(1073741824), '1 GB');

  assert.equal(formatUptime(45), '00h 00m 45s');
  assert.equal(formatUptime(3665), '01h 01m 05s');
  assert.equal(formatUptime(90065), '1d 01h 01m 05s');
});
