import { emptyGame, Game } from '../../model/game/game';
import { GameEvent } from '../../events/common-events';
import { Context, createContext } from 'react';

export type GameEventListener = (event: GameEvent) => void;

export const GameContext: Context<Game> = createContext<Game>(emptyGame());
export const GameEventContext: Context<GameEventListener> = createContext<GameEventListener>((_: GameEvent) => {});
