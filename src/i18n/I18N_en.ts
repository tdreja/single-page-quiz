import { GameState } from '../model/game/game';
import { TeamColor } from '../model/game/team';
import { Labels } from './I18N';

export const i18n_en: Labels = {
    teams: {
        [TeamColor.RED]: 'Red',
        [TeamColor.BLUE]: 'Blue',
        [TeamColor.GREEN]: 'Green',
        [TeamColor.YELLOW]: 'Yellow',
        [TeamColor.ORANGE]: 'Orange',
        [TeamColor.PURPLE]: 'Purple',
        [TeamColor.TURQUOISE]: 'Torquoise',
        [TeamColor.WHITE]: 'White',
    },
    game: {
        [GameState.TEAM_SETUP]: 'Teams',
        [GameState.PLAYER_SETUP]: 'Players',
        [GameState.CONTROLLER_SETUP]: 'Controller',
        [GameState.GAME_ACTIVE]: 'Quiz',
    },
};
