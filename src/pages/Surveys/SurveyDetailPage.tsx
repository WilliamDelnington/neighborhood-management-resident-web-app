import React, { useEffect, useState } from "react";
import { Box, Text, useNavigate, useParams, useSnackbar } from "@components/ui";
import { PageLayout } from "@components/layout";
import { Button, Checkbox, Radio, TextArea } from "@components/customized";
import { ErrorState, LoadingState } from "@components/admin";
import { RequireAuth } from "@components/role";
import { useStore } from "@store";
import {
    fetchSurveyDetail,
    respondToSurvey,
    SurveyAnswerInput,
} from "@service/surveyApi";
import { Survey, SurveyQuestion } from "@dts";

type AnswerState = Record<
    string,
    { selectedOptions: string[]; otherText: string }
>;

const buildInitialAnswers = (survey: Survey): AnswerState => {
    const state: AnswerState = {};
    survey.questions.forEach(q => {
        state[q._id] = { selectedOptions: [], otherText: "" };
    });
    return state;
};

const SurveyDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useStore(state => state.token);

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setErrorMessage(null);
        fetchSurveyDetail(id)
            .then(setSurvey)
            .catch(err =>
                setErrorMessage(err?.message || "Không thể tải khảo sát"),
            )
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    return (
        <PageLayout id="survey-detail-page" title="Khảo sát">
            <Box p={4}>
                {loading && <LoadingState />}
                {!loading && errorMessage && (
                    <ErrorState label={errorMessage} onRetry={load} />
                )}

                {!loading && !errorMessage && survey && (
                    <>
                        <Box className="bg-white rounded-2xl p-4 shadow-sm">
                            <Text.Title size="small">{survey.title}</Text.Title>
                            {survey.description && (
                                <Text
                                    size="xSmall"
                                    className="text-text_2 mt-1"
                                >
                                    {survey.description}
                                </Text>
                            )}
                        </Box>

                        {token ? (
                            <RequireAuth>
                                <SurveyAnswerForm survey={survey} />
                            </RequireAuth>
                        ) : (
                            <Box mt={3}>
                                {survey.questions.map((question, index) => (
                                    <ReadOnlyQuestion
                                        key={question._id}
                                        index={index}
                                        question={question}
                                    />
                                ))}
                                <Box
                                    className="bg-white rounded-2xl p-4 shadow-sm mt-3"
                                    flex
                                    flexDirection="column"
                                    alignItems="center"
                                >
                                    <Text
                                        size="xSmall"
                                        className="text-text_2 mb-3 text-center"
                                    >
                                        Đăng nhập để trả lời khảo sát này
                                    </Text>
                                    <Button
                                        fullWidth
                                        onClick={() =>
                                            navigate("/login", {
                                                animate: true,
                                            })
                                        }
                                    >
                                        Đăng nhập
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </PageLayout>
    );
};

const ReadOnlyQuestion: React.FC<{
    index: number;
    question: SurveyQuestion;
}> = ({ index, question }) => (
    <Box className="bg-white rounded-2xl p-4 shadow-sm mt-3">
        <Text size="small" className="font-medium">
            {index + 1}. {question.question}
            {question.required && <Text className="text-red-500">{" *"}</Text>}
        </Text>
        <Box mt={2}>
            {question.type === "y_kien_khac" ? (
                <Text size="xSmall" className="text-text_2">
                    Câu hỏi ý kiến tự do
                </Text>
            ) : (
                (question.type === "dong_y_khong_dong_y"
                    ? ["Đồng ý", "Không đồng ý"]
                    : question.options
                ).map(option => (
                    <Text
                        key={option}
                        size="xSmall"
                        className="text-text_2 block mt-1"
                    >
                        • {option}
                    </Text>
                ))
            )}
        </Box>
    </Box>
);

const SurveyAnswerForm: React.FC<{ survey: Survey }> = ({ survey }) => {
    const { openSnackbar } = useSnackbar();
    const [answers, setAnswers] = useState<AnswerState>(() =>
        buildInitialAnswers(survey),
    );
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyAnswered, setAlreadyAnswered] = useState(false);

    const setSingleChoice = (questionId: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], selectedOptions: [value] },
        }));
    };

    const toggleMultiChoice = (questionId: string, value: string) => {
        setAnswers(prev => {
            const current = prev[questionId].selectedOptions;
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return {
                ...prev,
                [questionId]: { ...prev[questionId], selectedOptions: next },
            };
        });
    };

    const setOtherText = (questionId: string, text: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], otherText: text },
        }));
    };

    const validate = (): string | null => {
        for (const question of survey.questions) {
            if (!question.required) continue;
            const answer = answers[question._id];
            if (question.type === "y_kien_khac") {
                if (!answer.otherText.trim()) {
                    return `Vui lòng trả lời câu hỏi: "${question.question}"`;
                }
            } else if (answer.selectedOptions.length === 0) {
                return `Vui lòng trả lời câu hỏi: "${question.question}"`;
            }
        }
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            openSnackbar({ type: "error", text: validationError });
            return;
        }

        const payload: SurveyAnswerInput[] = survey.questions.map(question => {
            const answer = answers[question._id];
            if (question.type === "y_kien_khac") {
                return {
                    questionId: question._id,
                    selectedOptions: [],
                    otherText: answer.otherText.trim(),
                };
            }
            return {
                questionId: question._id,
                selectedOptions: answer.selectedOptions,
            };
        });

        try {
            setSubmitting(true);
            await respondToSurvey(survey._id, payload);
            setSubmitted(true);
            openSnackbar({
                type: "success",
                text: "Cảm ơn bạn đã trả lời khảo sát",
            });
        } catch (err: any) {
            const message: string = err?.message || "Có lỗi xảy ra";
            if (err?.status === 409 || message.includes("đã trả lời")) {
                setAlreadyAnswered(true);
                openSnackbar({ type: "warning", text: message });
            } else {
                openSnackbar({ type: "error", text: message });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const disabled = submitted || alreadyAnswered;

    return (
        <Box mt={3}>
            {survey.questions.map((question, index) => (
                <Box
                    key={question._id}
                    className="bg-white rounded-2xl p-4 shadow-sm mt-3"
                >
                    <Text size="small" className="font-medium">
                        {index + 1}. {question.question}
                        {question.required && (
                            <Text className="text-red-500">{" *"}</Text>
                        )}
                    </Text>

                    <Box mt={2}>
                        {question.type === "dong_y_khong_dong_y" &&
                            ["Đồng ý", "Không đồng ý"].map(option => (
                                <Box key={option} py={1}>
                                    <Radio
                                        checked={
                                            answers[question._id]
                                                .selectedOptions[0] === option
                                        }
                                        label={option}
                                        disabled={disabled}
                                        onChange={() =>
                                            setSingleChoice(
                                                question._id,
                                                option,
                                            )
                                        }
                                    />
                                </Box>
                            ))}

                        {question.type === "chon_mot" &&
                            question.options.map(option => (
                                <Box key={option} py={1}>
                                    <Radio
                                        checked={
                                            answers[question._id]
                                                .selectedOptions[0] === option
                                        }
                                        label={option}
                                        disabled={disabled}
                                        onChange={() =>
                                            setSingleChoice(
                                                question._id,
                                                option,
                                            )
                                        }
                                    />
                                </Box>
                            ))}

                        {question.type === "chon_nhieu" &&
                            question.options.map(option => (
                                <Box key={option} py={1}>
                                    <Checkbox
                                        checked={answers[
                                            question._id
                                        ].selectedOptions.includes(option)}
                                        label={option}
                                        value={option}
                                        disabled={disabled}
                                        onChange={() =>
                                            toggleMultiChoice(
                                                question._id,
                                                option,
                                            )
                                        }
                                    />
                                </Box>
                            ))}

                        {question.type === "y_kien_khac" && (
                            <TextArea
                                placeholder="Nhập ý kiến của bạn..."
                                value={answers[question._id].otherText}
                                disabled={disabled}
                                onChange={e =>
                                    setOtherText(question._id, e.target.value)
                                }
                                rows={3}
                            />
                        )}
                    </Box>
                </Box>
            ))}

            <Box mt={4}>
                {disabled ? (
                    <Box
                        className="bg-white rounded-2xl p-4 shadow-sm"
                        style={{ textAlign: "center" }}
                    >
                        <Text size="small" className="text-main font-medium">
                            {submitted
                                ? "Bạn đã gửi câu trả lời thành công"
                                : "Bạn đã trả lời khảo sát này rồi"}
                        </Text>
                    </Box>
                ) : (
                    <Button
                        fullWidth
                        loading={submitting}
                        onClick={handleSubmit}
                    >
                        Gửi câu trả lời
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default SurveyDetailPage;
