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
export interface GameSection {
    readonly sectionName: string,
    readonly questions: Map<number, Question>,
    readonly index: number,
}

export interface GameRound {
    readonly inSectionName: string,
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
    readonly sections: Map<string, GameSection>,
    readonly players: Map<Emoji, Player>,
    readonly teams: Map<TeamColor, Team>,
    round: GameRound | null,
    roundsCounter: number,
    state: GameState,
    teamNavExpanded: boolean,
}

export function emptyGame(): Game {
    return {
        sections: new Map(),
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

export function sortGameSectionsByIndex(section1?: GameSection, section2?: GameSection): number {
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
    getItem: (section?: GameSection, question?: Question) => ITEM | undefined,
): QuestionTable<ITEM> {
    const sectionOrder: Array<string> = [];
    const pointsLevels: Array<number> = [];

    // Headlines first
    const headlines: QuestionTableCell<ITEM>[] = [];
    Array.from(game.sections.values()).sort(sortGameSectionsByIndex).map((section) => {
        sectionOrder.push(section.sectionName);
        headlines.push({
            label: section.sectionName,
            key: section.sectionName,
            inSection: section.sectionName,
            item: getItem(section),
        });
        // Also collect all points for each question
        section.questions.values().forEach((question) => {
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

        for (const sectionId of sectionOrder) {
            const section = game.sections.get(sectionId);
            if (!section) {
                row.push({
                    label: '-',
                    key: '?',
                    item: getItem(),
                });
                continue;
            }

            const question = section.questions.get(questionPoints);
            row.push({
                label: `${questionPoints}`,
                inSection: question ? sectionId : undefined,
                pointsForCompletion: question ? questionPoints : undefined,
                key: `${sectionId}-${question ? questionPoints : '?'}`,
                item: getItem(section, question),
            });
        }

        rows.push(row);
    }

    return {
        headlines,
        rows,
    };
}
