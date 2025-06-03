import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { sortTeamsHighestFirst } from '../../model/game/team';
import { Game } from '../../model/game/game';
import { TeamView } from './TeamView';
import { calculatePlacementsForAll, PlacementPointsForAll } from '../../model/placement';
import { GameContext } from '../../components/common/GameContext';

export const TeamsPageForParticipants = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const [placements, setPlacements] = useState<PlacementPointsForAll>(calculatePlacementsForAll([]));

    useEffect(() => {
        const points = Array.from(game.teams.values()).map((team) => team.points);
        setPlacements(calculatePlacementsForAll(points));
    }, [game]);

    return (
        <div className="d-grid grid-columns-xl column-gap-2 row-gap-4">
            {Array.from(game.teams.values()).sort(sortTeamsHighestFirst)
                .map((team) => (
                    <TeamView
                        key={`form-${team.color}`}
                        team={team}
                        placements={placements}
                    />
                ))}
        </div>
    );
};
