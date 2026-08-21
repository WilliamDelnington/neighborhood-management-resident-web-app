import React, { useEffect, useState } from "react";
import { Box, Text, useNavigate, useSnackbar } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { Button, TextArea, Input } from "@components/customized";
import {
    EmptyState,
    ErrorState,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { RequireAuth } from "@components/role";
import { useStore } from "@store";
import { fetchMyHouses } from "@service/myHouseApi";
import { createChangeRequest } from "@service/changeRequestApi";
import {
    HOUSE_OWNERSHIP_RELATIONSHIP_TYPE_LABEL,
    HOUSE_OWNERSHIP_VERIFICATION_STATUS_LABEL,
    HOUSE_STATUS_LABEL,
    HOUSE_STATUS_TONE,
    HOUSE_USAGE_TYPE_LABEL,
} from "@constants/domain";
import { AppError, HouseOwnership, MyHouseOverviewItem } from "@dts";

const MyHousePage: React.FC = () => (
    <RequireAuth>
        <MyHouseContent />
    </RequireAuth>
);

/**
 * "Nha cua toi" (C02) - danh tinh nha so gan voi tai khoan dang dang nhap,
 * suy tu HouseOwnership (khong co model dai dien/thanh vien rieng, xem
 * app/api/houses/mine o backend). De nghi sua thong tin / huy lien ket deu
 * di qua ChangeRequest da co san (@service/changeRequestApi) - khong co API
 * moi cho hai hanh dong nay.
 */
const MyHouseContent: React.FC = () => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);

    const [items, setItems] = useState<MyHouseOverviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [editingHouseId, setEditingHouseId] = useState<string | null>(null);
    const [addressInput, setAddressInput] = useState("");
    const [otherUsageNoteInput, setOtherUsageNoteInput] = useState("");
    const [reasonInput, setReasonInput] = useState("");
    const [submittingCorrection, setSubmittingCorrection] = useState(false);

    const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchMyHouses()
            .then(setItems)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startCorrection = (item: MyHouseOverviewItem) => {
        setEditingHouseId(item.house._id);
        setAddressInput(item.house.address);
        setOtherUsageNoteInput(item.house.otherUsageNote || "");
        setReasonInput("");
    };

    const submitCorrection = async (item: MyHouseOverviewItem) => {
        const patch: Record<string, unknown> = {};
        if (addressInput.trim() && addressInput.trim() !== item.house.address) {
            patch.address = addressInput.trim();
        }
        if (otherUsageNoteInput.trim() !== (item.house.otherUsageNote || "")) {
            patch.otherUsageNote = otherUsageNoteInput.trim();
        }
        if (Object.keys(patch).length === 0) {
            openSnackbar({
                type: "error",
                text: "Bạn chưa thay đổi thông tin nào",
            });
            return;
        }
        try {
            setSubmittingCorrection(true);
            await createChangeRequest({
                targetModel: "HouseRecord",
                targetId: item.house._id,
                changeType: "update",
                patch,
                reason: reasonInput.trim() || undefined,
            });
            openSnackbar({
                type: "success",
                text: "Đã gửi đề nghị sửa thông tin, chờ duyệt",
            });
            setEditingHouseId(null);
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setSubmittingCorrection(false);
        }
    };

    const handleUnlink = async (ownership: HouseOwnership) => {
        try {
            setUnlinkingId(ownership._id);
            await createChangeRequest({
                targetModel: "HouseOwnership",
                targetId: ownership._id,
                changeType: "unlink",
                reason: "Yêu cầu từ chủ sở hữu/người quản lý",
            });
            openSnackbar({
                type: "success",
                text: "Đã gửi yêu cầu hủy liên kết, chờ duyệt",
            });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setUnlinkingId(null);
        }
    };

    return (
        <PageLayout
            id="my-house-page"
            title="Nhà của tôi"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}
                {!loading && !error && items.length === 0 && (
                    <EmptyState label="Bạn chưa liên kết với nhà số nào. Vui lòng liên hệ Tổ dân phố để được hỗ trợ." />
                )}
                {!loading &&
                    !error &&
                    items.map(item => {
                        const { house, ownerships, usageUnits } = item;
                        const neighborhood =
                            house.neighborhoodId &&
                            typeof house.neighborhoodId !== "string"
                                ? house.neighborhoodId
                                : null;
                        return (
                            <Box
                                key={house._id}
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
                                            {house.code} — {house.address}
                                        </Text>
                                        <Text
                                            size="xxSmall"
                                            className="text-text_2 mt-1"
                                        >
                                            Cụm/khu: {house.cluster}
                                        </Text>
                                    </Box>
                                    <StatusBadge
                                        label={HOUSE_STATUS_LABEL[house.status]}
                                        tone={HOUSE_STATUS_TONE[house.status]}
                                    />
                                </Box>

                                {house.status === "needs_update" &&
                                    house.needsUpdateNote && (
                                        <Text
                                            size="xSmall"
                                            className="text-yellow-700 mt-2"
                                        >
                                            Cần bổ sung: {house.needsUpdateNote}
                                        </Text>
                                    )}
                                {house.status === "denied" &&
                                    house.denialReason && (
                                        <Text
                                            size="xSmall"
                                            className="text-red-600 mt-2"
                                        >
                                            Lý do từ chối: {house.denialReason}
                                        </Text>
                                    )}

                                {neighborhood && (
                                    <Text
                                        size="xSmall"
                                        className="text-main mt-2"
                                        onClick={() =>
                                            navigate("/neighborhood/mine")
                                        }
                                    >
                                        Tổ dân phố: {neighborhood.name}
                                        {neighborhood.contactPhone
                                            ? ` · ĐT: ${neighborhood.contactPhone}`
                                            : ""}
                                    </Text>
                                )}

                                {house.usageTypes?.length > 0 && (
                                    <Text
                                        size="xxSmall"
                                        className="text-text_2 mt-1"
                                    >
                                        Mục đích sử dụng:{" "}
                                        {house.usageTypes
                                            .map(t => HOUSE_USAGE_TYPE_LABEL[t])
                                            .join(", ")}
                                    </Text>
                                )}

                                {/* Nguoi lien ket */}
                                <Text
                                    size="xSmall"
                                    className="font-medium mt-3"
                                >
                                    Người liên kết với nhà này
                                </Text>
                                {ownerships
                                    .filter(o => o.active)
                                    .map(o => {
                                        const isSelf =
                                            o.ownerType === "user" &&
                                            String(o.ownerId) ===
                                                String(user?.id);
                                        return (
                                            <Box
                                                key={o._id}
                                                flex
                                                justifyContent="space-between"
                                                alignItems="center"
                                                className="mt-2"
                                            >
                                                <Box>
                                                    <Text size="xSmall">
                                                        {o.ownerDisplayName ||
                                                            "—"}
                                                        {o.ownerPhone
                                                            ? ` (${o.ownerPhone})`
                                                            : ""}
                                                    </Text>
                                                    <Text
                                                        size="xxSmall"
                                                        className="text-text_2"
                                                    >
                                                        {
                                                            HOUSE_OWNERSHIP_RELATIONSHIP_TYPE_LABEL[
                                                                o
                                                                    .relationshipType
                                                            ]
                                                        }
                                                        {" · "}
                                                        {
                                                            HOUSE_OWNERSHIP_VERIFICATION_STATUS_LABEL[
                                                                o
                                                                    .verificationStatus
                                                            ]
                                                        }
                                                    </Text>
                                                </Box>
                                                {isSelf && (
                                                    <Button
                                                        size="small"
                                                        variant="secondary"
                                                        loading={
                                                            unlinkingId ===
                                                            o._id
                                                        }
                                                        onClick={() =>
                                                            handleUnlink(o)
                                                        }
                                                    >
                                                        Hủy liên kết
                                                    </Button>
                                                )}
                                            </Box>
                                        );
                                    })}

                                {/* Don vi su dung (ho dan/kinh doanh/cong ty da gan) */}
                                {usageUnits.length > 0 && (
                                    <>
                                        <Text
                                            size="xSmall"
                                            className="font-medium mt-3"
                                        >
                                            Đơn vị đang sử dụng nhà
                                        </Text>
                                        {usageUnits.map(u => (
                                            <Text
                                                key={u._id}
                                                size="xxSmall"
                                                className="text-text_2 mt-1"
                                            >
                                                {u.unitLabel} —{" "}
                                                {u.householdId?.code ||
                                                    u.businessId?.name ||
                                                    u.companyId?.name}
                                            </Text>
                                        ))}
                                    </>
                                )}

                                {/* De nghi sua thong tin */}
                                {editingHouseId === house._id ? (
                                    <Box mt={3}>
                                        <Input
                                            label="Địa chỉ"
                                            value={addressInput}
                                            onChange={e =>
                                                setAddressInput(e.target.value)
                                            }
                                        />
                                        <TextArea
                                            className="mt-2"
                                            label="Ghi chú mục đích sử dụng khác"
                                            value={otherUsageNoteInput}
                                            onChange={e =>
                                                setOtherUsageNoteInput(
                                                    e.target.value,
                                                )
                                            }
                                            rows={2}
                                        />
                                        <TextArea
                                            className="mt-2"
                                            label="Lý do đề nghị (không bắt buộc)"
                                            value={reasonInput}
                                            onChange={e =>
                                                setReasonInput(e.target.value)
                                            }
                                            rows={2}
                                        />
                                        <Box mt={2} flex style={{ gap: 8 }}>
                                            <Button
                                                fullWidth
                                                variant="secondary"
                                                onClick={() =>
                                                    setEditingHouseId(null)
                                                }
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                fullWidth
                                                loading={submittingCorrection}
                                                onClick={() =>
                                                    submitCorrection(item)
                                                }
                                            >
                                                Gửi đề nghị
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Button
                                        className="mt-3"
                                        fullWidth
                                        variant="secondary"
                                        onClick={() => startCorrection(item)}
                                    >
                                        Đề nghị sửa thông tin
                                    </Button>
                                )}
                            </Box>
                        );
                    })}

                {!loading && !error && items.length > 0 && (
                    <Text
                        size="xSmall"
                        className="text-main mt-4 text-center"
                        onClick={() => navigate("/change-requests/mine")}
                    >
                        Xem các yêu cầu thay đổi thông tin của tôi
                    </Text>
                )}
            </Box>
        </PageLayout>
    );
};

export default MyHousePage;
