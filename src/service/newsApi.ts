import { API, DEFAULT_PAGE_SIZE } from "@constants/common";
import { News, PaginatedData } from "@dts";
import { request } from "./request";

export const fetchPublicNews = (
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
): Promise<PaginatedData<News>> =>
    request<PaginatedData<News>>(
        "GET",
        API.NEWS,
        { page, limit },
        { useAuth: false },
    );

export const fetchNewsDetail = (id: string): Promise<News> =>
    request<News>("GET", `${API.NEWS}/${id}`, undefined, {
        useAuth: false,
    });
