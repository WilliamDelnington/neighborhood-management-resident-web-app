import { API } from "@constants/common";
import type {
    InspectionCampaign,
    InspectionOutcome,
    InspectionResult,
    InspectionSelfDeclarationDetail,
    InspectionSelfDeclarationListItem,
    InspectionTarget,
    PaginatedData,
} from "@dts";
import { request } from "./request";

const v1 = API.INSPECTIONS_V1;
export type InspectionResultInput = {
    targetId: string;
    answers: Array<{ checklistItemId: string; value: unknown }>;
    gpsLat?: number;
    gpsLng?: number;
    note?: string;
    outcome?: InspectionOutcome;
};

export const fetchInspectionCampaigns = () =>
    request<PaginatedData<InspectionCampaign>>(
        "GET",
        API.INSPECTION_CAMPAIGNS,
        {
            page: 1,
            limit: 100,
        },
    );

export const fetchInspectionCampaign = (id: string) =>
    request<InspectionCampaign>("GET", `${v1}/inspection-campaigns/${id}`);

export const fetchInspectionTargets = (
    campaignId: string,
    resultStatus?: string,
) =>
    request<PaginatedData<InspectionTarget>>(
        "GET",
        `${v1}/inspection-campaigns/${campaignId}/targets`,
        { page: 1, limit: 100, resultStatus },
    );

export const fetchInspectionTarget = (id: string) =>
    request<InspectionTarget>("GET", `${v1}/inspection-targets/${id}`);

export const createInspectionResult = (input: InspectionResultInput) =>
    request<InspectionResult>("POST", `${v1}/inspection-results`, input);

export const fetchInspectionResult = (id: string) =>
    request<InspectionResult>("GET", `${v1}/inspection-results/${id}`);

export const updateInspectionResult = (
    id: string,
    input: Omit<InspectionResultInput, "targetId">,
) =>
    request<InspectionResult>("PATCH", `${v1}/inspection-results/${id}`, input);

export const uploadInspectionEvidence = (id: string, file: File) => {
    const data = new FormData();
    data.append("file", file);
    return request("POST", `${v1}/inspection-results/${id}/attachments`, data);
};

export const transitionInspectionResult = (
    id: string,
    action: "submit" | "verify" | "request-revision" | "require-field-check",
    input: { note?: string; outcome?: InspectionOutcome } = {},
) =>
    request<InspectionResult>(
        "POST",
        `${v1}/inspection-results/${id}/${action}`,
        input,
    );

export const fetchMyInspectionSelfDeclarations = () =>
    request<{ items: InspectionSelfDeclarationListItem[] }>(
        "GET",
        `${v1}/inspection-self-declarations`,
    );

export const fetchInspectionSelfDeclaration = (targetId: string) =>
    request<InspectionSelfDeclarationDetail>(
        "GET",
        `${v1}/inspection-self-declarations/${targetId}`,
    );

export const saveInspectionSelfDeclaration = (
    targetId: string,
    input: Omit<InspectionResultInput, "targetId">,
) =>
    request<InspectionSelfDeclarationDetail>(
        "PUT",
        `${v1}/inspection-self-declarations/${targetId}`,
        input,
    );

export const submitInspectionSelfDeclaration = (targetId: string) =>
    request<InspectionSelfDeclarationDetail>(
        "POST",
        `${v1}/inspection-self-declarations/${targetId}/submit`,
    );

export const uploadInspectionSelfDeclarationEvidence = (
    targetId: string,
    file: File,
) => {
    const data = new FormData();
    data.append("file", file);
    return request(
        "POST",
        `${v1}/inspection-self-declarations/${targetId}/attachments`,
        data,
    );
};
