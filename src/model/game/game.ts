import { Team, TeamColor } from './team';
import { Emoji, Player } from './player';
import { Question } from '../quiz/question';

export enum GameState {
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
    round: GameRound | null,
    roundsCounter: number,
    state: GameState,
    teamNavExpanded: boolean,
}

export function emptyGame(): Game {
    return {
        columns: new Map(),
        players: new Map(),
        teams: new Map(),
        round: null,
        roundsCounter: 0,
        state: GameState.TEAM_SETUP,
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

export interface QuestionTable<ITEM> {
    readonly headlines: QuestionTableCell<ITEM>[],
    readonly rows: QuestionTableCell<ITEM>[][],
}

export interface QuestionTableCell<ITEM> {
    readonly label: string,
    readonly key: string,
    readonly inSection?: string,
    readonly pointsForCompletion?: number,
    readonly item?: ITEM,
}

export function generateQuestionTable<ITEM>(
    game: Game,
    getItem: (column?: GameColumn, question?: Question) => ITEM | undefined,
): QuestionTable<ITEM> {
    const columnOrder: Array<string> = [];
    const pointsLevels: Array<number> = [];

    // Headlines first
    const headlines: QuestionTableCell<ITEM>[] = [];
    Array.from(game.columns.values()).sort(sortGameSectionsByIndex).map((column) => {
        columnOrder.push(column.columnName);
        headlines.push({
            label: column.columnName,
            key: column.columnName,
            inSection: column.columnName,
            item: getItem(column),
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
    const rows: QuestionTableCell<ITEM>[][] = [];
    for (const questionPoints of pointsLevels) {
        const row: QuestionTableCell<ITEM>[] = [];

        for (const columnId of columnOrder) {
            const column = game.columns.get(columnId);
            if (!column) {
                row.push({
                    label: '-',
                    key: '?',
                    item: getItem(),
                });
                continue;
            }

            const question = column.questions.get(questionPoints);
            row.push({
                label: `${questionPoints}`,
                inSection: question ? columnId : undefined,
                pointsForCompletion: question ? questionPoints : undefined,
                key: `${columnId}-${question ? questionPoints : '?'}`,
                item: getItem(column, question),
            });
        }

        rows.push(row);
    }

    return {
        headlines,
        rows,
    };
}
