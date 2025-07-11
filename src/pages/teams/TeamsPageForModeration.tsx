import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Game } from '../../model/game/game';
import { allColors, sortTeamsHighestFirst, TeamColor } from '../../model/game/team';
import { TeamForm } from './TeamForm';
import { I18N } from '../../i18n/I18N';
import { AddTeamEvent, RemoveTeamEvent, ShuffleTeamsEvent } from '../../events/setup-events';
import { calculatePlacementsForAll, PlacementPointsForAll } from '../../model/placement';
import { GameContext, GameEventContext } from '../../components/common/GameContext';
import { TeamColorButton } from '../../components/common/TeamColorButton';
import { DialogContext, openDialog } from '../../components/mode/DialogContext';

export const TeamsPageForModeration = (): ReactElement => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);
    const dialog = useContext(DialogContext);
    const onGameEvent = useContext(GameEventContext);
    const [availableColors, setAvailableColors] = useState<Array<TeamColor>>([]);
    const [placements, setPlacements] = useState<PlacementPointsForAll>(calculatePlacementsForAll([]));

    useEffect(() => {
        const available = allColors().filter((color) => !game.teams.has(color));
        setAvailableColors(available);
        setPlacements(calculatePlacementsForAll(Array.from(game.teams.values()).map((team) => team.points)));
    }, [game]);

    return (
        <div className="d-grid gap-2 grid-columns-xl">
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
                                className="btn btn-outline-primary material-symbols-outlined"
                                title={i18n.teamEditor.tooltipShuffle}
                                onClick={() => onGameEvent(new ShuffleTeamsEvent(Array.from(game.teams.keys())))}
                            >
                                shuffle
                            </span>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="clear-teams" className="form-label">
                            {i18n.teamEditor.labelClear}
                        </label>
                        <div id="clear-teams">
                            <span
                                className="btn btn-outline-danger material-symbols-outlined"
                                title={i18n.teamEditor.tooltipClear}
                                onClick={() => openDialog(
                                    i18n.teamEditor.dialogRemoveAllTitle,
                                    i18n.teamEditor.dialogRemoveAllMessage,
                                    dialog,
                                    () => onGameEvent(new RemoveTeamEvent(Array.from(game.teams.keys()))),
                                )}
                            >
                                delete_sweep
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
                        placements={placements}
                    />
                ))}
        </div>
    );
};
