import React, { ReactElement } from 'react';
import { EmojiView } from './EmojiView';
import { Player } from '../../model/game/player';

interface PlayerProps {
    player: Player,
}

export const SmallPlayerView = ({ player }: PlayerProps): ReactElement => {
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
            <EmojiView emoji={player.emoji} style={{ fontSize: '1.5em' }} />
            <span style={{ fontSize: '0.7em', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{player.name}</span>
            <span style={{ fontSize: '0.7em' }}>{player.points}</span>
        </div>
    );
};
