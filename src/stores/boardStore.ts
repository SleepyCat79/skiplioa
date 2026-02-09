import { create } from "zustand";
import api from "@/services/api";
import type { Board, Invitation } from "@/types";

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  invitations: Invitation[];
  loading: boolean;
  fetchBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (name: string, description: string) => Promise<Board>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  inviteMember: (boardId: string, email: string) => Promise<void>;
  fetchInvitations: () => Promise<void>;
  respondInvitation: (
    inviteId: string,
    boardId: string,
    status: "accepted" | "declined",
  ) => Promise<void>;
}

const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  invitations: [],
  loading: false,

  fetchBoards: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/boards");
      set({ boards: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchBoard: async (id: string) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/boards/${id}`);
      set({ currentBoard: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createBoard: async (name: string, description: string) => {
    const { data } = await api.post("/boards", { name, description });
    set({ boards: [...get().boards, data] });
    return data;
  },

  updateBoard: async (id: string, updates: Partial<Board>) => {
    const { data } = await api.put(`/boards/${id}`, updates);
    set({
      boards: get().boards.map((b) => (b.id === id ? data : b)),
      currentBoard: get().currentBoard?.id === id ? data : get().currentBoard,
    });
  },

  deleteBoard: async (id: string) => {
    await api.delete(`/boards/${id}`);
    set({ boards: get().boards.filter((b) => b.id !== id) });
  },

  inviteMember: async (boardId: string, email: string) => {
    await api.post(`/boards/${boardId}/invite`, { emailMember: email });
  },

  fetchInvitations: async () => {
    try {
      const { data } = await api.get("/invitations");
      set({ invitations: data });
    } catch {}
  },

  respondInvitation: async (
    inviteId: string,
    boardId: string,
    status: "accepted" | "declined",
  ) => {
    await api.post(`/boards/${boardId}/invite/respond`, { inviteId, status });
    set({
      invitations: get().invitations.filter((i) => i.inviteId !== inviteId),
    });
    if (status === "accepted") {
      await get().fetchBoards();
    }
  },
}));

export default useBoardStore;
