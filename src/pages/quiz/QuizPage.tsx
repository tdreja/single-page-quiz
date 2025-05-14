import React, { ReactElement, useContext } from 'react';
import { Game, GameRound } from '../../model/game/game';
import { GameContext } from '../../components/common/GameContext';

interface Props {
    questionPage: (round: GameRound) => ReactElement,
    selectionPage: ReactElement,
}

export const QuizPage = ({ questionPage, selectionPage: overviewPage }: Props): ReactElement => {
    const game = useContext<Game>(GameContext);
    return (
        <>
            {
                game.round ? questionPage(game.round) : overviewPage
            }
        </>
    );
};
