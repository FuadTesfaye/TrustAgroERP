import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { hasAnyRole, hasAllRoles, hasRole, parseUserRoles, ROLES } from '../utils/rbac';
import axios from 'axios';
import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8081',
  realm: 'trust-agro',
  clientId: 'frontend-client',
};

export const keycloak = new Keycloak(keycloakConfig);

interface AuthContextType {
  user: any;
  userRoles: string[];
  loading: boolean;
  setAuthData: (userData: any, token: string) => void;
  logout: () => void;
  loginWithKeycloak: () => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [keycloakInitialized, setKeycloakInitialized] = useState(false);

  const userRoles = parseUserRoles(user);

  // Set up axios interceptor to inject the in-memory token
  useEffect(() => {
    const interceptorId = axios.interceptors.request.use(async (config) => {
      let activeToken = token;
      
      // Update Keycloak token if needed
      if (keycloak.authenticated && keycloak.token) {
          try {
              await keycloak.updateToken(30);
              activeToken = keycloak.token;
          } catch (error) {
              console.error('Failed to refresh token', error);
          }
      }

      if (activeToken && config.headers) {
        config.headers.Authorization = `Bearer ${activeToken}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, [token, keycloakInitialized]);

  useEffect(() => {
    keycloak.init({ onLoad: 'check-sso', silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html' })
      .then((authenticated) => {
        setKeycloakInitialized(true);
        if (authenticated && keycloak.token) {
          setToken(keycloak.token);
          // Fetch user details from Keycloak or backend
          keycloak.loadUserProfile().then(profile => {
             setUser({
                 id: keycloak.subject,
                 name: profile.firstName + ' ' + profile.lastName,
                 email: profile.email,
                 role: keycloak.realmAccess?.roles?.find(r => r.startsWith('ROLE_'))?.replace('ROLE_', '') || 'USER'
             });
          });
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // We would ideally call an endpoint to refresh token from httpOnly cookie here
    // For now, if no token, we just finish loading (user is logged out)
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then((res) => setUser(res.data.data))
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const setAuthData = (userData: any, newToken: string) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    if (keycloak.authenticated) {
        keycloak.logout();
    } else {
        setToken(null);
        setUser(null);
    }
  };

  const loginWithKeycloak = () => {
      keycloak.login();
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
    loginWithKeycloak,
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
