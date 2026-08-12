import React, { ComponentType } from "react";
import { openWebView } from "@service/zalo";
import { useSnackbar, useNavigate } from "@components/ui";

function WithItemClick<T>(Component: ComponentType<T & object>) {
    return function WithItemClickWrapper(props: T) {
        const navigate = useNavigate();
        const { openSnackbar } = useSnackbar();

        const handleClickUtinity = ({
            inDevelopment,
            path,
            phoneNumber,
            link,
        }: {
            inDevelopment?: boolean;
            path?: string;
            phoneNumber?: string;
            link?: string;
        }) => {
            if (inDevelopment) {
                openSnackbar({
                    text: "Tính năng đang được phát triển",
                    type: "info",
                    duration: 3000,
                    verticalAction: true,
                    action: { text: "Đóng", close: true },
                });
            } else if (path) {
                navigate(path, { animate: true, direction: "forward" });
            } else if (phoneNumber) {
                window.location.href = `tel:${phoneNumber}`;
            } else if (link) {
                openWebView(link);
            }
        };
        return <Component {...props} handleClickUtinity={handleClickUtinity} />;
    };
}

export default WithItemClick;
