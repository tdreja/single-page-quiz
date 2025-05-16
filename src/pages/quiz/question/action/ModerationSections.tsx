import { SidebarSectionProps } from '../Sidebar';
import { QuestionProps } from '../RoundProps';
import { ActionQuestion } from '../../../../model/quiz/action-question';
import React, { ChangeEvent, ReactElement, useCallback, useContext, useState } from 'react';
import { GameContext, GameEventContext } from '../../../../components/common/GameContext';
import { I18N } from '../../../../i18n/I18N';
import { Completion, recalculateCompletion } from '../../../../model/quiz/Completion';
import { sortTeamsByColor, Team } from '../../../../model/game/team';
import { CompleteActionEvent } from '../../../../events/question-event';
import { CloseRoundEvent } from '../../../../events/round-events';
import { TeamColorButton } from '../../../../components/common/TeamColorButton';

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
            <span style={{ minWidth: '4em' }} className={`${completion[team.color] ? 'fw-bold' : ''}`}>
                {`${completion[team.color] || 0}`}
            </span>
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

export const ActionQuestionModerationSectionEditCompletion = (
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

export const ActionQuestionModerationSectionShowCompletion = (
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
