import { API } from "@constants/common";
import { Company, FileAsset, PaginatedData, VerificationStatus } from "@dts";
import { request } from "./request";

/**
 * Mirror cua businessApi.ts nhung khong co quy trinh giay to (Company khong co
 * BusinessDocument rieng) - xem models/Company.ts o backend.
 */
export const fetchCompanies = (params: {
    search?: string;
    page?: number;
    limit?: number;
}): Promise<PaginatedData<Company>> =>
    request<PaginatedData<Company>>("GET", API.COMPANIES, {
        search: params.search,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

export const fetchCompanyById = (id: string): Promise<Company> =>
    request<Company>("GET", `${API.COMPANIES}/${id}`);

export interface CompanyInput {
    name: string;
    houseId: string;
    ownerName?: string;
    taxCode: string;
    phone?: string;
    active?: boolean;
    note?: string;
}

export const createCompany = (input: CompanyInput): Promise<Company> =>
    request<Company>("POST", API.COMPANIES, input);

export const updateCompany = (
    id: string,
    input: Partial<Omit<CompanyInput, "houseId">>,
): Promise<Company> =>
    request<Company>("PATCH", `${API.COMPANIES}/${id}`, input);

export const deleteCompany = (id: string): Promise<null> =>
    request<null>("DELETE", `${API.COMPANIES}/${id}`);

export const fetchCompanyAttachments = (id: string): Promise<FileAsset[]> =>
    request<FileAsset[]>("GET", `${API.COMPANIES}/${id}/attachments`);

export const deleteCompanyAttachment = (
    id: string,
    fileId: string,
): Promise<null> =>
    request<null>("DELETE", `${API.COMPANIES}/${id}/attachments/${fileId}`);

export const updateCompanyStatus = (
    id: string,
    status: VerificationStatus,
): Promise<Company> =>
    request<Company>("PATCH", `${API.COMPANIES}/${id}/status`, { status });
