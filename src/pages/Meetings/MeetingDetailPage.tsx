import React, { useEffect, useState } from "react";
import { Box, Icon, Text, useParams, useSnackbar } from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button, Input, Radio } from "@components/customized";
import { ErrorState, LoadingState } from "@components/admin";
import { RequireAuth } from "@components/role";
import {
    fetchMeetingAttachments,
    fetchMeetingDetail,
    registerMeeting,
} from "@service/meetingApi";
import { DANG_KY_HOP_LABEL } from "@constants/domain";
import { formatDateTime } from "@utils/date-time";
import { DangKyHop, FileAsset, Meeting } from "@dts";
import { useStore } from "@store";

const MeetingDetailPage: React.FC = () => {
    const { id } = useParams();
    const markMeetingsSeen = useStore(state => state.markMeetingsSeen);
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [attachments, setAttachments] = useState<FileAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setErrorMessage(null);
        fetchMeetingDetail(id)
            .then(setMeeting)
            .catch(err =>
                setErrorMessage(err?.message || "Không thể tải cuộc họp"),
            )
            .finally(() => setLoading(false));

        fetchMeetingAttachments(id)
            .then(setAttachments)
            .catch(() => setAttachments([]));
    };

    useEffect(load, [id]);

    useEffect(() => {
        markMeetingsSeen();
    }, [markMeetingsSeen]);

    return (
        <PageLayout id="meeting-detail-page" title="Chi tiết cuộc họp">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && errorMessage && (
                    <ErrorState label={errorMessage} onRetry={load} />
                )}

                {!loading && !errorMessage && meeting && (
                    <>
                        <Box className="bg-white rounded-2xl p-4 shadow-card">
                            <Text.Title size="small">
                                {meeting.title}
                            </Text.Title>
                            <Box
                                flex
                                alignItems="center"
                                className="text-text_2"
                                mt={2}
                                style={{ gap: 6 }}
                            >
                                <Icon icon="zi-clock-1" size={16} />
                                <Text size="xSmall" className="text-text_2">
                                    {formatDateTime(
                                        new Date(meeting.startTime),
                                    )}
                                </Text>
                            </Box>
                            <Box
                                flex
                                alignItems="center"
                                className="text-text_2"
                                mt={1}
                                style={{ gap: 6 }}
                            >
                                <Icon icon="zi-location" size={16} />
                                <Text size="xSmall" className="text-text_2">
                                    {meeting.location}
                                </Text>
                            </Box>
                            <Text
                                size="small"
                                className="mt-3 whitespace-pre-line"
                            >
                                {meeting.content}
                            </Text>

                            {meeting.minutes && (
                                <Box mt={3}>
                                    <Text
                                        size="xSmall"
                                        className="font-medium mb-1"
                                    >
                                        Biên bản cuộc họp
                                    </Text>
                                    <Text
                                        size="small"
                                        className="whitespace-pre-line text-text_2"
                                    >
                                        {meeting.minutes}
                                    </Text>
                                </Box>
                            )}

                            {attachments.length > 0 && (
                                <Box mt={3}>
                                    <Text
                                        size="xSmall"
                                        className="font-medium mb-1"
                                    >
                                        File đính kèm
                                    </Text>
                                    {attachments.map(a => (
                                        <Box
                                            key={a._id}
                                            flex
                                            alignItems="center"
                                            py={1}
                                            style={{ gap: 6 }}
                                            className="text-main"
                                            onClick={() =>
                                                window.open(a.url, "_blank")
                                            }
                                        >
                                            <Icon icon="zi-file" size={16} />
                                            <Text
                                                size="xSmall"
                                                className="text-main"
                                            >
                                                {a.name}
                                            </Text>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Box mt={3}>
                            <RequireAuth>
                                <MeetingRsvpSection meetingId={meeting._id} />
                            </RequireAuth>
                        </Box>
                    </>
                )}
            </Box>
        </PageLayout>
    );
};

const RSVP_OPTIONS = Object.entries(DANG_KY_HOP_LABEL) as [DangKyHop, string][];

const MeetingRsvpSection: React.FC<{ meetingId: string }> = ({ meetingId }) => {
    const { openSnackbar } = useSnackbar();
    const [answer, setAnswer] = useState<DangKyHop | undefined>();
    const [delegateName, setDelegateName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!answer) {
            openSnackbar({
                type: "error",
                text: "Vui lòng chọn một phương án",
            });
            return;
        }
        if (answer === "uy_quyen" && !delegateName.trim()) {
            openSnackbar({
                type: "error",
                text: "Vui lòng nhập tên người được ủy quyền",
            });
            return;
        }
        try {
            setSubmitting(true);
            await registerMeeting(
                meetingId,
                answer,
                answer === "uy_quyen" ? delegateName.trim() : undefined,
            );
            openSnackbar({
                type: "success",
                text: "Đã ghi nhận đăng ký tham dự",
            });
        } catch (err: any) {
            openSnackbar({
                type: "error",
                text: err?.message || "Có lỗi xảy ra",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box className="bg-white rounded-2xl p-4 shadow-card">
            <Text.Title size="small" className="mb-2">
                Đăng ký tham dự
            </Text.Title>
            {RSVP_OPTIONS.map(([value, label]) => (
                <Box key={value} py={1}>
                    <Radio
                        checked={answer === value}
                        label={label}
                        onChange={() => setAnswer(value)}
                    />
                </Box>
            ))}

            {answer === "uy_quyen" && (
                <Box mt={2}>
                    <Input
                        label="Tên người được ủy quyền"
                        placeholder="Họ tên người tham dự thay"
                        value={delegateName}
                        onChange={e => setDelegateName(e.target.value)}
                    />
                </Box>
            )}

            <Box mt={4}>
                <Button fullWidth loading={submitting} onClick={handleSubmit}>
                    Gửi đăng ký
                </Button>
            </Box>
        </Box>
    );
};

export default MeetingDetailPage;
