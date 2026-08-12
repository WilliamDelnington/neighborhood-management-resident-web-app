import React from "react";
import { Text } from "@components/ui";

export type BadgeTone = "gray" | "blue" | "yellow" | "green" | "red";

const TONE_CLASS: Record<BadgeTone, string> = {
    gray: "bg-ng_10 text-text_2",
    blue: "bg-blue_10 text-main",
    yellow: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
};

export interface StatusBadgeProps {
    label: string;
    tone?: BadgeTone;
}

/**
 * Nhan trang thai dung chung cho toan bo man hinh quan tri (phan anh, PCCC, an ninh, tai chinh...).
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ label, tone = "gray" }) => (
    <Text
        size="xxSmall"
        className={`inline-block px-2 py-1 rounded-full font-medium ${TONE_CLASS[tone]}`}
    >
        {label}
    </Text>
);

export default StatusBadge;
