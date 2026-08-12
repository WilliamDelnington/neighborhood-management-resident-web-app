import React, {
    FC,
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import clsx from "clsx";

export type SnackbarType = "success" | "error" | "info" | "warning";

export interface SnackbarAction {
    text: string;
    close?: boolean;
    onClick?: () => void;
}

export interface SnackbarOptions {
    type?: SnackbarType;
    text: string;
    duration?: number;
    verticalAction?: boolean;
    action?: SnackbarAction;
    onClose?: () => void;
}

interface SnackbarEntry extends SnackbarOptions {
    id: number;
}

interface SnackbarContextValue {
    openSnackbar: (options: SnackbarOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextValue>({
    openSnackbar: () => undefined,
});

export const useSnackbar = () => useContext(SnackbarContext);

const TYPE_ACCENT: Record<SnackbarType, string> = {
    success: "bg-[#34b764]",
    error: "bg-[#dc1f18]",
    warning: "bg-[#e8ba02]",
    info: "bg-[#52a0ff]",
};

export const SnackbarProvider: FC<{ children?: ReactNode }> = ({
    children,
}) => {
    const [entries, setEntries] = useState<SnackbarEntry[]>([]);
    const nextIdRef = useRef(1);

    const closeSnackbar = useCallback((id: number) => {
        setEntries(current => {
            current.find(entry => entry.id === id)?.onClose?.();
            return current.filter(entry => entry.id !== id);
        });
    }, []);

    const openSnackbar = useCallback(
        (options: SnackbarOptions) => {
            const id = nextIdRef.current;
            nextIdRef.current += 1;
            setEntries(current => [...current, { ...options, id }]);
            window.setTimeout(
                () => closeSnackbar(id),
                options.duration ?? 2500,
            );
        },
        [closeSnackbar],
    );

    const contextValue = useMemo(() => ({ openSnackbar }), [openSnackbar]);

    return (
        <SnackbarContext.Provider value={contextValue}>
            {children}
            <div className="fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
                {entries.map(entry => (
                    <div
                        key={entry.id}
                        className={clsx(
                            "flex w-full max-w-sm items-center gap-3 rounded-xl bg-[#252627] px-4 py-3 text-[14px] text-white shadow-lg",
                            entry.verticalAction && "flex-col items-start",
                        )}
                    >
                        {entry.type && (
                            <span
                                className={clsx(
                                    "h-2 w-2 shrink-0 rounded-full",
                                    TYPE_ACCENT[entry.type],
                                )}
                            />
                        )}
                        <span className="flex-1">{entry.text}</span>
                        {entry.action && (
                            <button
                                type="button"
                                className="font-medium text-[#52a0ff]"
                                onClick={() => {
                                    entry.action?.onClick?.();
                                    if (entry.action?.close) {
                                        closeSnackbar(entry.id);
                                    }
                                }}
                            >
                                {entry.action.text}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </SnackbarContext.Provider>
    );
};
