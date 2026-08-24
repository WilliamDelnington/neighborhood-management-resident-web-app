import { API } from "@constants/common";
import { Organization, PaginatedData } from "@dts";
import { request } from "./request";

/**
 * Yeu cau quyen organizations.read. Backend tu gioi han theo nguoi dai dien
 * (house_owner chi thay to chuc cua chinh minh) - xem organizationService.ts.
 */
export const fetchOrganizations = (
    params: {
        page?: number;
        limit?: number;
        search?: string;
        active?: boolean;
    } = {},
): Promise<PaginatedData<Organization>> =>
    request<PaginatedData<Organization>>("GET", API.ORGANIZATIONS, {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        search: params.search,
        active: params.active,
    });

export const fetchOrganizationById = (id: string): Promise<Organization> =>
    request<Organization>("GET", `${API.ORGANIZATIONS}/${id}`);
