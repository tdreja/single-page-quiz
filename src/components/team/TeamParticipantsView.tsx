import React, { ReactElement, useContext } from 'react';
import { sortTeamsHighestFirst } from '../../model/game/team';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { TeamView } from './TeamView';

export const TeamParticipantsView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    return (
        <div className="d-flex flex-row flex-wrap" style={{ gap: '0.75rem 1rem' }}>
            {Array.from(game.teams.values()).sort(sortTeamsHighestFirst)
                .map((team) => (
                    <TeamView
                        key={`form-${team.color}`}
                        team={team}
                    />
                ))}
        </div>
    );
};
