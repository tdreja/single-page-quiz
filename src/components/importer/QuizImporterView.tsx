import React, { ReactElement, useCallback, useState } from 'react';
import { generateJsonQuestionTable, JsonStaticGameData } from '../../model/game/json/game';
import { QuestionTable } from '../../model/game/game';

const toEmptyString = () => '';

async function readJson(input: HTMLInputElement): Promise<JsonStaticGameData | null> {
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
            resolve(JSON.parse(raw as string) as JsonStaticGameData);
        };
        fileReader.readAsText(files[0]);
    });
}

export const QuizImporterView = (): ReactElement => {
    const [json, setJson] = useState<JsonStaticGameData | null>(null);
    const [previewTable, setPreviewTable] = useState<QuestionTable<string>>(generateJsonQuestionTable({}, toEmptyString));

    const uploadFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = await readJson(event.target);
        setJson(file);
        if (file) {
            setPreviewTable(generateJsonQuestionTable(file, toEmptyString));
        } else {
            setPreviewTable(generateJsonQuestionTable({}, toEmptyString));
        }
    }, [json, previewTable]);

    return (
        <div>
            <input type="file" accept="application/json" onChange={uploadFile} />
            <table>
                <thead>
                    <tr>
                        {previewTable.headlines.map((header) => (
                            <th key={header.key}>{header.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {
                        previewTable.rows.map((row, index) => (
                            <tr key={`row-${index}`}>
                                {
                                    row.map((cell) => (
                                        <td key={cell.key}>{cell.label}</td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
};
