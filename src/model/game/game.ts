import { Team, TeamColor } from './team';
import { Emoji, Player } from './player';
import { Question } from '../quiz/question';
import { QuestionCell, QuizCell, QuizTable } from '../base/table';

/**
 * What pages is currently shown?
*/
export enum GamePage {
    IMPORT_QUIZ = 'import-quiz',
    TEAM_SETUP = 'team-setup',
    PLAYER_SETUP = 'player-setup',
    CONTROLLER_SETUP = 'controller-setup',
    GAME_ACTIVE = 'game-active',
}

/**
 * Describes at which point of the current round we are
 */
export enum RoundState {
    SHOW_QUESTION = 'show-question',
    BUZZER_ACTIVE = 'buzzer-active',
    TEAM_CAN_ATTEMPT = 'team-can-attempt',
    SHOW_RESULTS = 'show-results',
}

/**
 * Group of rounds with a name associated (e.g. category of questions)
 */
export interface GameColumn {
    readonly columnName: string,
    readonly questions: Map<number, Question>,
    readonly index: number,
}

/**
 * One round, aka one active question in the game.
 * Each question creates a new round.
 */
export interface GameRound {
    readonly inColumn: string,
    readonly question: Question,
    readonly attemptingTeams: Set<TeamColor>,
    readonly teamsAlreadyAttempted: Set<TeamColor>,
    state: RoundState,
    timerStart: Date | null,
}

/**
 * Container with all game data
 */
export interface Game {
    readonly columns: Map<string, GameColumn>,
    readonly players: Map<Emoji, Player>,
    readonly teams: Map<TeamColor, Team>,
    readonly selectionOrder: Array<TeamColor>,
    quizName: string,
    round: GameRound | null,
    roundsCounter: number,
    page: GamePage,
    teamNavExpanded: boolean,
}

/**
 * Starting point for a new game.
 */
export function emptyGame(): Game {
    return {
        columns: new Map(),
        players: new Map(),
        teams: new Map(),
        selectionOrder: [],
        quizName: '',
        round: null,
        roundsCounter: 0,
        page: GamePage.TEAM_SETUP,
        teamNavExpanded: false,
    };
}

export function getTeams(game: Game, colors?: Array<TeamColor> | Set<TeamColor>): Array<Team> {
    if (!colors) {
        return [];
    }
    const teams: Array<Team> = [];
    for (const color of colors) {
        const team = game.teams.get(color);
        if (team) {
            teams.push(team);
        }
    }
    return teams;
}

export function sortGameSectionsByIndex(section1?: GameColumn, section2?: GameColumn): number {
    const idx1 = section1 ? section1.index : -1;
    const idx2 = section2 ? section2.index : -1;
    return idx1 - idx2;
}

/**
 * Generates the table data for the quiz table from the game object.
 */
export function generateQuestionTable(
    game: Game,
): QuizTable<Question> {
    const columnOrder: Array<string> = [];
    const pointsLevels: Array<number> = [];

    // Headlines first
    const columnNames: QuizCell[] = [];
    Array.from(game.columns.values()).sort(sortGameSectionsByIndex).map((column) => {
        columnOrder.push(column.columnName);
        columnNames.push({
            label: column.columnName,
            key: column.columnName,
            inColumn: column.columnName,
        });
        // Also collect all points for each question
        column.questions.values().forEach((question) => {
            if (!pointsLevels.includes(question.pointsForCompletion)) {
                pointsLevels.push(question.pointsForCompletion);
            }
        });
    });
    // Ensure that points are sorted correctly
    pointsLevels.sort((a, b) => a - b);

    // Now add the question matrix
    const rows: QuestionCell<Question>[][] = [];
    for (const questionPoints of pointsLevels) {
        const row: QuestionCell<Question>[] = [];
        const label = `${questionPoints}`;

        for (const columnId of columnOrder) {
            const key = `${columnId}-${questionPoints}`;

            const column = game.columns.get(columnId);
            if (!column) {
                row.push({
                    label,
                    key,
                    inColumn: columnId,
                    pointsForCompletion: questionPoints,
                });
                continue;
            }

            const question = column.questions.get(questionPoints);
            row.push({
                label,
                key,
                inColumn: columnId,
                pointsForCompletion: questionPoints,
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
