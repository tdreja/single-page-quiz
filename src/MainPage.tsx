import React, { ReactElement } from 'react';
import { GameState } from './model/game/game';
import { TabSettings } from './components/common/TabContext';

export interface Props {
    gameState: GameState,
    tabSettings: TabSettings,
    playerEditor: ReactElement,
    playerOverview: ReactElement,
}

export function isPresentationOnly(settings: TabSettings): boolean {
    return settings.presenter && !settings.editor;
}

export function view(props: Props): ReactElement {
    switch (props.gameState) {
        case GameState.TEAM_SETUP:
            return (<p>TeamSetup</p>);
        case GameState.PLAYER_SETUP:
            return isPresentationOnly(props.tabSettings) ? props.playerOverview : props.playerEditor;
        case GameState.CONTROLLER_SETUP:
            return (<p>ControllerSetup</p>);
        case GameState.GAME_ACTIVE:
            return (<p>GameActive</p>);
    }
}

export const MainPage = (props: Props): ReactElement => {
    return (
        <main id="main-content" className="d-flex w-100 ps-3 pe-3 pt-2 pb-2">
            {view(props)}
        </main>
    );
};
