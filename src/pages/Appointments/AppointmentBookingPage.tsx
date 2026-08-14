import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    DatePicker,
    Icon,
    Switch,
    Text,
    useLocation,
    useNavigate,
    useParams,
    useSnackbar,
} from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button, Input, TextArea } from "@components/customized";
import { EmptyState, ErrorState, LoadingState } from "@components/admin";
import { RequireAuth, hasPermission } from "@components/role";
import { HouseTargetPickerSheet } from "@components/house";
import {
    AppointmentAvailableSlot,
    createAppointment,
    createAppointmentDraftId,
    deleteAppointmentAttachment,
    fetchAppointmentServices,
    fetchAvailableSlots,
} from "@service/appointmentApi";
import { pickAndUploadAttachment, PickedUpload } from "@service/uploadApi";
import { fetchMyHouses } from "@service/myHouseApi";
import { formatDate } from "@utils/date-time";
import {
    Appointment,
    AppointmentService,
    HouseLookupItem,
    MyHouseOverviewItem,
} from "@dts";
import { useStore } from "@store";

/**
 * pickAndUploadAttachment chi tra ve {url, fileAssetId} (khong co ten file
 * goc) - suy ra ten hien thi tu url theo dung quy uoc dat ten cua
 * saveUploadedFile ben backend, giong ComplaintCreatePage.tsx.
 */
const extractFileNameFromUrl = (url: string): string => {
    const lastSegment = decodeURIComponent(url).split("/").pop() || "";
    const dashIndex = lastSegment.indexOf("-");
    return dashIndex >= 0 ? lastSegment.slice(dashIndex + 1) : lastSegment;
};

// BR-01: chi duoc dat lich tu ngay mai (T+1) den toi da 30 ngay toi (T+30).
const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() + days);
    return result;
};

const AppointmentBookingPage: React.FC = () => (
    <RequireAuth>
        <AppointmentBookingPageContent />
    </RequireAuth>
);

const AppointmentBookingPageContent: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { serviceId } = useParams<{ serviceId: string }>();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canCreate = hasPermission(user, "appointments.create");
    // To truong/To pho co the dat lich thay cho cu dan khong co tai khoan
    // (BR proxy booking) - xem noble-foraging-teacup.md muc 2 & 5.
    const isProxyEligible =
        !!user?.roles?.includes("neighborhood_leader") ||
        !!user?.roles?.includes("neighborhood_coleader");

    const minDate = useMemo(() => addDays(new Date(), 1), []);
    const maxDate = useMemo(() => addDays(new Date(), 30), []);

    const preloadedService = (
        location.state as { service?: AppointmentService } | undefined
    )?.service;
    const [service, setService] = useState<AppointmentService | null>(
        preloadedService && preloadedService._id === serviceId
            ? preloadedService
            : null,
    );
    const [serviceLoading, setServiceLoading] = useState(!service);
    const [serviceError, setServiceError] = useState(false);

    const [ownHouses, setOwnHouses] = useState<MyHouseOverviewItem[]>([]);
    const [ownHousesLoading, setOwnHousesLoading] = useState(true);
    const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);

    const [proxyMode, setProxyMode] = useState(false);
    const [proxyName, setProxyName] = useState("");
    const [proxyPhone, setProxyPhone] = useState("");
    const [proxyHouse, setProxyHouse] = useState<HouseLookupItem | null>(null);
    const [proxyHousePickerVisible, setProxyHousePickerVisible] =
        useState(false);

    const [date, setDate] = useState<Date | undefined>();
    const [slots, setSlots] = useState<AppointmentAvailableSlot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

    const [note, setNote] = useState("");
    const [draftId, setDraftId] = useState<string | null>(null);
    const [pendingFiles, setPendingFiles] = useState<PickedUpload[]>([]);
    const [pickingFile, setPickingFile] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [created, setCreated] = useState<Appointment | null>(null);

    useEffect(() => {
        if (service || !serviceId) return;
        setServiceLoading(true);
        setServiceError(false);
        fetchAppointmentServices(true)
            .then(list => {
                const found = list.find(s => s._id === serviceId) || null;
                setService(found);
                if (!found) setServiceError(true);
            })
            .catch(() => setServiceError(true))
            .finally(() => setServiceLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serviceId]);

    const verifiedOwnHouses = ownHouses
        .map(item => item.house)
        .filter(house => house.status === "verified");

    useEffect(() => {
        setOwnHousesLoading(true);
        fetchMyHouses()
            .then(setOwnHouses)
            .catch(() => setOwnHouses([]))
            .finally(() => setOwnHousesLoading(false));
    }, []);

    useEffect(() => {
        if (proxyMode) return;
        if (verifiedOwnHouses.length === 1 && !selectedHouseId) {
            setSelectedHouseId(verifiedOwnHouses[0]._id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proxyMode, ownHouses]);

    useEffect(() => {
        setSelectedSlotId(null);
        if (!service || !date) {
            setSlots([]);
            return;
        }
        setSlotsLoading(true);
        setSlotsError(false);
        fetchAvailableSlots(service._id, formatDate(date, "yyyy-mm-dd"))
            .then(setSlots)
            .catch(() => setSlotsError(true))
            .finally(() => setSlotsLoading(false));
    }, [service, date]);

    if (!canCreate) {
        return (
            <PageLayout id="appointment-booking-denied" title="Đặt lịch hẹn">
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
                        Tài khoản của bạn không có quyền đặt lịch hẹn.
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
                const res = await createAppointmentDraftId();
                currentDraftId = res.draftId;
                setDraftId(res.draftId);
            }
            const picked = await pickAndUploadAttachment(
                "Appointment",
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
            await deleteAppointmentAttachment(draftId, fileAssetId);
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

    const houseId = proxyMode ? proxyHouse?._id : selectedHouseId;

    const handleSubmit = async () => {
        if (!service) return;
        if (!houseId) {
            openSnackbar({
                type: "error",
                text: "Vui lòng chọn nhà số",
            });
            return;
        }
        if (proxyMode && (!proxyName.trim() || !proxyPhone.trim())) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập tên và số điện thoại người được đặt hộ",
            });
            return;
        }
        if (!date) {
            openSnackbar({
                type: "error",
                text: "Vui lòng chọn ngày hẹn",
            });
            return;
        }
        if (!selectedSlotId) {
            openSnackbar({
                type: "error",
                text: "Vui lòng chọn khung giờ",
            });
            return;
        }

        try {
            setSubmitting(true);
            const appointment = await createAppointment({
                serviceId: service._id,
                houseId,
                timeSlotId: selectedSlotId,
                appointedDate: formatDate(date, "yyyy-mm-dd"),
                note: note.trim() || undefined,
                proxyName: proxyMode ? proxyName.trim() : undefined,
                proxyPhone: proxyMode ? proxyPhone.trim() : undefined,
                draftId: draftId || undefined,
            });
            setCreated(appointment);
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
            <PageLayout id="appointment-booking-success" title="Đặt lịch hẹn">
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
                        Đặt lịch hẹn thành công
                    </Text.Title>
                    <Text
                        size="xSmall"
                        className="text-text_2 mt-2 text-center"
                    >
                        Mã đặt lịch của bạn
                    </Text>
                    <Box
                        mt={3}
                        px={6}
                        py={3}
                        className="border-2 border-main rounded-2xl"
                    >
                        <Text.Title size="large" className="text-main">
                            {created.code}
                        </Text.Title>
                    </Box>
                    <Text
                        size="xSmall"
                        className="text-text_2 mt-3 text-center"
                    >
                        Vui lòng lưu lại mã này để nhân viên tra cứu khi bạn đến
                        làm việc.
                    </Text>

                    <Box mt={8} style={{ width: "100%" }}>
                        <Button
                            fullWidth
                            onClick={() =>
                                navigate(`/appointments/${created._id}`, {
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
                                onClick={() =>
                                    navigate("/appointments/mine", {
                                        animate: true,
                                    })
                                }
                            >
                                Lịch hẹn của tôi
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout id="appointment-booking-page" title="Đặt lịch hẹn">
            <Box p={4}>
                {serviceLoading && <LoadingState />}
                {!serviceLoading && serviceError && (
                    <ErrorState
                        label="Không tìm thấy dịch vụ đặt lịch"
                        onRetry={() => navigate(-1)}
                    />
                )}

                {!serviceLoading && !serviceError && service && (
                    <>
                        <Box className="bg-white rounded-2xl p-4 shadow-sm">
                            <Text.Title size="small">{service.name}</Text.Title>
                            {service.description && (
                                <Text
                                    size="xSmall"
                                    className="text-text_2 mt-1"
                                >
                                    {service.description}
                                </Text>
                            )}
                            <Box
                                flex
                                alignItems="center"
                                className="text-text_2 mt-2"
                                style={{ gap: 6 }}
                            >
                                <Icon icon="zi-location" size={16} />
                                <Text size="xSmall" className="text-text_2">
                                    {service.locationAddress}
                                </Text>
                            </Box>
                        </Box>

                        {isProxyEligible && (
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="center"
                                className="bg-white rounded-2xl p-4 shadow-sm mt-3"
                            >
                                <Box style={{ flex: 1, minWidth: 0 }} pr={3}>
                                    <Text.Title size="small">
                                        Đặt hộ cư dân không có tài khoản
                                    </Text.Title>
                                    <Text
                                        size="xxSmall"
                                        className="text-text_2 mt-1"
                                    >
                                        Dùng khi cư dân không có tài khoản/điện
                                        thoại thông minh - bạn nhập tên và số
                                        điện thoại liên hệ thay cho họ.
                                    </Text>
                                </Box>
                                <Switch
                                    checked={proxyMode}
                                    onChange={e =>
                                        setProxyMode(e.target.checked)
                                    }
                                />
                            </Box>
                        )}

                        <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                            <Text.Title size="small" className="mb-2">
                                Nhà số
                            </Text.Title>

                            {proxyMode ? (
                                <>
                                    {proxyHouse ? (
                                        <Box
                                            flex
                                            alignItems="center"
                                            justifyContent="space-between"
                                            p={3}
                                            className="bg-ng_10 rounded-xl"
                                        >
                                            <Box
                                                style={{
                                                    minWidth: 0,
                                                    flex: 1,
                                                }}
                                            >
                                                <Text
                                                    size="small"
                                                    bold
                                                    className="truncate"
                                                >
                                                    {proxyHouse.code}
                                                    {proxyHouse.address
                                                        ? ` — ${proxyHouse.address}`
                                                        : ""}
                                                </Text>
                                            </Box>
                                            <Box
                                                onClick={() =>
                                                    setProxyHouse(null)
                                                }
                                                pl={3}
                                                style={{ flexShrink: 0 }}
                                            >
                                                <Icon
                                                    icon="zi-close"
                                                    className="text-text_3"
                                                />
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            fullWidth
                                            onClick={() =>
                                                setProxyHousePickerVisible(true)
                                            }
                                        >
                                            Chọn nhà số
                                        </Button>
                                    )}

                                    <Box mt={3}>
                                        <Input
                                            label="Tên người được đặt hộ"
                                            placeholder="Họ tên cư dân"
                                            value={proxyName}
                                            onChange={e =>
                                                setProxyName(e.target.value)
                                            }
                                        />
                                    </Box>
                                    <Box mt={3}>
                                        <Input
                                            label="Số điện thoại liên hệ"
                                            placeholder="VD: 0912345678"
                                            value={proxyPhone}
                                            onChange={e =>
                                                setProxyPhone(e.target.value)
                                            }
                                        />
                                    </Box>
                                </>
                            ) : (
                                <>
                                    {ownHousesLoading && <LoadingState />}
                                    {!ownHousesLoading &&
                                        verifiedOwnHouses.length === 0 && (
                                            <EmptyState label="Bạn chưa có nhà số nào đã xác thực để đặt lịch hẹn. Vui lòng liên hệ Tổ dân phố để được hỗ trợ." />
                                        )}
                                    {!ownHousesLoading &&
                                        verifiedOwnHouses.length > 0 &&
                                        verifiedOwnHouses.map(house => (
                                            <Box
                                                key={house._id}
                                                p={3}
                                                mb={2}
                                                className={
                                                    selectedHouseId ===
                                                    house._id
                                                        ? "bg-blue_10 rounded-xl"
                                                        : "bg-ng_10 rounded-xl"
                                                }
                                                onClick={() =>
                                                    setSelectedHouseId(
                                                        house._id,
                                                    )
                                                }
                                            >
                                                <Text size="small" bold>
                                                    {house.code} —{" "}
                                                    {house.address}
                                                </Text>
                                            </Box>
                                        ))}
                                </>
                            )}
                        </Box>

                        <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                            <Text.Title size="small" className="mb-2">
                                Ngày hẹn
                            </Text.Title>
                            <DatePicker
                                title="Chọn ngày hẹn"
                                placeholder="Chọn ngày hẹn (từ ngày mai)"
                                value={date}
                                min={minDate}
                                max={maxDate}
                                onChange={d => setDate(d)}
                            />
                            <Text size="xxSmall" className="text-text_2 mt-1.5">
                                Chỉ có thể đặt lịch từ ngày mai đến trong vòng
                                30 ngày tới.
                            </Text>
                        </Box>

                        <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                            <Text.Title size="small" className="mb-2">
                                Khung giờ
                            </Text.Title>
                            {!date && (
                                <Text size="xSmall" className="text-text_2">
                                    Vui lòng chọn ngày hẹn trước.
                                </Text>
                            )}
                            {date && slotsLoading && <LoadingState />}
                            {date && !slotsLoading && slotsError && (
                                <ErrorState
                                    label="Không thể tải khung giờ"
                                    onRetry={() => setDate(new Date(date))}
                                />
                            )}
                            {date &&
                                !slotsLoading &&
                                !slotsError &&
                                slots.length === 0 && (
                                    <EmptyState label="Không có khung giờ nào cho ngày này" />
                                )}
                            {date &&
                                !slotsLoading &&
                                !slotsError &&
                                slots.map(slot => {
                                    const selected =
                                        selectedSlotId === slot.slot_id;
                                    let slotClassName = "bg-ng_10 rounded-xl";
                                    if (!slot.is_available) {
                                        slotClassName =
                                            "bg-ng_10 rounded-xl opacity-50";
                                    } else if (selected) {
                                        slotClassName = "bg-blue_10 rounded-xl";
                                    }
                                    return (
                                        <Box
                                            key={slot.slot_id}
                                            flex
                                            justifyContent="space-between"
                                            alignItems="center"
                                            p={3}
                                            mb={2}
                                            className={slotClassName}
                                            onClick={() =>
                                                slot.is_available &&
                                                setSelectedSlotId(slot.slot_id)
                                            }
                                        >
                                            <Text size="small" bold>
                                                {slot.start_time} -{" "}
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
                        </Box>

                        <Box mt={3}>
                            <TextArea
                                label="Ghi chú (không bắt buộc)"
                                placeholder="Mô tả ngắn gọn nội dung cần làm việc..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                rows={3}
                            />
                        </Box>

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
                                    onClick={
                                        pickingFile ? undefined : handlePickFile
                                    }
                                >
                                    <Icon icon="zi-plus" />
                                    <Text
                                        size="xSmall"
                                        className="text-main ml-1"
                                    >
                                        {pickingFile
                                            ? "Đang tải lên..."
                                            : "Đính kèm"}
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
                                        <Icon
                                            icon="zi-file"
                                            className="text-text_2"
                                        />
                                        <Text
                                            size="small"
                                            className="ml-2 truncate"
                                        >
                                            {extractFileNameFromUrl(file.url)}
                                        </Text>
                                    </Box>
                                    <Box
                                        onClick={() =>
                                            handleRemovePendingFile(
                                                file.fileAssetId,
                                            )
                                        }
                                        style={{ flexShrink: 0 }}
                                        pl={3}
                                    >
                                        <Icon
                                            icon="zi-close"
                                            className="text-text_3"
                                        />
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
                                Đặt lịch hẹn
                            </Button>
                        </Box>
                    </>
                )}
            </Box>

            <HouseTargetPickerSheet
                visible={proxyHousePickerVisible}
                onClose={() => setProxyHousePickerVisible(false)}
                onSelect={house => setProxyHouse(house)}
            />
        </PageLayout>
    );
};

export default AppointmentBookingPage;
