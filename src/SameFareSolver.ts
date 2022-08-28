import { assertFare, Fare } from './brandings/Fare';
import { Kilo10Store } from './brandings/Kilo10Store';
import { FareCalculator } from './FareCalculator';
import { RailwayGraph, StationIdxInGraph } from './RailwayGraph';
import { assert, getSum, isNumber } from './utils';
import { Nominal } from './utils/Nominal';

export const MAX_PATH_COUNT = 30;

/** 最短経路における駅インデックス（最短経路に含まれる駅のみに振られる 0-indexed 連番） */
export type StationIdx = Nominal<number, 'StationIdx'>;
function isStationIdx(v: unknown): v is number {
    return isNumber(v) && Number.isInteger(v) && v >= 0;
}
function assertStationIdx(v: unknown, target = ''): asserts v is StationIdx {
    if (!isStationIdx(v)) {
        throw new Error(`${target} should be StationIdx.`);
    }
}

export const StationStopOptionsObj = {
    /** 途中下車するか指定しない */
    NOT_DESIGNATED: 0,
    /** 必ず途中下車する */
    MUST: 1,
    /** 途中下車しない */
    MUST_NOT: 2,
} as const;
export type StationStopOption = typeof StationStopOptionsObj[keyof typeof StationStopOptionsObj];

interface RouteSegment {
    lineName: string;
    lineId: number;
    kansen: boolean;
    stationIdxs: StationIdxInGraph[];
    kilo10: Kilo10Store;
}

interface TargetFarePaths {
    /** 目標運賃 */
    targetFare: Fare;
    /** 目標運賃の区間の個数（の最大値） */
    maxCount: number;
    /** （目標運賃を最大個数にした場合の）運賃の最安値 */
    fareSum: Fare;
    /** 目標運賃が最大個数かつ，その条件下で運賃が最安になるような分割パターン数 */
    pattern: number;
    /** 途中下車パターンのリスト */
    paths: StationIdx[][];
}

interface DetailedPathSegment {
    kilo10: Kilo10Store;
    lineNames: string[];
    startStationName: string;
    terminalStationName: string;
    fare: Fare;
    stationIdxs: StationIdxInGraph[];
}

interface DetailedTargetFarePaths extends TargetFarePaths {
    detailedPathList: DetailedPathSegment[][];
}

export class SameFareSolver {
    private built: boolean;
    private routeSegments: RouteSegment[];
    private fare: Fare;
    private kilo10: Kilo10Store;
    private detailedTargetFarePaths: DetailedTargetFarePaths[];

    private constructor(private railwayGraph: RailwayGraph, private fareCalculator: FareCalculator) {
        this.built = false;
        this.routeSegments = [];
        this.fare = 0 as Fare;
        this.kilo10 = new Kilo10Store();
        this.detailedTargetFarePaths = [];
    }

    static async init(railwayGraph: RailwayGraph): Promise<SameFareSolver> {
        const fareCalculator = await FareCalculator.init();
        return new SameFareSolver(railwayGraph, fareCalculator);
    }

    /** 営業キロが最短になる経路を確定する */
    private getShortestPath(
        stationIdxs: StationIdxInGraph[],
        stationStopOptionsDesignated: StationStopOption[]
    ): { stationIdxsPath: StationIdxInGraph[]; stationStopOptions: StationStopOption[] } {
        assert(stationIdxs.length === stationStopOptionsDesignated.length);

        let stationIdxsPath: StationIdxInGraph[] = [];
        const stationStopOptions: StationStopOption[] = [StationStopOptionsObj.MUST];
        for (let i = 1; i < stationIdxs.length; ++i) {
            const src = stationIdxs[i - 1];
            const dst = stationIdxs[i];
            const restored = this.railwayGraph.getShortestPathOfIdxs(src, dst);

            if (stationIdxsPath.length > 0) {
                stationIdxsPath.pop();
            }
            stationIdxsPath = stationIdxsPath.concat(restored);

            while (stationStopOptions.length < stationIdxsPath.length) {
                stationStopOptions.push(StationStopOptionsObj.NOT_DESIGNATED);
            }
            stationStopOptions[stationStopOptions.length - 1] = stationStopOptionsDesignated[i];
        }
        return { stationIdxsPath, stationStopOptions };
    }

    /** 指定されたパスを路線ごとに区切って，区間のリストにする */
    private getRouteSegmentList(stationIdxsPath: StationIdxInGraph[]): RouteSegment[] {
        const routeSegmentList: RouteSegment[] = [];
        for (let i = 1; i < stationIdxsPath.length; ++i) {
            const idx0 = stationIdxsPath[i - 1];
            const idx1 = stationIdxsPath[i];
            const edgeInfo = this.railwayGraph.getEdge(idx0, idx1);
            if (routeSegmentList.length === 0) {
                const kilo10New = new Kilo10Store();
                kilo10New.addEdge(edgeInfo);
                routeSegmentList.push({
                    lineName: edgeInfo.lineName,
                    lineId: edgeInfo.lineId,
                    kansen: edgeInfo.kansen,
                    stationIdxs: [idx0, idx1],
                    kilo10: kilo10New,
                });
            } else {
                const lastRoute = routeSegmentList[routeSegmentList.length - 1];
                const idx2 = stationIdxsPath[i - 2];
                if (idx2 == idx1 || lastRoute.lineId !== edgeInfo.lineId) {
                    // 折返し，または路線が変わった
                    const kilo10New = new Kilo10Store();
                    kilo10New.addEdge(edgeInfo);
                    routeSegmentList.push({
                        lineName: edgeInfo.lineName,
                        lineId: edgeInfo.lineId,
                        kansen: edgeInfo.kansen,
                        stationIdxs: [idx0, idx1],
                        kilo10: kilo10New,
                    });
                } else {
                    lastRoute.stationIdxs.push(idx1);
                    lastRoute.kilo10.addEdge(edgeInfo);
                    // lastRoute.kilo10list[edgeInfo.kukanType].
                }
            }
        }
        return routeSegmentList;
    }

    /** 指定されたパスの運賃を計算する */
    private getFareFromPath(stationIdxsPath: StationIdxInGraph[]): {
        fare: Fare;
        kilo10: Kilo10Store;
    } {
        // 運賃計算
        const kilo10 = new Kilo10Store();
        for (let i = 1; i < stationIdxsPath.length; ++i) {
            const idx0 = stationIdxsPath[i - 1];
            const idx1 = stationIdxsPath[i];
            const edgeInfo = this.railwayGraph.getEdge(idx0, idx1);

            kilo10.addEdge(edgeInfo);
        }
        const fare = this.fareCalculator.calcFare(kilo10);
        return { fare, kilo10 };
    }

    /** 可能な区間運賃を列挙する */
    private getAvailableFares(stationIdxsPath: StationIdxInGraph[], stationStopOptions: StationStopOption[]): Fare[] {
        const faresSet = new Set<Fare>();
        // ループ・折返しが形成されるような遷移は NG として DP する
        for (let start = 0; start < stationIdxsPath.length - 1; ++start) {
            const visitedStationIdxs = new Set<StationIdxInGraph>();
            const kilo10 = new Kilo10Store();
            visitedStationIdxs.add(stationIdxsPath[start]);
            for (let i = start + 1; i < stationIdxsPath.length; ++i) {
                const idx0 = stationIdxsPath[i - 1];
                const idx1 = stationIdxsPath[i];
                if (visitedStationIdxs.has(idx1)) {
                    // 折返し or ループ発生
                    break;
                }
                const edgeInfo = this.railwayGraph.getEdge(idx0, idx1);

                const stopOption = stationStopOptions[i];
                kilo10.addEdge(edgeInfo);
                visitedStationIdxs.add(idx1);
                if (stopOption !== 2) {
                    const fare = this.fareCalculator.calcFare(kilo10);
                    faresSet.add(fare);
                }
                if (stopOption === 1) {
                    break; // 必ず途中下車
                }
            }
        }
        const faresArray = [...faresSet];
        faresArray.sort();

        return faresArray;
    }

    /** 目標運賃の回数を最大にする分割パターンのうち，分割数が最小となる分割を求める */
    private getTargetFarePaths(
        stationIdxsPath: StationIdxInGraph[],
        stationStopOptions: StationStopOption[],
        targetFare: Fare
    ): TargetFarePaths {
        const n = stationIdxsPath.length;
        /** dp[i][j] := 駅 i に到達して途中下車が計 j 回になるときの (目標運賃適用回数最大値，運賃合計最小値) */
        const dp = new Array<[number, Fare][]>(n);
        /** dpPat[j][j] := 駅 i に到達して途中下車が計 j 回になるパターン数 */
        const dpPat = new Array<number[]>(n);
        /** bs[i][j] := 駅 i に到達して途中下車が計 j 回になるときの，前の駅リスト */
        const bs = new Array<StationIdx[][]>(n); // 経路復元用情報
        for (let i = 0; i < n; ++i) {
            dp[i] = new Array<[number, Fare]>(n);
            dpPat[i] = new Array<number>(n);
            bs[i] = new Array<StationIdx[]>(n);
            dpPat[i].fill(0);
            for (let j = 0; j < n; ++j) {
                dp[i][j] = [0, Number.MAX_VALUE as Fare];
                bs[i][j] = [];
            }
        }
        dp[0][0] = [0, 0 as Fare];
        dpPat[0][0] = 1;
        // 駅 start から駅 i へ配る DP
        // ループ・折返しが形成されるような遷移は NG として DP する
        for (let start = 0; start < n - 1; ++start) {
            assertStationIdx(start);
            const visitedStationIdxs = new Set<StationIdxInGraph>();
            const kilo10 = new Kilo10Store();
            visitedStationIdxs.add(stationIdxsPath[start]);
            for (let i = start + 1; i < n; ++i) {
                const idx0 = stationIdxsPath[i - 1];
                const idx1 = stationIdxsPath[i];
                if (visitedStationIdxs.has(idx1)) {
                    // 折返し or ループ発生
                    break;
                }
                const edgeInfo = this.railwayGraph.getEdge(idx0, idx1);

                const stopOption = stationStopOptions[i];
                kilo10.addEdge(edgeInfo);
                visitedStationIdxs.add(idx1);

                if (stopOption !== StationStopOptionsObj.MUST_NOT) {
                    const fare = this.fareCalculator.calcFare(kilo10);
                    for (let j = 0; j <= start; ++j) {
                        const [srcCount, srcFareSum] = dp[start][j];
                        const [dstCount, dstFareSum] = dp[i][j + 1];
                        const nxtCount = fare === targetFare ? srcCount + 1 : srcCount;
                        const nxtFareSum = srcFareSum + fare;
                        assertFare(nxtFareSum);
                        // chmax(dp[i], dp[start] + 1);
                        // dp[i] = Math.max(dp[i], dp[start] + 1);
                        if (nxtCount > dstCount || (nxtCount === dstCount && nxtFareSum < dstFareSum)) {
                            dp[i][j + 1] = [nxtCount, nxtFareSum];
                            dpPat[i][j + 1] = dpPat[start][j];
                            bs[i][j + 1] = [start];
                        } else if (nxtCount === dstCount && nxtFareSum === dstFareSum) {
                            dpPat[i][j + 1] += dpPat[start][j];
                            bs[i][j + 1].push(start);
                        }
                    }
                }
                if (stopOption === StationStopOptionsObj.MUST) {
                    break; // 必ず途中下車
                }
            }
        }

        // 経路復元
        const targetPaths: StationIdx[][] = [];
        let maxCount = 0;
        let fareSum = Number.MAX_VALUE as Fare;
        let pattern = 0;
        if (getSum(dpPat[n - 1]) > 0) {
            // 指定運賃適用回数の最大値を探す
            for (let j = 0; j < n; ++j) {
                maxCount = Math.max(maxCount, dp[n - 1][j][0]);
            }
            // 指定運賃適用回数最大のうちで最安を探す
            for (let j = 0; j < n; ++j) {
                // 指定運賃適用回数が少ない分割は無視する
                if (dp[n - 1][j][0] != maxCount) continue;
                fareSum = Math.min(fareSum, dp[n - 1][j][1]) as Fare;
            }
            // [経路履歴, 途中下車回数] の配列
            const stk: [StationIdx[], number][] = []; //[[n - 1]];
            // 乗換回数が少ないものがスタックの後ろに来るようにする
            for (let j = n - 1; j > 0; --j) {
                // 指定運賃適用回数が少ない分割は無視する
                if (dp[n - 1][j][0] != maxCount) continue;
                // 最安ではない分割は無視する
                if (dp[n - 1][j][1] != fareSum) continue;
                pattern += dpPat[n - 1][j];
                if (dp[n - 1][j][0] > 0) {
                    // 目標運賃を1回以上適用できた
                    stk.push([[(n - 1) as StationIdx], j]);
                }
            }
            // 最大 MAX_PATH_COUNT パターンまでとする
            while (stk.length > 0 && targetPaths.length < MAX_PATH_COUNT) {
                const top = stk.pop();
                assert(top !== undefined);
                const [v, j] = top;
                if (bs[v[v.length - 1]][j].length === 0) {
                    targetPaths.push(v);
                    continue;
                }
                bs[v[v.length - 1]][j].forEach((pre) => {
                    const v2 = [...v]; // 複製
                    v2.push(pre);
                    stk.push([v2, j - 1]);
                });
            }
            targetPaths.forEach((v) => {
                v.reverse();
            });
        }
        return {
            targetFare,
            maxCount,
            fareSum,
            pattern,
            paths: targetPaths,
        };
    }

    /** 詳細情報を付与する */
    private generateDetailedPathSegments(
        stationIdxsPath: StationIdxInGraph[],
        targetFarePaths: TargetFarePaths
    ): DetailedTargetFarePaths {
        const { pattern, paths } = targetFarePaths;
        if (pattern === 0) {
            return {
                ...targetFarePaths,
                detailedPathList: [],
            };
        }

        const detailedPathList = paths.map((pathOrig) => {
            const path = [...pathOrig];
            path.reverse();
            path.pop();

            const detailedPathSegments: DetailedPathSegment[] = [];

            let detailedPathSegment: DetailedPathSegment = {
                kilo10: new Kilo10Store(),
                lineNames: [],
                startStationName: this.railwayGraph.getStationNameByIdx(stationIdxsPath[0]),
                terminalStationName: '',
                fare: 0 as Fare,
                stationIdxs: [stationIdxsPath[0]],
            };

            for (let i = 1; i < stationIdxsPath.length; ++i) {
                assertStationIdx(i);
                const idx0 = stationIdxsPath[i - 1];
                const idx1 = stationIdxsPath[i];
                const edgeInfo = this.railwayGraph.getEdge(idx0, idx1);
                detailedPathSegment.kilo10.addEdge(edgeInfo);

                detailedPathSegment.stationIdxs.push(idx1);
                if (
                    detailedPathSegment.lineNames.length === 0 ||
                    detailedPathSegment.lineNames[detailedPathSegment.lineNames.length - 1] !== edgeInfo.lineName
                ) {
                    detailedPathSegment.lineNames.push(edgeInfo.lineName);
                }

                if (i === path[path.length - 1]) {
                    path.pop();
                    detailedPathSegment.fare = this.fareCalculator.calcFare(detailedPathSegment.kilo10);
                    const terminalStationName = this.railwayGraph.getStationNameByIdx(idx1);
                    detailedPathSegment.terminalStationName = terminalStationName;

                    detailedPathSegments.push(detailedPathSegment);

                    detailedPathSegment = {
                        kilo10: new Kilo10Store(),
                        lineNames: [],
                        startStationName: terminalStationName,
                        terminalStationName: '',
                        fare: 0 as Fare,
                        stationIdxs: [idx1],
                    }; // clear
                }
            }
            return detailedPathSegments;
        });
        return {
            ...targetFarePaths,
            detailedPathList,
        };
    }

    /** 構築 */
    public build(stationIdxs: StationIdxInGraph[], stationStopOptionsDesignated: StationStopOption[]): void {
        // 営業キロが最短になる経路を確定する
        const { stationIdxsPath, stationStopOptions } = this.getShortestPath(stationIdxs, stationStopOptionsDesignated);

        // ルート表示用情報
        this.routeSegments = this.getRouteSegmentList(stationIdxsPath);
        const { fare, kilo10 } = this.getFareFromPath(stationIdxsPath);
        this.fare = fare;
        this.kilo10 = kilo10;

        // DP Path 1: 可能な区間運賃を列挙する
        const faresArray: Fare[] = this.getAvailableFares(stationIdxsPath, stationStopOptions);

        // DP Path 2: 目標運賃ごとに DP する
        const rank: TargetFarePaths[] = faresArray.map((targetFare) =>
            this.getTargetFarePaths(stationIdxsPath, stationStopOptions, targetFare)
        );
        // 目標運賃の回数が多い順，目標運賃の安い順にソートする
        rank.sort((a, b) => {
            if (a.maxCount !== b.maxCount) return -a.maxCount + b.maxCount;
            return a.targetFare - b.targetFare;
        });

        this.detailedTargetFarePaths = rank.map((targetFarePath) =>
            this.generateDetailedPathSegments(stationIdxsPath, targetFarePath)
        );
        this.built = true;
    }

    /** 経路 */
    public getRouteSegments(): RouteSegment[] {
        assert(this.built);
        return this.routeSegments;
    }
    /** 通常運賃 */
    public getFare(): Fare {
        assert(this.built);
        return this.fare;
    }
    public getKilo10(): Kilo10Store {
        assert(this.built);
        return this.kilo10;
    }
    /** 目標運賃ごとの，分割方法のリスト */
    public getDetailedTargetFarePaths(): DetailedTargetFarePaths[] {
        assert(this.built);
        return this.detailedTargetFarePaths;
    }
}
