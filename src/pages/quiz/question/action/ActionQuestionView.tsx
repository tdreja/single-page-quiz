import React, { ReactElement } from 'react';
import { QuestionProps } from '../RoundProps';
import { SharedProps } from '../../SharedProps';
import { ActionQuestion } from '../../../../model/quiz/action-question';

export const ActionQuestionParticipantsView = (
    { round, question }: QuestionProps<ActionQuestion>,
): ReactElement => {
    return (<p>MultipleChoice</p>);
};

export const ActionQuestionModerationView = (
    { round, question, shared }: QuestionProps<ActionQuestion> & SharedProps,
): ReactElement => {
    return (<p>MultipleChoice</p>);
};
