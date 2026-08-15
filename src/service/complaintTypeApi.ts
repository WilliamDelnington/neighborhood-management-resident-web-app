import { API } from "@constants/common";
import { ComplaintTypeDefinition, PaginatedData } from "@dts";
import { request } from "./request";

export const fetchComplaintTypeDefinitions = (
    params: {
        search?: string;
        active?: boolean;
        page?: number;
        limit?: number;
    } = {},
): Promise<PaginatedData<ComplaintTypeDefinition>> => {
    let active: string | undefined;
    if (params.active !== undefined) {
        active = params.active ? "1" : "0";
    }
    return request<PaginatedData<ComplaintTypeDefinition>>(
        "GET",
        API.COMPLAINT_TYPES,
        {
            search: params.search,
            active,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
        },
    );
};
