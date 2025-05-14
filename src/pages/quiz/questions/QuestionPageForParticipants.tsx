import React, { ReactElement } from 'react';
import { QuestionSidebar } from './sidebar/QuestionSidebar';
import { RoundProps } from './RoundProps';
import { ShowQuestionParticipants } from './sidebar/ShowQuestionParticipants';

export const QuestionPageForParticipants = ({ round }: RoundProps): ReactElement => {
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
                show-question={<ShowQuestionParticipants round={round} />}
                buzzer-active={undefined}
                team-can-attempt={undefined}
                show-results={undefined}
            />
        </div>
    );
};
