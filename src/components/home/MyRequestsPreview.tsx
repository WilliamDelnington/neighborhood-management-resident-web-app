import React, { FC, useEffect, useState } from "react";
import { Box, Text, useNavigate } from "@components/ui";
import { StatusBadge } from "@components/admin";
import { fetchMyRequests } from "@service/taskRequestApi";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_TONE } from "@constants/domain";
import { MyRequestItem } from "@dts";

/**
 * Xem truoc 3 nhiem vu gan nhat cua nguoi dang dang nhap tren Home (xem day
 * du o "Nhiem vu cua toi" - MyRequestsPage.tsx). Tu an neu khong co nhiem vu
 * nao hoac khong the tai (vd chua dang nhap).
 */
const MyRequestsPreview: FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<MyRequestItem[]>([]);

    useEffect(() => {
        fetchMyRequests({ page: 1, limit: 3 })
            .then(res => setItems(res.items))
            .catch(() => setItems([]));
    }, []);

    if (items.length === 0) return null;

    return (
        <Box className="bg-white mt-2 p-4">
            <Box
                flex
                justifyContent="space-between"
                alignItems="center"
                mb={2}
            >
                <Text.Title size="small">Nhiệm vụ của tôi</Text.Title>
                <Text
                    size="xSmall"
                    className="text-main"
                    onClick={() => navigate("/requests/mine")}
                >
                    Xem tất cả
                </Text>
            </Box>
            {items.map(item => (
                <Box
                    key={item._id}
                    flex
                    justifyContent="space-between"
                    alignItems="center"
                    py={2}
                    className="border-b border-divider_01 last:border-0"
                    onClick={() => navigate("/requests/mine")}
                >
                    <Box>
                        <Text size="small" className="font-medium">
                            {item.title}
                        </Text>
                        <Text size="xxSmall" className="text-text_2 mt-1">
                            Ngày giao:{" "}
                            {new Date(item.createdAt).toLocaleDateString(
                                "vi-VN",
                            )}
                        </Text>
                    </Box>
                    <StatusBadge
                        label={REQUEST_STATUS_LABEL[item.status]}
                        tone={REQUEST_STATUS_TONE[item.status]}
                    />
                </Box>
            ))}
        </Box>
    );
};

export default MyRequestsPreview;
