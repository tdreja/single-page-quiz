import React, { ReactElement } from 'react';
import { QuestionProps } from '../RoundProps';
import { SharedProps } from '../../SharedProps';
import { TextMultipleChoiceQuestion } from '../../../../model/quiz/multiple-choice-question';

export const TextMultipleChoiceQuestionParticipantsView = (
    { round, question }: QuestionProps<TextMultipleChoiceQuestion>,
): ReactElement => {
    return (<p>MultipleChoice</p>);
};

export const TextMultipleChoiceQuestionModerationView = (
    { round, question, shared }: QuestionProps<TextMultipleChoiceQuestion> & SharedProps,
): ReactElement => {
    return (<p>MultipleChoice</p>);
};
