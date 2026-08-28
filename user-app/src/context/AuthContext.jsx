import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // RESTORE LOGIN SESSION
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("atlas_user");

    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Unable to restore user:",
        error
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("atlas_user");

      setUser(null);
    }

    setLoading(false);
  }, []);

  // =========================================================
  // LOGIN
  // =========================================================

  const login = async (email, password) => {
    try {
      /*
       * Clear any old authentication before login.
       *
       * This prevents an expired token from being
       * accidentally reused.
       */
      localStorage.removeItem("access_token");
      localStorage.removeItem("atlas_user");

      setUser(null);

      const formData = new URLSearchParams();

      formData.append(
        "username",
        email.trim()
      );

      formData.append(
        "password",
        password
      );

      const response = await api.post(
        "/employee/login",
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(
        "ATLAS LOGIN RESPONSE:",
        response.data
      );

      const accessToken =
        response.data?.access_token;

      if (!accessToken) {
        throw new Error(
          "No access token received from server."
        );
      }

      // =====================================================
      // SAVE TOKEN
      // =====================================================

      localStorage.setItem(
        "access_token",
        accessToken
      );

      // =====================================================
      // DECODE JWT
      // =====================================================

      let payload;

      try {
        const tokenParts =
          accessToken.split(".");

        if (tokenParts.length !== 3) {
          throw new Error(
            "Invalid JWT."
          );
        }

        const base64Payload =
          tokenParts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        /*
         * Handle missing base64 padding.
         */
        const paddedPayload =
          base64Payload +
          "=".repeat(
            (4 -
              (base64Payload.length % 4)) %
              4
          );

        payload = JSON.parse(
          atob(paddedPayload)
        );
      } catch (error) {
        console.error(
          "Unable to decode JWT:",
          error
        );

        localStorage.removeItem(
          "access_token"
        );

        throw new Error(
          "Invalid authentication token."
        );
      }

      console.log(
        "ATLAS JWT PAYLOAD:",
        payload
      );

      // =====================================================
      // CREATE USER OBJECT
      // =====================================================

      const userData = {
        email:
          payload.sub ||
          email.trim(),

        employee_id:
          payload.employee_id ??
          null,

        company_id:
          payload.company_id ??
          null,

        role:
          payload.role ??
          null,

        user_type:
          payload.user_type ||
          "employee",
      };

      // =====================================================
      // SAVE USER
      // =====================================================

      localStorage.setItem(
        "atlas_user",
        JSON.stringify(userData)
      );

      setUser(userData);

      return userData;
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "atlas_user"
      );

      setUser(null);

      throw error;
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    console.log(
      "ATLAS LOGOUT"
    );

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "atlas_user"
    );

    setUser(null);
  };

  // =========================================================
  // CONTEXT
  // =========================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ===========================================================
// useAuth
// ===========================================================

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;