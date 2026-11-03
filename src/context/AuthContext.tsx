/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRoleQuick: (role: 'ROOT_ADMIN' | 'SYS_OPERATOR' | 'AUDITOR') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('hellgod_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default authenticated Root Admin session for seamless immediate interaction
    return {
      username: 'HellGod',
      role: 'ROOT_ADMIN',
      token: 'hg_jwt_HellGod_session_token_live',
      permissions: ['*']
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('hellgod_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('hellgod_session');
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const session: UserSession = {
          username: data.user.username,
          role: data.user.role,
          token: data.token,
          permissions: data.user.permissions
        };
        setUser(session);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Authentication rejected' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRoleQuick = (role: 'ROOT_ADMIN' | 'SYS_OPERATOR' | 'AUDITOR') => {
    if (!user) return;
    setUser({
      ...user,
      role,
      permissions: role === 'ROOT_ADMIN' ? ['*'] : (role === 'SYS_OPERATOR' ? ['read', 'write', 'services'] : ['read'])
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRoleQuick }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
