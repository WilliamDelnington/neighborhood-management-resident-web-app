import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import createAppStore, { AppSlice } from "./appSlice";
import createAuthStore, { AuthSlice } from "./authSlice";
import createNotificationStore, {
    NotificationSlice,
} from "./notificationSlice";

type State = AppSlice & AuthSlice & NotificationSlice;

export const useStore = create<State>()(
    devtools(
        persist(
            (...a) => ({
                ...createAppStore(...a),
                ...createAuthStore(...a),
                ...createNotificationStore(...a),
            }),
            {
                name: "auth-storage",
                storage: createJSONStorage(() => localStorage),
                // Chi luu token/user - cac slice khac (thong bao, trang thai
                // UI tam thoi...) khong can va khong nen song sot qua lan
                // refresh trang.
                partialize: state => ({
                    token: state.token,
                    user: state.user,
                }),
                onRehydrateStorage: () => state => {
                    state?.setHasHydrated(true);
                },
            },
        ),
    ),
);
