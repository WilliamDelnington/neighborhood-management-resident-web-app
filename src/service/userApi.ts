import { API } from "@constants/common";
import { AssignableStaff, Role, User } from "@dts";
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

/**
 * Tao tai khoan phone+password thay cho nguoi khac - man "Tạo tài khoản" o
 * trang Quản trị (xem CreateAccountPage.tsx), dung chung endpoint
 * POST /api/users voi admin-web-app (userService.createHouseOwnerByStaff).
 * Doi hoi permission "users.create"; role khac "house_owner" chi duoc chap
 * nhan neu nam trong fetchCreatableRoles() cua actor (backend tu choi neu
 * khong, xem userService.getCreatableRolesForActor).
 */
export interface CreateAccountParams {
    phone: string;
    displayName: string;
    address?: string;
    idNumber: string;
    role?: Role;
    password?: string;
}

export const createAccount = (params: CreateAccountParams): Promise<User> =>
    request<User>("POST", API.USERS, params);

/**
 * Danh sach vai tro (key + ten) ma nguoi dang dang nhap duoc phep chon khi
 * "Tạo tài khoản" - LUON co house_owner, cong them cac vai tro nam trong
 * Role.allowedCreatableRoles cua bat ky vai tro nao actor dang giu (hoac tat
 * ca vai tro active neu actor la admin) - xem
 * userService.getCreatableRolesForActor o backend.
 */
export const fetchCreatableRoles = (): Promise<{ key: Role; name: string }[]> =>
    request<{ key: Role; name: string }[]>("GET", API.USERS_CREATABLE_ROLES);
