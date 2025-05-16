import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Game } from '../../model/game/game';
import { Emoji, Player, sortPlayersByName } from '../../model/game/player';
import { I18N } from '../../i18n/I18N';
import { AddPlayerEvent, RemovePlayerEvent, ResetPlayersEvent, ShuffleTeamsEvent } from '../../events/setup-events';
import { PlayerForm } from './PlayerForm';
import { TeamColor } from '../../model/game/team';
import { Expanded } from './expanded';
import { calculatePlacementsForAll, PlacementPointsForAll } from '../../model/placement';
import { PlayerHeader } from './PlayerHeader';
import { GameContext, GameEventContext } from '../../components/common/GameContext';
import { AccordionItem } from '../../components/common/AccordionItem';

export const PlayersPageForModeration = (): ReactElement | undefined => {
    const game = useContext<Game>(GameContext);
    const onGameEvent = useContext(GameEventContext);
    const i18n = useContext(I18N);
    const [newPlayersText, setNewPlayersText] = useState<string>('');
    const [expanded, setExpanded] = useState<Expanded | null>(null);
    const [availableTeams, setAvailableTeams] = useState<Array<TeamColor>>(Array.from(game.teams.keys()));
    const [placements, setPlacements] = useState<PlacementPointsForAll>(calculatePlacementsForAll([]));

    const addNewPlayers = useCallback(() => {
        const input = newPlayersText.trim();
        if (input.length === 0) {
            return;
        }
        const playerNames = input.split(/[,;\n]/).map((str) => str.trim()).filter((str) => str.length > 0);
        if (playerNames.length === 0) {
            return;
        }
        onGameEvent(new AddPlayerEvent(playerNames));
        setNewPlayersText('');
    }, [newPlayersText, onGameEvent]);

    const toggle = useCallback((emoji: Emoji, name: string) => {
        if (expanded && (expanded.emoji === emoji || expanded.name === name)) {
            setExpanded(null);
        } else {
            setExpanded({ emoji, name });
        }
    }, [expanded]);

    const isExpanded = (player: Player): boolean => {
        if (!expanded) {
            return false;
        }
        return expanded.emoji === player.emoji || expanded.name === player.name;
    };

    useEffect(() => {
        setAvailableTeams(Array.from(game.teams.keys()));
        setPlacements(calculatePlacementsForAll(Array.from(game.players.values()).map((player) => player.points)));
    }, [game]);

    return (
        <div
            className="accordion accordion-flush d-flex flex-column flex-wrap border-top rounded-top column-gap-3 justify-content-start align-content-start"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
        >
            <div
                className="accordion-item border-top-0 border-start border-end border-bottom"
                style={{ minWidth: '20rem' }}
            >
                <div className="accordion-body">
                    <div className="mb-3">
                        <label htmlFor="add-new-players" className="form-label">
                            {i18n.playerEditor.labelAdd}
                        </label>
                        <div className="input-group" id="add-new-players">
                            <textarea
                                className="form-control"
                                value={newPlayersText}
                                onChange={(ev) => setNewPlayersText(ev.target.value)}
                            />
                            <span
                                className="input-group-text btn btn-outline-primary material-symbols-outlined"
                                title={i18n.playerEditor.tooltipAdd}
                                onClick={addNewPlayers}
                            >
                                person_add
                            </span>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="reset-all-points" className="form-label">
                            {i18n.playerEditor.labelResetAll}
                        </label>
                        <div id="reset-all-points">
                            <span
                                className="btn btn-outline-warning material-symbols-outlined"
                                title={i18n.playerEditor.tooltipResetAll}
                                onClick={() => onGameEvent(new ResetPlayersEvent(Array.from(game.players.keys())))}
                            >
                                reset_settings
                            </span>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="delete-all-players" className="form-label">
                            {i18n.playerEditor.labelRemoveAll}
                        </label>
                        <div id="delete-all-players">
                            <span
                                className="btn btn-outline-danger material-symbols-outlined"
                                title={i18n.playerEditor.tooltipRemoveAll}
                                onClick={() => onGameEvent(new RemovePlayerEvent(Array.from(game.players.keys())))}
                            >
                                group_remove
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {
                Array.from(game.players.values()).sort(sortPlayersByName).map((player) =>
                    (
                        <AccordionItem
                            key={`player-${player.emoji}`}
                            isExpanded={() => isExpanded(player)}
                            toggle={() => toggle(player.emoji, player.name)}
                            style={{ minWidth: '20rem' }}
                            headerChildren={
                                <PlayerHeader
                                    player={player}
                                    placements={placements}
                                    className="w-100"
                                />
                            }
                        >
                            <PlayerForm player={player} availableTeams={availableTeams} />
                        </AccordionItem>
                    ))
            }
        </div>
    );
};
