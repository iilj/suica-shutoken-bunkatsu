import { RailwayGraph } from "./RailwayGraph";
import * as fs from "fs/promises";

describe('RailwayGraph', (): void => {
    test('should work.', async(): Promise<void> => {
        const jsonString = await fs.readFile('static/index.json', 'utf-8');
        const railwayGraph = RailwayGraph.initFromString(jsonString);
        // TODO
        expect(railwayGraph.getStationIdxByName('品川')).toBe(390);
        expect(railwayGraph.getStationIdxByName('上野')).toBe(421);
        // expect(railwayGraph.getShortestPathOfIdxs(390, 421)).toEqual([
        //     390, 389, 388, 387,
        //     386,  92, 309, 266,
        //     420, 421
        //   ]);
    });
});
