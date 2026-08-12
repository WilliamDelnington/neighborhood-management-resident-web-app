import React, { FC, ReactElement, ReactNode } from "react";
import clsx from "clsx";

export interface SelectOptionProps {
    value: string;
    title: string;
}

const Option: FC<SelectOptionProps> = () => null;
Option.displayName = "Select.Option";

export interface SelectProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    closeOnSelect?: boolean;
    className?: string;
    children: ReactNode;
}

const Select: FC<SelectProps> & { Option: FC<SelectOptionProps> } = ({
    placeholder,
    value,
    onChange,
    className,
    children,
}) => {
    const options = React.Children.toArray(
        children,
    ) as ReactElement<SelectOptionProps>[];

    return (
        <select
            value={value ?? ""}
            onChange={e => onChange?.(e.target.value)}
            className={clsx(
                "w-full rounded-xl border border-transparent bg-ng_10 px-3 py-3 text-[15px] text-text_1",
                !value && "text-text_3",
                className,
            )}
        >
            {placeholder && (
                <option value="" disabled>
                    {placeholder}
                </option>
            )}
            {options.map(option => (
                <option key={option.props.value} value={option.props.value}>
                    {option.props.title}
                </option>
            ))}
        </select>
    );
};
Select.Option = Option;

export default Select;
