import React, { ReactElement, useContext } from 'react';
import { TeamView } from './TeamView';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { sortTeamsHighestFirst } from '../../model/game/team';

export const TeamsBottomNav = (): ReactElement | undefined => {
    const game = useContext<Game>(GameContext);
    const teamViews: Array<ReactElement> = Array.from(game.teams.values())
        .sort(sortTeamsHighestFirst)
        .map((team) => TeamView({ team }));

    /* if (game.state !== GameState.GAME_ACTIVE) {
        return undefined;
    } */

    return (
        <nav id="teams-container" className="navbar fixed-bottom bg-body-secondary">
            {teamViews}
        </nav>
    );
};
