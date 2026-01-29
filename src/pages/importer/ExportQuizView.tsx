import React, { ReactElement, useCallback, useContext } from 'react';
import { I18N } from '../../i18n/I18N';
import { Game } from '../../model/game/game';
import { GameContext } from '../../components/common/GameContext';
import { stringify } from 'yaml';
import { exportStaticGameContent } from '../../model/quiz/json';
import { JsonPlayer, JsonPlayerData, storePlayer } from '../../model/game/player_json';
import { JsonTeam, storeTeam } from '../../model/game/team_json';
import { JsonTeamAndPlayerData } from '../../model/game/game_json';

function downloadYaml(yaml: string, fileName: string) {
    const href = document.createElement('a');
    href.download = fileName;
    const url = URL.createObjectURL(new Blob([yaml], { type: 'application/yaml' }));
    href.href = url;
    href.click();
}

export const ExportQuizView = (): ReactElement => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);

    const exportQuiz = useCallback(() => {
        const content = stringify(exportStaticGameContent(game));
        downloadYaml(content, `${game.quizName}.yaml`);
    }, [game]);

    const exportPlayers = useCallback(() => {
        const players: Array<JsonPlayer> = Array.from(game.players.values())
            .map((player) => storePlayer(player));
        const playerList: JsonPlayerData = {
            players,
            quizName: game.quizName,
        };
        downloadYaml(stringify(playerList), `Players-${game.quizName}.yaml`);
    }, [game]);

    const exportTeamsAndPlayers = useCallback(() => {
        const players: Array<JsonPlayer> = Array.from(game.players.values())
            .map((player) => storePlayer(player));
        const teams: Array<JsonTeam> = Array.from(game.teams.values())
            .map((team) => storeTeam(team));
        const result: JsonTeamAndPlayerData = {
            players,
            teams,
            quizName: game.quizName,
        };
        downloadYaml(stringify(result), `Teams-Players-${game.quizName}.yaml`);
    }, [game]);

    return (
        <div className="card">
            <div className="card-header">Quiz exportieren</div>
            <div className="card-body d-flex gap-2">
                <div
                    className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                    onClick={exportQuiz}
                >
                    <span className="material-symbols-outlined">deployed_code_update</span>
                    Export Quiz
                </div>
                <div
                    className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                    onClick={exportTeamsAndPlayers}
                >
                    <span className="material-symbols-outlined">scoreboard</span>
                    Export Teams & Spieler
                </div>
                <div
                    className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                    onClick={exportPlayers}
                >
                    <span className="material-symbols-outlined">engineering</span>
                    Export Spieler
                </div>
            </div>
        </div>
    );
};
