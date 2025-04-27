import React, { ReactElement, useContext, useState } from 'react';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { sortPlayersByName } from '../../model/game/player';
import { PlayerForm } from './PlayerForm';

export const PlayerSetupView = (): ReactElement | undefined => {
    const game = useContext<Game>(GameContext);

    return (
        <div className="d-flex flex-wrap flex-column" style={{ gap: '0.75rem 3rem'}}>
            {
                Array.from(game.players.values()).sort(sortPlayersByName).map(player =>
                    <PlayerForm key={`form-${player.emoji}`} player={player} />)
            }
        </div>
    );
};
