import React, { useEffect, useRef, useState } from "react";
import { Box, Text } from "@components/ui";
import Button from "@components/customized/Button";
import { fetchStaticMap, GeoStaticMap } from "@service/googleMapsGeoApi";

const TILE_SIZE = 256;
const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

/** Web Mercator - phai khop chinh xac voi kieu chieu Google dung cho Static Maps. */
function project(lat: number, lng: number, zoom: number) {
    const worldSize = TILE_SIZE * 2 ** zoom;
    const x = ((lng + 180) / 360) * worldSize;
    const siny = clamp(Math.sin((lat * Math.PI) / 180), -0.9999, 0.9999);
    const y =
        (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)) * worldSize;
    return { x, y, worldSize };
}

function unproject(x: number, y: number, worldSize: number) {
    const lng = (x / worldSize) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * y) / worldSize;
    const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
    return { lat, lng };
}

interface StaticMapPinConfirmProps {
    initialLat: number;
    initialLng: number;
    onConfirm: (lat: number, lng: number) => void;
    onCancel: () => void;
}

/**
 * Xac nhan/dieu chinh chinh xac vi tri nha bang cach keo mot pin tren MOT anh
 * Static Maps duy nhat (khong ve/goi lai anh khi keo) - toa do moi duoc tinh
 * hoan toan o client qua phep chieu Web Mercator, giup chi ton 1 request
 * Google cho ca phien xac nhan bat ke keo bao nhieu lan (xem plan: uu tien
 * giam so luong request Google Maps).
 */
const StaticMapPinConfirm: React.FC<StaticMapPinConfirmProps> = ({
    initialLat,
    initialLng,
    onConfirm,
    onCancel,
}) => {
    const [map, setMap] = useState<GeoStaticMap | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    // offset tinh bang pixel HIEN THI (CSS, sau khi anh co the bi thu nho theo
    // chieu rong man hinh) - dung truc tiep de dat vi tri pin tren man hinh.
    // Chi quy doi sang pixel GOC cua anh (map.width/height) luc bam Xac nhan.
    const [offset, setOffset] = useState({ dx: 0, dy: 0 });
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef<{
        startX: number;
        startY: number;
        startOffset: { dx: number; dy: number };
    } | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        fetchStaticMap(initialLat, initialLng)
            .then(result => {
                if (!cancelled) setMap(result);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // Chi goi 1 lan luc mount cho ca phien xac nhan pin - khong phu thuoc
        // lai vao initialLat/Lng (component duoc mount lai moi khi bat dau
        // mot phien xac nhan moi tu HouseLocationPicker).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        dragStateRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startOffset: offset,
        };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragStateRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dragDx = e.clientX - dragStateRef.current.startX;
        const dragDy = e.clientY - dragStateRef.current.startY;
        setOffset({
            dx: clamp(
                dragStateRef.current.startOffset.dx + dragDx,
                -rect.width / 2,
                rect.width / 2,
            ),
            dy: clamp(
                dragStateRef.current.startOffset.dy + dragDy,
                -rect.height / 2,
                rect.height / 2,
            ),
        });
    };

    const handlePointerUp = () => {
        dragStateRef.current = null;
    };

    const confirm = () => {
        if (!map || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Quy doi offset hien thi (CSS pixel) ve pixel goc cua anh Static Maps
        // (map.width/height) - can thiet vi anh thuong duoc CSS thu nho theo
        // be rong man hinh (vd anh goc 640px nhung hien thi 360px).
        const nativeDx = offset.dx * (map.width / rect.width);
        const nativeDy = offset.dy * (map.height / rect.height);
        const center = project(map.centerLat, map.centerLng, map.zoom);
        const { lat, lng } = unproject(
            center.x + nativeDx,
            center.y + nativeDy,
            center.worldSize,
        );
        onConfirm(lat, lng);
    };

    if (loading) {
        return (
            <Box className="py-4">
                <Text size="small" className="text-text_3">
                    Đang tải bản đồ...
                </Text>
            </Box>
        );
    }

    if (error || !map) {
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
                Kéo ghim để chỉnh đúng vị trí nhà (đặc biệt với nhà trong
                ngõ/hẻm mà bản đồ chưa định vị chính xác)
            </Text>
            <div
                ref={containerRef}
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: `${map.width} / ${map.height}`,
                    touchAction: "none",
                    borderRadius: 12,
                    overflow: "hidden",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <img
                    src={`data:${map.mimeType};base64,${map.base64}`}
                    alt="Bản đồ xác nhận vị trí"
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        userSelect: "none",
                    }}
                    draggable={false}
                />
                <div
                    style={{
                        position: "absolute",
                        left: `calc(50% + ${offset.dx}px)`,
                        top: `calc(50% + ${offset.dy}px)`,
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
                <Button onClick={confirm} style={{ flex: 1 }}>
                    Xác nhận vị trí
                </Button>
            </Box>
        </Box>
    );
};

export default StaticMapPinConfirm;
