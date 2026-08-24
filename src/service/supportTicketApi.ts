import { API, DEFAULT_PAGE_SIZE } from "@constants/common";
import {
    LoaiYeuCauHoTro,
    PaginatedData,
    RequestComment,
    SupportTicket,
} from "@dts";
import { request } from "./request";

export interface CreateSupportTicketParams {
    type: LoaiYeuCauHoTro;
    title: string;
    content: string;
    images?: string[];
    deviceInfo?: string;
}

export const createSupportTicket = (
    params: CreateSupportTicketParams,
): Promise<SupportTicket> =>
    request<SupportTicket>("POST", API.SUPPORT_TICKETS, params);

export const fetchMySupportTickets = (
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
): Promise<PaginatedData<SupportTicket>> =>
    request<PaginatedData<SupportTicket>>("GET", API.SUPPORT_TICKETS_MINE, {
        page,
        limit,
    });

export const fetchSupportTicketDetail = (id: string): Promise<SupportTicket> =>
    request<SupportTicket>("GET", `${API.SUPPORT_TICKETS}/${id}`);

/**
 * Nguoi gui bo sung noi dung cho yeu cau cua chinh minh - tu dong quay ve
 * "dang_xu_ly" neu dang "can_bo_sung" (xem updateSupportTicket o backend).
 */
export const updateSupportTicket = (
    id: string,
    content: string,
): Promise<SupportTicket> =>
    request<SupportTicket>("PATCH", `${API.SUPPORT_TICKETS}/${id}`, {
        content,
    });

export const fetchSupportTicketComments = (
    id: string,
): Promise<RequestComment[]> =>
    request<RequestComment[]>("GET", `${API.SUPPORT_TICKETS}/${id}/comments`);

export const createSupportTicketComment = (
    id: string,
    content: string,
): Promise<RequestComment> =>
    request<RequestComment>("POST", `${API.SUPPORT_TICKETS}/${id}/comments`, {
        content,
    });
