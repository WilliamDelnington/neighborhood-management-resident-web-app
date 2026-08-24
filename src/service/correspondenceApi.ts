import { API, DEFAULT_PAGE_SIZE } from "@constants/common";
import {
    Correspondence,
    CorrespondenceReply,
    FileAsset,
    PaginatedData,
} from "@dts";
import { request } from "./request";

/**
 * Danh sach van ban - backend tu gioi han theo vai tro/view (nguoi gui thay
 * van ban do minh gui, nguoi nhan thay van ban da gui toi minh/to dan pho minh
 * phu trach), xem correspondenceService.listCorrespondences o backend.
 * Mini App chi dung view="received" (xem cong van/bao cao gui den) - "sent"
 * (xem lai van ban da soan) chi can tren trang quan tri web.
 */
export const fetchCorrespondences = (
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
): Promise<PaginatedData<Correspondence>> =>
    request<PaginatedData<Correspondence>>("GET", API.CORRESPONDENCES, {
        page,
        limit,
        view: "received",
    });

export const fetchCorrespondenceDetail = (
    id: string,
): Promise<Correspondence> =>
    request<Correspondence>("GET", `${API.CORRESPONDENCES}/${id}`);

export const fetchCorrespondenceAttachments = (
    id: string,
): Promise<FileAsset[]> =>
    request<FileAsset[]>("GET", `${API.CORRESPONDENCES}/${id}/attachments`);

export const fetchCorrespondenceReplies = (
    id: string,
): Promise<CorrespondenceReply[]> =>
    request<CorrespondenceReply[]>(
        "GET",
        `${API.CORRESPONDENCES}/${id}/replies`,
    );

export const createCorrespondenceReply = (
    id: string,
    content: string,
): Promise<CorrespondenceReply> =>
    request<CorrespondenceReply>(
        "POST",
        `${API.CORRESPONDENCES}/${id}/replies`,
        { content },
    );

export interface ComposeCorrespondenceInput {
    correspondenceTypeId: string;
    documentNumber?: string;
    title: string;
    content: string;
    isUrgent?: boolean;
    targetUserIds: string[];
}

/**
 * Soan va gui van ban trong mot thao tac (khac trang quan tri web, khong co
 * buoc "luu nhap" rieng - phu hop thao tac tren dien thoai). issuedAt luon la
 * thoi diem gui, khong cho nguoi dung tu chon ngay ban hanh.
 */
export async function composeAndSendCorrespondence(
    input: ComposeCorrespondenceInput,
): Promise<Correspondence> {
    const draft = await request<Correspondence>("POST", API.CORRESPONDENCES, {
        ...input,
        issuedAt: new Date().toISOString(),
    });
    return request<Correspondence>(
        "POST",
        `${API.CORRESPONDENCES}/${draft._id}/send`,
    );
}
