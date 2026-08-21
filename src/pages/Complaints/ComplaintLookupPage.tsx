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

    const loadMyComplaints = () => {
        setMyLoading(true);
        setMyError(false);
        fetchMyComplaints()
            .then(res => setMyComplaints(res.items))
            .catch(() => setMyError(true))
            .finally(() => setMyLoading(false));
    };

    useEffect(() => {
        if (token) {
            loadMyComplaints();
        }
    }, [token]);

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

                        {myLoading && <LoadingState />}
                        {!myLoading && myError && (
                            <ErrorState onRetry={loadMyComplaints} />
                        )}
                        {!myLoading &&
                            !myError &&
                            myComplaints.length === 0 && (
                                <EmptyState
                                    label="Bạn chưa gửi phản ánh nào"
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
                                    subtitle={item.code}
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
                        boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
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
