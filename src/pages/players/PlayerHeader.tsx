import React, { ReactElement } from 'react';
import { Player } from '../../model/game/player';
import { calculateSinglePlacement, PlacementPointsForAll } from '../../model/placement';
import { PlacementIcon } from '../../components/common/PlacementIcon';
import { EmojiView } from '../../components/common/EmojiView';
import { TeamColorButton } from '../../components/common/TeamColorButton';

type HtmlProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
interface Props extends HtmlProps {
    player: Player,
    placements: PlacementPointsForAll,
}

export const PlayerHeader = (props: Props): ReactElement => {
    const player = props.player;
    const placement = calculateSinglePlacement(player.points, props.placements);
    const html: HtmlProps = {
        ...props,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (html as any)['placements'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (html as any)['player'];

    return (
        <div
            {...html}
            className={`${html.className || ''} d-inline-grid gap-2 me-3`}
            style={{
                ...html.style,
                gridTemplateColumns: '[place] 1fr [emoji] auto [name] 2fr [points] 1fr [team] auto',
                alignItems: 'center' }}
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
