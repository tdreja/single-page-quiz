import 'bootstrap/dist/css/bootstrap.min.css';
import './game.css';
import './images.css';
import React, { useCallback, useEffect, useState } from 'react';
import { emptyGame, Game, GameState } from './model/game/game';
import { Changes, GameEvent } from './events/common-events';
import { GameContext, GameEventContext, GameEventListener } from './components/common/GameContext';
import { prepareGame } from './dev/dev-setup';
import { restoreGameFromStorage, storeGameInStorage, storeStaticGameData } from './components/common/Storage';
import { SettingsBar } from './sections/top/SettingsBar';
import { readSettingsFromLocation, TabContext, TabSettings, TabType } from './components/mode/TabContext';
import { BroadcastJson, restoreGameFromBroadcast, toBroadcastJson } from './model/broadcast';
import { i18n, I18N } from './i18n/I18N';
import { MainPage, SubPage } from './pages/MainPage';
// https://fonts.google.com/icons
import 'material-symbols';
import { exportStaticGameContent } from './model/quiz/json';
import { QuizImporterView } from './pages/importer/QuizImporterView';
import { TeamsPageForParticipants } from './pages/teams/TeamsPageForParticipants';
import { PlayersPageForParticipants } from './pages/players/PlayersPageForParticipants';
import { TeamsBottomNav } from './sections/bottom/TeamsBottomNav';
import { QuizPage } from './pages/quiz/QuizPage';
import { QuestionSelectionPage } from './pages/quiz/overview/QuestionSelectionPage';
import { QuestionPageForParticipants } from './pages/quiz/questions/QuestionPageForParticipants';
import { PlayersPageForModeration } from './pages/players/PlayersPageForModeration';
import { TeamsPageForModeration } from './pages/teams/TeamsPageForModeration';
import { QuizParticipantsPage } from './pages/quiz/QuizParticipantsPage';
import { QuizModerationPage } from './pages/quiz/QuizModerationPage';

type ChannelListener = (event: MessageEvent) => void;
const initialGame = emptyGame();
const channel = new BroadcastChannel('der-grosse-preis');
let channelListener: ChannelListener = () => {
};

function App() {
    const [game, setGame] = useState<Game>(initialGame);
    const [tabType, setTabType] = useState<TabType>(TabType.SHARED);

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
        if (fromStorage.players.size === 0) {
            console.warn('No game in storage, use DEV one');
            prepareGame(fromStorage);
            storeStaticGameData(exportStaticGameContent(game));
        }
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
                        <SettingsBar />
                        <MainPage>
                            {/* Players */}
                            <SubPage state={GameState.PLAYER_SETUP} tabType={[TabType.PARTICIPANTS]}>
                                <PlayersPageForParticipants />
                            </SubPage>
                            <SubPage state={GameState.PLAYER_SETUP} tabType={[TabType.MODERATION, TabType.SHARED]}>
                                <PlayersPageForModeration />
                            </SubPage>

                            {/* Teams */}
                            <SubPage state={GameState.TEAM_SETUP} tabType={[TabType.PARTICIPANTS]}>
                                <TeamsPageForParticipants />
                            </SubPage>
                            <SubPage state={GameState.TEAM_SETUP} tabType={[TabType.MODERATION, TabType.SHARED]}>
                                <TeamsPageForModeration />
                            </SubPage>

                            {/* Import */}
                            <SubPage state={GameState.IMPORT_QUIZ} tabType={[TabType.MODERATION, TabType.SHARED]}>
                                <QuizImporterView />
                            </SubPage>

                            {/* Quiz */}
                            <SubPage state={GameState.GAME_ACTIVE} tabType={[TabType.PARTICIPANTS]}>
                                <QuizParticipantsPage />
                            </SubPage>
                            <SubPage state={GameState.GAME_ACTIVE} tabType={[TabType.SHARED]}>
                                <QuizModerationPage shared={true} />
                            </SubPage>
                            <SubPage state={GameState.GAME_ACTIVE} tabType={[TabType.MODERATION]}>
                                <QuizModerationPage shared={false} />
                            </SubPage>
                        </MainPage>
                        <TeamsBottomNav />
                    </I18N.Provider>
                </TabContext.Provider>
            </GameEventContext.Provider>
        </GameContext.Provider>
    );
}

export default App;
