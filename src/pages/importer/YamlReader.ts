import { parse } from 'yaml';
import { JsonStaticGameData, JsonTeamAndPlayerData } from '../../model/game/json/game';
import { JsonPlayerData } from '../../model/game/json/player';

export interface ImportedData {
    quiz?: JsonStaticGameData,
    teams?: JsonTeamAndPlayerData,
    players?: JsonPlayerData,
}

async function readYaml(fileList: FileList | null): Promise<object | null> {
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
            resolve(parse(raw as string));
        };
        fileReader.readAsText(fileList[0]);
    });
}

export async function importYaml(fileList: FileList | null): Promise<ImportedData> {
    const raw: object | null = await readYaml(fileList);
    if (raw === null) {
        return {};
    }
    const attributes = Object.keys(raw);
    if (attributes.includes('columns')) {
        return {
            quiz: raw as JsonStaticGameData,
        };
    }
    if (attributes.includes('teams')) {
        return {
            teams: raw as JsonTeamAndPlayerData,
        };
    }
    if (attributes.includes('players')) {
        return {
            players: raw as JsonPlayerData,
        };
    }
    return {};
}
