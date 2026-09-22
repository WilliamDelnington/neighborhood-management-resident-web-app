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
            () => {
                setLocating(false);
                openSnackbar({
                    type: "error",
                    text: "Không lấy được vị trí. Hãy cấp quyền định vị.",
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
