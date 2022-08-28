function assertIsDefined(val, name) {
    if (val === undefined) {
        throw new Error(`Expected '${name}' to be defined, but received undefined`);
    }
    else if (val === null) {
        throw new Error(`Expected '${name}' to be defined, but received null`);
    }
}
function assert(condition, msg) {
    if (!condition) {
        throw new Error(msg !== null && msg !== void 0 ? msg : 'assertion failed');
    }
}
const getSum = (ar) => {
    return ar.reduce((partialSum, a) => partialSum + a, 0);
};
function isNumber(v) {
    return typeof v === 'number' && Number.isFinite(v);
}

function isKilo10(v) {
    return isNumber(v) && Number.isInteger(v) && v >= 0;
}
function assertKilo10(v, target = '') {
    if (!isKilo10(v)) {
        throw new Error(`${target} should be Kilo10.`);
    }
}

// Original JavaScript Code from  Marijn Haverbeke (http://eloquentjavascript.net/1st_edition/appendix2.html)
// score が小さい順に取り出す heap
class BinaryHeap {
    // scoreFunction: (x: T) => number;
    constructor() {
        this.content = [];
        // this.scoreFunction = scoreFunction;
    }
    push(element, score) {
        this.content.push({ element, score });
        this.bubbleUp(this.content.length - 1);
    }
    pop() {
        const result = this.content[0];
        const end = this.content.pop();
        if (end === undefined)
            return undefined;
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }
    remove(node) {
        const length = this.content.length;
        // To remove a value, we must search through the array to find
        // it.
        for (let i = 0; i < length; i++) {
            if (this.content[i] != node)
                continue;
            // When it is found, the process seen in 'pop' is repeated
            // to fill up the hole.
            const end = this.content.pop();
            // If the element we popped was the one we needed to remove,
            // we're done.
            if (i === length - 1)
                break;
            if (end === undefined)
                break; // 追加
            // Otherwise, we replace the removed element with the popped
            // one, and allow it to float up or sink down as appropriate.
            this.content[i] = end;
            this.bubbleUp(i);
            this.sinkDown(i);
            break;
        }
    }
    size() {
        return this.content.length;
    }
    bubbleUp(n) {
        // Fetch the element that has to be moved.
        const { element, score } = this.content[n];
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            const parentN = Math.floor((n + 1) / 2) - 1, parent = this.content[parentN];
            // If the parent has a lesser score, things are in order and we
            // are done.
            if (score >= parent.score)
                break;
            // Otherwise, swap the parent with the current element and
            // continue.
            this.content[parentN] = { element, score };
            this.content[n] = parent;
            n = parentN;
        }
    }
    sinkDown(n) {
        // Look up the target element and its score.
        const length = this.content.length, { element, score: elemScore } = this.content[n];
        for (;;) {
            // Compute the indices of the child elements.
            const child2N = (n + 1) * 2, child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            let swap = null;
            const child1Score = null;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                const { score: child1Score } = this.content[child1N];
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore)
                    swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                const { score: child2Score } = this.content[child2N];
                if (child2Score < (swap === null || child1Score === null ? elemScore : child1Score))
                    swap = child2N;
            }
            // No need to swap further, we are done.
            if (swap === null)
                break;
            // Otherwise, swap and continue.
            this.content[n] = this.content[swap];
            this.content[swap] = { element, score: elemScore };
            n = swap;
        }
    }
}

class Vertex extends Array {
}
class Graph extends Array {
    constructor(n) {
        super(n);
        this.n = n;
        for (let i = 0; i < n; ++i) {
            this[i] = new Vertex();
        }
    }
    addArc(src, dst, weight) {
        this[src].push({ src, dst, weight });
    }
    addEdge(src, dst, weight) {
        this.addArc(src, dst, weight);
        this.addArc(dst, src, weight);
    }
}
class Dijkstra {
    constructor(n) {
        this.n = n;
        this.graph = new Graph(n);
        this.dist = new Array(n);
        this.bs = new Array(n);
    }
    /** 双方向 */
    addEdge(src, dst, weight) {
        this.graph.addEdge(src, dst, weight);
    }
    build(start) {
        const que = new BinaryHeap(); // 昇順に並べ替え，小さい順に取り出す
        this.dist.fill(Number.POSITIVE_INFINITY);
        this.bs.fill(-1);
        this.dist[start] = 0;
        que.push(start, 0);
        while (que.size() > 0) {
            const tp = que.pop();
            assert(tp !== undefined);
            const { element: cur_node, score: cur_cost } = tp;
            if (this.dist[cur_node] < cur_cost)
                continue;
            this.graph[cur_node].forEach((edge) => {
                const nxtDist = tp.score + edge.weight;
                if (nxtDist < this.dist[edge.dst]) {
                    this.dist[edge.dst] = nxtDist;
                    que.push(edge.dst, nxtDist);
                    this.bs[edge.dst] = cur_node;
                }
            });
        }
    }
    get(i) {
        return this.dist[i];
    }
    restore(dst) {
        const res = [];
        if (this.bs[dst] < 0)
            return res;
        while (~dst) {
            res.push(dst);
            dst = this.bs[dst];
        }
        res.reverse();
        return res;
    }
}

const KukanTypeObj = {
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
};
class RailwayGraph {
    constructor(dbLines) {
        // generate station list
        let stationCounter = 0;
        this.mpStationId2Index = new Map();
        this.stationIdx2Id = [];
        this.stationIdx2Name = [];
        this.mpStationName2ID = new Map();
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
        this.edges = new Map();
        // construct dijkstra graph
        this.dijkstra = new Dijkstra(stationCounter);
        dbLines.forEach((line) => {
            var _a, _b, _c, _d;
            for (let i = 1; i < line.stations.length; ++i) {
                const station0 = line.stations[i - 1];
                const station1 = line.stations[i];
                const idx0 = this.mpStationId2Index.get(station0.id);
                assertIsDefined(idx0, 'idx0');
                const idx1 = this.mpStationId2Index.get(station1.id);
                assertIsDefined(idx1, 'idx1');
                // 中央本線【東】の「東京 → 神田」「代々木 → 新宿」は無視する
                if (line.id === 48) {
                    if (station0.id === 3152 || station0.id === 3471)
                        continue;
                }
                if (this.edges.has(idx0) && ((_a = this.edges.get(idx0)) === null || _a === void 0 ? void 0 : _a.has(idx1)))
                    continue;
                if (this.edges.has(idx1) && ((_b = this.edges.get(idx1)) === null || _b === void 0 ? void 0 : _b.has(idx0)))
                    continue;
                if (!this.edges.has(idx0)) {
                    this.edges.set(idx0, new Map());
                }
                if (!this.edges.has(idx1)) {
                    this.edges.set(idx1, new Map());
                }
                const kilo10Diff = station1.kilo10 - station0.kilo10;
                assertKilo10(kilo10Diff);
                const kilo10KansanDiff = station1.kilo10_kansan - station0.kilo10_kansan;
                assertKilo10(kilo10KansanDiff);
                const edgeInfo = {
                    lineName: line.name,
                    lineId: line.id,
                    kansen: line.is_kansen === 1,
                    id0: station0.id,
                    id1: station1.id,
                    kilo10: kilo10Diff,
                    kilo10_kansan: kilo10KansanDiff,
                    kukanType: station1.kukan_type,
                };
                (_c = this.edges.get(idx0)) === null || _c === void 0 ? void 0 : _c.set(idx1, edgeInfo);
                (_d = this.edges.get(idx1)) === null || _d === void 0 ? void 0 : _d.set(idx0, edgeInfo);
                // 双方向
                this.dijkstra.addEdge(idx0, idx1, station1.kilo10 - station0.kilo10);
            }
        });
    }
    static async init() {
        // read json
        const dbRes = await fetch('index.json');
        assert(dbRes.ok);
        // TODO: 整合性チェック
        const dbLines = (await dbRes.json());
        return new RailwayGraph(dbLines);
    }
    static initFromString(jsonString) {
        const dbLines = JSON.parse(jsonString);
        return new RailwayGraph(dbLines);
    }
    hasStationName(stationName) {
        return this.mpStationName2ID.has(stationName);
    }
    getStationIdxByName(stationName) {
        const id0 = this.mpStationName2ID.get(stationName);
        assertIsDefined(id0, 'id0');
        const idx0 = this.mpStationId2Index.get(id0);
        assertIsDefined(idx0, 'idx0');
        return idx0;
    }
    getStationNameByIdx(idx) {
        return this.stationIdx2Name[idx];
    }
    getEdge(idx0, idx1) {
        var _a;
        const edgeInfo = (_a = this.edges.get(idx0)) === null || _a === void 0 ? void 0 : _a.get(idx1);
        assertIsDefined(edgeInfo, 'edgeInfo');
        return edgeInfo;
    }
    /** ダイクストラグラフ上の最短経路を返す */
    getShortestPathOfIdxs(srcStationIdx, dstStationIdx) {
        this.dijkstra.build(srcStationIdx);
        void this.dijkstra.get(dstStationIdx);
        const restored = this.dijkstra.restore(dstStationIdx);
        return restored;
    }
}

function isFare(v) {
    return isNumber(v) && Number.isInteger(v) && v >= 0;
}
function assertFare(v, target = '') {
    if (!isFare(v)) {
        throw new Error(`${target} should be Fare.`);
    }
}

class Kilo10Store extends Array {
    constructor() {
        super(5);
        for (let i = 0; i < 5; ++i)
            this[i] = 0;
    }
    addEdge(edgeInfo) {
        const kukanTypeSum = this[edgeInfo.kukanType] + edgeInfo.kilo10;
        const kansanSum = this[KukanTypeObj.CHIHOU_KANSAN] + edgeInfo.kilo10_kansan;
        assertKilo10(kukanTypeSum);
        assertKilo10(kansanSum);
        this[edgeInfo.kukanType] = kukanTypeSum;
        this[KukanTypeObj.CHIHOU_KANSAN] = kansanSum;
    }
}

class FareCalculator {
    constructor(dbFare) {
        this.dbFare = dbFare;
        //
    }
    static async init() {
        const dbFareRes = await fetch('fare.json');
        assert(dbFareRes.ok);
        const dbFare = (await dbFareRes.json());
        return new FareCalculator(dbFare);
    }
    /** 営業キロx10 の値を，key に対応する運賃表と突き合わせる */
    calcFareSearch(kilo10, key) {
        // haystack は [キロ，円] の配列．
        const haystack = this.dbFare[key];
        // kilo10 <= キロ*10 が成り立つ最初の要素が答え．
        for (let i = 0; i < haystack.length; ++i) {
            const [kilo, yen] = haystack[i];
            if (kilo10 <= kilo * 10) {
                return yen;
            }
        }
        assert(false);
    }
    /** [地方，幹線，特定，山手，地方換算] から運賃を求める */
    calcFare(kilo10) {
        // const sum: number = kilo10list.reduce((prev, curr) => prev + curr, 0);
        const sum = kilo10[KukanTypeObj.CHIHOU] +
            kilo10[KukanTypeObj.KANSEN] +
            kilo10[KukanTypeObj.TOKUTEI] +
            kilo10[KukanTypeObj.YAMANOTE];
        assertKilo10(sum);
        if (kilo10[KukanTypeObj.CHIHOU] === 0) {
            // 地方交通線を含まない
            if (kilo10[KukanTypeObj.YAMANOTE] === sum) {
                // 山手線内のみ
                return this.calcFareSearch(sum, KukanTypeObj.YAMANOTE);
            }
            else if (kilo10[KukanTypeObj.KANSEN] === 0) {
                // 電車特定区間（+ 山手線内）のみ
                return this.calcFareSearch(sum, KukanTypeObj.TOKUTEI);
            }
            else {
                // 幹線（+ 電車特定区間 + 山手線内）
                return this.calcFareSearch(sum, KukanTypeObj.KANSEN);
            }
        }
        else {
            // 地方交通線を含む
            if (kilo10[KukanTypeObj.CHIHOU] === sum) {
                // 地方交通線のみ
                return this.calcFareSearch(sum, KukanTypeObj.CHIHOU);
            }
            else {
                // 地方交通線と幹線を両方含む
                if (sum <= 100) {
                    // 幹線と地方交通線それぞれの営業キロの合計が10キロメートル以内の場合は，
                    // 営業キロで，地方交通線の換算表により計算
                    // https://www.jr-odekake.net/railroad/ticket/guide/normal_tickets/normal_fare04.html
                    return this.calcFareSearch(sum, KukanTypeObj.CHIHOU);
                }
                else {
                    // 運賃計算キロ（地方交通線の賃率換算キロ＋幹線の営業キロ）で，
                    // 幹線の換算表を用いて計算
                    const sum_kansan = kilo10[KukanTypeObj.CHIHOU_KANSAN] +
                        kilo10[KukanTypeObj.KANSEN] +
                        kilo10[KukanTypeObj.TOKUTEI] +
                        kilo10[KukanTypeObj.YAMANOTE];
                    assertKilo10(sum_kansan);
                    return this.calcFareSearch(sum_kansan, KukanTypeObj.KANSEN);
                }
            }
        }
    }
}

const MAX_PATH_COUNT = 30;
function isStationIdx(v) {
    return isNumber(v) && Number.isInteger(v) && v >= 0;
}
function assertStationIdx(v, target = '') {
    if (!isStationIdx(v)) {
        throw new Error(`${target} should be StationIdx.`);
    }
}
const StationStopOptionsObj = {
    /** 途中下車するか指定しない */
    NOT_DESIGNATED: 0,
    /** 必ず途中下車する */
    MUST: 1,
    /** 途中下車しない */
    MUST_NOT: 2,
};
class SameFareSolver {
    constructor(railwayGraph, fareCalculator) {
        this.railwayGraph = railwayGraph;
        this.fareCalculator = fareCalculator;
        this.built = false;
        this.routeSegments = [];
        this.fare = 0;
        this.kilo10 = new Kilo10Store();
        this.detailedTargetFarePaths = [];
    }
    static async init(railwayGraph) {
        const fareCalculator = await FareCalculator.init();
        return new SameFareSolver(railwayGraph, fareCalculator);
    }
    /** 営業キロが最短になる経路を確定する */
    getShortestPath(stationIdxs, stationStopOptionsDesignated) {
        assert(stationIdxs.length === stationStopOptionsDesignated.length);
        let stationIdxsPath = [];
        const stationStopOptions = [StationStopOptionsObj.MUST];
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
    getRouteSegmentList(stationIdxsPath) {
        const routeSegmentList = [];
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
            }
            else {
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
                }
                else {
                    lastRoute.stationIdxs.push(idx1);
                    lastRoute.kilo10.addEdge(edgeInfo);
                    // lastRoute.kilo10list[edgeInfo.kukanType].
                }
            }
        }
        return routeSegmentList;
    }
    /** 指定されたパスの運賃を計算する */
    getFareFromPath(stationIdxsPath) {
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
    getAvailableFares(stationIdxsPath, stationStopOptions) {
        const faresSet = new Set();
        // ループ・折返しが形成されるような遷移は NG として DP する
        for (let start = 0; start < stationIdxsPath.length - 1; ++start) {
            const visitedStationIdxs = new Set();
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
    getTargetFarePaths(stationIdxsPath, stationStopOptions, targetFare) {
        const n = stationIdxsPath.length;
        /** dp[i][j] := 駅 i に到達して途中下車が計 j 回になるときの (目標運賃適用回数最大値，運賃合計最小値) */
        const dp = new Array(n);
        /** dpPat[j][j] := 駅 i に到達して途中下車が計 j 回になるパターン数 */
        const dpPat = new Array(n);
        /** bs[i][j] := 駅 i に到達して途中下車が計 j 回になるときの，前の駅リスト */
        const bs = new Array(n); // 経路復元用情報
        for (let i = 0; i < n; ++i) {
            dp[i] = new Array(n);
            dpPat[i] = new Array(n);
            bs[i] = new Array(n);
            dpPat[i].fill(0);
            for (let j = 0; j < n; ++j) {
                dp[i][j] = [0, Number.MAX_VALUE];
                bs[i][j] = [];
            }
        }
        dp[0][0] = [0, 0];
        dpPat[0][0] = 1;
        // 駅 start から駅 i へ配る DP
        // ループ・折返しが形成されるような遷移は NG として DP する
        for (let start = 0; start < n - 1; ++start) {
            assertStationIdx(start);
            const visitedStationIdxs = new Set();
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
                        }
                        else if (nxtCount === dstCount && nxtFareSum === dstFareSum) {
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
        const targetPaths = [];
        let maxCount = 0;
        let fareSum = Number.MAX_VALUE;
        let pattern = 0;
        if (getSum(dpPat[n - 1]) > 0) {
            // 指定運賃適用回数の最大値を探す
            for (let j = 0; j < n; ++j) {
                maxCount = Math.max(maxCount, dp[n - 1][j][0]);
            }
            // 指定運賃適用回数最大のうちで最安を探す
            for (let j = 0; j < n; ++j) {
                // 指定運賃適用回数が少ない分割は無視する
                if (dp[n - 1][j][0] != maxCount)
                    continue;
                fareSum = Math.min(fareSum, dp[n - 1][j][1]);
            }
            // [経路履歴, 途中下車回数] の配列
            const stk = []; //[[n - 1]];
            // 乗換回数が少ないものがスタックの後ろに来るようにする
            for (let j = n - 1; j > 0; --j) {
                // 指定運賃適用回数が少ない分割は無視する
                if (dp[n - 1][j][0] != maxCount)
                    continue;
                // 最安ではない分割は無視する
                if (dp[n - 1][j][1] != fareSum)
                    continue;
                pattern += dpPat[n - 1][j];
                if (dp[n - 1][j][0] > 0) {
                    // 目標運賃を1回以上適用できた
                    stk.push([[(n - 1)], j]);
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
    generateDetailedPathSegments(stationIdxsPath, targetFarePaths) {
        const { pattern, paths } = targetFarePaths;
        if (pattern === 0) {
            return Object.assign(Object.assign({}, targetFarePaths), { detailedPathList: [] });
        }
        const detailedPathList = paths.map((pathOrig) => {
            const path = [...pathOrig];
            path.reverse();
            path.pop();
            const detailedPathSegments = [];
            let detailedPathSegment = {
                kilo10: new Kilo10Store(),
                lineNames: [],
                startStationName: this.railwayGraph.getStationNameByIdx(stationIdxsPath[0]),
                terminalStationName: '',
                fare: 0,
                stationIdxs: [stationIdxsPath[0]],
            };
            for (let i = 1; i < stationIdxsPath.length; ++i) {
                assertStationIdx(i);
                const idx0 = stationIdxsPath[i - 1];
                const idx1 = stationIdxsPath[i];
                const edgeInfo = this.railwayGraph.getEdge(idx0, idx1);
                detailedPathSegment.kilo10.addEdge(edgeInfo);
                detailedPathSegment.stationIdxs.push(idx1);
                if (detailedPathSegment.lineNames.length === 0 ||
                    detailedPathSegment.lineNames[detailedPathSegment.lineNames.length - 1] !== edgeInfo.lineName) {
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
                        fare: 0,
                        stationIdxs: [idx1],
                    }; // clear
                }
            }
            return detailedPathSegments;
        });
        return Object.assign(Object.assign({}, targetFarePaths), { detailedPathList });
    }
    /** 構築 */
    build(stationIdxs, stationStopOptionsDesignated) {
        // 営業キロが最短になる経路を確定する
        const { stationIdxsPath, stationStopOptions } = this.getShortestPath(stationIdxs, stationStopOptionsDesignated);
        // ルート表示用情報
        this.routeSegments = this.getRouteSegmentList(stationIdxsPath);
        const { fare, kilo10 } = this.getFareFromPath(stationIdxsPath);
        this.fare = fare;
        this.kilo10 = kilo10;
        // DP Path 1: 可能な区間運賃を列挙する
        const faresArray = this.getAvailableFares(stationIdxsPath, stationStopOptions);
        // DP Path 2: 目標運賃ごとに DP する
        const rank = faresArray.map((targetFare) => this.getTargetFarePaths(stationIdxsPath, stationStopOptions, targetFare));
        // 目標運賃の回数が多い順，目標運賃の安い順にソートする
        rank.sort((a, b) => {
            if (a.maxCount !== b.maxCount)
                return -a.maxCount + b.maxCount;
            return a.targetFare - b.targetFare;
        });
        this.detailedTargetFarePaths = rank.map((targetFarePath) => this.generateDetailedPathSegments(stationIdxsPath, targetFarePath));
        this.built = true;
    }
    /** 経路 */
    getRouteSegments() {
        assert(this.built);
        return this.routeSegments;
    }
    /** 通常運賃 */
    getFare() {
        assert(this.built);
        return this.fare;
    }
    getKilo10() {
        assert(this.built);
        return this.kilo10;
    }
    /** 目標運賃ごとの，分割方法のリスト */
    getDetailedTargetFarePaths() {
        assert(this.built);
        return this.detailedTargetFarePaths;
    }
}

void (async () => {
    const railwayGraph = await RailwayGraph.init();
    const sameFareSolver = await SameFareSolver.init(railwayGraph);
    //////////////////////////////////////////////////////////////////
    const beginInput = document.getElementById('js-ssb-input-begin');
    assertIsDefined(beginInput, 'beginInput');
    assert(beginInput instanceof HTMLInputElement);
    const endInput = document.getElementById('js-ssb-input-end');
    assertIsDefined(endInput, 'endInput');
    assert(endInput instanceof HTMLInputElement);
    const midInputsParent = document.getElementById('js-ssb-mid-inputs-parent');
    assertIsDefined(midInputsParent, 'midInputsParent');
    assert(midInputsParent instanceof HTMLDivElement);
    const midInputInputs = [];
    const addMidInput = () => {
        const num = midInputInputs.length + 1;
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group');
        inputGroup.classList.add('input-group-sm');
        inputGroup.classList.add('mb-3');
        const labelSpan = document.createElement('span');
        labelSpan.classList.add('input-group-text');
        labelSpan.innerText = `経由${num}`;
        inputGroup.appendChild(labelSpan);
        const midTextInput = document.createElement('input');
        midTextInput.classList.add('form-control');
        midTextInput.type = 'text';
        midTextInput.id = `js-ssb-input-mid${num}`;
        midTextInput.placeholder = '駅名を入力（任意）';
        inputGroup.appendChild(midTextInput);
        new Autocomplete(midTextInput, {
            data: railwayGraph.acData,
            maximumItems: 30,
            threshold: 1,
            onSelectItem: ({ label, value }) => {
                console.log('user selected:', label, value);
            },
        });
        const midSelect = document.createElement('select');
        midSelect.classList.add('form-select');
        const midOption0 = document.createElement('option');
        midOption0.value = '0';
        midOption0.text = '途中下車するか指定しない';
        midSelect.options.add(midOption0);
        midOption0.selected = true;
        const midOption1 = document.createElement('option');
        midOption1.value = '1';
        midOption1.text = '必ず途中下車する';
        midSelect.options.add(midOption1);
        const midOption2 = document.createElement('option');
        midOption2.value = '2';
        midOption2.text = '途中下車しない';
        midSelect.options.add(midOption2);
        inputGroup.appendChild(midSelect);
        midInputsParent.appendChild(inputGroup);
        midInputInputs.push([midTextInput, midSelect, inputGroup]);
    };
    addMidInput();
    const addMidInputButton = document.getElementById('js-ssb-button-mid-inputs-add');
    assertIsDefined(addMidInputButton, 'addMidInputButton');
    assert(addMidInputButton instanceof HTMLButtonElement);
    addMidInputButton.addEventListener('click', () => {
        addMidInput();
    });
    const popMidInputButton = document.getElementById('js-ssb-button-mid-inputs-pop');
    assertIsDefined(popMidInputButton, 'popMidInputButton');
    assert(popMidInputButton instanceof HTMLButtonElement);
    popMidInputButton.addEventListener('click', () => {
        if (midInputInputs.length > 1) {
            const [, , inputGroup] = midInputInputs.pop();
            inputGroup.remove();
        }
    });
    const displayKiloCheckbox = document.getElementById('js-ssb-input-display-kilo');
    assertIsDefined(displayKiloCheckbox, 'displayKiloCheckbox');
    assert(displayKiloCheckbox instanceof HTMLInputElement);
    const submitButton = document.getElementById('js-ssb-submit');
    assertIsDefined(submitButton, 'submitButton');
    assert(submitButton instanceof HTMLButtonElement);
    const alertParentElement = document.getElementById('js-ssb-alert-parent');
    assertIsDefined(alertParentElement, 'alertParentElement');
    assert(alertParentElement instanceof HTMLDivElement);
    const alertElement = document.getElementById('js-ssb-alert');
    assertIsDefined(alertElement, 'alertElement');
    assert(alertElement instanceof HTMLDivElement);
    const resultParent = document.getElementById('js-ssb-result');
    assertIsDefined(resultParent, 'resultParent');
    assert(resultParent instanceof HTMLDivElement);
    const resultRoute = document.getElementById('js-ssb-reuslt-route');
    assertIsDefined(resultRoute, 'resultParent');
    assert(resultRoute instanceof HTMLDivElement);
    const resultSplit = document.getElementById('js-ssb-reuslt-split');
    assertIsDefined(resultSplit, 'resultSplit');
    assert(resultSplit instanceof HTMLDivElement);
    new Autocomplete(beginInput, {
        data: railwayGraph.acData,
        maximumItems: 30,
        threshold: 1,
        onSelectItem: ({ label, value }) => {
            console.log('user selected:', label, value);
        },
    });
    new Autocomplete(endInput, {
        data: railwayGraph.acData,
        maximumItems: 30,
        threshold: 1,
        onSelectItem: ({ label, value }) => {
            console.log('user selected:', label, value);
        },
    });
    submitButton.addEventListener('click', () => {
        alertParentElement.style.display = 'none';
        try {
            // 出発駅，到着駅のインデックスを特定する
            const name0 = beginInput.value;
            const name1 = endInput.value;
            if (!railwayGraph.hasStationName(name0)) {
                throw Error(`出発駅名が不正です: ${name0}．Suica首都圏利用可能エリアに含まれている駅を指定してください．`);
            }
            if (!railwayGraph.hasStationName(name1)) {
                throw Error(`到着駅名が不正です: ${name1}．Suica首都圏利用可能エリアに含まれている駅を指定してください．`);
            }
            const idx0 = railwayGraph.getStationIdxByName(name0);
            const idx1 = railwayGraph.getStationIdxByName(name1);
            const displayKilo = displayKiloCheckbox.checked;
            // 経由駅のインデックスを特定する
            const stationIdxs = [idx0];
            const stationStopOptionsDesignated = [StationStopOptionsObj.MUST];
            midInputInputs.forEach(([midTextInput, midSelect]) => {
                const midNname = midTextInput.value.trim();
                if (midNname === '')
                    return;
                if (!railwayGraph.hasStationName(midNname)) {
                    return;
                }
                const midIdx = railwayGraph.getStationIdxByName(midNname);
                stationIdxs.push(midIdx);
                const stopOption = Number(midSelect.value);
                assert(stopOption === StationStopOptionsObj.NOT_DESIGNATED ||
                    stopOption === StationStopOptionsObj.MUST ||
                    stopOption === StationStopOptionsObj.MUST_NOT);
                stationStopOptionsDesignated.push(stopOption);
            });
            stationIdxs.push(idx1);
            stationStopOptionsDesignated.push(StationStopOptionsObj.MUST);
            console.log(stationIdxs, stationStopOptionsDesignated);
            // ★ 経路検索＋運賃分割を実行
            sameFareSolver.build(stationIdxs, stationStopOptionsDesignated);
            const routes = sameFareSolver.getRouteSegments();
            // ルート表示用テーブル更新
            {
                resultRoute.innerHTML = '';
                const routeTable = document.createElement('table');
                routeTable.classList.add('table');
                routeTable.classList.add('table-bordered');
                const fare = sameFareSolver.getFare();
                console.log(routes, fare);
                const kilo10 = sameFareSolver.getKilo10();
                const fareElement = document.createElement('p');
                fareElement.innerHTML = `通常運賃: ${fare} 円（※折返しや大回りが含まれる際，運賃が正しくない場合があります）`;
                resultRoute.appendChild(fareElement);
                // thead
                {
                    const thead = document.createElement('thead');
                    thead.classList.add('table-light');
                    if (displayKilo) {
                        thead.innerHTML = `<tr>
                            <th class="text-center" rowspan="2">区間</th>
                            <th class="text-center" rowspan="2">路線名</th>
                            <th class="text-center" rowspan="2">駅数</th>
                            <th class="text-center" colspan="5">営業キロ [km]</th>
                        </tr>
                        <tr>
                            <th class="text-center">地方交通線</th>
                            <th class="text-center">地方交通線<br>（換算キロ）</th>
                            <th class="text-center">幹線</th>
                            <th class="text-center">電車特定区間</th>
                            <th class="text-center">山手線内</th>
                        </tr>`;
                    }
                    else {
                        thead.innerHTML = `<tr>
                            <th class="text-center">区間</th>
                            <th class="text-center">路線名</th>
                            <th class="text-center">駅数</th>
                        </tr>`;
                    }
                    routeTable.appendChild(thead);
                }
                // tbody
                {
                    const tbody = document.createElement('tbody');
                    let stationSum = 0;
                    routes.forEach((route) => {
                        const tr = document.createElement('tr');
                        const routeLabel = `${railwayGraph.getStationNameByIdx(route.stationIdxs[0])} → ${railwayGraph.getStationNameByIdx(route.stationIdxs[route.stationIdxs.length - 1])}`;
                        if (displayKilo) {
                            tr.innerHTML = `
                            <td>${routeLabel}</td>
                            <td>${route.lineName}</td>
                            <td class="text-end">${route.stationIdxs.length - 1}</td>
                            <td class="text-end">${(route.kilo10[0] / 10).toFixed(1)}</td>
                            <td class="text-end">${(route.kilo10[4] / 10).toFixed(1)}</td>
                            <td class="text-end">${(route.kilo10[1] / 10).toFixed(1)}</td>
                            <td class="text-end">${(route.kilo10[2] / 10).toFixed(1)}</td>
                            <td class="text-end">${(route.kilo10[3] / 10).toFixed(1)}</td>
                            `;
                        }
                        else {
                            tr.innerHTML = `
                            <td>${routeLabel}</td>
                            <td>${route.lineName}</td>
                            <td class="text-end">${route.stationIdxs.length - 1}</td>
                            `;
                        }
                        tbody.appendChild(tr);
                        stationSum += route.stationIdxs.length - 1;
                    });
                    {
                        // 合計
                        const tr = document.createElement('tr');
                        if (displayKilo) {
                            tr.innerHTML = `
                            <td colspan="2" class="table-active">合計</td>
                            <td class="text-end table-active">${stationSum}</td>
                            <td class="text-end table-active">${(kilo10[0] / 10).toFixed(1)}</td>
                            <td class="text-end table-active">${(kilo10[4] / 10).toFixed(1)}</td>
                            <td class="text-end table-active">${(kilo10[1] / 10).toFixed(1)}</td>
                            <td class="text-end table-active">${(kilo10[2] / 10).toFixed(1)}</td>
                            <td class="text-end table-active">${(kilo10[3] / 10).toFixed(1)}</td>
                            `;
                        }
                        else {
                            tr.innerHTML = `
                            <td colspan="2" class="table-active">合計</td>
                            <td class="text-end table-active">${stationSum}</td>
                            `;
                        }
                        tbody.appendChild(tr);
                    }
                    routeTable.appendChild(tbody);
                }
                resultRoute.appendChild(routeTable);
            }
            {
                resultSplit.innerHTML = '';
                const rank = sameFareSolver.getDetailedTargetFarePaths();
                rank.forEach(({ targetFare, maxCount, fareSum, pattern, detailedPathList }, index) => {
                    if (pattern === 0)
                        return;
                    const div = document.createElement('div');
                    div.classList.add('accordion-item');
                    const collapseId = `collapse${index}`;
                    const h3 = document.createElement('h3');
                    h3.id = `heading${index}`;
                    h3.classList.add('accordion-header');
                    h3.innerHTML = `<button class="accordion-button" type="button" 
                        data-bs-toggle="collapse" data-bs-target="#${collapseId}"
                        aria-expanded="true" aria-controls="collapseOne">
                        ${targetFare}円区間：${maxCount}回（最安${fareSum}円，${pattern}通り）
                    </button>`;
                    div.appendChild(h3);
                    const collapsed = document.createElement('div');
                    collapsed.id = collapseId;
                    collapsed.classList.add('accordion-collapse');
                    collapsed.classList.add('collapse');
                    collapsed.setAttribute('aria-labelledby', `${h3.id}`);
                    collapsed.setAttribute('data-bs-parent', '#js-ssb-reuslt-split');
                    div.appendChild(collapsed);
                    const accordionBody = document.createElement('div');
                    accordionBody.classList.add('accordion-body');
                    if (pattern > MAX_PATH_COUNT) {
                        const alertDiv = document.createElement('div');
                        alertDiv.classList.add('alert');
                        alertDiv.classList.add('alert-warning');
                        alertDiv.setAttribute('role', 'alert');
                        alertDiv.innerText = `${MAX_PATH_COUNT + 1}通り以上のパターンがあります．${MAX_PATH_COUNT}通りのみ表示しています．`;
                        accordionBody.appendChild(alertDiv);
                    }
                    detailedPathList.forEach((detailedPath, index) => {
                        const h4 = document.createElement('h4');
                        h4.innerText = `パターン${index + 1}（途中下車${detailedPath.length - 1}回）`;
                        accordionBody.appendChild(h4);
                        const table = document.createElement('table');
                        table.classList.add('table');
                        table.classList.add('table-sm');
                        table.classList.add('table-bordered');
                        // thead
                        {
                            const thead = document.createElement('thead');
                            thead.classList.add('table-light');
                            if (displayKilo) {
                                thead.innerHTML = `<tr>
                                    <th class="text-center" rowspan="2">区間</th>
                                    <th class="text-center" rowspan="2">路線名</th>
                                    <th class="text-center" rowspan="2">運賃 [円]</th>
                                    <th class="text-center" rowspan="2">駅数</th>
                                    <th class="text-center" colspan="5">営業キロ [km]</th>
                                </tr>
                                <tr>
                                    <th class="text-center">地方交通線</th>
                                    <th class="text-center">地方交通線<br>（換算キロ）</th>
                                    <th class="text-center">幹線</th>
                                    <th class="text-center">電車特定区間</th>
                                    <th class="text-center">山手線内</th>
                                </tr>`;
                            }
                            else {
                                thead.innerHTML = `<tr>
                                    <th class="text-center">区間</th>
                                    <th class="text-center">路線名</th>
                                    <th class="text-center">運賃 [円]</th>
                                    <th class="text-center" rowspan="2">駅数</th>
                                </tr>`;
                            }
                            table.appendChild(thead);
                        }
                        // tbody
                        const tbody = document.createElement('tbody');
                        detailedPath.forEach((segment) => {
                            const { startStationName, terminalStationName, lineNames, fare, kilo10 } = segment;
                            const tr = document.createElement('tr');
                            if (displayKilo) {
                                tr.innerHTML = `
                                <td>${startStationName} → ${terminalStationName}</td>
                                <td>${lineNames.join('→')}</td>
                                <td class="text-end${fare === targetFare ? ' table-success' : ''}">${fare}</td>
                                <td class="text-end">${segment.stationIdxs.length - 1}</td>
                                <td class="text-end">${(kilo10[0] / 10).toFixed(1)}</td>
                                <td class="text-end">${(kilo10[4] / 10).toFixed(1)}</td>
                                <td class="text-end">${(kilo10[1] / 10).toFixed(1)}</td>
                                <td class="text-end">${(kilo10[2] / 10).toFixed(1)}</td>
                                <td class="text-end">${(kilo10[3] / 10).toFixed(1)}</td>
                                `;
                            }
                            else {
                                tr.innerHTML = `
                                <td>${startStationName} → ${terminalStationName}</td>
                                <td>${lineNames.join('→')}</td>
                                <td class="text-end${fare === targetFare ? ' table-success' : ''}">${fare}</td>
                                <td class="text-end">${segment.stationIdxs.length - 1}</td>
                                `;
                            }
                            tbody.appendChild(tr);
                        });
                        table.appendChild(tbody);
                        accordionBody.appendChild(table);
                    });
                    collapsed.appendChild(accordionBody);
                    resultSplit.appendChild(div);
                });
                if (resultSplit.innerHTML === '') {
                    resultSplit.innerHTML =
                        '（結果がありません．折り返し駅が「途中下車しない」駅に指定されていないか確認してください．）';
                }
            }
            resultParent.style.display = 'block';
        }
        catch (e) {
            if (e instanceof Error) {
                resultParent.style.display = 'none';
                alertElement.innerText = `Error: ${e.message}`;
                alertParentElement.style.display = 'block';
            }
            else {
                throw e;
            }
        }
    });
})();
