import 'bootstrap/dist/css/bootstrap.min.css';
import './game.css';
import { TeamsBottomNav } from './components/game/TeamsBottomNav';
import React, { useCallback, useEffect, useState } from 'react';
import { emptyGame, Game } from './model/game/game';
import { Changes, GameEvent } from './events/common-events';
import { GameContext, GameEventContext, GameEventListener } from './components/common/GameContext';
import { prepareGame } from './dev/dev-setup';
import { restoreGameFromStorage, storeGameInStorage } from './components/common/Storage';
import { SettingsBar } from './components/common/SettingsBar';
import { TabContext, TabSettings } from './components/common/TabContext';
import { BroadcastJson, restoreGameFromBroadcast, toBroadcastJson } from './model/broadcast';
import { i18n, I18N } from './i18n/I18N';
import { PlayerEditorView } from './components/player/PlayerEditorView';
import { MainPage } from './MainPage';
import { PlayerOverview } from './components/player/PlayerOverview';

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
            console.log('Send message to channel', update.updates);
            storeGameInStorage(update.updatedGame, update.updates);
            channel.postMessage(JSON.stringify(toBroadcastJson(update.updatedGame, update.updates)));
            setGame(update.updatedGame);
        }
    }, [game]);

    // Update the game, if another tab has changed it
    const onChannelEvent = useCallback<ChannelListener>((event: MessageEvent) => {
        console.log('Received message from channel');
        const json: BroadcastJson = JSON.parse(event.data);
        setGame(restoreGameFromBroadcast(game, json));
    }, [game]);

    // Load initial state of the game
    useEffect(() => {
        const updatedGame = restoreGameFromStorage(game, [Changes.QUIZ_CONTENT, Changes.GAME_SETUP, Changes.CURRENT_ROUND]);
        if (updatedGame.players.size === 0) {
            console.warn('No game in storage, use DEV one');
            prepareGame(updatedGame);
        }
        setGame(updatedGame);

        channel.removeEventListener('message', channelListener);
        channelListener = onChannelEvent;
        channel.addEventListener('message', channelListener);
    }, [game, onChannelEvent]);

    return (
        <GameContext.Provider value={game}>
            <GameEventContext.Provider value={onGameEvent}>
                <TabContext.Provider value={{
                    settings: tabSettings,
                    setSettings: setTabSettings,
                }}
                >
                    <I18N.Provider value={i18n()}>
                        <SettingsBar />
                        <MainPage
                            gameState={game.state}
                            tabSettings={tabSettings}
                            playerEditor={<PlayerEditorView />}
                            playerOverview={<PlayerOverview />}
                        />
                        <TeamsBottomNav />
                    </I18N.Provider>
                </TabContext.Provider>
            </GameEventContext.Provider>
        </GameContext.Provider>
    );
}

export default App;
