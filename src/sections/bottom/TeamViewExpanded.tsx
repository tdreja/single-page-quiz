import React, { ReactElement, useContext } from 'react';
import { Team } from '../../model/game/team';
import { sortPlayersHighestFirst } from '../../model/game/player';
import { I18N } from '../../i18n/I18N';
import { backgroundColor, textColor } from '../../components/common/Colors';
import { PlayerWithPointsView } from '../../components/common/PlayerWithPointsView';

interface TeamProps {
    team: Team,
}

export const TeamViewExpanded = ({ team }: TeamProps): ReactElement => {
    const i18n = useContext(I18N);
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
                <span className="rounded-pill text-bg-light ps-2 pe-2 fw-bold">{i18n.teams[team.color]}</span>
                <span className="rounded-pill text-bg-light ps-2 pe-2">{team.points}</span>
            </div>
            <div part="player-list" className="card-body d-grid gap-2 grid-columns-md">
                {
                    Array.from(team.players.values()).sort(sortPlayersHighestFirst)
                        .map((player) => (
                            <PlayerWithPointsView
                                key={`bottom-team-${team.color}-player-${player.emoji}`}
                                player={player}
                                size="small"
                            />
                        ))
                }
            </div>
        </div>
    );
};
