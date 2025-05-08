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
import { sortTeamsByColor, Team, TeamColor } from '../../model/game/team';
import { ActivateBuzzerEvent, CloseRoundEvent, RequestAttemptEvent, SkipAttemptEvent } from '../../events/round-events';
import { I18N, Labels } from '../../i18n/I18N';
import { TimeInfo, Timer } from '../common/Timer';

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

function moderation(game: Game, round: GameRound, onGameEvent: GameEventListener, i18n: Labels): ReactElement {
    switch (round.state) {
        case RoundState.SHOW_QUESTION:
            return (
                <>
                    <div className="card-body">
                        <h6>{i18n.question.stateShowQuestion}</h6>
                        <span
                            className="btn btn-primary"
                            onClick={() => onGameEvent(new ActivateBuzzerEvent())}
                        >
                            {i18n.question.actionActivateBuzzer}
                        </span>
                    </div>
                    <div className="card-body">
                        <h6>{i18n.question.headlineNextAttempt}</h6>
                        {attemptButtons(game, round, onGameEvent)}
                    </div>
                </>
            );
        case RoundState.BUZZER_ACTIVE:
            return (
                <>
                    <div className="card-body">
                        <h6>{i18n.question.stateBuzzerEnabled}</h6>
                    </div>
                    <div className="card-body">
                        <h6>{i18n.question.headlineNextAttempt}</h6>
                        {attemptButtons(game, round, onGameEvent)}
                    </div>
                </>
            );
        case RoundState.TEAM_CAN_ATTEMPT:
            return (
                <>
                    <div className="card-body">
                        <h6>{i18n.question.stateTeamCanAttempt}</h6>
                        {
                            Array.from(round.attemptingTeams)
                                .map((team) => (
                                    <TeamColorButton
                                        key={`attempt-temp-${team}`}
                                        color={team}
                                        className="material-symbols-outlined"
                                    >
                                        group
                                    </TeamColorButton>
                                ))
                        }
                    </div>
                    <div className="card-body">
                        <h6>{i18n.question.actionSkipAttempt}</h6>
                        <span className="btn btn-outline-warning" onClick={() => onGameEvent(new SkipAttemptEvent())}>
                            {i18n.question.actionSkipAttempt}
                        </span>
                    </div>
                </>
            );
        case RoundState.SHOW_RESULTS:
            return (
                <>
                    <div className="card-body">
                        <h6>{i18n.question.stateQuestionComplete}</h6>
                        <span className="btn btn-primary" onClick={() => onGameEvent(new CloseRoundEvent())}>
                            {i18n.question.actionCloseQuestion}
                        </span>
                    </div>
                    <div className="card-body">
                        <h6>{round.question.completedBy.size === 0 ? i18n.question.noWinners : i18n.question.teamsWon}</h6>
                        {
                            Array.from(round.question.completedBy).map((team) => (
                                <TeamColorButton
                                    key={`attempt-temp-${team}`}
                                    color={team}
                                    className="material-symbols-outlined"
                                >
                                    group
                                </TeamColorButton>
                            ))
                        }
                    </div>
                </>
            );
        default:
            return (<p>Unknown</p>);
    }
}

function participants(game: Game, round: GameRound, i18n: Labels): ReactElement {
    switch (round.state) {
        case RoundState.SHOW_QUESTION:
            return (
                <>
                    <div className="card-body">
                        <h6>{i18n.question.stateShowQuestion}</h6>
                    </div>
                </>
            );
        case RoundState.BUZZER_ACTIVE:
            return (
                <>
                    <div className="card-body">
                        <h6>{i18n.question.stateBuzzerEnabled}</h6>
                    </div>
                </>
            );
        case RoundState.TEAM_CAN_ATTEMPT:
            return (
                <>
                    <div className="card-body">
                        <h6>{i18n.question.stateTeamCanAttempt}</h6>
                        {
                            Array.from(round.attemptingTeams)
                                .map((color) => (<TeamColorButton key={color} color={color}>{i18n.teams[color]}</TeamColorButton>))
                        }
                    </div>
                </>
            );
        case RoundState.SHOW_RESULTS:
            return (
                <>
                    <div className="card-body">
                        <h6>{i18n.question.stateQuestionComplete}</h6>
                    </div>
                    <div className="card-body">
                        <h6>{round.question.completedBy.size === 0 ? i18n.question.noWinners : i18n.question.teamsWon}</h6>
                        {
                            Array.from(round.question.completedBy)
                                .map((color) => (<TeamColorButton key={color} color={color}>{i18n.teams[color]}</TeamColorButton>))
                        }
                    </div>
                </>
            );
        default:
            return (
                <p>Unknown state</p>
            );
    }
}

const ActionsView = ({ round }: RoundProps): ReactElement => {
    const tabSettings = useContext(TabContext);
    const game = useContext(GameContext);
    const onGameEvent = useContext(GameEventContext);
    const i18n = useContext(I18N);
    const [timeInfo, setTimeInfo] = useState<TimeInfo | null>(null);
    const [timer] = useState<Timer>(new Timer());

    useEffect(() => {
        console.log('Change timer to', round.timerStart);
        timer.updateTimer(setTimeInfo, round.timerStart);
    }, [round.timerStart]);

    return (
        <div className="card">
            <div className="card-header">Actions</div>
            {tabSettings.settings.moderation ? moderation(game, round, onGameEvent, i18n) : participants(game, round, i18n)}
            <div className="card-footer">
                {timeInfo && (
                    <>
                        <span className="me-2">Timer</span>
                        {timeInfo.hours.length > 0 && (<span className="time-section">{timeInfo.hours}</span>)}
                        <b className="time-section">{timeInfo.minutes}</b>
                        <b className="time-section">{timeInfo.seconds}</b>
                        <span className="time-section">{timeInfo.milliseconds}</span>
                    </>
                )}
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
