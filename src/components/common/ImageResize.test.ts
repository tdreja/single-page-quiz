import { expect, test } from '@jest/globals';
import { fitDimensions } from './ImageResize';

test('Small images are kept', () => {
    expect(fitDimensions({ width: 800, height: 600 })).toEqual({ width: 800, height: 600 });
    expect(fitDimensions({ width: 1600, height: 1000 })).toEqual({ width: 1600, height: 1000 });
});

test('Wide images are limited by the width', () => {
    expect(fitDimensions({ width: 3200, height: 1200 })).toEqual({ width: 1600, height: 600 });
});

test('High images are limited by the height', () => {
    expect(fitDimensions({ width: 1000, height: 4000 })).toEqual({ width: 250, height: 1000 });
});

test('Large images keep the aspect ratio', () => {
    // 4:3 photo: height is the limit, as 1600 x 1200 would be too high
    expect(fitDimensions({ width: 4000, height: 3000 })).toEqual({ width: 1333, height: 1000 });
});
