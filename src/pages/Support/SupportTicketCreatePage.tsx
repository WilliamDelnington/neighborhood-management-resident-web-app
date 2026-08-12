import React, { useState } from "react";
import { Box, Icon, Text, useNavigate, useSnackbar } from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button, Input, TextArea } from "@components/customized";
import { RequireAuth, hasPermission } from "@components/role";
import { createSupportTicket } from "@service/supportTicketApi";
import { LoaiYeuCauHoTro, SupportTicket } from "@dts";
import { useStore } from "@store";

interface SupportTicketCreatePageProps {
    type: LoaiYeuCauHoTro;
}

const PAGE_COPY: Record<
    LoaiYeuCauHoTro,
    {
        pageTitle: string;
        titleLabel: string;
        titlePlaceholder: string;
        contentLabel: string;
        contentPlaceholder: string;
        submitLabel: string;
        successTitle: string;
    }
> = {
    bao_loi: {
        pageTitle: "Báo lỗi",
        titleLabel: "Tiêu đề lỗi",
        titlePlaceholder: "VD: Không mở được trang khảo sát",
        contentLabel: "Mô tả lỗi",
        contentPlaceholder:
            "Mô tả chi tiết lỗi bạn gặp phải: bạn đang làm gì, điều gì xảy ra, màn hình nào...",
        submitLabel: "Gửi báo cáo lỗi",
        successTitle: "Gửi báo cáo lỗi thành công",
    },
    gop_y: {
        pageTitle: "Góp ý",
        titleLabel: "Tiêu đề góp ý",
        titlePlaceholder: "VD: Nên thêm tìm kiếm cho mục thông báo",
        contentLabel: "Nội dung góp ý",
        contentPlaceholder: "Chia sẻ góp ý của bạn để giúp ứng dụng tốt hơn...",
        submitLabel: "Gửi góp ý",
        successTitle: "Gửi góp ý thành công",
    },
    ho_tro_ho_dan: {
        pageTitle: "Hỗ trợ hộ dân",
        titleLabel: "Tiêu đề yêu cầu",
        titlePlaceholder: "VD: Cần hỗ trợ làm hồ sơ tạm trú",
        contentLabel: "Nội dung cần hỗ trợ",
        contentPlaceholder:
            "Mô tả vấn đề cần Tổ dân phố/Phường hỗ trợ giúp gia đình bạn...",
        submitLabel: "Gửi yêu cầu hỗ trợ",
        successTitle: "Gửi yêu cầu hỗ trợ thành công",
    },
};

const SupportTicketCreatePage: React.FC<SupportTicketCreatePageProps> = ({
    type,
}) => (
    <RequireAuth>
        <SupportTicketCreatePageContent type={type} />
    </RequireAuth>
);

const SupportTicketCreatePageContent: React.FC<
    SupportTicketCreatePageProps
> = ({ type }) => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canCreate = hasPermission(user, "support_tickets.create");
    const copy = PAGE_COPY[type];

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [created, setCreated] = useState<SupportTicket | null>(null);

    if (!canCreate) {
        return (
            <PageLayout
                id="support-ticket-create-denied"
                title={copy.pageTitle}
            >
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
                        Tài khoản của bạn không có quyền gửi yêu cầu hỗ trợ.
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

    const handleSubmit = async () => {
        if (!title.trim()) {
            openSnackbar({
                type: "error",
                text: `Vui lòng nhập ${copy.titleLabel.toLowerCase()}`,
            });
            return;
        }
        if (!content.trim()) {
            openSnackbar({
                type: "error",
                text: `Vui lòng nhập ${copy.contentLabel.toLowerCase()}`,
            });
            return;
        }

        try {
            setSubmitting(true);
            const ticket = await createSupportTicket({
                type,
                title: title.trim(),
                content: content.trim(),
            });
            setCreated(ticket);
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
            <PageLayout
                id="support-ticket-create-success"
                title={copy.pageTitle}
            >
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
                        {copy.successTitle}
                    </Text.Title>
                    <Text
                        size="xSmall"
                        className="text-text_2 mt-2 text-center"
                    >
                        Mã yêu cầu của bạn
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
                                navigate(`/support/tickets/${created._id}`, {
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
        <PageLayout id="support-ticket-create-page" title={copy.pageTitle}>
            <Box p={4}>
                <Input
                    label={copy.titleLabel}
                    placeholder={copy.titlePlaceholder}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                <Box mt={3}>
                    <TextArea
                        label={copy.contentLabel}
                        placeholder={copy.contentPlaceholder}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={5}
                    />
                </Box>

                <Box mt={6}>
                    <Button
                        fullWidth
                        loading={submitting}
                        onClick={handleSubmit}
                    >
                        {copy.submitLabel}
                    </Button>
                </Box>
            </Box>
        </PageLayout>
    );
};

export default SupportTicketCreatePage;
