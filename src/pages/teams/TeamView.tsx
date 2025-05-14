import React, { ReactElement, useContext } from 'react';
import { Team } from '../../model/game/team';
import { sortPlayersHighestFirst } from '../../model/game/player';
import { I18N } from '../../i18n/I18N';
import { calculateSinglePlacement, PlacementPointsForAll } from '../../model/placement';
import { backgroundColor, textColor } from '../../components/common/Colors';
import { PlacementIcon } from '../../components/common/PlacementIcon';
import { PlayerWithPointsView } from '../../components/common/PlayerWithPointsView';

interface Props {
    team: Team,
    placements: PlacementPointsForAll,
}

export const TeamView = ({ team, placements }: Props): ReactElement => {
    const i18n = useContext(I18N);
    const placement = calculateSinglePlacement(team.points, placements);
    return (
        <div
            className="card flex-grow-1"
        >
            <div
                className="card-header d-flex align-items-center gap-2 justify-content-start"
                style={{
                    color: textColor[team.color],
                    backgroundColor: backgroundColor[team.color],
                }}
            >
                {placement && <PlacementIcon placement={placement} />}
                <div className="flex-grow-1">
                    <span className="rounded-pill text-bg-light ps-2 pe-2 fw-bold fs-5">{i18n.teams[team.color]}</span>
                </div>
                <span className="rounded-pill text-bg-light ps-2 pe-2">{team.points}</span>
            </div>
            <div className="card-body d-grid gap-2 grid-columns-lg">
                {
                    Array.from(team.players.values()).sort(sortPlayersHighestFirst)
                        .map((player) => (
                            <PlayerWithPointsView
                                key={`team-${team.color}-player-${player.emoji}`}
                                player={player}
                                size="large"
                            />
                        ))
                }
            </div>
        </div>
    );
};
