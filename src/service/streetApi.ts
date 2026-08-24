import { API } from "@constants/common";
import { PaginatedData, Street } from "@dts";
import { request } from "./request";

/**
 * Yeu cau quyen streets.read. Mini app chi doc danh sach duong/pho de chon
 * luc tao/sua nha so (xem HouseForm.tsx) - khong tao/sua Street o day.
 */
export const fetchStreets = (
    params: {
        page?: number;
        limit?: number;
        search?: string;
        active?: boolean;
    } = {},
): Promise<PaginatedData<Street>> =>
    request<PaginatedData<Street>>("GET", API.STREETS, {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        search: params.search,
        active: params.active,
    });

export const fetchStreetById = (id: string): Promise<Street> =>
    request<Street>("GET", `${API.STREETS}/${id}`);
