import React, { ReactElement, useCallback, useContext, useEffect, useState, WheelEventHandler } from 'react';
import { Game, GamePage } from '../model/game/game';
import { GameContext } from '../components/common/GameContext';
import { TabContext, TabSettings, TabType } from '../components/mode/TabContext';
import { I18N, Labels } from '../i18n/I18N';

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

function modeLabel(tabType: TabType, i18n: Labels): string {
    switch (tabType) {
        case TabType.MODERATION:
            return i18n.settings.tooltipModeModeration;
        case TabType.PARTICIPANTS:
            return i18n.settings.tooltipModeParticipants;
        default:
            return i18n.settings.tooltipModeShared;
    }
}

function layoutClass(page: GamePage, scrollHorizontal: boolean): string {
    if (scrollHorizontal || page === GamePage.EDIT_QUIZ) {
        return 'app-layout-full';
    }
    if (page === GamePage.GAME_ACTIVE) {
        return 'app-layout-wide';
    }
    return '';
}

function isVisible(child: ReactElement<SubPageProps>, game: Game, tabSettings: TabSettings): boolean {
    return child.props.state === game.page && child.props.tabType.includes(tabSettings.tabType);
}

export const MainPage = ({ children }: MainProps): ReactElement => {
    const game = useContext<Game>(GameContext);
    const tabSettings = useContext<TabSettings>(TabContext);
    const i18n = useContext(I18N);

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
        <main id="main-content" className={layoutClass(game.page, scrollHorizontal)} onWheel={scrollRedirector}>
            <div className="app-container">
                {game.page !== GamePage.GAME_ACTIVE && (
                    <header className="page-heading">
                        <div className="page-eyebrow">{modeLabel(tabSettings.tabType, i18n)}</div>
                        <h1 className="page-title">{i18n.game[game.page]}</h1>
                    </header>
                )}
                {
                    children
                        ? children.filter((child) => isVisible(child, game, tabSettings))
                        : undefined
                }
            </div>
        </main>
    );
};
