import React, { ChangeEvent, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { RoundAndItemProps } from './QuestionView';
import { ActionQuestion } from '../../model/quiz/action-question';
import { TabContext } from '../common/TabContext';
import { CompletionPercent } from '../../model/quiz/question';
import { Game } from '../../model/game/game';
import { TeamColor } from '../../model/game/team';
import { I18N } from '../../i18n/I18N';
import { TeamColorButton } from '../common/TeamColorButton';

function buildInitialCompletion(game: Game): CompletionPercent {
    const completion: CompletionPercent = {};
    for (const color of game.teams.keys()) {
        completion[color] = 0;
    }
    return completion;
}

export const ActionQuestionView = ({ game, round, item }: RoundAndItemProps<ActionQuestion>): ReactElement => {
    const i18n = useContext(I18N);
    const tabSettings = useContext(TabContext);
    const [completion, setCompletion] = useState<CompletionPercent>(buildInitialCompletion(game));
    useEffect(() => {
        setCompletion(buildInitialCompletion(game));
    }, [game]);

    const onSliderChange = useCallback((ev: ChangeEvent<HTMLInputElement>, color: TeamColor) => {
        const value = Number(ev.target.value);
        if (Number.isNaN(value) || value < 0 || value > 100) {
            return;
        }
        setCompletion({
            ...completion,
            [color]: value,
        });
    }, [completion]);

    return (
        <div className="card-body">
            <h4 className="card-title pb-2">{item.text}</h4>

            {tabSettings.settings.moderation && (
                <table className="table" style={{ maxWidth: '60rem' }}>
                    {
                        game.teams.values().map((team) => (
                            <tr key={`team-input-${team.color}`}>
                                <td width="15%">
                                    <TeamColorButton color={team.color}>
                                        <span
                                            className="rounded-pill text-bg-light ps-2 pe-2 fw-bold ms-2 me-2"
                                        >
                                            {i18n.teams[team.color]}
                                        </span>
                                    </TeamColorButton>
                                </td>
                                <td width="70%">
                                    <input
                                        type="range"
                                        className="form-range"
                                        name={`team-input-${team.color}-slider`}
                                        id={`team-input-${team.color}`}
                                        value={completion[team.color]}
                                        min={0}
                                        max={100}
                                        step={5}
                                        onChange={(ev) => onSliderChange(ev, team.color)}
                                    />
                                </td>
                                <td width="15%">
                                    <span>{`${completion[team.color]}`}</span>
                                </td>
                            </tr>
                        ))
                    }
                </table>
            )}
        </div>
    );
};
