import { API } from "@constants/common";
import { MyNeighborhoodInfo, Neighborhood, PaginatedData } from "@dts";
import { request } from "./request";

/**
 * Yeu cau quyen neighborhoods.read. Tra ve to dan pho chinh thuc (xem
 * neighborhoodService.listNeighborhoods o backend) de chon luc tao/sua nha so
 * (xem NeighborhoodPickerSheet.tsx) - gan truc tiep neighborhoodId cho nha,
 * khong suy ra tu Street.
 */
export const fetchNeighborhoods = (
    params: {
        page?: number;
        limit?: number;
        search?: string;
        active?: boolean;
    } = {},
): Promise<PaginatedData<Neighborhood>> =>
    request<PaginatedData<Neighborhood>>("GET", API.NEIGHBORHOODS, {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        search: params.search,
        active: params.active,
    });

export const fetchNeighborhoodById = (id: string): Promise<Neighborhood> =>
    request<Neighborhood>("GET", `${API.NEIGHBORHOODS}/${id}`);

/**
 * To dan pho (cac to) gan voi nha cua nguoi dang dang nhap, chi tra ve truong
 * cong khai an toan - xem app/api/neighborhoods/mine o backend. Khac
 * fetchNeighborhoods o tren (yeu cau neighborhoods.read, danh cho nhan vien).
 */
export const fetchMyNeighborhoods = (): Promise<MyNeighborhoodInfo[]> =>
    request<MyNeighborhoodInfo[]>("GET", API.NEIGHBORHOODS_MINE);
