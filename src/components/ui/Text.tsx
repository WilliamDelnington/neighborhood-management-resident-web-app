import React, { FC, HTMLAttributes } from "react";
import clsx from "clsx";

// Matches zmp-ui's Text size scale (font-size/line-height), applied via a
// block-level span so margin/padding utility classes on Text behave as
// expected (matches the original .zaui-text{display:block} behavior).
const SIZE_CLASS: Record<string, string> = {
    xxSmall: "text-[12px] leading-[16px]",
    xSmall: "text-[13px] leading-[18px]",
    small: "text-[14px] leading-[18px]",
    normal: "text-[15px] leading-[20px]",
    medium: "text-[16px] leading-[22px]",
    large: "text-[18px] leading-[24px]",
};

const TITLE_SIZE_CLASS: Record<string, string> = {
    small: "text-[15px] leading-[20px]",
    normal: "text-[18px] leading-[24px]",
    large: "text-[20px] leading-[26px]",
    xLarge: "text-[22px] leading-[26px]",
};

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
    size?: keyof typeof SIZE_CLASS;
    bold?: boolean;
}

const Text: FC<TextProps> & { Title: FC<TextProps> } = ({
    size = "normal",
    bold,
    className,
    ...rest
}) => (
    <span
        {...rest}
        className={clsx(
            "block font-normal",
            SIZE_CLASS[size],
            bold && "font-medium",
            className,
        )}
    />
);

const Title: FC<TextProps> = ({ size = "normal", className, ...rest }) => (
    <span
        {...rest}
        className={clsx(
            "block font-medium",
            TITLE_SIZE_CLASS[size] || TITLE_SIZE_CLASS.normal,
            className,
        )}
    />
);
Title.displayName = "Text.Title";

Text.Title = Title;

export default Text;
