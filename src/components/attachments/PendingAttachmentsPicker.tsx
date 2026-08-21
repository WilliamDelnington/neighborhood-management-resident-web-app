import React from "react";
import { Box, Icon, Text } from "@components/ui";
import { EmptyState } from "@components/admin";
import { pickLocalFile } from "@service/uploadApi";

export interface PendingAttachmentsPickerProps {
    files: File[];
    onChange: (files: File[]) => void;
}

/**
 * Chon truoc mot danh sach file de dinh kem (chua tai len ngay) - dung tren
 * form tao moi nhan khau/ho dan/ho kinh doanh/cong ty, khi chua co relatedId
 * de goi AttachmentUploader thong thuong. Sau khi ban ghi duoc tao thanh
 * cong, cac file nay duoc tai len bang uploadPendingAttachments (xem
 * @service/uploadApi).
 */
const PendingAttachmentsPicker: React.FC<PendingAttachmentsPickerProps> = ({
    files,
    onChange,
}) => {
    const handleAdd = async () => {
        const file = await pickLocalFile();
        if (!file) return;
        onChange([...files, file]);
    };

    const handleRemove = (index: number) => {
        onChange(files.filter((_, i) => i !== index));
    };

    return (
        <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
            <Box flex justifyContent="space-between" alignItems="center" mb={2}>
                <Text.Title size="small">Tài liệu đính kèm</Text.Title>
                <Box
                    flex
                    alignItems="center"
                    className="text-main"
                    onClick={handleAdd}
                >
                    <Icon icon="zi-plus" />
                    <Text size="xSmall" className="text-main ml-1">
                        Đính kèm
                    </Text>
                </Box>
            </Box>

            {files.length === 0 && (
                <EmptyState label="Chưa chọn tài liệu nào" />
            )}
            {files.map((file, index) => (
                <Box
                    key={`${file.name}-${index}`}
                    flex
                    alignItems="center"
                    justifyContent="space-between"
                    py={2}
                    className="border-b border-divider_01 last:border-0"
                >
                    <Box
                        flex
                        alignItems="center"
                        style={{ flex: 1, minWidth: 0 }}
                    >
                        <Icon icon="zi-file" className="text-text_2" />
                        <Text size="small" className="ml-2 truncate">
                            {file.name}
                        </Text>
                    </Box>
                    <Box
                        onClick={() => handleRemove(index)}
                        style={{ flexShrink: 0 }}
                        pl={3}
                    >
                        <Icon icon="zi-close" className="text-text_3" />
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default PendingAttachmentsPicker;
