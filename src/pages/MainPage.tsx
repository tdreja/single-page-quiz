import React, { ReactElement, useContext } from 'react';
import { Game, GameState } from '../model/game/game';
import { GameContext } from '../components/common/GameContext';
import { TabContext, TabSettings, TabType } from '../components/mode/TabContext';

export interface SubPageProps {
    state: GameState,
    tabType: TabType[],
    children?: ReactElement,
}

interface MainProps {
    children?: ReactElement<SubPageProps>[],
}

export const SubPage = ({ children }: SubPageProps): ReactElement => {
    return (
        <>
            {children}
        </>
    );
};

export const MainPage = ({ children }: MainProps): ReactElement => {
    const game = useContext<Game>(GameContext);
    const tabSettings = useContext<TabSettings>(TabContext);

    return (
        <main id="main-content" className="d-flex w-100 ps-3 pe-3 pt-2 pb-2">
            <div className="w-100">
                {
                    children
                        ? children.filter((child) => child.props.state === game.state
                          && child.props.tabType.includes(tabSettings.tabType))
                        : undefined
                }
            </div>
        </main>
    );
};
