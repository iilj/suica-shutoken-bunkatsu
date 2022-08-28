import { isNumber } from '../utils';
import { Nominal } from '../utils/Nominal';

export type Kilo10 = Nominal<number, 'Kilo10'>;

function isKilo10(v: unknown): v is number {
    return isNumber(v) && Number.isInteger(v) && v >= 0;
}

export function assertKilo10(v: unknown, target = ''): asserts v is Kilo10 {
    if (!isKilo10(v)) {
        throw new Error(`${target} should be Kilo10.`);
    }
}
