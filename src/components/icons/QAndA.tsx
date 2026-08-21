import React from "react";

const QAndAIcon: React.FC<{ color?: string; size?: number }> = ({
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
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9.5 9.3a2.5 2.5 0 014.9.7c0 1.7-2.4 2-2.4 3.5" />
        <circle cx="12" cy="16.4" r="0.2" fill={color} stroke="none" />
    </svg>
);

export default QAndAIcon;
