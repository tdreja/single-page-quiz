import React, { ReactElement, useCallback, useState } from 'react';
import { JsonStaticGameData } from '../../model/game/json/game';

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

    const uploadFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        setJson(await readJson(event.target));
    }, [json]);

    return (
        <div>
            <input type="file" accept="application/json" onChange={uploadFile} />
            <span>{json ? JSON.stringify(json) : 'none'}</span>
        </div>
    );
};
