import React, {
    InputHTMLAttributes,
    ReactNode,
    TextareaHTMLAttributes,
    forwardRef,
} from "react";
import clsx from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: ReactNode;
    /** Optional inline validation message; also switches the field to its error styling. */
    error?: ReactNode;
}

const inputClass =
    "w-full rounded-xl border border-ng_20 bg-ng_10 px-3 py-3 text-[15px] text-text_1 placeholder:text-text_3 transition-colors focus:outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100";

const errorInputClass =
    "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100";

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { label, className, error, ...rest } = props;
    return (
        <div>
            {label && (
                <div className="mb-1.5 text-[15px] font-medium text-text_1">
                    {label}
                </div>
            )}
            <input
                ref={ref}
                {...rest}
                className={clsx(
                    inputClass,
                    error && errorInputClass,
                    className,
                )}
            />
            {typeof error !== "boolean" && error && (
                <div className="mt-1 text-[12px] font-medium text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
});
Input.displayName = "Input";

export interface TextAreaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: ReactNode;
    /** Optional inline validation message; also switches the field to its error styling. */
    error?: ReactNode;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (props, ref) => {
        const { label, className, error, rows = 3, ...rest } = props;
        return (
            <div>
                {label && (
                    <div className="mb-1.5 text-[15px] font-medium text-text_1">
                        {label}
                    </div>
                )}
                <textarea
                    ref={ref}
                    rows={rows}
                    {...rest}
                    className={clsx(
                        inputClass,
                        "resize-none",
                        error && errorInputClass,
                        className,
                    )}
                />
                {typeof error !== "boolean" && error && (
                    <div className="mt-1 text-[12px] font-medium text-red-500">
                        {error}
                    </div>
                )}
            </div>
        );
    },
);
TextArea.displayName = "TextArea";

export default Input;
