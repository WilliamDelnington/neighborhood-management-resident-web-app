import React, { useEffect, useState } from "react";
import {
    Box,
    DatePicker,
    Icon,
    Sheet,
    Text,
    useSnackbar,
} from "@components/ui";
import { Button, Input, TextArea } from "@components/customized";
import {
    LoadingState,
    EmptyState,
    ErrorState,
    StatusBadge,
} from "@components/admin";
import {
    BUSINESS_DOCUMENT_STATUS_LABEL,
    BUSINESS_DOCUMENT_STATUS_TONE,
} from "@constants/domain";
import {
    pickAndUploadAttachment,
    AttachmentRelatedModel,
} from "@service/uploadApi";
import { SubmitEntityDocumentInput } from "@service/requiredDocumentApi";
import {
    AppError,
    DocumentType,
    RequiredDocumentItem,
    RequiredDocumentRecord,
} from "@dts";

const formatDate = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("vi-VN");
};

const formatDateTime = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("vi-VN");
};

const actorLabel = (actor: RequiredDocumentRecord["uploadedBy"]) => {
    if (!actor) return "Không rõ";
    return typeof actor === "string" ? actor : actor.displayName;
};

const documentTypeOf = (item: RequiredDocumentItem): DocumentType | null => {
    const dt = item.rule.documentTypeId;
    return typeof dt === "string" ? null : dt;
};

const documentTypeName = (item: RequiredDocumentItem): string => {
    const dt = item.rule.documentTypeId;
    return typeof dt === "string" ? dt : dt.name;
};

const documentTypeIdOf = (item: RequiredDocumentItem): string => {
    const dt = item.rule.documentTypeId;
    return typeof dt === "string" ? dt : dt._id;
};

const fileNameOf = (doc: RequiredDocumentRecord): string =>
    typeof doc.fileAssetId === "string" ? "Xem tệp" : doc.fileAssetId.name;

const fileUrlOf = (doc: RequiredDocumentRecord): string | undefined =>
    typeof doc.fileAssetId === "string" ? undefined : doc.fileAssetId.url;

export interface RequiredDocumentsPanelProps {
    entityId: string;
    /** relatedModel dung khi tai file len qua pickAndUploadAttachment, vd "HouseDocument". */
    relatedModel: AttachmentRelatedModel;
    fetchItems: (
        entityId: string,
    ) => Promise<{ items: RequiredDocumentItem[] }>;
    onSubmit: (
        entityId: string,
        input: SubmitEntityDocumentInput,
    ) => Promise<unknown>;
    onReview: (
        entityId: string,
        documentId: string,
        decision: "approved" | "rejected",
        rejectionReason?: string,
        approvalNote?: string,
    ) => Promise<unknown>;
    /** Chu ho (hoac admin) - nguoi duoc phep nop/nop lai giay to. */
    canSubmit: boolean;
    /** Tuy tung dong luat (reviewerRoles) ma xac dinh nguoi dung hien tai co duoc duyet hay khong. */
    canReview: (item: RequiredDocumentItem) => boolean;
    /** Goi lai sau khi nop/duyet/tu choi thanh cong de trang cha lam moi trang thai. */
    onChanged?: () => void;
    emptyLabel?: string;
}

const RequiredDocumentsPanel: React.FC<RequiredDocumentsPanelProps> = ({
    entityId,
    relatedModel,
    fetchItems,
    onSubmit,
    onReview,
    canSubmit,
    canReview,
    onChanged,
    emptyLabel = "Chưa có yêu cầu giấy tờ nào",
}) => {
    const { openSnackbar } = useSnackbar();
    const [items, setItems] = useState<RequiredDocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedHistory, setExpandedHistory] = useState<Set<string>>(
        new Set(),
    );

    const [submitting, setSubmitting] = useState<RequiredDocumentItem | null>(
        null,
    );
    const [docNumber, setDocNumber] = useState("");
    const [issueDate, setIssueDate] = useState<Date | undefined>();
    const [expiryDate, setExpiryDate] = useState<Date | undefined>();
    const [submitBusy, setSubmitBusy] = useState(false);

    const [reviewing, setReviewing] = useState<RequiredDocumentItem | null>(
        null,
    );
    const [rejectionReason, setRejectionReason] = useState("");
    const [reviewDecision, setReviewDecision] = useState<
        "approved" | "rejected" | null
    >(null);

    const load = () => {
        setLoading(true);
        setError(null);
        fetchItems(entityId)
            .then(res => setItems(res.items))
            .catch(err => setError((err as AppError).message))
            .finally(() => setLoading(false));
    };

    useEffect(load, [entityId]);

    const toggleHistory = (key: string) => {
        setExpandedHistory(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const openSubmit = (item: RequiredDocumentItem) => {
        setSubmitting(item);
        setDocNumber("");
        setIssueDate(undefined);
        setExpiryDate(undefined);
    };

    const handleSubmitDocument = async () => {
        if (!submitting) return;
        try {
            setSubmitBusy(true);
            const { fileAssetId } = await pickAndUploadAttachment(
                relatedModel,
                entityId,
            );
            await onSubmit(entityId, {
                documentTypeId: documentTypeIdOf(submitting),
                fileAssetId,
                docNumber: docNumber.trim() || undefined,
                issueDate: issueDate?.toISOString(),
                expiryDate: expiryDate?.toISOString(),
            });
            openSnackbar({ type: "success", text: "Đã nộp giấy tờ" });
            setSubmitting(null);
            load();
            onChanged?.();
        } catch (err) {
            openSnackbar({
                type: "error",
                text: (err as AppError).message || (err as Error).message,
            });
        } finally {
            setSubmitBusy(false);
        }
    };

    const openReview = (item: RequiredDocumentItem) => {
        setReviewing(item);
        setRejectionReason("");
    };

    const submitDecision = async (decision: "approved" | "rejected") => {
        if (!reviewing?.activeDocument) return;
        if (decision === "rejected" && !rejectionReason.trim()) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập lý do yêu cầu bổ sung",
            });
            return;
        }
        try {
            setReviewDecision(decision);
            await onReview(
                entityId,
                reviewing.activeDocument._id,
                decision,
                decision === "rejected" ? rejectionReason.trim() : undefined,
            );
            openSnackbar({
                type: "success",
                text:
                    decision === "approved"
                        ? "Đã duyệt giấy tờ"
                        : "Đã yêu cầu bổ sung giấy tờ",
            });
            setReviewing(null);
            load();
            onChanged?.();
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setReviewDecision(null);
        }
    };

    return (
        <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
            <Text.Title size="small" className="mb-2">
                Hồ sơ giấy tờ theo yêu cầu
            </Text.Title>

            {loading && <LoadingState />}
            {!loading && error && <ErrorState label={error} onRetry={load} />}
            {!loading && !error && items.length === 0 && (
                <EmptyState label={emptyLabel} />
            )}
            {!loading && !error && items.length > 0 && (
                <Box
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    {items.map(item => {
                        const key = documentTypeIdOf(item);
                        const historyOpen = expandedHistory.has(key);
                        return (
                            <Box
                                key={key}
                                className="border border-divider_01 rounded-xl p-3"
                            >
                                <Box
                                    flex
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                    style={{ gap: 8, flexWrap: "wrap" }}
                                >
                                    <Box
                                        flex
                                        alignItems="center"
                                        style={{ gap: 6 }}
                                    >
                                        <Icon
                                            icon="zi-file"
                                            className="text-text_2"
                                        />
                                        <Text size="small" bold>
                                            {documentTypeName(item)}
                                        </Text>
                                        <StatusBadge
                                            label={
                                                item.rule.isRequired
                                                    ? "Bắt buộc"
                                                    : "Tùy chọn"
                                            }
                                            tone={
                                                item.rule.isRequired
                                                    ? "blue"
                                                    : "gray"
                                            }
                                        />
                                    </Box>
                                    <Box
                                        flex
                                        alignItems="center"
                                        style={{ gap: 6 }}
                                    >
                                        {item.missing ? (
                                            <StatusBadge
                                                label="Chưa nộp"
                                                tone="gray"
                                            />
                                        ) : (
                                            item.activeDocument && (
                                                <StatusBadge
                                                    label={
                                                        BUSINESS_DOCUMENT_STATUS_LABEL[
                                                            item.activeDocument
                                                                .status
                                                        ]
                                                    }
                                                    tone={
                                                        BUSINESS_DOCUMENT_STATUS_TONE[
                                                            item.activeDocument
                                                                .status
                                                        ]
                                                    }
                                                />
                                            )
                                        )}
                                        {item.expired && (
                                            <StatusBadge
                                                label="Hết hạn"
                                                tone="red"
                                            />
                                        )}
                                    </Box>
                                </Box>

                                {item.activeDocument && (
                                    <Box mt={2} className="pl-6">
                                        <Text
                                            size="xSmall"
                                            className="text-main"
                                            onClick={() => {
                                                const url = fileUrlOf(
                                                    item.activeDocument!,
                                                );
                                                if (url)
                                                    window.open(url, "_blank");
                                            }}
                                        >
                                            {fileNameOf(item.activeDocument)}
                                        </Text>
                                        <Text
                                            size="xxSmall"
                                            className="text-text_2 block mt-1"
                                        >
                                            {actorLabel(
                                                item.activeDocument.uploadedBy,
                                            )}{" "}
                                            •{" "}
                                            {formatDateTime(
                                                item.activeDocument.createdAt,
                                            )}
                                            {item.activeDocument.docNumber &&
                                                ` • Số: ${item.activeDocument.docNumber}`}
                                            {item.activeDocument.issueDate &&
                                                ` • Cấp ngày: ${formatDate(
                                                    item.activeDocument
                                                        .issueDate,
                                                )}`}
                                            {item.activeDocument.expiryDate &&
                                                ` • Hạn: ${formatDate(
                                                    item.activeDocument
                                                        .expiryDate,
                                                )}`}
                                        </Text>
                                        {item.activeDocument.status ===
                                            "rejected" &&
                                            item.activeDocument
                                                .rejectionReason && (
                                                <Text
                                                    size="xxSmall"
                                                    className="text-red-500 block mt-1"
                                                >
                                                    Lý do:{" "}
                                                    {
                                                        item.activeDocument
                                                            .rejectionReason
                                                    }
                                                </Text>
                                            )}
                                    </Box>
                                )}

                                <Box
                                    mt={2}
                                    flex
                                    style={{ gap: 16, flexWrap: "wrap" }}
                                >
                                    {canSubmit &&
                                        (item.missing ||
                                            item.activeDocument?.status ===
                                                "rejected") && (
                                            <Text
                                                size="xSmall"
                                                className="text-main"
                                                onClick={() => openSubmit(item)}
                                            >
                                                {item.missing
                                                    ? "Nộp giấy tờ"
                                                    : "Nộp lại"}
                                            </Text>
                                        )}
                                    {item.activeDocument?.status ===
                                        "pending" &&
                                        canReview(item) && (
                                            <Text
                                                size="xSmall"
                                                className="text-main"
                                                onClick={() => openReview(item)}
                                            >
                                                Duyệt / yêu cầu bổ sung
                                            </Text>
                                        )}
                                </Box>

                                {item.history.length > 0 && (
                                    <Box mt={2}>
                                        <Text
                                            size="xxSmall"
                                            className="text-main"
                                            onClick={() => toggleHistory(key)}
                                        >
                                            {historyOpen
                                                ? "Ẩn lịch sử nộp trước đây"
                                                : `Xem ${item.history.length} lần nộp trước đây`}
                                        </Text>
                                        {historyOpen && (
                                            <Box
                                                mt={1}
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 4,
                                                }}
                                            >
                                                {item.history.map(h => (
                                                    <Text
                                                        key={h._id}
                                                        size="xxSmall"
                                                        className="text-text_2"
                                                    >
                                                        <StatusBadge
                                                            label={
                                                                BUSINESS_DOCUMENT_STATUS_LABEL[
                                                                    h.status
                                                                ]
                                                            }
                                                            tone={
                                                                BUSINESS_DOCUMENT_STATUS_TONE[
                                                                    h.status
                                                                ]
                                                            }
                                                        />{" "}
                                                        {formatDateTime(
                                                            h.createdAt,
                                                        )}
                                                        {h.rejectionReason &&
                                                            ` — ${h.rejectionReason}`}
                                                    </Text>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            )}

            <Sheet
                visible={!!submitting}
                onClose={() => !submitBusy && setSubmitting(null)}
                title={
                    submitting
                        ? `Nộp giấy tờ: ${documentTypeName(submitting)}`
                        : "Nộp giấy tờ"
                }
                autoHeight
                mask
            >
                <Box
                    p={4}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <Input
                        label="Số hiệu giấy tờ (nếu có)"
                        value={docNumber}
                        onChange={e => setDocNumber(e.target.value)}
                    />
                    {submitting && documentTypeOf(submitting)?.hasIssueDate && (
                        <DatePicker
                            label="Ngày cấp"
                            title="Chọn ngày cấp"
                            value={issueDate}
                            onChange={date => setIssueDate(date)}
                            placeholder="Chọn ngày cấp"
                        />
                    )}
                    {submitting &&
                        documentTypeOf(submitting)?.hasExpiryDate && (
                            <DatePicker
                                label="Ngày hết hạn"
                                title="Chọn ngày hết hạn"
                                value={expiryDate}
                                onChange={date => setExpiryDate(date)}
                                placeholder="Chọn ngày hết hạn"
                            />
                        )}
                    <Button
                        loading={submitBusy}
                        fullWidth
                        onClick={handleSubmitDocument}
                    >
                        Chọn tệp & nộp
                    </Button>
                </Box>
            </Sheet>

            <Sheet
                visible={!!reviewing}
                onClose={() => !reviewDecision && setReviewing(null)}
                title={
                    reviewing
                        ? `Duyệt giấy tờ: ${documentTypeName(reviewing)}`
                        : "Duyệt giấy tờ"
                }
                autoHeight
                mask
            >
                <Box
                    p={4}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <TextArea
                        label="Lý do yêu cầu bổ sung (bắt buộc nếu từ chối)"
                        placeholder="VD: Ảnh mờ, thiếu trang, sai thông tin..."
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                    />
                    <Box flex style={{ gap: 8 }}>
                        <Button
                            fullWidth
                            className="!bg-red-500"
                            loading={reviewDecision === "rejected"}
                            onClick={() => submitDecision("rejected")}
                        >
                            Yêu cầu bổ sung
                        </Button>
                        <Button
                            fullWidth
                            loading={reviewDecision === "approved"}
                            onClick={() => submitDecision("approved")}
                        >
                            Duyệt
                        </Button>
                    </Box>
                </Box>
            </Sheet>
        </Box>
    );
};

export default RequiredDocumentsPanel;
