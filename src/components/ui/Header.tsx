import React, { forwardRef, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import Icon from "./Icon";

export interface HeaderProps {
    title?: ReactNode;
    showBackIcon?: boolean;
    backIcon?: ReactNode;
    onBackClick?: (event: React.SyntheticEvent) => void;
    className?: string;
    style?: React.CSSProperties;
    id?: string;
}

const Header = forwardRef<HTMLDivElement, HeaderProps>((props, ref) => {
    const {
        title,
        showBackIcon = true,
        backIcon,
        onBackClick,
        className,
        style,
        id,
    } = props;
    const navigate = useNavigate();

    const handleBackClick = (event: React.SyntheticEvent) => {
        if (onBackClick) {
            onBackClick(event);
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        navigate(-1);
    };

    return (
        <div
            ref={ref}
            id={id}
            style={style}
            className={clsx("relative flex h-12 items-center", className)}
        >
            {showBackIcon && (
                <button
                    type="button"
                    onClick={handleBackClick}
                    className="flex h-8 w-8 items-center justify-center"
                    aria-label="Quay lại"
                >
                    {backIcon || <Icon icon="zi-chevron-left" />}
                </button>
            )}
            {title && (
                <div className="flex-1 truncate text-center text-[16px] font-medium">
                    {title}
                </div>
            )}
        </div>
    );
});
Header.displayName = "Header";

export default Header;
