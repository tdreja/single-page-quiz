import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Game } from '../../model/game/game';
import { GameContext, GameEventContext } from '../common/GameContext';
import { Emoji, Player, sortPlayersByName } from '../../model/game/player';
import { I18N } from '../../i18n/I18N';
import { AddPlayerEvent } from '../../events/setup-events';
import { AccordionItem } from '../common/AccordionItem';
import { EmojiView } from '../common/EmojiView';
import { TeamColorButton } from '../common/TeamColorButton';
import { PlayerForm } from './PlayerForm';
import { TeamColor } from '../../model/game/team';
import { Expanded } from './expanded';
import { calculatePlacementsForAll, PlacementPointsForAll } from '../../model/placement';
import { PlayerHeader } from './PlayerHeader';

export const PlayerModerationView = (): ReactElement | undefined => {
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
        console.log('Input', input, 'Names', playerNames);
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
                        <div className="input-group">
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
                                <PlayerHeader player={player} placements={placements} />
                            }
                        >
                            <PlayerForm player={player} availableTeams={availableTeams} />
                        </AccordionItem>
                    ))
            }
        </div>
    );
};
