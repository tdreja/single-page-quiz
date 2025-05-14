import React, { ReactElement } from 'react';
import { GameState } from '../model/game/game';

export interface Props {
    gameState: GameState,
    importQuiz: ReactElement,
    players: ReactElement,
    teams: ReactElement,
    quiz: ReactElement,
}

export function view(props: Props): ReactElement {
    switch (props.gameState) {
        case GameState.TEAM_SETUP:
            return props.teams;
        case GameState.PLAYER_SETUP:
            return props.players;
        case GameState.CONTROLLER_SETUP:
            return (<p>ControllerSetup</p>);
        case GameState.IMPORT_QUIZ:
            return props.importQuiz;
        default:
            return props.quiz;
    }
}

export const MainPage = (props: Props): ReactElement => {
    return (
        <main id="main-content" className="d-flex w-100 ps-3 pe-3 pt-2 pb-2">
            <div className="w-100">
                {view(props)}
            </div>
        </main>
    );
};
