import { createContext } from 'react';
import { GameState } from '../model/game/game';
import { TeamColor } from '../model/game/team';
import { i18n_de } from './I18N_de';
import { i18n_en } from './I18N_en';
import { Emoji } from '../model/game/player';

export interface Labels {
    teams: TeamLabels,
    emojis: EmojiLabels,
    game: GameLabels,
    question: QuestionLabels,
    quiz: QuizLabels,
    playerEditor: PlayerEditor,
    teamEditor: TeamEditor,
    settings: Settings,
}

export type GameLabels = {
    [state in GameState]: string;
};

export type TeamLabels = {
    [color in TeamColor]: string;
};

export type EmojiLabels = {
    [emoji in Emoji]: string;
};

export interface PlayerEditor {
    labelAdd: string,
    labelName: string,
    labelPoints: string,
    labelEmoji: string,
    labelActions: string,
    labelTeam: string,
    tooltipReRollEmoji: string,
    tooltipRename: string,
    tooltipRemove: string,
    tooltipPoints: string,
    tooltipAdd: string,
    tooltipSwitchTeam: string,
    noTeam: string,
}

export interface TeamEditor {
    labelActions: string,
    labelPoints: string,
    labelSwitchColor: string,
    labelShuffle: string,
    labelClear: string,
    tooltipClear: string,
    tooltipRemove: string,
    tooltipPoints: string,
    tooltipAdd: string,
    tooltipSwitchColor: string,
    tooltipShuffle: string,
}

export interface Settings {
    tooltipModeShared: string,
    labelModeShared: string,
    tooltipModeModeration: string,
    labelModeModeration: string,
    tooltipModeParticipants: string,
    labelModeParticipants: string,
    tooltipActionParticipants: string,
    tooltipActionModeration: string,
}

export interface QuestionLabels {
    stateShowQuestion: string,
    stateShowQuestionNoBuzzer: string,
    stateBuzzerEnabled: string,
    stateTeamCanAttempt: string,
    stateQuestionComplete: string,
    actionActivateBuzzer: string,
    actionSkipAttempt: string,
    actionSkipQuestion: string,
    actionCloseQuestion: string,
    headlineActions: string,
    headlineTimer: string,
    headlineNextAttempt: string,
    headlineCurrentAttempt: string,
    noWinners: string,
    teamsWon: string,
}

export interface QuizLabels {
    nextSelectingTeam: string,
}

export function i18n(): Labels {
    const language = window.navigator.language;
    console.log('Language?', language);
    if (language && language.startsWith('en')) {
        return i18n_en;
    }
    return i18n_de;
}

export const I18N = createContext<Labels>(i18n_de);
