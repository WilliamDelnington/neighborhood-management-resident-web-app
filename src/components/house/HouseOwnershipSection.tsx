import React, { useEffect, useState } from "react";
import { Box, Modal, Text, useSnackbar } from "@components/ui";
import {
    EmptyState,
    ErrorState,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import AddHouseOwnershipSheet from "@components/house/AddHouseOwnershipSheet";
import {
    HOUSE_OWNERSHIP_RELATIONSHIP_TYPE_LABEL,
    HOUSE_OWNERSHIP_VERIFICATION_STATUS_LABEL,
    HOUSE_OWNERSHIP_VERIFICATION_STATUS_TONE,
} from "@constants/domain";
import { AppError, HouseOwnership } from "@dts";
import {
    endHouseOwnership,
    fetchHouseOwnerships,
} from "@service/houseOwnershipApi";
import { createChangeRequest } from "@service/changeRequestApi";

export interface HouseOwnershipSectionProps {
    houseId: string;
    canManage: boolean;
    // Id cua nguoi dang dang nhap - dung de phan biet "dang ket thuc CHINH
    // quan he cua minh" (phai gui yeu cau duyet, xem backend
    // houseOwnershipService.endHouseOwnership) voi "nhan vien ket thuc quan he
    // cua nguoi khac" (van lam truc tiep nhu cu). Chi xu ly dung cho
    // ownerType="user" - quan he do to chuc dai dien (ownerType="organization")
    // van di truc tiep (xem ghi chu trong changeRequestService.ts o backend).
    currentUserId?: string;
}

/**
 * Danh sach quan he so huu/quan ly cua mot nha so (nhieu-nhieu qua
 * HouseOwnership o backend, khac voi cache House.ownerId/ownerType chi phan
 * anh chu so huu chinh hien tai) - cho phep them dong so huu/nguoi quan ly,
 * chuyen chu so huu chinh, va ket thuc mot quan he (giu lai lich su, khong
 * xoa - xem houseOwnershipService o backend).
 */
const HouseOwnershipSection: React.FC<HouseOwnershipSectionProps> = ({
    houseId,
    canManage,
    currentUserId,
}) => {
    const { openSnackbar } = useSnackbar();
    const [ownerships, setOwnerships] = useState<HouseOwnership[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [addVisible, setAddVisible] = useState(false);
    const [endTarget, setEndTarget] = useState<HouseOwnership | null>(null);
    const [ending, setEnding] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchHouseOwnerships(houseId)
            .then(setOwnerships)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, [houseId]);

    const isMine = (o: HouseOwnership) =>
        o.ownerType === "user" &&
        !!currentUserId &&
        o.ownerId === currentUserId;

    const handleEnd = async () => {
        if (!endTarget) return;
        try {
            setEnding(true);
            if (isMine(endTarget)) {
                await createChangeRequest({
                    targetModel: "HouseOwnership",
                    targetId: endTarget._id,
                    changeType: "unlink",
                });
                openSnackbar({
                    type: "success",
                    text: "Đã gửi yêu cầu hủy liên kết, chờ duyệt",
                });
            } else {
                await endHouseOwnership(houseId, endTarget._id);
                openSnackbar({
                    type: "success",
                    text: "Đã kết thúc quan hệ sở hữu",
                });
            }
            setEndTarget(null);
            load();
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setEnding(false);
        }
    };

    return (
        <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
            <Box flex justifyContent="space-between" alignItems="center" mb={2}>
                <Text.Title size="small">
                    Chủ sở hữu &amp; người quản lý
                </Text.Title>
                {canManage && (
                    <Text
                        size="xSmall"
                        className="text-main"
                        onClick={() => setAddVisible(true)}
                    >
                        + Thêm
                    </Text>
                )}
            </Box>

            {loading && <LoadingState />}
            {!loading && error && (
                <ErrorState
                    label="Không thể tải danh sách chủ sở hữu, vui lòng thử lại"
                    onRetry={load}
                />
            )}
            {!loading && !error && ownerships.length === 0 && (
                <EmptyState label="Chưa có quan hệ sở hữu nào" />
            )}
            {!loading &&
                !error &&
                ownerships.map(o => (
                    <Box
                        key={o._id}
                        py={2}
                        className="border-b border-divider_01 last:border-0"
                    >
                        <Box
                            flex
                            justifyContent="space-between"
                            alignItems="flex-start"
                            style={{ gap: 8 }}
                        >
                            <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text size="small" className="font-medium">
                                    {
                                        HOUSE_OWNERSHIP_RELATIONSHIP_TYPE_LABEL[
                                            o.relationshipType
                                        ]
                                    }{" "}
                                    — {o.ownerDisplayName || "Không rõ"}
                                </Text>
                                <Text size="xxSmall" className="text-text_2">
                                    {o.ownerPhone && `${o.ownerPhone} · `}
                                    {o.active
                                        ? `Từ ${new Date(
                                              o.startDate,
                                          ).toLocaleDateString("vi-VN")}`
                                        : `${new Date(
                                              o.startDate,
                                          ).toLocaleDateString(
                                              "vi-VN",
                                          )} — ${new Date(
                                              o.endDate || o.updatedAt,
                                          ).toLocaleDateString("vi-VN")}`}
                                    {o.reason && ` (${o.reason})`}
                                </Text>
                            </Box>
                            <Box
                                flex
                                flexDirection="column"
                                alignItems="flex-end"
                                style={{ gap: 4 }}
                            >
                                <StatusBadge
                                    label={
                                        o.active
                                            ? HOUSE_OWNERSHIP_VERIFICATION_STATUS_LABEL[
                                                  o.verificationStatus
                                              ]
                                            : "Đã kết thúc"
                                    }
                                    tone={
                                        o.active
                                            ? HOUSE_OWNERSHIP_VERIFICATION_STATUS_TONE[
                                                  o.verificationStatus
                                              ]
                                            : "gray"
                                    }
                                />
                                {canManage && o.active && (
                                    <Text
                                        size="xxSmall"
                                        className="text-red-500"
                                        onClick={() => setEndTarget(o)}
                                    >
                                        Kết thúc
                                    </Text>
                                )}
                            </Box>
                        </Box>
                    </Box>
                ))}

            <AddHouseOwnershipSheet
                visible={addVisible}
                onClose={() => setAddVisible(false)}
                houseId={houseId}
                onAdded={load}
            />

            <Modal
                visible={!!endTarget}
                title={
                    endTarget && isMine(endTarget)
                        ? "Gửi yêu cầu hủy liên kết?"
                        : "Kết thúc quan hệ sở hữu?"
                }
                description={
                    endTarget
                        ? `${
                              HOUSE_OWNERSHIP_RELATIONSHIP_TYPE_LABEL[
                                  endTarget.relationshipType
                              ]
                          } — ${endTarget.ownerDisplayName || "Không rõ"}. ${
                              isMine(endTarget)
                                  ? "Yêu cầu sẽ được gửi tới cán bộ phụ trách để duyệt."
                                  : "Hành động này giữ lại lịch sử, không thể hoàn tác."
                          }`
                        : undefined
                }
                onClose={() => setEndTarget(null)}
                actions={[
                    {
                        text: "Hủy",
                        close: true,
                        onClick: () => setEndTarget(null),
                    },
                    {
                        text:
                            endTarget && isMine(endTarget)
                                ? "Gửi yêu cầu"
                                : "Kết thúc",
                        danger: true,
                        onClick: handleEnd,
                        disabled: ending,
                    },
                ]}
            />
        </Box>
    );
};

export default HouseOwnershipSection;
