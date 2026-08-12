import React, { useEffect, useState } from "react";
import { Box, Icon, Text, useSnackbar } from "@components/ui";
import { LoadingState, EmptyState } from "@components/admin";
import { pickAndUploadAttachment } from "@service/uploadApi";
import { FileAsset } from "@dts";
import type { AttachmentRelatedModel } from "@service/uploadApi";

export interface AttachmentUploaderProps {
    relatedModel: AttachmentRelatedModel;
    relatedId: string;
    canUpload: boolean;
    canDelete: boolean;
    fetchAttachments: (id: string) => Promise<FileAsset[]>;
    deleteAttachmentFn: (id: string, fileId: string) => Promise<null>;
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
    relatedModel,
    relatedId,
    canUpload,
    canDelete,
    fetchAttachments,
    deleteAttachmentFn,
}) => {
    const { openSnackbar } = useSnackbar();
    const [items, setItems] = useState<FileAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const load = () => {
        setLoading(true);
        fetchAttachments(relatedId)
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    };

    useEffect(load, [relatedId]);

    const handleUpload = async () => {
        try {
            setUploading(true);
            await pickAndUploadAttachment(relatedModel, relatedId);
            openSnackbar({ type: "success", text: "Đã đính kèm tài liệu" });
            load();
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Không thể tải file lên",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId: string) => {
        try {
            await deleteAttachmentFn(relatedId, fileId);
            setItems(prev => prev.filter(item => item._id !== fileId));
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Không thể xóa tài liệu",
            });
        }
    };

    return (
        <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
            <Box flex justifyContent="space-between" alignItems="center" mb={2}>
                <Text.Title size="small">Tài liệu đính kèm</Text.Title>
                {canUpload && (
                    <Box
                        flex
                        alignItems="center"
                        className="text-main"
                        onClick={uploading ? undefined : handleUpload}
                    >
                        <Icon icon="zi-plus" />
                        <Text size="xSmall" className="text-main ml-1">
                            {uploading ? "Đang tải lên..." : "Đính kèm"}
                        </Text>
                    </Box>
                )}
            </Box>

            {loading && <LoadingState />}
            {!loading && items.length === 0 && (
                <EmptyState label="Chưa có tài liệu đính kèm nào" />
            )}
            {!loading &&
                items.map(item => (
                    <Box
                        key={item._id}
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
                            onClick={() => window.open(item.url, "_blank")}
                        >
                            <Icon icon="zi-file" className="text-text_2" />
                            <Text size="small" className="ml-2 truncate">
                                {item.name}
                            </Text>
                        </Box>
                        {canDelete && (
                            <Box
                                onClick={() => handleDelete(item._id)}
                                style={{ flexShrink: 0 }}
                                pl={3}
                            >
                                <Icon icon="zi-close" className="text-text_3" />
                            </Box>
                        )}
                    </Box>
                ))}
        </Box>
    );
};

export default AttachmentUploader;
