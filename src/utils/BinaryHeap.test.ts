import { BinaryHeap } from './BinaryHeap';

describe('BinaryHeap', (): void => {
    test('should work.', (): void => {
        const heap = new BinaryHeap<string>();
        heap.push('ten', 10);
        heap.push('zero', 0);
        heap.push('five', 5);
        // スコアの小さい順に，インデックスが取り出される
        expect(heap.pop()?.element).toBe('zero');
        expect(heap.pop()?.element).toBe('five');
        expect(heap.pop()?.element).toBe('ten');
        expect(heap.pop()).toBe(undefined);
    });
});
