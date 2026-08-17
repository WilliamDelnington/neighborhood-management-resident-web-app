import { API } from "@constants/common";
import {
    Citizen,
    EntityRequiredDocumentsResult,
    FileAsset,
    Household,
    LoaiSoHuu,
    PaginatedData,
    RequiredDocumentRecord,
    VerificationStatus,
} from "@dts";
import { request } from "./request";
import {
    fetchEntityRequiredDocuments,
    reviewEntityDocument,
    submitEntityDocument,
    SubmitEntityDocumentInput,
} from "./requiredDocumentApi";

export const searchHouseholds = (params: {
    search?: string;
    cluster?: string;
    page?: number;
    limit?: number;
}): Promise<PaginatedData<Household>> =>
    request<PaginatedData<Household>>("GET", API.HOUSEHOLDS_LOOKUP, {
        search: params.search,
        cluster: params.cluster,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

/**
 * Danh sach ho dan day du (yeu cau quyen households.read) - dung cho man hinh
 * Quan tri trong Mini App, khac voi searchHouseholds (endpoint lookup gioi han
 * truong tra ve, danh cho nguoi dan chon ho cua minh).
 */
export const fetchHouseholds = (params: {
    search?: string;
    cluster?: string;
    page?: number;
    limit?: number;
}): Promise<PaginatedData<Household>> =>
    request<PaginatedData<Household>>("GET", API.HOUSEHOLDS, {
        search: params.search,
        cluster: params.cluster,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

export const fetchHouseholdById = (id: string): Promise<Household> =>
    request<Household>("GET", `${API.HOUSEHOLDS}/${id}`);

export const fetchHouseholdCitizens = (
    id: string,
    params: { page?: number; limit?: number } = {},
): Promise<PaginatedData<Citizen>> =>
    request<PaginatedData<Citizen>>("GET", `${API.HOUSEHOLDS}/${id}/citizens`, {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

export interface HouseholdInput {
    cluster: string;
    address: string;
    headOfHousehold: string;
    phone?: string;
    // Chi dung khi tao moi ho dan (xem HouseholdForm mode="create") - danh dau
    // nguoi lien he (phone o tren) co phai chinh chu ho khong. true = chi tao
    // Citizen "Chủ hộ" mang phone nay; false = tao them mot Citizen
    // "Người liên hệ" rieng mang ten contactName va phone nay.
    contactIsHead?: boolean;
    contactName?: string;
    memberCount?: number;
    ownershipType?: LoaiSoHuu;
    needsSupport?: boolean;
    houseId?: string | null;
    note?: string;
}

export const createHousehold = (input: HouseholdInput): Promise<Household> =>
    request<Household>("POST", API.HOUSEHOLDS, input);

export const updateHousehold = (
    id: string,
    input: Partial<HouseholdInput>,
): Promise<Household> =>
    request<Household>("PATCH", `${API.HOUSEHOLDS}/${id}`, input);

export const deleteHousehold = (id: string): Promise<null> =>
    request<null>("DELETE", `${API.HOUSEHOLDS}/${id}`);

export const fetchHouseholdAttachments = (id: string): Promise<FileAsset[]> =>
    request<FileAsset[]>("GET", `${API.HOUSEHOLDS}/${id}/attachments`);

export const deleteHouseholdAttachment = (
    id: string,
    fileId: string,
): Promise<null> =>
    request<null>("DELETE", `${API.HOUSEHOLDS}/${id}/attachments/${fileId}`);

export const updateHouseholdStatus = (
    id: string,
    status: VerificationStatus,
    note?: string,
): Promise<Household> =>
    request<Household>("PATCH", `${API.HOUSEHOLDS}/${id}/status`, {
        status,
        note,
    });

export const fetchHouseholdRequiredDocuments = (
    id: string,
): Promise<EntityRequiredDocumentsResult> =>
    fetchEntityRequiredDocuments(API.HOUSEHOLDS, id);

export const submitHouseholdDocument = (
    id: string,
    input: SubmitEntityDocumentInput,
): Promise<RequiredDocumentRecord> =>
    submitEntityDocument(API.HOUSEHOLDS, id, input);

export const reviewHouseholdDocument = (
    id: string,
    documentId: string,
    decision: "approved" | "rejected",
    rejectionReason?: string,
    approvalNote?: string,
): Promise<RequiredDocumentRecord> =>
    reviewEntityDocument(
        API.HOUSEHOLDS,
        id,
        documentId,
        decision,
        rejectionReason,
        approvalNote,
    );
