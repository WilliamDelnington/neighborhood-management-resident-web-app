import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    Box,
    Icon,
    Select,
    Text,
    useNavigate,
    useSnackbar,
} from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button, Input, TextArea } from "@components/customized";
import { RequireAuth, hasPermission } from "@components/role";
import { HouseTargetPickerSheet } from "@components/house";
import {
    createComplaint,
    createComplaintDraftId,
    deleteComplaintAttachment,
} from "@service/complaintApi";
import { pickAndUploadAttachment, PickedUpload } from "@service/uploadApi";
import { fetchComplaintTypeDefinitions } from "@service/complaintTypeApi";
import { NHOM_PHAN_ANH_LABEL } from "@constants/domain";
import { Complaint, HouseLookupItem, NhomPhanAnh } from "@dts";
import { useStore } from "@store";

/**
 * pickAndUploadAttachment chi tra ve {url, fileAssetId} (khong co ten file
 * goc) - suy ra ten hien thi tu url theo dung quy uoc dat ten cua
 * saveUploadedFile ben backend (`${Date.now()}-${sanitizedOriginalName}`).
 */
const extractFileNameFromUrl = (url: string): string => {
    const lastSegment = decodeURIComponent(url).split("/").pop() || "";
    const dashIndex = lastSegment.indexOf("-");
    return dashIndex >= 0 ? lastSegment.slice(dashIndex + 1) : lastSegment;
};

const ComplaintCreatePage: React.FC = () => (
    <RequireAuth>
        <ComplaintCreatePageContent />
    </RequireAuth>
);

const ComplaintCreatePageContent: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canCreate = hasPermission(user, "complaints.create");

    // Loi vao tu man "Bao su co ha tang" (C11) - xem IncidentShortcutPage.tsx -
    // chi dien san nhom + tien to tieu de, khong tao workflow rieng vi day van
    // la mot Complaint thong thuong.
    const incidentState = location.state as
        | { presetCategory?: NhomPhanAnh; presetTitlePrefix?: string }
        | undefined;

    const [category, setCategory] = useState<NhomPhanAnh | undefined>(
        incidentState?.presetCategory,
    );
    const [title, setTitle] = useState(
        incidentState?.presetTitlePrefix
            ? `${incidentState.presetTitlePrefix}: `
            : "",
    );
    const [content, setContent] = useState("");
    const [area, setArea] = useState("");
    const [targetHouse, setTargetHouse] = useState<HouseLookupItem | null>(
        null,
    );
    const [housePickerVisible, setHousePickerVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [created, setCreated] = useState<Complaint | null>(null);

    const [draftId, setDraftId] = useState<string | null>(null);
    const [pendingFiles, setPendingFiles] = useState<PickedUpload[]>([]);
    const [pickingFile, setPickingFile] = useState(false);

    // Bat dau bang danh sach tinh (khong rong khi dang tai), sau do thay bang
    // danh sach nhom phan anh dang hoat dong tu ComplaintTypeDefinition (quan
    // tri duoc qua man Loai phan anh o admin app) - cung pattern voi
    // RoleListPage.tsx (admin app).
    const [categoryOptions, setCategoryOptions] = useState<
        Array<{ key: NhomPhanAnh; label: string }>
    >(
        Object.entries(NHOM_PHAN_ANH_LABEL).map(([key, label]) => ({
            key,
            label,
        })),
    );
    useEffect(() => {
        fetchComplaintTypeDefinitions({ active: true, limit: 200 })
            .then(res =>
                setCategoryOptions(
                    res.items.map(type => ({
                        key: type.key,
                        label: type.name,
                    })),
                ),
            )
            .catch(() => {
                /* giu danh sach tinh (NHOM_PHAN_ANH_LABEL) neu goi API loi */
            });
    }, []);

    if (!canCreate) {
        return (
            <PageLayout id="complaint-create-denied" title="Gửi phản ánh">
                <Box
                    flex
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    p={6}
                    style={{ minHeight: "75vh" }}
                >
                    <Icon
                        icon="zi-warning-solid"
                        className="text-text_2"
                        size={56}
                    />
                    <Text.Title size="normal" className="mt-4 text-center">
                        Không có quyền thực hiện
                    </Text.Title>
                    <Text
                        size="xSmall"
                        className="text-text_2 mt-2 text-center"
                    >
                        Tài khoản của bạn không có quyền gửi phản ánh.
                    </Text>
                    <Box mt={6} style={{ width: "100%" }}>
                        <Button
                            fullWidth
                            onClick={() => navigate("/", { animate: true })}
                        >
                            Về trang chủ
                        </Button>
                    </Box>
                </Box>
            </PageLayout>
        );
    }

    const handlePickFile = async () => {
        try {
            setPickingFile(true);
            let currentDraftId = draftId;
            if (!currentDraftId) {
                const res = await createComplaintDraftId();
                currentDraftId = res.draftId;
                setDraftId(res.draftId);
            }
            const picked = await pickAndUploadAttachment(
                "Complaint",
                currentDraftId,
            );
            setPendingFiles(prev => [...prev, picked]);
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Không thể đính kèm tệp",
            });
        } finally {
            setPickingFile(false);
        }
    };

    const handleRemovePendingFile = async (fileAssetId: string) => {
        if (!draftId) return;
        try {
            await deleteComplaintAttachment(draftId, fileAssetId);
            setPendingFiles(prev =>
                prev.filter(f => f.fileAssetId !== fileAssetId),
            );
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Không thể xóa tệp đính kèm",
            });
        }
    };

    const handleSubmit = async () => {
        if (!category) {
            openSnackbar({
                type: "error",
                text: "Vui lòng chọn nhóm phản ánh",
            });
            return;
        }
        if (!title.trim()) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập tiêu đề phản ánh",
            });
            return;
        }
        if (!content.trim()) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập nội dung phản ánh",
            });
            return;
        }

        try {
            setSubmitting(true);
            const complaint = await createComplaint({
                category,
                title: title.trim(),
                content: content.trim(),
                area: area.trim() || undefined,
                houseId: targetHouse?._id,
                draftId: draftId || undefined,
            });
            setCreated(complaint);
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (created) {
        return (
            <PageLayout id="complaint-create-success" title="Gửi phản ánh">
                <Box
                    flex
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    p={6}
                    style={{ minHeight: "75vh" }}
                >
                    <Icon
                        icon="zi-check-circle-solid"
                        className="text-main"
                        size={56}
                    />
                    <Text.Title size="normal" className="mt-4 text-center">
                        Gửi phản ánh thành công
                    </Text.Title>
                    <Text
                        size="xSmall"
                        className="text-text_2 mt-2 text-center"
                    >
                        Mã phản ánh của bạn
                    </Text>
                    <Text.Title size="large" className="text-main mt-1">
                        {created.code}
                    </Text.Title>
                    <Text
                        size="xSmall"
                        className="text-text_2 mt-3 text-center"
                    >
                        Vui lòng lưu lại mã này để tra cứu tiến độ xử lý.
                    </Text>

                    <Box mt={8} style={{ width: "100%" }}>
                        <Button
                            fullWidth
                            onClick={() =>
                                navigate(`/complaints/${created._id}`, {
                                    animate: true,
                                })
                            }
                        >
                            Xem chi tiết
                        </Button>
                        <Box mt={3}>
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate("/", { animate: true })}
                            >
                                Về trang chủ
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout id="complaint-create-page" title="Gửi phản ánh">
            <Box p={4}>
                <Text size="xSmall" className="font-medium text-text_1 mb-2">
                    Nhóm phản ánh
                </Text>
                <Select
                    placeholder="Chọn nhóm phản ánh"
                    value={category}
                    onChange={value => setCategory(value as NhomPhanAnh)}
                    closeOnSelect
                >
                    {categoryOptions.map(({ key, label }) => (
                        <Select.Option key={key} value={key} title={label} />
                    ))}
                </Select>

                <Box mt={3}>
                    <Input
                        label="Tiêu đề"
                        placeholder="VD: Đèn đường ngõ 12 bị hỏng"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </Box>

                <Box mt={3}>
                    <TextArea
                        label="Nội dung"
                        placeholder="Mô tả chi tiết sự việc..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={4}
                    />
                </Box>

                <Box mt={3}>
                    <Input
                        label="Địa chỉ/khu vực (không bắt buộc)"
                        placeholder="VD: Ngõ 12, cụm 3"
                        value={area}
                        onChange={e => setArea(e.target.value)}
                    />
                </Box>

                <Box mt={3}>
                    <Text
                        size="xSmall"
                        className="font-medium text-text_1 mb-2"
                    >
                        Nhà số liên quan (không bắt buộc)
                    </Text>
                    {targetHouse ? (
                        <Box
                            flex
                            alignItems="center"
                            justifyContent="space-between"
                            p={3}
                            className="bg-ng_10 rounded-xl"
                        >
                            <Box style={{ minWidth: 0, flex: 1 }}>
                                <Text size="small" bold className="truncate">
                                    {targetHouse.code}
                                    {targetHouse.address
                                        ? ` — ${targetHouse.address}`
                                        : ""}
                                </Text>
                            </Box>
                            <Box
                                onClick={() => setTargetHouse(null)}
                                pl={3}
                                style={{ flexShrink: 0 }}
                            >
                                <Icon icon="zi-close" className="text-text_3" />
                            </Box>
                        </Box>
                    ) : (
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setHousePickerVisible(true)}
                        >
                            Chọn nhà số
                        </Button>
                    )}
                    <Text size="xSmall" className="text-text_2 mt-1.5">
                        Có thể chọn bất kỳ nhà số nào liên quan đến phản ánh,
                        không nhất thiết là nhà của bạn. Nếu chọn, phản ánh sẽ
                        được gửi tới Tổ trưởng phụ trách nhà số đó.
                    </Text>
                </Box>

                <HouseTargetPickerSheet
                    visible={housePickerVisible}
                    onClose={() => setHousePickerVisible(false)}
                    onSelect={house => setTargetHouse(house)}
                />

                <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                    <Box
                        flex
                        justifyContent="space-between"
                        alignItems="center"
                        mb={pendingFiles.length > 0 ? 2 : 0}
                    >
                        <Text.Title size="small">
                            Tài liệu đính kèm (không bắt buộc)
                        </Text.Title>
                        <Box
                            flex
                            alignItems="center"
                            className="text-main"
                            onClick={pickingFile ? undefined : handlePickFile}
                        >
                            <Icon icon="zi-plus" />
                            <Text size="xSmall" className="text-main ml-1">
                                {pickingFile ? "Đang tải lên..." : "Đính kèm"}
                            </Text>
                        </Box>
                    </Box>

                    {pendingFiles.map(file => (
                        <Box
                            key={file.fileAssetId}
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
                                    {extractFileNameFromUrl(file.url)}
                                </Text>
                            </Box>
                            <Box
                                onClick={() =>
                                    handleRemovePendingFile(file.fileAssetId)
                                }
                                style={{ flexShrink: 0 }}
                                pl={3}
                            >
                                <Icon icon="zi-close" className="text-text_3" />
                            </Box>
                        </Box>
                    ))}
                </Box>

                <Box mt={6}>
                    <Button
                        fullWidth
                        loading={submitting}
                        onClick={handleSubmit}
                    >
                        Gửi phản ánh
                    </Button>
                </Box>
            </Box>
        </PageLayout>
    );
};

export default ComplaintCreatePage;
