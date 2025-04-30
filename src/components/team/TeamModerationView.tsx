import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Game } from '../../model/game/game';
import { GameContext, GameEventContext } from '../common/GameContext';
import { allColors, sortTeamsHighestFirst, TeamColor } from '../../model/game/team';
import { TeamForm } from './TeamForm';
import { I18N } from '../../i18n/I18N';
import { TeamColorButton } from '../common/TeamColorButton';
import { AddTeamEvent, ShuffleTeamsEvent } from '../../events/setup-events';

export const TeamModerationView = (): ReactElement => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);
    const onGameEvent = useContext(GameEventContext);
    const [availableColors, setAvailableColors] = useState<Array<TeamColor>>([]);

    useEffect(() => {
        const available = allColors().filter((color) => !game.teams.has(color));
        setAvailableColors(available);
    }, [game]);

    return (
        <div className="d-flex flex-row flex-wrap" style={{ gap: '0.75rem 1rem' }}>
            <div className="card flex-grow-1">
                <div className="card-header">
                    {i18n.teamEditor.labelActions}
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label htmlFor="add-new-teams" className="form-label">
                            {i18n.teamEditor.tooltipAdd}
                        </label>
                        <div id="add-new-teams">
                            <div className="btn-group">
                                {
                                    availableColors.map((color) => (
                                        <TeamColorButton
                                            key={`new-team-${color}`}
                                            color={color}
                                            title={i18n.teamEditor.tooltipSwitchColor}
                                            onClick={() => onGameEvent(new AddTeamEvent(color))}
                                        >
                                            {i18n.teams[color]}
                                        </TeamColorButton>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="shuffle-teams" className="form-label">
                            {i18n.teamEditor.labelShuffle}
                        </label>
                        <div id="shuffle-teams">
                            <span
                                className="btn btn-outline-danger material-symbols-outlined"
                                title={i18n.teamEditor.tooltipShuffle}
                                onClick={() => onGameEvent(new ShuffleTeamsEvent(game.teams.size))}
                            >
                                shuffle
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {Array.from(game.teams.values()).sort(sortTeamsHighestFirst)
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
