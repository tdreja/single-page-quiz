import React, { ReactElement } from 'react';
import { GameRound } from '../../../model/game/game';
import { RoundProps } from './RoundProps';
import { ShowQuestionModeration } from './sidebar/ShowQuestionModeration';

export const QuestionPageForModeration = ({ round }: RoundProps): ReactElement => {
    return (
        <div className="d-flex gap-2">
            <div className="card flex-grow-1">
                <div className="card-header">
                    {`${round.inColumn} ${round.question.pointsForCompletion}`}
                </div>
            </div>
            <QuestionSidebar
                round={round}
                headline=""
                show-question={<ShowQuestionModeration />}
                buzzer-active={undefined}
                team-can-attempt={undefined}
                show-results={undefined}
            />
        </div>
    );
};
