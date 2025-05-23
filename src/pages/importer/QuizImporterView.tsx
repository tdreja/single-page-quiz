import React, { ReactElement, useCallback, useContext, useState } from 'react';
import { generateJsonQuestionTable, JsonStaticGameData } from '../../model/game/json/game';
import { parse } from 'yaml';
import { QuizTableProps, QuizTableView } from '../QuizTable';
import { QuizTable } from '../../model/base/table';
import { JsonStaticQuestionData } from '../../model/quiz/json';
import { SharedProps } from '../quiz/SharedProps';
import { I18N } from '../../i18n/I18N';
import { GameEventContext } from '../../components/common/GameContext';
import { ExportQuizView } from './ExportQuizView';

async function readYaml(fileList: FileList | null): Promise<JsonStaticGameData | null> {
    if (!fileList || fileList.length < 1) {
        return Promise.resolve(null);
    }
    return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = (data) => {
            if (!data.target) {
                resolve(null);
                return;
            }
            const raw = data.target.result;
            if (!raw) {
                resolve(null);
                return;
            }
            resolve(parse(raw as string) as JsonStaticGameData);
        };
        fileReader.readAsText(fileList[0]);
    });
}

export const QuizImporterView = ({ shared }: SharedProps): ReactElement => {
    const i18n = useContext(I18N);
    const [json, setJson] = useState<JsonStaticGameData | null>(null);
    const [previewTable, setPreviewTable] = useState<QuizTable<JsonStaticQuestionData>>(generateJsonQuestionTable({}));
    const onGameEvent = useContext(GameEventContext);

    const uploadFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = await readYaml(event.target.files);
        setJson(file);
        if (file) {
            setPreviewTable(generateJsonQuestionTable(file));
        } else {
            setPreviewTable(generateJsonQuestionTable({}));
        }
    }, [json, previewTable]);

    const dropFile = useCallback(async (event: React.DragEvent<HTMLInputElement>) => {
        event.preventDefault();
        const file = await readYaml(event.dataTransfer.files);
        setJson(file);
        if (file) {
            setPreviewTable(generateJsonQuestionTable(file));
        } else {
            setPreviewTable(generateJsonQuestionTable({}));
        }
    }, [json, previewTable]);

    const tableProps: QuizTableProps<JsonStaticQuestionData> = {
        table: previewTable,
        showDetails: !shared,
    };

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
                <div className="card-header">{i18n.importer.previewHeader}</div>
                { !json && (<span className="card-body">{i18n.importer.noNewQuizUploaded}</span>)}
                { json && (
                    <>
                        <div className="card-body">
                            <QuizTableView {...tableProps} className="card-body" />
                        </div>
                        <div className="card-body">
                            <span className="btn btn-primary">Übernehmen</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
