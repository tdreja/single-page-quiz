import 'bootstrap/dist/css/bootstrap.min.css';
import './game.css';
import './images.css';
import { TeamsBottomNav } from './components/game/TeamsBottomNav';
import React, { useCallback, useEffect, useState } from 'react';
import { emptyGame, Game } from './model/game/game';
import { Changes, GameEvent } from './events/common-events';
import { GameContext, GameEventContext, GameEventListener } from './components/common/GameContext';
import { prepareGame } from './dev/dev-setup';
import { restoreGameFromStorage, storeGameInStorage, storeStaticGameData } from './components/common/Storage';
import { SettingsBar } from './components/common/SettingsBar';
import {
    readSettingsFromLocation,
    TabContext,
    TabSettings,
} from './components/common/TabContext';
import { BroadcastJson, restoreGameFromBroadcast, toBroadcastJson } from './model/broadcast';
import { i18n, I18N } from './i18n/I18N';
import { MainPage } from './pages/MainPage';
import { QuizView } from './components/quiz/QuizView';
// https://fonts.google.com/icons
import 'material-symbols';
import { exportStaticGameContent } from './model/quiz/json';
import { QuizImporterView } from './components/importer/QuizImporterView';
import { SwitchForParticipants } from './components/mode/SwitchForParticipants';
import { TeamParticipantsView } from './pages/teams/TeamParticipantsView';
import { TeamModerationView } from './pages/teams/TeamModerationView';
import { PlayerParticipantsView } from './pages/players/PlayerParticipantsView';
import { PlayerModerationView } from './pages/players/PlayerModerationView';

type ChannelListener = (event: MessageEvent) => void;
const initialGame = emptyGame();
const channel = new BroadcastChannel('der-grosse-preis');
let channelListener: ChannelListener = () => {};

function App() {
    const [game, setGame] = useState<Game>(initialGame);
    const [tabSettings, setTabSettings] = useState<TabSettings>({
        moderation: true,
        participants: true,
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

    // When settings are changed, we also change the URL
    const onChangeSettings = useCallback((settings: TabSettings) => {
        setTabSettings(settings);
        if (settings.moderation) {
            if (settings.participants) {
                document.body.setAttribute('view', 'shared');
            } else {
                document.body.setAttribute('view', 'moderation');
            }
        } else {
            document.body.setAttribute('view', 'participants');
        }
    }, [tabSettings]);

    // Load initial state of the game
    useEffect(() => {
        // Game from Storage
        const fromStorage = restoreGameFromStorage(game, [Changes.QUIZ_CONTENT, Changes.GAME_SETUP, Changes.CURRENT_ROUND]);
        if (fromStorage.players.size === 0) {
            console.warn('No game in storage, use DEV one');
            prepareGame(fromStorage);
            storeStaticGameData(exportStaticGameContent(game));
        }
        setGame(fromStorage);

        // Settings from URL
        const settings = readSettingsFromLocation();
        onChangeSettings(settings);

        // Handle messages
        channel.removeEventListener('message', channelListener);
        channelListener = onChannelEvent;
        channel.addEventListener('message', channelListener);
    }, []);

    return (
        <GameContext.Provider value={game}>
            <GameEventContext.Provider value={onGameEvent}>
                <TabContext.Provider value={{
                    settings: tabSettings,
                    setSettings: onChangeSettings,
                }}
                >
                    <I18N.Provider value={i18n()}>
                        <SettingsBar />
                        <MainPage
                            gameState={game.state}
                            players={
                                <SwitchForParticipants
                                    participants={<PlayerParticipantsView />}
                                    moderation={<PlayerModerationView />}
                                    shared={<PlayerModerationView />}
                                />
                            }
                            teams={
                                <SwitchForParticipants
                                    participants={<TeamParticipantsView />}
                                    moderation={<TeamModerationView />}
                                    shared={<TeamModerationView />}
                                />
                            }
                            quiz={
                                <SwitchForParticipants
                                    participants={<QuizView />}
                                    moderation={<QuizView />}
                                    shared={<QuizView />}
                                />
                            }
                            importQuiz={
                                <SwitchForParticipants
                                    participants={<QuizImporterView />}
                                    moderation={<QuizImporterView />}
                                    shared={<QuizImporterView />}
                                />
                            }
                        />
                        <TeamsBottomNav />
                    </I18N.Provider>
                </TabContext.Provider>
            </GameEventContext.Provider>
        </GameContext.Provider>
    );
}

export default App;
