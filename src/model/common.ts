export function asSet<VALUE>(value?: VALUE, ...others: Array<VALUE>): Set<VALUE> {
    const result: Set<VALUE> = new Set<VALUE>();
    if (value) {
        result.add(value);
    }
    for (const otherValue of others) {
        result.add(otherValue);
    }
    return result;
}

export function arrayAsSet<VALUE>(value?: Array<VALUE>): Set<VALUE> {
    const result: Set<VALUE> = new Set<VALUE>();
    if (!value) {
        return result;
    }
    for (const otherValue of value) {
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

export function nextRandom<VALUE>(values: Array<VALUE>): VALUE | null {
    if (values.length === 0) {
        return null;
    }
    const randNr = Math.floor(Math.random() * values.length);
    return values[randNr];
}
