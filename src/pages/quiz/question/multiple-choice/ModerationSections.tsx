import React, { ReactElement, useContext } from 'react';
import { SidebarSectionProps } from '../Sidebar';
import {
    ActivateBuzzerEvent,
    CloseRoundEvent,
    RequestAttemptEvent,
    ResetRoundEvent,
    SkipAttemptEvent,
} from '../../../../events/round-events';
import { I18N } from '../../../../i18n/I18N';
import { GameContext, GameEventContext } from '../../../../components/common/GameContext';
import { RoundProps } from '../RoundProps';
import { sortTeamsByColor } from '../../../../model/game/team';
import { TeamColorButton } from '../../../../components/common/TeamColorButton';

export const ModerationResetRound = (_: SidebarSectionProps & RoundProps): ReactElement => {
    const onGameEvent = useContext(GameEventContext);
    const i18n = useContext(I18N);
    return (
        <div className="card-body">
            <h6>{i18n.question.headlineResetRound}</h6>
            <span className="btn btn-danger" onClick={() => onGameEvent(new ResetRoundEvent())}>
                {i18n.question.actionResetRound}
            </span>
        </div>
    );
};

export const ModerationShowQuestion = ({ round }: SidebarSectionProps & RoundProps): ReactElement => {
    const onGameEvent = useContext(GameEventContext);
    const i18n = useContext(I18N);
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
                <TriggerTeamAttemptButtons round={round} />
            </div>
        </>
    );
};

export const ModerationBuzzerActive = ({ round }: SidebarSectionProps & RoundProps): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <>
            <div className="card-body">
                <h6>{i18n.question.stateBuzzerEnabled}</h6>
                <span className="material-symbols-outlined badge rounded-pill text-bg-danger">
                    e911_emergency
                </span>
            </div>
            <div className="card-body">
                <h6>{i18n.question.headlineNextAttempt}</h6>
                <TriggerTeamAttemptButtons round={round} />
            </div>
        </>
    );
};

export const ModerationTeamCanAttempt = ({ round }: SidebarSectionProps & RoundProps): ReactElement => {
    const onGameEvent = useContext(GameEventContext);
    const i18n = useContext(I18N);
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
};

export const ModerationShowResults = ({ round }: SidebarSectionProps & RoundProps): ReactElement => {
    const onGameEvent = useContext(GameEventContext);
    const i18n = useContext(I18N);
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
};

const TriggerTeamAttemptButtons = ({ round }: RoundProps): ReactElement => {
    const game = useContext(GameContext);
    const onGameEvent = useContext(GameEventContext);
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
};
