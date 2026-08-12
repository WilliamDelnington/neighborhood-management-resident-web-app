import React, { FC, useId } from "react";
import clsx from "clsx";

export interface SwitchProps {
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    className?: string;
}

const Switch: FC<SwitchProps> = ({
    checked,
    onChange,
    disabled,
    className,
}) => {
    const id = useId();
    return (
        <label
            htmlFor={id}
            className={clsx(
                "relative inline-block h-6 w-10 shrink-0 cursor-pointer",
                disabled && "cursor-not-allowed opacity-50",
                className,
            )}
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="peer absolute h-0 w-0 opacity-0"
            />
            <span
                className={clsx(
                    "absolute inset-0 rounded-full transition-colors",
                    checked ? "bg-main" : "bg-text_3",
                )}
            />
            <span
                className={clsx(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    checked ? "translate-x-[18px]" : "translate-x-0.5",
                )}
            />
        </label>
    );
};

export default Switch;
