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

interface Props {
    round: GameRound,
}

interface SubProps<ITEM> {
    round: GameRound,
    item: ITEM,
}

const ChoiceView = ({ round, item }: SubProps<TextChoice>): ReactElement => {
    const onGameEvent = useContext(GameEventContext);
    const tabSettings = useContext(TabContext);

    let choiceStyle: string = 'btn-outline-primary';
    let badgeStyle: string = 'text-bg-primary';
    if (tabSettings.settings.moderation && !tabSettings.settings.participants) {
        badgeStyle = item.correct ? 'text-bg-success' : 'text-bg-danger';
    }
    if (round.state !== RoundState.TEAM_CAN_ATTEMPT) {
        choiceStyle += 'disabled';
    }

    return (
        <div
            className={`d-inline-flex border rounded gap-2 p-2 btn align-items-baseline ${choiceStyle}`}
            onClick={() => onGameEvent(new SelectFromMultipleChoiceEvent(item.choiceId))}
            style={asReactCss({ '--bs-btn-color': '#000' })}
        >
            <h5 className={`badge ${badgeStyle}`}>{item.choiceId}</h5>
            <h5>{item.text}</h5>
            {
                Array.from(item.selectedBy).map((team) => (
                    <TeamColorButton key={`selected-by-${team}`} color={team} />
                ))
            }
        </div>
    );
};

const TextMultipleChoiceView = ({ round, item }: SubProps<TextMultipleChoiceQuestion>): ReactElement => {
    return (
        <div className="card-body">
            <h4 className="card-title pb-2">{item.text}</h4>
            <div className="d-grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {
                    item.choicesSorted.map((choice) => (
                        <ChoiceView key={`choice-${choice.choiceId}`} item={choice} round={round} />
                    ))
                }
            </div>
        </div>
    );
};

const ImageMultipleChoiceView = ({ round, item }: SubProps<ImageMultipleChoiceQuestion>): ReactElement => {
    return (<p>Image</p>);
};

const EstimateView = ({ round, item }: SubProps<EstimateQuestion>): ReactElement => {
    return (<p>Estimate</p>);
};

const ActionView = ({ round, item }: SubProps<ActionQuestion>): ReactElement => {
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

export const QuestionView = ({ round }: Props): ReactElement => {
    return (
        <div className="card">
            <div className="card-header">
                {`${round.inSectionName} ${round.question.pointsForCompletion}`}
            </div>
            {questionView(round)}
        </div>
    );
};
