import { RoundProps } from '../RoundProps';
import { TextChoice } from '../../../../model/quiz/multiple-choice-question';
import React, { ReactElement, useContext } from 'react';
import { SharedProps } from '../../SharedProps';
import { GameEventContext } from '../../../../components/common/GameContext';
import { SelectFromMultipleChoiceEvent } from '../../../../events/question-event';
import { asReactCss } from '../../../../components/common/ReactCssUtils';
import { TeamColorButton } from '../../../../components/common/TeamColorButton';
import { GameRound, RoundState } from '../../../../model/game/game';

interface ChoicesProps extends RoundProps, SharedProps {
    choices: Array<TextChoice>,
}

interface ChoiceProps extends RoundProps, SharedProps {
    choice: TextChoice,
}

function badgeStyle(round: GameRound, choice: TextChoice, shared: boolean): string {
    if (round.question.completed) {
        return choice.correct ? 'text-bg-success' : 'text-bg-danger';
    }
    if (choice.selectedBy.size > 0) {
        return 'text-bg-secondary';
    }
    if (!shared) {
        return choice.correct ? 'text-bg-success' : 'text-bg-danger';
    }
    return 'text-bg-primary';
}

function buttonStyle(round: GameRound, choice: TextChoice, shared: boolean): string {
    const disabled: string = !shared && round.state !== RoundState.TEAM_CAN_ATTEMPT ? 'disabled' : '';
    if (round.question.completed) {
        return `btn-outline-secondary ${disabled}`;
    }
    if (choice.selectedBy.size > 0) {
        return `btn-outline-secondary ${disabled}`;
    }
    return `btn-outline-primary ${disabled}`;
}

const Choice = ({ round, choice, shared }: ChoiceProps): ReactElement => {
    const onGameEvent = useContext(GameEventContext);
    return (
        <div
            className={`d-inline-flex border rounded gap-2 p-2 btn align-items-baseline ${buttonStyle(round, choice, shared)}`}
            onClick={() => onGameEvent(new SelectFromMultipleChoiceEvent(choice.choiceId))}
            style={asReactCss({ '--bs-btn-color': '#000' })}
        >
            <h5 className={`badge mb-0 ${badgeStyle(round, choice, shared)}`}>{choice.choiceId}</h5>
            <h5 className="mb-0">{choice.text}</h5>
            {
                Array.from(choice.selectedBy).map((team) => (
                    <TeamColorButton key={`selected-by-${team}`} color={team} />
                ))
            }
        </div>
    );
};

export const TextChoices = ({ round, shared, choices }: ChoicesProps): ReactElement => {
    return (
        <div className="d-grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {
                choices.map((choice) => (
                    <Choice key={`choice-${choice.choiceId}`} round={round} shared={shared} choice={choice} />
                ))
            }
        </div>
    );
};
