import 'bootstrap/dist/css/bootstrap.min.css';
import './game.css';
import { TeamsNav } from './components/game/TeamsNav';
import React, { useCallback, useEffect, useState } from 'react';
import { emptyGame, Game } from './model/game/game';
import { Changes, GameEvent } from './events/common-events';
import { GameContext, GameEventContext, GameEventListener } from './components/common/GameContext';
import { prepareGame } from './dev/dev-setup';
import { loadCurrentRound, loadStaticGameData, loadUpdatableGameData, storeCurrentRound, storeStaticGameData, storeUpdatableGameData } from './components/common/Storage';
import { importCurrentRound, importGame, exportGame, exportCurrentRound } from './model/game/json/game';
import { exportStaticGameContent, importStaticGameContent } from './model/quiz/json';

function App() {
    const [game, setGame] = useState<Game>(emptyGame());
    const onGameEvent = useCallback<GameEventListener>((event: GameEvent) => {
        const update = event.updateGame(game);
        if (update.updates.length > 0) {

            if(update.updates.includes(Changes.QUIZ_CONTENT)) {
                storeStaticGameData(exportStaticGameContent(update.updatedGame));
            }
            if(update.updates.includes(Changes.GAME_SETUP)) {
                storeUpdatableGameData(exportGame(update.updatedGame));
            }
            if(update.updates.includes(Changes.CURRENT_ROUND)) {
                storeCurrentRound(exportCurrentRound(update.updatedGame));
            }

            setGame(update.updatedGame);
        }
    }, [game]);

    useEffect(() => {
        const newGame = {
            ...game
        };

        const quiz = loadStaticGameData();
        importStaticGameContent(newGame, quiz);
        
        const gameSetup = loadUpdatableGameData();
        importGame(newGame, gameSetup);

        const round = loadCurrentRound();
        importCurrentRound(newGame, round);

        if(!quiz && !gameSetup && !round) {
            prepareGame(newGame);
        }
        setGame(newGame);
        
    }, []);

    return (
        <GameContext.Provider value={game}>
            <GameEventContext.Provider value={onGameEvent}>
                <nav className="navbar sticky-top bg-body-secondary">Settings</nav>
                <main className="container-fluid d-flex flex-row flex-nowrap gap-2 pt-2">
                    <div className="col">
                        <article className="card" id="text-multiple-choice">
                            <div className="card-header">
                                <span part="section">Section</span>
                                <span part="points">100</span>
                            </div>
                            <section className="card-body">
                                <h3 part="question-text" className="card-title mb-4">Question?</h3>
                                <div part="answer-choices" className="answers-grid gap-2">
                                    <div className="answer align-items-baseline gap-2">
                                        <button part="choice-id" type="button" className="btn btn-primary btn-lg">A</button>
                                        <span part="choice-text">Test</span>
                                    </div>
                                </div>
                            </section>
                        </article>
                    </div>
                </main>
                <TeamsNav />
            </GameEventContext.Provider>
        </GameContext.Provider>
    );
}

export default App;
