import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Game } from '../../model/game/game';
import { GameContext, GameEventContext } from '../common/GameContext';
import { Emoji, sortPlayersByName } from '../../model/game/player';
import { I18N } from '../../i18n/I18N';
import { AddPlayerEvent } from '../../events/setup-events';
import { AccordionItem } from '../common/AccordionItem';
import { EmojiView } from '../common/EmojiView';
import { TeamColorButton } from '../common/TeamColorButton';
// https://fonts.google.com/icons
import 'material-symbols';
import { PlayerForm } from './PlayerForm';
import { TeamColor } from '../../model/game/team';

export const PlayerModerationView = (): ReactElement | undefined => {
    const game = useContext<Game>(GameContext);
    const onGameEvent = useContext(GameEventContext);
    const i18n = useContext(I18N);
    const [newPlayersText, setNewPlayersText] = useState<string>('');
    const [expanded, setExpanded] = useState<Emoji | null>(null);
    const [availableTeams, setAvailableTeams] = useState<Array<TeamColor>>(Array.from(game.teams.keys()));

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

    const toggle = useCallback((emoji: Emoji) => {
        if (expanded === emoji) {
            setExpanded(null);
        } else {
            setExpanded(emoji);
        }
    }, [expanded]);

    useEffect(() => {
        setAvailableTeams(Array.from(game.teams.keys()));
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
                            isExpanded={() => expanded === player.emoji}
                            toggle={() => toggle(player.emoji)}
                            style={{ minWidth: '20rem' }}
                            headerChildren={
                                <div
                                    className="d-inline-grid gap-2 w-100 me-3"
                                    style={{ gridTemplateColumns: 'auto 2fr 1fr auto', alignItems: 'center' }}
                                >
                                    <EmojiView
                                        emoji={player.emoji}
                                        style={{ fontSize: '1.5em' }}
                                    />
                                    <span>{player.name}</span>
                                    <span>{player.points}</span>
                                    {player.team && <TeamColorButton color={player.team} />}
                                </div>
                            }
                        >
                            <PlayerForm player={player} availableTeams={availableTeams} />
                        </AccordionItem>
                    ))
            }
        </div>
    );
};
