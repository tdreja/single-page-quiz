import React, { ReactElement, useContext } from 'react';
import { TeamView } from './TeamView';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { sortTeamsHighestFirst } from '../../model/game/team';
import { I18N } from '../../i18n/I18N';

export const TeamsBottomNav = (): ReactElement | undefined => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);
    const teamViews: Array<ReactElement> = Array.from(game.teams.values())
        .sort(sortTeamsHighestFirst)
        .map((team) => TeamView({ team, i18n }));

    /* if (game.state !== GameState.GAME_ACTIVE) {
        return undefined;
    } */

    return (
        <nav id="teams-container" className="navbar fixed-bottom bg-body-secondary">
            {teamViews}
        </nav>
    );
};
