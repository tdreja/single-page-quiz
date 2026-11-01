import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { settingsToSearch, TabContext, TabType } from '../../components/mode/TabContext';
import { GameContext, GameEventContext } from '../../components/common/GameContext';
import { GamePage } from '../../model/game/game';
import { SwitchPageEvent } from '../../events/setup-events';
import { I18N, Labels } from '../../i18n/I18N';

interface Symbol {
    symbol: string,
    label: (i18n: Labels) => string,
    tooltip: (i18n: Labels) => string,
}
const modeShared: Symbol = {
    symbol: 'communication',
    label: (i18n) => i18n.settings.labelModeShared,
    tooltip: (i18n) => i18n.settings.tooltipModeShared,
};
const modeModeration: Symbol = {
    symbol: 'clinical_notes',
    label: (i18n) => i18n.settings.labelModeModeration,
    tooltip: (i18n) => i18n.settings.tooltipModeModeration,
};
const modeParticipants: Symbol = {
    symbol: 'monitor',
    label: (i18n) => i18n.settings.labelModeParticipants,
    tooltip: (i18n) => i18n.settings.tooltipModeParticipants,
};
const actionOpenParticipants: Symbol = {
    symbol: 'open_in_browser',
    label: () => '',
    tooltip: (i18n) => i18n.settings.tooltipActionParticipants,
};
const actionOpenModeration: Symbol = {
    symbol: 'clinical_notes',
    label: () => '',
    tooltip: (i18n) => i18n.settings.tooltipActionModeration,
};

export const SettingsBar = (): ReactElement => {
    const game = useContext(GameContext);
    const onGameUpdate = useContext(GameEventContext);
    const tabSettings = useContext(TabContext);
    const i18n = useContext(I18N);
    const [mode, setMode] = useState<Symbol>(modeShared);
    const [action, setAction] = useState<Symbol>(actionOpenParticipants);

    const changeState = (state: GamePage): void => {
        onGameUpdate(new SwitchPageEvent(state));
    };

    useEffect(() => {
        switch (tabSettings.tabType) {
            case TabType.PARTICIPANTS:
                setMode(modeParticipants);
                setAction(actionOpenModeration);
                break;
            case TabType.MODERATION:
                setMode(modeModeration);
                setAction(actionOpenParticipants);
                break;
            default:
                setMode(modeShared);
                setAction(actionOpenParticipants);
                break;
        }
    }, [tabSettings]);

    const onModeClick = useCallback(() => {
        switch (tabSettings.tabType) {
            case TabType.PARTICIPANTS:
                return;
            case TabType.MODERATION:
                tabSettings.setTabType(TabType.SHARED);
                return;
            default:
                tabSettings.setTabType(TabType.MODERATION);
                return;
        }
    }, [tabSettings]);

    const onActionClick = useCallback(() => {
        switch (tabSettings.tabType) {
            // Open Editor
            case TabType.PARTICIPANTS:
                window.open(settingsToSearch(TabType.MODERATION), '_blank');
                return;
            // Open Presentation
            default:
                window.open(settingsToSearch(TabType.PARTICIPANTS), '_blank');
                return;
        }
    }, [tabSettings]);

    return (
        <nav id="top-nav" className="dark-background">
            <div className="app-brand">
                <span className="app-logo">
                    <span className="trophy" />
                </span>
                <span className="app-brand-text">
                    {i18n.settings.appTitle}
                    <small>{i18n.settings.appSubtitle}</small>
                </span>
            </div>
            <ul className="nav app-tabs">
                <li className={`nav-item nav-link ${game.page === GamePage.GAME_ACTIVE ? 'active' : ''}`} onClick={() => changeState(GamePage.GAME_ACTIVE)}>
                    {i18n.game['game-active']}
                </li>
                <li className={`nav-item nav-link ${game.page === GamePage.PLAYER_SETUP ? 'active' : ''}`} onClick={() => changeState(GamePage.PLAYER_SETUP)}>
                    {i18n.game['player-setup']}
                </li>
                <li className={`nav-item nav-link ${game.page === GamePage.TEAM_SETUP ? 'active' : ''}`} onClick={() => changeState(GamePage.TEAM_SETUP)}>
                    {i18n.game['team-setup']}
                </li>
                <li className={`nav-item nav-link ${game.page === GamePage.EDIT_QUIZ ? 'active' : ''}`} onClick={() => changeState(GamePage.EDIT_QUIZ)}>
                    {i18n.game['edit-quiz']}
                </li>
                <li className={`nav-item nav-link ${game.page === GamePage.IMPORT_QUIZ ? 'active' : ''}`} onClick={() => changeState(GamePage.IMPORT_QUIZ)}>
                    {i18n.game['import-quiz']}
                </li>
            </ul>
            <div className="app-topbar-actions">
                <span
                    className="btn app-topbar-btn"
                    title={mode.tooltip(i18n)}
                    onClick={onModeClick}
                >
                    <span className="material-symbols-outlined">
                        {mode.symbol}
                    </span>
                    {mode.label(i18n) && <span className="app-topbar-label">{mode.label(i18n)}</span>}
                </span>
                <span
                    className="btn app-topbar-btn material-symbols-outlined"
                    title={action.tooltip(i18n)}
                    onClick={onActionClick}
                >
                    {action.symbol}
                </span>
            </div>
        </nav>
    );
};
