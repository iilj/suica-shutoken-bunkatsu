import { Dijkstra } from './Dijkstra';

describe('Dijkstra', (): void => {
    test('should work.', (): void => {
        // https://ja.wikipedia.org/wiki/%E3%83%80%E3%82%A4%E3%82%AF%E3%82%B9%E3%83%88%E3%83%A9%E6%B3%95 より
        const dijkstra = new Dijkstra(6);
        dijkstra.addEdge(0, 1, 7);
        dijkstra.addEdge(0, 2, 9);
        dijkstra.addEdge(0, 5, 14);
        dijkstra.addEdge(1, 2, 10);
        dijkstra.addEdge(1, 3, 15);
        dijkstra.addEdge(2, 3, 11);
        dijkstra.addEdge(2, 5, 2);
        dijkstra.addEdge(3, 4, 6);
        dijkstra.addEdge(4, 5, 9);
        dijkstra.build(0);
        expect(dijkstra.get(0)).toBe(0);
        expect(dijkstra.get(1)).toBe(7);
        expect(dijkstra.get(2)).toBe(9);
        expect(dijkstra.get(3)).toBe(20);
        expect(dijkstra.get(4)).toBe(20);
        expect(dijkstra.get(5)).toBe(11);
    });
});
