import { User } from "@dts";
import { StateCreator } from "zustand";
import {
    loginWithZalo,
    loginWithPhone,
    registerWithPhone,
    requestOtp as requestOtpApi,
    verifyOtp as verifyOtpApi,
    fetchMe,
} from "@service/authApi";

export interface AuthSlice {
    token?: string;
    user?: User;
    bootstrapping: boolean;
    bootstrapError?: string;
    /**
     * Dem tang dan moi khi mot luot dang nhap moi bat dau (loginAsTestUser,
     * loginWithPhone, registerWithPhone, verifyOtp). Dung de dam bao luot
     * dang nhap duoc khoi tao SAU CUNG luon la luot duoc ap dung vao store -
     * tranh truong hop mot luot cham hon tra ve sau va de len ket qua cua
     * luot nguoi dung vua bam sau do.
     */
    loginSeq: number;
    setToken: (token?: string) => void;
    setUser: (user?: User) => void;
    /**
     * Chi dung khi dev (xem LoginPage - khoi "tai khoan thu nghiem"). Dang nhap thang bang mot
     * zaloUserId tuy chon, bo qua zmp-sdk. Chi hoat dong khi backend dang ZALO_ENV=sandbox (tin
     * tuong zaloUserId tu client) - can de test nhanh cac vai tro ma khong can nhieu tai khoan
     * Zalo that (moi tai khoan Zalo la duy nhat nen khong the dung 1 tai khoan cho nhieu vai tro).
     */
    loginAsTestUser: (zaloUserId: string, name?: string) => Promise<void>;
    /**
     * Dang nhap bang so dien thoai + mat khau, kenh doc lap voi Zalo.
     */
    loginWithPhone: (phone: string, password: string) => Promise<void>;
    /**
     * Dang ky tai khoan moi bang so dien thoai + mat khau va dang nhap luon.
     */
    registerWithPhone: (
        phone: string,
        password: string,
        displayName: string,
    ) => Promise<void>;
    /**
     * Xin gui ma OTP toi so dien thoai - kenh dang nhap khong mat khau, dung
     * cho ban web (khong co Zalo). Khong con purpose: server tu quyet dinh
     * dang nhap hay dang ky dua vao viec so da co tai khoan hay chua.
     */
    requestOtp: (phone: string) => Promise<void>;
    /**
     * Xac thuc ma OTP roi dang nhap/dang ky luon (gop trong mot buoc, giong
     * verifyOtpAndAuthenticate ben backend). displayName chi duoc dung neu
     * day la lan dau (tao tai khoan moi) - bi backend bo qua neu dang nhap.
     */
    verifyOtp: (
        phone: string,
        code: string,
        displayName?: string,
    ) => Promise<void>;
    refreshMe: () => Promise<void>;
    logout: () => void;
}

const authSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set, get) => ({
    token: undefined,
    user: undefined,
    bootstrapping: false,
    bootstrapError: undefined,
    loginSeq: 0,
    setToken: (token?: string) => set(state => ({ ...state, token })),
    setUser: (user?: User) => set(state => ({ ...state, user })),
    loginAsTestUser: async (zaloUserId: string, name?: string) => {
        const mySeq = get().loginSeq + 1;
        set(state => ({
            ...state,
            loginSeq: mySeq,
            bootstrapping: true,
            bootstrapError: undefined,
        }));
        try {
            const { token, user } = await loginWithZalo({
                accessToken: `dev-test-token-${zaloUserId}`,
                zaloUserId,
                name,
            });
            if (get().loginSeq !== mySeq) return;
            set(state => ({ ...state, token, user }));
        } catch (err: any) {
            if (get().loginSeq === mySeq) {
                set(state => ({
                    ...state,
                    bootstrapError:
                        err?.message ||
                        "Không thể đăng nhập tài khoản thử nghiệm",
                }));
            }
        } finally {
            if (get().loginSeq === mySeq) {
                set(state => ({ ...state, bootstrapping: false }));
            }
        }
    },
    loginWithPhone: async (phone: string, password: string) => {
        const mySeq = get().loginSeq + 1;
        set(state => ({
            ...state,
            loginSeq: mySeq,
            bootstrapping: true,
            bootstrapError: undefined,
        }));
        try {
            const { token, user } = await loginWithPhone({ phone, password });
            if (get().loginSeq !== mySeq) return;
            set(state => ({ ...state, token, user }));
        } catch (err: any) {
            if (get().loginSeq === mySeq) {
                set(state => ({
                    ...state,
                    bootstrapError: err?.message || "Không thể đăng nhập",
                }));
            }
        } finally {
            if (get().loginSeq === mySeq) {
                set(state => ({ ...state, bootstrapping: false }));
            }
        }
    },
    registerWithPhone: async (
        phone: string,
        password: string,
        displayName: string,
    ) => {
        const mySeq = get().loginSeq + 1;
        set(state => ({
            ...state,
            loginSeq: mySeq,
            bootstrapping: true,
            bootstrapError: undefined,
        }));
        try {
            const { token, user } = await registerWithPhone({
                phone,
                password,
                displayName,
            });
            if (get().loginSeq !== mySeq) return;
            set(state => ({ ...state, token, user }));
        } catch (err: any) {
            if (get().loginSeq === mySeq) {
                set(state => ({
                    ...state,
                    bootstrapError: err?.message || "Không thể đăng ký",
                }));
            }
        } finally {
            if (get().loginSeq === mySeq) {
                set(state => ({ ...state, bootstrapping: false }));
            }
        }
    },
    requestOtp: async (phone: string) => {
        set(state => ({
            ...state,
            bootstrapping: true,
            bootstrapError: undefined,
        }));
        try {
            await requestOtpApi(phone);
        } catch (err: any) {
            set(state => ({
                ...state,
                bootstrapError: err?.message || "Không thể gửi mã OTP",
            }));
            throw err;
        } finally {
            set(state => ({ ...state, bootstrapping: false }));
        }
    },
    verifyOtp: async (phone: string, code: string, displayName?: string) => {
        const mySeq = get().loginSeq + 1;
        set(state => ({
            ...state,
            loginSeq: mySeq,
            bootstrapping: true,
            bootstrapError: undefined,
        }));
        try {
            const { token, user } = await verifyOtpApi({
                phone,
                code,
                displayName,
            });
            if (get().loginSeq !== mySeq) return;
            set(state => ({ ...state, token, user }));
        } catch (err: any) {
            if (get().loginSeq === mySeq) {
                set(state => ({
                    ...state,
                    bootstrapError: err?.message || "Mã OTP không đúng",
                }));
            }
            throw err;
        } finally {
            if (get().loginSeq === mySeq) {
                set(state => ({ ...state, bootstrapping: false }));
            }
        }
    },
    refreshMe: async () => {
        try {
            const user = await fetchMe();
            set(state => ({ ...state, user }));
        } catch {
            // Token het han - request.ts da tu xoa token, khong can xu ly them
        }
    },
    logout: () => {
        set(state => ({ ...state, token: undefined, user: undefined }));
    },
});

export default authSlice;
