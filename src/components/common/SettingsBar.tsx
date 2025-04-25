import React, { ReactElement, useContext } from 'react';
import { TabContext } from './TabContext';
import { GameContext, GameEventContext } from './GameContext';
import { GameState } from '../../model/game/game';
import { SwitchStateEvent } from '../../events/setup-events';

export const SettingsBar = (): ReactElement => {
    const game = useContext(GameContext);
    const onGameUpdate = useContext(GameEventContext);
    const tabSettings = useContext(TabContext);

    const changeState = (state: GameState): void => {
        onGameUpdate(new SwitchStateEvent(state));
    };

    return (
        <nav className="navbar sticky-top bg-body-secondary">
            <ul className="nav nav-tabs">
                <li className={`nav-item nav-link ${game.state === GameState.GAME_ACTIVE ? 'active' : ''}`} onClick={() => changeState(GameState.GAME_ACTIVE)}>
                    Quiz
                </li>
                <li className={`nav-item nav-link ${game.state === GameState.PLAYER_SETUP ? 'active' : ''}`} onClick={() => changeState(GameState.PLAYER_SETUP)}>
                    Players
                </li>
                <li className={`nav-item nav-link ${game.state === GameState.TEAM_SETUP ? 'active' : ''}`} onClick={() => changeState(GameState.TEAM_SETUP)}>
                    Teams
                </li>
            </ul>
        </nav>
    );
};
