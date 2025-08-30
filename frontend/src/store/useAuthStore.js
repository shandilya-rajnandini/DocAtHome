import { create } from "zustand";
import { getMe } from "../api";

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  checkUser: async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const { data } = await getMe();
        set({ user: data });
      } catch (error) {
        console.log(`Auth check Failed ${error}`);
        localStorage.removeItem("token");
        set({ user: null });
      }
    }
    set({ loading: false });
  },

  login: (userData) => set({ user: userData }),
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
  },
}));

export default useAuthStore;
