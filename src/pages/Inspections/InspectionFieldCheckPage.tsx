import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Text, useNavigate, useParams, useSnackbar } from "@components/ui";
import { PageLayout } from "@components/layout";
import { RequireAuth, hasPermission } from "@components/role";
import { ErrorState, LoadingState, StatusBadge } from "@components/admin";
import { Button, Input, TextArea } from "@components/customized";
import { BASE_URL } from "@constants/common";
import { useStore } from "@store";
import type {
    AppError,
    InspectionCampaign,
    InspectionOutcome,
    InspectionResult,
    InspectionTarget,
} from "@dts";
import {
    createInspectionResult,
    fetchInspectionResult,
    fetchInspectionTarget,
    transitionInspectionResult,
    updateInspectionResult,
    uploadInspectionEvidence,
} from "@service/inspectionApi";

const assetUrl = (url: string) =>
    /^https?:\/\//i.test(url)
        ? url
        : new URL(url, BASE_URL || window.location.origin).toString();

const selectAnswerValue = (inputType: string, value: unknown): string => {
    if (inputType !== "BOOLEAN") return String(value ?? "");
    if (value === true) return "true";
    if (value === false) return "false";
    return "";
};

const selectOptionValue = (inputType: string, option: string): string => {
    if (inputType !== "BOOLEAN") return option;
    return option === "Có" ? "true" : "false";
};

const InspectionFieldCheckPage: React.FC = () => (
    <RequireAuth>
        <InspectionFieldCheckContent />
    </RequireAuth>
);

const InspectionFieldCheckContent: React.FC = () => {
    const { targetId = "" } = useParams();
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const user = useStore(state => state.user);
    const canView = hasPermission(user, "inspections.read");
    const canExecute = hasPermission(user, "inspections.execute");
    const canVerify = hasPermission(user, "inspections.verify");
    const fileInput = useRef<HTMLInputElement>(null);
    const [target, setTarget] = useState<InspectionTarget | null>(null);
    const [campaign, setCampaign] = useState<InspectionCampaign | null>(null);
    const [result, setResult] = useState<InspectionResult | null>(null);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [note, setNote] = useState("");
    const [reviewNote, setReviewNote] = useState("");
    const [outcome, setOutcome] = useState<InspectionOutcome | "">("");
    const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [working, setWorking] = useState(false);

    const hydrate = (data: InspectionResult) => {
        setResult(data);
        setAnswers(
            Object.fromEntries(
                data.answers.map(answer => [
                    answer.checklistItemId,
                    answer.value,
                ]),
            ),
        );
        setNote(data.note || "");
        setReviewNote(data.reviewNote || "");
        setOutcome(data.outcome || "");
        setGps(
            data.gpsLat !== undefined && data.gpsLng !== undefined
                ? { lat: data.gpsLat, lng: data.gpsLng }
                : null,
        );
    };

    const load = async () => {
        setLoading(true);
        setError(false);
        try {
            const targetData = await fetchInspectionTarget(targetId);
            setTarget(targetData);
            setCampaign(targetData.campaign || null);
            if (targetData.result?._id)
                hydrate(await fetchInspectionResult(targetData.result._id));
            else setResult(null);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canView) load();
        else setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetId, canView]);

    const mutable =
        canExecute &&
        campaign?.status === "ACTIVE" &&
        (!result || ["DRAFT", "FIELD_CHECK_REQUIRED"].includes(result.status));
    const reviewable =
        canVerify &&
        campaign?.status === "ACTIVE" &&
        !!result &&
        ["SUBMITTED", "FIELD_CHECK_REQUIRED"].includes(result.status);
    const house =
        target && typeof target.houseId !== "string" ? target.houseId : null;
    const answerPayload = useMemo(
        () =>
            Object.entries(answers)
                .filter(([, value]) => value !== undefined && value !== "")
                .map(([checklistItemId, value]) => ({
                    checklistItemId,
                    value,
                })),
        [answers],
    );

    const saveDraft = async () => {
        if (!target) throw new Error("Không tìm thấy Nhà số");
        const payload = {
            answers: answerPayload,
            gpsLat: gps?.lat,
            gpsLng: gps?.lng,
            note: note.trim() || undefined,
            outcome: outcome || undefined,
        };
        const saved = result
            ? await updateInspectionResult(result._id, payload)
            : await createInspectionResult({
                  targetId: target._id,
                  ...payload,
              });
        hydrate(saved);
        return saved;
    };

    const execute = async (work: () => Promise<unknown>, success: string) => {
        try {
            setWorking(true);
            await work();
            openSnackbar({ type: "success", text: success });
        } catch (err) {
            openSnackbar({ type: "error", text: (err as AppError).message });
        } finally {
            setWorking(false);
        }
    };

    const locate = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                setGps({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                openSnackbar({ type: "success", text: "Đã ghi nhận vị trí" });
            },
            () =>
                openSnackbar({
                    type: "error",
                    text: "Không lấy được vị trí. Hãy cấp quyền định vị.",
                }),
            { enableHighAccuracy: true, timeout: 12000 },
        );
    };

    const upload = (file?: File) => {
        if (!file) return;
        execute(async () => {
            const saved = result || (await saveDraft());
            await uploadInspectionEvidence(saved._id, file);
            hydrate(await fetchInspectionResult(saved._id));
            if (fileInput.current) fileInput.current.value = "";
        }, "Đã thêm ảnh/tệp minh chứng");
    };

    const review = (
        action: "verify" | "request-revision" | "require-field-check",
    ) => {
        if (!result) return;
        if (action === "verify" && !outcome) {
            openSnackbar({
                type: "error",
                text: "Vui lòng chọn kết luận trước khi xác minh",
            });
            return;
        }
        if (action !== "verify" && !reviewNote.trim()) {
            openSnackbar({ type: "error", text: "Vui lòng nhập lý do" });
            return;
        }
        execute(
            async () => {
                hydrate(
                    await transitionInspectionResult(result._id, action, {
                        note: reviewNote.trim() || undefined,
                        outcome: outcome || undefined,
                    }),
                );
            },
            action === "verify" ? "Đã xác minh kết quả" : "Đã cập nhật yêu cầu",
        );
    };

    if (!canView) {
        return (
            <PageLayout id="field-check-denied" title="Rà soát">
                <Box p={6}>
                    <Text size="small" className="text-center text-text_2">
                        Bạn không có quyền truy cập.
                    </Text>
                </Box>
            </PageLayout>
        );
    }
    if (loading)
        return (
            <PageLayout id="field-check-loading" title="Rà soát">
                <LoadingState />
            </PageLayout>
        );
    if (error || !target || !campaign)
        return (
            <PageLayout id="field-check-error" title="Rà soát">
                <ErrorState onRetry={load} />
            </PageLayout>
        );

    return (
        <PageLayout
            id="inspection-field-check"
            title={`Nhà ${house?.code || "—"}`}
        >
            <Box p={4} className={mutable ? "pb-28" : ""}>
                <Box className="bg-white rounded-2xl p-4 shadow-sm">
                    <Box
                        flex
                        justifyContent="space-between"
                        alignItems="flex-start"
                    >
                        <Box className="pr-2">
                            <Text.Title size="small">
                                Nhà {house?.code || "—"}
                            </Text.Title>
                            <Text size="xSmall" className="text-text_2 mt-1">
                                {house?.address || "—"}
                            </Text>
                            <Text size="xSmall" className="mt-2 font-medium">
                                {campaign.name}
                            </Text>
                        </Box>
                        <StatusBadge
                            label={result?.status || target.resultStatus}
                        />
                    </Box>
                    {result?.submittedBy === "HOUSE" && (
                        <Text
                            size="xSmall"
                            className="block bg-blue-10 text-main rounded-lg p-3 mt-3"
                        >
                            Kết quả do Nhà số tự khai; Tổ cần xác minh hoặc yêu
                            cầu kiểm tra thực địa.
                        </Text>
                    )}
                    {campaign.status !== "ACTIVE" && (
                        <Text
                            size="xSmall"
                            className="block bg-amber-50 text-amber-700 rounded-lg p-3 mt-3"
                        >
                            Chiến dịch đã khóa hoặc kết thúc; kết quả chỉ còn
                            chế độ xem.
                        </Text>
                    )}
                </Box>

                <Box className="bg-white rounded-2xl p-4 mt-3 shadow-sm">
                    <Text.Title size="small">Checklist</Text.Title>
                    {campaign.checklistTemplate.map((item, index) => (
                        <Box key={item.itemId} mt={4}>
                            <Text size="small" className="font-medium">
                                {index + 1}. {item.label}
                                {item.required ? " *" : ""}
                            </Text>
                            {item.inputType === "TEXT" && (
                                <Box mt={2}>
                                    <TextArea
                                        disabled={!mutable}
                                        value={String(
                                            answers[item.itemId] ?? "",
                                        )}
                                        onChange={event =>
                                            setAnswers(current => ({
                                                ...current,
                                                [item.itemId]:
                                                    event.target.value,
                                            }))
                                        }
                                    />
                                </Box>
                            )}
                            {item.inputType === "NUMBER" && (
                                <Box mt={2}>
                                    <Input
                                        type="number"
                                        disabled={!mutable}
                                        value={String(
                                            answers[item.itemId] ?? "",
                                        )}
                                        onChange={event =>
                                            setAnswers(current => ({
                                                ...current,
                                                [item.itemId]:
                                                    event.target.value === ""
                                                        ? ""
                                                        : Number(
                                                              event.target
                                                                  .value,
                                                          ),
                                            }))
                                        }
                                    />
                                </Box>
                            )}
                            {(item.inputType === "BOOLEAN" ||
                                item.inputType === "SINGLE_SELECT") && (
                                <select
                                    disabled={!mutable}
                                    className="w-full mt-2 rounded-lg bg-ng_10 p-3 text-sm"
                                    value={selectAnswerValue(
                                        item.inputType,
                                        answers[item.itemId],
                                    )}
                                    onChange={event =>
                                        setAnswers(current => ({
                                            ...current,
                                            [item.itemId]:
                                                item.inputType === "BOOLEAN"
                                                    ? event.target.value ===
                                                      "true"
                                                    : event.target.value,
                                        }))
                                    }
                                >
                                    <option value="">Chọn câu trả lời</option>
                                    {(item.inputType === "BOOLEAN"
                                        ? ["Có", "Không"]
                                        : item.options || []
                                    ).map(option => (
                                        <option
                                            key={option}
                                            value={selectOptionValue(
                                                item.inputType,
                                                option,
                                            )}
                                        >
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {item.inputType === "MULTI_SELECT" && (
                                <Box className="bg-ng_10 rounded-lg p-3 mt-2">
                                    {(item.options || []).map(option => {
                                        const values = Array.isArray(
                                            answers[item.itemId],
                                        )
                                            ? (answers[item.itemId] as string[])
                                            : [];
                                        return (
                                            <label
                                                key={option}
                                                htmlFor={`${item.itemId}-${option}`}
                                                className="flex items-center gap-2 py-2 text-sm"
                                            >
                                                <input
                                                    id={`${item.itemId}-${option}`}
                                                    type="checkbox"
                                                    disabled={!mutable}
                                                    checked={values.includes(
                                                        option,
                                                    )}
                                                    onChange={event =>
                                                        setAnswers(current => ({
                                                            ...current,
                                                            [item.itemId]: event
                                                                .target.checked
                                                                ? [
                                                                      ...values,
                                                                      option,
                                                                  ]
                                                                : values.filter(
                                                                      value =>
                                                                          value !==
                                                                          option,
                                                                  ),
                                                        }))
                                                    }
                                                />
                                                {option}
                                            </label>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>

                <Box className="bg-white rounded-2xl p-4 mt-3 shadow-sm">
                    <Text.Title size="small">Ghi chú và kết luận</Text.Title>
                    <Box mt={3}>
                        <TextArea
                            disabled={!mutable}
                            placeholder="Ghi chú hiện trường"
                            value={note}
                            onChange={event => setNote(event.target.value)}
                        />
                    </Box>
                    <select
                        disabled={!mutable && !reviewable}
                        className="w-full mt-3 rounded-lg bg-ng_10 p-3 text-sm"
                        value={outcome}
                        onChange={event =>
                            setOutcome(event.target.value as InspectionOutcome)
                        }
                    >
                        <option value="">Chọn kết luận</option>
                        <option value="PASS">Đạt</option>
                        <option value="FAIL">Chưa đạt</option>
                        <option value="NEEDS_SUPPLEMENT">Cần bổ sung</option>
                    </select>
                    <Box className="bg-ng_10 rounded-lg p-3 mt-3">
                        <Text size="xSmall" className="text-text_2">
                            {gps
                                ? `${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}`
                                : "Chưa ghi nhận GPS"}
                        </Text>
                        {mutable && (
                            <Box mt={2}>
                                <Button
                                    fullWidth
                                    variant="secondary"
                                    onClick={locate}
                                >
                                    Lấy vị trí hiện tại
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>

                <Box className="bg-white rounded-2xl p-4 mt-3 shadow-sm">
                    <Text.Title size="small">Ảnh / tệp minh chứng</Text.Title>
                    <Text size="xxSmall" className="text-text_2 mt-1">
                        JPG, PNG hoặc PDF; tối đa 10MB.
                    </Text>
                    {mutable && (
                        <>
                            <input
                                ref={fileInput}
                                className="hidden"
                                type="file"
                                accept="image/jpeg,image/png,application/pdf"
                                capture="environment"
                                onChange={event =>
                                    upload(event.target.files?.[0])
                                }
                            />
                            <Box mt={3}>
                                <Button
                                    fullWidth
                                    variant="secondary"
                                    loading={working}
                                    onClick={() => fileInput.current?.click()}
                                >
                                    Chụp / chọn minh chứng
                                </Button>
                            </Box>
                        </>
                    )}
                    <Box mt={2}>
                        {(result?.attachments || []).map(file => (
                            <a
                                key={file._id}
                                className="block text-main text-sm py-2 border-b border-divider_01"
                                href={assetUrl(file.url)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {file.name}
                            </a>
                        ))}
                    </Box>
                </Box>

                {reviewable && (
                    <Box className="bg-blue-10 rounded-2xl p-4 mt-3">
                        <Text.Title size="small">Xác minh kết quả</Text.Title>
                        <Box mt={3}>
                            <TextArea
                                placeholder="Lý do / nội dung cần bổ sung"
                                value={reviewNote}
                                onChange={event =>
                                    setReviewNote(event.target.value)
                                }
                            />
                        </Box>
                        <Box mt={3}>
                            <Button
                                fullWidth
                                loading={working}
                                onClick={() => review("verify")}
                            >
                                Xác minh
                            </Button>
                        </Box>
                        {result?.status === "SUBMITTED" && (
                            <>
                                <Box mt={2}>
                                    <Button
                                        fullWidth
                                        variant="secondary"
                                        loading={working}
                                        onClick={() =>
                                            review("request-revision")
                                        }
                                    >
                                        Yêu cầu bổ sung
                                    </Button>
                                </Box>
                                <Box mt={2}>
                                    <Button
                                        fullWidth
                                        variant="secondary"
                                        loading={working}
                                        onClick={() =>
                                            review("require-field-check")
                                        }
                                    >
                                        Chuyển kiểm tra thực địa
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                )}

                <Box mt={4}>
                    <Button
                        fullWidth
                        variant="secondary"
                        onClick={() =>
                            navigate(`/inspections/${campaign._id}`, {
                                animate: true,
                            })
                        }
                    >
                        Quay lại danh sách Nhà
                    </Button>
                </Box>
            </Box>

            {mutable && (
                <Box className="fixed bottom-0 left-0 right-0 bg-white border-t border-divider_01 p-3 z-20 flex gap-2">
                    <Button
                        className="flex-1"
                        variant="secondary"
                        loading={working}
                        onClick={() =>
                            execute(async () => {
                                await saveDraft();
                            }, "Đã lưu bản nháp")
                        }
                    >
                        Lưu nháp
                    </Button>
                    <Button
                        className="flex-1"
                        loading={working}
                        onClick={() =>
                            execute(async () => {
                                const saved = await saveDraft();
                                hydrate(
                                    await transitionInspectionResult(
                                        saved._id,
                                        "submit",
                                    ),
                                );
                            }, "Đã gửi kết quả")
                        }
                    >
                        Gửi kết quả
                    </Button>
                </Box>
            )}
        </PageLayout>
    );
};

export default InspectionFieldCheckPage;
