import React, { FC, ReactNode } from "react";
import clsx from "clsx";

export interface SheetProps {
    visible: boolean;
    onClose: () => void;
    title?: ReactNode;
    height?: string;
    autoHeight?: boolean;
    mask?: boolean;
    className?: string;
    children?: ReactNode;
}

const Sheet: FC<SheetProps> = ({
    visible,
    onClose,
    title,
    height,
    autoHeight,
    mask = true,
    className,
    children,
}) => (
    <div
        className={clsx(
            "fixed inset-0 z-50 transition-opacity duration-300",
            visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!visible}
    >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- backdrop dismiss, sheet content itself is reachable/closable via its own controls */}
        <div
            className={clsx("absolute inset-0", mask && "bg-black/50")}
            onClick={onClose}
        />
        <div
            className={clsx(
                "absolute bottom-0 left-0 flex w-full flex-col rounded-t-2xl bg-white shadow-lg transition-transform duration-300",
                visible ? "translate-y-0" : "translate-y-full",
                className,
            )}
            style={{
                height: autoHeight ? "auto" : height,
                minHeight: autoHeight || height ? undefined : "50%",
                maxHeight: "100vh",
            }}
        >
            <div className="flex shrink-0 justify-center py-2">
                <div className="h-1.5 w-12 rounded-full bg-ng_20" />
            </div>
            {title && (
                <div className="shrink-0 px-4 pb-2 text-center text-[20px] font-medium leading-[26px] text-text_1">
                    {title}
                </div>
            )}
            <div className="overflow-y-auto p-6">{children}</div>
        </div>
    </div>
);

export default Sheet;
