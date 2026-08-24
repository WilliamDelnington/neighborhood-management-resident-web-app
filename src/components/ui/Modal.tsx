import React, { FC, ReactNode } from "react";
import clsx from "clsx";

export interface ModalAction {
    text: string;
    close?: boolean;
    danger?: boolean;
    disabled?: boolean;
    onClick?: () => void;
}

export interface ModalProps {
    visible: boolean;
    title?: ReactNode;
    description?: ReactNode;
    onClose: () => void;
    actions?: ModalAction[];
    children?: ReactNode;
}

const Modal: FC<ModalProps> = ({
    visible,
    title,
    description,
    onClose,
    actions,
    children,
}) => {
    if (!visible) return null;

    const handleAction = (action: ModalAction) => {
        if (action.disabled) return;
        action.onClick?.();
        if (action.close) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- backdrop dismiss, dialog itself is reachable/closable via the action buttons */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 mx-6 w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
                {title && (
                    <div className="text-center text-[16px] font-medium text-text_1">
                        {title}
                    </div>
                )}
                {description && (
                    <div className="mt-2 text-center text-[14px] text-text_2">
                        {description}
                    </div>
                )}
                {children}
                {actions && actions.length > 0 && (
                    <div className="mt-4 flex flex-row justify-end gap-2">
                        {actions.map(action => (
                            <button
                                key={action.text}
                                type="button"
                                disabled={action.disabled}
                                onClick={() => handleAction(action)}
                                className={clsx(
                                    "rounded-xl px-4 py-2 text-[14px] font-medium disabled:opacity-50",
                                    action.danger
                                        ? "text-red-600"
                                        : "text-main",
                                )}
                            >
                                {action.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
