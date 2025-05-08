import { Game, GameRound, getTeams, RoundState } from '../model/game/game';
import { Team, TeamColor } from '../model/game/team';
import { EstimateQuestion } from '../model/quiz/estimate-question';
import {
    Choice,
    ImageMultipleChoiceQuestion,
    MultipleChoiceQuestion,
    TextMultipleChoiceQuestion,
} from '../model/quiz/multiple-choice-question';
import { Changes, EventType, GameRoundEvent, GameUpdate, noUpdate, update } from './common-events';

export class SelectFromMultipleChoiceEvent extends GameRoundEvent {
    private readonly _choiceId: string;
    private readonly _overrideTeam: TeamColor | null;

    public constructor(choiceId: string, overrideTeam?: TeamColor) {
        super(EventType.SELECT_FROM_MULTIPLE_CHOICE);
        this._choiceId = choiceId;
        this._overrideTeam = overrideTeam || null;
    }

    public updateQuestionRound(game: Game, round: GameRound): GameUpdate {
        // Find the teams that attempted the answer
        const teams = this.findCurrentTeams(game, round);
        if (teams.length === 0) {
            return noUpdate(game);
        }

        // Find the correct question
        const question: MultipleChoiceQuestion<Choice> | null = this.findQuestion(round);
        if (!question) {
            return noUpdate(game);
        }

        // Find the choice
        const choice = question.choices.get(this._choiceId);
        if (!choice) {
            return noUpdate(game);
        }

        // Mark choice by team
        teams.forEach((team) => {
            choice.selectedBy.add(team.color);
            round.attemptingTeams.delete(team.color);
        });

        // Complete round if possible
        if (choice.correct) {
            question.completeQuestion(teams);
            round.state = RoundState.SHOW_RESULTS;
            round.timerStart = null;
            return update(game, Changes.GAME_SETUP, Changes.CURRENT_ROUND);
        }

        // Check if another team can still answer?
        if (round.teamsAlreadyAttempted.size === game.teams.size) {
            question.completeQuestion([]);
            round.state = RoundState.SHOW_RESULTS;
            round.timerStart = null;
            return update(game, Changes.GAME_SETUP, Changes.CURRENT_ROUND);
        }

        // Otherwise wait for another attempt
        round.state = RoundState.SHOW_QUESTION;
        round.timerStart = null;
        return update(game, Changes.CURRENT_ROUND);
    }

    protected findCurrentTeams(game: Game, round: GameRound): Array<Team> {
        if (this._overrideTeam) {
            return getTeams(game, [this._overrideTeam]);
        }
        return getTeams(game, round.attemptingTeams);
    }

    protected findQuestion(round: GameRound): MultipleChoiceQuestion<Choice> | null {
        if (round.question instanceof TextMultipleChoiceQuestion) {
            return round.question;
        }
        if (round.question instanceof ImageMultipleChoiceQuestion) {
            return round.question;
        }
        return null;
    }
}

export class SubmitEstimateEvent extends GameRoundEvent {
    private readonly _team: TeamColor;
    private readonly _estimate: number;

    public constructor(team: TeamColor, estimate: number) {
        super(EventType.SUBMIT_ESTIMATE);
        this._team = team;
        this._estimate = estimate;
    }

    public updateQuestionRound(game: Game, round: GameRound): GameUpdate {
        if (!game.teams.get(this._team)) {
            return noUpdate(game);
        }
        const question = this.findQuestion(round);
        if (!question) {
            return noUpdate(game);
        }
        question.estimates.set(this._team, this._estimate);
        round.teamsAlreadyAttempted.add(this._team);

        // Not everyone has estimated? Wait further
        if (question.estimates.size !== game.teams.size) {
            return update(game, Changes.CURRENT_ROUND);
        }

        let closestTeams: Array<TeamColor> = [];
        let closestDistance: number | null = null;
        for (const [team, estimate] of question.estimates) {
            const dist = Math.abs(question.target - estimate);
            if (closestDistance === null || closestDistance > dist) {
                closestTeams = [team];
                closestDistance = dist;
            } else if (closestDistance === dist) {
                closestTeams.push(team);
            }
        }

        const winnerTeams: Array<Team> = getTeams(game, closestTeams);
        question.completeQuestion(winnerTeams);
        round.state = RoundState.SHOW_RESULTS;
        round.timerStart = null;
        return update(game, Changes.GAME_SETUP, Changes.CURRENT_ROUND);
    }

    protected findQuestion(round: GameRound): EstimateQuestion | null {
        if (round.question instanceof EstimateQuestion) {
            return round.question;
        }
        return null;
    }
}
