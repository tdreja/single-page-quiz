import React, { ReactElement, useContext } from 'react';
import { TeamView } from './TeamView';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';

export const TeamsNav = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const teamViews: Array<ReactElement> = Array.from(game.teams.values()).map((team) => TeamView({ team }));
    return (
        <nav id="teams-container" className="navbar fixed-bottom bg-body-secondary">
            {teamViews}
        </nav>
    );
};
