import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, useNavigate } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { Button } from "@components/customized";
import {
    EmptyState,
    ErrorState,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { RequireAuth } from "@components/role";
import { fetchMyAppointments } from "@service/appointmentApi";
import {
    APPOINTMENT_STATUS_LABEL,
    APPOINTMENT_STATUS_TONE,
} from "@constants/domain";
import { formatDate } from "@utils/date-time";
import { Appointment, AppointmentStatus } from "@dts";

const PAGE_SIZE = 50;

type TabKey = "upcoming" | "history" | "cancelled";

const TABS: { key: TabKey; label: string }[] = [
    { key: "upcoming", label: "Sắp tới" },
    { key: "history", label: "Lịch sử" },
    { key: "cancelled", label: "Đã hủy" },
];

const UPCOMING_STATUSES: AppointmentStatus[] = [
    "cho_xac_nhan",
    "da_xac_nhan",
    "da_check_in",
];
const HISTORY_STATUSES: AppointmentStatus[] = ["hoan_thanh", "vang_mat"];
const CANCELLED_STATUSES: AppointmentStatus[] = ["da_huy", "tu_choi"];

const isTodayOrFuture = (dateStr: string): boolean => {
    const apptDate = new Date(dateStr);
    apptDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return apptDate.getTime() >= today.getTime();
};

const serviceLabel = (serviceId: Appointment["serviceId"]): string =>
    typeof serviceId === "string" ? serviceId : serviceId.name;

const MyAppointmentsPage: React.FC = () => (
    <RequireAuth>
        <MyAppointmentsPageContent />
    </RequireAuth>
);

/**
 * SCR-CIT-04 - lich hen cua chinh nguoi dang dang nhap, ke ca lich do ho dat
 * thay (proxy booking). Khong loc theo status tren server (API chi nhan mot
 * status) - tai toan bo mot lan roi chia 3 nhom o client, mirror cach
 * MyRequestsPage.tsx trinh bay the danh sach.
 */
const MyAppointmentsPageContent: React.FC = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState<TabKey>("upcoming");
    const [items, setItems] = useState<Appointment[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const load = (targetPage: number, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(false);
        fetchMyAppointments({ page: targetPage, limit: PAGE_SIZE })
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

    const filteredItems = useMemo(() => {
        if (tab === "upcoming") {
            return items.filter(
                item =>
                    UPCOMING_STATUSES.includes(item.status) &&
                    isTodayOrFuture(item.appointedDate),
            );
        }
        if (tab === "history") {
            return items.filter(item => HISTORY_STATUSES.includes(item.status));
        }
        return items.filter(item => CANCELLED_STATUSES.includes(item.status));
    }, [items, tab]);

    return (
        <PageLayout
            id="my-appointments-page"
            title="Lịch hẹn của tôi"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4} pb={0} flex style={{ gap: 8 }}>
                {TABS.map(t => (
                    <Box
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={
                            tab === t.key
                                ? "bg-main text-white"
                                : "bg-white text-text_2"
                        }
                        style={{
                            padding: "6px 16px",
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        {t.label}
                    </Box>
                ))}
            </Box>

            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && error && (
                    <ErrorState onRetry={() => load(1, false)} />
                )}
                {!loading && !error && filteredItems.length === 0 && (
                    <EmptyState label="Không có lịch hẹn nào" />
                )}
                {!loading &&
                    !error &&
                    filteredItems.map(item => (
                        <Box
                            key={item._id}
                            className="bg-white rounded-2xl p-4 shadow-card mt-3"
                            onClick={() =>
                                navigate(`/appointments/${item._id}`, {
                                    animate: true,
                                })
                            }
                        >
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="flex-start"
                            >
                                <Box style={{ flex: 1, minWidth: 0 }}>
                                    <Text size="small" className="font-medium">
                                        {serviceLabel(item.serviceId)}
                                    </Text>
                                    <Text
                                        size="xxSmall"
                                        className="text-text_2 mt-1"
                                    >
                                        Mã: {item.code}
                                    </Text>
                                </Box>
                                <StatusBadge
                                    label={
                                        APPOINTMENT_STATUS_LABEL[item.status]
                                    }
                                    tone={APPOINTMENT_STATUS_TONE[item.status]}
                                />
                            </Box>
                            <Text size="xSmall" className="text-text_2 mt-2">
                                {formatDate(new Date(item.appointedDate))}
                                {" · "}
                                {item.startTime} - {item.endTime}
                            </Text>
                            {item.proxyName && (
                                <Text
                                    size="xxSmall"
                                    className="text-text_2 mt-1"
                                >
                                    Đặt hộ: {item.proxyName}
                                </Text>
                            )}
                        </Box>
                    ))}
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

export default MyAppointmentsPage;
