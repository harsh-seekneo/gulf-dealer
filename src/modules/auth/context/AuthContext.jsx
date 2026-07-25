import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUserApi,
  logoutUserApi,
  refreshTokenApi,
} from "../api/authApi";
import { getDealerStatusApi } from "../../dealer/api/dealerApi";
import { isDealerUser } from "../utils/dealerAccess";
import { removeAccessToken } from "../../../utils/tokenStorage";
import { AuthContext } from "./authContextCore";

const SESSION_CHECK_INTERVAL_MS = 15000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dealerStatus, setDealerStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDealerStatus = useCallback(async () => {
    try {
      const result = await getDealerStatusApi();
      const status = result.status || result.dealer?.status || null;

      setDealerStatus(status);
      return status;
    } catch {
      setDealerStatus(null);
      return null;
    }
  }, []);

  const clearSession = useCallback(() => {
    removeAccessToken();
    setUser(null);
    setDealerStatus(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await refreshTokenApi();

    const currentUser = await getCurrentUserApi();
    const status = await loadDealerStatus();

    setUser(currentUser || null);

    return {
      user: currentUser || null,
      dealerStatus: status,
    };
  }, [loadDealerStatus]);

  const logout = useCallback(async () => {
    try {
      await logoutUserApi();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async ({ showLoader = false } = {}) => {
      try {
        if (showLoader && isMounted) {
          setIsLoading(true);
        }

        const session = await refreshUser();
        if (isMounted) {
          setUser(session.user || null);
          setDealerStatus(session.dealerStatus || null);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        validateSession();
      }
    };

    const handleFocus = () => {
      validateSession();
    };

    validateSession({ showLoader: true });
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const sessionInterval = window.setInterval(
      () => validateSession(),
      SESSION_CHECK_INTERVAL_MS,
    );

    return () => {
      isMounted = false;
      window.clearInterval(sessionInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearSession, refreshUser]);

  const value = useMemo(
    () => ({
      user,
      dealerStatus,
      isAuthenticated: Boolean(user),
      isDealer: isDealerUser(user, dealerStatus),
      isLoading,
      logout,
      refreshUser,
    }),
    [dealerStatus, isLoading, logout, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
