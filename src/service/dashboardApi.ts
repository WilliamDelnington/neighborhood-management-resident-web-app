import { API } from "@constants/common";
import { MyHouseDashboard } from "@dts";
import { request } from "./request";

/**
 * Dashboard hanh dong (C01) cua nguoi dang dang nhap - xem
 * app/api/dashboard/mine o backend.
 */
export const fetchMyDashboard = (): Promise<MyHouseDashboard> =>
    request<MyHouseDashboard>("GET", API.DASHBOARD_MINE);
