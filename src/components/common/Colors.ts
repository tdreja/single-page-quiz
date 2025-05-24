import { TeamColor } from '../../model/game/team';

export type IndexedByColor = {
    [color in TeamColor]: string;
};

export const backgroundColor: IndexedByColor = {
    RED: 'rgb(186, 24, 27)',
    BLUE: 'rgb(72, 149, 239)',
    GREEN: 'rgb(49, 87, 44)',
    YELLOW: 'rgb(252, 191, 73)',
    ORANGE: 'rgb(232, 93, 4)',
    PURPLE: 'rgb(114, 9, 183)',
    TURQUOISE: 'rgb(0, 175, 185)',
    WHITE: 'rgb(211, 211, 211)',
};

export const hoverColor: IndexedByColor = {
    BLUE: 'rgba(72, 149, 239, 0.5)',
    GREEN: 'rgba(49, 87, 44, 0.5)',
    ORANGE: 'rgba(232, 93, 4, 0.5)',
    PURPLE: 'rgba(114, 9, 183, 0.5)',
    RED: 'rgba(186, 24, 27, 0.5)',
    TURQUOISE: 'rgba(0, 175, 185, 0.5)',
    WHITE: 'rgba(211, 211, 211, 0.5)',
    YELLOW: 'rgba(252, 191, 73, 0.5)',
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
