import { create } from "zustand";
import api from "@/services/api";
import type { Card, Task } from "@/types";

interface TaskState {
  cards: Card[];
  tasks: Task[];
  loading: boolean;
  fetchCards: (boardId: string) => Promise<void>;
  createCard: (
    boardId: string,
    name: string,
    description: string,
  ) => Promise<Card>;
  updateCard: (
    boardId: string,
    cardId: string,
    data: Partial<Card>,
  ) => Promise<void>;
  deleteCard: (boardId: string, cardId: string) => Promise<void>;
  fetchTasks: (boardId: string, cardId: string) => Promise<void>;
  fetchAllBoardTasks: (boardId: string) => Promise<void>;
  createTask: (
    boardId: string,
    cardId: string,
    data: Partial<Task>,
  ) => Promise<Task>;
  updateTask: (
    boardId: string,
    cardId: string,
    taskId: string,
    data: Partial<Task>,
  ) => Promise<void>;
  deleteTask: (
    boardId: string,
    cardId: string,
    taskId: string,
  ) => Promise<void>;
  moveTask: (taskId: string, newStatus: string) => void;
  assignMember: (
    boardId: string,
    cardId: string,
    taskId: string,
    memberId: string,
  ) => Promise<void>;
  removeMember: (
    boardId: string,
    cardId: string,
    taskId: string,
    memberId: string,
  ) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
}

const useTaskStore = create<TaskState>((set, get) => ({
  cards: [],
  tasks: [],
  loading: false,

  fetchCards: async (boardId: string) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/boards/${boardId}/cards`);
      set({ cards: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createCard: async (boardId: string, name: string, description: string) => {
    const { data } = await api.post(`/boards/${boardId}/cards`, {
      name,
      description,
    });
    set({ cards: [...get().cards, data] });
    return data;
  },

  updateCard: async (
    boardId: string,
    cardId: string,
    updates: Partial<Card>,
  ) => {
    const { data } = await api.put(
      `/boards/${boardId}/cards/${cardId}`,
      updates,
    );
    set({ cards: get().cards.map((c) => (c.id === cardId ? data : c)) });
  },

  deleteCard: async (boardId: string, cardId: string) => {
    await api.delete(`/boards/${boardId}/cards/${cardId}`);
    set({
      cards: get().cards.filter((c) => c.id !== cardId),
      tasks: get().tasks.filter((t) => t.cardId !== cardId),
    });
  },

  fetchTasks: async (boardId: string, cardId: string) => {
    const { data } = await api.get(`/boards/${boardId}/cards/${cardId}/tasks`);
    const existing = get().tasks.filter((t) => t.cardId !== cardId);
    set({ tasks: [...existing, ...data] });
  },

  fetchAllBoardTasks: async (boardId: string) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/boards/${boardId}/tasks`);
      set({ tasks: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createTask: async (
    boardId: string,
    cardId: string,
    taskData: Partial<Task>,
  ) => {
    const { data } = await api.post(
      `/boards/${boardId}/cards/${cardId}/tasks`,
      taskData,
    );
    set({ tasks: [...get().tasks, data] });
    return data;
  },

  updateTask: async (
    boardId: string,
    cardId: string,
    taskId: string,
    updates: Partial<Task>,
  ) => {
    const { data } = await api.put(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}`,
      updates,
    );
    set({ tasks: get().tasks.map((t) => (t.id === taskId ? data : t)) });
  },

  deleteTask: async (boardId: string, cardId: string, taskId: string) => {
    await api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`);
    set({ tasks: get().tasks.filter((t) => t.id !== taskId) });
  },

  moveTask: (taskId: string, newStatus: string) => {
    set({
      tasks: get().tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus as Task["status"] } : t,
      ),
    });
  },

  assignMember: async (
    boardId: string,
    cardId: string,
    taskId: string,
    memberId: string,
  ) => {
    await api.post(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}/assign`,
      { memberId },
    );
    set({
      tasks: get().tasks.map((t) =>
        t.id === taskId
          ? { ...t, assignees: [...(t.assignees || []), memberId] }
          : t,
      ),
    });
  },

  removeMember: async (
    boardId: string,
    cardId: string,
    taskId: string,
    memberId: string,
  ) => {
    await api.delete(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}/assign/${memberId}`,
    );
    set({
      tasks: get().tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assignees: (t.assignees || []).filter((a) => a !== memberId),
            }
          : t,
      ),
    });
  },

  setTasks: (tasks: Task[]) => set({ tasks }),
}));

export default useTaskStore;
