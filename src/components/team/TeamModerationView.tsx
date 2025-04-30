import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { allColors, sortTeamsByColor, TeamColor } from '../../model/game/team';
import { TeamForm } from './TeamForm';

export const TeamModerationView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const [availableColors, setAvailableColors] = useState<Array<TeamColor>>([]);

    useEffect(() => {
        const all = allColors().filter((color) => !game.teams.has(color));
        setAvailableColors(all);
    }, [game]);

    return (
        <div className="d-flex flex-wrap flex-column" style={{ gap: '0.75rem 3rem' }}>
            {Array.from(game.teams.values()).sort(sortTeamsByColor)
                .map((team) => (
                    <TeamForm
                        key={`form-${team.color}`}
                        team={team}
                        availableColors={availableColors}
                    />
                ))}
        </div>
    );
};
