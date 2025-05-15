import { TeamColor } from '../game/team';

export type Completion = {
    [team in TeamColor]?: number;
};

export function recalculateCompletion(
    oldCompletion?: Completion,
    maxPoints?: number,
    changedTeam?: TeamColor,
    changedPoints?: number,
): Completion {
    // Skip any invalid inputs
    if (!maxPoints || maxPoints < 0
      || !changedTeam || !changedPoints
      || Number.isNaN(changedPoints) || changedPoints < 0) {
        return oldCompletion || {};
    }
    const newCompletion: Completion = {
        [changedTeam]: changedPoints,
    };

    // No previous inputs or max percentage?
    if (!oldCompletion || changedPoints === maxPoints) {
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
    const adjustment = Math.max(0, (maxPoints - changedPoints - sum) / otherTeams.length);

    // Adjust all teams to ensure that the sum remains correct
    for (const team of otherTeams) {
        const points = oldCompletion[team] || 0;
        const adjusted = points - adjustment;
        if (adjusted > 0) {
            newCompletion[team] = adjusted;
        }
    }
    return newCompletion;
}
