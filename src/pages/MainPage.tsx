import React, { ReactElement, useCallback, useContext, useEffect, useState, WheelEventHandler } from 'react';
import { Game, GamePage } from '../model/game/game';
import { GameContext } from '../components/common/GameContext';
import { TabContext, TabSettings, TabType } from '../components/mode/TabContext';

export interface SubPageProps {
    state: GamePage,
    tabType: TabType[],
    children?: ReactElement,
    scrollHorizontal?: boolean,
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

function isVisible(child: ReactElement<SubPageProps>, game: Game, tabSettings: TabSettings): boolean {
    return child.props.state === game.page && child.props.tabType.includes(tabSettings.tabType);
}

export const MainPage = ({ children }: MainProps): ReactElement => {
    const game = useContext<Game>(GameContext);
    const tabSettings = useContext<TabSettings>(TabContext);

    const [scrollHorizontal, setScrollHorizontal] = useState<boolean>(false);
    useEffect(() => {
        if (children && children.find((c) => isVisible(c, game, tabSettings) && c.props.scrollHorizontal)) {
            setScrollHorizontal(true);
        } else {
            setScrollHorizontal(false);
        }
    }, [game, tabSettings, children]);

    const scrollRedirector = useCallback<WheelEventHandler>((ev) => {
        if (!scrollHorizontal) {
            return;
        }
        const main = document.getElementById('main-content');
        if (main && ev.deltaX === 0) {
            ev.preventDefault();
            main.scrollBy({ left: ev.deltaY });
        }
    }, [scrollHorizontal]);

    return (
        <main id="main-content" className="d-flex w-100 ps-3 pe-3 pt-2 pb-2" onWheel={scrollRedirector}>
            <div className="w-100">
                {
                    children
                        ? children.filter((child) => isVisible(child, game, tabSettings))
                        : undefined
                }
            </div>
        </main>
    );
};
