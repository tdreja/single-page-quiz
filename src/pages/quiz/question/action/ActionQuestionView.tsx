import React, { ReactElement, useContext } from 'react';
import { QuestionProps } from '../RoundProps';
import { SharedProps } from '../../SharedProps';
import { ActionQuestion } from '../../../../model/quiz/action-question';
import { I18N } from '../../../../i18n/I18N';
import { Sidebar } from '../Sidebar';
import { RoundState } from '../../../../model/game/game';
import { ActionQuestionModerationSectionEditCompletion, ActionQuestionModerationSectionShowCompletion } from './ModerationSections';
import {
    ActionQuestionParticipantsSectionShowCompletion,
    ActionQuestionParticipantsSectionWaitForCompletion,
} from './ParticipantsSections';

export const ActionQuestionParticipantsView = (
    { round, question }: QuestionProps<ActionQuestion>,
): ReactElement => {
    const i18n = useContext(I18N);
    return (

        <div className="d-flex gap-2 min-height-50">
            <div className="card flex-grow-1">
                <div className="card-header">
                    {`${round.inColumn} ${round.question.pointsForCompletion}`}
                </div>
                <div className="card-body">
                    <h4 className="card-title pb-2">{question.text}</h4>
                </div>
            </div>
            {/* Sidebar */}
            <Sidebar headline={i18n.question.headlineStatus} round={round} className="min-width-15">
                <ActionQuestionParticipantsSectionWaitForCompletion
                    state={[RoundState.BUZZER_ACTIVE, RoundState.SHOW_QUESTION, RoundState.TEAM_CAN_ATTEMPT]}
                />
                <ActionQuestionParticipantsSectionShowCompletion
                    question={question}
                    round={round}
                    state={[RoundState.SHOW_RESULTS]}
                />
            </Sidebar>
        </div>
    );
};

export const ActionQuestionModerationView = (
    { round, question }: QuestionProps<ActionQuestion> & SharedProps,
): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <div className="d-flex gap-2 min-height-50">
            <div className="card flex-grow-1">
                <div className="card-header">
                    {`${round.inColumn} ${round.question.pointsForCompletion}`}
                </div>
                <div className="card-body">
                    <h4 className="card-title pb-2">{question.text}</h4>
                </div>
            </div>
            {/* Sidebar */}
            <Sidebar headline={i18n.question.headlineStatus} round={round} className="flex-grow-1 min-width-15">
                <ActionQuestionModerationSectionEditCompletion
                    round={round}
                    question={question}
                    state={[RoundState.BUZZER_ACTIVE, RoundState.SHOW_QUESTION, RoundState.TEAM_CAN_ATTEMPT]}
                />
                <ActionQuestionModerationSectionShowCompletion
                    question={question}
                    round={round}
                    state={[RoundState.SHOW_RESULTS]}
                />
            </Sidebar>
        </div>
    );
};
