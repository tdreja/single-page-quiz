import 'bootstrap/dist/css/bootstrap.min.css';
import './game.css';
import { TeamsNav } from './components/game/TeamsNav';
import React, { useCallback, useEffect, useState } from 'react';
import { emptyGame, Game } from './model/game/game';
import { Changes, GameEvent, restoreChanges, storeChanges } from './events/common-events';
import { GameContext, GameEventContext, GameEventListener } from './components/common/GameContext';
import { prepareGame } from './dev/dev-setup';
import { restoreGame, storeGame } from './components/common/Storage';

type ChannelListener = (event: MessageEvent) => void;

function App() {
    const [channel, setChannel] = useState<BroadcastChannel | null>(null);
    const [game, setGame] = useState<Game>(emptyGame());

    // Update game when an event is received and store the new state
    const onGameEvent = useCallback<GameEventListener>((event: GameEvent) => {
        const update = event.updateGame(game);
        if (update.updates.length > 0) {
            storeGame(update.updatedGame, update.updates);
            if (channel) {
                channel.postMessage(JSON.stringify(storeChanges(update.updates)));
            }
            console.log('Send updates', update.updates);
            setGame(update.updatedGame);
        }
    }, [game]);

    // Update the game, if another tab has changed it
    const onChannelEvent = useCallback<ChannelListener>((event: MessageEvent) => {
        const changes = restoreChanges(JSON.parse(event.data));
        console.log('Receive updates', changes, event.data);
        const updatedGame = restoreGame(game, changes);
        setGame(updatedGame);
    }, []);

    // Load initial state of the game
    useEffect(() => {
        const updatedGame = restoreGame(game, [Changes.QUIZ_CONTENT, Changes.GAME_SETUP, Changes.CURRENT_ROUND]);
        if (updatedGame.players.size === 0) {
            prepareGame(updatedGame);
        }
        setGame(updatedGame);

        if (channel == null) {
            const newChannel = new BroadcastChannel('der-grosse-preis');
            setChannel(newChannel);
            newChannel.onmessage = onChannelEvent;
        }
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
