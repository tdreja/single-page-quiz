import { expect, test } from '@jest/globals';
import { Timer } from './Timer';

const timer = new Timer();

test('One day difference', () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime());
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Check the result
    expect(timer.calculateTimeInfo(oneDayAgo, now)).toEqual({
        days: '01',
        hours: '00',
        minutes: '00',
        seconds: '00',
        milliseconds: '00',
    });
});
test('One hour difference', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime());
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Check the result
    expect(timer.calculateTimeInfo(oneHourAgo, now)).toEqual({
        days: '',
        hours: '01',
        minutes: '00',
        seconds: '00',
        milliseconds: '00',
    });
});

test('One minute difference', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime());
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

    // Check the result
    expect(timer.calculateTimeInfo(oneMinuteAgo, now)).toEqual({
        days: '',
        hours: '',
        minutes: '01',
        seconds: '00',
        milliseconds: '00',
    });
});

test('One second difference', () => {
    const now = new Date();
    const oneSecondAgo = new Date(now.getTime());
    oneSecondAgo.setSeconds(oneSecondAgo.getSeconds() - 1);

    // Check the result
    expect(timer.calculateTimeInfo(oneSecondAgo, now)).toEqual({
        days: '',
        hours: '',
        minutes: '00',
        seconds: '01',
        milliseconds: '00',
    });
});

test('All values changed', () => {
    const now = new Date();
    const customDate = new Date(now.getTime());
    customDate.setDate(customDate.getDate() - 1);
    customDate.setHours(customDate.getHours() - 2);
    customDate.setMinutes(customDate.getMinutes() - 3);
    customDate.setSeconds(customDate.getSeconds() - 4);

    // Check the result
    expect(timer.calculateTimeInfo(customDate, now)).toEqual({
        days: '01',
        hours: '02',
        minutes: '03',
        seconds: '04',
        milliseconds: '00',
    });
});
