import { TeamColor } from './team';

export enum Emoji {
    DUCK = 'DUCK',
    SHARK = 'SHARK',
    CAMEL = 'CAMEL',
    FLAMINGO = 'FLAMINGO',
    HEDGEHOG = 'HEDGEHOG',
    CAT = 'CAT',
    CRAB = 'CRAB',
    KANGAROO = 'KANGAROO',
    HIPPOPOTAMUS = 'HIPPOPOTAMUS',
    GORILLA = 'GORILLA',
    TIGER = 'TIGER',
    LEOPARD = 'LEOPARD',
    LAMA = 'LAMA',
    RHINOCEROS = 'RHINOCEROS',
    HORSE = 'HORSE',
    SLOTH = 'SLOTH',
    ELEFANT = 'ELEFANT',
    MOUSE = 'MOUSE',
    RABBIT = 'RABBIT',
    BEAVER = 'BEAVER',
    CROCODILE = 'CROCODILE',
    TORTOISE = 'TORTOISE',
    SNAKE = 'SNAKE',
    DOLPHIN = 'DOLPHIN',
    OTTER = 'OTTER',
    WHALE = 'WHALE',
    ROOSTER = 'ROOSTER',
    EAGLE = 'EAGLE',
    SWAN = 'SWAN',
    PARROT = 'PARROT',
    PENGUIN = 'PENGUIN',
    DOG = 'DOG',
}

export interface Player {
    name: string,
    emoji: Emoji,
    points: number,
    team: TeamColor | null,
}

export function addAllEmojisTo(set: Set<Emoji>) {
    for (const color of Object.keys(Emoji)) {
        set.add(color as Emoji);
    }
}

export function sortPlayersHighestFirst(p1: Player, p2: Player): number {
    const sort = p2.points - p1.points;
    if (sort != 0) {
        return sort;
    }
    return sortPlayersByName(p1, p2);
}

export function sortPlayersByName(p1: Player, p2: Player): number {
    const sort = p1.name.localeCompare(p2.name);
    if (sort != 0) {
        return sort;
    }
    return p1.emoji.localeCompare(p2.emoji);
}
