import React, { ReactElement, useCallback, useState } from 'react';
import { generateJsonQuestionTable, JsonStaticGameData } from '../../model/game/json/game';
import { QuestionTable } from '../../model/game/game';
import { parse } from 'yaml';
import { QuizTable, QuizTableProps } from '../QuizTable';

const toEmptyString = () => '';

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

export const QuizImporterView = (): ReactElement => {
    const [json, setJson] = useState<JsonStaticGameData | null>(null);
    const [previewTable, setPreviewTable] = useState<QuestionTable<string>>(generateJsonQuestionTable({}, toEmptyString));

    const uploadFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = await readYaml(event.target);
        setJson(file);
        if (file) {
            setPreviewTable(generateJsonQuestionTable(file, toEmptyString));
        } else {
            setPreviewTable(generateJsonQuestionTable({}, toEmptyString));
        }
    }, [json, previewTable]);

    const tableProps: QuizTableProps<string> = {
        table: previewTable,
    };

    return (
        <div>
            <input type="file" accept=".json,.yaml,.yml,application/json,application/yaml" onChange={uploadFile} />
            <QuizTable {...tableProps} />
        </div>
    );
};
