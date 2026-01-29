import { QuestionCell, QuizCell, QuizTable } from '../base/table';
import { arrayAsSet } from '../common';
import { JsonDynamicQuestionData, JsonStaticQuestionData } from '../quiz/json';
import { Question } from '../quiz/question';
import { Game, GameColumn, GamePage, RoundState } from './game';
import { TeamColor } from './team';
import { JsonPlayer, JsonPlayerData, restorePlayers as importPlayers, storePlayer } from './player_json';
import { JsonTeam, restoreTeams as importTeams, storeTeam } from './team_json';

/**
 * Static data for a complete quiz with all sections
 * @see Game
 */
export interface JsonStaticGameData {
    quizName?: string,
    columns?: Array<JsonStaticColumnData>,
}

export interface JsonTeamAndPlayerData extends JsonPlayerData {
    teams?: Array<JsonTeam>,
    players?: Array<JsonPlayer>,
}

/**
 * Overall game state with players, teams and the already handled questions
*/
export interface JsonUpdatableGameData extends JsonTeamAndPlayerData {
    columns?: Array<JsonDynamicSectionData>,
    selectionOrder?: Array<TeamColor>,
    state?: GamePage,
    roundsCounter?: number,
    teamNavExpanded?: boolean,
}

type OptionalGameColumn = {
    [property in keyof GameColumn as Exclude<property, 'questions'>]?: GameColumn[property]
};

/**
 * Named Group/section of questions containing static content
 * @see GameColumn
 */
export interface JsonStaticColumnData extends OptionalGameColumn {
    questions?: Array<JsonStaticQuestionData>,
}

/**
 * Named Group/section of questions containing updatable content
 */
export interface JsonDynamicSectionData extends OptionalGameColumn {
    questions?: Array<JsonDynamicQuestionData>,
}

/**
 * State of the current game round
 * @see GameRound
*/
export interface JsonCurrentRound {
    inColumn?: string,
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
    for (const section of game.columns.values()) {
        const completedQuestions: Array<JsonDynamicQuestionData> = [];
        for (const question of section.questions.values()) {
            if (question.completed) {
                completedQuestions.push(question.exportDynamicQuestionData());
            }
        }
        if (completedQuestions.length > 0) {
            sections.push({
                columnName: section.columnName,
                questions: completedQuestions,
            });
        }
    }

    return {
        teams,
        players,
        quizName: game.quizName,
        columns: sections,
        state: game.page,
        selectionOrder: game.selectionOrder,
        roundsCounter: game.roundsCounter,
        teamNavExpanded: game.teamNavExpanded,
    };
}

export function exportCurrentRound(game: Game): JsonCurrentRound {
    if (game.round) {
        return {
            inColumn: game.round.inColumn,
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
    if (!json) {
        return;
    }
    importPlayers(game, json);
    importTeams(game, json);
    importCompletedQuestions(game, json);
    if (json.state) {
        game.page = json.state;
    }
    if (json.roundsCounter) {
        game.roundsCounter = json.roundsCounter;
    }
    if (json.selectionOrder) {
        game.selectionOrder.length = 0;
        json.selectionOrder.forEach((item) => game.selectionOrder.push(item));
    }
    if (json.quizName) {
        game.quizName = json.quizName;
    } else {
        game.quizName = `Quiz ${new Date().toLocaleDateString()}`;
    }
    game.teamNavExpanded = !!json.teamNavExpanded;
}

export function getQuestion(game: Game, sectionName?: string, pointsForCompletion?: number): Question | undefined {
    if (!sectionName || pointsForCompletion === undefined) {
        return undefined;
    }
    const section = game.columns.get(sectionName);
    if (!section) {
        return undefined;
    }
    return section.questions.get(pointsForCompletion);
}

function importCompletedQuestions(game: Game, json: JsonUpdatableGameData) {
    if (!json.columns) {
        return;
    }
    for (const section of json.columns) {
        if (section.questions) {
            for (const jsonQuestion of section.questions) {
                const question
                    = getQuestion(game, section.columnName, jsonQuestion.pointsForCompletion);
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

    if (!json.question || !json.inColumn) {
        game.round = null;
        return;
    }

    const question = getQuestion(game, json.inColumn, json.question.pointsForCompletion);
    if (!question) {
        game.round = null;
        return;
    }

    question.importDynamicQuestionData(json.question);
    game.round = {
        question,
        inColumn: json.inColumn,
        state: json.state || RoundState.SHOW_QUESTION,
        teamsAlreadyAttempted: arrayAsSet(json.teamsAlreadyAttempted),
        attemptingTeams: arrayAsSet(json.attemptingTeams),
        timerStart: json.timerStart ? new Date(json.timerStart) : null,
    };
}

function compareSections(s1: JsonStaticColumnData, s2: JsonStaticColumnData): number {
    const idx1 = s1.index || -1;
    const idx2 = s2.index || -1;
    return idx1 - idx2;
}

export function generateJsonQuestionTable(
    game: JsonStaticGameData,
): QuizTable<JsonStaticQuestionData> {
    const sortedColumns: Array<JsonStaticColumnData> = game.columns ? game.columns.sort(compareSections) : [];
    const columnNames: QuizCell[] = [];
    const pointsLevels: Array<number> = [];

    // Headlines and points first
    for (const column of sortedColumns) {
        // Collect all points for each question
        for (const question of column.questions || []) {
            if (!question.pointsForCompletion || pointsLevels.includes(question.pointsForCompletion)) {
                continue;
            }
            pointsLevels.push(question.pointsForCompletion);
        }
        columnNames.push({
            label: column.columnName || '-',
            key: column.columnName || '?',
            inColumn: column.columnName || '?',
        });
    }
    // Ensure that points are sorted correctly
    pointsLevels.sort((a, b) => a - b);

    // Add questions in order of the points level
    const rows: QuestionCell<JsonStaticQuestionData>[][] = [];
    for (const points of pointsLevels) {
        const label = `${points}`;
        const row: QuestionCell<JsonStaticQuestionData>[] = [];
        for (const column of sortedColumns) {
            const key = `${column.columnName}-${points}`;
            const question = column.questions?.find((q) => q.pointsForCompletion === points);
            row.push({
                key,
                label,
                pointsForCompletion: points,
                inColumn: column.columnName || '?',
                question,
            });
        }
        rows.push(row);
    }

    return {
        columnNames,
        rows,
    };
}
