import React from "react";

const ClipboardCheckIcon: React.FC<{ color?: string; size?: number }> = ({
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
        <rect x="6" y="4.5" width="12" height="16" rx="2" />
        <path d="M9.5 4.2h5a1 1 0 011 1v1.3h-7V5.2a1 1 0 011-1z" />
        <path d="M9.3 13.3l1.8 1.8 3.4-3.6" />
    </svg>
);

export default ClipboardCheckIcon;
