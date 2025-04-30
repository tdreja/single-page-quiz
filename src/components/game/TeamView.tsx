import React, { ReactElement } from 'react';
import { Team } from '../../model/game/team';
import { sortPlayersHighestFirst } from '../../model/game/player';
import { backgroundColor, textColor } from '../common/Colors';
import { Labels } from '../../i18n/I18N';
import { SmallPlayerView } from '../common/SmallPlayerView';

export interface TeamProps {
    team: Team,
    i18n: Labels,
}

export const TeamView = ({ team, i18n }: TeamProps): ReactElement => {
    return (
        <div
            part="team"
            className="card d-flex flex-grow-1"
            id={`bottom-team-${team.color}`}
            key={team.color}
        >
            <div
                part="team-headline"
                className="card-header d-inline-flex flex-row gap-1 justify-content-between"
                style={{
                    color: textColor[team.color],
                    backgroundColor: backgroundColor[team.color],
                }}
            >
                <span part="team-name">{i18n.teams[team.color]}</span>
                <span part="team-points">{team.points}</span>
            </div>
            <div part="player-list" className="card-body d-grid gap-2 grid-columns-md">
                {
                    Array.from(team.players.values()).sort(sortPlayersHighestFirst)
                        .map((player) => (
                            <SmallPlayerView
                                key={`bottom-team-${team.color}-player-${player.emoji}`}
                                player={player}
                            />
                        ))
                }
            </div>
        </div>
    );
};
