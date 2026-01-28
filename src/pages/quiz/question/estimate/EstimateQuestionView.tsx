import React, { ReactElement, useContext } from 'react';
import { QuestionProps } from '../RoundProps';
import { SharedProps } from '../../SharedProps';
import { EstimateQuestion } from '../../../../model/quiz/estimate-question';
import { I18N } from '../../../../i18n/I18N';
import { Sidebar } from '../Sidebar';
import {
    ParticipantsBuzzerActive,
    ParticipantsShowQuestion,
    ParticipantsShowResults,
    ParticipantsTeamCanAttempt,
} from '../multiple-choice/ParticipantsSections';
import { RoundState } from '../../../../model/game/game';
import {
    ModerationBuzzerActive,
    ModerationResetRound,
    ModerationShowQuestion,
    ModerationShowResults,
    ModerationTeamCanAttempt,
} from '../multiple-choice/ModerationSections';
import { GameContext } from '../../../../components/common/GameContext';
import { TeamEstimateInput, TeamEstimateView } from './TeamEstimate';

export const EstimateQuestionParticipantsView = (
    { round, question }: QuestionProps<EstimateQuestion>,
): ReactElement => {
    const i18n = useContext(I18N);
    const game = useContext(GameContext);
    const completed = round.state === RoundState.SHOW_RESULTS;
    return (
        <div className="d-flex gap-2">
            <div className="card flex-grow-1">
                <div className="card-header">
                    {`${round.inColumn} ${round.question.pointsForCompletion}`}
                </div>
                <div className="card-body">
                    <h4 className="card-title pb-2">{question.text}</h4>
                    {completed && (
                        <h5 className="mb-4">{`${i18n.question.headlineEstimateAnswer} ${question.target}`}</h5>
                    )}
                    <div className="d-grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        { Array.from(game.teams.keys()).map((team) =>
                            (
                                <TeamEstimateView
                                    key={`estimate-view-${team}`}
                                    team={team}
                                    round={round}
                                    question={question}
                                />
                            ))}
                    </div>
                </div>
            </div>
            {/* Sidebar */}
            <Sidebar headline={i18n.question.headlineStatus} round={round}>
                <ParticipantsShowQuestion state={[RoundState.SHOW_QUESTION]} />
                <ParticipantsBuzzerActive state={[RoundState.BUZZER_ACTIVE]} />
                <ParticipantsTeamCanAttempt state={[RoundState.TEAM_CAN_ATTEMPT]} round={round} />
                <ParticipantsShowResults state={[RoundState.SHOW_RESULTS]} round={round} />
            </Sidebar>
        </div>
    );
};

export const EstimateQuestionModerationView = (
    { round, question, shared }: QuestionProps<EstimateQuestion> & SharedProps,
): ReactElement => {
    const i18n = useContext(I18N);
    const game = useContext(GameContext);
    const completed = round.state === RoundState.SHOW_RESULTS;
    return (
        <div className="d-flex gap-2">
            <div className="card flex-grow-1">
                <div className="card-header">
                    {`${round.inColumn} ${round.question.pointsForCompletion}`}
                </div>
                <div className="card-body">
                    <h4 className="card-title pb-2">{question.text}</h4>
                    {completed && (
                        <h5 className="mb-4">{`${i18n.question.headlineEstimateAnswer} ${question.target}`}</h5>
                    )}
                    <div className="d-grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        { Array.from(game.teams.keys()).map((team) =>
                            (
                                <TeamEstimateInput
                                    key={`estimate-input-${team}`}
                                    team={team}
                                    round={round}
                                    shared={shared}
                                    question={question}
                                />
                            ))}
                    </div>
                </div>
            </div>
            {/* Sidebar */}
            <Sidebar headline={i18n.question.headlineStatus} round={round}>
                <ModerationResetRound round={round} state={[RoundState.SHOW_QUESTION, RoundState.BUZZER_ACTIVE]} />
                <ModerationShowQuestion round={round} state={[RoundState.SHOW_QUESTION]} />
                <ModerationBuzzerActive round={round} state={[RoundState.BUZZER_ACTIVE]} />
                <ModerationTeamCanAttempt round={round} state={[RoundState.TEAM_CAN_ATTEMPT]} />
                <ModerationShowResults round={round} state={[RoundState.SHOW_RESULTS]} />
            </Sidebar>
        </div>
    );
};
