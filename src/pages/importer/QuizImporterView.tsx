import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { generateJsonQuestionTable } from '../../model/game/json/game_json';
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
import { sortPlayersHighestFirst } from '../../model/game/player';
import { sortTeamsHighestFirst } from '../../model/game/team';
import { TeamViewExpanded } from '../../sections/bottom/TeamViewExpanded';
import { getPlayers } from '../../model/game/json/team_json';
import { DialogContext, openDialog } from '../../components/mode/DialogContext';

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
    const dialog = useContext(DialogContext);
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

    const importQuiz = useCallback(() => {
        const quiz = imported.quiz;
        if (!quiz) {
            return;
        }
        openDialog(
            i18n.importer.dialogImportTitle,
            i18n.importer.dialogImportQuizMessage,
            dialog,
            () => {
                onGameEvent(new ImportQuizEvent(quiz));
                setImported({});
            },
        );
    }, [imported]);

    const importPlayers = useCallback(() => {
        const players = imported.players;
        if (!players) {
            return;
        }
        openDialog(
            i18n.importer.dialogImportTitle,
            i18n.importer.dialogImportPlayersMessage,
            dialog,
            () => {
                onGameEvent(new ImportPlayersEvent(players));
                setImported({});
            },
        );
    }, [imported]);

    const importTeams = useCallback(() => {
        const teams = imported.teams;
        if (!teams) {
            return;
        }
        openDialog(
            i18n.importer.dialogImportTitle,
            i18n.importer.dialogImportTeamsMessage,
            dialog,
            () => {
                onGameEvent(new ImportTeamsEvent(teams));
                setImported({});
            },
        );
    }, [imported]);

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
                                onApply={importQuiz}
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
                                onApply={importPlayers}
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
                                onApply={importTeams}
                                onCancel={() => setImported({})}
                            />
                        </>
                    )
                }
            </div>
        </div>
    );
};
