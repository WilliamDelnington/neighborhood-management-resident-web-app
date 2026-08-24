import { API } from "@constants/common";
import {
    HouseOwnership,
    HouseOwnershipRelationshipType,
    OwnerType,
} from "@dts";
import { request } from "./request";

export const fetchHouseOwnerships = (
    houseId: string,
): Promise<HouseOwnership[]> =>
    request<HouseOwnership[]>("GET", `${API.HOUSES}/${houseId}/ownerships`);

export interface AddHouseOwnershipInput {
    ownerType: OwnerType;
    // Mot trong hai: ownerId (chon to chuc qua OrganizationPickerSheet) hoac
    // phone (nhap tay, chi ap dung voi ownerType="user" - backend tim tai
    // khoan CO SAN theo so dien thoai; neu chua co VA kem displayName+password
    // VA nguoi goi co quyen "users.create", se tao tai khoan moi luon - xem
    // houseOwnershipService.resolveExistingOwnerId o backend).
    ownerId?: string;
    phone?: string;
    // Chi dung khi tao tai khoan moi (phone chua co tai khoan) - bo qua neu
    // phone da co tai khoan san, hoac nguoi goi khong co quyen "users.create".
    displayName?: string;
    password?: string;
    relationshipType: HouseOwnershipRelationshipType;
    reason?: string;
}

// relationshipType="primary_owner" se CHUYEN chu so huu chinh (ket thuc quan
// he primary_owner dang active va tao quan he moi) thay vi chi them - xem
// houseOwnershipService.addHouseOwnership o backend.
export const addHouseOwnership = (
    houseId: string,
    input: AddHouseOwnershipInput,
): Promise<HouseOwnership> =>
    request<HouseOwnership>(
        "POST",
        `${API.HOUSES}/${houseId}/ownerships`,
        input,
    );

export const endHouseOwnership = (
    houseId: string,
    ownershipId: string,
    reason?: string,
): Promise<HouseOwnership> =>
    request<HouseOwnership>(
        "PATCH",
        `${API.HOUSES}/${houseId}/ownerships/${ownershipId}`,
        { reason },
    );
