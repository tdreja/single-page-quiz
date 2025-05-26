import { AddPlayerEvent, AddTeamEvent } from '../events/setup-events';
import { Game, GameColumn, GamePage } from '../model/game/game';
import { allEmojis, Emoji } from '../model/game/player';
import { TeamColor } from '../model/game/team';
import {
    ImageMultipleChoiceQuestion,
    MultipleChoiceQuestion,
    TextChoice,
    TextMultipleChoiceQuestion,
} from '../model/quiz/multiple-choice-question';
import { ActionQuestion } from '../model/quiz/action-question';
import { EstimateQuestion } from '../model/quiz/estimate-question';

function buildChoices(): Map<string, TextChoice> {
    const choiceA: TextChoice = {
        choiceId: 'A',
        correct: false,
        selectedBy: new Set(),
        text: 'Alpha',
    };
    const choiceB: TextChoice = {
        choiceId: 'B',
        correct: false,
        selectedBy: new Set(),
        text: 'Beta',
    };
    const choiceC: TextChoice = {
        choiceId: 'C',
        correct: true,
        selectedBy: new Set(),
        text: 'Gamma',
    };
    const choiceD: TextChoice = {
        choiceId: 'D',
        correct: false,
        selectedBy: new Set(),
        text: 'Delta',
    };

    const choices = new Map<string, TextChoice>();
    choices.set('A', choiceA);
    choices.set('B', choiceB);
    choices.set('C', choiceC);
    choices.set('D', choiceD);
    return choices;
}

export function prepareGame(game: Game) {
    // region TeamsNav & Players

    const maxTeams = 5;
    for (const color of Object.keys(TeamColor)) {
        if (game.teams.size === maxTeams) {
            continue;
        }
        new AddTeamEvent(color as TeamColor).updateGame(game);
        const team = game.teams.get(color as TeamColor);
        if (team) {
            team.points = Math.floor((5000 * Math.random()) / 100) * 100;
        }
    }

    const names: Array<string> = [
        'Lena',
        'Jonas',
        'Mia',
        'Paul',
        'Emma',
        'Noah',
        'Lea',
        'Elias',
        'Sophie',
        'Finn',
        'Hannah',
        'Ben',
        'Luca',
        'Marie',
        'Tim',
        'Anna',
        'Felix',
        'Laura',
        'Maximilian',
        'Amelie',
        'Leon',
        'Nele',
        'Julian',
        'Lina',
        'Moritz',
        'Emily',
        'Nico',
        'Johanna',
        'Fabian',
        'Clara',
        'Tom',
        'Luisa',
        'David',
        'Isabell',
        'Jan',
        'Maya',
        'Simon',
        'Katharina',
        'Oskar',
        'Helena',
        'Erik',
        'Lilly',
        'Philipp',
        'Pia',
        'Samuel',
        'Greta',
        'Tobias',
        'Franziska',
        'Matteo',
        'Marlene',
    ];

    const newNames = names.slice(0, Math.min(allEmojis().length, names.length));
    new AddPlayerEvent(newNames).updateGame(game);
    for (const emoji of Object.keys(Emoji)) {
        const player = game.players.get(emoji as Emoji);
        if (player) {
            player.points = Math.floor((3000 * Math.random()) / 100) * 100;
        }
    }

    // endregion TeamsNav & Players

    // region Questions

    let index = 0;
    for (const columnId of ['Alpha', 'Beta', 'Gamma', 'Delta']) {
        const column: GameColumn = {
            columnName: columnId,
            questions: new Map(),
            index,
        };
        game.columns.set(columnId, column);

        column.questions.set(100,
            new TextMultipleChoiceQuestion(columnId, 100, 'How much is the fish?', buildChoices()));
        column.questions.set(200,
            new ImageMultipleChoiceQuestion(columnId, 200, 'How much is the fish?', '', buildChoices()));
        column.questions.set(300,
            new ActionQuestion(columnId, 300, 'Do what you want!'));
        column.questions.set(400,
            new EstimateQuestion(columnId, 400, 'Do what you want!', 1000));
        index += 1;
    }
    game.page = GamePage.GAME_ACTIVE;
}
