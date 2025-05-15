import React, { ChangeEvent, ReactElement, useCallback, useContext, useState } from 'react';
import { QuestionProps } from '../RoundProps';
import { SharedProps } from '../../SharedProps';
import { ActionQuestion } from '../../../../model/quiz/action-question';
import { I18N } from '../../../../i18n/I18N';
import { Sidebar, SidebarSectionProps } from '../Sidebar';
import { RoundState } from '../../../../model/game/game';
import { GameContext, GameEventContext } from '../../../../components/common/GameContext';
import { sortTeamsByColor, Team } from '../../../../model/game/team';
import { TeamColorButton } from '../../../../components/common/TeamColorButton';
import { Completion, recalculateCompletion } from '../../../../model/quiz/Completion';
import { CompleteActionEvent } from '../../../../events/question-event';
import { CloseRoundEvent } from '../../../../events/round-events';

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
            <span>{`${completion[team.color] || 0}`}</span>
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
                <h6>{i18n.question.headlineCompletionPercent}</h6>
                <div
                    className="d-grid gap-2 align-items-center"
                    style={{ gridTemplateColumns: 'min-content min-content auto' }}
                >
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
                <h6>{i18n.question.actionCompleteQuestion}</h6>
                <span
                    className="btn btn-outline-primary"
                    onClick={() => onGameEvent(new CompleteActionEvent(completion))}
                >
                    {i18n.question.actionCompleteQuestion}
                </span>
            </div>
        </>
    );
};

const ShowCompletionView = (
    { question }: SidebarSectionProps & QuestionProps<ActionQuestion>,
): ReactElement => {
    const i18n = useContext(I18N);
    const onGameEvent = useContext(GameEventContext);
    return (
        <>
            <div className="card-body">
                <h6>{i18n.question.stateQuestionComplete}</h6>
                <span className="btn btn-primary" onClick={() => onGameEvent(new CloseRoundEvent())}>
                    {i18n.question.actionCloseQuestion}
                </span>
            </div>
            <div className="card-body">
                <h6>{question.completedBy.size === 0 ? i18n.question.noWinners : i18n.question.teamsWon}</h6>
                <div className="d-flex gap-2">
                    {
                        Array.from(question.completedBy).map((team) => (
                            <TeamColorButton
                                key={`attempt-temp-${team}`}
                                color={team}
                            >
                                <span
                                    className="rounded-pill text-bg-light ps-2 pe-2 fw-bold ms-2 me-2"
                                >
                                    {i18n.teams[team]}
                                </span>
                                <span
                                    className="rounded-pill text-bg-light ps-2 pe-2 ms-2 me-2"
                                >
                                    {question.completionPoints.get(team) || 0}
                                </span>
                            </TeamColorButton>
                        ))
                    }
                </div>
            </div>
        </>
    );
};

export const ActionQuestionModerationView = (
    { round, question }: QuestionProps<ActionQuestion> & SharedProps,
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
                <ShowCompletionView
                    question={question}
                    round={round}
                    state={[RoundState.SHOW_RESULTS]}
                />
            </Sidebar>
        </div>
    );
};
