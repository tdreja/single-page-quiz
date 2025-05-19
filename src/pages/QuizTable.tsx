import React, { ReactElement, useCallback } from 'react';
import { QuestionTable, QuestionTableCell } from '../model/game/game';
import { asReactCss } from '../components/common/ReactCssUtils';
import { button } from '../components/common/ButtonColor';
import { TeamColor } from '../model/game/team';
import { TeamColorButton } from '../components/common/TeamColorButton';

export interface QuizTableProps<ITEM> {
    table: QuestionTable<ITEM>,
    onCellClick?: (item: ITEM) => void,
    isCompleted?: (item: ITEM) => boolean,
    completedBy?: (item: ITEM) => Array<TeamColor>,
}

interface QuestionCellProps<ITEM> {
    cell: QuestionTableCell<ITEM>,
    rowIndex: number,
    rowCount: number,
    onCellClick?: (item: ITEM) => void,
    isCompleted?: (item: ITEM) => boolean,
    completedBy?: (item: ITEM) => Array<TeamColor>,
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

function QuestionCell<ITEM>({
    cell, rowIndex, rowCount, completedBy, isCompleted, onCellClick,
}: QuestionCellProps<ITEM>): ReactElement {
    if (cell.item && isCompleted && isCompleted(cell.item)) {
        return (
            <AnsweredQuestionCell
                rowCount={rowCount}
                rowIndex={rowIndex}
                cell={cell}
                completedBy={completedBy}
                isCompleted={isCompleted}
                onCellClick={onCellClick}
            />
        );
    }
    return (
        <OpenQuestionCell
            rowCount={rowCount}
            rowIndex={rowIndex}
            cell={cell}
            completedBy={completedBy}
            isCompleted={isCompleted}
            onCellClick={onCellClick}
        />
    );
};

function AnsweredQuestionCell<ITEM>({
    cell, rowIndex, rowCount, completedBy,
}: QuestionCellProps<ITEM>): ReactElement {
    const percentage = calcPercentage(rowIndex, rowCount);
    const completed: Array<TeamColor> = cell.item && completedBy ? completedBy(cell.item) : [];
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

            </div>
        </div>
    );
};

function OpenQuestionCell<ITEM>({ cell, rowIndex, rowCount, onCellClick }: QuestionCellProps<ITEM>): ReactElement {
    const percentage = calcPercentage(rowIndex, rowCount);
    const listener = useCallback(() => {
        if (cell.item && onCellClick) {
            onCellClick(cell.item);
        }
    }, [cell, onCellClick]);

    return (
        <div
            className="btn fw-bold d-inline-grid align-items-center justify-content-between gap-2 btn-primary"
            style={{ ...cellColor(percentage, false), gridTemplateColumns: '1fr auto 1fr' }}
            onClick={listener}
        >
            <span />
            <span className="rounded-pill text-bg-light ps-3 pt-1 pb-1 pe-3">{cell.label}</span>
            <span />
        </div>
    );
};

function Headline<ITEM>({ cell }: QuestionCellProps<ITEM>): ReactElement {
    return (
        <div className="d-flex align-items-center justify-content-center">
            <span className="rounded-pill text-bg-dark ps-3 pe-3 pb-1 pt-1 fw-bold">
                {cell.label}
            </span>
        </div>
    );
}

export function QuizTable<ITEM>({
    table, onCellClick, isCompleted, completedBy,
}: QuizTableProps<ITEM>): ReactElement {
    return (
        <div
            className="d-grid w-100 gap-2"
            style={{
                ...asReactCss({ '--row-count': `${table.rows.length}` }),
                gridTemplateColumns: `repeat(${table.headlines.length}, 1fr)`,
            }}
        >
            {table.headlines.map((headline) => (
                <Headline
                    key={headline.key}
                    cell={headline}
                    rowIndex={0}
                    rowCount={0}
                />
            ))}
            {table.rows.map((row, index) => row.map((cell) => (
                <QuestionCell
                    key={cell.key}
                    cell={cell}
                    rowCount={table.rows.length}
                    rowIndex={index}
                    onCellClick={onCellClick}
                    completedBy={completedBy}
                    isCompleted={isCompleted}
                />
            )))}
        </div>
    );
}
