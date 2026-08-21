import React, { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { Box, Icon, Text, useNavigate } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { EmptyState, ErrorState, LoadingState } from "@components/admin";
import { fetchAppointmentServices } from "@service/appointmentApi";
import { AppointmentService } from "@dts";

/**
 * SCR-CIT-01 - danh sach dich vu co the dat lich hen (voi Phuong hoac To dan
 * pho), bam vao mot dich vu se sang trang dat lich (xem AppointmentBookingPage.tsx).
 * Truyen ca doi tuong service qua location.state de trang dat lich khong phai
 * goi lai API danh sach - mirror IncidentShortcutPage truyen presetCategory
 * cho ComplaintCreatePage.
 */
const AppointmentServiceListPage: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<AppointmentService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchAppointmentServices(true)
            .then(setItems)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    return (
        <PageLayout
            id="appointment-service-list-page"
            title="Đặt lịch hẹn"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                <Box
                    flex
                    justifyContent="flex-end"
                    alignItems="center"
                    mb={2}
                    onClick={() =>
                        navigate("/appointments/mine", { animate: true })
                    }
                >
                    <Text size="xSmall" className="text-main">
                        Lịch hẹn của tôi
                    </Text>
                    <Icon
                        icon="zi-chevron-right"
                        size={16}
                        className="text-main"
                    />
                </Box>

                {loading && <LoadingState />}
                {!loading && error && <ErrorState onRetry={load} />}
                {!loading && !error && items.length === 0 && (
                    <EmptyState
                        label="Hiện chưa có dịch vụ đặt lịch hẹn nào"
                        icon={CalendarClock}
                        tone="primary"
                    />
                )}
                {!loading &&
                    !error &&
                    items.map(service => (
                        <Box
                            key={service._id}
                            className="bg-white rounded-2xl p-4 shadow-card mt-3"
                            onClick={() =>
                                navigate(`/appointments/book/${service._id}`, {
                                    animate: true,
                                    state: { service },
                                })
                            }
                        >
                            <Box
                                flex
                                justifyContent="space-between"
                                alignItems="flex-start"
                            >
                                <Box style={{ flex: 1, minWidth: 0 }}>
                                    <Text.Title size="small">
                                        {service.name}
                                    </Text.Title>
                                    {service.description && (
                                        <Text
                                            size="xSmall"
                                            className="text-text_2 mt-1"
                                        >
                                            {service.description}
                                        </Text>
                                    )}
                                </Box>
                                <Icon
                                    icon="zi-chevron-right"
                                    className="text-text_3"
                                />
                            </Box>
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
                    ))}
            </Box>
        </PageLayout>
    );
};

export default AppointmentServiceListPage;
