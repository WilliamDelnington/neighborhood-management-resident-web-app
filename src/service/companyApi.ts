import { API } from "@constants/common";
import {
    Company,
    EntityRequiredDocumentsResult,
    FileAsset,
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

/**
 * Mirror cua businessApi.ts - Company khong co businessType (dong luat
 * requiredDocuments nam TRUC TIEP tren tung Company thay vi tren mot "Type"
 * dung chung), va status KHONG tu tinh lai tu ket qua duyet giay to (khac
 * Business) - xem models/Company.ts o backend.
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

export const fetchCompanyRequiredDocuments = (
    id: string,
): Promise<EntityRequiredDocumentsResult> =>
    fetchEntityRequiredDocuments(API.COMPANIES, id);

export const submitCompanyDocument = (
    id: string,
    input: SubmitEntityDocumentInput,
): Promise<RequiredDocumentRecord> =>
    submitEntityDocument(API.COMPANIES, id, input);

export const reviewCompanyDocument = (
    id: string,
    documentId: string,
    decision: "approved" | "rejected",
    rejectionReason?: string,
    approvalNote?: string,
): Promise<RequiredDocumentRecord> =>
    reviewEntityDocument(
        API.COMPANIES,
        id,
        documentId,
        decision,
        rejectionReason,
        approvalNote,
    );
