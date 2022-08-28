import { isNumber } from '../utils';
import { Nominal } from '../utils/Nominal';

export type Fare = Nominal<number, 'Fare'>;

function isFare(v: unknown): v is number {
    return isNumber(v) && Number.isInteger(v) && v >= 0;
}

export function assertFare(v: unknown, target = ''): asserts v is Fare {
    if (!isFare(v)) {
        throw new Error(`${target} should be Fare.`);
    }
}
