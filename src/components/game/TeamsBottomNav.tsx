import React, { ReactElement, useContext } from 'react';
import { TeamView } from './TeamView';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { sortTeamsHighestFirst } from '../../model/game/team';
import { I18N } from '../../i18n/I18N';

export const TeamsBottomNav = (): ReactElement | undefined => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);

    return (
        <nav id="teams-container" className="navbar fixed-bottom bg-body-secondary grid-columns-lg">
            { Array.from(game.teams.values())
                .sort(sortTeamsHighestFirst)
                .map((team) => (
                    <TeamView
                        key={`bottom-team-${team.color}`}
                        team={team}
                        i18n={i18n}
                    />
                ))}
        </nav>
    );
};
