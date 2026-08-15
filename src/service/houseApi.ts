import { API } from "@constants/common";
import {
    Business,
    Company,
    EntityRequiredDocumentsResult,
    FileAsset,
    Household,
    House,
    HouseLookupItem,
    HousePhysicalStatus,
    HouseStatus,
    HouseUsageType,
    PaginatedData,
    RequiredDocumentRecord,
} from "@dts";
import { request } from "./request";
import {
    fetchEntityRequiredDocuments,
    reviewEntityDocument,
    submitEntityDocument,
    SubmitEntityDocumentInput,
} from "./requiredDocumentApi";

/**
 * Yeu cau quyen houses.read. Backend tu gioi han theo ownerId (house_owner)
 * hoac assignedClusters (nhan vien) cua nguoi goi (xem houseScopeFilter trong
 * quan-ly-to-dan-pho-hoa-binh-backend-app), nen khong can loc them o client.
 */
export const fetchHouses = (params: {
    search?: string;
    cluster?: string;
    // Truyen mot mang de loc theo nhieu trang thai cung luc (vd ["pending",
    // "verified"]) - request() tu chuyen mang thanh chuoi phan tach boi dau
    // phay qua String(), backend tu tach lai (xem GET /api/houses).
    status?: HouseStatus | HouseStatus[];
    page?: number;
    limit?: number;
}): Promise<PaginatedData<House>> =>
    request<PaginatedData<House>>("GET", API.HOUSES, {
        search: params.search,
        cluster: params.cluster,
        status: params.status,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

export const fetchHouseById = (id: string): Promise<House> =>
    request<House>("GET", `${API.HOUSES}/${id}`);

/**
 * Tim kiem nha so rut gon, KHONG loc theo pham vi so huu/phu trach (khac
 * fetchHouses) - dung rieng cho luong chon "nha so lien quan" khi gui phan
 * anh, vi nguoi gui co the bao ve mot nha khong phai cua ho. Chi can quyen
 * complaints.create (khong phai houses.read).
 */
export const searchHouseTargets = (
    search?: string,
): Promise<HouseLookupItem[]> =>
    request<HouseLookupItem[]>("GET", `${API.HOUSES}/lookup`, { search });

export const fetchHouseHouseholds = (
    id: string,
    params: { page?: number; limit?: number } = {},
): Promise<PaginatedData<Household>> =>
    request<PaginatedData<Household>>("GET", `${API.HOUSES}/${id}/households`, {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

export const fetchHouseBusinesses = (
    id: string,
    params: { page?: number; limit?: number } = {},
): Promise<PaginatedData<Business>> =>
    request<PaginatedData<Business>>("GET", `${API.HOUSES}/${id}/businesses`, {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

export const fetchHouseCompanies = (
    id: string,
    params: { page?: number; limit?: number } = {},
): Promise<PaginatedData<Company>> =>
    request<PaginatedData<Company>>("GET", `${API.HOUSES}/${id}/companies`, {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

export interface HouseInput {
    cluster?: string;
    // Neu co streetId, backend uu tien streetId va bo qua cluster (xem
    // streetSync.ts o backend) - cluster chi con la fallback tu do.
    streetId?: string;
    // null = go gan to dan pho khoi nha so, undefined = giu nguyen.
    neighborhoodId?: string | null;
    address: string;
    physicalStatus?: HousePhysicalStatus;
    // Muc dich su dung nha do chu nha tu khai bao - xem models/HouseRecord.ts
    // o backend.
    usageTypes?: HouseUsageType[];
    otherUsageNote?: string;
    note?: string;
    // Chi co y nghia luc tao moi (xem HouseForm.tsx / houseRecordService.createHouseRecord).
    organizationId?: string;
}

export const createHouse = (input: HouseInput): Promise<House> =>
    request<House>("POST", API.HOUSES, input);

export const updateHouse = (
    id: string,
    input: Partial<HouseInput>,
): Promise<House> => request<House>("PATCH", `${API.HOUSES}/${id}`, input);

export const updateHouseStatus = (
    id: string,
    status: HouseStatus,
): Promise<House> =>
    request<House>("PATCH", `${API.HOUSES}/${id}/status`, { status });

export const deleteHouse = (id: string): Promise<null> =>
    request<null>("DELETE", `${API.HOUSES}/${id}`);

export const fetchHouseAttachments = (id: string): Promise<FileAsset[]> =>
    request<FileAsset[]>("GET", `${API.HOUSES}/${id}/attachments`);

export const deleteHouseAttachment = (
    id: string,
    fileId: string,
): Promise<null> =>
    request<null>("DELETE", `${API.HOUSES}/${id}/attachments/${fileId}`);

export const fetchHouseRequiredDocuments = (
    id: string,
): Promise<EntityRequiredDocumentsResult> =>
    fetchEntityRequiredDocuments(API.HOUSES, id);

export const submitHouseDocument = (
    id: string,
    input: SubmitEntityDocumentInput,
): Promise<RequiredDocumentRecord> =>
    submitEntityDocument(API.HOUSES, id, input);

export const reviewHouseDocument = (
    id: string,
    documentId: string,
    decision: "approved" | "rejected",
    rejectionReason?: string,
    approvalNote?: string,
): Promise<RequiredDocumentRecord> =>
    reviewEntityDocument(
        API.HOUSES,
        id,
        documentId,
        decision,
        rejectionReason,
        approvalNote,
    );
