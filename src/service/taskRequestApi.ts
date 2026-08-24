import { API } from "@constants/common";
import {
    FileAsset,
    MyRequestItem,
    PaginatedData,
    RequestComment,
    RequestStatus,
} from "@dts";
import { request } from "./request";

/**
 * Hop thu nhiem vu/yeu cau CUA CHINH MINH (backend khong gioi han permission
 * rieng - bat ky ai cung xem duoc cac Request ma minh la nguoi nhan, xem
 * app/api/requests/my/route.ts). Dung cho man "Nhiệm vụ của tôi" cua Chu nha/
 * Chu ho khi To truong/To pho gui nhiem vu xuong Nha (B04), hoac khi Phuong
 * giao nhiem vu xac minh xuong To truong/To pho (B13).
 */
export const fetchMyRequests = (params?: {
    page?: number;
    limit?: number;
    status?: RequestStatus;
    type?: string;
    overdueOnly?: boolean;
}): Promise<PaginatedData<MyRequestItem>> =>
    request<PaginatedData<MyRequestItem>>("GET", API.REQUESTS_MY, {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        status: params?.status,
        type: params?.type,
        overdueOnly: params?.overdueOnly,
    });

/**
 * Nguoi nhan tu cap nhat trang thai xu ly cua chinh minh - KHONG duoc tu dat
 * "resolved" (chi nguoi giao yeu cau moi duoc xac nhan hoan thanh, xem
 * requestService.updateMyRequestStatus o backend).
 */
export const updateMyRequestStatus = (
    requestId: string,
    status: Exclude<RequestStatus, "resolved">,
    note?: string,
): Promise<unknown> =>
    request("PATCH", `${API.REQUESTS}/${requestId}/recipients/me`, {
        status,
        note,
    });

export const fetchRequestComments = (
    requestId: string,
): Promise<RequestComment[]> =>
    request<RequestComment[]>("GET", `${API.REQUESTS}/${requestId}/comments`);

export const createRequestComment = (
    requestId: string,
    content: string,
): Promise<RequestComment> =>
    request<RequestComment>("POST", `${API.REQUESTS}/${requestId}/comments`, {
        content,
    });

/**
 * Tai lieu minh chung dinh kem cua mot Request - dung cho AttachmentUploader
 * tren "Nhiệm vụ của tôi" (xem app/api/requests/[id]/attachments o backend,
 * quyen xem giong xem chinh Request - quan ly hoac nguoi nhan).
 */
export const fetchRequestAttachments = (
    requestId: string,
): Promise<FileAsset[]> =>
    request<FileAsset[]>("GET", `${API.REQUESTS}/${requestId}/attachments`);

/**
 * Backend chua co API xoa tai lieu dinh kem cua Request (khac House/Business/
 * Complaint) - stub nay chi de khop kieu prop bat buoc cua AttachmentUploader,
 * KHONG duoc goi thuc te vi component chi hien nut xoa khi canDelete=true
 * (luon truyen false o MyRequestsPage).
 */
export const deleteRequestAttachment = (): Promise<null> => {
    throw new Error("Chưa hỗ trợ xóa tài liệu đính kèm của nhiệm vụ");
};
