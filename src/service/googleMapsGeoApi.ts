import { API } from "@constants/common";
import { request } from "./request";

/**
 * Goi qua proxy backend (KHONG bao gio goi thang Google tu client - khoa API
 * chi ton tai o server, xem googleMaps.ts backend). Ca 3 endpoint deu yeu cau
 * quyen houses.create/update/update_gis - chi nguoi dang tao/sua nha so moi
 * goi duoc, giup gioi han chi phi Google.
 */

export interface GeoAutocompletePrediction {
    placeId: string;
    text: string;
}

export const autocompleteAddress = (
    input: string,
    sessionToken: string,
): Promise<GeoAutocompletePrediction[]> =>
    request<GeoAutocompletePrediction[]>(
        "POST",
        API.HOUSES_GEO_AUTOCOMPLETE,
        { input, sessionToken },
    );

export interface GeoPlaceDetails {
    lat: number;
    lng: number;
    formattedAddress: string;
}

export const fetchPlaceDetails = (
    placeId: string,
    sessionToken: string,
): Promise<GeoPlaceDetails> =>
    request<GeoPlaceDetails>("POST", API.HOUSES_GEO_PLACE_DETAILS, {
        placeId,
        sessionToken,
    });

export interface GeoStaticMap {
    base64: string;
    mimeType: string;
    width: number;
    height: number;
    zoom: number;
    centerLat: number;
    centerLng: number;
}

/**
 * Goi DUY NHAT MOT LAN cho ca phien xac nhan pin (khong goi lai khi nguoi
 * dung keo pin) - xem StaticMapPinConfirm.tsx.
 */
export const fetchStaticMap = (
    lat: number,
    lng: number,
    zoom?: number,
): Promise<GeoStaticMap> =>
    request<GeoStaticMap>("POST", API.HOUSES_GEO_STATIC_MAP, {
        lat,
        lng,
        zoom,
    });
