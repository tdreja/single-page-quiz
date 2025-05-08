import React, { ReactElement, useCallback, useState } from 'react';
import { generateJsonQuestionMatrix, JsonStaticGameData } from '../../model/game/json/game';
import { QuestionTableCell } from '../../model/game/game';

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
    const [previewMatrx, setPreviewMatrx] = useState<QuestionTableCell<string>[]>([]);

    const uploadFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = await readJson(event.target);
        setJson(file);
        if (file) {
            setPreviewMatrx(generateJsonQuestionMatrix(file, () => ''));
        } else {
            setPreviewMatrx([]);
        }
    }, [json, previewMatrx]);

    return (
        <div>
            <input type="file" accept="application/json" onChange={uploadFile} />
            <div className="d-grid" style={{ gridTemplateColumns: `repeat(${json?.sections?.length || 1}, 1fr)` }}>
                {
                    previewMatrx.map((item) => (
                        <span key={item.key}>{item.label}</span>
                    ))
                }
            </div>
        </div>
    );
};
