import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { RoundAndItemProps } from './QuestionView';
import { ImageMultipleChoiceQuestion, TextChoice, TextMultipleChoiceQuestion } from '../../model/quiz/multiple-choice-question';
import { GameEventContext } from '../common/GameContext';
import { TabContext } from '../common/TabContext';
import { RoundState } from '../../model/game/game';
import { SelectFromMultipleChoiceEvent } from '../../events/question-event';
import { asReactCss } from '../common/ReactCssUtils';
import { TeamColorButton } from '../common/TeamColorButton';

const ChoiceView = ({ round, item }: RoundAndItemProps<TextChoice>): ReactElement => {
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
            <h5 className={`badge mb-0 ${badgeStyle}`}>{item.choiceId}</h5>
            <h5 className="mb-0">{item.text}</h5>
            {
                Array.from(item.selectedBy).map((team) => (
                    <TeamColorButton key={`selected-by-${team}`} color={team} />
                ))
            }
        </div>
    );
};

export const TextMultipleChoiceView = ({ round, item }: RoundAndItemProps<TextMultipleChoiceQuestion>): ReactElement => {
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

export const ImageMultipleChoiceView = ({ round, item }: RoundAndItemProps<ImageMultipleChoiceQuestion>): ReactElement => {
    return (<p>Image</p>);
};
