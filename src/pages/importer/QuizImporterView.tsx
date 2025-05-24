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
                                onApply={() => {}}
                                onCancel={() => setImported({})}
                            />
                        </>
                    )
                }
                {
                    imported.players && (
                        <>
                            <div className="card-header">{i18n.importer.playersUploadedHeader}</div>
                            <div className="card-body">

                            </div>
                            <ImportActions
                                applyIcon="how_to_reg"
                                onApply={() => {}}
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

                            </div>
                            <ImportActions
                                applyIcon="reduce_capacity"
                                onApply={() => {}}
                                onCancel={() => setImported({})}
                            />
                        </>
                    )
                }
            </div>
        </div>
    );
};
