import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { generateJsonQuestionTable, JsonStaticGameData } from '../../model/game/json/game';
import { parse } from 'yaml';
import { QuizTableProps, QuizTableView } from '../QuizTable';
import { QuizTable } from '../../model/base/table';
import { JsonStaticQuestionData } from '../../model/quiz/json';
import { SharedProps } from '../quiz/SharedProps';
import { I18N } from '../../i18n/I18N';
import { GameEventContext } from '../../components/common/GameContext';
import { ExportQuizView } from './ExportQuizView';
import { ImportedData, importYaml } from './YamlReader';
import { ImportPlayersEvent, ImportQuizEvent, ImportTeamsEvent } from '../../events/setup-events';
import { PlayerWithPointsView } from '../../components/common/PlayerWithPointsView';
import { sortPlayersByName, sortPlayersHighestFirst } from '../../model/game/player';
import { sortTeamsHighestFirst } from '../../model/game/team';
import { TeamViewExpanded } from '../../sections/bottom/TeamViewExpanded';
import { getPlayers } from '../../model/game/json/team';

interface ActionProps {
    applyIcon: string,
    onApply: () => void,
    onCancel: () => void,
}

const ImportActions = ({ applyIcon, onApply, onCancel }: ActionProps): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <div className="card-body d-flex gap-2">
            <span
                className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                onClick={onApply}
            >
                <span className="material-symbols-outlined">{applyIcon}</span>
                {i18n.importer.actionApply}
            </span>
            <span
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                onClick={onCancel}
            >
                <span className="material-symbols-outlined">close</span>
                {i18n.importer.actionCancel}
            </span>
        </div>
    );
};

export const QuizImporterView = ({ shared }: SharedProps): ReactElement => {
    const i18n = useContext(I18N);
    const onGameEvent = useContext(GameEventContext);
    const [imported, setImported] = useState<ImportedData>({});
    const [previewTable, setPreviewTable] = useState<QuizTable<JsonStaticQuestionData>>(generateJsonQuestionTable({}));

    const uploadFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        setImported(await importYaml(event.target.files));
    }, [imported]);

    const dropFile = useCallback(async (event: React.DragEvent<HTMLInputElement>) => {
        event.preventDefault();
        setImported(await importYaml(event.dataTransfer.files));
    }, [imported]);

    const tableProps: QuizTableProps<JsonStaticQuestionData> = {
        table: previewTable,
        showDetails: !shared,
    };

    useEffect(() => {
        if (imported.quiz) {
            setPreviewTable(generateJsonQuestionTable(imported.quiz));
        } else {
            setPreviewTable(generateJsonQuestionTable({}));
        }
    }, [imported]);

    return (
        <div className="d-flex flex-row flex-wrap align-items-baseline gap-4">
            <ExportQuizView />
            <div className="card">
                <div className="card-header">{i18n.importer.formHeader}</div>
                <div className="card-body">
                    <input
                        id="yaml-upload"
                        className="form-control"
                        type="file"
                        accept=".json,.yaml,.yml,application/json,application/yaml"
                        onChange={uploadFile}
                        onDrop={dropFile}
                    />
                </div>
            </div>
            <div className="card w-100 flex-grow-1">

                {
                    (!imported.quiz && !imported.teams && !imported.players)
                    && (
                        <>
                            <div className="card-header">{i18n.importer.noFileUploadedHeader}</div>
                            <span className="card-body">{i18n.importer.noNewQuizUploaded}</span>
                        </>
                    )
                }
                {
                    imported.quiz && (
                        <>
                            <div className="card-header">{i18n.importer.quizUploadedHeader}</div>
                            <div className="card-body">
                                <QuizTableView {...tableProps} className="card-body" />
                            </div>
                            <ImportActions
                                applyIcon="sync_saved_locally"
                                onApply={() => {
                                    if (imported.quiz) {
                                        onGameEvent(new ImportQuizEvent(imported.quiz));
                                        setImported({});
                                    }
                                }}
                                onCancel={() => setImported({})}
                            />
                        </>
                    )
                }
                {
                    imported.players && (
                        <>
                            <div className="card-header">{i18n.importer.playersUploadedHeader}</div>
                            <div className="card-body d-grid grid-columns-lg gap-2">
                                {
                                    (imported.players.players || [])
                                        .sort(sortPlayersHighestFirst)
                                        .map((player) => (
                                            <PlayerWithPointsView
                                                key={`player-${player.emoji}`}
                                                player={player}
                                                size="small"
                                            />
                                        ))
                                }
                            </div>
                            <ImportActions
                                applyIcon="how_to_reg"
                                onApply={() => {
                                    if (imported.players) {
                                        onGameEvent(new ImportPlayersEvent(imported.players));
                                        setImported({});
                                    }
                                }}
                                onCancel={() => setImported({})}
                            />
                        </>
                    )
                }
                {
                    imported.teams && (
                        <>
                            <div className="card-header">{i18n.importer.teamsUploadedHeader}</div>
                            <div className="card-body">
                                {
                                    (imported.teams.teams || [])
                                        .sort(sortTeamsHighestFirst)
                                        .map((team) => (
                                            <TeamViewExpanded
                                                key={`team-${team.color}`}
                                                team={team}
                                                players={getPlayers(team, imported.teams)}
                                            />
                                        ))
                                }
                            </div>
                            <ImportActions
                                applyIcon="reduce_capacity"
                                onApply={() => {
                                    if (imported.teams) {
                                        onGameEvent(new ImportTeamsEvent(imported.teams));
                                        setImported({});
                                    }
                                }}
                                onCancel={() => setImported({})}
                            />
                        </>
                    )
                }
            </div>
        </div>
    );
};
