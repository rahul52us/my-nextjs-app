// stores/authStore.ts
import { makeAutoObservable } from "mobx";
import axios from "axios";
import stores from "../stores";
import CryptoJS from "crypto-js";
import { AUTH_TOKEN, BACKEND_URL, ENCRYPT_SECRET_KEY, USER_SESSION_DATA } from "../../config/utils/variables";

interface Notification {
  title?: any;
  message: string;
  type?: any;
  placement?: string;
  action?: any;
  duration?: number;
}

class AuthStore {
  user: any = null;
  token: string | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  notification: Notification | null = null;
  company: any = "65f65a70fbe7ae65d05dac64";
  private tokenKey = AUTH_TOKEN || "auth_token";

  private setAuthCookie = (token: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${this.tokenKey}=${encodeURIComponent(token)}; path=/; max-age=2592000; samesite=lax`;
  };

  private clearAuthCookie = () => {
    if (typeof document === "undefined") return;
    document.cookie = `${this.tokenKey}=; path=/; max-age=0; samesite=lax`;
  };

  constructor() {
    makeAutoObservable(this);
    axios.defaults.baseURL = BACKEND_URL || "";
    // 15s timeout — prevents requests from hanging forever (was 0 = infinite)
    axios.defaults.timeout = 15000;
    axios.defaults.headers["Content-Type"] = "application/json";

    // Attach token automatically for all requests
    axios.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem(this.tokenKey);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          this.logout(); // Logout on 401
        }
        return Promise.reject(error);
      }
    );

    if (typeof window !== "undefined") {
      this.initializeUser();
    }
  }

  // Initialize User Session — uses session cache to avoid network call on every page load
  initializeUser = async () => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem(this.tokenKey);
      if (savedToken) {
        this.token = savedToken;
        // Try session storage cache first — instant, no network
        const cachedUser = this.getUserFromSessionStorage();
        if (cachedUser) {
          this.user = cachedUser;
        } else {
          // Fallback to network only if no cache
          await this.fetchUser();
        }
      }
    }
  };

  openNotification = (data: {
    title: any;
    message: string;
    type?: string;
    placement?: string;
    action?: any;
    duration?: number;
  }) => {
    this.notification = {
      title: data.title,
      message: data.message,
      type: data.type ? data.type : "success",
      placement: data.placement ? data.placement : "bottom",
      action: data.action ? data.action : null,
    };
  };

  closeNotication = () => {
    this.notification = null;
  };

  // Register user
  register = async (payload: { name: string; email: string; password: string }) => {
    this.isLoading = true;
    try {
      const response = await axios.post("/auth/register", payload);
      this.token = response?.data?.data?.authorization_token;

      if (this.token && typeof window !== "undefined") {
        localStorage.setItem(this.tokenKey, this.token!);
        this.setAuthCookie(this.token!);
      }

      // Use user data from register response directly if available
      const userData = response?.data?.data?.user;
      if (userData) {
        this.user = userData;
        this.saveUserToSessionStorage(userData);
      } else {
        await this.fetchUser();
      }

      return response?.data;
    } catch (err: any) {
      this.error = err?.response?.data?.message || "Registration failed.";
      throw err;
    } finally {
      this.isLoading = false;
    }
  };

  restoreUser = () => {
    try {
      const authorization_token = AUTH_TOKEN;
      if (authorization_token) {
        const storedData = sessionStorage.getItem(USER_SESSION_DATA!);
        if (storedData) {
          return this.getUserFromSessionStorage();
        } else {
          this.doLogout();
          return false;
        }
      } else {
        this.doLogout();
        return false;
      }
    } catch ({}: any) {
      this.user = null;
      this.doLogout();
    }
  };

  doLogout = () => {
    this.user = null;
    this.clearLocalStorage();
  };

  clearLocalStorage = () => {
    localStorage.removeItem(this.tokenKey);
    this.clearAuthCookie();
    sessionStorage.removeItem(USER_SESSION_DATA!);
  };

  // Login user — optimized: uses user data from login response, no extra /auth/me call
  login = async (payload: any) => {
    this.isLoading = true;
    try {
      const response = await axios.post("/auth/login", payload);
      this.token = response?.data?.data?.authorization_token;

      if (this.token && typeof window !== "undefined") {
        localStorage.setItem(this.tokenKey, this.token);
        this.setAuthCookie(this.token);
      }

      // Use user data from login response directly — no extra /auth/me round-trip needed
      const userData = response?.data?.data?.user;
      if (userData) {
        this.user = userData;
        this.saveUserToSessionStorage(userData);
      } else {
        await this.fetchUser();
      }

      return response?.data;
    } catch (err: any) {
      this.error = err?.response?.data?.message || "Login failed.";
      throw err;
    } finally {
      this.isLoading = false;
    }
  };

  uploadFile = async (sendData: any) => {
    try {
      const { data } = await axios.post("/file/upload", { ...sendData, company: stores.auth.company });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  saveUserToSessionStorage(user: any) {
    if (typeof window !== "undefined" && user) {
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(user),
        ENCRYPT_SECRET_KEY!
      ).toString();
      sessionStorage.setItem(USER_SESSION_DATA!, encryptedData);
    }
  }

  // Fetch User Info (used as fallback when session cache is empty)
  fetchUser = async () => {
    if (!this.token) return;

    try {
      const response = await axios.post(
        "/auth/me",
        {},
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      this.user = response.data?.data;
      this.saveUserToSessionStorage(this.user);
    } catch (err: any) {
      this.error = err?.response?.data?.message || "Failed to fetch user info.";
    }
  };

  getUserFromSessionStorage() {
    if (typeof window === "undefined") return false;

    const storedData = sessionStorage.getItem(USER_SESSION_DATA!);
    if (!storedData) return false;

    try {
      const decryptedBytes = CryptoJS.AES.decrypt(storedData, ENCRYPT_SECRET_KEY!);
      const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
      return decryptedData ? JSON.parse(decryptedData) : false;
    } catch ({}: any) {
      return false;
    }
  }

  // Logout user
  logout = () => {
    this.token = null;
    this.user = null;
    this.error = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
      this.clearAuthCookie();
      sessionStorage.removeItem(USER_SESSION_DATA!);
    }
  };
}

export const authStore = new AuthStore();
