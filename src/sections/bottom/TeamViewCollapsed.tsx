import React, { ReactElement, useContext } from 'react';
import { Team } from '../../model/game/team';
import { I18N } from '../../i18n/I18N';
import { TeamColorButton } from '../../components/common/TeamColorButton';

interface TeamProps {
    team: Team,
}

export const TeamViewCollapsed = ({ team }: TeamProps): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <TeamColorButton color={team.color} className="team-score-chip">
            <span className="team-score-name">{i18n.teams[team.color]}</span>
            <span className="team-score-points">{i18n.numberFormat.format(team.points)}</span>
        </TeamColorButton>
    );
};
