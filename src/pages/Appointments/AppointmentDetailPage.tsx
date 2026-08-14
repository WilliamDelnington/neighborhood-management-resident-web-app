import React, { useEffect, useState } from "react";
import { Box, Icon, Text, useParams, useSnackbar } from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button, TextArea } from "@components/customized";
import { ErrorState, LoadingState, StatusBadge } from "@components/admin";
import { RequireAuth } from "@components/role";
import AttachmentUploader from "@components/attachments/AttachmentUploader";
import {
    cancelAppointment,
    fetchAppointmentAttachments,
    fetchAppointmentDetail,
    deleteAppointmentAttachment,
    rateAppointment,
} from "@service/appointmentApi";
import {
    APPOINTMENT_STATUS_LABEL,
    APPOINTMENT_STATUS_TONE,
} from "@constants/domain";
import { formatDate } from "@utils/date-time";
import { Appointment } from "@dts";
import { useStore } from "@store";

const CANCELLABLE_STATUSES: Appointment["status"][] = [
    "cho_xac_nhan",
    "da_xac_nhan",
];

// BR-03: cu dan chi duoc huy lich hen truoc gio hen it nhat 2 tieng - tinh
// gan dung o client de phuc vu UX (khong bat buoc chinh xac tuyet doi, viec
// thuc thi that su nam o backend).
const getAppointmentDateTime = (appointment: Appointment): Date => {
    const base = new Date(appointment.appointedDate);
    const [hours, minutes] = appointment.startTime.split(":").map(Number);
    return new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        hours || 0,
        minutes || 0,
        0,
        0,
    );
};

const serviceLabel = (serviceId: Appointment["serviceId"]): string =>
    typeof serviceId === "string" ? serviceId : serviceId.name;

const houseLabel = (houseId: Appointment["houseId"]): string => {
    if (typeof houseId === "string") return houseId;
    return houseId.address
        ? `${houseId.code} — ${houseId.address}`
        : houseId.code;
};

const AppointmentDetailPage: React.FC = () => (
    <RequireAuth>
        <AppointmentDetailPageContent />
    </RequireAuth>
);

const AppointmentDetailPageContent: React.FC = () => {
    const { id } = useParams();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [submittingCancel, setSubmittingCancel] = useState(false);

    const [rating, setRating] = useState(0);
    const [ratingNote, setRatingNote] = useState("");
    const [submittingRating, setSubmittingRating] = useState(false);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setErrorMessage(null);
        fetchAppointmentDetail(id)
            .then(setAppointment)
            .catch(err =>
                setErrorMessage(err?.message || "Không thể tải lịch hẹn"),
            )
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    const isOwner = !!(
        user &&
        appointment &&
        (String(
            typeof appointment.bookedByUserId === "object"
                ? appointment.bookedByUserId._id
                : appointment.bookedByUserId,
        ) === String(user.id) ||
            (appointment.citizenUserId &&
                String(
                    typeof appointment.citizenUserId === "object"
                        ? appointment.citizenUserId._id
                        : appointment.citizenUserId,
                ) === String(user.id)))
    );

    const canCancel = !!(
        appointment &&
        CANCELLABLE_STATUSES.includes(appointment.status) &&
        getAppointmentDateTime(appointment).getTime() - Date.now() >
            2 * 60 * 60 * 1000
    );

    const handleCancel = async () => {
        if (!id) return;
        try {
            setSubmittingCancel(true);
            await cancelAppointment(id, cancelReason.trim() || undefined);
            openSnackbar({ type: "success", text: "Đã hủy lịch hẹn" });
            setCancelling(false);
            setCancelReason("");
            load();
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setSubmittingCancel(false);
        }
    };

    const handleRate = async () => {
        if (!id) return;
        if (!rating) {
            openSnackbar({
                type: "error",
                text: "Vui lòng chọn số sao đánh giá",
            });
            return;
        }
        try {
            setSubmittingRating(true);
            await rateAppointment(id, rating, ratingNote.trim() || undefined);
            openSnackbar({ type: "success", text: "Cảm ơn bạn đã đánh giá" });
            load();
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setSubmittingRating(false);
        }
    };

    return (
        <PageLayout id="appointment-detail-page" title="Chi tiết lịch hẹn">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && errorMessage && (
                    <ErrorState label={errorMessage} onRetry={load} />
                )}
                {!loading && !errorMessage && appointment && (
                    <>
                        <Box className="bg-white rounded-2xl p-4 shadow-sm">
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="flex-start"
                            >
                                <Text.Title size="small">
                                    {serviceLabel(appointment.serviceId)}
                                </Text.Title>
                                <StatusBadge
                                    label={
                                        APPOINTMENT_STATUS_LABEL[
                                            appointment.status
                                        ]
                                    }
                                    tone={
                                        APPOINTMENT_STATUS_TONE[
                                            appointment.status
                                        ]
                                    }
                                />
                            </Box>

                            <Box
                                mt={3}
                                px={5}
                                py={3}
                                className="border-2 border-main rounded-2xl"
                                textAlign="center"
                            >
                                <Text size="xxSmall" className="text-text_2">
                                    Mã đặt lịch
                                </Text>
                                <Text.Title size="large" className="text-main">
                                    {appointment.code}
                                </Text.Title>
                            </Box>

                            <Box
                                flex
                                alignItems="center"
                                className="text-text_2 mt-3"
                                style={{ gap: 6 }}
                            >
                                <Icon icon="zi-clock-1" size={16} />
                                <Text size="xSmall" className="text-text_2">
                                    {formatDate(
                                        new Date(appointment.appointedDate),
                                    )}
                                    {" · "}
                                    {appointment.startTime} -{" "}
                                    {appointment.endTime}
                                </Text>
                            </Box>
                            <Box
                                flex
                                alignItems="center"
                                className="text-text_2 mt-1"
                                style={{ gap: 6 }}
                            >
                                <Icon icon="zi-location" size={16} />
                                <Text size="xSmall" className="text-text_2">
                                    Nhà: {houseLabel(appointment.houseId)}
                                </Text>
                            </Box>

                            {appointment.proxyName && (
                                <Text
                                    size="xSmall"
                                    className="text-text_2 mt-1"
                                >
                                    Đặt hộ: {appointment.proxyName}
                                    {appointment.proxyPhone
                                        ? ` — ${appointment.proxyPhone}`
                                        : ""}
                                </Text>
                            )}

                            {appointment.note && (
                                <Text size="xSmall" className="mt-2">
                                    Ghi chú: {appointment.note}
                                </Text>
                            )}

                            {appointment.status === "tu_choi" &&
                                appointment.cancelReason && (
                                    <Text
                                        size="xSmall"
                                        className="text-red-600 mt-2"
                                    >
                                        Lý do từ chối:{" "}
                                        {appointment.cancelReason}
                                    </Text>
                                )}
                            {appointment.status === "da_huy" &&
                                appointment.cancelReason && (
                                    <Text
                                        size="xSmall"
                                        className="text-text_2 mt-2"
                                    >
                                        Lý do hủy: {appointment.cancelReason}
                                    </Text>
                                )}
                        </Box>

                        {isOwner &&
                            CANCELLABLE_STATUSES.includes(
                                appointment.status,
                            ) && (
                                <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                                    {!cancelling ? (
                                        <Button
                                            variant="secondary"
                                            fullWidth
                                            disabled={!canCancel}
                                            onClick={() => setCancelling(true)}
                                        >
                                            Hủy lịch hẹn
                                        </Button>
                                    ) : (
                                        <>
                                            <TextArea
                                                label="Lý do hủy (không bắt buộc)"
                                                value={cancelReason}
                                                onChange={e =>
                                                    setCancelReason(
                                                        e.target.value,
                                                    )
                                                }
                                                rows={3}
                                            />
                                            <Box mt={2} flex style={{ gap: 8 }}>
                                                <Button
                                                    variant="secondary"
                                                    fullWidth
                                                    onClick={() => {
                                                        setCancelling(false);
                                                        setCancelReason("");
                                                    }}
                                                >
                                                    Đóng
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    loading={submittingCancel}
                                                    onClick={handleCancel}
                                                >
                                                    Xác nhận hủy
                                                </Button>
                                            </Box>
                                        </>
                                    )}
                                    {!canCancel && !cancelling && (
                                        <Text
                                            size="xxSmall"
                                            className="text-text_2 mt-2"
                                        >
                                            Chỉ có thể hủy trước giờ hẹn ít nhất
                                            2 tiếng.
                                        </Text>
                                    )}
                                </Box>
                            )}

                        {isOwner && appointment.status === "hoan_thanh" && (
                            <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                                <Text.Title size="small" className="mb-2">
                                    Đánh giá buổi làm việc
                                </Text.Title>
                                {appointment.rating ? (
                                    <>
                                        <Box
                                            flex
                                            justifyContent="center"
                                            style={{ gap: 4 }}
                                        >
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Text
                                                    key={star}
                                                    size="large"
                                                    className={
                                                        star <=
                                                        (appointment.rating ||
                                                            0)
                                                            ? "text-yellow-500"
                                                            : "text-divider_01"
                                                    }
                                                >
                                                    ★
                                                </Text>
                                            ))}
                                        </Box>
                                        {appointment.ratingNote && (
                                            <Text
                                                size="xSmall"
                                                className="text-text_2 mt-2 text-center"
                                            >
                                                {appointment.ratingNote}
                                            </Text>
                                        )}
                                        <Text
                                            size="xxSmall"
                                            className="text-text_2 mt-2 text-center"
                                        >
                                            Bạn đã đánh giá buổi làm việc này.
                                        </Text>
                                    </>
                                ) : (
                                    <>
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
                                        <TextArea
                                            label="Nhận xét (không bắt buộc)"
                                            value={ratingNote}
                                            onChange={e =>
                                                setRatingNote(e.target.value)
                                            }
                                            rows={2}
                                        />
                                        <Box mt={3}>
                                            <Button
                                                fullWidth
                                                loading={submittingRating}
                                                onClick={handleRate}
                                            >
                                                Gửi đánh giá
                                            </Button>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        )}

                        <AttachmentUploader
                            relatedModel="Appointment"
                            relatedId={appointment._id}
                            canUpload={isOwner}
                            canDelete={isOwner}
                            fetchAttachments={fetchAppointmentAttachments}
                            deleteAttachmentFn={deleteAppointmentAttachment}
                        />
                    </>
                )}
            </Box>
        </PageLayout>
    );
};

export default AppointmentDetailPage;
