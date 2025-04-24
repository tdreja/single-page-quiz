import {Emoji} from "./player.ts";
import {TeamColor} from "./team.ts";

export type ByString<TYPE> = {
    [key in string]?: TYPE;
}

export function keysOf<TYPE>(byString?: ByString<TYPE> | ByColor<TYPE> | ByEmoji<TYPE>): Array<string> {
    if(!byString) {
        return [];
    }
    return Object.keys(byString);
}

export function valuesOf<TYPE>(byString?: ByString<TYPE> | ByEmoji<TYPE> | ByColor<TYPE>): Array<TYPE> {
    const array: Array<TYPE> = [];
    if(!byString) {
        return array;
    }
    for(const key of Object.keys(byString)) {
        const value = (byString as any)[key];
        if(value) {
            array.push(value);
        }
    }
    return array;
}

export function map<IN,OUT>(mapper: (input: IN) => OUT, by?: ByString<IN> | ByEmoji<IN> | ByColor<IN>): Array<OUT> {
    const output: Array<OUT> = [];
    if(!by) {
        return output;
    }
    for(const key of Object.keys(by)) {
        const value = (by as any)[key];
        if(value) {
            output.push(mapper(value));
        }
    }
    return output;
}

class ByKeyIterator<TYPE> implements Iterator<TYPE> {

    private index: number;
    private readonly data: ByString<TYPE> | ByEmoji<TYPE> | ByColor<TYPE>;
    private readonly keys: Array<string>;

    constructor(data: ByString<TYPE> | ByEmoji<TYPE> | ByColor<TYPE>) {
        this.data = data;
        this.keys = Object.keys(data);
        this.index = 0;
    }

    next(): IteratorResult<TYPE, number | undefined> {
        if(this.index >= this.keys.length) {
            return {
                value: undefined,
                done: true
            }
        }
        const item = (this.data as any)[this.keys[this.index]];
        this.index++;
        return { value: item, done: this.index == this.keys.length };
    }

}

export function iteratorOf<TYPE>(by?: ByString<TYPE> | ByEmoji<TYPE> | ByColor<TYPE>): Iterable<TYPE> {
    return {
        [Symbol.iterator](): Iterator<TYPE, any, any> {
            return new ByKeyIterator(by || {});
        }
    }
}

export type ByEmoji<TYPE> = {
    [emoji in Emoji]?: TYPE;
}

export function emojisOf<TYPE>(byEmoji?: ByEmoji<TYPE>): Array<Emoji> {
    if(!byEmoji) {
        return [];
    }
    return Object.keys(byEmoji) as Array<Emoji>;
}

export type ByColor<TYPE> = {
    [color in TeamColor]?: TYPE;
}

export function colorsOf<TYPE>(byColor?: ByColor<TYPE>): Array<TeamColor> {
    if(!byColor) {
        return [];
    }
    return Object.keys(byColor) as Array<TeamColor>;
}

export function clear<TYPE>(by?: ByString<TYPE> | ByColor<TYPE> | ByEmoji<TYPE>) {
    if(!by) {
        return;
    }
    for(const key of Object.keys(by)) {
        delete (by as any)[key];
    }
}