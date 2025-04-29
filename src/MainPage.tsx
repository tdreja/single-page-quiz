import React, { ReactElement } from 'react';
import { GameState } from './model/game/game';
import { TabSettings } from './components/common/TabContext';

export interface Props {
    gameState: GameState,
    tabSettings: TabSettings,
    playerModeration: ReactElement,
    playerParticipants: ReactElement,
    teamsModeration: ReactElement,
    teamsParticipants: ReactElement,
    quiz: ReactElement,
}

export function isOnlyForParticipants(settings: TabSettings): boolean {
    return settings.participants && !settings.moderation;
}

export function view(props: Props): ReactElement {
    switch (props.gameState) {
        case GameState.TEAM_SETUP:
            return isOnlyForParticipants(props.tabSettings) ? props.teamsParticipants : props.teamsModeration;
        case GameState.PLAYER_SETUP:
            return isOnlyForParticipants(props.tabSettings) ? props.playerParticipants : props.playerModeration;
        case GameState.CONTROLLER_SETUP:
            return (<p>ControllerSetup</p>);
        case GameState.GAME_ACTIVE:
            return props.quiz;
    }
}

export const MainPage = (props: Props): ReactElement => {
    return (
        <main id="main-content" className="d-flex w-100 ps-3 pe-3 pt-2 pb-2">
            {view(props)}
        </main>
    );
};
