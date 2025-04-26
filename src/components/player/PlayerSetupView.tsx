import React, { ReactElement, useContext, useState } from 'react';
import { Game, GameState } from '../../model/game/game';
import { GameContext, GameEventContext, GameEventListener } from '../common/GameContext';
import { sortPlayersByName } from '../../model/game/player';
import { PlayerForm } from './PlayerForm';
import { I18N } from '../../i18n/I18N';

export const PlayerSetupView = (): ReactElement | undefined => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);
    const onGameEvent = useContext<GameEventListener>(GameEventContext);
    
    const players = Array.from(game.players.values()).sort(sortPlayersByName).map((player) => PlayerForm({ player, i18n, onGameEvent }));
    return (
        <div className="d-flex flex-wrap flex-column">
            {players}
        </div>
    );
};
