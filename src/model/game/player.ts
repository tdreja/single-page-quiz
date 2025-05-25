import { JsonPlayer } from './json/player';
import { TeamColor } from './team';

export enum Emoji {
    // noinspection JSUnusedGlobalSymbols
    BADGER = 'BADGER',
    BEAVER = 'BEAVER',
    BEETLE = 'BEETLE',
    BUTTERFLY = 'BUTTERFLY',
    CAMEL = 'CAMEL',
    CAT = 'CAT',
    CHIPMUNK = 'CHIPMUNK',
    CRAB = 'CRAB',
    CROCODILE = 'CROCODILE',
    DOG = 'DOG',
    DOLPHIN = 'DOLPHIN',
    DUCK = 'DUCK',
    EAGLE = 'EAGLE',
    ELEFANT = 'ELEFANT',
    FLAMINGO = 'FLAMINGO',
    GIRAFFE = 'GIRAFFE',
    GORILLA = 'GORILLA',
    HEDGEHOG = 'HEDGEHOG',
    HIPPOPOTAMUS = 'HIPPOPOTAMUS',
    HONEYBEE = 'HONEYBEE',
    HORSE = 'HORSE',
    KANGAROO = 'KANGAROO',
    LAMA = 'LAMA',
    LEOPARD = 'LEOPARD',
    MOUSE = 'MOUSE',
    OTTER = 'OTTER',
    OWL = 'OWL',
    PARROT = 'PARROT',
    PEACOCK = 'PEACOCK',
    PENGUIN = 'PENGUIN',
    RABBIT = 'RABBIT',
    RHINOCEROS = 'RHINOCEROS',
    ROOSTER = 'ROOSTER',
    SEAL = 'SEAL',
    SHARK = 'SHARK',
    SHELL = 'SHELL',
    SWAN = 'SWAN',
    TIGER = 'TIGER',
    TORTOISE = 'TORTOISE',
    WHALE = 'WHALE',
}

export interface Player {
    name: string,
    emoji: Emoji,
    points: number,
    team: TeamColor | null,
}

const allEmojiArray: Array<Emoji> = Object.keys(Emoji) as Array<Emoji>;

export function allEmojis(): Array<Emoji> {
    return Array.from(allEmojiArray);
}

export function sortPlayersHighestFirst(p1: Player | JsonPlayer, p2: Player | JsonPlayer): number {
    const points1 = p1.points || 0;
    const points2 = p2.points || 0;
    const sort = points2 - points1;
    if (sort != 0) {
        return sort;
    }
    return sortPlayersByName(p1, p2);
}

export function sortPlayersByName(p1: Player | JsonPlayer, p2: Player | JsonPlayer): number {
    const name1 = p1.name || '';
    const name2 = p2.name || '';
    const sort = name1.localeCompare(name2);
    if (sort != 0) {
        return sort;
    }
    const emoji1 = p1.emoji ? allEmojiArray.indexOf(p1.emoji) : -1;
    const emoji2 = p2.emoji ? allEmojiArray.indexOf(p2.emoji) : -1;
    return emoji1 - emoji2;
}
