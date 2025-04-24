export function deleteAll(value?: object) {
    if(!value) {
        return;
    }
    for(const key of Object.keys(value)) {
        delete (value as any)[key];
    }
}

export function asSet<VALUE>(value?: VALUE, ...others: Array<VALUE>): Set<VALUE> {
    const result: Set<VALUE> = new Set<VALUE>();
    if(value) {
        result.add(value);
    }
    for(const otherValue of others) {
        result.add(otherValue);
    }
    return result;
}

export function arrayAsSet<VALUE>(value?: Array<VALUE>): Set<VALUE> {
    const result: Set<VALUE> = new Set<VALUE>();
    if(!value) {
        return result;
    }
    for(const otherValue of value) {
        result.add(otherValue);
    }
    return result;
}


export function shuffleArray<TYPE>(array: Array<TYPE>) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function nextRandom<VALUE>(values: Set<VALUE>): VALUE | null {
    if(values.size === 0) {
        return null;
    }
    const randNr = Math.floor(Math.random() * values.size);
    let count = 0;
    for(let value of values) {
        if(count === randNr) {
            return value;
        }
        count++;
    }
    return null;
}