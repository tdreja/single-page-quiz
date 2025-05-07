import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { GameRound, RoundState } from '../../model/game/game';
import { ImageMultipleChoiceQuestion, TextChoice, TextMultipleChoiceQuestion } from '../../model/quiz/multiple-choice-question';
import { Question } from '../../model/quiz/question';
import { ActionQuestion } from '../../model/quiz/action-question';
import { EstimateQuestion } from '../../model/quiz/estimate-question';
import { GameEventContext } from '../common/GameContext';
import { SelectFromMultipleChoiceEvent } from '../../events/question-event';
import { asReactCss } from '../common/ReactCssUtils';
import { TeamColorButton } from '../common/TeamColorButton';
import { TabContext } from '../common/TabContext';
import { ImageMultipleChoiceView, TextMultipleChoiceView } from './MultipleChoiceView';

interface RoundProps {
    round: GameRound,
}

export interface RoundAndItemProps<ITEM> {
    round: GameRound,
    item: ITEM,
}

const ModerationActionsView = ({ round }: RoundProps): ReactElement => {
    return (
        <div className="card">
            <div className="card-header">Actions</div>
            <div className="card-body">
                Test
            </div>
        </div>
    );
};

const ParticipantsActionsView = ({ round }: RoundProps): ReactElement => {
    return (
        <div className="card">
            <div className="card-header">Actions</div>
            <div className="card-body">
                Test
            </div>
        </div>
    );
};

const EstimateView = ({ round, item }: RoundAndItemProps<EstimateQuestion>): ReactElement => {
    return (<p>Estimate</p>);
};

const ActionView = ({ round, item }: RoundAndItemProps<ActionQuestion>): ReactElement => {
    return (<p>Action</p>);
};

export function questionView(round: GameRound): ReactElement {
    if (round.question instanceof TextMultipleChoiceQuestion) {
        return (<TextMultipleChoiceView item={round.question} round={round} />);
    }
    if (round.question instanceof ImageMultipleChoiceQuestion) {
        return (<ImageMultipleChoiceView item={round.question} round={round} />);
    }
    if (round.question instanceof EstimateQuestion) {
        return (<EstimateView item={round.question} round={round} />);
    }
    if (round.question instanceof ActionQuestion) {
        return (<ActionView item={round.question} round={round} />);
    }
    return (<p>Unknown question!</p>);
}

export const QuestionView = ({ round }: RoundProps): ReactElement => {
    const tabSettings = useContext(TabContext);
    return (
        <div className="d-flex gap-2">
            <div className="card flex-grow-1">
                <div className="card-header">
                    {`${round.inSectionName} ${round.question.pointsForCompletion}`}
                </div>
                {questionView(round)}
            </div>
            {
                tabSettings.settings.moderation
                    ? (
                        <ModerationActionsView round={round} />
                    )
                    : (
                        <ParticipantsActionsView round={round} />
                    )
            }

        </div>
    );
};
