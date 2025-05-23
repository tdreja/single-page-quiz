import React, { ReactElement, useContext } from 'react';
import { Game } from '../../model/game/game';
import { GameContext } from '../../components/common/GameContext';
import { QuestionSelectionPage } from './overview/QuestionSelectionPage';
import { QuestionParticipantsView } from './question/QuestionParticipantsView';

export const QuizParticipantsPage = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    return (
        <>
            {game.round ? <QuestionParticipantsView round={game.round} /> : <QuestionSelectionPage shared={true} />}
        </>
    );
};
