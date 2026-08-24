import { EntityRequiredDocumentsResult, RequiredDocumentRecord } from "@dts";
import { request } from "./request";

// Dung chung cho House/Household/Company (moi ban ghi tu dinh nghia dong luat
// giay to bat buoc CHO CHINH NO, khac Business - dong luat nam tren
// BusinessType dung chung, xem businessApi.ts). Cac ham trong houseApi.ts/
// householdApi.ts/companyApi.ts chi truyen base path (vd API.HOUSES) vao day
// thay vi viet lai request() 3 lan.
export interface SubmitEntityDocumentInput {
    documentTypeId: string;
    fileAssetId: string;
    docNumber?: string;
    issueDate?: string;
    expiryDate?: string;
}

export const fetchEntityRequiredDocuments = (
    basePath: string,
    entityId: string,
): Promise<EntityRequiredDocumentsResult> =>
    request<EntityRequiredDocumentsResult>(
        "GET",
        `${basePath}/${entityId}/required-documents`,
    );

export const submitEntityDocument = (
    basePath: string,
    entityId: string,
    input: SubmitEntityDocumentInput,
): Promise<RequiredDocumentRecord> =>
    request<RequiredDocumentRecord>(
        "POST",
        `${basePath}/${entityId}/documents`,
        input,
    );

export const reviewEntityDocument = (
    basePath: string,
    entityId: string,
    documentId: string,
    decision: "approved" | "rejected",
    rejectionReason?: string,
    approvalNote?: string,
): Promise<RequiredDocumentRecord> =>
    request<RequiredDocumentRecord>(
        "PUT",
        `${basePath}/${entityId}/documents/${documentId}/review`,
        { decision, rejectionReason, approvalNote },
    );
