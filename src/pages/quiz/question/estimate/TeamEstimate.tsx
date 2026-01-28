import React, { ReactElement, useCallback, useContext } from 'react';
import { I18N } from '../../../../i18n/I18N';
import { RoundProps } from '../RoundProps';
import { TeamColor } from '../../../../model/game/team';
import { GameEventContext } from '../../../../components/common/GameContext';
import { TeamColorButton } from '../../../../components/common/TeamColorButton';
import { SubmitEstimateEvent } from '../../../../events/question-event';
import { EstimateQuestion } from '../../../../model/quiz/estimate-question';
import { RoundState } from '../../../../model/game/game';
import { SharedProps } from '../../SharedProps';

interface EstimateProps extends RoundProps {
    question: EstimateQuestion,
    team: TeamColor,
}

function asNumberOrNull(value: string | null | undefined): number | null {
    if (!value) {
        return null;
    }
    const nr = Number(value);
    if (Number.isNaN(nr) || !Number.isFinite(nr)) {
        return null;
    }
    return nr;
}

const SubmitBadge = ({ round, question, team }: EstimateProps): ReactElement | undefined => {
    if (round.state === RoundState.SHOW_RESULTS) {
        const winner = question.completedBy.has(team);
        return (
            <span className={`badge rounded-pill fs-5 material-symbols-outlined ${winner ? 'text-bg-success' : 'text-bg-danger'}`}>
                {winner ? 'check' : 'close'}
            </span>
        );
    }
    if (question.estimates.has(team)) {
        return (
            <span className="badge rounded-pill text-bg-secondary fs-5 material-symbols-outlined">
                pinboard
            </span>
        );
    }
    return undefined;
};

export const TeamEstimateView = ({ round, question, team }: EstimateProps): ReactElement => {
    const i18n = useContext(I18N);
    const completed = round.state === RoundState.SHOW_RESULTS;
    const estimate = question.estimates.get(team);
    return (
        <div className="card">
            <div className="card-header d-flex flex-row justify-content-between align-items-center">
                <TeamColorButton color={team}>{i18n.teams[team]}</TeamColorButton>
                <SubmitBadge question={question} team={team} round={round} />
            </div>
            <div className="card-body d-flex flex-column align-items-center gap-2">
                {completed && estimate && (
                    <h5>{`${i18n.question.headlineTeamEstimate} ${estimate}`}</h5>
                )}
            </div>
        </div>
    );
};

export const TeamEstimateInput = ({ round, question, shared, team }: EstimateProps & SharedProps): ReactElement => {
    const i18n = useContext(I18N);
    const onGameEvent = useContext(GameEventContext);
    const [estimate, setEstimate] = React.useState<number | null>(null);

    const onSubmitEstimate = useCallback(() => {
        if (estimate != null) {
            onGameEvent(new SubmitEstimateEvent(team, estimate));
        }
    }, [estimate, onGameEvent, team]);

    const onResetEstimate = useCallback(() => {
        setEstimate(null);
        onGameEvent(new SubmitEstimateEvent(team, null));
    }, [onGameEvent, team]);

    const submittedEstimate = question.estimates.get(team);
    const completed = round.state === RoundState.SHOW_RESULTS;

    return (
        <div className="card">
            <div className="card-header d-flex flex-row justify-content-between align-items-center">
                <TeamColorButton color={team}>{i18n.teams[team]}</TeamColorButton>
                <SubmitBadge question={question} team={team} round={round} />
            </div>
            <div className="card-body d-flex flex-column align-items-center gap-2">
                <div className="input-group">
                    <span
                        className={`input-group-text btn btn-outline-danger material-symbols-outlined ${(submittedEstimate === null || completed) ? 'disabled' : ''}`}
                        onClick={onResetEstimate}
                        title={i18n.question.actionResetEstimate}
                    >
                        keep_off
                    </span>
                    <input
                        autoComplete="off"
                        type={(!shared || completed) ? 'text' : 'password'}
                        className="form-control"
                        id={`team-estimate-input-${team}`}
                        value={estimate == null ? '' : `${estimate}`}
                        onChange={(ev) => setEstimate(asNumberOrNull(ev.target.value))}
                        data-1p-ignore
                        data-bwignore
                        data-lpignore="true"
                        data-form-type="other"
                    />
                    <span
                        className={`input-group-text btn btn-outline-secondary material-symbols-outlined ${(submittedEstimate !== undefined || completed) ? 'disabled' : ''}`}
                        onClick={onSubmitEstimate}
                        title={i18n.question.actionSubmitEstimate}
                    >
                        keep
                    </span>
                </div>
            </div>
        </div>
    );
};
