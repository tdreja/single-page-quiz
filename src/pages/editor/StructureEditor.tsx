import React, { ReactElement, useContext } from 'react';
import { I18N } from '../../i18n/I18N';
import {
    addColumn,
    addPointLevel,
    changePointLevel,
    EditorQuestion,
    emptyQuestion,
    moveColumn,
    moveRow,
    removeColumn,
    removePointLevel,
    renameColumn,
    setQuestionAt,
    suggestNextPointLevel,
} from '../../model/quiz/editor';
import { QuestionType } from '../../model/quiz/question';
import { QuestionTypeIcons } from '../../components/common/QuestionTypeIcons';
import { problemsAt, StructureEditorProps } from './EditorProps';
import { IconButton, MoveRemoveControls } from './EditorControls';

const allQuestionTypes: QuestionType[] = [QuestionType.TEXT_MULTIPLE_CHOICE, QuestionType.ESTIMATE, QuestionType.ACTION];

/**
 * Very rough plain-text preview of a markdown text for the overview
 */
function previewText(question: EditorQuestion): string {
    const firstLine = question.text
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '🖼')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[#*_`>~]/g, '')
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.length > 0) || '';
    return firstLine.length > 60 ? `${firstLine.substring(0, 57)}...` : firstLine;
}

/**
 * Overview of the quiz: Categories as columns, points levels as rows, questions as cells.
 */
export const StructureEditor = ({ data, problems, onChange, onSelect }: StructureEditorProps): ReactElement => {
    const i18n = useContext(I18N);
    const labels = i18n.quizEditor;
    const columnCount = data.columns.length;
    const rowCount = data.pointLevels.length;

    return (
        <div className="card">
            <div
                className="card-body d-grid gap-2 quiz-editor-grid"
                style={{ gridTemplateColumns: `max-content repeat(${columnCount}, minmax(12rem, 20rem)) max-content` }}
            >
                {/* Headline: Categories */}
                <div className="d-flex align-items-end justify-content-end small text-body-secondary fw-bold pb-2">{labels.labelPoints}</div>
                {data.columns.map((column, columnIdx) => {
                    const invalid = problemsAt(problems, { column: columnIdx }).length > 0;
                    return (
                        <div key={column.uid} className="d-flex gap-1">
                            <MoveRemoveControls
                                orientation="horizontal"
                                canMoveBackward={columnIdx > 0}
                                canMoveForward={columnIdx < columnCount - 1}
                                onMove={(offset) => onChange(moveColumn(data, columnIdx, offset))}
                                onRemove={() => onChange(removeColumn(data, columnIdx))}
                                moveBackwardTitle={labels.tooltipMoveLeft}
                                moveForwardTitle={labels.tooltipMoveRight}
                                removeTitle={labels.tooltipRemoveColumn}
                            />
                            <input
                                className={`form-control fw-bold text-center ${invalid ? 'is-invalid' : ''}`}
                                value={column.columnName}
                                placeholder={labels.labelColumnName}
                                aria-label={labels.labelColumnName}
                                onChange={(ev) => onChange(renameColumn(data, columnIdx, ev.target.value), `column-name:${column.uid}`)}
                            />
                        </div>
                    );
                })}
                <div className="d-flex align-items-end">
                    <button
                        type="button"
                        className="btn btn-outline-primary d-inline-flex align-items-center gap-1 text-nowrap"
                        onClick={() => onChange(addColumn(data, `${labels.labelNewColumn} ${columnCount + 1}`))}
                    >
                        <span className="material-symbols-outlined">add</span>
                        {labels.actionAddColumn}
                    </button>
                </div>

                {/* Rows: Points level and questions */}
                {data.pointLevels.map((points, row) => {
                    const invalidPoints = problemsAt(problems, { row }).length > 0;
                    return (
                        <React.Fragment key={`row-${row}`}>
                            <div className="d-flex gap-1 align-items-center">
                                <MoveRemoveControls
                                    orientation="vertical"
                                    canMoveBackward={row > 0}
                                    canMoveForward={row < rowCount - 1}
                                    onMove={(offset) => onChange(moveRow(data, row, offset))}
                                    onRemove={() => onChange(removePointLevel(data, row))}
                                    moveBackwardTitle={labels.tooltipMoveUp}
                                    moveForwardTitle={labels.tooltipMoveDown}
                                    removeTitle={labels.tooltipRemoveRow}
                                />
                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    className={`form-control text-center quiz-editor-points ${invalidPoints ? 'is-invalid' : ''}`}
                                    value={Number.isNaN(points) ? '' : points}
                                    aria-label={labels.labelPoints}
                                    onChange={(ev) => onChange(changePointLevel(data, row, ev.target.valueAsNumber), `points:${row}`)}
                                />
                            </div>
                            {data.columns.map((column, columnIdx) => {
                                const question = column.questions[row];
                                const pos = { column: columnIdx, row };
                                if (!question) {
                                    return (
                                        <div
                                            key={`${column.uid}-${row}`}
                                            className="quiz-editor-cell quiz-editor-cell-empty rounded d-flex flex-column align-items-center justify-content-center gap-1 p-2"
                                        >
                                            <span className="small text-body-secondary">{labels.actionAddQuestion}</span>
                                            <div className="d-flex gap-1">
                                                {allQuestionTypes.map((type) => (
                                                    <IconButton
                                                        key={type}
                                                        icon={QuestionTypeIcons[type]}
                                                        title={i18n.questionTypes[type]}
                                                        className="btn-outline-primary"
                                                        onClick={() => {
                                                            onChange(setQuestionAt(data, pos, emptyQuestion(type)));
                                                            onSelect(pos);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                const invalid = problemsAt(problems, pos).length > 0;
                                const preview = previewText(question);
                                return (
                                    <button
                                        key={`${column.uid}-${row}`}
                                        type="button"
                                        className={`quiz-editor-cell btn text-start d-flex flex-column gap-1 p-2 ${invalid ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                                        title={labels.tooltipEditQuestion}
                                        onClick={() => onSelect(pos)}
                                    >
                                        <span className="d-flex align-items-center gap-1 small fw-bold">
                                            <span className="material-symbols-outlined">{QuestionTypeIcons[question.questionType]}</span>
                                            {i18n.questionTypes[question.questionType]}
                                            {invalid && <span className="material-symbols-outlined ms-auto">error</span>}
                                        </span>
                                        <span className={`small ${preview ? '' : 'fst-italic opacity-50'}`}>
                                            {preview || labels.problems['empty-text']}
                                        </span>
                                    </button>
                                );
                            })}
                            <div />
                        </React.Fragment>
                    );
                })}

                {/* Add another row */}
                <div>
                    <button
                        type="button"
                        className="btn btn-outline-primary d-inline-flex align-items-center gap-1 w-100 justify-content-center"
                        onClick={() => onChange(addPointLevel(data, suggestNextPointLevel(data)))}
                    >
                        <span className="material-symbols-outlined">add</span>
                        {labels.actionAddRow}
                    </button>
                </div>
            </div>
            {columnCount === 0 && rowCount === 0 && (
                <div className="card-footer text-body-secondary">{labels.hintEmptyQuiz}</div>
            )}
        </div>
    );
};
