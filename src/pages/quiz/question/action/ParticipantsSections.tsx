import React, { ReactElement, useContext } from 'react';
import { SidebarSectionProps } from '../Sidebar';
import { QuestionProps } from '../RoundProps';
import { ActionQuestion } from '../../../../model/quiz/action-question';
import { TeamColorButton } from '../../../../components/common/TeamColorButton';
import { I18N } from '../../../../i18n/I18N';

export const ActionQuestionParticipantsSectionWaitForCompletion = (
    _: SidebarSectionProps,
): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <div className="card-body">
            <h6>{i18n.question.headlineCompleteActions}</h6>
            <span className="material-symbols-outlined badge rounded-pill text-bg-primary fs-2">
                person_play
            </span>
        </div>
    );
};
export const ActionQuestionParticipantsSectionShowCompletion = (
    { question }: SidebarSectionProps & QuestionProps<ActionQuestion>,
): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <div className="card-body">
            <h6>{question.completedBy.size === 0 ? i18n.question.noWinners : i18n.question.teamsWon}</h6>
            <div className="d-flex gap-2">
                {
                    Array.from(question.completedBy).map((team) => (
                        <TeamColorButton
                            key={`attempt-temp-${team}`}
                            color={team}
                        >
                            <span
                                className="rounded-pill text-bg-light ps-2 pe-2 fw-bold ms-2 me-2"
                            >
                                {i18n.teams[team]}
                            </span>
                            <span
                                className="rounded-pill text-bg-light ps-2 pe-2 ms-2 me-2"
                            >
                                {question.completionPoints.get(team) || 0}
                            </span>
                        </TeamColorButton>
                    ))
                }
            </div>
        </div>
    );
};
