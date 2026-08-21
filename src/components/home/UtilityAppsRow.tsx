import React, { useEffect, useState } from "react";
import { Box, Text } from "@components/ui";
import { fetchUtilityApps } from "@service/utilityAppApi";
import { UtilityApp } from "@dts";

/**
 * Hang cuon ngang cac app/dich vu lien quan (Nhom tien ich, quan tri o
 * admin-web-app muc "Quan ly dich vu") - nam duoi "Thong bao moi nhat" tren
 * trang chu. Click vao mot muc se mo Duong dan da khai bao cho app do trong
 * mot tab moi (day la lien ket ra ngoai app hien tai, khac voi cac Utinity
 * item noi bo dung navigate()).
 */
const UtilityAppsRow: React.FC = () => {
    const [apps, setApps] = useState<UtilityApp[]>([]);

    useEffect(() => {
        fetchUtilityApps()
            .then(res => setApps(res.items))
            .catch(() => setApps([]));
    }, []);

    if (apps.length === 0) return null;

    return (
        <Box className="bg-white mx-4 mt-3 p-4 rounded-2xl shadow-card">
            <Text.Title size="small" className="mb-3">
                Tiện ích
            </Text.Title>
            <Box
                style={{
                    display: "flex",
                    gap: 16,
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {apps.map(app => (
                    <Box
                        key={app._id}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            flex: "0 0 auto",
                            width: 72,
                        }}
                        onClick={() => window.open(app.url, "_blank")}
                    >
                        <img
                            src={app.icon}
                            alt=""
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                objectFit: "cover",
                            }}
                        />
                        <Text
                            size="xxSmall"
                            className="text-text_2 mt-1"
                            style={{ textAlign: "center" }}
                        >
                            {app.name}
                        </Text>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default UtilityAppsRow;
