import React, { ReactElement } from 'react';
import { Team } from '../../model/game/team';
import { getEmojiCharacter, Player } from '../../model/game/player';

export interface TeamProps {
    team: Team,
}

interface PlayerProps {
    player: Player,
}

export const TeamView = ({ team }: TeamProps): ReactElement => {
    const players: ReactElement[] = Array.from(team.players.values()).map((player) => PlayerView({ player }));
    return (
        <div
            part="team"
            className="card d-flex flex-grow-1"
            id={`team-${team.color}`}
            key={team.color}
        >
            <div
                part="team-headline"
                className="card-header d-inline-flex flex-row gap-1 justify-content-between bg-team-color"
            >
                <span part="team-name">{team.color}</span>
                <span part="team-points">{team.points}</span>
            </div>
            <div part="player-list" className="card-body d-grid">
                {players}
            </div>
        </div>
    );
};

const PlayerView = ({ player }: PlayerProps): ReactElement => {
    return (
        <div
            part="player"
            id={`player-${player.emoji}`}
            key={player.emoji}
        >
            <span
                part="emoji"
                className="bg-body-secondary"
                dangerouslySetInnerHTML={{ __html: getEmojiCharacter(player.emoji) }}
            >
            </span>
            <span part="player-name" className="flex-grow-1">{player.name}</span>
            <span part="player-points" className="me-2">{player.points}</span>
        </div>
    );
};
