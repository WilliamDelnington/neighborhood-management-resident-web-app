import React from "react";
import { Box, Button, Icon, Text } from "@components/ui";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
}

const reload = (): void => {
    window.location.href = "/";
};

// Bat moi loi render khong duoc xu ly (vd component doc `user`/`token` ngay
// sau khi request.ts tu dang xuat do phien het han, truoc khi RequireAuth
// kip dieu huong ve /login) va hien mot man hinh loi than thien thay vi de
// React unmount toan bo cay - man hinh trang xoa (blank white page) ma
// nguoi dung da gap phai.
class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: unknown): void {
        // eslint-disable-next-line no-console
        console.error("Loi khong xu ly duoc trong giao dien:", error);
    }

    render() {
        const { hasError } = this.state;
        const { children } = this.props;

        if (hasError) {
            return (
                <Box
                    flex
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    p={6}
                    style={{ minHeight: "100vh" }}
                >
                    <Icon
                        icon="zi-warning-solid"
                        className="text-text_2"
                        size={56}
                    />
                    <Text.Title size="normal" className="mt-4 text-center">
                        Đã xảy ra lỗi
                    </Text.Title>
                    <Text
                        size="xSmall"
                        className="text-text_2 mt-2 text-center"
                    >
                        Ứng dụng gặp sự cố khi hiển thị trang này. Có thể phiên
                        đăng nhập của bạn đã hết hạn - vui lòng tải lại và đăng
                        nhập lại nếu cần.
                    </Text>
                    <Box mt={6} style={{ width: "100%", maxWidth: 320 }}>
                        <Button fullWidth onClick={reload}>
                            Tải lại trang
                        </Button>
                    </Box>
                </Box>
            );
        }

        return children;
    }
}

export default ErrorBoundary;
