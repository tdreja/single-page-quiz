import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { RoundAndItemProps } from './QuestionView';
import { ImageMultipleChoiceQuestion, TextChoice, TextMultipleChoiceQuestion } from '../../model/quiz/multiple-choice-question';
import { GameRound, RoundState } from '../../model/game/game';
import { SelectFromMultipleChoiceEvent } from '../../events/question-event';
import { EditTabSettings, TabContext } from '../../components/mode/TabContext';
import { GameEventContext } from '../../components/common/GameContext';
import { TeamColorButton } from '../../components/common/TeamColorButton';
import { asReactCss } from '../../components/common/ReactCssUtils';

function badgeStyle(round: GameRound, item: TextChoice, tabSettings: EditTabSettings): string {
    if (round.question.completed) {
        return item.correct ? 'text-bg-success' : 'text-bg-danger';
    }
    if (item.selectedBy.size > 0) {
        return 'text-bg-secondary';
    }
    if (tabSettings.settings.moderation && !tabSettings.settings.participants) {
        return item.correct ? 'text-bg-success' : 'text-bg-danger';
    }
    return 'text-bg-primary';
}

function buttonStyle(round: GameRound, item: TextChoice, tabSettings: EditTabSettings): string {
    const disabled: string = !tabSettings.settings.participants && round.state !== RoundState.TEAM_CAN_ATTEMPT ? 'disabled' : '';
    if (round.question.completed) {
        return `btn-outline-secondary ${disabled}`;
    }
    if (item.selectedBy.size > 0) {
        return `btn-outline-secondary ${disabled}`;
    }
    return `btn-outline-primary ${disabled}`;
}

const ChoiceView = ({ round, item }: RoundAndItemProps<TextChoice>): ReactElement => {
    const onGameEvent = useContext(GameEventContext);
    const tabSettings = useContext(TabContext);

    return (
        <div
            className={`d-inline-flex border rounded gap-2 p-2 btn align-items-baseline ${buttonStyle(round, item, tabSettings)}`}
            onClick={() => onGameEvent(new SelectFromMultipleChoiceEvent(item.choiceId))}
            style={asReactCss({ '--bs-btn-color': '#000' })}
        >
            <h5 className={`badge mb-0 ${badgeStyle(round, item, tabSettings)}`}>{item.choiceId}</h5>
            <h5 className="mb-0">{item.text}</h5>
            {
                Array.from(item.selectedBy).map((team) => (
                    <TeamColorButton key={`selected-by-${team}`} color={team} />
                ))
            }
        </div>
    );
};

export const TextMultipleChoiceView = ({ game, round, item }: RoundAndItemProps<TextMultipleChoiceQuestion>): ReactElement => {
    return (
        <div className="card-body">
            <h4 className="card-title pb-2">{item.text}</h4>
            <div className="d-grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {
                    item.choicesSorted.map((choice) => (
                        <ChoiceView key={`choice-${choice.choiceId}`} game={game} item={choice} round={round} />
                    ))
                }
            </div>
        </div>
    );
};

export const ImageMultipleChoiceView = ({ game, round, item }: RoundAndItemProps<ImageMultipleChoiceQuestion>): ReactElement => {
    return (<p>Image</p>);
};
