import React, { ReactElement } from 'react';
import { RoundProps } from './RoundProps';
import { GameRound } from '../../../model/game/game';
import { Question } from '../../../model/quiz/question';
import { ImageMultipleChoiceQuestion, TextMultipleChoiceQuestion } from '../../../model/quiz/multiple-choice-question';
import { TextMultipleChoiceQuestionParticipantsView } from './multiple-choice/TextMultipleChoiceQuestionView';
import { ImageMultipleChoiceQuestionParticipantsView } from './multiple-choice/ImageMultipleChoiceQuestionView';
import { ActionQuestion } from '../../../model/quiz/action-question';
import { ActionQuestionParticipantsView } from './action/ActionQuestionView';
import { EstimateQuestion } from '../../../model/quiz/estimate-question';
import { EstimateQuestionParticipantsView } from './estimate/EstimateQuestionView';

function renderQuestion(round: GameRound, question: Question): ReactElement | undefined {
    if (question instanceof TextMultipleChoiceQuestion) {
        return (<TextMultipleChoiceQuestionParticipantsView question={question} round={round} />);
    }
    if (question instanceof ImageMultipleChoiceQuestion) {
        return (<ImageMultipleChoiceQuestionParticipantsView question={question} round={round} />);
    }
    if (question instanceof ActionQuestion) {
        return (<ActionQuestionParticipantsView question={question} round={round} />);
    }
    if (question instanceof EstimateQuestion) {
        return (<EstimateQuestionParticipantsView question={question} round={round} />);
    }
    return undefined;
}

export const QuestionParticipantsView = ({ round }: RoundProps): ReactElement => {
    return (renderQuestion(round, round.question));
};
