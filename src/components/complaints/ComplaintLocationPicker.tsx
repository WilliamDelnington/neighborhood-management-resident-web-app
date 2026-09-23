import React, { useState } from "react";
import { Box, Text, useSnackbar } from "@components/ui";
import { Checkbox } from "@components/customized";
import StaticMapPinConfirm from "@components/house/StaticMapPinConfirm";
import type { HouseGisSource } from "@dts";

export interface ComplaintGeoValues {
    gisLatitude: number | null;
    gisLongitude: number | null;
    gisAccuracyMeters: number | null;
    gisSource: HouseGisSource | "";
    // Bat buoc = true truoc khi backend chap nhan luu toa do (du lieu vi tri
    // nhay cam theo Luat BVDLCN so 91/2025/QH15) - xem
    // requiresComplaintGeoConsent trong validators/complaint.ts o backend.
    geoConsentAccepted: boolean;
}

export const EMPTY_COMPLAINT_GEO: ComplaintGeoValues = {
    gisLatitude: null,
    gisLongitude: null,
    gisAccuracyMeters: null,
    gisSource: "",
    geoConsentAccepted: false,
};

const CONSENT_NOTICE =
    "Tôi đồng ý cho phép hệ thống thu thập tọa độ vị trí hiện tại của tôi (dữ liệu cá nhân nhạy cảm theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15) để đính kèm vào phản ánh này, giúp cán bộ xác định đúng vị trí sự việc.";

interface PendingPin {
    lat: number;
    lng: number;
    accuracyMeters: number | null;
}

interface ComplaintLocationPickerProps {
    values: ComplaintGeoValues;
    onChange: (values: ComplaintGeoValues) => void;
}

/**
 * PERMISSION_DENIED bao gom ca truong hop trinh duyet TU DONG chan prompt xin
 * quyen (vd Chrome sau nhieu lan nguoi dung bo qua/tu choi) - luc nay goi lai
 * getCurrentPosition se KHONG bao giu hien prompt nua, chi bao loi ngay lap
 * tuc, nen thong bao chung "Hay cap quyen dinh vi" (voi ham y "bam cho phep o
 * hop thoai") gay hieu lam. Phai huong dan nguoi dung vao cai dat trang web
 * cua trinh duyet de cap lai quyen thu cong.
 */
// Ma loi theo dung chuan Geolocation API (khong doi) - tranh phai tham chieu
// truc tiep type GeolocationPositionError (eslint no-undef khong nhan dien
// duoc global nay tu env "browser" hien tai).
const GEOLOCATION_ERROR_CODE = {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
} as const;

const describeGeolocationError = (err: { code: number }): string => {
    if (err.code === GEOLOCATION_ERROR_CODE.PERMISSION_DENIED) {
        return "Trình duyệt đã chặn quyền định vị cho trang này (thường do đã từ chối/bỏ qua yêu cầu cấp quyền nhiều lần trước đó). Vui lòng mở phần cài đặt trang web của trình duyệt (biểu tượng khóa/thông tin cạnh thanh địa chỉ) → Vị trí → Cho phép, sau đó tải lại trang.";
    }
    if (err.code === GEOLOCATION_ERROR_CODE.POSITION_UNAVAILABLE) {
        return "Không xác định được vị trí hiện tại. Vui lòng kiểm tra kết nối mạng/GPS và thử lại.";
    }
    if (err.code === GEOLOCATION_ERROR_CODE.TIMEOUT) {
        return "Hết thời gian chờ lấy vị trí. Vui lòng thử lại.";
    }
    return "Không lấy được vị trí. Hãy cấp quyền định vị.";
};

/**
 * Dinh vi GPS tuy chon cho phan anh - phien ban rut gon cua HouseLocationPicker
 * (chi che do GPS, khong co tra cuu dia chi/nhap thu cong vi phan anh can
 * "vi tri hien tai" nhanh hon la dia chi chinh xac cua mot nha so). Van tai su
 * dung StaticMapPinConfirm de nguoi dung dieu chinh diem chot tren ban do
 * truoc khi xac nhan, va yeu cau dong y thu thap vi tri truoc khi lay GPS.
 */
const ComplaintLocationPicker: React.FC<ComplaintLocationPickerProps> = ({
    values,
    onChange,
}) => {
    const { openSnackbar } = useSnackbar();
    const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
    const [locating, setLocating] = useState(false);

    const hasPin = values.gisLatitude != null && values.gisLongitude != null;

    const useGps = () => {
        if (!navigator.geolocation) {
            openSnackbar({
                type: "error",
                text: "Thiết bị không hỗ trợ định vị GPS",
            });
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            position => {
                setLocating(false);
                setPendingPin({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracyMeters: position.coords.accuracy ?? null,
                });
            },
            err => {
                setLocating(false);
                openSnackbar({
                    type: "error",
                    text: describeGeolocationError(err),
                });
            },
            { enableHighAccuracy: true, timeout: 12000 },
        );
    };

    const confirmPin = (lat: number, lng: number) => {
        onChange({
            ...values,
            gisLatitude: lat,
            gisLongitude: lng,
            gisAccuracyMeters: pendingPin?.accuracyMeters ?? null,
            gisSource: "device_gps",
        });
        setPendingPin(null);
    };

    const clearPin = () => {
        onChange({ ...EMPTY_COMPLAINT_GEO });
        setPendingPin(null);
    };

    return (
        <Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Text size="xSmall" className="font-medium text-text_1 mb-1">
                Vị trí GPS (không bắt buộc)
            </Text>

            {!hasPin && !pendingPin && !values.geoConsentAccepted && (
                <Box className="bg-ng_10 rounded-lg p-3">
                    <Text size="xSmall" className="text-text_2 mb-2">
                        {CONSENT_NOTICE}
                    </Text>
                    <Checkbox
                        label="Tôi đồng ý"
                        value="geo_consent"
                        checked={values.geoConsentAccepted}
                        onChange={() =>
                            onChange({ ...values, geoConsentAccepted: true })
                        }
                    />
                </Box>
            )}

            {!hasPin && !pendingPin && values.geoConsentAccepted && (
                <Box
                    className="bg-ng_10 rounded-lg px-3 py-2"
                    onClick={locating ? undefined : useGps}
                >
                    <Text size="small" className="text-main">
                        {locating
                            ? "Đang lấy vị trí..."
                            : "Đính kèm vị trí hiện tại (GPS)"}
                    </Text>
                </Box>
            )}

            {pendingPin && (
                <StaticMapPinConfirm
                    initialLat={pendingPin.lat}
                    initialLng={pendingPin.lng}
                    onConfirm={confirmPin}
                    onCancel={() => setPendingPin(null)}
                />
            )}

            {!pendingPin &&
                values.gisLatitude != null &&
                values.gisLongitude != null && (
                    <Box
                        flex
                        alignItems="center"
                        justifyContent="space-between"
                        p={3}
                        className="bg-ng_10 border border-ng_20 rounded-xl"
                    >
                        <Text size="small" className="text-main">
                            Đã đính kèm vị trí ({values.gisLatitude.toFixed(6)},{" "}
                            {values.gisLongitude.toFixed(6)})
                        </Text>
                        <Text
                            size="xSmall"
                            className="text-text_2"
                            onClick={clearPin}
                        >
                            Xóa
                        </Text>
                    </Box>
                )}
        </Box>
    );
};

export default ComplaintLocationPicker;
