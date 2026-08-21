import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import clsx from "clsx";
import Spinner from "./Spinner";

const VARIANT_CLASS: Record<string, string> = {
    primary: "bg-main text-white disabled:bg-ng_20 disabled:text-text_3",
    secondary:
        "bg-blue_10 text-main border border-primary-100 hover:bg-primary-100 disabled:bg-ng_20 disabled:text-text_3 disabled:border-transparent",
    tertiary: "bg-transparent text-main disabled:text-text_3",
};

const SIZE_CLASS: Record<string, string> = {
    small: "h-9 px-3 text-[14px]",
    medium: "h-11 px-4 text-[15px]",
    large: "h-12 px-5 text-[16px]",
};

const ICON_ONLY_WIDTH_CLASS: Record<string, string> = {
    small: "w-9",
    medium: "w-11",
    large: "w-12",
};

export interface ButtonProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
    variant?: keyof typeof VARIANT_CLASS;
    size?: keyof typeof SIZE_CLASS;
    fullWidth?: boolean;
    loading?: boolean;
    icon?: ReactNode;
    htmlType?: "button" | "submit" | "reset";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const {
        variant = "primary",
        size = "medium",
        fullWidth,
        loading,
        icon,
        disabled,
        className,
        children,
        htmlType = "button",
        ...rest
    } = props;

    const iconOnly = !children && Boolean(icon);

    return (
        <button
            {...rest}
            ref={ref}
            // eslint-disable-next-line react/button-has-type -- htmlType is a constrained union defaulting to "button", not free input
            type={htmlType}
            disabled={disabled || loading}
            className={clsx(
                "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
                VARIANT_CLASS[variant],
                SIZE_CLASS[size],
                fullWidth && "w-full",
                iconOnly && "px-0",
                iconOnly && ICON_ONLY_WIDTH_CLASS[size],
                className,
            )}
        >
            {loading ? (
                <Spinner className="h-4 w-4 border-white/40 border-t-white" />
            ) : (
                icon
            )}
            {children}
        </button>
    );
});
Button.displayName = "Button";

export default Button;
