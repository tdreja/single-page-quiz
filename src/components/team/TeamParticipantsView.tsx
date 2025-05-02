import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { sortTeamsHighestFirst } from '../../model/game/team';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { TeamView } from './TeamView';
import { calculatePlacementsForAll, PlacementPointsForAll } from '../../model/placement';

export const TeamParticipantsView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const [placements, setPlacements] = useState<PlacementPointsForAll>(calculatePlacementsForAll([]));

    useEffect(() => {
        const points = Array.from(game.teams.values()).map((team) => team.points);
        setPlacements(calculatePlacementsForAll(points));
    }, [game]);

    return (
        <div className="d-flex flex-row flex-wrap" style={{ gap: '0.75rem 1rem' }}>
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
