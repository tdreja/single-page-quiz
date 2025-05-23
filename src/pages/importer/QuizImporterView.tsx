import React, { ReactElement, useCallback, useState } from 'react';
import { generateJsonQuestionTable, JsonStaticGameData } from '../../model/game/json/game';
import { parse } from 'yaml';
import { QuizTableProps, QuizTableView } from '../QuizTable';
import { QuizTable } from '../../model/base/table';
import { JsonStaticQuestionData } from '../../model/quiz/json';
import { SharedProps } from '../quiz/SharedProps';

async function readYaml(input: HTMLInputElement): Promise<JsonStaticGameData | null> {
    const files = input.files;
    if (!files || files.length < 1) {
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
        fileReader.readAsText(files[0]);
    });
}

export const QuizImporterView = ({ shared }: SharedProps): ReactElement => {
    const [json, setJson] = useState<JsonStaticGameData | null>(null);
    const [previewTable, setPreviewTable] = useState<QuizTable<JsonStaticQuestionData>>(generateJsonQuestionTable({}));

    const uploadFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = await readYaml(event.target);
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
        <div>
            <input type="file" accept=".json,.yaml,.yml,application/json,application/yaml" onChange={uploadFile} />
            <QuizTableView {...tableProps} />
        </div>
    );
};
