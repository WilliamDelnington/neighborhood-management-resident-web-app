import { API } from "@constants/common";
import {
    Business,
    BusinessDocument,
    FileAsset,
    PaginatedData,
    RequiredDocumentsResult,
    VerificationStatus,
} from "@dts";
import { request } from "./request";

/**
 * Yeu cau quyen businesses.read. Backend tu gioi han theo ownerId (house_owner,
 * qua cac nha ma minh so huu) hoac cluster (nhan vien) cua nguoi goi (xem
 * listBusinesses trong quan-ly-to-dan-pho-hoa-binh-backend-app), nen khong
 * can loc them o client.
 */
export const fetchBusinesses = (params: {
    search?: string;
    page?: number;
    limit?: number;
}): Promise<PaginatedData<Business>> =>
    request<PaginatedData<Business>>("GET", API.BUSINESSES, {
        search: params.search,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

export const fetchBusinessById = (id: string): Promise<Business> =>
    request<Business>("GET", `${API.BUSINESSES}/${id}`);

export interface BusinessInput {
    name: string;
    houseId: string;
    businessType?: string | null;
    ownerName?: string;
    taxCode?: string;
    phone?: string;
    active?: boolean;
    note?: string;
}

export const createBusiness = (input: BusinessInput): Promise<Business> =>
    request<Business>("POST", API.BUSINESSES, input);

export const updateBusiness = (
    id: string,
    input: Partial<Omit<BusinessInput, "houseId">>,
): Promise<Business> =>
    request<Business>("PATCH", `${API.BUSINESSES}/${id}`, input);

export const deleteBusiness = (id: string): Promise<null> =>
    request<null>("DELETE", `${API.BUSINESSES}/${id}`);

// Admin ghi de tuy y; chu ho chi duoc goi voi status="pending" tu "denied" (gui
// lai ho so sau khi bi tu choi - xem PATCH /api/businesses/:id/status o
// backend). Luong binh thuong dung submitBusinessDocument/reviewBusinessDocument
// ben duoi, trang thai duoc backend tu tinh lai tu ket qua duyet tung giay to.
export const updateBusinessStatus = (
    id: string,
    status: VerificationStatus,
): Promise<Business> =>
    request<Business>("PATCH", `${API.BUSINESSES}/${id}/status`, { status });

export const fetchBusinessAttachments = (id: string): Promise<FileAsset[]> =>
    request<FileAsset[]>("GET", `${API.BUSINESSES}/${id}/attachments`);

export const deleteBusinessAttachment = (
    id: string,
    fileId: string,
): Promise<null> =>
    request<null>("DELETE", `${API.BUSINESSES}/${id}/attachments/${fileId}`);

export const fetchRequiredDocuments = (
    businessId: string,
): Promise<RequiredDocumentsResult> =>
    request<RequiredDocumentsResult>(
        "GET",
        `${API.BUSINESSES}/${businessId}/required-documents`,
    );

export interface SubmitBusinessDocumentInput {
    documentTypeId: string;
    fileAssetId: string;
    docNumber?: string;
    issueDate?: string;
    expiryDate?: string;
}

export const submitBusinessDocument = (
    businessId: string,
    input: SubmitBusinessDocumentInput,
): Promise<BusinessDocument> =>
    request<BusinessDocument>(
        "POST",
        `${API.BUSINESSES}/${businessId}/documents`,
        input,
    );

export const reviewBusinessDocument = (
    businessId: string,
    documentId: string,
    decision: "approved" | "rejected",
    rejectionReason?: string,
): Promise<BusinessDocument> =>
    request<BusinessDocument>(
        "PUT",
        `${API.BUSINESSES}/${businessId}/documents/${documentId}/review`,
        { decision, rejectionReason },
    );
