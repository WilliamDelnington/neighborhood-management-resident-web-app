import { API } from "@constants/common";
import { AssignableStaff, Role } from "@dts";
import { request } from "./request";

/**
 * Danh sach rut gon nhan vien thuoc mot trong cac vai tro cu the - dung cho bo
 * chon nguoi nhan khi soan Van ban (xem CorrespondenceType.allowedReceiverRoles),
 * xem app/api/users/assignable-staff/route.ts o backend (tham so ?roles=).
 */
export const fetchAssignableStaffByRoles = (
    roles: Role[],
): Promise<AssignableStaff[]> =>
    roles.length === 0
        ? Promise.resolve([])
        : request<AssignableStaff[]>("GET", API.USERS_ASSIGNABLE_STAFF, {
              roles: roles.join(","),
          });
