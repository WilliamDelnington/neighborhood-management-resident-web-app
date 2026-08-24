import { API } from "@constants/common";
import { ChangeRequest, ChangeRequestTargetModel, PaginatedData } from "@dts";
import { request } from "./request";

/**
 * Danh sach yeu cau thay doi CUA CHINH MINH (backend luon ep view="mine" cho
 * nguoi khong co change_requests.read - xem app/api/change-requests/route.ts)
 * - dung cho man "Yeu cau cua toi" va de kiem tra co yeu cau dang cho duyet
 * cho mot nha/tai khoan cu the hay chua truoc khi cho gui them.
 */
export const fetchMyChangeRequests = (
    page = 1,
    limit = 20,
    status: ChangeRequest["status"] | undefined = undefined,
): Promise<PaginatedData<ChangeRequest>> =>
    request<PaginatedData<ChangeRequest>>("GET", API.CHANGE_REQUESTS, {
        page,
        limit,
        status,
    });

export interface CreateChangeRequestInput {
    targetModel: ChangeRequestTargetModel;
    targetId: string;
    changeType: "update" | "unlink";
    patch?: Record<string, unknown>;
    reason?: string;
}

export const createChangeRequest = (
    input: CreateChangeRequestInput,
): Promise<ChangeRequest> =>
    request<ChangeRequest>("POST", API.CHANGE_REQUESTS, input);

export const cancelChangeRequest = (id: string): Promise<ChangeRequest> =>
    request<ChangeRequest>("POST", `${API.CHANGE_REQUESTS}/${id}/cancel`);
