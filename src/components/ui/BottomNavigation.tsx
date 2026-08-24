import React, { FC, ReactElement, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

export interface BottomNavigationItemProps {
    itemKey: string;
    label: ReactNode;
    icon?: ReactNode;
    linkTo?: string;
    onClick?: () => void;
}

const Item: FC<BottomNavigationItemProps> = () => null;
Item.displayName = "BottomNavigation.Item";

export interface BottomNavigationProps {
    id?: string;
    activeKey: string;
    fixed?: boolean;
    className?: string;
    children: ReactNode;
}

const BottomNavigation: FC<BottomNavigationProps> & {
    Item: FC<BottomNavigationItemProps>;
} = ({ id, activeKey, fixed, className, children }) => {
    const navigate = useNavigate();
    const items = React.Children.toArray(
        children,
    ) as ReactElement<BottomNavigationItemProps>[];

    return (
        <div
            id={id}
            className={clsx(
                "flex flex-row border-t border-divider_01 bg-white shadow-[0_-1px_4px_rgba(16,24,40,0.04)]",
                fixed && "fixed bottom-0 left-0 w-full",
                className,
            )}
        >
            {items.map(item => {
                const { itemKey, label, icon, linkTo, onClick } = item.props;
                const isActive = itemKey === activeKey;
                return (
                    <button
                        key={itemKey}
                        type="button"
                        onClick={() => {
                            if (onClick) onClick();
                            else if (linkTo) navigate(linkTo);
                        }}
                        className={clsx(
                            "flex flex-1 flex-col items-center gap-0.5 py-2 text-[12px] transition-colors",
                            isActive
                                ? "text-primary-600 font-medium"
                                : "text-text_2",
                        )}
                    >
                        {icon}
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    );
};
BottomNavigation.Item = Item;

export default BottomNavigation;
