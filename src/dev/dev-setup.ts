import { AddPlayerEvent, AddTeamEvent } from '../events/setup-events';
import {
    Game,
    GameRound,
    GameSection,
    GameState,
    RoundState,
} from '../model/game/game';
import { allEmojis, Emoji } from '../model/game/player';
import { TeamColor } from '../model/game/team';
import { TextChoice, TextMultipleChoiceQuestion } from '../model/quiz/multiple-choice-question';

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

    let index = 0;
    for (const sectionId of ['Alpha', 'Beta', 'Gamma']) {
        const section: GameSection = {
            sectionName: sectionId,
            questions: new Map(),
            index,
        };
        game.sections.set(sectionId, section);

        for (const points of [100, 200, 300, 400]) {
            const choices = new Map<string, TextChoice>();
            choices.set('A', choiceA);
            choices.set('B', choiceB);
            choices.set('C', choiceC);
            choices.set('D', choiceD);

            const textQuestion: TextMultipleChoiceQuestion = new TextMultipleChoiceQuestion(sectionId, points, 'How much is the fish?', choices);
            section.questions.set(points, textQuestion);
        }
        index += 1;
    }
    game.state = GameState.GAME_ACTIVE;
}
