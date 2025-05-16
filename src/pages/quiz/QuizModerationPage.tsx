import React, { ReactElement, useContext } from 'react';
import { SharedProps } from './SharedProps';
import { Game } from '../../model/game/game';
import { GameContext } from '../../components/common/GameContext';
import { QuestionSelectionPage } from './overview/QuestionSelectionPage';
import { QuestionModerationView } from './question/QuestionModerationView';

export const QuizModerationPage = ({ shared }: SharedProps): ReactElement => {
    const game = useContext<Game>(GameContext);
    return (
        <>
            {game.round ? <QuestionModerationView round={game.round} shared={shared} /> : <QuestionSelectionPage />}
        </>
    );
};
