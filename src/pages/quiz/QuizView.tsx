import React, { ReactElement, useContext } from 'react';
import { Game } from '../../model/game/game';
import { QuestionView } from './QuestionView';
import { SelectNextQuestionView } from './SelectNextQuestionView';
import { GameContext } from '../../components/common/GameContext';

export const QuizView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    return (
        <>
            {game.round ? <QuestionView game={game} round={game.round} /> : <SelectNextQuestionView />}
        </>
    );
};
