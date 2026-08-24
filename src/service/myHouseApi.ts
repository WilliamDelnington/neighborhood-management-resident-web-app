import { API } from "@constants/common";
import { MyHouseOverviewItem } from "@dts";
import { request } from "./request";

/**
 * Nha (so) ma nguoi dang dang nhap dang "thao tac thay chu nha" - xem
 * app/api/houses/mine o backend (quyen suy tu HouseOwnership, khong can
 * permission houses.read nhu /api/houses/[id] danh cho nhan vien).
 */
export const fetchMyHouses = (): Promise<MyHouseOverviewItem[]> =>
    request<MyHouseOverviewItem[]>("GET", API.HOUSES_MINE);
