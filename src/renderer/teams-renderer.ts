import {checkCurrentRound, Game} from '../model/game';
import { Emoji, getEmojiCharacter, Player } from '../model/player';
import { Team, TeamColor } from '../model/team';
import {
    addClickListenerToPart,
    getPart,
    updateAttributeAtPart,
    updateFromMap,
    updatePartInnerHtml, updateStyleAtPart
} from './render-utils';
import {RequestAttemptEvent} from "../events/round-events";

export function renderTeams(game: Game) {
    const teamsContainer = document.getElementById('teams-container');
    if (!teamsContainer) {
        console.error(
            'Could not render teams! No container with ID teams-container found!'
        );
        return;
    }
    updateFromMap(teamsContainer, 'team', game.teams, (element, color, team, newElement) =>
        updateTeam(game, element as HTMLElement, color, team, newElement)
    );
}

function updateTeam(game: Game, element: HTMLElement, color: TeamColor, team: Team, newElement: boolean) {
    element.style.setProperty('--team-color', `var(--color-${color.toLowerCase()})`);
    element.style.setProperty('--team-color-shadow', `var(--color-${color.toLowerCase()}-shadow)`);
    element.style.setProperty('--team-color-text', `var(--color-${color.toLowerCase()}-text)`);
    element.style.setProperty('--team-order', `${-team.points}`);

    const isCurrentlyAttempting = checkCurrentRound(game, round => round.currentlyAttempting.has(color));
    updateStyleAtPart(element, null, 'buzzer-shadow', isCurrentlyAttempting);

    updatePartInnerHtml(element, 'team-name', color);
    updatePartInnerHtml(element, 'team-points', `${team.points}`);

    const players = getPart(element, 'player-list');
    if (players) {
        updateFromMap(
            players as HTMLElement,
            'player',
            team.players,
            (element, emoji, player, newElement) =>
                updatePlayer(element as HTMLElement, emoji, player, newElement)
        );
    }

    const hasAnswered = checkCurrentRound(game, round => round.alreadyAttempted.has(color));
    const hasGamepad = team.gamepad !== undefined;
    updateAttributeAtPart(element, 'add-controller-btn', 'hidden', hasGamepad ? '' : null);
    updateAttributeAtPart(element, 'remove-controller-btn', 'hidden', hasGamepad ? null : '');
    updateAttributeAtPart(element, 'answer-btn', 'hidden', hasAnswered ? '' : null);

    if(newElement) {
        addClickListenerToPart(element, 'answer-btn', () => document.dispatchEvent(new RequestAttemptEvent(color)));
        addClickListenerToPart(element, 'add-controller-btn', ev => console.log('Add Controller', ev.target));
        addClickListenerToPart(element, 'remove-controller-btn', ev => console.log('Remove Controller', ev.target));
    }
}

function updatePlayer(element: HTMLElement, emoji: Emoji, player: Player, newElement: boolean) {
    element.style.setProperty('--player-order', `${-player.points}`);

    updatePartInnerHtml(element, 'emoji-container', getEmojiCharacter(emoji));
    updatePartInnerHtml(element, 'player-name', player.name);
    updatePartInnerHtml(element, 'player-points', `${player.points}`);
}
