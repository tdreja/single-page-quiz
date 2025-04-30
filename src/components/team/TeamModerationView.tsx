import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { allColors, sortTeamsByColor, TeamColor } from '../../model/game/team';
import { TeamForm } from './TeamForm';

export const TeamModerationView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const [availableColors, setAvailableColors] = useState<Array<TeamColor>>([]);
    const [usedColors, setUsedColors] = useState<Array<TeamColor>>([]);

    useEffect(() => {
        const available = allColors().filter((color) => !game.teams.has(color));
        setAvailableColors(available);

        const used = allColors().filter((color) => game.teams.has(color));
        setUsedColors(used);
    }, [game]);

    return (
        <div className="d-grid grid-columns-xl" style={{ gap: '0.75rem 1rem' }}>
            {Array.from(game.teams.values()).sort(sortTeamsByColor)
                .map((team) => (
                    <TeamForm
                        key={`form-${team.color}`}
                        team={team}
                        availableColors={availableColors}
                        usedColors={usedColors}
                    />
                ))}
        </div>
    );
};
