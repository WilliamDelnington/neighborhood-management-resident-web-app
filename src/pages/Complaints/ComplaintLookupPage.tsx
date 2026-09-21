import React, { useEffect, useState } from "react";
import { MessageSquareWarning } from "lucide-react";
import { Box, Icon, Text, useNavigate } from "@components/ui";
import { PageLayout, AppBottomNav } from "@components/layout";
import { Button, Input } from "@components/customized";
import {
    EmptyState,
    ErrorState,
    ListRow,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { useStore } from "@store";
import { hasPermission } from "@components/role";
import {
    fetchMyComplaints,
    lookupComplaintByCode,
} from "@service/complaintApi";
import {
    TRANG_THAI_PHAN_ANH_LABEL,
    TRANG_THAI_PHAN_ANH_TONE,
} from "@constants/domain";
import { Complaint, ComplaintDetail } from "@dts";
import { formatDateTime } from "@utils/date-time";
import ComplaintTimelineView from "./ComplaintTimelineView";
import StaffComplaintInbox from "./StaffComplaintInbox";

const ComplaintLookupPage: React.FC = () => {
    const navigate = useNavigate();
    const token = useStore(state => state.token);
    const user = useStore(state => state.user);
    const canViewInbox = hasPermission(user, "complaints.read");
    const canCreate = hasPermission(user, "complaints.create");

    const [code, setCode] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [result, setResult] = useState<ComplaintDetail | null>(null);

    const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
    const [myLoading, setMyLoading] = useState(false);
    const [myError, setMyError] = useState(false);
    const [myFilter, setMyFilter] = useState("");

    const loadMyComplaints = (search?: string) => {
        setMyLoading(true);
        setMyError(false);
        fetchMyComplaints(1, undefined, search || undefined)
            .then(res => setMyComplaints(res.items))
            .catch(() => setMyError(true))
            .finally(() => setMyLoading(false));
    };

    // Loc (debounce) danh sach "Phản ánh của tôi" khi go tim - an toan vi danh
    // sach nay da duoc backend gioi han theo chinh nguoi dang dang nhap
    // (createdByUserId), khac voi o "Tra cứu theo mã phản ánh" ben tren (khong
    // dang nhap cung goi duoc) nen KHONG the doi thanh tim tu do o do (se lo
    // tieu de/noi dung phan anh cua nguoi khac cho nguoi chua dang nhap).
    useEffect(() => {
        if (!token) return undefined;
        const timer = setTimeout(() => loadMyComplaints(myFilter), 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, myFilter]);

    const handleSearch = async () => {
        if (!code.trim()) {
            setSearchError("Vui lòng nhập mã phản ánh");
            return;
        }
        try {
            setSearching(true);
            setSearchError(null);
            setResult(null);
            const detail = await lookupComplaintByCode(code.trim());
            setResult(detail);
        } catch (err: any) {
            setResult(null);
            setSearchError(
                err?.message || "Không tìm thấy phản ánh với mã này",
            );
        } finally {
            setSearching(false);
        }
    };

    return (
        <PageLayout
            id="complaint-lookup-page"
            title="Phản ánh"
            bottomNav={<AppBottomNav />}
        >
            <Box p={4}>
                <Box className="bg-white rounded-2xl p-4 shadow-card">
                    <Text.Title size="small" className="mb-2">
                        Tra cứu theo mã phản ánh
                    </Text.Title>
                    <Input
                        placeholder="VD: HB-PA-2026-0001"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                    />
                    <Box mt={3}>
                        <Button
                            fullWidth
                            loading={searching}
                            onClick={handleSearch}
                        >
                            Tra cứu
                        </Button>
                    </Box>
                    {searchError && (
                        <Text size="xSmall" className="text-red-500 mt-2">
                            {searchError}
                        </Text>
                    )}
                </Box>

                {result && (
                    <Box mt={3}>
                        <ComplaintTimelineView
                            complaint={result.complaint}
                            timeline={result.timeline}
                        />
                    </Box>
                )}

                {token && (
                    <Box className="bg-white rounded-2xl p-4 shadow-card mt-3">
                        <Text.Title size="small" className="mb-2">
                            Phản ánh của tôi
                        </Text.Title>
                        <Input
                            placeholder="Tìm theo tiêu đề hoặc mã phản ánh..."
                            value={myFilter}
                            onChange={e => setMyFilter(e.target.value)}
                        />

                        {myLoading && <LoadingState />}
                        {!myLoading && myError && (
                            <ErrorState
                                onRetry={() => loadMyComplaints(myFilter)}
                            />
                        )}
                        {!myLoading &&
                            !myError &&
                            myComplaints.length === 0 && (
                                <EmptyState
                                    label={
                                        myFilter
                                            ? "Không tìm thấy phản ánh phù hợp"
                                            : "Bạn chưa gửi phản ánh nào"
                                    }
                                    icon={MessageSquareWarning}
                                    tone="danger"
                                />
                            )}
                        {!myLoading &&
                            !myError &&
                            myComplaints.map(item => (
                                <ListRow
                                    key={item._id}
                                    title={item.title}
                                    subtitle={`${item.code} · ${formatDateTime(
                                        new Date(item.createdAt),
                                    )}`}
                                    right={
                                        <StatusBadge
                                            label={
                                                TRANG_THAI_PHAN_ANH_LABEL[
                                                    item.status
                                                ]
                                            }
                                            tone={
                                                TRANG_THAI_PHAN_ANH_TONE[
                                                    item.status
                                                ]
                                            }
                                        />
                                    }
                                    onClick={() =>
                                        navigate(`/complaints/${item._id}`, {
                                            animate: true,
                                        })
                                    }
                                />
                            ))}
                    </Box>
                )}

                {canViewInbox && <StaffComplaintInbox />}
            </Box>

            {canCreate && (
                <Box
                    className="bg-main"
                    style={{
                        position: "fixed",
                        right: 16,
                        bottom: 76,
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(5,170,192,0.4)",
                        zIndex: 20,
                    }}
                    onClick={() =>
                        navigate("/complaints/create", { animate: true })
                    }
                >
                    <Icon icon="zi-plus" className="text-white" />
                </Box>
            )}
        </PageLayout>
    );
};

export default ComplaintLookupPage;
