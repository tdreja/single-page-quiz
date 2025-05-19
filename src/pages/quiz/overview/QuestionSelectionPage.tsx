import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Game, generateQuestionTable, QuestionTable, QuestionTableCell } from '../../../model/game/game';
import { Question } from '../../../model/quiz/question';
import { StartRoundEvent } from '../../../events/round-events';
import { TeamColor } from '../../../model/game/team';
import { I18N } from '../../../i18n/I18N';
import { GameContext, GameEventContext } from '../../../components/common/GameContext';
import { TeamColorButton } from '../../../components/common/TeamColorButton';
import { asReactCss } from '../../../components/common/ReactCssUtils';
import { button } from '../../../components/common/ButtonColor';

interface Props {
    matrix: QuestionTableCell<Question>,
}

const MatrixItem = ({ matrix }: Props): ReactElement => {
    const onGameEvent = useContext(GameEventContext);
    const onStartRound = useCallback(() => {
        if (matrix.item && !matrix.item.completed) {
            onGameEvent(new StartRoundEvent(matrix.item.inColumn, matrix.item.pointsForCompletion));
        }
    }, [matrix, onGameEvent]);

    return (
        <div className="d-inline-flex w-100 gap-2 align-items-center">
            {
                matrix.item
                    ? (
                        <>
                            <span className={`d-inline-flex justify-content-center gap-2 ${matrix.item.completed ? 'ps-2' : 'btn btn-primary'}`} style={{ opacity: '1' }} onClick={onStartRound}>
                                {matrix.item.pointsForCompletion}
                            </span>
                            {Array.from(matrix.item.completedBy).map((team) => (<TeamColorButton key={team} color={team} />))}
                        </>
                    )
                    : (
                        <span className="btn btn-outline-dark ms-2">{matrix.inSection}</span>
                    )
            }
        </div>
    );
};

interface QuestionCellProps {
    cell: QuestionTableCell<Question>,
    rowIndex: number,
    rowCount: number,
}

function questionColor(rowIndex: number, rowCount: number, outlined: boolean): React.CSSProperties {
    const percentage = rowCount === 0 ? 0 : Math.min(100, Math.max(0, (rowIndex / rowCount) * 100));
    return button('#fff',
        `color-mix(in srgb, red ${percentage}%, blue)`,
        `color-mix(in srgb, blue ${percentage}%, red)`,
        outlined);
}

const QuestionCell = ({ cell, rowIndex, rowCount }: QuestionCellProps): ReactElement => {
    let outlined: boolean;
    if (cell.item) {
        outlined = cell.item.completed;
    } else {
        outlined = true;
    }
    const completed: Array<TeamColor> = cell.item ? Array.from(cell.item.completedBy) : [];
    return (
        <div
            className={`btn fw-bold d-inline-flex align-items-center justify-content-center gap-2 ${outlined ? 'btn-primary-outline' : 'btn-primary'}`}
            style={questionColor(rowIndex, rowCount, outlined)}
        >
            {
                completed.map((team) => (<TeamColorButton key={team} color={team} />))
            }
            {cell.label}
            {
                completed.map((team) => (<span key={`empty-${team}`} />))
            }
        </div>
    );
};

export const QuestionSelectionPage = (): ReactElement => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);
    const [table, setTable] = useState<QuestionTable<Question>>(
        generateQuestionTable(game, (_, question) => question),
    );
    const [selectingTeam, setSelectingTeam] = useState<TeamColor | null>(game.selectionOrder.length > 0 ? game.selectionOrder[0] : null);

    useEffect(() => {
        setTable(generateQuestionTable(game, (_, question) => question));
        setSelectingTeam(game.selectionOrder.length > 0 ? game.selectionOrder[0] : null);
    }, [game]);

    return (
        <div className="d-flex flex-wrap gap-2">
            <div
                className="d-grid w-100 gap-2"
                style={{
                    ...asReactCss({ '--row-count': `${table.rows.length}` }),
                    gridTemplateColumns: `repeat(${table.headlines.length}, 1fr)` }}
            >
                {
                    table.headlines.map((headline) => (
                        <span key={headline.key}>{headline.label}</span>
                    ))
                }
                {
                    table.rows.map((row, index) => row.map((cell) => (
                        <QuestionCell
                            key={cell.key}
                            cell={cell}
                            rowCount={table.rows.length}
                            rowIndex={index}
                        />
                    )))
                }
            </div>
            <table className="table table-striped table-hover align-middle flex-grow-1">
                <thead>
                    <tr>
                        {
                            table.headlines.map((cell) => (
                                <th key={cell.key} className="ps-2">{cell.label}</th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody className="table-group-divider">
                    {
                        table.rows.map((row, index) => (
                            <tr key={`row-${index}`}>
                                {
                                    row.map((item) => (
                                        <td key={item.key}>
                                            <MatrixItem matrix={item} />
                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <div>
                <h5>{i18n.quiz.nextSelectingTeam}</h5>
                { selectingTeam && (
                    <TeamColorButton color={selectingTeam}>
                        <span
                            className="rounded-pill text-bg-light ps-2 pe-2 fw-bold ms-2 me-2"
                        >
                            {i18n.teams[selectingTeam]}
                        </span>
                    </TeamColorButton>
                )}
            </div>
        </div>
    );
};
