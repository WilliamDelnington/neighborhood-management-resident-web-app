import { API } from "@constants/common";
import {
    Appointment,
    AppointmentService,
    AppointmentStatus,
    FileAsset,
    PaginatedData,
} from "@dts";
import { request } from "./request";

/**
 * Danh muc dich vu co the dat lich (Phuong hoac To dan pho), chi can dang
 * nhap (khong can quyen rieng) - xem GET /api/appointment-services o backend.
 */
export const fetchAppointmentServices = (
    activeOnly = true,
): Promise<AppointmentService[]> =>
    request<AppointmentService[]>("GET", API.APPOINTMENT_SERVICES, {
        activeOnly,
    });

export type AppointmentAvailableSlot = {
    slot_id: string;
    start_time: string;
    end_time: string;
    max_capacity: number;
    booked_count: number;
    is_available: boolean;
};

/**
 * Danh sach khung gio con trong cua mot dich vu, trong mot ngay cu the -
 * date theo dinh dang "YYYY-MM-DD". Xem GET /api/appointments/available-slots.
 */
export const fetchAvailableSlots = (
    serviceId: string,
    date: string,
): Promise<AppointmentAvailableSlot[]> =>
    request<AppointmentAvailableSlot[]>(
        "GET",
        API.APPOINTMENTS_AVAILABLE_SLOTS,
        { serviceId, date },
    );

/**
 * Id da xin truoc, dung khi nguoi dat lich dinh kem tai lieu ngay tren form
 * dat lich (xem uploadApi.pickAndUploadAttachment voi relatedModel=
 * "Appointment") truoc khi bam "Dat lich" - backend se dung id nay lam _id
 * cua lich hen moi de cac tai lieu do tu dong thuoc ve no. Mirror
 * createComplaintDraftId trong complaintApi.ts.
 */
export const createAppointmentDraftId = (): Promise<{ draftId: string }> =>
    request<{ draftId: string }>("POST", API.APPOINTMENTS_DRAFT);

export const fetchAppointmentAttachments = (id: string): Promise<FileAsset[]> =>
    request<FileAsset[]>("GET", `${API.APPOINTMENTS}/${id}/attachments`);

export const deleteAppointmentAttachment = (
    id: string,
    fileId: string,
): Promise<null> =>
    request<null>("DELETE", `${API.APPOINTMENTS}/${id}/attachments/${fileId}`);

export interface CreateAppointmentParams {
    serviceId: string;
    houseId: string;
    timeSlotId: string;
    // Dinh dang "YYYY-MM-DD".
    appointedDate: string;
    note?: string;
    // Chi dien khi To truong/To pho dat ho cu dan khong co tai khoan - bo qua
    // (khong gui) khi tu dat lich cho chinh minh.
    proxyName?: string;
    proxyPhone?: string;
    draftId?: string;
}

export const createAppointment = (
    params: CreateAppointmentParams,
): Promise<Appointment> =>
    request<Appointment>("POST", API.APPOINTMENTS, params);

/**
 * Cac lich hen cua chinh nguoi dang dang nhap - bao gom ca lich do ho dat
 * thay (To truong/To pho dat ho, xem createAppointment). Xem GET
 * /api/appointments/my.
 */
export const fetchMyAppointments = (
    params: {
        status?: AppointmentStatus;
        page?: number;
        limit?: number;
    } = {},
): Promise<PaginatedData<Appointment>> =>
    request<PaginatedData<Appointment>>("GET", API.APPOINTMENTS_MINE, {
        status: params.status,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
    });

export const fetchAppointmentDetail = (id: string): Promise<Appointment> =>
    request<Appointment>("GET", `${API.APPOINTMENTS}/${id}`);

export const cancelAppointment = (
    id: string,
    reason?: string,
): Promise<Appointment> =>
    request<Appointment>("POST", `${API.APPOINTMENTS}/${id}/cancel`, {
        reason,
    });

/**
 * Danh gia buoi lam viec - chi goi duoc mot lan, va chi khi trang thai dang
 * la "hoan_thanh" (xem confirmComplaintResolution trong complaintApi.ts cho
 * mot mau tuong tu ben Phan anh).
 */
export const rateAppointment = (
    id: string,
    rating: number,
    ratingNote?: string,
): Promise<Appointment> =>
    request<Appointment>("POST", `${API.APPOINTMENTS}/${id}/rate`, {
        rating,
        ratingNote,
    });
