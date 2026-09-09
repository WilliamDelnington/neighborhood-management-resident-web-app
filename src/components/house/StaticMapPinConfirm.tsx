import React, { useEffect, useRef, useState } from "react";
import { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Box, Text } from "@components/ui";
import Button from "@components/customized/Button";

const GOONG_MAP_KEY = import.meta.env.VITE_GOONG_MAP_KEY as string;
const GOONG_MAP_STYLE_URL = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAP_KEY}`;
const INITIAL_ZOOM = 18;

interface StaticMapPinConfirmProps {
    initialLat: number;
    initialLng: number;
    onConfirm: (lat: number, lng: number) => void;
    onCancel: () => void;
}

/**
 * Xac nhan/dieu chinh chinh xac vi tri nha bang mot ban do Goong (MapLibre)
 * tuong tac that - pin ("📍") luon co dinh giua man hinh, nguoi dung keo BAN
 * DO ben duoi de dua diem can chon vao duoi pin. Luc "Xac nhan vi tri", toa
 * do lay truc tiep tu map.getCenter() - khong can tu tinh phep chieu Web
 * Mercator nhu ban Static Maps (Google) truoc day, vi MapLibre da lo lieu do.
 *
 * Goong REST API (goong.ts o backend) khong co endpoint anh tinh theo
 * center+zoom nhu Google Static Maps, nen buoc xac nhan pin chuyen sang goi
 * thang Goong Map Tiles tu client (can VITE_GOONG_MAP_KEY - khac voi
 * GOONG_API_KEY o server, xem .env.development).
 */
const StaticMapPinConfirm: React.FC<StaticMapPinConfirmProps> = ({
    initialLat,
    initialLng,
    onConfirm,
    onCancel,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MaplibreMap | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return undefined;
        if (!GOONG_MAP_KEY) {
            setLoading(false);
            setError(true);
            return undefined;
        }
        setLoading(true);
        setError(false);
        const map = new MaplibreMap({
            container: containerRef.current,
            style: GOONG_MAP_STYLE_URL,
            center: [initialLng, initialLat],
            zoom: INITIAL_ZOOM,
            attributionControl: false,
            dragRotate: false,
            touchPitch: false,
        });
        mapRef.current = map;
        map.touchZoomRotate.disableRotation();
        map.on("load", () => setLoading(false));
        map.on("error", () => {
            setLoading(false);
            setError(true);
        });
        return () => {
            map.remove();
            mapRef.current = null;
        };
        // Chi khoi tao 1 lan luc mount cho ca phien xac nhan pin (giong quy uoc
        // cu voi Static Maps) - khong phu thuoc lai initialLat/Lng.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirm = () => {
        if (!mapRef.current) return;
        const { lat, lng } = mapRef.current.getCenter();
        onConfirm(lat, lng);
    };

    if (error) {
        return (
            <Box style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Text size="small" className="text-red-500">
                    Không tải được bản đồ xác nhận vị trí. Vui lòng thử lại.
                </Text>
                <Button size="small" onClick={onCancel}>
                    Quay lại
                </Button>
            </Box>
        );
    }

    return (
        <Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Text size="xSmall" className="text-text_2">
                Kéo bản đồ để chỉnh đúng vị trí nhà (đặc biệt với nhà trong
                ngõ/hẻm mà bản đồ chưa định vị chính xác)
            </Text>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: 320,
                    borderRadius: 12,
                    overflow: "hidden",
                }}
            >
                <div
                    ref={containerRef}
                    style={{ width: "100%", height: "100%" }}
                />
                {loading && (
                    <Box
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        className="bg-ng_10"
                    >
                        <Text size="small" className="text-text_3">
                            Đang tải bản đồ...
                        </Text>
                    </Box>
                )}
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -90%)",
                        fontSize: 32,
                        lineHeight: 1,
                        pointerEvents: "none",
                    }}
                >
                    📍
                </div>
            </div>
            <Box flex style={{ gap: 8 }}>
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    style={{ flex: 1 }}
                >
                    Hủy
                </Button>
                <Button
                    onClick={confirm}
                    style={{ flex: 1 }}
                    disabled={loading}
                >
                    Xác nhận vị trí
                </Button>
            </Box>
        </Box>
    );
};

export default StaticMapPinConfirm;
