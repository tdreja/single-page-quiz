import React, { ReactElement, useCallback, useContext } from 'react';
import { asReactCss } from '../components/common/ReactCssUtils';
import { button } from '../components/common/ButtonColor';
import { TeamColor } from '../model/game/team';
import { TeamColorButton } from '../components/common/TeamColorButton';
import { QuestionCell, QuizCell, QuizTable } from '../model/base/table';
import { OptionalQuestion } from '../model/quiz/json';
import { BaseQuestion, QuestionType } from '../model/quiz/question';
import { I18N } from '../i18n/I18N';
import { QuestionTypeIcons } from '../components/common/QuestionTypeIcons';

export interface QuizTableProps<QUESTION extends OptionalQuestion> {
    table: QuizTable<QUESTION>,
    onCellClick?: (item: QUESTION) => void,
    showDetails: boolean,
    className?: string,
}

interface HeadlineCellProps {
    cell: QuizCell,
}

interface QuestionCellProps<QUESTION extends OptionalQuestion> {
    cell: QuestionCell<QUESTION>,
    rowIndex: number,
    rowCount: number,
    onCellClick?: (item: QUESTION) => void,
    showDetails: boolean,
}

function calcPercentage(rowIndex: number, rowCount: number) {
    return rowCount <= 1 ? 0 : Math.min(100, Math.max(0, (rowIndex / (rowCount - 1)) * 100));
}

function cellColor(percentage: number, outlined: boolean): React.CSSProperties {
    return button('#fff',
        `color-mix(in srgb, var(--question-matrix-end-color) ${percentage}%, var(--question-matrix-start-color))`,
        `color-mix(in srgb, var(--question-matrix-end-color-alpha) ${percentage}%, var(--question-matrix-start-color-alpha))`,
        outlined);
}

function pillColor(percentage: number): React.CSSProperties {
    return {
        backgroundColor: `color-mix(in srgb, var(--question-matrix-end-color) ${percentage}%, var(--question-matrix-start-color))`,
        color: '#fff',
        fontSize: '0.75em',
        fontStyle: 'italic',
    };
}

function QuestionCellView<QUESTION extends OptionalQuestion>({
    cell, rowIndex, rowCount, showDetails, onCellClick,
}: QuestionCellProps<QUESTION>): ReactElement {
    if (cell.question instanceof BaseQuestion && cell.question.completed) {
        return (
            <AnsweredQuestionCellView
                rowCount={rowCount}
                rowIndex={rowIndex}
                cell={cell as unknown as QuestionCell<BaseQuestion>}
                showDetails={showDetails}
            />
        );
    }
    return (
        <OpenQuestionCellView
            rowCount={rowCount}
            rowIndex={rowIndex}
            cell={cell}
            showDetails={showDetails}
            onCellClick={onCellClick}
        />
    );
};

function AnsweredQuestionCellView({
    cell, rowIndex, rowCount, showDetails,
}: QuestionCellProps<BaseQuestion>): ReactElement {
    const i18n = useContext(I18N);
    const percentage = calcPercentage(rowIndex, rowCount);
    const completed: Array<TeamColor> = cell.question ? Array.from(cell.question.completedBy) : [];
    const questionType: QuestionType = cell.question?.type || QuestionType.TEXT_MULTIPLE_CHOICE;
    return (
        <div
            className="btn disabled d-inline-grid align-items-center justify-content-between gap-2 btn-primary-outline"
            style={{ ...cellColor(percentage, true), opacity: 1, gridTemplateColumns: '1fr auto 1fr' }}
        >
            <div className="d-inline-flex gap-2">
                {
                    completed.map((team) => (
                        <TeamColorButton key={team} color={team} />
                    ))
                }
            </div>
            <span
                className="rounded-pill ps-3 pt-1 pb-1 pe-3"
                style={pillColor(percentage)}
            >
                {cell.label}
            </span>
            <div>
                {showDetails && (
                    <span
                        className="material-symbols-outlined"
                        title={i18n.questionTypes[questionType]}
                    >
                        {QuestionTypeIcons[questionType]}
                    </span>
                )}
            </div>
        </div>
    );
};

function OpenQuestionCellView<QUESTION extends OptionalQuestion>(
    { cell, rowIndex, rowCount, showDetails, onCellClick }: QuestionCellProps<QUESTION>,
): ReactElement {
    const i18n = useContext(I18N);
    const percentage = calcPercentage(rowIndex, rowCount);
    const listener = useCallback(() => {
        if (cell.question && onCellClick) {
            onCellClick(cell.question);
        }
    }, [cell, onCellClick]);

    const questionType: QuestionType = cell.question?.type || QuestionType.TEXT_MULTIPLE_CHOICE;
    return (
        <div
            className="btn fw-bold d-inline-grid align-items-center justify-content-between gap-2 btn-primary"
            style={{ ...cellColor(percentage, false), gridTemplateColumns: '1fr auto 1fr' }}
            onClick={listener}
        >
            <span />
            <span className="rounded-pill text-bg-light ps-3 pt-1 pb-1 pe-3">{cell.label}</span>
            <div>
                {showDetails && (
                    <span
                        className="material-symbols-outlined"
                        title={i18n.questionTypes[questionType]}
                    >
                        {QuestionTypeIcons[questionType]}
                    </span>
                )}
            </div>
        </div>
    );
};

function HeadlineView({ cell }: HeadlineCellProps): ReactElement {
    return (
        <div className="d-flex align-items-center justify-content-center">
            <span className="rounded-pill text-bg-dark ps-3 pe-3 pb-1 pt-1 fw-bold">
                {cell.label}
            </span>
        </div>
    );
}

export function QuizTableView<QUESTION extends OptionalQuestion>({
    table, showDetails, onCellClick, className,
}: QuizTableProps<QUESTION>): ReactElement {
    return (
        <div
            className={`d-grid w-100 gap-2 ${className || ''}`}
            style={{
                ...asReactCss({ '--row-count': `${table.rows.length}` }),
                gridTemplateColumns: `repeat(${table.columnNames.length}, 1fr)`,
            }}
        >
            {table.columnNames.map((headline) => (
                <HeadlineView
                    key={headline.key}
                    cell={headline}
                />
            ))}
            {table.rows.map((row, index) => row.map((cell) => (
                <QuestionCellView
                    key={cell.key}
                    cell={cell}
                    rowCount={table.rows.length}
                    rowIndex={index}
                    showDetails={showDetails}
                    onCellClick={onCellClick}
                />
            )))}
        </div>
    );
}
