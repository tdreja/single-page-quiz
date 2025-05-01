export interface PlacementPoints {
    goldPoints: number,
    silverPoints: number,
    bronzePoints: number,
}

export function calculatePlacements(points: Array<number>): PlacementPoints {
    const sorted = points.sort((a, b) => b - a);
    return {
        goldPoints: sorted.length > 0 ? sorted[0] : -1,
        silverPoints: sorted.length > 1 ? sorted[1] : -1,
        bronzePoints: sorted.length > 2 ? sorted[2] : -1,
    };
}

export enum Placement {
    GOLD = 'GOLD',
    SILVER = 'SILVER',
    BRONZE = 'BRONZE',
}

export function calculatePlacement(points: number, placements: PlacementPoints): Placement | null {
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
