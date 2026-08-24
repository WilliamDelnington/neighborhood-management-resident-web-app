import { API } from "@constants/common";
import { User } from "@dts";
import { request } from "./request";

export interface LoginWithZaloParams {
    accessToken: string;
    zaloUserId: string;
    name?: string;
    avatarUrl?: string;
    phoneToken?: string;
    phone?: string;
}

export interface LoginWithZaloResponse {
    token: string;
    user: User;
}

export const loginWithZalo = (
    params: LoginWithZaloParams,
): Promise<LoginWithZaloResponse> =>
    request<LoginWithZaloResponse>("POST", API.AUTH_ZALO_LOGIN, params, {
        useAuth: false,
    });

export const fetchMe = (): Promise<User> => request<User>("GET", API.AUTH_ME);

export interface PhoneRegisterParams {
    phone: string;
    password: string;
    displayName: string;
}

export const registerWithPhone = (
    params: PhoneRegisterParams,
): Promise<LoginWithZaloResponse> =>
    request<LoginWithZaloResponse>("POST", API.AUTH_REGISTER, params, {
        useAuth: false,
    });

export interface PhoneLoginParams {
    phone: string;
    password: string;
}

export const loginWithPhone = (
    params: PhoneLoginParams,
): Promise<LoginWithZaloResponse> =>
    request<LoginWithZaloResponse>("POST", API.AUTH_LOGIN, params, {
        useAuth: false,
    });

// Khong con purpose (login/register) - server tu quyet dinh dua vao viec so
// dien thoai da co tai khoan hay chua (xem docstring requestOtp o backend).
export const requestOtp = (phone: string): Promise<null> =>
    request<null>(
        "POST",
        API.AUTH_OTP_REQUEST,
        { phone },
        {
            useAuth: false,
        },
    );

export interface OtpVerifyParams {
    phone: string;
    code: string;
    displayName?: string;
}

export const verifyOtp = (
    params: OtpVerifyParams,
): Promise<LoginWithZaloResponse> =>
    request<LoginWithZaloResponse>("POST", API.AUTH_OTP_VERIFY, params, {
        useAuth: false,
    });

export const setPassword = (
    password: string,
    currentPassword?: string,
): Promise<User> =>
    request<User>("POST", API.AUTH_SET_PASSWORD, {
        password,
        currentPassword,
    });

// displayName KHONG con o day - tu "danh tinh", chi sua duoc qua ChangeRequest
// (xem changeRequestApi.ts) - email duoc them vao vi truoc gio ton tai tren
// User nhung chua tung sua duoc qua man tu-cap-nhat nay. phone CUNG KHONG con
// o day (la thong tin dang nhap, doi qua changePhone o duoi, xac thuc lai qua
// Zalo - xem changePhoneSchema o backend).
export interface UpdateProfileParams {
    email?: string;
    address?: string;
    householdId?: string;
    notificationPermission?: boolean;
}

export const updateMyProfile = (params: UpdateProfileParams): Promise<User> =>
    request<User>("PATCH", API.AUTH_ME, params);

/**
 * Doi so dien thoai dang nhap - can accessToken/phoneToken xac thuc lai qua
 * Zalo o backend (xem changeOwnPhone). Khong con UI goi ham nay o ban web
 * (chi kha dung tren Zalo Mini App, xem plan chuyen doi web) - giu lai binding
 * nay phong khi can bat lai.
 */
export const changePhone = (
    accessToken: string,
    phoneToken?: string,
): Promise<User> =>
    request<User>("POST", API.AUTH_CHANGE_PHONE, { accessToken, phoneToken });

export const logout = (): Promise<null> =>
    request<null>("POST", API.AUTH_LOGOUT);
