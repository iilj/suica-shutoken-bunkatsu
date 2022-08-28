import { RailwayGraph } from './RailwayGraph';
import * as fs from 'fs/promises';

describe('RailwayGraph', (): void => {
    test('should work.', async (): Promise<void> => {
        const jsonString = await fs.readFile('static/index.json', 'utf-8');
        const railwayGraph = RailwayGraph.initFromString(jsonString);

        expect(railwayGraph.getShortestPathOfIdxs(
            railwayGraph.getStationIdxByName('品川'),
            railwayGraph.getStationIdxByName('上野')
        )).toEqual([
            railwayGraph.getStationIdxByName('品川'),
            railwayGraph.getStationIdxByName('高輪ゲートウェイ'),
            railwayGraph.getStationIdxByName('田町'),
            railwayGraph.getStationIdxByName('浜松町'),
            railwayGraph.getStationIdxByName('新橋'),
            railwayGraph.getStationIdxByName('有楽町'),
            railwayGraph.getStationIdxByName('東京'),
            railwayGraph.getStationIdxByName('神田'),
            railwayGraph.getStationIdxByName('秋葉原'),
            railwayGraph.getStationIdxByName('御徒町'),
            railwayGraph.getStationIdxByName('上野'),
          ]);
    });
});
