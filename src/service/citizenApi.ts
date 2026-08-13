import { API } from "@constants/common";
import { Citizen, GioiTinh, LoaiCuTru, PaginatedData } from "@dts";
import { request } from "./request";

/**
 * Danh sach nhan khau day du (yeu cau quyen citizens.read) - dung cho man hinh
 * Quan tri trong Mini App.
 */
export const fetchCitizens = (params: {
    search?: string;
    householdId?: string;
    page?: number;
    limit?: number;
}): Promise<PaginatedData<Citizen>> =>
    request<PaginatedData<Citizen>>("GET", API.CITIZENS, {
        search: params.search,
        householdId: params.householdId,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

export const fetchCitizenById = (id: string): Promise<Citizen> =>
    request<Citizen>("GET", `${API.CITIZENS}/${id}`);

export interface CitizenInput {
    fullName: string;
    phone?: string;
    cccd?: string;
    birthDate?: string;
    gender?: GioiTinh;
    relationToHead?: string;
    householdId: string;
    residenceType?: LoaiCuTru;
    temporaryResidenceExpiresAt?: string;
    isElderly?: boolean;
    isChild?: boolean;
    isDisabledOrSupportNeeded?: boolean;
    isPartyMember?: boolean;
    isUnionMember?: boolean;
}

export const createCitizen = (input: CitizenInput): Promise<Citizen> =>
    request<Citizen>("POST", API.CITIZENS, input);

export const updateCitizen = (
    id: string,
    input: Partial<CitizenInput>,
): Promise<Citizen> =>
    request<Citizen>("PATCH", `${API.CITIZENS}/${id}`, input);

export const deleteCitizen = (id: string): Promise<null> =>
    request<null>("DELETE", `${API.CITIZENS}/${id}`);
