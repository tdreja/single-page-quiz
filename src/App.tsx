import 'bootstrap/dist/css/bootstrap.min.css';
import './game.css';
import './images.css';
import React, { useCallback, useEffect, useState } from 'react';
import { emptyGame, Game, GamePage } from './model/game/game';
import { Changes, GameEvent } from './events/common-events';
import { GameContext, GameEventContext, GameEventListener } from './components/common/GameContext';
import { restoreGameFromStorage, storeGameInStorage } from './components/common/Storage';
import { SettingsBar } from './sections/top/SettingsBar';
import { readSettingsFromLocation, TabContext, TabType } from './components/mode/TabContext';
import { BroadcastJson, restoreGameFromBroadcast, toBroadcastJson } from './model/broadcast';
import { i18n, I18N } from './i18n/I18N';
import { MainPage, SubPage } from './pages/MainPage';
// https://fonts.google.com/icons
import 'material-symbols/outlined.css';
import { QuizImporterView } from './pages/importer/QuizImporterView';
import { TeamsPageForParticipants } from './pages/teams/TeamsPageForParticipants';
import { PlayersPageForParticipants } from './pages/players/PlayersPageForParticipants';
import { TeamsBottomNav } from './sections/bottom/TeamsBottomNav';
import { PlayersPageForModeration } from './pages/players/PlayersPageForModeration';
import { TeamsPageForModeration } from './pages/teams/TeamsPageForModeration';
import { QuizParticipantsPage } from './pages/quiz/QuizParticipantsPage';
import { QuizModerationPage } from './pages/quiz/QuizModerationPage';
import { debugLog } from './components/common/Logging';
import { Dialog, DialogContext, DialogWrapper } from './components/mode/DialogContext';
import { DialogView } from './components/common/DialogView';

type ChannelListener = (event: MessageEvent) => void;
const initialGame = emptyGame();
const channel = new BroadcastChannel('der-grosse-preis');
let channelListener: ChannelListener = () => {
};

/**
 * Main entry point of the application.
 * Initializes the game state, sets up event listeners, and renders the main application components.
 * It uses React's context API to provide the game state and event handlers to child components.
 */
function App() {
    const [game, setGame] = useState<Game>(initialGame);
    const [tabType, setTabType] = useState<TabType>(TabType.SHARED);
    const [dialog, setDialog] = useState<Dialog | undefined>({
        title: '',
        message: '',
        onYesClick: () => {},
        onNoClick: () => {},
        onCloseClick: () => {},
    });

    // Update game when an event is received and store the new state
    const onGameEvent = useCallback<GameEventListener>((event: GameEvent) => {
        debugLog('Received Game Event', event);
        const update = event.updateGame(game);
        if (update.updates.length > 0) {
            debugLog('Game updated by event', event, 'Updates?', update.updates, 'Sending message to channel', 'New Game State', game);
            storeGameInStorage(update.updatedGame, update.updates);
            channel.postMessage(JSON.stringify(toBroadcastJson(update.updatedGame, update.updates)));
            setGame(update.updatedGame);
        }
    }, [game]);

    // Update the game, if another tab has changed it
    const onChannelEvent = useCallback<ChannelListener>((event: MessageEvent) => {
        debugLog('Received message from channel', event.data);
        const json: BroadcastJson = JSON.parse(event.data);
        setGame(restoreGameFromBroadcast(game, json));
    }, [game]);

    // When settings are changed, we also change the URL
    const onChangeSettings = useCallback((newTabType: TabType) => {
        switch (newTabType) {
            case TabType.MODERATION:
                document.body.setAttribute('view', 'moderation');
                break;
            case TabType.PARTICIPANTS:
                document.body.setAttribute('view', 'participants');
                break;
            default:
                document.body.setAttribute('view', 'shared');
                break;
        }
        setTabType(newTabType);
    }, [tabType]);

    // Load initial state of the game
    useEffect(() => {
        // Game from Storage
        const fromStorage = restoreGameFromStorage(game, [Changes.QUIZ_CONTENT, Changes.GAME_SETUP, Changes.CURRENT_ROUND]);
        setGame(fromStorage);

        // Settings from URL
        const newTabType = readSettingsFromLocation();
        onChangeSettings(newTabType);

        // Handle messages
        channel.removeEventListener('message', channelListener);
        channelListener = onChannelEvent;
        channel.addEventListener('message', channelListener);
    }, []);

    return (
        <GameContext.Provider value={game}>
            <GameEventContext.Provider value={onGameEvent}>
                <TabContext.Provider value={{ tabType, setTabType: onChangeSettings }}>
                    <I18N.Provider value={i18n()}>
                        <DialogContext.Provider value={{ dialog, setDialog }}>
                            <DialogView dialog={dialog} setDialog={setDialog} />
                            <SettingsBar />
                            <MainPage>
                                {/* Players */}
                                <SubPage state={GamePage.PLAYER_SETUP} tabType={[TabType.PARTICIPANTS]}>
                                    <PlayersPageForParticipants />
                                </SubPage>
                                <SubPage state={GamePage.PLAYER_SETUP} tabType={[TabType.MODERATION, TabType.SHARED]}>
                                    <PlayersPageForModeration />
                                </SubPage>

                                {/* Teams */}
                                <SubPage state={GamePage.TEAM_SETUP} tabType={[TabType.PARTICIPANTS]}>
                                    <TeamsPageForParticipants />
                                </SubPage>
                                <SubPage state={GamePage.TEAM_SETUP} tabType={[TabType.MODERATION, TabType.SHARED]}>
                                    <TeamsPageForModeration />
                                </SubPage>

                                {/* Import */}
                                <SubPage state={GamePage.IMPORT_QUIZ} tabType={[TabType.MODERATION]}>
                                    <QuizImporterView shared={false} />
                                </SubPage>
                                <SubPage state={GamePage.IMPORT_QUIZ} tabType={[TabType.SHARED]}>
                                    <QuizImporterView shared={true} />
                                </SubPage>

                                {/* Quiz */}
                                <SubPage state={GamePage.GAME_ACTIVE} tabType={[TabType.PARTICIPANTS]}>
                                    <QuizParticipantsPage />
                                </SubPage>
                                <SubPage state={GamePage.GAME_ACTIVE} tabType={[TabType.SHARED]}>
                                    <QuizModerationPage shared={true} />
                                </SubPage>
                                <SubPage state={GamePage.GAME_ACTIVE} tabType={[TabType.MODERATION]}>
                                    <QuizModerationPage shared={false} />
                                </SubPage>
                            </MainPage>
                            <TeamsBottomNav />
                        </DialogContext.Provider>
                    </I18N.Provider>
                </TabContext.Provider>
            </GameEventContext.Provider>
        </GameContext.Provider>
    );
}

export default App;
