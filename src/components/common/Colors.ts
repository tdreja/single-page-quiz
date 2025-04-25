import { TeamColor } from '../../model/game/team';

export type IndexedByColor = {
    [color in TeamColor]: string;
};

export const backgroundColor: IndexedByColor = {
    BLUE: 'rgb(72, 149, 239)',
    GREEN: 'rgb(49, 87, 44)',
    ORANGE: 'rgb(232, 93, 4)',
    PURPLE: 'rgb(114, 9, 183)',
    RED: 'rgb(186, 24, 27)',
    TURQUOISE: 'rgb(0, 175, 185)',
    WHITE: 'rgb(211, 211, 211)',
    YELLOW: 'rgb(252, 191, 73)',
};

export const textColor: IndexedByColor = {
    BLUE: 'black',
    GREEN: 'white',
    ORANGE: 'black',
    PURPLE: 'white',
    RED: 'white',
    TURQUOISE: 'black',
    WHITE: 'black',
    YELLOW: 'black',
};
