import React, { PropsWithChildren, ReactElement, useEffect } from "react";
import { Box, Page, Spinner, useLocation, useNavigate } from "@components/ui";
import DefaultHeader from "@components/layout/DefaultHeader";
import { useStore } from "@store";

/**
 * Bao boc mot man hinh yeu cau dang nhap: neu dang co token thi hien children
 * ngay; neu chua co token va khong co luot dang nhap nao dang chay (vd nguoi
 * dung vua bam dang nhap tu man khac) thi dieu huong thang ve /login.
 *
 * Luu y: import DefaultHeader truc tiep (khong qua barrel @components/layout) de tranh vong lap
 * import - AppBottomNav (trong @components/layout) lai import hasAdminAccess tu chinh module nay.
 */
const RequireAuth: React.FC<PropsWithChildren> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [token, bootstrapping] = useStore(state => [
        state.token,
        state.bootstrapping,
    ]);

    useEffect(() => {
        if (!token && !bootstrapping) {
            // Dung replace de khong luu lai man hinh yeu cau dang nhap (dang bi chan) trong
            // history - neu khong, nut back/close se quay lai chinh man hinh nay va bi
            // dieu huong lap lai ve /login, tao cam giac "nut dong khong hoat dong".
            // Luu lai duong dan dinh vao ban dau de LoginPage dieu huong tro lai sau khi
            // dang nhap thanh cong, thay vi luon ve trang chu.
            navigate("/login", {
                animate: true,
                replace: true,
                state: { from: `${location.pathname}${location.search}` },
            });
        }
    }, [token, bootstrapping]);

    if (!token) {
        return (
            <Page id="require-auth-loading">
                <DefaultHeader
                    title="Đang đăng nhập"
                    back
                    onBackClick={() =>
                        navigate("/", { animate: true, replace: true })
                    }
                />
                <Box
                    flex
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    style={{ height: "80vh" }}
                >
                    <Spinner visible />
                    <Box mt={2} className="text-text_2 text-sm">
                        Đang đăng nhập...
                    </Box>
                </Box>
            </Page>
        );
    }

    return children as ReactElement;
};

export default RequireAuth;
