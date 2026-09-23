import React, { useEffect } from "react";
import { useStore } from "@store";

/**
 * Sau khi zustand persist rehydrate xong token/user tu localStorage, goi lai
 * refreshMe() de xac nhan token do phia server van con hop le va lam moi
 * thong tin user - neu token da bi thu hoi/het han, request.ts se tu xoa no
 * (xem request.ts, xu ly 401) va RequireAuth se dieu huong ve /login binh
 * thuong.
 */
const AuthBootstrap: React.FC = () => {
    const [hasHydrated, token, refreshMe] = useStore(state => [
        state.hasHydrated,
        state.token,
        state.refreshMe,
    ]);

    useEffect(() => {
        if (hasHydrated && token) {
            refreshMe();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasHydrated, token]);

    return null;
};

export default AuthBootstrap;
