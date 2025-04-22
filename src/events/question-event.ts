import { completeRound, Game, GameRound, RoundState } from "../model/game/game";
import { TeamColor } from "../model/game/team";
import { EstimateQuestion } from "../model/quiz/estimate-question";
import { Choice, ImageMultipleChoiceQuestion, MultipleChoiceQuestion, TextMultipleChoiceQuestion } from "../model/quiz/multiple-choice-question";
import { EventType, GameRoundEvent } from "./common-events";

export class SelectFromMultipleChoiceEvent extends GameRoundEvent {

    private readonly _choiceId: string;
    private readonly _overrideTeam: TeamColor | null;

    public constructor(choiceId: string, overrideTeam?: string, eventInitDict?: EventInit) {
        super(EventType.SELECT_FROM_MULTIPLE_CHOICE, eventInitDict);
        this._choiceId = choiceId;
        this._overrideTeam = overrideTeam ? overrideTeam as TeamColor : null;
    }

    public updateRound(game: Game, round: GameRound): boolean {
        // Find the team that attempted the answer
        const currentColor: TeamColor | null = this.findCurrentTeam(round);
        if(!currentColor) {
            return false;
        }
        const team = game.teams.get(currentColor);
        if(!team) {
            return false;
        }
        
        // Find the correct question
        const question: MultipleChoiceQuestion<Choice> | null = this.findQuestion(round);
        if(!question) {
            return false;
        }

        // Find the choice
        const choice = question.choices.get(this._choiceId);
        if(!choice) {
            return false;
        }

        // Mark choice by team
        choice.selectedBy.add(team.color);
        round.currentlyAttempting.delete(team.color);
        round.alreadyAttempted.add(team.color);

        // Complete round if possible
        if(choice.correct) {
            return completeRound(game, [currentColor]);
        }
        // Otherwise wait for another attempt
        round.state = RoundState.SHOW_QUESTION;
        return true;
    }

    protected findCurrentTeam(round: GameRound): TeamColor | null {
        if(this._overrideTeam) {
            return this._overrideTeam;
        }
        for(const color of round.currentlyAttempting) {
            return color;
        }
        return null;
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

    public updateRound(game: Game, round: GameRound): boolean {
        if(!game.teams.get(this._team)) {
            return false;
        }
        const question = this.findQuestion(round);
        if(!question) {
            return false;
        }
        question.estimates.set(this._team, this._estimate);
        round.alreadyAttempted.add(this._team);

        // Not everyone has estimated? Wait further
        if(question.estimates.size !== game.teams.size) {
            return true;
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

        return completeRound(game, closestTeams);
    }

    protected findQuestion(round: GameRound): EstimateQuestion | null {
        if(round.question instanceof EstimateQuestion) {
            return round.question;
        }
        return null;
    }
    
}