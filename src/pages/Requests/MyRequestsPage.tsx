import React, { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Box, Text, useSnackbar } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { Button, TextArea } from "@components/customized";
import {
    EmptyState,
    ErrorState,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { RequireAuth } from "@components/role";
import AttachmentUploader from "@components/attachments/AttachmentUploader";
import {
    REQUEST_PRIORITY_LABEL,
    REQUEST_STATUS_LABEL,
    REQUEST_STATUS_TONE,
    REQUEST_TYPE_LABEL,
} from "@constants/domain";
import {
    createRequestComment,
    deleteRequestAttachment,
    fetchMyRequests,
    fetchRequestAttachments,
    fetchRequestComments,
    updateMyRequestStatus,
} from "@service/taskRequestApi";
import { AppError, MyRequestItem, RequestComment, RequestStatus } from "@dts";

const PAGE_SIZE = 20;

const houseLabel = (houseId: MyRequestItem["houseId"]): string | null => {
    if (!houseId || typeof houseId === "string") return null;
    return `${houseId.code} — ${houseId.address}`;
};

const NEXT_STATUS_OPTIONS: Record<RequestStatus, RequestStatus[]> = {
    pending: ["acknowledged"],
    acknowledged: ["in_progress"],
    in_progress: ["awaiting_confirmation", "needs_info"],
    needs_info: ["in_progress"],
    awaiting_confirmation: [],
    resolved: [],
};

const MyRequestsPage: React.FC = () => (
    <RequireAuth>
        <MyRequestsContent />
    </RequireAuth>
);

/**
 * Nhiem vu/yeu cau To truong/To pho gui xuong Nha (B04), hoac Phuong giao
 * xac minh xuong To truong/To pho (B13) - hop thu dung chung, khong phan
 * biet nguon vi backend cung khong phan biet (deu la Request/RequestRecipient,
 * xem taskRequestApi.ts).
 */
const MyRequestsContent: React.FC = () => {
    const { openSnackbar } = useSnackbar();
    const [items, setItems] = useState<MyRequestItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [infoNoteFor, setInfoNoteFor] = useState<string | null>(null);
    const [infoNote, setInfoNote] = useState("");

    const [openThreadFor, setOpenThreadFor] = useState<string | null>(null);
    const [comments, setComments] = useState<RequestComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    const load = (targetPage: number, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(false);
        fetchMyRequests({ page: targetPage, limit: PAGE_SIZE })
            .then(res => {
                setItems(prev =>
                    append ? [...prev, ...res.items] : res.items,
                );
                setPage(res.page);
                setTotalPages(res.totalPages);
            })
            .catch(() => setError(true))
            .finally(() => {
                setLoading(false);
                setLoadingMore(false);
            });
    };

    useEffect(() => {
        load(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdateStatus = async (
        item: MyRequestItem,
        status: RequestStatus,
        note?: string,
    ) => {
        if (status === "resolved") return;
        try {
            setUpdatingId(item._id);
            await updateMyRequestStatus(item.requestId, status, note);
            openSnackbar({ type: "success", text: "Đã cập nhật trạng thái" });
            setInfoNoteFor(null);
            setInfoNote("");
            load(1, false);
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleThread = (item: MyRequestItem) => {
        if (openThreadFor === item.requestId) {
            setOpenThreadFor(null);
            return;
        }
        setOpenThreadFor(item.requestId);
        setNewComment("");
        setCommentsLoading(true);
        fetchRequestComments(item.requestId)
            .then(setComments)
            .catch(() => setComments([]))
            .finally(() => setCommentsLoading(false));
    };

    const handlePostComment = async (requestId: string) => {
        if (!newComment.trim()) return;
        try {
            setPostingComment(true);
            await createRequestComment(requestId, newComment.trim());
            setNewComment("");
            const list = await fetchRequestComments(requestId);
            setComments(list);
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setPostingComment(false);
        }
    };

    return (
        <PageLayout
            id="my-requests-page"
            title="Nhiệm vụ của tôi"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && (
                    <ErrorState onRetry={() => load(1, false)} />
                )}
                {!loading && !error && items.length === 0 && (
                    <EmptyState
                        label="Bạn chưa có nhiệm vụ nào"
                        icon={ClipboardList}
                        tone="warning"
                    />
                )}
                {!loading &&
                    !error &&
                    items.map(item => {
                        const nextOptions = NEXT_STATUS_OPTIONS[item.status];
                        const label = houseLabel(item.houseId);
                        return (
                            <Box
                                key={item._id}
                                className="bg-white rounded-2xl p-4 shadow-card mt-3"
                            >
                                <Box
                                    flex
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                >
                                    <Box>
                                        <Text
                                            size="small"
                                            className="font-medium"
                                        >
                                            {item.title}
                                        </Text>
                                        <Text
                                            size="xxSmall"
                                            className="text-text_2 mt-1"
                                        >
                                            {REQUEST_TYPE_LABEL[item.type]}
                                            {" · "}
                                            {
                                                REQUEST_PRIORITY_LABEL[
                                                    item.priority
                                                ]
                                            }
                                        </Text>
                                    </Box>
                                    <StatusBadge
                                        label={
                                            REQUEST_STATUS_LABEL[item.status]
                                        }
                                        tone={REQUEST_STATUS_TONE[item.status]}
                                    />
                                </Box>

                                {item.description && (
                                    <Text size="xSmall" className="mt-2">
                                        {item.description}
                                    </Text>
                                )}
                                {label && (
                                    <Text
                                        size="xxSmall"
                                        className="text-text_2 mt-1"
                                    >
                                        Nhà: {label}
                                    </Text>
                                )}
                                {item.dueDate && (
                                    <Text
                                        size="xxSmall"
                                        className={`mt-1 ${
                                            item.isOverdue
                                                ? "text-red-500"
                                                : "text-text_2"
                                        }`}
                                    >
                                        Hạn xử lý:{" "}
                                        {new Date(
                                            item.dueDate,
                                        ).toLocaleDateString("vi-VN")}
                                        {item.isOverdue && " (quá hạn)"}
                                    </Text>
                                )}
                                {item.note && (
                                    <Text
                                        size="xSmall"
                                        className="text-text_2 mt-1"
                                    >
                                        Ghi chú: {item.note}
                                    </Text>
                                )}

                                <AttachmentUploader
                                    relatedModel="Request"
                                    relatedId={item.requestId}
                                    canUpload={item.status !== "resolved"}
                                    canDelete={false}
                                    fetchAttachments={fetchRequestAttachments}
                                    deleteAttachmentFn={deleteRequestAttachment}
                                />

                                {infoNoteFor === item._id ? (
                                    <Box mt={3}>
                                        <TextArea
                                            label="Mô tả thông tin cần bổ sung"
                                            value={infoNote}
                                            onChange={e =>
                                                setInfoNote(e.target.value)
                                            }
                                            rows={3}
                                        />
                                        <Box mt={2} flex style={{ gap: 8 }}>
                                            <Button
                                                variant="secondary"
                                                fullWidth
                                                onClick={() => {
                                                    setInfoNoteFor(null);
                                                    setInfoNote("");
                                                }}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                fullWidth
                                                loading={
                                                    updatingId === item._id
                                                }
                                                disabled={!infoNote.trim()}
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        item,
                                                        "needs_info",
                                                        infoNote.trim(),
                                                    )
                                                }
                                            >
                                                Gửi
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    nextOptions.length > 0 && (
                                        <Box mt={3} flex style={{ gap: 8 }}>
                                            {nextOptions.map(next => (
                                                <Button
                                                    key={next}
                                                    fullWidth
                                                    variant={
                                                        next === "needs_info"
                                                            ? "secondary"
                                                            : "primary"
                                                    }
                                                    loading={
                                                        updatingId === item._id
                                                    }
                                                    onClick={() =>
                                                        next === "needs_info"
                                                            ? setInfoNoteFor(
                                                                  item._id,
                                                              )
                                                            : handleUpdateStatus(
                                                                  item,
                                                                  next,
                                                              )
                                                    }
                                                >
                                                    {REQUEST_STATUS_LABEL[next]}
                                                </Button>
                                            ))}
                                        </Box>
                                    )
                                )}

                                <Text
                                    size="xSmall"
                                    className="text-main mt-3"
                                    onClick={() => toggleThread(item)}
                                >
                                    {openThreadFor === item.requestId
                                        ? "Ẩn trao đổi"
                                        : "Trao đổi"}
                                </Text>
                                {openThreadFor === item.requestId && (
                                    <Box mt={2}>
                                        {commentsLoading && (
                                            <Text
                                                size="xxSmall"
                                                className="text-text_2"
                                            >
                                                Đang tải...
                                            </Text>
                                        )}
                                        {!commentsLoading &&
                                            comments.length === 0 && (
                                                <Text
                                                    size="xxSmall"
                                                    className="text-text_2"
                                                >
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
                                                        {typeof c.authorId ===
                                                        "string"
                                                            ? c.authorId
                                                            : c.authorId
                                                                  .displayName}
                                                    </Text>
                                                    <Text size="xSmall">
                                                        {c.content}
                                                    </Text>
                                                </Box>
                                            ))}
                                        <Box mt={2}>
                                            <TextArea
                                                placeholder="Nhập nội dung trao đổi..."
                                                value={newComment}
                                                onChange={e =>
                                                    setNewComment(
                                                        e.target.value,
                                                    )
                                                }
                                                rows={2}
                                            />
                                            <Button
                                                className="mt-2"
                                                loading={postingComment}
                                                disabled={!newComment.trim()}
                                                onClick={() =>
                                                    handlePostComment(
                                                        item.requestId,
                                                    )
                                                }
                                            >
                                                Gửi
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                {!loading && !error && page < totalPages && (
                    <Box mt={3}>
                        <Button
                            fullWidth
                            variant="secondary"
                            loading={loadingMore}
                            onClick={() => load(page + 1, true)}
                        >
                            Xem thêm
                        </Button>
                    </Box>
                )}
            </Box>
        </PageLayout>
    );
};

export default MyRequestsPage;
