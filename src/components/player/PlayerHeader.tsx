import React, { ReactElement } from 'react';
import { EmojiView } from '../common/EmojiView';
import { TeamColorButton } from '../common/TeamColorButton';
import { Player } from '../../model/game/player';
import { calculateSinglePlacement, PlacementPointsForAll } from '../../model/placement';
import { PlacementIcon } from '../common/PlacementIcon';

interface Props {
    player: Player,
    placements: PlacementPointsForAll,
}

export const PlayerHeader = ({ player, placements }: Props): ReactElement => {
    const placement = calculateSinglePlacement(player.points, placements);
    return (
        <div
            className="d-inline-grid gap-2 w-100 me-3"
            style={{ gridTemplateColumns: '[place] 1fr [emoji] auto [name] 2fr [points] 1fr [team] auto', alignItems: 'center' }}
        >
            {placement ? <PlacementIcon placement={placement} style={{ gridColumn: 'place' }} /> : <span />}
            <EmojiView
                emoji={player.emoji}
                style={{ fontSize: '1.5em', gridColumn: 'emoji' }}
            />
            <span style={{ gridColumn: 'name' }}>{player.name}</span>
            <span style={{ gridColumn: 'points' }}>{player.points}</span>
            {player.team && <TeamColorButton color={player.team} style={{ gridColumn: 'team' }} />}
        </div>
    );
};
