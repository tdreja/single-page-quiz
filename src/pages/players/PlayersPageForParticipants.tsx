import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Game } from '../../model/game/game';
import { sortPlayersHighestFirst } from '../../model/game/player';
import { PlayerHeader } from './PlayerHeader';
import { calculatePlacementsForAll, PlacementPointsForAll } from '../../model/placement';
import { GameContext } from '../../components/common/GameContext';

export const PlayersPageForParticipants = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const [placements, setPlacements] = useState<PlacementPointsForAll>(calculatePlacementsForAll([]));

    useEffect(() => {
        setPlacements(calculatePlacementsForAll(Array.from(game.players.values()).map((player) => player.points)));
    }, [game]);

    return (
        <div
            id="all-players"
            className="d-flex flex-column flex-wrap column-gap-3 row-gap-2 justify-content-start align-content-start"
            style={{ maxHeight: 'calc(100vh - 17rem)' }}
        >
            {
                Array.from(game.players.values()).sort(sortPlayersHighestFirst)
                    .map((player) => (
                        <PlayerHeader
                            key={`player-${player.emoji}`}
                            player={player}
                            placements={placements}
                            className="player-tile"
                        />
                    ))
            }
        </div>
    );
};
