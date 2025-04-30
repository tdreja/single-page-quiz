import { GameState } from '../model/game/game';
import { TeamColor } from '../model/game/team';
import { Labels } from './I18N';

export const i18n_de: Labels = {
    teams: {
        [TeamColor.RED]: 'Rot',
        [TeamColor.BLUE]: 'Blau',
        [TeamColor.GREEN]: 'Grün',
        [TeamColor.YELLOW]: 'Gelb',
        [TeamColor.ORANGE]: 'Orange',
        [TeamColor.PURPLE]: 'Lila',
        [TeamColor.TURQUOISE]: 'Türkis',
        [TeamColor.WHITE]: 'Weiß',
    },
    game: {
        [GameState.TEAM_SETUP]: 'Teams',
        [GameState.PLAYER_SETUP]: 'Spieler',
        [GameState.CONTROLLER_SETUP]: 'Controller',
        [GameState.GAME_ACTIVE]: 'Quiz',
    },
    playerEditor: {
        tooltipReRollEmoji: 'Neuer zufälliger Emoji',
        tooltipRename: 'Spieler umbenennen',
        tooltipRemove: 'Spieler entfernen',
        tooltipPoints: 'Punkte ändern',
        tooltipAdd: 'Spieler hinzufügen',
        tooltipSwitchTeam: 'Team wechseln',
        noTeam: 'Kein Team',
        labelAdd: 'Neue Spieler hinzufügen',
        labelTeam: 'Team',
        labelName: 'Name',
        labelPoints: 'Punkte',
        labelEmoji: 'Emoji',
        labelActions: 'Aktionen',
    },
    settings: {
        tooltipModeShared: 'Geteilt mit Teilnehmern',
        labelModeShared: 'Geteilt',
        tooltipModeModeration: 'Nur für Moderation',
        labelModeModeration: 'Moderation',
        tooltipModeParticipants: 'Teilnehmeransicht',
        labelModeParticipants: '',
        tooltipActionParticipants: 'Öffne Teilnehmeransicht',
        tooltipActionModeration: 'Öffne Moderationsansicht',
    },
    teamEditor: {
        labelActions: 'Aktionen',
        labelPoints: 'Punkte',
        labelSwitchColor: 'Farbe ändern',
        tooltipRemove: 'Team löschen',
        tooltipPoints: 'Punkte ändern',
        tooltipAdd: 'Team hinzufügen',
        tooltipSwitchColor: 'Farbe ändern',
    },
};
