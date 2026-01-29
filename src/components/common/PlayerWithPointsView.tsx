import React, { ReactElement } from 'react';
import { EmojiView } from './EmojiView';
import { Player } from '../../model/game/player';
import { JsonPlayer } from '../../model/game/json/player_json';

interface PlayerProps {
    player: Player | JsonPlayer,
    size: 'small' | 'large',
}

export const PlayerWithPointsView = ({ player, size }: PlayerProps): ReactElement => {
    const emojiFontSize = size === 'large' ? '2em' : '1.2em';
    const fontSize = size === 'large' ? '1em' : '0.7em';
    return (
        <div
            part="player"
            id={`player-${player.emoji}`}
            key={player.emoji}
            className="d-grid gap-1 align-items-center border border-secondary-subtle rounded ps-1 pe-1"
            style={{
                gridTemplateColumns: '1fr 4fr 2fr',
            }}
        >
            {
                player.emoji && (<EmojiView emoji={player.emoji} style={{ fontSize: emojiFontSize }} />)
            }
            <span style={{ fontSize, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {player.name}
            </span>
            <span style={{ fontSize }}>{player.points}</span>
        </div>
    );
};
