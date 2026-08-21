import React, { useEffect, useState } from "react";
import { Box, Text, useNavigate, useSnackbar } from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button, Checkbox, Input, TextArea } from "@components/customized";
import { EmptyState, LoadingState } from "@components/admin";
import { RequireAuth } from "@components/role";
import { CorrespondenceType, AssignableStaff } from "@dts";
import { composeAndSendCorrespondence } from "@service/correspondenceApi";
import { fetchAssignableStaffByRoles } from "@service/userApi";
import CorrespondenceTypePickerSheet from "./CorrespondenceTypePickerSheet";

const CorrespondenceComposePage: React.FC = () => (
    <RequireAuth>
        <CorrespondenceComposeContent />
    </RequireAuth>
);

/**
 * Soan van bao gom ca hai buoc tao+gui trong mot thao tac (xem
 * composeAndSendCorrespondence) - khong co buoc "luu nhap" rieng nhu ban quan
 * tri web, phu hop thao tac tren dien thoai. Chi ho tro chon nguoi nhan cu the
 * (khong ho tro gui theo to dan pho hay dinh kem file - nhung tinh nang do
 * van con day du tren trang quan tri web cho can bo UBND/bi thu).
 */
const CorrespondenceComposeContent: React.FC = () => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();

    const [typePickerVisible, setTypePickerVisible] = useState(false);
    const [selectedType, setSelectedType] = useState<CorrespondenceType | null>(
        null,
    );

    const [documentNumber, setDocumentNumber] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);

    const [receiverSearch, setReceiverSearch] = useState("");
    const [receivers, setReceivers] = useState<AssignableStaff[]>([]);
    const [loadingReceivers, setLoadingReceivers] = useState(false);
    const [targetUserIds, setTargetUserIds] = useState<string[]>([]);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!selectedType) {
            setReceivers([]);
            return;
        }
        setLoadingReceivers(true);
        fetchAssignableStaffByRoles(selectedType.allowedReceiverRoles)
            .then(setReceivers)
            .catch(() => setReceivers([]))
            .finally(() => setLoadingReceivers(false));
    }, [selectedType]);

    const handleSelectType = (type: CorrespondenceType) => {
        setSelectedType(type);
        setDocumentNumber("");
        setTargetUserIds([]);
    };

    const toggleReceiver = (userId: string) => {
        setTargetUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(v => v !== userId)
                : [...prev, userId],
        );
    };

    const visibleReceivers = receivers.filter(r =>
        r.displayName.toLowerCase().includes(receiverSearch.toLowerCase()),
    );

    const isValid =
        !!selectedType &&
        title.trim().length > 0 &&
        content.trim().length >= 10 &&
        (!selectedType.requireDocumentNumber || documentNumber.trim()) &&
        targetUserIds.length > 0;

    const handleSubmit = async () => {
        if (!selectedType || !isValid) return;
        try {
            setSubmitting(true);
            await composeAndSendCorrespondence({
                correspondenceTypeId: selectedType._id,
                documentNumber: documentNumber.trim() || undefined,
                title: title.trim(),
                content: content.trim(),
                isUrgent,
                targetUserIds,
            });
            openSnackbar({ type: "success", text: "Đã gửi văn bản" });
            navigate("/correspondences", { animate: true });
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Không thể gửi văn bản",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageLayout id="correspondence-compose-page" title="Soạn văn bản">
            <Box p={4}>
                <Box
                    className="bg-white rounded-2xl p-4 shadow-card"
                    onClick={() => setTypePickerVisible(true)}
                >
                    <Text size="xSmall" className="text-text_2">
                        Loại văn bản
                    </Text>
                    <Text size="small" className="mt-1">
                        {selectedType?.name || "Chọn loại văn bản..."}
                    </Text>
                </Box>

                {selectedType && (
                    <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                        {selectedType.requireDocumentNumber && (
                            <Box mb={3}>
                                <Input
                                    label="Số/ký hiệu văn bản"
                                    placeholder="VD: 05/BC-TDP"
                                    value={documentNumber}
                                    onChange={e =>
                                        setDocumentNumber(e.target.value)
                                    }
                                />
                            </Box>
                        )}
                        <Box mb={3}>
                            <Input
                                label="Tiêu đề"
                                placeholder="Nhập tiêu đề văn bản"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </Box>
                        <Box mb={3}>
                            <TextArea
                                label="Nội dung"
                                placeholder="Nội dung văn bản"
                                rows={5}
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        </Box>
                        <Checkbox
                            label="Văn bản khẩn"
                            value="isUrgent"
                            checked={isUrgent}
                            onChange={() => setIsUrgent(!isUrgent)}
                        />

                        <Box mt={4}>
                            <Text size="xSmall" className="text-text_2 mb-2">
                                Gửi tới
                            </Text>
                            <Input
                                placeholder="Tìm theo tên..."
                                value={receiverSearch}
                                onChange={e =>
                                    setReceiverSearch(e.target.value)
                                }
                            />
                            <Box
                                mt={2}
                                style={{ maxHeight: 240, overflowY: "auto" }}
                            >
                                {loadingReceivers && <LoadingState />}
                                {!loadingReceivers &&
                                    visibleReceivers.length === 0 && (
                                        <EmptyState label="Không tìm thấy người nhận phù hợp" />
                                    )}
                                {!loadingReceivers &&
                                    visibleReceivers.map(r => (
                                        <Box
                                            key={r.id}
                                            py={2}
                                            className="border-b border-divider_01 last:border-0"
                                        >
                                            <Checkbox
                                                label={r.displayName}
                                                value={r.id}
                                                checked={targetUserIds.includes(
                                                    r.id,
                                                )}
                                                onChange={() =>
                                                    toggleReceiver(r.id)
                                                }
                                            />
                                        </Box>
                                    ))}
                            </Box>
                        </Box>
                    </Box>
                )}

                <Box mt={4}>
                    <Button
                        fullWidth
                        loading={submitting}
                        disabled={!isValid}
                        onClick={handleSubmit}
                    >
                        Gửi văn bản
                    </Button>
                </Box>
            </Box>

            <CorrespondenceTypePickerSheet
                visible={typePickerVisible}
                onClose={() => setTypePickerVisible(false)}
                onSelect={handleSelectType}
            />
        </PageLayout>
    );
};

export default CorrespondenceComposePage;
