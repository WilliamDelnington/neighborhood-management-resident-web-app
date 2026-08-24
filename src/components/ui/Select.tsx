import React, { FC, ReactElement, ReactNode, useState } from "react";
import clsx from "clsx";
import Icon from "./Icon";
import Sheet from "./Sheet";

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

/**
 * Renders as a button that opens a bottom sheet of options instead of a bare
 * native <select> - the native dropdown's option list can't be restyled
 * (ugly, inconsistent across browsers/OS) and some browsers even mis-paint
 * the closed box under system dark mode.
 */
const Select: FC<SelectProps> & { Option: FC<SelectOptionProps> } = ({
    placeholder,
    value,
    onChange,
    className,
    children,
}) => {
    const [open, setOpen] = useState(false);
    const options = React.Children.toArray(
        children,
    ) as ReactElement<SelectOptionProps>[];
    const selected = options.find(option => option.props.value === value);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={clsx(
                    "flex w-full items-center justify-between rounded-xl border border-ng_20 bg-ng_10 px-3 py-3 text-left text-[15px] transition-colors focus:outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100",
                    className,
                )}
            >
                <span className={selected ? "text-text_1" : "text-text_3"}>
                    {selected ? selected.props.title : placeholder}
                </span>
                <Icon
                    icon="zi-chevron-down"
                    size={18}
                    className="text-text_2 flex-shrink-0"
                />
            </button>

            <Sheet
                visible={open}
                onClose={() => setOpen(false)}
                title={placeholder}
                autoHeight
            >
                <div className="flex flex-col gap-2">
                    {options.map(option => {
                        const isActive = option.props.value === value;
                        return (
                            <button
                                type="button"
                                key={option.props.value}
                                onClick={() => {
                                    onChange?.(option.props.value);
                                    setOpen(false);
                                }}
                                className={clsx(
                                    "flex items-center justify-between rounded-xl px-4 py-3.5 text-left text-[15px] transition-colors",
                                    isActive
                                        ? "bg-primary-50 font-semibold text-primary-700"
                                        : "bg-ng_10 text-text_1",
                                )}
                            >
                                {option.props.title}
                                {isActive && (
                                    <Icon
                                        icon="zi-check-circle-solid"
                                        size={18}
                                        className="text-primary-600"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </Sheet>
        </>
    );
};
Select.Option = Option;

export default Select;
