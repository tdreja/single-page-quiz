import React, { ReactElement } from 'react';
import { GameRound } from '../../model/game/game';

interface Props {
    round: GameRound,
}

export const QuestionView = ({ round }: Props): ReactElement => {
    return (<p>Question</p>);
};
