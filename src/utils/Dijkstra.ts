import { assert } from '.';
import { BinaryHeap, HeapElement } from './BinaryHeap';

interface Edge {
    src: number;
    dst: number;
    weight: number;
}
class Vertex extends Array<Edge> {}

class Graph extends Array<Vertex> {
    constructor(private n: number) {
        super(n);
        for (let i = 0; i < n; ++i) {
            this[i] = new Vertex();
        }
    }
    addArc(src: number, dst: number, weight: number) {
        this[src].push({ src, dst, weight });
    }
    addEdge(src: number, dst: number, weight: number) {
        this.addArc(src, dst, weight);
        this.addArc(dst, src, weight);
    }
}

export class Dijkstra {
    private graph: Graph;
    private dist: number[];
    private bs: number[];

    constructor(private n: number) {
        this.graph = new Graph(n);
        this.dist = new Array(n) as number[];
        this.bs = new Array(n) as number[];
    }

    /** 双方向 */
    addEdge(src: number, dst: number, weight: number) {
        this.graph.addEdge(src, dst, weight);
    }

    build(start: number) {
        const que = new BinaryHeap<number>(); // 昇順に並べ替え，小さい順に取り出す
        this.dist.fill(Number.POSITIVE_INFINITY);
        this.bs.fill(-1);
        this.dist[start] = 0;
        que.push(start, 0);
        while (que.size() > 0) {
            const tp: HeapElement<number> | undefined = que.pop();
            assert(tp !== undefined);
            const { element: cur_node, score: cur_cost } = tp;

            if (this.dist[cur_node] < cur_cost) continue;
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

    get(i: number) {
        return this.dist[i];
    }

    restore(dst: number): number[] {
        const res: number[] = [];
        if (this.bs[dst] < 0) return res;
        while (~dst) {
            res.push(dst);
            dst = this.bs[dst];
        }
        res.reverse();
        return res;
    }
}
