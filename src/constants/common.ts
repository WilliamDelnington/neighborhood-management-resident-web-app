export const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * URL cua trang quan tri web rieng (quan-ly-to-dan-pho-hoa-binh-admin) - mo trong
 * trinh duyet ngoai qua openWebView, khong con nam trong Mini App nay nua.
 */
export const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL as string;

/**
 * File anh (News.coverImageUrl/images) duoc backend luu duong dan tuong doi
 * (vd "/uploads/news/<id>/<file>.jpg"). Trinh duyet phai tai anh o goc
 * BASE_URL (noi backend serve thu muc public/uploads) chu khong phai goc cua
 * chinh Mini App nay - giong ly do resolveAssetUrl ben admin-web-app.
 */
export function resolveAssetUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    return new URL(url, BASE_URL || window.location.origin).toString();
}

export const API = {
    AUTH_ZALO_LOGIN: "/api/auth/zalo/login",
    AUTH_REGISTER: "/api/auth/register",
    AUTH_LOGIN: "/api/auth/login",
    AUTH_SET_PASSWORD: "/api/auth/set-password",
    AUTH_CHANGE_PHONE: "/api/auth/change-phone",
    AUTH_OTP_REQUEST: "/api/auth/otp/request",
    AUTH_OTP_VERIFY: "/api/auth/otp/verify",
    AUTH_ME: "/api/auth/me",
    AUTH_LOGOUT: "/api/auth/logout",

    USERS_ASSIGNABLE_STAFF: "/api/users/assignable-staff",
    HOUSES: "/api/houses",
    HOUSES_MINE: "/api/houses/mine",
    HOUSES_GEO_AUTOCOMPLETE: "/api/houses/geo/autocomplete",
    HOUSES_GEO_PLACE_DETAILS: "/api/houses/geo/place-details",
    HOUSES_GEO_GEOCODE: "/api/houses/geo/geocode",
    NEIGHBORHOODS_MINE: "/api/neighborhoods/mine",
    DASHBOARD_MINE: "/api/dashboard/mine",
    ORGANIZATIONS: "/api/organizations",
    HOUSEHOLDS: "/api/households",
    HOUSEHOLDS_LOOKUP: "/api/households/lookup",
    CITIZENS: "/api/citizens",
    STREETS: "/api/streets",
    NEIGHBORHOODS: "/api/neighborhoods",
    BUSINESSES: "/api/businesses",
    BUSINESS_TYPES: "/api/business-types",
    COMPANIES: "/api/companies",

    COMPLAINT_TYPES: "/api/complaint-types",
    COMPLAINTS: "/api/complaints",
    COMPLAINTS_MINE: "/api/complaints/mine",
    COMPLAINTS_LOOKUP: "/api/complaints/lookup",
    COMPLAINTS_DRAFT: "/api/complaints/draft",

    SUPPORT_TICKETS: "/api/support-tickets",
    SUPPORT_TICKETS_MINE: "/api/support-tickets/mine",

    ANNOUNCEMENTS: "/api/announcements",
    NEWS: "/api/news",
    CORRESPONDENCE_TYPES: "/api/correspondence-types",
    CORRESPONDENCES: "/api/correspondences",
    CHANGE_REQUESTS: "/api/change-requests",
    REQUESTS: "/api/requests",
    REQUESTS_MY: "/api/requests/my",
    INSPECTION_CAMPAIGNS: "/api/v1/neighborhood/inspection-campaigns",
    INSPECTIONS_V1: "/api/v1",
    MEETINGS: "/api/meetings",
    SURVEYS: "/api/surveys",

    APPOINTMENT_SERVICES: "/api/appointment-services",
    APPOINTMENTS: "/api/appointments",
    APPOINTMENTS_DRAFT: "/api/appointments/draft",
    APPOINTMENTS_AVAILABLE_SLOTS: "/api/appointments/available-slots",
    APPOINTMENTS_MINE: "/api/appointments/my",

    NOTIFICATIONS: "/api/notifications",
    NOTIFICATIONS_UNREAD_COUNT: "/api/notifications/unread-count",
    NOTIFICATIONS_READ_ALL: "/api/notifications/read-all",

    FILES: "/api/files",
    UTILITY_APPS: "/api/utility-apps",
    SETTINGS: "/api/settings",

    UPLOADS_TOKEN: "/api/uploads/token",
    UPLOADS_ATTACHMENTS: "/api/uploads/attachments",
};

export const SEARCH_NOT_FOUND = "Không tìm thấy thông tin";

export const DEFAULT_PAGE_SIZE = 10;
