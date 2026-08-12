import { API, BASE_URL } from "@constants/common";
import { request } from "./request";

export type AttachmentRelatedModel =
    | "HouseRecord"
    | "Business"
    | "BusinessDocument"
    | "Complaint"
    | "Request";

/**
 * Cap mot token upload ngan han (10 phut), gan chet vao dung mot ban ghi
 * (relatedModel/relatedId) - dung de nhung vao query string cua URL POST file
 * (xem buildUploadUrl), vi request nay dung fetch/FormData thuan (khong qua
 * request() thong thuong) nen khong mang theo header Authorization cua phien
 * dang nhap. Xem
 * quan-ly-to-dan-pho-hoa-binh-backend-app/src/app/api/uploads/token/route.ts.
 */
export interface UploadTokenResponse {
    token: string;
    expiresInSeconds: number;
}

export const createUploadToken = (
    relatedModel: AttachmentRelatedModel,
    relatedId: string,
): Promise<UploadTokenResponse> =>
    request<UploadTokenResponse>("POST", API.UPLOADS_TOKEN, {
        relatedModel,
        relatedId,
    });

/**
 * URL day du (co token) de POST file len bang FormData (xem pickAndUploadAttachment).
 */
export const buildUploadUrl = (token: string): string =>
    `${BASE_URL}${API.UPLOADS_ATTACHMENTS}?token=${encodeURIComponent(token)}`;

export interface PickedUpload {
    url: string;
    fileAssetId: string;
}

/**
 * Mo bo chon file cua trinh duyet (input[type=file] an) va tra ve file duoc
 * chon, hoac null neu nguoi dung dong hop thoai ma khong chon gi. Trinh duyet
 * khong co event "cancel" chuan cho input file, nen dung heuristic: cho
 * window nhan lai focus (nguoi dung dong hop thoai) ma khong thay "change" -
 * coi nhu da huy.
 */
function pickFile(): Promise<File | null> {
    return new Promise(resolve => {
        const input = document.createElement("input");
        input.type = "file";
        input.style.display = "none";
        document.body.appendChild(input);

        let settled = false;
        const cleanup = () => {
            window.removeEventListener("focus", onFocus);
            input.removeEventListener("change", onChange);
            document.body.removeChild(input);
        };
        const settle = (file: File | null) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(file);
        };
        const onChange = () => {
            settle(input.files?.[0] || null);
        };
        const onFocus = () => {
            // Hop thoai chon file dong sau khi window nhan lai focus - doi mot
            // nhip de "change" (neu co) kip toi truoc khi coi nhu da huy.
            window.setTimeout(() => settle(null), 300);
        };

        input.addEventListener("change", onChange);
        window.addEventListener("focus", onFocus);
        input.click();
    });
}

/**
 * Xin token upload, mo hop thoai chon file cua trinh duyet, POST thang len
 * server bang FormData (xem createUploadToken/buildUploadUrl o tren) roi doc
 * lai fileAssetId ma server tra ve (xem /api/uploads/attachments) - can cho
 * cac API can tham chieu toi FileAsset vua tao (vd nop giay to cho ho kinh
 * doanh), khong chi URL nhu AttachmentUploader thong thuong.
 */
export async function pickAndUploadAttachment(
    relatedModel: AttachmentRelatedModel,
    relatedId: string,
): Promise<PickedUpload> {
    const file = await pickFile();
    if (!file) {
        throw new Error("Chưa chọn file nào");
    }

    const { token } = await createUploadToken(relatedModel, relatedId);
    const uploadUrl = buildUploadUrl(token);

    const formData = new FormData();
    formData.append("file", file);

    let response: Response;
    try {
        response = await fetch(uploadUrl, { method: "POST", body: formData });
    } catch (err) {
        throw new Error(
            "Không kết nối được tới máy chủ khi tải file lên - vui lòng thử lại",
        );
    }

    let result: {
        error: number;
        message?: string;
        data?: { urls: string[]; fileAssetIds: string[] };
    };
    try {
        result = await response.json();
    } catch (err) {
        throw new Error(
            "Không nhận được phản hồi hợp lệ khi tải file lên - vui lòng kiểm tra kết nối và thử lại",
        );
    }
    if (result.error !== 0) {
        throw new Error(result.message || "Tải file lên thất bại");
    }
    const url = result.data?.urls?.[0];
    const fileAssetId = result.data?.fileAssetIds?.[0];
    if (!url || !fileAssetId) {
        throw new Error("Phản hồi tải file lên thiếu dữ liệu cần thiết");
    }
    return { url, fileAssetId };
}
