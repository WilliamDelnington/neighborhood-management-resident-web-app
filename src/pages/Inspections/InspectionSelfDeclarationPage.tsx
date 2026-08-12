import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Text, useNavigate, useParams, useSnackbar } from "@components/ui";
import {
    EmptyState,
    ErrorState,
    LoadingState,
    StatusBadge,
} from "@components/admin";
import { Button, Input, TextArea } from "@components/customized";
import { PageLayout } from "@components/layout";
import { RequireAuth } from "@components/role";
import { BASE_URL } from "@constants/common";
import type { AppError, InspectionSelfDeclarationDetail } from "@dts";
import {
    fetchInspectionSelfDeclaration,
    saveInspectionSelfDeclaration,
    submitInspectionSelfDeclaration,
    uploadInspectionSelfDeclarationEvidence,
} from "@service/inspectionApi";

const assetUrl = (url: string) =>
    /^https?:\/\//i.test(url)
        ? url
        : new URL(url, BASE_URL || window.location.origin).toString();

const answerValue = (inputType: string, value: unknown): string => {
    if (inputType !== "BOOLEAN") return String(value ?? "");
    if (value === true) return "true";
    if (value === false) return "false";
    return "";
};

const optionValue = (inputType: string, option: string): string => {
    if (inputType !== "BOOLEAN") return option;
    return option === "Có" ? "true" : "false";
};

const InspectionSelfDeclarationPage: React.FC = () => (
    <RequireAuth>
        <InspectionSelfDeclarationContent />
    </RequireAuth>
);

const InspectionSelfDeclarationContent: React.FC = () => {
    const { targetId = "" } = useParams();
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const fileInput = useRef<HTMLInputElement>(null);
    const [detail, setDetail] =
        useState<InspectionSelfDeclarationDetail | null>(null);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [working, setWorking] = useState(false);

    const hydrate = (data: InspectionSelfDeclarationDetail) => {
        setDetail(data);
        setAnswers(
            Object.fromEntries(
                (data.result?.answers || []).map(item => [
                    item.checklistItemId,
                    item.value,
                ]),
            ),
        );
        setNote(data.result?.note || "");
    };

    const load = () => {
        setLoading(true);
        setError(false);
        fetchInspectionSelfDeclaration(targetId)
            .then(hydrate)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(load, [targetId]);

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
    const mutable =
        detail?.campaign.status === "ACTIVE" &&
        (!detail.result ||
            ["DRAFT", "REQUEST_REVISION"].includes(detail.result.status));

    const saveDraft = async () => {
        const saved = await saveInspectionSelfDeclaration(targetId, {
            answers: answerPayload,
            note: note.trim() || undefined,
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

    const upload = (file?: File) => {
        if (!file) return;
        execute(async () => {
            await saveDraft();
            await uploadInspectionSelfDeclarationEvidence(targetId, file);
            hydrate(await fetchInspectionSelfDeclaration(targetId));
            if (fileInput.current) fileInput.current.value = "";
        }, "Đã thêm minh chứng");
    };

    if (loading)
        return (
            <PageLayout id="self-declaration-loading" title="Biểu mẫu tự khai">
                <LoadingState />
            </PageLayout>
        );
    if (error)
        return (
            <PageLayout id="self-declaration-error" title="Biểu mẫu tự khai">
                <ErrorState onRetry={load} />
            </PageLayout>
        );
    if (!detail)
        return (
            <PageLayout id="self-declaration-empty" title="Biểu mẫu tự khai">
                <EmptyState label="Không tìm thấy biểu mẫu" />
            </PageLayout>
        );

    const { campaign, target, result } = detail;
    const house = typeof target.houseId === "string" ? null : target.houseId;

    return (
        <PageLayout id="inspection-self-declaration" title="Biểu mẫu tự khai">
            <Box p={4} className={mutable ? "pb-28" : ""}>
                <Box className="rounded-2xl bg-white p-4 shadow-sm">
                    <Box
                        flex
                        justifyContent="space-between"
                        alignItems="flex-start"
                    >
                        <Box className="min-w-0 pr-2">
                            <Text.Title size="small">
                                {campaign.name}
                            </Text.Title>
                            <Text size="xSmall" className="mt-1 text-text_2">
                                Nhà {house?.code || "—"} ·{" "}
                                {house?.address || "—"}
                            </Text>
                        </Box>
                        <StatusBadge label={result?.status || "Chờ khai"} />
                    </Box>
                    <Text size="xSmall" className="mt-3 block">
                        {campaign.purpose}
                    </Text>
                    <Text size="xxSmall" className="mt-2 block text-text_2">
                        Hạn hoàn thành{" "}
                        {new Date(campaign.dueAt).toLocaleDateString("vi-VN")}
                    </Text>
                    {result?.status === "REQUEST_REVISION" && (
                        <Box className="mt-3 rounded-xl bg-amber-50 p-3">
                            <Text
                                size="xSmall"
                                className="font-medium text-amber-800"
                            >
                                Nội dung cần bổ sung
                            </Text>
                            <Text
                                size="xSmall"
                                className="mt-1 block text-amber-700"
                            >
                                {result.reviewNote ||
                                    "Tổ dân phố yêu cầu cập nhật lại biểu mẫu."}
                            </Text>
                        </Box>
                    )}
                    {campaign.status !== "ACTIVE" && (
                        <Text
                            size="xSmall"
                            className="mt-3 block rounded-xl bg-ng_10 p-3 text-text_2"
                        >
                            Chiến dịch đã khóa hoặc kết thúc; biểu mẫu hiện chỉ
                            có thể xem.
                        </Text>
                    )}
                </Box>

                <Box className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                    <Text.Title size="small">Nội dung tự khai</Text.Title>
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
                                    className="mt-2 w-full rounded-lg bg-ng_10 p-3 text-sm"
                                    value={answerValue(
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
                                            value={optionValue(
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
                                <Box className="mt-2 rounded-lg bg-ng_10 p-3">
                                    {(item.options || []).map(
                                        (option, optionIndex) => {
                                            const values = Array.isArray(
                                                answers[item.itemId],
                                            )
                                                ? (answers[
                                                      item.itemId
                                                  ] as string[])
                                                : [];
                                            const inputId = `${item.itemId}-option-${optionIndex}`;
                                            return (
                                                <label
                                                    key={option}
                                                    htmlFor={inputId}
                                                    className="flex items-center gap-2 py-2 text-sm"
                                                >
                                                    <input
                                                        id={inputId}
                                                        type="checkbox"
                                                        disabled={!mutable}
                                                        checked={values.includes(
                                                            option,
                                                        )}
                                                        onChange={event =>
                                                            setAnswers(
                                                                current => ({
                                                                    ...current,
                                                                    [item.itemId]:
                                                                        event
                                                                            .target
                                                                            .checked
                                                                            ? [
                                                                                  ...values,
                                                                                  option,
                                                                              ]
                                                                            : values.filter(
                                                                                  value =>
                                                                                      value !==
                                                                                      option,
                                                                              ),
                                                                }),
                                                            )
                                                        }
                                                    />
                                                    {option}
                                                </label>
                                            );
                                        },
                                    )}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>

                <Box className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                    <Text.Title size="small">Ghi chú</Text.Title>
                    <Box mt={3}>
                        <TextArea
                            disabled={!mutable}
                            placeholder="Thông tin bổ sung cho Tổ dân phố"
                            value={note}
                            onChange={event => setNote(event.target.value)}
                        />
                    </Box>
                </Box>

                <Box className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                    <Text.Title size="small">Ảnh / tệp minh chứng</Text.Title>
                    <Text size="xxSmall" className="mt-1 block text-text_2">
                        JPG, PNG hoặc PDF; tối đa 10MB
                        {campaign.requiredEvidence
                            ? " · Bắt buộc ít nhất một tệp"
                            : ""}
                        .
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
                                className="block border-b border-divider_01 py-2 text-sm text-main"
                                href={assetUrl(file.url)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {file.name}
                            </a>
                        ))}
                    </Box>
                </Box>

                <Box mt={4}>
                    <Button
                        fullWidth
                        variant="secondary"
                        onClick={() =>
                            navigate("/inspections/self-declarations", {
                                animate: true,
                            })
                        }
                    >
                        Quay lại danh sách biểu mẫu
                    </Button>
                </Box>
            </Box>

            {mutable && (
                <Box className="fixed bottom-0 left-0 right-0 z-20 flex gap-2 border-t border-divider_01 bg-white p-3">
                    <Button
                        className="flex-1"
                        variant="secondary"
                        loading={working}
                        onClick={() => execute(saveDraft, "Đã lưu bản nháp")}
                    >
                        Lưu nháp
                    </Button>
                    <Button
                        className="flex-1"
                        loading={working}
                        onClick={() =>
                            execute(async () => {
                                await saveDraft();
                                hydrate(
                                    await submitInspectionSelfDeclaration(
                                        targetId,
                                    ),
                                );
                            }, "Đã gửi biểu mẫu tới Tổ dân phố")
                        }
                    >
                        Gửi biểu mẫu
                    </Button>
                </Box>
            )}
        </PageLayout>
    );
};

export default InspectionSelfDeclarationPage;
