import React, { ReactElement } from 'react';
import { Team, TeamColor } from '../../model/game/team';
import { TeamView } from './TeamView';

export interface TeamsProps {
    teams: Map<TeamColor, Team>,
}

export const TeamsNav = ({ teams }: TeamsProps): ReactElement => {
    const teamViews: Array<ReactElement> = Array.from(teams.values()).map((team) => TeamView({ team }));
    return (
        <nav id="teams-container" className="navbar fixed-bottom bg-body-secondary">
            {teamViews}
        </nav>
    );
};
