import React, { ReactElement, useContext } from 'react';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { QuestionView } from './QuestionView';
import { SelectNextQuestionView } from './SelectNextQuestionView';

export const QuizView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    return (
        <>
            {game.round ? <QuestionView game={game} round={game.round} /> : <SelectNextQuestionView />}
        </>
    );
};
