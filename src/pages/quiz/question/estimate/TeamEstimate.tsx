import React, { ReactElement, useContext } from 'react';
import { I18N } from '../../../../i18n/I18N';
import { RoundProps } from '../RoundProps';
import { SharedProps } from '../../SharedProps';
import { TeamColor } from '../../../../model/game/team';
import { GameEventContext } from '../../../../components/common/GameContext';
import { TeamColorButton } from '../../../../components/common/TeamColorButton';
import { SubmitEstimateEvent } from '../../../../events/question-event';

interface EstimateProps extends RoundProps, SharedProps {
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

export const TeamEstimateInput = ({ round, shared, team }: EstimateProps): ReactElement => {
    const i18n = useContext(I18N);
    const onGameEvent = useContext(GameEventContext);
    const [estimate, setEstimate] = React.useState<number | null>(null);

    return (
        <div className="card">
            <div className="card-header">
                <TeamColorButton color={team}>{i18n.teams[team]}</TeamColorButton>
            </div>
            <div className="card-body d-flex flex-column align-items-center gap-2">
                <div className="input-group">
                    <input
                        autoComplete="off"
                        type={shared ? 'password' : 'text'}
                        className="form-control"
                        id={`team-estimate-input-${team}`}
                        value={estimate == null ? '' : `${estimate}`}
                        onChange={(ev) => setEstimate(asNumberOrNull(ev.target.value))}
                    />
                    <span
                        className="input-group-text btn btn-outline-secondary material-symbols-outlined"
                        onClick={() => {
                            if (estimate != null) {
                                onGameEvent(new SubmitEstimateEvent(team, estimate));
                            }
                        }}
                        title={i18n.playerEditor.tooltipRename}
                    >
                        person_edit
                    </span>
                </div>
            </div>
        </div>
    );
};
