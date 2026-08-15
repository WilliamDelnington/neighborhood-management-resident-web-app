import { BASE_URL } from "@constants/common";
import { ApiResponse } from "@dts";
import { useStore as store } from "@store";

interface FetchOptions {
    useAuth?: boolean;
    baseUrl?: string;
}

export class RequestError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "RequestError";
        this.status = status;
    }
}

export async function request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    data?: any,
    options?: FetchOptions,
): Promise<T> {
    const { useAuth = true, baseUrl = BASE_URL } = options || {};
    const headers = new Headers();
    const { token } = store.getState();

    if (useAuth && token) {
        headers.append("Authorization", `Bearer ${token}`);
    }

    // VITE_BASE_URL co the de trong khi frontend va backend cung goc (hoac chua cau hinh) -
    // trong truong hop do dung URL tuong doi de trinh duyet/webview tu resolve theo origin
    // hien tai, tranh nem loi "Invalid URL" khi goi new URL(url, "").
    const requestUrl = baseUrl
        ? new URL(url, baseUrl)
        : new URL(url, window.location.origin);
    const requestOptions: { [key: string]: any } = {
        method,
        headers,
    };

    if (method === "GET") {
        if (data) {
            Object.entries(data as Record<string, unknown>).forEach(
                ([key, value]) => {
                    if (value !== undefined && value !== null && value !== "") {
                        requestUrl.searchParams.set(key, String(value));
                    }
                },
            );
        }
    } else if (data instanceof FormData) {
        // Trình duyệt tự đặt multipart boundary; không gắn Content-Type thủ công.
        requestOptions.body = data;
    } else {
        headers.append("Content-Type", "application/json");
        requestOptions.body = JSON.stringify(data ?? {});
    }

    let response: Response;
    try {
        response = await fetch(requestUrl.toString(), requestOptions);
    } catch (err) {
        throw new RequestError("Không kết nối được tới máy chủ");
    }

    let resData: ApiResponse<T>;
    try {
        resData = (await response.json()) as ApiResponse<T>;
    } catch (err) {
        // Phan hoi khong phai JSON hop le (vd rong hoac HTML) - thuong do goi
        // sai duong dan, hoac backend chua trien khai route nay (chua deploy
        // ban moi nhat) nen tra ve 404/502 khong co body JSON. Nem loi ro
        // rang thay vi de nguyen SyntaxError kho hieu ("Unexpected end of
        // JSON input") lam nguoi dung tuong nham la loi khac.
        throw new RequestError(
            `Phan hoi khong hop le tu may chu (status ${response.status}) - co the API chua duoc trien khai hoac duong dan sai: ${method} ${url}`,
            response.status,
        );
    }

    if (!resData.success) {
        if (response.status === 401) {
            const hadToken = Boolean(store.getState().token);
            store.setState(state => ({
                ...state,
                token: undefined,
                user: undefined,
            }));
            // Chi bao "phien het han" khi truoc do dang co token (mot phien
            // dang dang nhap vua bi tu choi) - tranh hien toast nay cho cac
            // request 401 khac (vd sai OTP luc chua dang nhap).
            if (hadToken) {
                store.getState().setError({
                    message:
                        "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
                    status: 401,
                });
            }
        }
        throw new RequestError(
            resData.error || resData.message || "Đã xảy ra lỗi",
            response.status,
        );
    }

    return resData.data as T;
}
