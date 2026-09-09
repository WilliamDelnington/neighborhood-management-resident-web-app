import React, { useEffect, useRef, useState } from "react";
import { Box, Text, useSnackbar } from "@components/ui";
import { Button, Checkbox, Input, Radio } from "@components/customized";
import StaticMapPinConfirm from "@components/house/StaticMapPinConfirm";
import {
    autocompleteAddress,
    fetchPlaceDetails,
    geocodeAddress,
    GeoAutocompletePrediction,
} from "@service/geoApi";
import type { HouseGisSource } from "@dts";

export type GeoMode = "address" | "gps" | "manual" | "skip";

export interface HouseGeoValues {
    geoMode: GeoMode;
    gisLatitude: number | null;
    gisLongitude: number | null;
    gisAccuracyMeters: number | null;
    gisSource: HouseGisSource | "";
    // Bat buoc = true khi geoMode la "address"/"gps" (du lieu vi tri nhay cam
    // theo Luat BVDLCN so 91/2025/QH15) truoc khi backend chap nhan luu - xem
    // requiresGeoConsent trong validators/houseRecord.ts o backend.
    geoConsentAccepted: boolean;
}

export const EMPTY_HOUSE_GEO: HouseGeoValues = {
    geoMode: "skip",
    gisLatitude: null,
    gisLongitude: null,
    gisAccuracyMeters: null,
    gisSource: "",
    geoConsentAccepted: false,
};

export function isHouseGeoValid(values: HouseGeoValues): boolean {
    if (values.geoMode === "skip") return true;
    if (values.geoMode === "manual") {
        return values.gisLatitude !== null && values.gisLongitude !== null;
    }
    return (
        values.geoConsentAccepted === true &&
        values.gisLatitude !== null &&
        values.gisLongitude !== null
    );
}

const GEO_MODE_OPTIONS: { value: GeoMode; label: string }[] = [
    { value: "address", label: "Tra cứu địa chỉ" },
    { value: "gps", label: "Vị trí hiện tại (GPS)" },
    { value: "manual", label: "Nhập tọa độ thủ công" },
    { value: "skip", label: "Bỏ qua" },
];

const CONSENT_NOTICE =
    'Tôi đồng ý cho phép hệ thống thu thập tọa độ vị trí nhà của tôi (dữ liệu cá nhân nhạy cảm theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15). Tọa độ này sẽ chỉ được hiển thị cho Tổ trưởng/Tổ phó, Bí thư/Cán bộ UBND phường phụ trách khu vực để phục vụ quản lý dân cư. Bạn có thể chọn "Nhập tọa độ thủ công" hoặc "Bỏ qua" nếu không muốn chia sẻ vị trí chính xác.';

interface PendingPin {
    lat: number;
    lng: number;
    accuracyMeters: number | null;
}

interface HouseLocationPickerProps {
    values: HouseGeoValues;
    onChange: (values: HouseGeoValues) => void;
    // Dia chi da nhap o buoc truoc (truong "Dia chi" +/- ten duong/pho da
    // chon) - dung de nap san o tim kiem khi chuyen sang che do "Tra cuu dia
    // chi", tranh bat nguoi dung phai go lai tu dau (xem HouseForm.tsx).
    // Nguoi dung van co the sua/xoa truoc khi tim.
    initialAddress?: string;
    // Dia chi DAY DU (so nha + duong/pho + phuong/xa + tinh/thanh cua To dan
    // pho da chon, xem HouseForm.tsx ghep chuoi) - du de geocode CHINH XAC 1
    // lan qua Goong (goong.ts backend), khong can nguoi dung go tim/chon tu
    // danh sach goi y nua. Chi hien nut nay khi da co du thanh phan (con
    // undefined neu chua chon duong/pho hoac to dan pho).
    fullAddress?: string;
}

/**
 * Chon nguon toa do nha so: dia chi (Google Places, qua proxy backend) / GPS
 * thiet bi / nhap thu công / bo qua. Voi dia chi va GPS, sau khi co toa do
 * tho, bat buoc phai xac nhan/dieu chinh qua StaticMapPinConfirm (dia chi
 * ngo/hem o VN thuong khong duoc dinh vi chinh xac tu Google) va phai dong y
 * dieu khoan thu thap vi tri truoc khi duoc phep luu.
 */
const HouseLocationPicker: React.FC<HouseLocationPickerProps> = ({
    values,
    onChange,
    initialAddress,
    fullAddress,
}) => {
    const { openSnackbar } = useSnackbar();
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<GeoAutocompletePrediction[]>(
        [],
    );
    const [searching, setSearching] = useState(false);
    const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
    const [locating, setLocating] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    // true = bo qua ban xem truoc dia chi day du, quay ve go tim thu cong nhu
    // truoc day (vd khi geocodeFullAddress that bai, hoac dia chi day du sai).
    const [useManualSearch, setUseManualSearch] = useState(false);
    const sessionTokenRef = useRef<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getSessionToken = () => {
        if (!sessionTokenRef.current) {
            sessionTokenRef.current = crypto.randomUUID();
        }
        return sessionTokenRef.current;
    };

    const resetFlow = () => {
        setSearchText("");
        setSuggestions([]);
        setPendingPin(null);
        setUseManualSearch(false);
        sessionTokenRef.current = null;
    };

    const selectMode = (mode: GeoMode) => {
        if (mode === values.geoMode) return;
        resetFlow();
        if (mode === "address" && initialAddress) {
            setSearchText(initialAddress);
        }
        onChange({
            geoMode: mode,
            gisLatitude: null,
            gisLongitude: null,
            gisAccuracyMeters: null,
            gisSource: "",
            geoConsentAccepted: false,
        });
    };

    useEffect(() => {
        if (values.geoMode !== "address" || !values.geoConsentAccepted)
            return undefined;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const query = searchText.trim();
        if (query.length < 3) {
            setSuggestions([]);
            return undefined;
        }
        debounceRef.current = setTimeout(async () => {
            try {
                setSearching(true);
                const results = await autocompleteAddress(
                    query,
                    getSessionToken(),
                );
                setSuggestions(results);
            } catch {
                setSuggestions([]);
            } finally {
                setSearching(false);
            }
        }, 400);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, values.geoMode, values.geoConsentAccepted]);

    const pickSuggestion = async (prediction: GeoAutocompletePrediction) => {
        try {
            const details = await fetchPlaceDetails(
                prediction.placeId,
                getSessionToken(),
            );
            sessionTokenRef.current = null; // session ket thuc sau Place Details
            setSuggestions([]);
            setSearchText(details.formattedAddress || prediction.text);
            setPendingPin({
                lat: details.lat,
                lng: details.lng,
                accuracyMeters: null,
            });
        } catch {
            openSnackbar({
                type: "error",
                text: "Không lấy được chi tiết địa chỉ. Vui lòng thử lại.",
            });
        }
    };

    /**
     * Geocode 1 lan cho dia chi DAY DU (fullAddress, xem HouseForm.tsx ghep
     * chuoi) - khong qua Autocomplete/Place Details, khong can nguoi dung go
     * tim/chon tu danh sach goi y. Neu that bai (khong tim thay/dia chi sai
     * dinh dang), rot ve o tim kiem thu cong voi fullAddress nap san.
     */
    const geocodeFullAddress = async () => {
        if (!fullAddress) return;
        try {
            setGeocoding(true);
            const details = await geocodeAddress(fullAddress);
            setPendingPin({
                lat: details.lat,
                lng: details.lng,
                accuracyMeters: null,
            });
        } catch {
            openSnackbar({
                type: "error",
                text: "Không xác định được tọa độ từ địa chỉ này. Vui lòng tìm thủ công.",
            });
            setUseManualSearch(true);
            setSearchText(fullAddress);
        } finally {
            setGeocoding(false);
        }
    };

    const useGps = () => {
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
        const source: HouseGisSource =
            values.geoMode === "address" ? "address_lookup" : "device_gps";
        onChange({
            ...values,
            gisLatitude: lat,
            gisLongitude: lng,
            gisAccuracyMeters: pendingPin?.accuracyMeters ?? null,
            gisSource: source,
        });
        setPendingPin(null);
    };

    const MANUAL_BOUNDS: Record<"gisLatitude" | "gisLongitude", number> = {
        gisLatitude: 90,
        gisLongitude: 180,
    };

    const setManualValue = (
        key: "gisLatitude" | "gisLongitude",
        raw: string,
    ) => {
        const parsed = raw.trim() === "" ? null : Number(raw);
        const bound = MANUAL_BOUNDS[key];
        const valid =
            parsed !== null &&
            Number.isFinite(parsed) &&
            Math.abs(parsed) <= bound;
        onChange({
            ...values,
            [key]: valid ? parsed : null,
            gisSource: "manual",
        });
    };

    return (
        <Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Text size="xSmall" className="text-text_2 mb-1">
                Vị trí nhà trên bản đồ
            </Text>
            <Box flex style={{ gap: 12, flexWrap: "wrap" }}>
                {GEO_MODE_OPTIONS.map(option => (
                    <Radio
                        key={option.value}
                        label={option.label}
                        checked={values.geoMode === option.value}
                        onChange={() => selectMode(option.value)}
                    />
                ))}
            </Box>

            {(values.geoMode === "address" || values.geoMode === "gps") &&
                !values.geoConsentAccepted &&
                !values.gisLatitude && (
                    <Box className="bg-ng_10 rounded-lg p-3">
                        <Text size="xSmall" className="text-text_2 mb-2">
                            {CONSENT_NOTICE}
                        </Text>
                        <Checkbox
                            label="Tôi đồng ý"
                            value="geo_consent"
                            checked={values.geoConsentAccepted}
                            onChange={() =>
                                onChange({
                                    ...values,
                                    geoConsentAccepted: true,
                                })
                            }
                        />
                    </Box>
                )}

            {values.geoMode === "address" &&
                values.geoConsentAccepted &&
                !pendingPin &&
                !values.gisLatitude &&
                (fullAddress && !useManualSearch ? (
                    <Box
                        className="bg-ng_10 rounded-lg p-3"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        <Text size="small">{fullAddress}</Text>
                        <Button
                            onClick={geocodeFullAddress}
                            disabled={geocoding}
                        >
                            {geocoding
                                ? "Đang xác định tọa độ..."
                                : "Xác định tọa độ từ địa chỉ này"}
                        </Button>
                        <Text
                            size="xSmall"
                            className="text-main"
                            onClick={() => {
                                setUseManualSearch(true);
                                setSearchText(fullAddress);
                            }}
                        >
                            Tìm địa chỉ khác
                        </Text>
                    </Box>
                ) : (
                    <Box>
                        <Input
                            placeholder="Nhập số nhà, đường, phường..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                        {searching && (
                            <Text size="xSmall" className="text-text_3 mt-1">
                                Đang tìm...
                            </Text>
                        )}
                        {suggestions.map(prediction => (
                            <Box
                                key={prediction.placeId}
                                className="bg-ng_10 rounded-lg px-3 py-2 mt-1"
                                onClick={() => pickSuggestion(prediction)}
                            >
                                <Text size="small">{prediction.text}</Text>
                            </Box>
                        ))}
                        {fullAddress && (
                            <Text
                                size="xSmall"
                                className="text-main mt-1"
                                onClick={() => setUseManualSearch(false)}
                            >
                                Quay lại địa chỉ đã nhập
                            </Text>
                        )}
                    </Box>
                ))}

            {values.geoMode === "gps" &&
                values.geoConsentAccepted &&
                !pendingPin &&
                !values.gisLatitude && (
                    <Box
                        className="bg-ng_10 rounded-lg px-3 py-2"
                        onClick={locating ? undefined : useGps}
                    >
                        <Text size="small" className="text-main">
                            {locating
                                ? "Đang lấy vị trí..."
                                : "Lấy vị trí hiện tại"}
                        </Text>
                    </Box>
                )}

            {values.geoMode === "manual" && (
                <Box flex style={{ gap: 8 }}>
                    <Input
                        label="Vĩ độ (lat)"
                        placeholder="VD: 21.028511"
                        value={
                            values.gisLatitude !== null
                                ? String(values.gisLatitude)
                                : ""
                        }
                        onChange={e =>
                            setManualValue("gisLatitude", e.target.value)
                        }
                    />
                    <Input
                        label="Kinh độ (lng)"
                        placeholder="VD: 105.804817"
                        value={
                            values.gisLongitude !== null
                                ? String(values.gisLongitude)
                                : ""
                        }
                        onChange={e =>
                            setManualValue("gisLongitude", e.target.value)
                        }
                    />
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
                values.gisLongitude != null &&
                (values.geoMode === "address" || values.geoMode === "gps") && (
                    <Box flex alignItems="center" style={{ gap: 8 }}>
                        <Text size="xSmall" className="text-main">
                            Đã xác nhận vị trí ({values.gisLatitude.toFixed(6)},{" "}
                            {values.gisLongitude.toFixed(6)})
                        </Text>
                        <Text
                            size="xSmall"
                            className="text-main"
                            onClick={() =>
                                setPendingPin({
                                    lat: values.gisLatitude as number,
                                    lng: values.gisLongitude as number,
                                    accuracyMeters: values.gisAccuracyMeters,
                                })
                            }
                        >
                            Chỉnh lại
                        </Text>
                    </Box>
                )}
        </Box>
    );
};

export default HouseLocationPicker;
