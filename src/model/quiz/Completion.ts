import { TeamColor } from '../game/team';

export type Completion = {
    [team in TeamColor]?: number;
};

export function splitUpPoints(oldCompletion?: Completion,
    maxPoints?: number,
    changedTeam?: TeamColor): Completion {
    if (!maxPoints || maxPoints < 0 || !changedTeam) {
        return oldCompletion || {};
    }
    const newCompletion: Completion = {
        [changedTeam]: maxPoints,
    };
    if (!oldCompletion) {
        return newCompletion;
    }
    const otherTeams = Object.keys(oldCompletion)
        .filter((key) => key !== changedTeam) as Array<TeamColor>;
    const newPoints = Math.floor(maxPoints / (otherTeams.length + 1));
    for (const team of otherTeams) {
        newCompletion[team] = newPoints;
    }
    return newCompletion;
}

export function recalculateCompletion(
    oldCompletion?: Completion,
    maxPoints?: number,
    changedTeam?: TeamColor,
    changedPoints?: number,
): Completion {
    // Skip any invalid inputs
    if (!maxPoints
      || maxPoints < 0
      || !changedTeam
      || changedPoints === undefined
      || Number.isNaN(changedPoints)
      || changedPoints < 0) {
        return oldCompletion || {};
    }
    const newCompletion: Completion = {
        [changedTeam]: changedPoints,
    };

    // No previous inputs or max percentage?
    const available = maxPoints - changedPoints;
    if (!oldCompletion || available <= 0) {
        return newCompletion;
    }

    // Do we need to adjust the other team points?
    const otherTeams = Object.keys(oldCompletion)
        .filter((key) => key !== changedTeam) as Array<TeamColor>;
    if (otherTeams.length === 0) {
        return newCompletion;
    }
    const sum = otherTeams
        .map((key) => oldCompletion[key] || 0)
        .reduce((a, b) => a + b);
    const factor = sum <= available ? 1 : available / sum;

    // Adjust all teams to ensure that the sum remains correct
    for (const team of otherTeams) {
        const points = oldCompletion[team] || 0;
        const adjusted = Math.floor(points * factor);
        if (adjusted > 0) {
            newCompletion[team] = adjusted;
        }
    }
    return newCompletion;
}
