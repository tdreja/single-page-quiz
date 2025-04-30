import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { TeamViewExpanded } from './TeamViewExpanded';
import { Game, GameState } from '../../model/game/game';
import { GameContext, GameEventContext } from '../common/GameContext';
import { sortTeamsHighestFirst } from '../../model/game/team';
import { I18N } from '../../i18n/I18N';
import { ExpandTeamNavEvent } from '../../events/setup-events';
import { TeamViewCollapsed } from './TeamViewCollapsed';
// https://fonts.google.com/icons
import 'material-symbols';

export const TeamsBottomNav = (): ReactElement | undefined => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);
    const onGameUpdate = useContext(GameEventContext);
    const [expandIcon, setExpandIcon] = useState<string>('keyboard_double_arrow_up');
    const [expanded, setExpanded] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);

    useEffect(() => {
        if (game.state !== GameState.GAME_ACTIVE) {
            setExpanded(false);
            setDisabled(true);
            setExpandIcon('check_indeterminate_small');
            return;
        }
        setExpanded(game.teamNavExpanded);
        setDisabled(false);
        setExpandIcon(game.teamNavExpanded ? 'keyboard_double_arrow_down' : 'keyboard_double_arrow_up');
    }, [game]);

    const onToggleExpand = useCallback(() => {
        if (disabled) {
            return;
        }
        onGameUpdate(new ExpandTeamNavEvent(!game.teamNavExpanded));
    }, [game, onGameUpdate, disabled]);

    return (
        <nav
            id="teams-container"
            className="navbar sticky-bottom bg-body-secondary d-flex flex-row gap-2 align-items-end"
        >
            <span
                className={`btn btn-outline-secondary material-symbols-outlined ${disabled ? 'disabled' : ''}`}
                onClick={onToggleExpand}
            >
                {expandIcon}
            </span>
            <div className="d-grid grid-columns-lg flex-grow-1 gap-2">
                { Array.from(game.teams.values())
                    .sort(sortTeamsHighestFirst)
                    .map((team) => expanded
                        ? (
                            <TeamViewExpanded
                                key={`bottom-team-${team.color}`}
                                team={team}
                            />
                        )
                        : (
                            <TeamViewCollapsed
                                key={`bottom-team-${team.color}`}
                                team={team}
                            />
                        ))}
            </div>
        </nav>
    );
};
