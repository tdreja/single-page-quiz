import { Game, GameRound, getTeams, RoundState } from "../model/game/game";
import { Team, TeamColor } from "../model/game/team";
import { EstimateQuestion } from "../model/quiz/estimate-question";
import { Choice, ImageMultipleChoiceQuestion, MultipleChoiceQuestion, TextMultipleChoiceQuestion } from "../model/quiz/multiple-choice-question";
import { EventChange, EventType, GameRoundEvent } from "./common-events";

export class SelectFromMultipleChoiceEvent extends GameRoundEvent {

    private readonly _choiceId: string;
    private readonly _overrideTeam: TeamColor | null;

    public constructor(choiceId: string, overrideTeam?: string, eventInitDict?: EventInit) {
        super(EventType.SELECT_FROM_MULTIPLE_CHOICE, eventInitDict);
        this._choiceId = choiceId;
        this._overrideTeam = overrideTeam ? overrideTeam as TeamColor : null;
    }

    public updateQuestionRound(game: Game, round: GameRound): Array<EventChange> {
        // Find the teams that attempted the answer
        const teams = this.findCurrentTeams(game, round);
        if(teams.length === 0) {
            return [];
        }
        
        // Find the correct question
        const question: MultipleChoiceQuestion<Choice> | null = this.findQuestion(round);
        if(!question) {
            return [];
        }

        // Find the choice
        const choice = question.choices.get(this._choiceId);
        if(!choice) {
            return [];
        }

        // Mark choice by team
        teams.forEach((team) => {
            choice.selectedBy.add(team.color);
            round.attemptingTeams.delete(team.color);
        });

        // Complete round if possible
        if(choice.correct) {
            question.completeQuestion(teams);
            round.state = RoundState.SHOW_RESULTS;
            return [EventChange.CURRENT_ROUND, EventChange.GAME];
        }
        // Otherwise wait for another attempt
        round.state = RoundState.SHOW_QUESTION;
        return [EventChange.CURRENT_ROUND];
    }

    protected findCurrentTeams(game: Game, round: GameRound): Array<Team> {
        if(this._overrideTeam) {
            return getTeams(game, [this._overrideTeam]);
        }
        return getTeams(game, round.attemptingTeams);
    }

    protected findQuestion(round: GameRound): MultipleChoiceQuestion<Choice> | null {
        if(round.question instanceof TextMultipleChoiceQuestion) {
            return round.question;
        }
        if(round.question instanceof ImageMultipleChoiceQuestion) {
            return round.question;
        }
        return null;
    }

}

export class SubmitEstimateEvent extends GameRoundEvent {

    private readonly _team: TeamColor;
    private readonly _estimate: number;

    public constructor(team: string, estimate: any, eventInitDict?: EventInit) {
        super(EventType.SUBMIT_ESTIMATE, eventInitDict);
        this._team = team as TeamColor;
        this._estimate = Number(estimate);
    }

    public updateQuestionRound(game: Game, round: GameRound): Array<EventChange> {
        if(!game.teams.get(this._team)) {
            return [];
        }
        const question = this.findQuestion(round);
        if(!question) {
            return [];
        }
        question.estimates.set(this._team, this._estimate);
        round.teamsAlreadyAttempted.add(this._team);

        // Not everyone has estimated? Wait further
        if(question.estimates.size !== game.teams.size) {
            return [EventChange.CURRENT_ROUND];
        }

        let closestTeams: Array<TeamColor> = [];
        let closestDistance: number | null = null;
        for(let [team,estimate] of question.estimates) {
            const dist = Math.abs(question.target - estimate);
            if(closestDistance === null || closestDistance > dist) {
                closestTeams = [team];
                closestDistance = dist;
            } else if(closestDistance === dist) {
                closestTeams.push(team);
            }
        }

        const winnerTeams: Array<Team> = getTeams(game, closestTeams);
        question.completeQuestion(winnerTeams);
        round.state = RoundState.SHOW_RESULTS;
        return [EventChange.CURRENT_ROUND, EventChange.GAME];
    }

    protected findQuestion(round: GameRound): EstimateQuestion | null {
        if(round.question instanceof EstimateQuestion) {
            return round.question;
        }
        return null;
    }
    
}