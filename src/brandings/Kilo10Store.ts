import { EdgeInfo, KukanTypeObj } from '../RailwayGraph';
import { assertKilo10, Kilo10 } from './Kilo10';

export class Kilo10Store extends Array<Kilo10> {
    constructor() {
        super(5);
        for (let i = 0; i < 5; ++i) this[i] = 0 as Kilo10;
    }

    addEdge(edgeInfo: EdgeInfo) {
        const kukanTypeSum = this[edgeInfo.kukanType] + edgeInfo.kilo10;
        const kansanSum = this[KukanTypeObj.CHIHOU_KANSAN] + edgeInfo.kilo10_kansan;
        assertKilo10(kukanTypeSum);
        assertKilo10(kansanSum);
        this[edgeInfo.kukanType] = kukanTypeSum;
        this[KukanTypeObj.CHIHOU_KANSAN] = kansanSum;
    }
}
