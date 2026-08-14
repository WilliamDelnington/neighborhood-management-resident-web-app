import React, { FC } from "react";

// zmp-ui's DatePicker is a native mobile wheel-picker (day/month/year
// columns) opened in a sheet - replaced here with a plain browser
// <input type="date">, which is the standard web equivalent and needs no
// extra picker UI of its own. "title" (zmp-ui's sheet header text) is
// repurposed as the input's accessible name/tooltip.
export interface DatePickerProps {
    label?: string;
    title?: string;
    value?: Date;
    onChange: (date: Date) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    // Gioi han ngay co the chon (vd BR-01 dat lich hen: chi tu ngay mai den
    // 30 ngay toi) - trinh duyet tu vo hieu hoa ngay ngoai khoang nay tren
    // wheel-picker native cua input[type=date].
    min?: Date;
    max?: Date;
}

const toInputValue = (date?: Date): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const fromInputValue = (value: string): Date | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
};

const DatePicker: FC<DatePickerProps> = ({
    label,
    title,
    value,
    onChange,
    placeholder,
    disabled,
    className,
    min,
    max,
}) => (
    <div>
        {label && (
            <div className="mb-1.5 text-[15px] font-medium text-text_1">
                {label}
            </div>
        )}
        <input
            type="date"
            title={title}
            aria-label={title || label}
            value={toInputValue(value)}
            placeholder={placeholder}
            disabled={disabled}
            min={toInputValue(min)}
            max={toInputValue(max)}
            onChange={e => {
                const date = fromInputValue(e.target.value);
                if (date) onChange(date);
            }}
            className={
                className ||
                "w-full rounded-xl border border-transparent bg-ng_10 px-3 py-3 text-[15px] text-text_1 focus:border-transparent focus:outline-none"
            }
        />
    </div>
);

export default DatePicker;
