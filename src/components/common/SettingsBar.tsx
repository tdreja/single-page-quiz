import React, { ReactElement, useContext } from 'react';
import { TabContext } from './TabContext';
import { GameContext, GameEventContext } from './GameContext';
import { GameState } from '../../model/game/game';
import { SwitchStateEvent } from '../../events/setup-events';
import { I18N } from '../../i18n/I18N';

export const SettingsBar = (): ReactElement => {
    const game = useContext(GameContext);
    const onGameUpdate = useContext(GameEventContext);
    const tabSettings = useContext(TabContext);
    const i18n = useContext(I18N);

    const changeState = (state: GameState): void => {
        onGameUpdate(new SwitchStateEvent(state));
    };

    return (
        <nav className="navbar sticky-top bg-body-secondary">
            <ul className="nav nav-tabs">
                <li className={`nav-item nav-link ${game.state === GameState.GAME_ACTIVE ? 'active' : ''}`} onClick={() => changeState(GameState.GAME_ACTIVE)}>
                    {i18n.game['game-active']}
                </li>
                <li className={`nav-item nav-link ${game.state === GameState.PLAYER_SETUP ? 'active' : ''}`} onClick={() => changeState(GameState.PLAYER_SETUP)}>
                    {i18n.game['player-setup']}
                </li>
                <li className={`nav-item nav-link ${game.state === GameState.TEAM_SETUP ? 'active' : ''}`} onClick={() => changeState(GameState.TEAM_SETUP)}>
                    {i18n.game['team-setup']}
                </li>
            </ul>
        </nav>
    );
};
