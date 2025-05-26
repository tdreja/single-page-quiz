import { createContext } from 'react';
import { GameState } from '../model/game/game';
import { TeamColor } from '../model/game/team';
import { i18n_de } from './I18N_de';
import { i18n_en } from './I18N_en';
import { Emoji } from '../model/game/player';
import { QuestionType } from '../model/quiz/question';

/**
 * Overall API with all translations used by the application
 **/
export interface Labels {
    teams: TeamLabels,
    emojis: EmojiLabels,
    game: GameLabels,
    importer: QuizImportLabels,
    question: QuestionLabels,
    questionTypes: QuestionTypeLabels,
    quiz: QuizLabels,
    playerEditor: PlayerEditor,
    teamEditor: TeamEditor,
    settings: Settings,
}

/**
 * Labels for all game states.
 */
export type GameLabels = {
    [state in GameState]: string;
};

/**
 * Labels for team colors.
 */
export type TeamLabels = {
    [color in TeamColor]: string;
};

/**
 * Labels for emojis used in the game.
 */
export type EmojiLabels = {
    [emoji in Emoji]: string;
};

/**
 * Labels for question types.
 * Maps each QuestionType to a human-readable string.
*/
export type QuestionTypeLabels = {
    [type in QuestionType]: string;
};

/**
 * Labels used in the player editor page
 */
export interface PlayerEditor {
    labelAdd: string,
    labelName: string,
    labelPoints: string,
    labelEmoji: string,
    labelActions: string,
    labelTeam: string,
    labelResetAll: string,
    labelRemoveAll: string,
    tooltipReRollEmoji: string,
    tooltipRename: string,
    tooltipResetAll: string,
    tooltipRemove: string,
    tooltipRemoveAll: string,
    tooltipPoints: string,
    tooltipAdd: string,
    tooltipSwitchTeam: string,
    noTeam: string,
}

/**
 * Labels used in the team editor page
 */
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

/**
 * Labels for the top settings bar.
 */
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

/**
 * Labels used in the question page.
 */
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
    actionCompleteQuestion: string,
    headlineStatus: string,
    headlineCompleteActions: string,
    headlineCompletionPercent: string,
    headlineTimer: string,
    headlineNextAttempt: string,
    headlineCurrentAttempt: string,
    noWinners: string,
    teamsWon: string,
}

/**
 * Labels used in the quiz overview page.
*/
export interface QuizLabels {
    nextSelectingTeam: string,
    columns: string,
    nextTeamHeader: string,
}

/**
 * Labels for the quiz importer page.
 */
export interface QuizImportLabels {
    actionCancel: string,
    actionApply: string,
    formHeader: string,
    noFileUploadedHeader: string,
    quizUploadedHeader: string,
    playersUploadedHeader: string,
    teamsUploadedHeader: string,
    noNewQuizUploaded: string,
}

/**
 * Fetches the appropriate labels based on the user's language settings.
 * Defaults to English if no specific language is detected.
 */
export function i18n(): Labels {
    const language = window.navigator.language;
    if (language && language.startsWith('de')) {
        return i18n_de;
    }
    return i18n_en;
}

export const I18N = createContext<Labels>(i18n_de);
