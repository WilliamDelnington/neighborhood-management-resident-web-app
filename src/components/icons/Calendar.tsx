import React from "react";

const CalendarIcon: React.FC<{ color?: string; size?: number }> = ({
    color = "currentColor",
    size = 28,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
);

export default CalendarIcon;
