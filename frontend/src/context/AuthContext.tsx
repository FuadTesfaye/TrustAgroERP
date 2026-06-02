import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '../api/authApi';
import api from '../api/axios';
import { hasAnyRole, hasAllRoles, hasRole, parseUserRoles, ROLES } from '../utils/rbac';

interface AuthContextType {
  user: any;
  userRoles: string[];
  loading: boolean;
  setAuthData: (userData: any, token: string) => void;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
  hasAnyRole: (...roles: string[]) => boolean;
  hasAllRoles: (...roles: string[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  canAccess: (moduleKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const userRoles = parseUserRoles(user);

  useEffect(() => {
    // If token exists, fetch user details to verify it
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.me()
      .then((res) => {
        setUser(res.data.data);
      })
      .catch(() => {
        // If me() fails (token expired/invalid), clear everything
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const setAuthData = (userData: any, newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const hasRoleLegacy = useCallback((...roles: string[]) => {
    return hasAnyRole(userRoles, roles);
  }, [userRoles]);

  const hasAnyRoleCheck = useCallback((...roles: string[]) => {
    return hasAnyRole(userRoles, roles);
  }, [userRoles]);

  const hasAllRolesCheck = useCallback((...roles: string[]) => {
    return hasAllRoles(userRoles, roles);
  }, [userRoles]);

  const isAdmin = useCallback(() => {
    return hasRole(userRoles, ROLES.ADMIN);
  }, [userRoles]);

  const isManager = useCallback(() => {
    const managerRoles = [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER];
    return hasAnyRole(userRoles, managerRoles);
  }, [userRoles]);

  const canAccess = useCallback((moduleKey: string) => {
    const moduleRoles: Record<string, string[]> = {
      users: [ROLES.ADMIN],
      farms: [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER],
      flocks: [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER],
      'daily-records': [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER],
      inventory: [ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER],
      veterinary: [ROLES.ADMIN, ROLES.VETERINARY_OFFICER, ROLES.VET, ROLES.FARM_MANAGER],
      pharmacy: [ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.GENERAL_MANAGER],
      finance: [ROLES.ADMIN, ROLES.FINANCE_OFFICER, ROLES.GENERAL_MANAGER],
      crm: [ROLES.ADMIN, ROLES.EXTENSION_WORKER, ROLES.OPERATIONS_MANAGER],
      reports: [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER],
      settings: [], // All users
      dashboard: [], // All users
    };
    const allowedRoles = moduleRoles[moduleKey];
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return hasAnyRole(userRoles, allowedRoles);
  }, [userRoles]);

  const value = {
    user,
    userRoles,
    loading,
    setAuthData,
    logout,
    hasRole: hasRoleLegacy,
    hasAnyRole: hasAnyRoleCheck,
    hasAllRoles: hasAllRolesCheck,
    isAdmin,
    isManager,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
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
