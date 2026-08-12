import React, {
    InputHTMLAttributes,
    ReactNode,
    TextareaHTMLAttributes,
    forwardRef,
} from "react";
import clsx from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: ReactNode;
}

const inputClass =
    "w-full rounded-xl border border-transparent bg-ng_10 px-3 py-3 text-[15px] text-text_1 placeholder:text-text_3 focus:border-transparent focus:outline-none focus-visible:border-transparent";

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { label, className, ...rest } = props;
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
                className={clsx(inputClass, className)}
            />
        </div>
    );
});
Input.displayName = "Input";

export interface TextAreaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: ReactNode;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (props, ref) => {
        const { label, className, rows = 3, ...rest } = props;
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
                    className={clsx(inputClass, "resize-none", className)}
                />
            </div>
        );
    },
);
TextArea.displayName = "TextArea";

export default Input;
