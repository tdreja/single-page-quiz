import React, { ChangeEvent, ReactElement, useCallback, useContext, useState } from 'react';
import { QuestionProps } from '../RoundProps';
import { SharedProps } from '../../SharedProps';
import { ActionQuestion } from '../../../../model/quiz/action-question';
import { I18N } from '../../../../i18n/I18N';
import { Sidebar, SidebarSectionProps } from '../Sidebar';
import { RoundState } from '../../../../model/game/game';
import { SkipAttemptEvent } from '../../../../events/round-events';
import { GameContext, GameEventContext } from '../../../../components/common/GameContext';
import { sortTeamsByColor, Team, TeamColor } from '../../../../model/game/team';
import { TeamColorButton } from '../../../../components/common/TeamColorButton';
import { Completion, recalculateCompletion } from '../../../../model/quiz/Completion';

export const ActionQuestionParticipantsView = (
    { round, question }: QuestionProps<ActionQuestion>,
): ReactElement => {
    return (<p>MultipleChoice</p>);
};

interface TeamProps {
    question: ActionQuestion,
    team: Team,
    completion: Completion,
    setCompletion: (newCompletion: Completion) => void,
}

const EditCompletionForTeam = ({ question, team, completion, setCompletion }: TeamProps): ReactElement => {
    const i18n = useContext(I18N);
    const onSliderChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const value = Number(ev.target.value);
        setCompletion(recalculateCompletion(completion, question.pointsForCompletion, team.color, value));
    }, [team, completion, setCompletion]);

    return (
        <>
            <TeamColorButton color={team.color}>
                <span
                    className="rounded-pill text-bg-light ps-2 pe-2 fw-bold ms-2 me-2"
                >
                    {i18n.teams[team.color]}
                </span>
            </TeamColorButton>
            <input
                type="range"
                className="form-range"
                name={`team-input-${team.color}-slider`}
                id={`team-input-${team.color}`}
                value={completion[team.color] || 0}
                min={0}
                max={question.pointsForCompletion}
                step={10}
                onChange={(ev) => onSliderChange(ev)}
            />
            <span>{`${completion[team.color] || 0}`}</span>
        </>
    );
};

const EditCompletionView = (
    { question }: SidebarSectionProps & QuestionProps<ActionQuestion>,
): ReactElement => {
    const onGameEvent = useContext(GameEventContext);
    const game = useContext(GameContext);
    const i18n = useContext(I18N);
    const [completion, setCompletion] = useState<Completion>({});

    return (
        <>
            <div className="card-body">
                <h6>{i18n.question.actionSkipAttempt}</h6>
                <div className="d-grid gap-2" style={{ gridTemplateColumns: 'min-content auto min-content' }}>
                    {
                        Array.from(game.teams.values()).sort(sortTeamsByColor)
                            .map((team) => (
                                <EditCompletionForTeam
                                    key={team.color}
                                    question={question}
                                    team={team}
                                    completion={completion}
                                    setCompletion={setCompletion}
                                />
                            ))
                    }
                </div>
            </div>
            <div className="card-body">
                <h6>{i18n.question.actionSkipAttempt}</h6>
                <span className="btn btn-outline-primary" onClick={() => onGameEvent(new SkipAttemptEvent())}>
                    {i18n.question.actionSkipAttempt}
                </span>
            </div>
        </>
    );
};

const ShowCompletionView = (_: SidebarSectionProps): ReactElement => {
    return (<p></p>);
};

export const ActionQuestionModerationView = (
    { round, question, shared }: QuestionProps<ActionQuestion> & SharedProps,
): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <div className="d-flex gap-2">
            <div className="card flex-grow-1">
                <div className="card-header">
                    {`${round.inColumn} ${round.question.pointsForCompletion}`}
                </div>
                <div className="card-body">
                    <h4 className="card-title pb-2">{question.text}</h4>
                </div>
            </div>
            {/* Sidebar */}
            <Sidebar headline={i18n.question.headlineActions} round={round} className="flex-grow-1">
                <EditCompletionView
                    round={round}
                    question={question}
                    state={[RoundState.BUZZER_ACTIVE, RoundState.SHOW_QUESTION, RoundState.TEAM_CAN_ATTEMPT]}
                />
                <ShowCompletionView state={[RoundState.SHOW_RESULTS]} />
            </Sidebar>
        </div>
    );
};
