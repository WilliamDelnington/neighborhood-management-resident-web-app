import { API } from "@constants/common";
import {
    Citizen,
    FileAsset,
    Household,
    LoaiSoHuu,
    PaginatedData,
    VerificationStatus,
} from "@dts";
import { request } from "./request";

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
