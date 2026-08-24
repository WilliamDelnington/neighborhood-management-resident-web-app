import React, { useEffect, useState } from "react";
import { Box, Text, useParams, useSnackbar } from "@components/ui";
import { PageLayout } from "@components/layout";
import { ErrorState, LoadingState, StatusBadge } from "@components/admin";
import { Button, TextArea } from "@components/customized";
import { RequireAuth } from "@components/role";
import {
    createSupportTicketComment,
    fetchSupportTicketComments,
    fetchSupportTicketDetail,
    updateSupportTicket,
} from "@service/supportTicketApi";
import {
    LOAI_YEU_CAU_HO_TRO_LABEL,
    TRANG_THAI_YEU_CAU_HO_TRO_LABEL,
    TRANG_THAI_YEU_CAU_HO_TRO_TONE,
} from "@constants/domain";
import { formatDateTime } from "@utils/date-time";
import { AppError, RequestComment, SupportTicket } from "@dts";

const SupportTicketDetailPage: React.FC = () => (
    <RequireAuth>
        <SupportTicketDetailPageContent />
    </RequireAuth>
);

const SupportTicketDetailPageContent: React.FC = () => {
    const { id } = useParams();
    const { openSnackbar } = useSnackbar();
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [supplementNote, setSupplementNote] = useState("");
    const [submittingSupplement, setSubmittingSupplement] = useState(false);

    const [comments, setComments] = useState<RequestComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setErrorMessage(null);
        fetchSupportTicketDetail(id)
            .then(setTicket)
            .catch(err =>
                setErrorMessage(
                    err?.message || "Không thể tải chi tiết yêu cầu hỗ trợ",
                ),
            )
            .finally(() => setLoading(false));
    };

    const loadComments = () => {
        if (!id) return;
        setCommentsLoading(true);
        fetchSupportTicketComments(id)
            .then(setComments)
            .catch(() => setComments([]))
            .finally(() => setCommentsLoading(false));
    };

    useEffect(load, [id]);
    useEffect(loadComments, [id]);

    const handlePostComment = async () => {
        if (!id || !newComment.trim()) return;
        try {
            setPostingComment(true);
            await createSupportTicketComment(id, newComment.trim());
            setNewComment("");
            loadComments();
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setPostingComment(false);
        }
    };

    const handleSubmitSupplement = async () => {
        if (!id || !supplementNote.trim()) return;
        try {
            setSubmittingSupplement(true);
            const updated = await updateSupportTicket(
                id,
                supplementNote.trim(),
            );
            setTicket(updated);
            setSupplementNote("");
            openSnackbar({ type: "success", text: "Đã gửi bổ sung thông tin" });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSubmittingSupplement(false);
        }
    };

    return (
        <PageLayout id="support-ticket-detail-page" title="Chi tiết yêu cầu">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && errorMessage && (
                    <ErrorState label={errorMessage} onRetry={load} />
                )}
                {!loading && !errorMessage && ticket && (
                    <Box>
                        <Box className="bg-white rounded-2xl p-4 shadow-card">
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="flex-start"
                                mb={2}
                            >
                                <Text
                                    size="xSmall"
                                    className="text-main font-medium"
                                >
                                    {ticket.code}
                                </Text>
                                <StatusBadge
                                    label={
                                        TRANG_THAI_YEU_CAU_HO_TRO_LABEL[
                                            ticket.status
                                        ]
                                    }
                                    tone={
                                        TRANG_THAI_YEU_CAU_HO_TRO_TONE[
                                            ticket.status
                                        ]
                                    }
                                />
                            </Box>
                            <Text.Title size="small">{ticket.title}</Text.Title>
                            <Text size="xxSmall" className="text-text_2 mt-1">
                                {LOAI_YEU_CAU_HO_TRO_LABEL[ticket.type]}
                            </Text>
                            <Text
                                size="small"
                                className="mt-3 whitespace-pre-line"
                            >
                                {ticket.content}
                            </Text>
                            <Text size="xxSmall" className="text-text_2 mt-3">
                                Gửi lúc:{" "}
                                {formatDateTime(new Date(ticket.createdAt))}
                            </Text>
                        </Box>

                        <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                            <Text.Title size="small" className="mb-2">
                                Phản hồi từ quản trị viên
                            </Text.Title>
                            {ticket.adminResponse ? (
                                <Text
                                    size="xSmall"
                                    className="whitespace-pre-line"
                                >
                                    {ticket.adminResponse}
                                </Text>
                            ) : (
                                <Text size="xSmall" className="text-text_2">
                                    Chưa có phản hồi cho yêu cầu này.
                                </Text>
                            )}
                        </Box>

                        {ticket.status === "can_bo_sung" && (
                            <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                                <Text.Title size="small" className="mb-2">
                                    Cần bổ sung thông tin
                                </Text.Title>
                                <Text
                                    size="xSmall"
                                    className="text-text_2 mb-3"
                                >
                                    Vui lòng bổ sung thông tin theo phản hồi
                                    trên để tiếp tục xử lý yêu cầu.
                                </Text>
                                <TextArea
                                    placeholder="Nhập nội dung bổ sung..."
                                    value={supplementNote}
                                    onChange={e =>
                                        setSupplementNote(e.target.value)
                                    }
                                    rows={3}
                                />
                                <Button
                                    className="mt-3"
                                    fullWidth
                                    loading={submittingSupplement}
                                    disabled={!supplementNote.trim()}
                                    onClick={handleSubmitSupplement}
                                >
                                    Gửi bổ sung
                                </Button>
                            </Box>
                        )}

                        <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                            <Text.Title size="small" className="mb-2">
                                Trao đổi
                            </Text.Title>
                            {commentsLoading && (
                                <Text size="xxSmall" className="text-text_2">
                                    Đang tải...
                                </Text>
                            )}
                            {!commentsLoading && comments.length === 0 && (
                                <Text size="xxSmall" className="text-text_2">
                                    Chưa có trao đổi nào.
                                </Text>
                            )}
                            {!commentsLoading &&
                                comments.map(c => (
                                    <Box key={c._id} mt={2}>
                                        <Text
                                            size="xxSmall"
                                            className="font-medium"
                                        >
                                            {typeof c.authorId === "string"
                                                ? c.authorId
                                                : c.authorId.displayName}
                                        </Text>
                                        <Text size="xSmall">{c.content}</Text>
                                    </Box>
                                ))}
                            <Box mt={2}>
                                <TextArea
                                    placeholder="Nhập nội dung trao đổi..."
                                    value={newComment}
                                    onChange={e =>
                                        setNewComment(e.target.value)
                                    }
                                    rows={2}
                                />
                                <Button
                                    className="mt-2"
                                    loading={postingComment}
                                    disabled={!newComment.trim()}
                                    onClick={handlePostComment}
                                >
                                    Gửi
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </PageLayout>
    );
};

export default SupportTicketDetailPage;
