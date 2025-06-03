import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Game, generateQuestionTable, isGameOver } from '../../../model/game/game';
import { Question } from '../../../model/quiz/question';
import { StartRoundEvent } from '../../../events/round-events';
import { TeamColor } from '../../../model/game/team';
import { I18N } from '../../../i18n/I18N';
import { GameContext, GameEventContext } from '../../../components/common/GameContext';
import { TeamColorButton } from '../../../components/common/TeamColorButton';
import { QuizTableProps, QuizTableView } from '../../QuizTable';
import { QuizTable } from '../../../model/base/table';
import { SharedProps } from '../SharedProps';

interface GameOver {
    winner: Array<TeamColor>,
}

function checkGameOver(game: Game): GameOver | null {
    if (isGameOver(game)) {
        let winners: Array<TeamColor> = [];
        let highestPoints = 1;
        for (const team of game.teams.values()) {
            if (team.points > highestPoints) {
                highestPoints = team.points;
                winners = [team.color];
            } else if (team.points === highestPoints) {
                winners.push(team.color);
            }
        }
        return {
            winner: winners,
        };
    }
    return null;
}

export const QuestionSelectionPage = ({ shared }: SharedProps): ReactElement => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);
    const onGameEvent = useContext(GameEventContext);
    const [table, setTable] = useState<QuizTable<Question>>(generateQuestionTable(game));
    const [selectingTeam, setSelectingTeam] = useState<TeamColor | null>(game.selectionOrder.length > 0 ? game.selectionOrder[0] : null);
    const [gameOver, setGameOver] = useState<GameOver | null>(checkGameOver(game));

    useEffect(() => {
        setTable(generateQuestionTable(game));
        setSelectingTeam(game.selectionOrder.length > 0 ? game.selectionOrder[0] : null);
        setGameOver(checkGameOver(game));
    }, [game]);

    const tableProps: QuizTableProps<Question> = {
        table,
        showDetails: !shared,
        onCellClick: (item) => onGameEvent(new StartRoundEvent(item.inColumn, item.pointsForCompletion)),
    };

    return (
        <div className="d-flex flex-column align-items-baseline gap-4">
            <div className="card w-100">
                <div className="card-header">{i18n.quiz.columns}</div>
                <QuizTableView {...tableProps} className="card-body" />
            </div>
            {
                /* Game over: show winner */
                gameOver && (
                    <div className="card">
                        <div className="card-header">{i18n.quiz.gameOverHeader}</div>
                        <div className="card-body d-flex flex-column align-items-center gap-2">
                            <h5 className="card-title">
                                { gameOver.winner.length > 0 ? i18n.quiz.gameOverWinner : i18n.quiz.gameOverNoWinner}
                            </h5>
                            {
                                gameOver.winner.map((win) => (
                                    <TeamColorButton key={win} color={win}>
                                        <span
                                            className="rounded-pill text-bg-light ps-2 pe-2 fw-bold ms-2 me-2"
                                        >
                                            {i18n.teams[win]}
                                        </span>
                                    </TeamColorButton>
                                ))
                            }
                        </div>
                    </div>
                )
            }
            {
                /* Next selecting team */
                !gameOver && (
                    <div className="card">
                        <div className="card-header">{i18n.quiz.nextTeamHeader}</div>
                        <div className="card-body d-flex flex-column align-items-center gap-2">
                            <h5 className="card-title">
                                {i18n.quiz.nextSelectingTeam}
                            </h5>
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
                )
            }
        </div>
    );
};
