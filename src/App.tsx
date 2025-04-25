import 'bootstrap/dist/css/bootstrap.min.css';
import './game.css';
import { TeamsBottomNav } from './components/game/TeamsBottomNav';
import React, { useCallback, useEffect, useState } from 'react';
import { emptyGame, Game } from './model/game/game';
import { Changes, GameEvent, restoreChanges, storeChanges } from './events/common-events';
import { GameContext, GameEventContext, GameEventListener } from './components/common/GameContext';
import { prepareGame } from './dev/dev-setup';
import { restoreGame, storeGame } from './components/common/Storage';
import { SettingsBar } from './components/common/SettingsBar';
import { TabContext, TabSettings } from './components/common/TabContext';

type ChannelListener = (event: MessageEvent) => void;
const initialGame = emptyGame();
const channel = new BroadcastChannel('der-grosse-preis');
let channelListener: ChannelListener = () => {};

function App() {
    const [game, setGame] = useState<Game>(initialGame);
    const [tabSettings, setTabSettings] = useState<TabSettings>({
        editor: true,
        presenter: false,
    });

    // Update game when an event is received and store the new state
    const onGameEvent = useCallback<GameEventListener>((event: GameEvent) => {
        console.log('Game Event', event);
        const update = event.updateGame(game);
        if (update.updates.length > 0) {
            storeGame(update.updatedGame, update.updates);
            console.log('Send message to channel', update.updates);
            channel.postMessage(JSON.stringify(storeChanges(update.updates)));
            setGame(update.updatedGame);
        }
    }, [game]);

    // Update the game, if another tab has changed it
    const onChannelEvent = useCallback<ChannelListener>((event: MessageEvent) => {
        const changes = restoreChanges(JSON.parse(event.data));
        const updatedGame = restoreGame(game, changes);
        console.log('Received message from channel', event.data);
        setGame(updatedGame);
    }, []);

    // Load initial state of the game
    useEffect(() => {
        const updatedGame = restoreGame(game, [Changes.QUIZ_CONTENT, Changes.GAME_SETUP, Changes.CURRENT_ROUND]);
        if (updatedGame.players.size === 0) {
            console.warn('No game in storage, use DEV one');
            prepareGame(updatedGame);
        }
        setGame(updatedGame);

        channel.removeEventListener('message', channelListener);
        channelListener = onChannelEvent;
        channel.addEventListener('message', channelListener);
    }, []);

    return (
        <GameContext.Provider value={game}>
            <GameEventContext.Provider value={onGameEvent}>
                <TabContext.Provider value={{
                    settings: tabSettings,
                    setSettings: setTabSettings,
                }}
                >
                    <SettingsBar />
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
                    <TeamsBottomNav />
                </TabContext.Provider>
            </GameEventContext.Provider>
        </GameContext.Provider>
    );
}

export default App;
