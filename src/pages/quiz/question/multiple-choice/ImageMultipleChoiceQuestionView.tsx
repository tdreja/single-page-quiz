import React, { ReactElement } from 'react';
import { QuestionProps } from '../RoundProps';
import { SharedProps } from '../../SharedProps';
import { ImageMultipleChoiceQuestion } from '../../../../model/quiz/multiple-choice-question';

export const ImageMultipleChoiceQuestionParticipantsView = (
    { round, question }: QuestionProps<ImageMultipleChoiceQuestion>,
): ReactElement => {
    return (<p>MultipleChoice</p>);
};

export const ImageMultipleChoiceQuestionModerationView = (
    { round, question, shared }: QuestionProps<ImageMultipleChoiceQuestion> & SharedProps,
): ReactElement => {
    return (<p>MultipleChoice</p>);
};
