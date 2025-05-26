/**
 * Which points are required for each placement?
 */
export interface PlacementPointsForAll {
    goldPoints: number,
    silverPoints: number,
    bronzePoints: number,
}

/**
 * Look through all points and determine the placements for gold, silver, and bronze.
 */
export function calculatePlacementsForAll(points: Array<number>): PlacementPointsForAll {
    const sorted = points.sort((a, b) => b - a);
    return {
        goldPoints: sorted.length > 0 ? sorted[0] : -1,
        silverPoints: sorted.length > 1 ? sorted[1] : -1,
        bronzePoints: sorted.length > 2 ? sorted[2] : -1,
    };
}

/**
 * What placements can a player have?
 */
export enum Placement {
    GOLD = 'GOLD',
    SILVER = 'SILVER',
    BRONZE = 'BRONZE',
}

/**
 * Based on the overall placement points and our current points, determine the placement of a player.
 */
export function calculateSinglePlacement(points: number, placements: PlacementPointsForAll): Placement | null {
    if (points <= 0) {
        return null; // 0 points should not have a placement!
    }
    if (placements.goldPoints === points) {
        return Placement.GOLD;
    }
    if (placements.silverPoints === points) {
        return Placement.SILVER;
    }
    if (placements.bronzePoints === points) {
        return Placement.BRONZE;
    }
    return null;
}
