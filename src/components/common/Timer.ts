const millisInSecond = 1000;
const millisInMinute = 60 * millisInSecond;
const millisInHour = 60 * millisInMinute;
const millisInDay = 24 * millisInHour;

export interface TimeInfo {
    readonly days: string,
    readonly hours: string,
    readonly minutes: string,
    readonly seconds: string,
    readonly milliseconds: string,
}

function formatNumber(value: number, alwaysInclude?: boolean): string {
    if (value === 0) {
        return alwaysInclude ? '00' : '';
    }
    if (value < 10) {
        return `0${value}`;
    }
    return `${value}`;
}

export class Timer {
    private _timerId: NodeJS.Timeout | null;
    private _start: Date | null;

    public constructor() {
        this._start = null;
        this._timerId = null;
    }

    public updateTimer(setter: (value: TimeInfo | null) => void, date: Date | null) {
        if (!date) {
            this.stopTimer(setter);
            return;
        }
        if (this._start === date) {
            return;
        }
        if (this._timerId !== null) {
            clearInterval(this._timerId);
        }
        this._start = date;
        this._timerId = setInterval(() => this.calculateTimer(setter), 100);
        this.calculateTimer(setter);
    }

    private stopTimer(setter: (value: TimeInfo | null) => void) {
        this._start = null;
        if (this._timerId !== null) {
            clearInterval(this._timerId);
            this._timerId = null;
        }
        setter(null);
    }

    private calculateTimer(setter: (value: TimeInfo | null) => void) {
        if (!this._start) {
            setter(null);
            return;
        }
        const timer = this.calculateTimeInfo(this._start, new Date());
        // console.log(timer);
        setter(timer);
    }

    calculateTimeInfo(from: Date, to: Date): TimeInfo {
        let timeDifference = to.getTime() - from.getTime();

        const days = Math.floor(timeDifference / millisInDay);
        timeDifference = timeDifference - (days * millisInDay);

        const hours = Math.floor(timeDifference / millisInHour);
        timeDifference = timeDifference - (hours * millisInHour);

        const minutes = Math.floor(timeDifference / millisInMinute);
        timeDifference = timeDifference - (minutes * millisInMinute);

        const seconds = Math.floor(timeDifference / millisInSecond);
        timeDifference = timeDifference - (seconds * millisInSecond);

        return {
            days: formatNumber(days),
            hours: formatNumber(hours, days > 0),
            minutes: formatNumber(minutes, true),
            seconds: formatNumber(seconds, true),
            milliseconds: formatNumber(Math.floor(timeDifference / 100), true),
        };
    }
}
