import * as React from "react";
import type { ApiUser, LoginResponse } from "../api";

export type UserRole = "freelancer" | "client" | "admin";

type RoleContextValue = {
  role: UserRole;
  setRole: React.Dispatch<React.SetStateAction<UserRole>>;
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  accessToken: string | null;
  refreshToken: string | null;
  user: ApiUser | null;
  isAuthenticated: boolean;
  handleLoginSuccess: (login: LoginResponse) => void;
  logout: () => void;
};

const RoleContext = React.createContext<RoleContextValue | undefined>(
  undefined
);

const ACCESS_TOKEN_KEY = "fh_access_token";
const REFRESH_TOKEN_KEY = "fh_refresh_token";
const USER_KEY = "fh_user";

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = React.useState<UserRole>("freelancer");
  const [userName, setUserName] = React.useState("John Doe");

  const [accessToken, setAccessToken] = React.useState<string | null>(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  });
  const [refreshToken, setRefreshToken] = React.useState<string | null>(() => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  });
  const [user, setUser] = React.useState<ApiUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as ApiUser) : null;
    } catch {
      return null;
    }
  });

  // Keep derived role / userName in sync with stored user
  React.useEffect(() => {
    if (user) {
      setRole(user.user_type);
      setUserName(user.full_name || user.username || user.email || "User");
    }
  }, [user]);

  const handleLoginSuccess = React.useCallback((login: LoginResponse) => {
    const { access_token, refresh_token, user } = login;

    setAccessToken(access_token);
    setRefreshToken(refresh_token);
    setUser(user);

    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setRole(user.user_type);
    setUserName(user.full_name || user.username || user.email || "User");
  }, []);

  const logout = React.useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setRole("freelancer");
    setUserName("John Doe");

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const value = React.useMemo<RoleContextValue>(
    () => ({
      role,
      setRole,
      userName,
      setUserName,
      accessToken,
      refreshToken,
      user,
      isAuthenticated: !!accessToken && !!user,
      handleLoginSuccess,
      logout,
    }),
    [
      role,
      userName,
      accessToken,
      refreshToken,
      user,
      handleLoginSuccess,
      logout,
    ]
  );

  return (
    <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = React.useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};

