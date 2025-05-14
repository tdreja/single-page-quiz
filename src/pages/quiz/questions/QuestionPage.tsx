import React, { ReactElement } from 'react';
import { GameRound } from '../../../model/game/game';

interface Props {
    round: GameRound,
}

export const QuestionPage = ({ round }: Props): ReactElement => {
    return (<p>Test</p>);
};
