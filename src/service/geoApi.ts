import { API } from "@constants/common";
import { request } from "./request";

/**
 * Goi qua proxy backend (KHONG bao gio goi thang Goong tu client bang API key
 * REST - khoa do chi ton tai o server, xem goong.ts backend). Ca 3 endpoint
 * deu yeu cau quyen houses.create/update/update_gis - chi nguoi dang tao/sua
 * nha so moi goi duoc. Rieng ban do xac nhan pin (StaticMapPinConfirm.tsx)
 * khong qua day nua - no goi thang Goong Map Tiles tu client bang
 * VITE_GOONG_MAP_KEY (mot Map Key rieng, han che theo domain, khac API key
 * REST o day).
 */

export interface GeoAutocompletePrediction {
    placeId: string;
    text: string;
}

export const autocompleteAddress = (
    input: string,
    sessionToken: string,
): Promise<GeoAutocompletePrediction[]> =>
    request<GeoAutocompletePrediction[]>("POST", API.HOUSES_GEO_AUTOCOMPLETE, {
        input,
        sessionToken,
    });

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

/**
 * Geocode 1 lan cho dia chi DAY DU (so nha + duong + phuong/xa + tinh, xem
 * HouseForm.tsx ghep chuoi) - dung khi da biet chac cac thanh phan dia chi,
 * khong can nguoi dung go tim va chon tu danh sach goi y nhu
 * autocompleteAddress + fetchPlaceDetails o tren.
 */
export const geocodeAddress = (address: string): Promise<GeoPlaceDetails> =>
    request<GeoPlaceDetails>("POST", API.HOUSES_GEO_GEOCODE, { address });
