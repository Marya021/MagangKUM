import { create } from "zustand";

const MAX_NOTIFICATIONS = 50;
const DUPLICATE_WINDOW_MS = 3000;

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "info" | "success" | "error" | "warning";
  read: boolean;
  createdAt: Date;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) =>
    set((state) => {
      const now = new Date();
      const hasRecentDuplicate = state.notifications.some(
        (existing) =>
          existing.title === n.title &&
          existing.description === n.description &&
          existing.type === n.type &&
          now.getTime() - existing.createdAt.getTime() < DUPLICATE_WINDOW_MS,
      );

      if (hasRecentDuplicate) {
        return state;
      }

      const notification: Notification = {
        ...n,
        id: crypto.randomUUID(),
        read: false,
        createdAt: now,
      };

      return {
        notifications: [notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS),
        unreadCount: state.unreadCount + 1,
      };
    }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - (state.notifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
