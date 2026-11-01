import React, { ReactElement, useContext } from 'react';
import { I18N } from '../../i18n/I18N';
import {
    addChoice,
    CellPosition,
    changeQuestionType,
    EditorData,
    EditorProblemType,
    EditorQuestion,
    getQuestionAt,
    moveChoice,
    removeChoice,
    setQuestionAt,
    updateChoice,
    updateQuestionAt,
} from '../../model/quiz/editor';
import { QuestionType } from '../../model/quiz/question';
import { QuestionTypeIcons } from '../../components/common/QuestionTypeIcons';
import { MarkdownEditor } from './MarkdownEditor';
import { EditorChangeListener, problemsAt, QuestionEditorProps } from './EditorProps';
import { MoveRemoveControls } from './EditorControls';

const allQuestionTypes: QuestionType[] = [QuestionType.TEXT_MULTIPLE_CHOICE, QuestionType.ESTIMATE, QuestionType.ACTION];

interface SectionProps {
    data: EditorData,
    pos: CellPosition,
    question: EditorQuestion,
    onChange: EditorChangeListener,
    problemTypes: EditorProblemType[],
}

interface MultipleChoiceSectionProps extends SectionProps {
    shuffleChoices: boolean,
    onShuffleChoicesChange: (shuffle: boolean) => void,
}

function cellKey(pos: CellPosition): string {
    return `${pos.column}:${pos.row}`;
}

const MultipleChoiceSection = ({
    data, pos, question, onChange, problemTypes, shuffleChoices, onShuffleChoicesChange,
}: MultipleChoiceSectionProps): ReactElement => {
    const i18n = useContext(I18N);
    const labels = i18n.quizEditor;
    const update = (q: EditorQuestion, mergeKey?: string) => onChange(setQuestionAt(data, pos, q), mergeKey);
    const noCorrect = problemTypes.includes(EditorProblemType.NO_CORRECT_CHOICE);
    return (
        <div className="d-flex flex-column gap-2">
            <label className="form-label fw-bold mb-0">{labels.labelChoices}</label>
            {question.choices.map((choice, idx) => (
                <div key={choice.uid} className="d-flex gap-2 align-items-start">
                    <span className="badge text-bg-dark fs-6 mt-1" style={{ minWidth: '2rem' }}>
                        {String.fromCharCode('A'.charCodeAt(0) + idx)}
                    </span>
                    <MoveRemoveControls
                        orientation="vertical"
                        canMoveBackward={idx > 0}
                        canMoveForward={idx < question.choices.length - 1}
                        onMove={(offset) => update(moveChoice(question, idx, offset))}
                        onRemove={() => update(removeChoice(question, idx))}
                        moveBackwardTitle={labels.tooltipMoveUp}
                        moveForwardTitle={labels.tooltipMoveDown}
                        removeTitle={labels.tooltipRemoveChoice}
                    />
                    <button
                        type="button"
                        className={`btn btn-sm material-symbols-outlined ${choice.correct ? 'btn-success' : (noCorrect ? 'btn-outline-danger' : 'btn-outline-secondary')}`}
                        title={labels.tooltipToggleCorrect}
                        aria-pressed={choice.correct}
                        onClick={() => update(updateChoice(question, idx, (c) => ({ ...c, correct: !c.correct })))}
                    >
                        {choice.correct ? 'check_circle' : 'radio_button_unchecked'}
                    </button>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <MarkdownEditor
                            size="small"
                            value={choice.text}
                            invalid={choice.text.trim().length === 0}
                            onChange={(text) => update(updateChoice(question, idx, (c) => ({ ...c, text })), `choice:${choice.uid}`)}
                        />
                    </div>
                </div>
            ))}
            <div>
                <button
                    type="button"
                    className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                    onClick={() => update(addChoice(question))}
                >
                    <span className="material-symbols-outlined">add</span>
                    {labels.actionAddChoice}
                </button>
            </div>
            <div className="form-check">
                <input
                    id={`shuffle-choices-${cellKey(pos)}`}
                    type="checkbox"
                    className="form-check-input"
                    checked={shuffleChoices}
                    onChange={(ev) => onShuffleChoicesChange(ev.target.checked)}
                />
                <label className="form-check-label" htmlFor={`shuffle-choices-${cellKey(pos)}`}>
                    {labels.labelShuffleChoices}
                </label>
            </div>
        </div>
    );
};

const EstimateSection = ({ data, pos, question, onChange, problemTypes }: SectionProps): ReactElement => {
    const i18n = useContext(I18N);
    const labels = i18n.quizEditor;
    const invalidTarget = problemTypes.includes(EditorProblemType.INVALID_ESTIMATE);
    const key = cellKey(pos);
    return (
        <div className="d-flex flex-column gap-2">
            <div className="text-body-secondary d-flex gap-2 align-items-center">
                <span className="material-symbols-outlined">info</span>
                {labels.hintEstimateQuestion}
            </div>
            <div className="d-flex flex-wrap gap-3">
                <div>
                    <label className="form-label fw-bold" htmlFor={`estimate-target-${key}`}>{labels.labelEstimateTarget}</label>
                    <input
                        id={`estimate-target-${key}`}
                        type="number"
                        step="any"
                        className={`form-control ${invalidTarget ? 'is-invalid' : ''}`}
                        value={Number.isNaN(question.estimateTarget) ? '' : question.estimateTarget}
                        onChange={(ev) => onChange(
                            updateQuestionAt(data, pos, (q) => ({ ...q, estimateTarget: ev.target.valueAsNumber })),
                            `estimate-target:${key}`,
                        )}
                    />
                </div>
                <div>
                    <label className="form-label fw-bold" htmlFor={`estimate-unit-${key}`}>{labels.labelEstimateUnit}</label>
                    <input
                        id={`estimate-unit-${key}`}
                        className="form-control"
                        value={question.estimateUnit}
                        onChange={(ev) => onChange(
                            updateQuestionAt(data, pos, (q) => ({ ...q, estimateUnit: ev.target.value })),
                            `estimate-unit:${key}`,
                        )}
                    />
                </div>
            </div>
            {!invalidTarget && (
                <div>
                    <span className="text-body-secondary me-2">{labels.labelEstimatePreview}</span>
                    <span className="fw-bold">
                        {`${i18n.numberFormat.format(question.estimateTarget)}${question.estimateUnit.trim() ? ` ${question.estimateUnit.trim()}` : ''}`}
                    </span>
                </div>
            )}
        </div>
    );
};

const ActionSection = (): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <div className="text-body-secondary d-flex gap-2 align-items-center">
            <span className="material-symbols-outlined">timer</span>
            {i18n.quizEditor.hintActionQuestion}
        </div>
    );
};

/**
 * Editor for a single question, including the specific fields of each question type.
 */
export const QuestionEditor = ({
    data, problems, pos, shuffleChoices, onShuffleChoicesChange, onChange, onBack,
}: QuestionEditorProps): ReactElement | null => {
    const i18n = useContext(I18N);
    const labels = i18n.quizEditor;
    const question = getQuestionAt(data, pos);
    if (!question) {
        return null;
    }
    const column = data.columns[pos.column];
    const points = data.pointLevels[pos.row];
    const questionProblems = problemsAt(problems, pos);
    const problemTypes = questionProblems.map((p) => p.type);
    const sectionProps: SectionProps = { data, pos, question, onChange, problemTypes };

    return (
        <div className="card">
            <div className="card-header d-flex align-items-center gap-2">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                    onClick={() => {
                        onChange(setQuestionAt(data, pos, null));
                        onBack();
                    }}
                >
                    <span className="material-symbols-outlined">delete</span>
                    {labels.tooltipRemoveQuestion}
                </button>
                <span className="rounded-pill text-bg-dark ps-3 pe-3 pb-1 pt-1 fw-bold">
                    {column.columnName || '-'}
                </span>
                <span className="rounded-pill text-bg-primary ps-3 pe-3 pb-1 pt-1 fw-bold">
                    {Number.isNaN(points) ? '-' : points}
                </span>
            </div>
            <div className="card-body d-flex flex-column gap-4">
                {/* Question type */}
                <div>
                    <label className="form-label fw-bold d-block">{labels.labelQuestionType}</label>
                    <div className="btn-group" role="group" aria-label={labels.labelQuestionType}>
                        {allQuestionTypes.map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={`btn d-inline-flex align-items-center gap-2 ${question.questionType === type ? 'btn-primary' : 'btn-outline-primary'}`}
                                aria-pressed={question.questionType === type}
                                onClick={() => onChange(updateQuestionAt(data, pos, (q) => changeQuestionType(q, type)))}
                            >
                                <span className="material-symbols-outlined">{QuestionTypeIcons[type]}</span>
                                {i18n.questionTypes[type]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Text of the question */}
                <div>
                    <label className="form-label fw-bold">{labels.labelQuestionText}</label>
                    <MarkdownEditor
                        // New editor instance for each question
                        key={`text-${column.uid}-${pos.row}`}
                        size="large"
                        value={question.text}
                        invalid={problemTypes.includes(EditorProblemType.EMPTY_TEXT)}
                        onChange={(text) => onChange(updateQuestionAt(data, pos, (q) => ({ ...q, text })), `text:${cellKey(pos)}`)}
                    />
                </div>

                {/* Type specific content */}
                {question.questionType === QuestionType.TEXT_MULTIPLE_CHOICE && (
                    <MultipleChoiceSection
                        {...sectionProps}
                        shuffleChoices={shuffleChoices}
                        onShuffleChoicesChange={onShuffleChoicesChange}
                    />
                )}
                {question.questionType === QuestionType.ESTIMATE && <EstimateSection {...sectionProps} />}
                {question.questionType === QuestionType.ACTION && <ActionSection />}

                {questionProblems.length > 0 && (
                    <ul className="text-danger mb-0">
                        {questionProblems.map((p) => (
                            <li key={p.type}>{labels.problems[p.type]}</li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="card-footer d-flex">
                <button
                    type="button"
                    className="btn btn-primary d-inline-flex align-items-center gap-1"
                    onClick={onBack}
                >
                    <span className="material-symbols-outlined">check</span>
                    {labels.actionApplyAndBack}
                </button>
            </div>
        </div>
    );
};
