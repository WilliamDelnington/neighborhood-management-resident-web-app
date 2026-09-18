import { API } from "@constants/common";
import { request } from "./request";

// Ca 3 ham nay deu public (man "Quen mat khau" o LoginPage, nguoi dung chua
// dang nhap duoc) - luon useAuth:false du chua co token trong store.

export const createPasswordResetRequest = (phone: string): Promise<null> =>
    request<null>(
        "POST",
        API.PASSWORD_RESET_REQUESTS,
        { phone },
        { useAuth: false },
    );

export type PasswordResetCheckState = "none" | "pending" | "ready";

export const checkPasswordResetRequest = (
    phone: string,
): Promise<{ state: PasswordResetCheckState }> =>
    request<{ state: PasswordResetCheckState }>(
        "POST",
        API.PASSWORD_RESET_REQUESTS_CHECK,
        { phone },
        { useAuth: false },
    );

export const revealPasswordResetRequest = (
    phone: string,
): Promise<{ password: string }> =>
    request<{ password: string }>(
        "POST",
        API.PASSWORD_RESET_REQUESTS_REVEAL,
        { phone },
        { useAuth: false },
    );
