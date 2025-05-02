import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { sortPlayersHighestFirst } from '../../model/game/player';
import { PlayerHeader } from './PlayerHeader';
import { calculatePlacementsForAll, PlacementPointsForAll } from '../../model/placement';

export const PlayerParticipantsView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const [placements, setPlacements] = useState<PlacementPointsForAll>(calculatePlacementsForAll([]));

    useEffect(() => {
        setPlacements(calculatePlacementsForAll(Array.from(game.players.values()).map((player) => player.points)));
    }, [game]);

    return (
        <div
            id="all-players"
            className="d-flex flex-column flex-wrap column-gap-4 row-gap-1 justify-content-start align-content-start"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
        >
            {
                Array.from(game.players.values()).sort(sortPlayersHighestFirst)
                    .map((player) => (
                        <PlayerHeader
                            key={`player-${player.emoji}`}
                            player={player}
                            placements={placements}
                            className="border rounded pt-2 pb-2 ps-2 pe-4"
                        />
                    ))
            }
        </div>
    );
};
