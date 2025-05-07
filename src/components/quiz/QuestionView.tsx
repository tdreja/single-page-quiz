import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Game, GameRound, RoundState } from '../../model/game/game';
import { ImageMultipleChoiceQuestion, TextChoice, TextMultipleChoiceQuestion } from '../../model/quiz/multiple-choice-question';
import { Question } from '../../model/quiz/question';
import { ActionQuestion } from '../../model/quiz/action-question';
import { EstimateQuestion } from '../../model/quiz/estimate-question';
import { GameContext, GameEventContext, GameEventListener } from '../common/GameContext';
import { SelectFromMultipleChoiceEvent } from '../../events/question-event';
import { asReactCss } from '../common/ReactCssUtils';
import { TeamColorButton } from '../common/TeamColorButton';
import { TabContext } from '../common/TabContext';
import { ImageMultipleChoiceView, TextMultipleChoiceView } from './MultipleChoiceView';
import { sortTeamsByColor, Team } from '../../model/game/team';
import { ActivateBuzzerEvent, CloseRoundEvent, RequestAttemptEvent } from '../../events/round-events';

interface RoundProps {
    round: GameRound,
}

export interface RoundAndItemProps<ITEM> {
    round: GameRound,
    item: ITEM,
}

function attemptButtons(game: Game, round: GameRound, onGameEvent: GameEventListener): ReactElement {
    return (
        <div className="d-flex gap-1">
            {
                Array.from(game.teams.values())
                    .filter((team) => !round.teamsAlreadyAttempted.has(team.color))
                    .sort(sortTeamsByColor)
                    .map((team) => (
                        <TeamColorButton
                            color={team.color}
                            key={`select-team-${team.color}`}
                            onClick={() => onGameEvent(new RequestAttemptEvent(team.color))}
                            className="material-symbols-outlined"
                        >
                            group
                        </TeamColorButton>
                    ))
            }
        </div>
    );
}

function moderation(game: Game, round: GameRound, onGameEvent: GameEventListener): ReactElement {
    switch (round.state) {
        case RoundState.SHOW_QUESTION:
            return (
                <>
                    <h6>Buzzer disabled</h6>
                    <span
                        className="btn btn-primary"
                        onClick={() => onGameEvent(new ActivateBuzzerEvent())}
                    >
                        Activate Buzzer
                    </span>
                    <h6>Which team wants to attempt?</h6>
                    {attemptButtons(game, round, onGameEvent)}
                </>
            );
        case RoundState.BUZZER_ACTIVE:
            return (
                <>
                    <h6>Buzzer active</h6>
                    <h6>Which team wants to attempt?</h6>
                    {attemptButtons(game, round, onGameEvent)}
                </>
            );
        case RoundState.TEAM_CAN_ATTEMPT:
            return (
                <>
                    <h6>Team can attempt</h6>
                    {
                        Array.from(round.attemptingTeams)
                            .map((team) => (
                                <p key={`attempt-temp-${team}`}>{team}</p>
                            ))
                    }
                </>
            );
        case RoundState.SHOW_RESULTS:
            return (
                <>
                    <h6>Question complete</h6>
                    <span className="btn btn-primary" onClick={() => onGameEvent(new CloseRoundEvent())}>Close question</span>
                </>
            );
        default:
            return (<p>Unknown</p>);
    }
}

const ActionsView = ({ round }: RoundProps): ReactElement => {
    const tabSettings = useContext(TabContext);
    const game = useContext(GameContext);
    const onGameEvent = useContext(GameEventContext);
    return (
        <div className="card">
            <div className="card-header">Actions</div>
            <div className="card-body">
                {tabSettings.settings.moderation ? moderation(game, round, onGameEvent) : (<p>Test</p>)}
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
    return (
        <div className="d-flex gap-2">
            <div className="card flex-grow-1">
                <div className="card-header">
                    {`${round.inSectionName} ${round.question.pointsForCompletion}`}
                </div>
                {questionView(round)}
            </div>
            <ActionsView round={round} />
        </div>
    );
};
