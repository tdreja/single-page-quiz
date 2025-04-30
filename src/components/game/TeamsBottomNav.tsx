import React, { ReactElement, useContext } from 'react';
import { TeamView } from './TeamView';
import { Game } from '../../model/game/game';
import { GameContext, GameEventContext } from '../common/GameContext';
import { sortTeamsHighestFirst } from '../../model/game/team';
import { I18N } from '../../i18n/I18N';
import { ExpandTeamNavEvent } from '../../events/setup-events';

export const TeamsBottomNav = (): ReactElement | undefined => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);
    const onGameUpdate = useContext(GameEventContext);

    return (
        <nav
            id="teams-container"
            className="navbar sticky-bottom bg-body-secondary d-flex flex-row gap-2 align-items-end"
        >
            <span
                className="btn btn-outline-secondary material-symbols-outlined"
                onClick={() => onGameUpdate(new ExpandTeamNavEvent(!game.teamNavExpanded))}
            >
                {game.teamNavExpanded ? 'keyboard_double_arrow_down' : 'keyboard_double_arrow_up'}
            </span>
            <div className="d-grid grid-columns-lg flex-grow-1 gap-2">
                { Array.from(game.teams.values())
                    .sort(sortTeamsHighestFirst)
                    .map((team) => (
                        <TeamView
                            key={`bottom-team-${team.color}`}
                            team={team}
                            i18n={i18n}
                            expanded={game.teamNavExpanded}
                        />
                    ))}
            </div>
        </nav>
    );
};
