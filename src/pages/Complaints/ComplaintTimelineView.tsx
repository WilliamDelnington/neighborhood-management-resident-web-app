import React from "react";
import { Box, Text } from "@components/ui";
import { StatusBadge } from "@components/admin";
import {
    NHOM_PHAN_ANH_LABEL,
    TRANG_THAI_PHAN_ANH_LABEL,
    TRANG_THAI_PHAN_ANH_TONE,
} from "@constants/domain";
import { formatDateTime } from "@utils/date-time";
import { Complaint, ComplaintTimelineEntry } from "@dts";

export interface ComplaintTimelineViewProps {
    complaint: Complaint;
    timeline: ComplaintTimelineEntry[];
}

const EDITED_FIELD_LABEL: Record<string, string> = {
    category: "Loại phản ánh",
    title: "Tiêu đề",
    content: "Nội dung",
};

const entryTitle = (entry: ComplaintTimelineEntry): string => {
    if (entry.action === "reevaluation_request") return "Đề nghị xem xét lại";
    if (entry.action === "edited") return "Đã chỉnh sửa phản ánh";
    return TRANG_THAI_PHAN_ANH_LABEL[entry.status];
};

/**
 * Khoi hien thi thong tin phan anh + lich su xu ly (timeline), dung chung cho man hinh
 * ket qua tra cuu theo ma va man hinh chi tiet phan anh de tranh trung lap JSX.
 */
const ComplaintTimelineView: React.FC<ComplaintTimelineViewProps> = ({
    complaint,
    timeline,
}) => (
    <Box>
        <Box className="bg-white rounded-2xl p-4 shadow-sm">
            <Box
                flex
                justifyContent="space-between"
                alignItems="flex-start"
                mb={2}
            >
                <Text size="xSmall" className="text-main font-medium">
                    {complaint.code}
                </Text>
                <StatusBadge
                    label={TRANG_THAI_PHAN_ANH_LABEL[complaint.status]}
                    tone={TRANG_THAI_PHAN_ANH_TONE[complaint.status]}
                />
            </Box>
            <Text.Title size="small">{complaint.title}</Text.Title>
            <Text size="xxSmall" className="text-text_2 mt-1">
                {NHOM_PHAN_ANH_LABEL[complaint.category]}
                {complaint.area ? ` • ${complaint.area}` : ""}
            </Text>
            <Text size="small" className="mt-3 whitespace-pre-line">
                {complaint.content}
            </Text>
            <Text size="xxSmall" className="text-text_2 mt-3">
                Gửi lúc: {formatDateTime(new Date(complaint.createdAt))}
            </Text>
        </Box>

        <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
            <Text.Title size="small" className="mb-3">
                Lịch sử xử lý
            </Text.Title>

            {timeline.length === 0 && (
                <Text size="xSmall" className="text-text_2">
                    Chưa có cập nhật nào cho phản ánh này.
                </Text>
            )}

            {timeline.map((entry, index) => (
                <Box key={entry._id} flex style={{ gap: 10 }}>
                    <Box
                        flex
                        flexDirection="column"
                        alignItems="center"
                        style={{ width: 12 }}
                    >
                        <Box
                            className="bg-main"
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                marginTop: 4,
                            }}
                        />
                        {index < timeline.length - 1 && (
                            <Box
                                className="bg-divider_01"
                                style={{ width: 2, flex: 1 }}
                            />
                        )}
                    </Box>
                    <Box pb={4} style={{ flex: 1 }}>
                        <Text size="small" className="font-medium">
                            {entryTitle(entry)}
                        </Text>
                        {entry.note && (
                            <Text size="xSmall" className="text-text_2 mt-1">
                                {entry.note}
                            </Text>
                        )}
                        {entry.action === "edited" &&
                            entry.patch &&
                            Object.entries(entry.patch).map(
                                ([field, value]) => (
                                    <Text
                                        key={field}
                                        size="xxSmall"
                                        className="text-text_2 mt-1"
                                    >
                                        {EDITED_FIELD_LABEL[field] || field}:{" "}
                                        {String(
                                            entry.previousSnapshot?.[field] ??
                                                "",
                                        )}
                                        {" → "}
                                        {String(value)}
                                    </Text>
                                ),
                            )}
                        <Text size="xxSmall" className="text-text_3 mt-1">
                            {formatDateTime(new Date(entry.createdAt))}
                        </Text>
                    </Box>
                </Box>
            ))}
        </Box>
    </Box>
);

export default ComplaintTimelineView;
