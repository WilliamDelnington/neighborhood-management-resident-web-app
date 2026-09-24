import React, { FC, useEffect, useRef, useState } from "react";

// zmp-ui's DatePicker is a native mobile wheel-picker (day/month/year
// columns) opened in a sheet - replaced here with a plain browser
// <input type="date">, which is the standard web equivalent and needs no
// extra picker UI of its own. "title" (zmp-ui's sheet header text) is
// repurposed as the input's accessible name/tooltip.
//
// input[type=date] hien thi theo ngon ngu TRINH DUYET (vd Chrome tieng Anh
// -> mm/dd/yyyy), khong doi duoc bang thuoc tinh/CSS. Vi vay phan hien thi
// la o text dd/mm/yyyy (go truc tiep duoc), con input native duoc an di va
// chi dung de mo lich qua nut ben phai (showPicker).
export interface DatePickerProps {
    label?: string;
    title?: string;
    value?: Date;
    onChange: (date: Date) => void;
    // O text luon hien goi y "dd/mm/yyyy" de nguoi dung biet dinh dang can
    // go - placeholder cu (vd "Chọn ngày sinh") chuyen thanh tooltip.
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    // Gioi han ngay co the chon (vd BR-01 dat lich hen: chi tu ngay mai den
    // 30 ngay toi) - trinh duyet tu vo hieu hoa ngay ngoai khoang nay tren
    // picker native; ngay go tay ngoai khoang cung bi bo qua.
    min?: Date;
    max?: Date;
}

const pad = (n: number) => String(n).padStart(2, "0");

const toInputValue = (date?: Date): string => {
    if (!date) return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
    )}`;
};

const fromInputValue = (value: string): Date | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
};

const toDisplay = (date?: Date): string => {
    if (!date) return "";
    return `${pad(date.getDate())}/${pad(
        date.getMonth() + 1,
    )}/${date.getFullYear()}`;
};

// "24092026" -> "24/09/2026"; dau "/" chi them khi con so phia sau.
const maskDigits = (digits: string): string => {
    const d = digits.slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

// Chi tra ve Date khi da go du 8 so va la ngay co that (vd 31/02 -> null).
const parseDisplay = (text: string): Date | null => {
    const digits = text.replace(/\D/g, "");
    if (digits.length !== 8) return null;
    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4));
    const year = Number(digits.slice(4, 8));
    const date = new Date(year, month - 1, day);
    if (
        year < 1 ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }
    return date;
};

const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

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
}) => {
    const nativeRef = useRef<HTMLInputElement>(null);
    const focusedRef = useRef(false);
    const [text, setText] = useState(() => toDisplay(value));

    // Chi dong bo tu ngoai vao khi o text khong duoc focus, tranh ghi de len
    // chuoi nguoi dung dang go do.
    useEffect(() => {
        if (!focusedRef.current) setText(toDisplay(value));
    }, [value]);

    const inRange = (date: Date) =>
        (!min || startOfDay(date) >= startOfDay(min)) &&
        (!max || startOfDay(date) <= startOfDay(max));

    const openPicker = () => {
        const input = nativeRef.current;
        if (!input || disabled) return;
        try {
            input.showPicker();
        } catch {
            input.focus();
        }
    };

    return (
        <div>
            {label && (
                <div className="mb-1.5 text-[15px] font-medium text-text_1">
                    {label}
                </div>
            )}
            <div className="relative">
                <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    title={title || placeholder}
                    aria-label={title || label || placeholder}
                    value={text}
                    placeholder="dd/mm/yyyy"
                    disabled={disabled}
                    onFocus={() => {
                        focusedRef.current = true;
                    }}
                    onChange={e => {
                        const masked = maskDigits(
                            e.target.value.replace(/\D/g, ""),
                        );
                        setText(masked);
                        const date = parseDisplay(masked);
                        if (date && inRange(date)) onChange(date);
                    }}
                    onBlur={() => {
                        focusedRef.current = false;
                        // Go chua du/khong hop le -> tra lai gia tri dang co.
                        setText(toDisplay(value));
                    }}
                    className={`${
                        className ||
                        "w-full rounded-xl border border-ng_20 bg-white px-3 py-3 text-[15px] text-text_1 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    } pr-11`}
                />
                <input
                    ref={nativeRef}
                    type="date"
                    tabIndex={-1}
                    aria-hidden="true"
                    value={toInputValue(value)}
                    disabled={disabled}
                    min={toInputValue(min)}
                    max={toInputValue(max)}
                    onChange={e => {
                        const date = fromInputValue(e.target.value);
                        if (date) onChange(date);
                    }}
                    className="pointer-events-none absolute bottom-0 left-0 h-full w-full opacity-0"
                />
                <button
                    type="button"
                    tabIndex={-1}
                    aria-label={title || "Chọn ngày"}
                    disabled={disabled}
                    onClick={openPicker}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-text_2 disabled:opacity-50"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DatePicker;
