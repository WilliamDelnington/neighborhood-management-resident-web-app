import { API } from "@constants/common";
import { PaginatedData, UtilityApp } from "@dts";
import { request } from "./request";

/**
 * Danh sach "Nhom tien ich" dang hien thi (active=true) - dung cho hang cuon
 * ngang tren trang chu. Endpoint cong khai, khong can dang nhap.
 */
export const fetchUtilityApps = (): Promise<PaginatedData<UtilityApp>> =>
    request<PaginatedData<UtilityApp>>(
        "GET",
        API.UTILITY_APPS,
        { limit: 50 },
        { useAuth: false },
    );
