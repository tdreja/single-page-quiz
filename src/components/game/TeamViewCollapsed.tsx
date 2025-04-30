import React, { ReactElement, useContext } from 'react';
import { Team } from '../../model/game/team';
import { I18N } from '../../i18n/I18N';
import { TeamColorButton } from '../common/TeamColorButton';

interface TeamProps {
    team: Team,
}

export const TeamViewCollapsed = ({ team }: TeamProps): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <TeamColorButton color={team.color} className="d-inline-flex justify-content-between">
            <span className="rounded-pill text-bg-light ps-2 pe-2 fw-bold">{i18n.teams[team.color]}</span>
            <span className="rounded-pill text-bg-light ps-2 pe-2">{team.points}</span>
        </TeamColorButton>
    );
};
