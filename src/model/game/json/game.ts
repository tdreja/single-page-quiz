import { arrayAsSet } from '../../common';
import { JsonDynamicQuestionData, JsonStaticQuestionData } from '../../quiz/json';
import { Question } from '../../quiz/question';
import { Game, GameSection, GameState, QuestionTableCell, RoundState } from '../game';
import { TeamColor } from '../team';
import { JsonPlayer, restorePlayers as importPlayers, storePlayer } from './player';
import { JsonTeam, restoreTeams as importTeams, storeTeam } from './team';

/**
 * Static data for a complete quiz with all sections
 * @see Game
 */
export interface JsonStaticGameData {
    sections?: Array<JsonStaticSectionData>,
}

/**
 * Overall game state with players, teams and the already handled questions
*/
export interface JsonUpdatableGameData {
    teams?: Array<JsonTeam>,
    players?: Array<JsonPlayer>,
    sections?: Array<JsonDynamicSectionData>,
    state?: GameState,
    roundsCounter?: number,
    teamNavExpanded?: boolean,
}

type OptionalGameSection = {
    [property in keyof GameSection as Exclude<property, 'questions'>]?: GameSection[property]
};

/**
 * Named Group/section of questions containing static content
 * @see GameSection
 */
export interface JsonStaticSectionData extends OptionalGameSection {
    questions?: Array<JsonStaticQuestionData>,
}

/**
 * Named Group/section of questions containing updatable content
 */
export interface JsonDynamicSectionData extends OptionalGameSection {
    questions?: Array<JsonDynamicQuestionData>,
}

/**
 * State of the current game round
 * @see GameRound
*/
export interface JsonCurrentRound {
    inSectionName?: string,
    question?: JsonDynamicQuestionData,
    attemptingTeams?: Array<TeamColor>,
    teamsAlreadyAttempted?: Array<TeamColor>,
    state?: RoundState,
    timerStart?: string,
}

export function exportGame(game: Game): JsonUpdatableGameData {
    // Export all players and teams
    const players = Array.from(game.players.values()).map((player) => storePlayer(player));
    const teams = Array.from(game.teams.values()).map((team) => storeTeam(team));

    // Only export already completed questions
    const sections: Array<JsonDynamicSectionData> = [];
    for (const section of game.sections.values()) {
        const completedQuestions: Array<JsonDynamicQuestionData> = [];
        for (const question of section.questions.values()) {
            if (question.completed) {
                completedQuestions.push(question.exportDynamicQuestionData());
            }
        }
        if (completedQuestions.length > 0) {
            sections.push({
                sectionName: section.sectionName,
                questions: completedQuestions,
            });
        }
    }

    return {
        teams,
        players,
        sections,
        state: game.state,
        roundsCounter: game.roundsCounter,
        teamNavExpanded: game.teamNavExpanded,
    };
}

export function exportCurrentRound(game: Game): JsonCurrentRound {
    if (game.round) {
        return {
            inSectionName: game.round.inSectionName,
            question: game.round.question.exportDynamicQuestionData(),
            attemptingTeams: Array.from(game.round.attemptingTeams),
            teamsAlreadyAttempted: Array.from(game.round.teamsAlreadyAttempted),
            timerStart: game.round.timerStart ? game.round.timerStart.toJSON() : undefined,
            state: game.round.state,
        };
    }
    return {};
}

export function importGame(game: Game, json?: JsonUpdatableGameData) {
    console.warn('Import JSON', json);
    if (!json) {
        return;
    }
    importPlayers(game, json);
    importTeams(game, json);
    importCompletedQuestions(game, json);
    if (json.state) {
        game.state = json.state;
    }
    if (json.roundsCounter) {
        game.roundsCounter = json.roundsCounter;
    }
    game.teamNavExpanded = !!json.teamNavExpanded;
}

export function getQuestion(game: Game, sectionName?: string, pointsForCompletion?: number): Question | undefined {
    if (!sectionName || pointsForCompletion === undefined) {
        return undefined;
    }
    const section = game.sections.get(sectionName);
    if (!section) {
        return undefined;
    }
    return section.questions.get(pointsForCompletion);
}

function importCompletedQuestions(game: Game, json: JsonUpdatableGameData) {
    if (!json.sections) {
        return;
    }
    for (const section of json.sections) {
        if (section.questions) {
            for (const jsonQuestion of section.questions) {
                const question
                    = getQuestion(game, section.sectionName, jsonQuestion.pointsForCompletion);
                if (question) {
                    question.importDynamicQuestionData(jsonQuestion);
                }
            }
        }
    }
}

export function importCurrentRound(game: Game, json?: JsonCurrentRound) {
    if (!json) {
        return;
    }

    if (!json.question || !json.inSectionName) {
        game.round = null;
        return;
    }

    const question = getQuestion(game, json.inSectionName, json.question.pointsForCompletion);
    if (!question) {
        game.round = null;
        return;
    }

    question.importDynamicQuestionData(json.question);
    game.round = {
        question,
        inSectionName: json.inSectionName,
        state: json.state || RoundState.SHOW_QUESTION,
        teamsAlreadyAttempted: arrayAsSet(json.teamsAlreadyAttempted),
        attemptingTeams: arrayAsSet(json.attemptingTeams),
        timerStart: json.timerStart ? new Date(json.timerStart) : null,
    };
}

function compareSections(s1: JsonStaticSectionData, s2: JsonStaticSectionData): number {
    const idx1 = s1.index || -1;
    const idx2 = s2.index || -1;
    return idx1 - idx2;
}

export function generateJsonQuestionMatrix<ITEM>(
    game: JsonStaticGameData,
    getItem: (section?: JsonStaticSectionData, question?: JsonStaticQuestionData) => ITEM | undefined,
): Array<QuestionTableCell<ITEM>> {
    const result: QuestionTableCell<ITEM>[] = [];
    const sortedSections: Array<JsonStaticSectionData> = game.sections ? game.sections.sort(compareSections) : [];
    const pointsLevels: Array<number> = [];

    // Headlines and points first
    for (const section of sortedSections) {
        // Collect all points for each question
        for (const question of section.questions || []) {
            if (!question.pointsForCompletion || pointsLevels.includes(question.pointsForCompletion)) {
                continue;
            }
            pointsLevels.push(question.pointsForCompletion);
        }
        result.push({
            label: section.sectionName || '',
            key: section.sectionName || '?',
            inSection: section.sectionName,
            item: getItem(section),
        });
    }
    // Ensure that points are sorted correctly
    pointsLevels.sort((a, b) => a - b);

    // Add questions in order of the points level
    for (const points of pointsLevels) {
        for (const section of sortedSections) {
            const question = section.questions?.find((q) => q.pointsForCompletion === points);
            result.push({
                label: question ? `${points}` : '-',
                inSection: question ? section.sectionName : undefined,
                pointsForCompletion: question ? points : undefined,
                key: `${section}-${question ? points : '?'}`,
                item: getItem(section, question),
            });
        }
    }

    return result;
}
