import { Game } from '../model/game';
import { getEmojiCharacter, Player } from '../model/player';
import { Team } from '../model/team';

export function renderTeams(game: Game) {
    const teamsContainer = document.getElementById('teams-container');
    if (!teamsContainer) {
        console.error(
            'Could not render teams! No container with ID teams-container found!'
        );
        return;
    }
    teamsContainer.style.setProperty('--teams-count', `${game.teams.size}`);
    for(const child of Array.from(teamsContainer.children)) {
        teamsContainer.removeChild(child);
    }
    let newHtml = '';
    for(const team of game.teams.values()) {
        newHtml += renderTeam(team);
    }
    teamsContainer.innerHTML = newHtml;
}

function renderTeam(team: Team): string {
    let playersHtml = '';
    for(const player of team.players.values()) {
        playersHtml += renderPlayer(player);
    } 
    const colorLowerCase = team.color.toLowerCase();
    /*html*/
    return `
        <div part="team" class="card d-flex flex-grow-1" 
            team="${team.color}"
            style="--team-color: var(--color-${colorLowerCase}); --team-color-text: var(--color-${colorLowerCase}-text);"
            >
            <div part="team-headline" class="card-header d-inline-flex flex-row gap-1 justify-content-between bg-team-color">
                <span part="team-name">${team.color}</span>
                <span part="team-points">${team.points}</span>
            </div>
            <div part="player-list" class="card-body d-flex flex-column flex-wrap">
                ${playersHtml}
            </div>
        </div>
    `;
}

function renderPlayer(player: Player): string {
    /*html*/
    return `
    <div part="player" player="${player.emoji}" class="d-inline-flex flex-row gap-1 justify-content-between">
        <span part="emoji-container">${getEmojiCharacter(player.emoji)}</span>
        <span part="player-name">${player.name}</span>
        <span part="player-points">${player.points}</span>
    </div>
    `;
}
