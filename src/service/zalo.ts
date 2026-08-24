export const openWebView = async (link: string): Promise<void> => {
    window.open(link, "_blank");
};

/**
 * Xin quyen thong bao trinh duyet (Web Notification API). Day la quyen o cap
 * trinh duyet/thiet bi, khac voi kenh Zalo OA (xem notificationAdapters ben
 * backend) - nguoi dung web va nguoi dung Zalo Mini App co the co trang thai
 * quyen khac nhau.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    try {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    } catch (err) {
        return false;
    }
};
