import React, { FC, ReactElement, ReactNode } from "react";
import clsx from "clsx";

export interface TabProps {
    label: ReactNode;
    children?: ReactNode;
}

// Pure data-carrier - Tabs reads .props.label/.props.children directly and
// never actually renders this component.
const Tab: FC<TabProps> = () => null;
Tab.displayName = "Tabs.Tab";

export interface TabsProps {
    activeKey: string;
    onChange?: (key: string) => void;
    className?: string;
    children: ReactNode;
}

const Tabs: FC<TabsProps> & { Tab: FC<TabProps> } = ({
    activeKey,
    onChange,
    className,
    children,
}) => {
    const tabs = React.Children.toArray(children) as ReactElement<TabProps>[];
    const activeTab = tabs.find(tab => tab.key === activeKey) || tabs[0];

    return (
        <div className={className}>
            <div className="flex flex-row border-b border-divider_01">
                {tabs.map(tab => {
                    const key = String(tab.key);
                    const isActive = key === (activeTab?.key ?? "");
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onChange?.(key)}
                            className={clsx(
                                "flex-1 border-b-2 py-3 text-[14px] font-medium",
                                isActive
                                    ? "border-main text-text_1"
                                    : "border-transparent text-text_2",
                            )}
                        >
                            {tab.props.label}
                        </button>
                    );
                })}
            </div>
            <div>{activeTab?.props.children}</div>
        </div>
    );
};
Tabs.Tab = Tab;

export default Tabs;
