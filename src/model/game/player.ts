import { TeamColor } from "./team";

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
    name: string;
    emoji: Emoji;
    points: number;
    team: TeamColor | null;
}

const emojiCharacters = new Map<Emoji, string>();
emojiCharacters.set(Emoji.DUCK, '&#x1F986');
emojiCharacters.set(Emoji.SHARK, '&#x1F988');
emojiCharacters.set(Emoji.CAMEL, '&#x1F42B');
emojiCharacters.set(Emoji.FLAMINGO, '&#x1F9A9');
emojiCharacters.set(Emoji.HEDGEHOG, '&#x1F994');
emojiCharacters.set(Emoji.CAT, '&#x1F408');
emojiCharacters.set(Emoji.CRAB, '&#x1F980');
emojiCharacters.set(Emoji.KANGAROO, '&#x1F998');
emojiCharacters.set(Emoji.HIPPOPOTAMUS, '&#x1F99B');
emojiCharacters.set(Emoji.GORILLA, '&#x1F98D');
emojiCharacters.set(Emoji.TIGER, '&#x1F405');
emojiCharacters.set(Emoji.LEOPARD, '&#x1F406');
emojiCharacters.set(Emoji.LAMA, '&#x1F999');
emojiCharacters.set(Emoji.RHINOCEROS, '&#x1F98F');
emojiCharacters.set(Emoji.HORSE, '&#x1F40E');
emojiCharacters.set(Emoji.SLOTH, '&#x1F9A5');
emojiCharacters.set(Emoji.ELEFANT, '&#x1F418');
emojiCharacters.set(Emoji.MOUSE, '&#x1F401');
emojiCharacters.set(Emoji.RABBIT, '&#x1F407');
emojiCharacters.set(Emoji.BEAVER, '&#x1F9AB');
emojiCharacters.set(Emoji.CROCODILE, '&#x1F40A');
emojiCharacters.set(Emoji.TORTOISE, '&#x1F422');
emojiCharacters.set(Emoji.SNAKE, '&#x1F40D');
emojiCharacters.set(Emoji.DOLPHIN, '&#x1F42C');
emojiCharacters.set(Emoji.OTTER, '&#x1F9A6');
emojiCharacters.set(Emoji.WHALE, '&#x1F433');
emojiCharacters.set(Emoji.ROOSTER, '&#x1F413');
emojiCharacters.set(Emoji.EAGLE, '&#x1F985');
emojiCharacters.set(Emoji.SWAN, '&#x1F9A2');
emojiCharacters.set(Emoji.PARROT, '&#x1F99C');
emojiCharacters.set(Emoji.PENGUIN, '&#x1F427');
emojiCharacters.set(Emoji.DOG, '&#x1F415');

export function getEmojiCharacter(emoji: Emoji): string {
    const character = emojiCharacters.get(emoji);
    return character ? character : '';
}

export function addAllEmojisTo(set: Set<Emoji>) {
    for(const color of Object.keys(Emoji)) {
        set.add(color as Emoji);
    }
}