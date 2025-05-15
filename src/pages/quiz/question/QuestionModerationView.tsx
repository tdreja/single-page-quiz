import React, { ReactElement } from 'react';
import { RoundProps } from './RoundProps';
import { SharedProps } from '../SharedProps';
import { GameRound } from '../../../model/game/game';
import { Question } from '../../../model/quiz/question';
import { ImageMultipleChoiceQuestion, TextMultipleChoiceQuestion } from '../../../model/quiz/multiple-choice-question';
import { TextMultipleChoiceQuestionModerationView } from './multiple-choice/TextMultipleChoiceQuestionView';
import { ImageMultipleChoiceQuestionModerationView } from './multiple-choice/ImageMultipleChoiceQuestionView';
import { ActionQuestion } from '../../../model/quiz/action-question';
import { ActionQuestionModerationView } from './action/ActionQuestionView';
import { EstimateQuestion } from '../../../model/quiz/estimate-question';
import { EstimateQuestionModerationView } from './estimate/EstimateQuestionView';

function renderQuestion(round: GameRound, shared: boolean, question: Question): ReactElement | undefined {
    if (question instanceof TextMultipleChoiceQuestion) {
        return (<TextMultipleChoiceQuestionModerationView question={question} shared={shared} round={round} />);
    }
    if (question instanceof ImageMultipleChoiceQuestion) {
        return (<ImageMultipleChoiceQuestionModerationView question={question} shared={shared} round={round} />);
    }
    if (question instanceof ActionQuestion) {
        return (<ActionQuestionModerationView question={question} shared={shared} round={round} />);
    }
    if (question instanceof EstimateQuestion) {
        return (<EstimateQuestionModerationView question={question} shared={shared} round={round} />);
    }
    return undefined;
}

export const QuestionModerationView = ({ round, shared }: RoundProps & SharedProps): ReactElement => {
    return (renderQuestion(round, shared, round.question));
};
