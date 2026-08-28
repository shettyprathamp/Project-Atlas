
import axios from "axios";

const api = axios.create({
  baseURL: "https://project-atlas-backend-qxpb.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    console.log(
      "ATLAS API REQUEST:",
      config.method?.toUpperCase(),
      config.url
    );

    /*
     * IMPORTANT:
     * Login must NOT receive an old access token.
     */
    const isLoginRequest =
      config.url === "/employee/login";

    if (isLoginRequest) {
      console.log("ATLAS TOKEN: SKIPPED FOR LOGIN");
      return config;
    }

    console.log(
      "ATLAS TOKEN:",
      token ? "TOKEN FOUND" : "NO TOKEN"
    );

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "ATLAS API ERROR:",
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401) {
      console.warn(
        "Authentication failed. Token may be expired or invalid."
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("atlas_user");
    }

    return Promise.reject(error);
  }
);

export default api;