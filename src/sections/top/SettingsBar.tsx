import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { settingsToSearch, TabContext, TabType } from '../../components/mode/TabContext';
import { GameContext, GameEventContext } from '../../components/common/GameContext';
import { GameState } from '../../model/game/game';
import { SwitchStateEvent } from '../../events/setup-events';
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

    const changeState = (state: GameState): void => {
        onGameUpdate(new SwitchStateEvent(state));
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
        <nav id="top-nav" className="navbar sticky-top dark-background d-flex align-items-end pb-0 pt-0 justify-content-between ps-2 pe-2">
            <ul className="nav nav-tabs">
                <li className={`nav-item nav-link ${game.state === GameState.GAME_ACTIVE ? 'active' : ''}`} onClick={() => changeState(GameState.GAME_ACTIVE)}>
                    {i18n.game['game-active']}
                </li>
                <li className={`nav-item nav-link ${game.state === GameState.PLAYER_SETUP ? 'active' : ''}`} onClick={() => changeState(GameState.PLAYER_SETUP)}>
                    {i18n.game['player-setup']}
                </li>
                <li className={`nav-item nav-link ${game.state === GameState.TEAM_SETUP ? 'active' : ''}`} onClick={() => changeState(GameState.TEAM_SETUP)}>
                    {i18n.game['team-setup']}
                </li>
                <li className={`nav-item nav-link ${game.state === GameState.IMPORT_QUIZ ? 'active' : ''}`} onClick={() => changeState(GameState.IMPORT_QUIZ)}>
                    Import Quiz
                </li>
            </ul>
            <div className="d-flex mb-2 mt-2 gap-2">
                <span
                    className="btn btn-outline-light btn-outline-dark-background d-flex align-items-center gap-2"
                    title={mode.tooltip(i18n)}
                    onClick={onModeClick}
                >
                    <span className="material-symbols-outlined">
                        {mode.symbol}
                    </span>
                    {mode.label(i18n)}
                </span>
                <span
                    className="btn material-symbols-outlined btn-outline-light btn-outline-dark-background"
                    title={action.tooltip(i18n)}
                    onClick={onActionClick}
                >
                    {action.symbol}
                </span>
            </div>
        </nav>
    );
};
