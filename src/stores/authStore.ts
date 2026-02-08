import { create } from "zustand";
import api from "@/services/api";
import { connectSocket, disconnectSocket } from "@/services/socket";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  sendCode: (email: string) => Promise<void>;
  signup: (email: string, code: string) => Promise<void>;
  signin: (email: string, code: string) => Promise<void>;
  githubLogin: (code: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("accessToken"),
  loading: false,

  setUser: (user) => set({ user }),

  sendCode: async (email: string) => {
    await api.post("/auth/send-code", { email });
  },

  signup: async (email: string, verificationCode: string) => {
    const { data } = await api.post("/auth/signup", {
      email,
      verificationCode,
    });
    localStorage.setItem("accessToken", data.accessToken);
    set({ token: data.accessToken, user: data.user });
    connectSocket(data.accessToken);
  },

  signin: async (email: string, verificationCode: string) => {
    const { data } = await api.post("/auth/signin", {
      email,
      verificationCode,
    });
    localStorage.setItem("accessToken", data.accessToken);
    set({ token: data.accessToken, user: data.user });
    connectSocket(data.accessToken);
  },

  githubLogin: async (code: string) => {
    const { data } = await api.post("/auth/github/callback", { code });
    localStorage.setItem("accessToken", data.accessToken);
    set({ token: data.accessToken, user: data.user });
    connectSocket(data.accessToken);
  },

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data, loading: false });
      const token = get().token;
      if (token) connectSocket(token);
    } catch {
      set({ user: null, token: null, loading: false });
      localStorage.removeItem("accessToken");
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const userId = get().user?.id;
    if (!userId) return;
    const { data } = await api.put(`/users/${userId}`, updates);
    set({ user: data });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    disconnectSocket();
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
