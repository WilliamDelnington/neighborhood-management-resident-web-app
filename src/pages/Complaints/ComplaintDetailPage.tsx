import React, { useEffect, useState } from "react";
import { Box, Select, Text, useParams, useSnackbar } from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button, Input, TextArea } from "@components/customized";
import { ErrorState, LoadingState } from "@components/admin";
import { RequireAuth } from "@components/role";
import AttachmentUploader from "@components/attachments/AttachmentUploader";
import {
    fetchComplaintAttachments,
    fetchComplaintDetail,
    deleteComplaintAttachment,
    updateComplaint,
    confirmComplaintResolution,
    requestComplaintReevaluation,
} from "@service/complaintApi";
import { ComplaintDetail, NhomPhanAnh } from "@dts";
import { NHOM_PHAN_ANH_LABEL } from "@constants/domain";
import { useStore } from "@store";
import ComplaintTimelineView from "./ComplaintTimelineView";

const ComplaintDetailPage: React.FC = () => (
    <RequireAuth>
        <ComplaintDetailPageContent />
    </RequireAuth>
);

const ComplaintDetailPageContent: React.FC = () => {
    const { id } = useParams();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const [detail, setDetail] = useState<ComplaintDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [editing, setEditing] = useState(false);
    const [category, setCategory] = useState<NhomPhanAnh | undefined>();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);

    const [confirming, setConfirming] = useState(false);
    const [rating, setRating] = useState(0);
    const [requestingReeval, setRequestingReeval] = useState(false);
    const [reevalNote, setReevalNote] = useState("");
    const [sendingReeval, setSendingReeval] = useState(false);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setErrorMessage(null);
        fetchComplaintDetail(id)
            .then(d => {
                setDetail(d);
                setCategory(d.complaint.category);
                setTitle(d.complaint.title);
                setContent(d.complaint.content);
            })
            .catch(err =>
                setErrorMessage(
                    err?.message || "Không thể tải chi tiết phản ánh",
                ),
            )
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    const isOwner = !!(
        user &&
        detail &&
        String(
            typeof detail.complaint.createdByUserId === "object"
                ? detail.complaint.createdByUserId._id
                : detail.complaint.createdByUserId,
        ) === String(user.id)
    );

    const status = detail?.complaint.status;
    const canEdit = isOwner && status !== "dong" && status !== "hoan_thanh";
    const canRespondToResolution = isOwner && status === "da_xu_ly";
    const alreadyRequestedReeval = !!detail?.timeline.some(
        entry => entry.action === "reevaluation_request",
    );

    const handleSave = async () => {
        if (!id || !detail) return;
        if (
            !category ||
            title.trim().length < 3 ||
            content.trim().length < 10
        ) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập đầy đủ tiêu đề (≥3 ký tự) và nội dung (≥10 ký tự)",
            });
            return;
        }
        try {
            setSaving(true);
            const updated = await updateComplaint(id, {
                category,
                title: title.trim(),
                content: content.trim(),
            });
            setDetail({ ...detail, complaint: updated });
            setEditing(false);
            openSnackbar({ type: "success", text: "Đã cập nhật phản ánh" });
            load();
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmResolution = async () => {
        if (!id) return;
        try {
            setConfirming(true);
            await confirmComplaintResolution(id, rating || undefined);
            openSnackbar({ type: "success", text: "Đã xác nhận hoàn thành" });
            load();
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setConfirming(false);
        }
    };

    const handleRequestReevaluation = async () => {
        if (!id || !reevalNote.trim()) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập lý do đề nghị xem xét lại",
            });
            return;
        }
        try {
            setSendingReeval(true);
            await requestComplaintReevaluation(id, reevalNote.trim());
            openSnackbar({
                type: "success",
                text: "Đã gửi đề nghị xem xét lại",
            });
            setRequestingReeval(false);
            setReevalNote("");
            load();
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setSendingReeval(false);
        }
    };

    return (
        <PageLayout id="complaint-detail-page" title="Chi tiết phản ánh">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && errorMessage && (
                    <ErrorState label={errorMessage} onRetry={load} />
                )}
                {!loading && !errorMessage && detail && (
                    <>
                        {canEdit && !editing && (
                            <Box mb={3} flex justifyContent="flex-end">
                                <Text
                                    size="xSmall"
                                    className="text-main"
                                    onClick={() => setEditing(true)}
                                >
                                    Chỉnh sửa phản ánh
                                </Text>
                            </Box>
                        )}

                        {editing ? (
                            <Box className="bg-white rounded-2xl p-4 shadow-card mb-3">
                                <Text
                                    size="xSmall"
                                    className="font-medium text-text_1 mb-2"
                                >
                                    Nhóm phản ánh
                                </Text>
                                <Select
                                    placeholder="Chọn nhóm phản ánh"
                                    value={category}
                                    onChange={value =>
                                        setCategory(value as NhomPhanAnh)
                                    }
                                    closeOnSelect
                                >
                                    {Object.entries(NHOM_PHAN_ANH_LABEL).map(
                                        ([value, label]) => (
                                            <Select.Option
                                                key={value}
                                                value={value}
                                                title={label}
                                            />
                                        ),
                                    )}
                                </Select>
                                <Box mt={3}>
                                    <Input
                                        label="Tiêu đề"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                </Box>
                                <Box mt={3}>
                                    <TextArea
                                        label="Nội dung"
                                        value={content}
                                        onChange={e =>
                                            setContent(e.target.value)
                                        }
                                        rows={4}
                                    />
                                </Box>
                                <Box mt={4} flex style={{ gap: 8 }}>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={() => {
                                            setEditing(false);
                                            setCategory(
                                                detail.complaint.category,
                                            );
                                            setTitle(detail.complaint.title);
                                            setContent(
                                                detail.complaint.content,
                                            );
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        fullWidth
                                        loading={saving}
                                        onClick={handleSave}
                                    >
                                        Lưu
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <ComplaintTimelineView
                                complaint={detail.complaint}
                                timeline={detail.timeline}
                            />
                        )}

                        {canRespondToResolution && (
                            <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                                <Text.Title size="small" className="mb-2">
                                    Phản ánh đã được xử lý
                                </Text.Title>
                                <Text
                                    size="xSmall"
                                    className="text-text_2 mb-3"
                                >
                                    Bạn đã hài lòng với kết quả xử lý chưa?
                                </Text>

                                {!requestingReeval && (
                                    <Box
                                        flex
                                        justifyContent="center"
                                        mb={3}
                                        style={{ gap: 4 }}
                                    >
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Text
                                                key={star}
                                                size="large"
                                                className={
                                                    star <= rating
                                                        ? "text-yellow-500"
                                                        : "text-divider_01"
                                                }
                                                onClick={() =>
                                                    setRating(
                                                        star === rating
                                                            ? 0
                                                            : star,
                                                    )
                                                }
                                            >
                                                ★
                                            </Text>
                                        ))}
                                    </Box>
                                )}

                                {!requestingReeval ? (
                                    <Box flex style={{ gap: 8 }}>
                                        {!alreadyRequestedReeval && (
                                            <Button
                                                variant="secondary"
                                                fullWidth
                                                onClick={() =>
                                                    setRequestingReeval(true)
                                                }
                                            >
                                                Đề nghị xem xét lại
                                            </Button>
                                        )}
                                        <Button
                                            fullWidth
                                            loading={confirming}
                                            onClick={handleConfirmResolution}
                                        >
                                            Xác nhận hoàn thành
                                        </Button>
                                    </Box>
                                ) : (
                                    <>
                                        <TextArea
                                            label="Lý do đề nghị xem xét lại"
                                            placeholder="Mô tả vì sao bạn chưa hài lòng với kết quả xử lý..."
                                            value={reevalNote}
                                            onChange={e =>
                                                setReevalNote(e.target.value)
                                            }
                                            rows={3}
                                        />
                                        <Box mt={3} flex style={{ gap: 8 }}>
                                            <Button
                                                variant="secondary"
                                                fullWidth
                                                onClick={() => {
                                                    setRequestingReeval(false);
                                                    setReevalNote("");
                                                }}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                fullWidth
                                                loading={sendingReeval}
                                                onClick={
                                                    handleRequestReevaluation
                                                }
                                            >
                                                Gửi đề nghị
                                            </Button>
                                        </Box>
                                    </>
                                )}
                                {alreadyRequestedReeval && !requestingReeval && (
                                    <Text
                                        size="xxSmall"
                                        className="text-text_2 mt-2"
                                    >
                                        Bạn đã sử dụng lượt đề nghị xem xét lại
                                        cho phản ánh này.
                                    </Text>
                                )}
                            </Box>
                        )}

                        <AttachmentUploader
                            relatedModel="Complaint"
                            relatedId={detail.complaint._id}
                            canUpload={isOwner}
                            canDelete={isOwner}
                            fetchAttachments={fetchComplaintAttachments}
                            deleteAttachmentFn={deleteComplaintAttachment}
                        />
                    </>
                )}
            </Box>
        </PageLayout>
    );
};

export default ComplaintDetailPage;
