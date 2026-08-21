import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    DatePicker,
    Icon,
    Text,
    useNavigate,
    useParams,
    useSnackbar,
} from "@components/ui";
import { PageLayout } from "@components/layout";
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
    AppointmentAvailableSlot,
    cancelAppointment,
    fetchAppointmentAttachments,
    fetchAppointmentDetail,
    fetchAvailableSlots,
    deleteAppointmentAttachment,
    rateAppointment,
    rescheduleAppointment,
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

// Chi duoc doi lich hen dang o trang thai "da_xac_nhan" (Da xac nhan) - khac
// CANCELLABLE_STATUSES (bao gom ca "cho_xac_nhan"), giong dieu kien
// rescheduleAppointment o backend.
const RESCHEDULABLE_STATUS: Appointment["status"] = "da_xac_nhan";

// BR-01 (giong AppointmentBookingPage.tsx): chi duoc doi sang ngay tu ngay
// mai (T+1) den toi da 30 ngay toi (T+30).
const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() + days);
    return result;
};

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

const serviceIdOf = (serviceId: Appointment["serviceId"]): string =>
    typeof serviceId === "string" ? serviceId : serviceId._id;

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
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [submittingCancel, setSubmittingCancel] = useState(false);

    const [rescheduling, setRescheduling] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>();
    const [rescheduleSlots, setRescheduleSlots] = useState<
        AppointmentAvailableSlot[]
    >([]);
    const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false);
    const [rescheduleSlotsError, setRescheduleSlotsError] = useState(false);
    const [selectedRescheduleSlotId, setSelectedRescheduleSlotId] = useState<
        string | null
    >(null);
    const [rescheduleReason, setRescheduleReason] = useState("");
    const [submittingReschedule, setSubmittingReschedule] = useState(false);

    const rescheduleMinDate = useMemo(() => addDays(new Date(), 1), []);
    const rescheduleMaxDate = useMemo(() => addDays(new Date(), 30), []);

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

    // Ap dung lai dung nguong BR-03 nhu canCancel (2 tieng truoc gio hen) -
    // xem SELF_SERVICE_MIN_HOURS_BEFORE o backend (appointmentService.ts).
    const canReschedule = !!(
        appointment &&
        appointment.status === RESCHEDULABLE_STATUS &&
        getAppointmentDateTime(appointment).getTime() - Date.now() >
            2 * 60 * 60 * 1000
    );

    const handleCancel = async () => {
        if (!id) return;
        if (!cancelReason.trim()) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập lý do hủy",
            });
            return;
        }
        try {
            setSubmittingCancel(true);
            await cancelAppointment(id, cancelReason.trim());
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

    useEffect(() => {
        setSelectedRescheduleSlotId(null);
        if (!appointment || !rescheduleDate) {
            setRescheduleSlots([]);
            return;
        }
        setRescheduleSlotsLoading(true);
        setRescheduleSlotsError(false);
        fetchAvailableSlots(
            serviceIdOf(appointment.serviceId),
            formatDate(rescheduleDate, "yyyy-mm-dd"),
        )
            .then(setRescheduleSlots)
            .catch(() => setRescheduleSlotsError(true))
            .finally(() => setRescheduleSlotsLoading(false));
    }, [appointment, rescheduleDate]);

    const closeReschedule = () => {
        setRescheduling(false);
        setRescheduleDate(undefined);
        setSelectedRescheduleSlotId(null);
        setRescheduleReason("");
    };

    const handleReschedule = async () => {
        if (!id) return;
        if (!rescheduleDate) {
            openSnackbar({ type: "error", text: "Vui lòng chọn ngày hẹn mới" });
            return;
        }
        if (!selectedRescheduleSlotId) {
            openSnackbar({
                type: "error",
                text: "Vui lòng chọn khung giờ mới",
            });
            return;
        }
        if (!rescheduleReason.trim()) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập lý do đổi lịch",
            });
            return;
        }
        try {
            setSubmittingReschedule(true);
            await rescheduleAppointment(id, {
                timeSlotId: selectedRescheduleSlotId,
                appointedDate: formatDate(rescheduleDate, "yyyy-mm-dd"),
                reason: rescheduleReason.trim(),
            });
            openSnackbar({ type: "success", text: "Đã đổi lịch hẹn" });
            closeReschedule();
            load();
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setSubmittingReschedule(false);
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
                        <Box className="bg-white rounded-2xl p-4 shadow-card">
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
                                appointment.rejectReason && (
                                    <Text
                                        size="xSmall"
                                        className="text-red-600 mt-2"
                                    >
                                        Lý do từ chối:{" "}
                                        {appointment.rejectReason}
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

                            {appointment.rescheduledFromDate && (
                                <Text
                                    size="xSmall"
                                    className="text-text_2 mt-2"
                                >
                                    Đã đổi từ{" "}
                                    {formatDate(
                                        new Date(
                                            appointment.rescheduledFromDate,
                                        ),
                                    )}
                                    {" · "}
                                    {
                                        appointment.rescheduledFromStartTime
                                    } - {appointment.rescheduledFromEndTime}
                                    {appointment.rescheduleReason
                                        ? ` — Lý do: ${appointment.rescheduleReason}`
                                        : ""}
                                </Text>
                            )}
                        </Box>

                        {isOwner && appointment.status === "tu_choi" && (
                            <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                                <Button
                                    fullWidth
                                    onClick={() =>
                                        navigate(
                                            `/appointments/book/${
                                                typeof appointment.serviceId ===
                                                "object"
                                                    ? appointment.serviceId._id
                                                    : appointment.serviceId
                                            }`,
                                            { animate: true },
                                        )
                                    }
                                >
                                    Đặt lại lịch hẹn
                                </Button>
                            </Box>
                        )}

                        {isOwner &&
                            CANCELLABLE_STATUSES.includes(
                                appointment.status,
                            ) && (
                                <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                                    {!cancelling && !rescheduling && (
                                        <Box flex style={{ gap: 8 }}>
                                            {appointment.status ===
                                                RESCHEDULABLE_STATUS && (
                                                <Button
                                                    variant="secondary"
                                                    fullWidth
                                                    disabled={!canReschedule}
                                                    onClick={() =>
                                                        setRescheduling(true)
                                                    }
                                                >
                                                    Đổi lịch hẹn
                                                </Button>
                                            )}
                                            <Button
                                                variant="secondary"
                                                fullWidth
                                                disabled={!canCancel}
                                                onClick={() =>
                                                    setCancelling(true)
                                                }
                                            >
                                                Hủy lịch hẹn
                                            </Button>
                                        </Box>
                                    )}

                                    {cancelling && (
                                        <>
                                            <TextArea
                                                label="Lý do hủy (bắt buộc)"
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

                                    {rescheduling && (
                                        <>
                                            <Text.Title
                                                size="small"
                                                className="mb-2"
                                            >
                                                Chọn ngày/giờ hẹn mới
                                            </Text.Title>
                                            <DatePicker
                                                title="Chọn ngày hẹn mới"
                                                placeholder="Chọn ngày hẹn mới (từ ngày mai)"
                                                value={rescheduleDate}
                                                min={rescheduleMinDate}
                                                max={rescheduleMaxDate}
                                                onChange={d =>
                                                    setRescheduleDate(d)
                                                }
                                            />
                                            <Text
                                                size="xxSmall"
                                                className="text-text_2 mt-1.5 mb-2"
                                            >
                                                Chỉ có thể đổi sang ngày từ ngày
                                                mai đến trong vòng 30 ngày tới.
                                            </Text>

                                            {rescheduleDate &&
                                                rescheduleSlotsLoading && (
                                                    <LoadingState />
                                                )}
                                            {rescheduleDate &&
                                                !rescheduleSlotsLoading &&
                                                rescheduleSlotsError && (
                                                    <ErrorState
                                                        label="Không thể tải khung giờ"
                                                        onRetry={() =>
                                                            setRescheduleDate(
                                                                new Date(
                                                                    rescheduleDate,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                )}
                                            {rescheduleDate &&
                                                !rescheduleSlotsLoading &&
                                                !rescheduleSlotsError &&
                                                rescheduleSlots.length ===
                                                    0 && (
                                                    <EmptyState label="Không có khung giờ nào cho ngày này" />
                                                )}
                                            {rescheduleDate &&
                                                !rescheduleSlotsLoading &&
                                                !rescheduleSlotsError &&
                                                rescheduleSlots.map(slot => {
                                                    const selected =
                                                        selectedRescheduleSlotId ===
                                                        slot.slot_id;
                                                    let slotClassName =
                                                        "bg-ng_10 rounded-xl";
                                                    if (!slot.is_available) {
                                                        slotClassName =
                                                            "bg-ng_10 rounded-xl opacity-50";
                                                    } else if (selected) {
                                                        slotClassName =
                                                            "bg-blue_10 rounded-xl";
                                                    }
                                                    return (
                                                        <Box
                                                            key={slot.slot_id}
                                                            flex
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                            p={3}
                                                            mb={2}
                                                            className={
                                                                slotClassName
                                                            }
                                                            onClick={() =>
                                                                slot.is_available &&
                                                                setSelectedRescheduleSlotId(
                                                                    slot.slot_id,
                                                                )
                                                            }
                                                        >
                                                            <Text
                                                                size="small"
                                                                bold
                                                            >
                                                                {
                                                                    slot.start_time
                                                                }{" "}
                                                                -{" "}
                                                                {slot.end_time}
                                                            </Text>
                                                            <Text
                                                                size="xxSmall"
                                                                className="text-text_2"
                                                            >
                                                                {slot.is_available
                                                                    ? `${slot.booked_count}/${slot.max_capacity} đã đặt`
                                                                    : "Hết chỗ"}
                                                            </Text>
                                                        </Box>
                                                    );
                                                })}

                                            <Box mt={2}>
                                                <TextArea
                                                    label="Lý do đổi lịch (bắt buộc)"
                                                    value={rescheduleReason}
                                                    onChange={e =>
                                                        setRescheduleReason(
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={3}
                                                />
                                            </Box>
                                            <Box mt={2} flex style={{ gap: 8 }}>
                                                <Button
                                                    variant="secondary"
                                                    fullWidth
                                                    onClick={closeReschedule}
                                                >
                                                    Đóng
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    loading={
                                                        submittingReschedule
                                                    }
                                                    onClick={handleReschedule}
                                                >
                                                    Xác nhận đổi lịch
                                                </Button>
                                            </Box>
                                        </>
                                    )}

                                    {!canCancel &&
                                        !cancelling &&
                                        !rescheduling && (
                                            <Text
                                                size="xxSmall"
                                                className="text-text_2 mt-2"
                                            >
                                                {appointment.status ===
                                                RESCHEDULABLE_STATUS
                                                    ? "Chỉ có thể hủy hoặc đổi lịch hẹn trước giờ hẹn ít nhất 2 tiếng."
                                                    : "Chỉ có thể hủy trước giờ hẹn ít nhất 2 tiếng."}
                                            </Text>
                                        )}
                                </Box>
                            )}

                        {isOwner && appointment.status === "hoan_thanh" && (
                            <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
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
