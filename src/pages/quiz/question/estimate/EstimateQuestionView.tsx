import React, { ReactElement } from 'react';
import { QuestionProps } from '../RoundProps';
import { SharedProps } from '../../SharedProps';
import { EstimateQuestion } from '../../../../model/quiz/estimate-question';

export const EstimateQuestionParticipantsView = (
    { round, question }: QuestionProps<EstimateQuestion>,
): ReactElement => {
    return (<p>MultipleChoice</p>);
};

export const EstimateQuestionModerationView = (
    { round, question, shared }: QuestionProps<EstimateQuestion> & SharedProps,
): ReactElement => {
    return (<p>MultipleChoice</p>);
};
