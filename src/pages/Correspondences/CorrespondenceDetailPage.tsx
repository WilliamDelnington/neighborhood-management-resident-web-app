import React, { useEffect, useState } from "react";
import { Box, Text, useParams, useSnackbar } from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button, TextArea } from "@components/customized";
import {
    ErrorState,
    LoadingState,
    EmptyState,
    StatusBadge,
} from "@components/admin";
import { RequireAuth, hasPermission } from "@components/role";
import { useStore } from "@store";
import { formatDateTime } from "@utils/date-time";
import {
    Correspondence,
    CorrespondenceReply,
    CorrespondenceType,
    FileAsset,
} from "@dts";
import {
    createCorrespondenceReply,
    fetchCorrespondenceAttachments,
    fetchCorrespondenceDetail,
    fetchCorrespondenceReplies,
} from "@service/correspondenceApi";

const CorrespondenceDetailPage: React.FC = () => (
    <RequireAuth>
        <CorrespondenceDetailContent />
    </RequireAuth>
);

const CorrespondenceDetailContent: React.FC = () => {
    const { id } = useParams();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canReply = hasPermission(user, "correspondences.reply");

    const [doc, setDoc] = useState<Correspondence | null>(null);
    const [attachments, setAttachments] = useState<FileAsset[]>([]);
    const [replies, setReplies] = useState<CorrespondenceReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setErrorMessage(null);
        fetchCorrespondenceDetail(id)
            .then(setDoc)
            .catch(err =>
                setErrorMessage(
                    err?.message || "Không thể tải chi tiết văn bản",
                ),
            )
            .finally(() => setLoading(false));

        fetchCorrespondenceAttachments(id)
            .then(setAttachments)
            .catch(() => setAttachments([]));

        fetchCorrespondenceReplies(id)
            .then(setReplies)
            .catch(() => setReplies([]));
    };

    useEffect(load, [id]);

    const handleReply = async () => {
        if (!id || !replyContent.trim()) return;
        try {
            setSendingReply(true);
            const reply = await createCorrespondenceReply(
                id,
                replyContent.trim(),
            );
            setReplies(prev => [...prev, reply]);
            setReplyContent("");
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Không thể gửi phản hồi",
            });
        } finally {
            setSendingReply(false);
        }
    };

    const typeName =
        doc && typeof doc.correspondenceTypeId !== "string"
            ? (doc.correspondenceTypeId as CorrespondenceType).name
            : "";

    return (
        <PageLayout id="correspondence-detail-page" title="Chi tiết văn bản">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && errorMessage && (
                    <ErrorState label={errorMessage} onRetry={load} />
                )}
                {!loading && !errorMessage && doc && (
                    <>
                        <Box className="bg-white rounded-2xl p-4 shadow-card">
                            <Box flex alignItems="center" style={{ gap: 8 }}>
                                {typeName && (
                                    <StatusBadge label={typeName} tone="blue" />
                                )}
                                {doc.documentNumber && (
                                    <Text size="xSmall" className="text-text_2">
                                        {doc.documentNumber}
                                    </Text>
                                )}
                                {doc.isUrgent && (
                                    <StatusBadge label="Khẩn" tone="red" />
                                )}
                            </Box>
                            <Text.Title size="small" className="mt-1">
                                {doc.title}
                            </Text.Title>
                            <Text
                                size="small"
                                className="text-text_1 mt-2"
                                style={{ whiteSpace: "pre-wrap" }}
                            >
                                {doc.content}
                            </Text>
                            <Text size="xxSmall" className="text-text_3 mt-2">
                                Ban hành ngày{" "}
                                {new Date(doc.issuedAt).toLocaleDateString(
                                    "vi-VN",
                                )}
                                {doc.sentAt &&
                                    ` · Gửi ngày ${formatDateTime(
                                        new Date(doc.sentAt),
                                    )}`}
                            </Text>
                        </Box>

                        <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                            <Text.Title size="small" className="mb-2">
                                Tệp đính kèm
                            </Text.Title>
                            {attachments.length === 0 && (
                                <EmptyState label="Không có file đính kèm" />
                            )}
                            {attachments.map(a => (
                                <Box
                                    key={a._id}
                                    py={2}
                                    className="border-b border-divider_01 last:border-0"
                                    onClick={() => window.open(a.url, "_blank")}
                                >
                                    <Text size="small" className="text-main">
                                        {a.name}
                                    </Text>
                                </Box>
                            ))}
                        </Box>

                        <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                            <Text.Title size="small" className="mb-2">
                                Phản hồi
                            </Text.Title>
                            {replies.length === 0 && (
                                <EmptyState label="Chưa có phản hồi nào" />
                            )}
                            {replies.map(r => {
                                const actor =
                                    typeof r.actorId === "string"
                                        ? null
                                        : r.actorId;
                                return (
                                    <Box
                                        key={r._id}
                                        className="bg-ng_10 rounded-lg px-3 py-2 mt-2"
                                    >
                                        <Box
                                            flex
                                            justifyContent="space-between"
                                        >
                                            <Text
                                                size="xSmall"
                                                className="font-medium"
                                            >
                                                {actor?.displayName ||
                                                    "Người dùng"}
                                            </Text>
                                            <Text
                                                size="xxSmall"
                                                className="text-text_3"
                                            >
                                                {formatDateTime(
                                                    new Date(r.createdAt),
                                                )}
                                            </Text>
                                        </Box>
                                        <Text
                                            size="small"
                                            className="mt-1"
                                            style={{ whiteSpace: "pre-wrap" }}
                                        >
                                            {r.content}
                                        </Text>
                                    </Box>
                                );
                            })}

                            {canReply && (
                                <Box mt={3}>
                                    <TextArea
                                        placeholder="Nhập phản hồi..."
                                        rows={3}
                                        value={replyContent}
                                        onChange={e =>
                                            setReplyContent(e.target.value)
                                        }
                                    />
                                    <Box mt={2}>
                                        <Button
                                            fullWidth
                                            loading={sendingReply}
                                            disabled={!replyContent.trim()}
                                            onClick={handleReply}
                                        >
                                            Gửi phản hồi
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </>
                )}
            </Box>
        </PageLayout>
    );
};

export default CorrespondenceDetailPage;
