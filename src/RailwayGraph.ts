import { assert, assertIsDefined } from './utils';
import { Dijkstra } from './utils/Dijkstra';

export const KukanTypeObj = {
    /** 地方交通線 */
    CHIHOU: 0,
    /** 幹線 */
    KANSEN: 1,
    /** 電車特定区間 */
    TOKUTEI: 2,
    /** 山手線内 */
    YAMANOTE: 3,
    /** 地方交通線（換算キロ） */
    CHIHOU_KANSAN: 4,
} as const;
export type KukanType = typeof KukanTypeObj[keyof typeof KukanTypeObj];

interface Station {
    kukan_type: KukanType;
    kilo10: number;
    kilo10_kansan: number;
    id: number;
    name: string;
    ruby: string;
}
interface Line {
    is_kansen: number;
    id: number;
    name: string;
    stations: Station[];
}

interface EdgeInfo {
    lineName: string;
    lineId: number;
    kansen: boolean;

    id0: number;
    id1: number;
    kilo10: number;
    kilo10_kansan: number;
    kukanType: KukanType;
}

export class RailwayGraph {
    /** 駅 ID → 駅 index（ダイクストラグラフ上の頂点番号） */
    private mpStationId2Index: Map<number, number>;
    /** 駅 index → 駅 ID */
    private stationIdx2Id: number[];
    /** 駅名 → 駅 ID */
    private stationIdx2Name: string[];

    private mpStationName2ID: Map<string, number>;

    public acData: AutocompleteItem[];

    private edges: Map<number, Map<number, EdgeInfo>>;

    private dijkstra: Dijkstra;

    private constructor(dbLines: Line[]) {
        // generate station list
        let stationCounter = 0;
        this.mpStationId2Index = new Map<number, number>();
        this.stationIdx2Id = [];
        this.stationIdx2Name = [];
        this.mpStationName2ID = new Map<string, number>();
        this.acData = [];
        dbLines.forEach((line) => {
            line.stations.forEach((station) => {
                if (this.mpStationId2Index.has(station.id)) {
                    return;
                }
                assert(!this.mpStationName2ID.has(station.name));
                this.mpStationId2Index.set(station.id, stationCounter++);
                this.stationIdx2Id.push(station.id);
                this.stationIdx2Name.push(station.name);
                this.mpStationName2ID.set(station.name, station.id);
                this.acData.push({ label: station.name, value: station.id });
            });
        });

        this.edges = new Map<number, Map<number, EdgeInfo>>();

        // construct dijkstra graph
        this.dijkstra = new Dijkstra(stationCounter);
        dbLines.forEach((line) => {
            for (let i = 1; i < line.stations.length; ++i) {
                const station0 = line.stations[i - 1];
                const station1 = line.stations[i];
                const idx0 = this.mpStationId2Index.get(station0.id);
                assertIsDefined(idx0, 'idx0');
                const idx1 = this.mpStationId2Index.get(station1.id);
                assertIsDefined(idx1, 'idx1');

                // 中央本線【東】の「東京 → 神田」「代々木 → 新宿」は無視する
                if (line.id === 48) {
                    if (station0.id === 3152 || station0.id === 3471) continue;
                }

                if (this.edges.has(idx0) && this.edges.get(idx0)?.has(idx1)) continue;
                if (this.edges.has(idx1) && this.edges.get(idx1)?.has(idx0)) continue;

                if (!this.edges.has(idx0)) {
                    this.edges.set(idx0, new Map<number, EdgeInfo>());
                }
                if (!this.edges.has(idx1)) {
                    this.edges.set(idx1, new Map<number, EdgeInfo>());
                }
                const edgeInfo: EdgeInfo = {
                    lineName: line.name,
                    lineId: line.id,
                    kansen: line.is_kansen === 1,
                    id0: station0.id,
                    id1: station1.id,
                    kilo10: station1.kilo10 - station0.kilo10,
                    kilo10_kansan: station1.kilo10_kansan - station0.kilo10_kansan,
                    kukanType: station1.kukan_type,
                };
                this.edges.get(idx0)?.set(idx1, edgeInfo);
                this.edges.get(idx1)?.set(idx0, edgeInfo);

                // 双方向
                this.dijkstra.addEdge(idx0, idx1, station1.kilo10 - station0.kilo10);
            }
        });
    }

    static async init(): Promise<RailwayGraph> {
        // read json
        const dbRes = await fetch('index.json');
        assert(dbRes.ok);
        // TODO: 整合性チェック
        const dbLines: Line[] = (await dbRes.json()) as Line[];

        return new RailwayGraph(dbLines);
    }

    static initFromString(jsonString: string): RailwayGraph {
        const dbLines: Line[] = JSON.parse(jsonString);
        return new RailwayGraph(dbLines);
    }

    hasStationName(stationName: string): boolean {
        return this.mpStationName2ID.has(stationName);
    }

    getStationIdxByName(stationName: string): number {
        const id0 = this.mpStationName2ID.get(stationName);
        assertIsDefined(id0, 'id0');
        const idx0 = this.mpStationId2Index.get(id0);
        assertIsDefined(idx0, 'idx0');
        return idx0;
    }

    getStationNameByIdx(idx: number): string {
        return this.stationIdx2Name[idx];
    }

    getEdge(idx0: number, idx1: number): EdgeInfo {
        const edgeInfo = this.edges.get(idx0)?.get(idx1);
        assertIsDefined(edgeInfo, 'edgeInfo');
        return edgeInfo;
    }

    /** ダイクストラグラフ上の最短経路を返す */
    getShortestPathOfIdxs(srcStationIdx: number, dstStationIdx: number): number[] {
        this.dijkstra.build(srcStationIdx);
        void this.dijkstra.get(dstStationIdx);
        const restored = this.dijkstra.restore(dstStationIdx);
        return restored;
    }
}
