import React, { FC, ReactNode, useId } from "react";
import clsx from "clsx";

export interface RadioProps {
    label?: ReactNode;
    value?: string;
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    className?: string;
}

const Radio: FC<RadioProps> = ({
    label,
    value,
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
                "flex items-center gap-2",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                className,
            )}
        >
            <input
                id={id}
                type="radio"
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="peer absolute h-0 w-0 opacity-0"
            />
            <span
                className={clsx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    checked ? "border-main" : "border-text_3",
                )}
            >
                {checked && (
                    <span className="h-2.5 w-2.5 rounded-full bg-main" />
                )}
            </span>
            {label && <span className="text-[15px] text-text_1">{label}</span>}
        </label>
    );
};

export default Radio;
