import React from "react";
import { Box, Text, useNavigate } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { NhomPhanAnh } from "@dts";

type IncidentShortcut = {
    key: string;
    emoji: string;
    label: string;
    category: NhomPhanAnh;
    titlePrefix: string;
};

/**
 * Loi tat bao su co ha tang (C11) - KHONG tao workflow rieng, chi dien san
 * nhom phan anh + tien to tieu de roi mo thang man tao Phan anh binh thuong
 * (xem ComplaintCreatePage.tsx), dung theo dung khuyen nghi cua tai lieu: tai
 * su dung toan bo luong Phan anh/Feedback da co (gan, xac minh, doi thoi,
 * ket qua), chi them mot loi vao nhanh theo danh muc quen thuoc voi nguoi
 * dan.
 */
const INCIDENT_SHORTCUTS: IncidentShortcut[] = [
    {
        key: "light",
        emoji: "💡",
        label: "Đèn đường hỏng",
        category: "chieu_sang",
        titlePrefix: "Đèn đường hỏng",
    },
    {
        key: "road",
        emoji: "🛣️",
        label: "Đường/hẻm hư hỏng",
        category: "ha_tang",
        titlePrefix: "Đường/hẻm hư hỏng",
    },
    {
        key: "drain",
        emoji: "🕳️",
        label: "Cống rãnh tắc/hỏng",
        category: "ha_tang",
        titlePrefix: "Cống rãnh tắc/hỏng",
    },
    {
        key: "tree",
        emoji: "🌳",
        label: "Cây xanh gãy/đổ",
        category: "ha_tang",
        titlePrefix: "Cây xanh gãy/đổ",
    },
    {
        key: "waste",
        emoji: "🗑️",
        label: "Rác thải tồn đọng",
        category: "ve_sinh_moi_truong",
        titlePrefix: "Rác thải tồn đọng",
    },
    {
        key: "fire",
        emoji: "🧯",
        label: "Điểm nguy cơ cháy",
        category: "pccc",
        titlePrefix: "Điểm nguy cơ cháy",
    },
];

const IncidentShortcutPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <PageLayout
            id="incident-shortcut-page"
            title="Báo sự cố hạ tầng"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                <Text size="xSmall" className="text-text_2 mb-3">
                    Chọn loại sự cố để gửi phản ánh nhanh, không cần chọn lại
                    nhóm phản ánh.
                </Text>
                <Box
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                    }}
                >
                    {INCIDENT_SHORTCUTS.map(item => (
                        <Box
                            key={item.key}
                            flex
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            p={4}
                            className="bg-white rounded-2xl shadow-card"
                            onClick={() =>
                                navigate("/complaints/create", {
                                    animate: true,
                                    state: {
                                        presetCategory: item.category,
                                        presetTitlePrefix: item.titlePrefix,
                                    },
                                })
                            }
                        >
                            <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                            <Text
                                size="xSmall"
                                className="mt-2 text-center font-medium"
                            >
                                {item.label}
                            </Text>
                        </Box>
                    ))}
                </Box>
            </Box>
        </PageLayout>
    );
};

export default IncidentShortcutPage;
