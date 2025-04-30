import React, { ReactElement, useCallback, useContext, useState } from 'react';
import { Game } from '../../model/game/game';
import { GameContext, GameEventContext } from '../common/GameContext';
import { sortPlayersByName } from '../../model/game/player';
import { PlayerForm } from './PlayerForm';
import { I18N } from '../../i18n/I18N';
import { AddPlayerEvent } from '../../events/setup-events';

export const PlayerModerationView = (): ReactElement | undefined => {
    const game = useContext<Game>(GameContext);
    const onGameEvent = useContext(GameEventContext);
    const i18n = useContext(I18N);
    const [newPlayersText, setNewPlayersText] = useState<string>('');

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

    return (
        <div className="d-flex flex-wrap flex-row" style={{ gap: '0.75rem 3rem' }}>
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
            {
                Array.from(game.players.values()).sort(sortPlayersByName).map((player) =>
                    <PlayerForm key={`form-${player.emoji}`} player={player} />)
            }
        </div>
    );
};
