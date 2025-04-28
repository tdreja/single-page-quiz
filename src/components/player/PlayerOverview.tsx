import React, { ReactElement, useContext } from 'react';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { I18N, Labels } from '../../i18n/I18N';
import { Player, sortPlayersByName } from '../../model/game/player';

interface PlayerProps {
    player: Player,
    i18n: Labels,
}

const ReadOnlyPlayer = ({ player, i18n }: PlayerProps): ReactElement => {
    return (
        <div>
            {player.name}
        </div>
    );
};

export const PlayerOverview = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const i18n = useContext(I18N);

    return (
        <div className="d-flex flex-wrap flex-column" style={{ gap: '0.75rem 3rem' }}>
            {
                Array.from(game.players.values()).sort(sortPlayersByName).map((player) =>
                    <ReadOnlyPlayer key={`form-${player.emoji}`} player={player} i18n={i18n} />)
            }
        </div>
    );
};
