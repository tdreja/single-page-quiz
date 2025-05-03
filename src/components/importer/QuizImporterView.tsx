import React, { ReactElement, useCallback, useState } from 'react';

export const QuizImporterView = (): ReactElement => {
    const [json, setJson] = useState<string>('');

    const handleFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        console.log('Files', files);

        if (!files || files.length < 1) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (load) => {
            if (load.target) {
                const data = load.target.result;
                if (data) {
                    setJson(data as string);
                }
            }
        };
        reader.readAsText(files[0]);
    }, [json]);

    return (
        <div>
            <input type="file" accept="application/json" onChange={handleFile} />
            <span>{json}</span>
        </div>
    );
};
