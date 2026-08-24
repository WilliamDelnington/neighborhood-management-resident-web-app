import { API } from "@constants/common";
import { CorrespondenceType, PaginatedData } from "@dts";
import { request } from "./request";

/**
 * Danh sach loai van ban ma nguoi dang dang nhap co the gui (vai tro cua ho
 * nam trong allowedSenderRoles) - dung cho bo chon loai van ban khi soan, chi
 * doi hoi dang nhap - xem app/api/correspondence-types/route.ts o backend.
 */
export const fetchEligibleSenderCorrespondenceTypes = (): Promise<
    PaginatedData<CorrespondenceType>
> =>
    request<PaginatedData<CorrespondenceType>>(
        "GET",
        API.CORRESPONDENCE_TYPES,
        { eligibleSender: 1, limit: 100 },
    );
