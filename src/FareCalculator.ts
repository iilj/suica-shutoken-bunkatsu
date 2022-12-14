import { Fare } from './brandings/Fare';
import { assertKilo10, Kilo10 } from './brandings/Kilo10';
import { Kilo10Store } from './brandings/Kilo10Store';
import { KukanType, KukanTypeObj } from './RailwayGraph';
import { assert } from './utils';

export class FareCalculator {
    private constructor(private dbFare: [Kilo10, Fare][][]) {
        //
    }

    static async init(): Promise<FareCalculator> {
        const dbFareRes = await fetch('fare.json');
        assert(dbFareRes.ok);
        const dbFare: [Kilo10, Fare][][] = (await dbFareRes.json()) as [Kilo10, Fare][][];
        return new FareCalculator(dbFare);
    }

    /** 営業キロx10 の値を，key に対応する運賃表と突き合わせる */
    private calcFareSearch(kilo10: Kilo10, key: KukanType): Fare {
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
    public calcFare(kilo10: Kilo10Store): Fare {
        // const sum: number = kilo10list.reduce((prev, curr) => prev + curr, 0);
        const sum =
            kilo10[KukanTypeObj.CHIHOU] +
            kilo10[KukanTypeObj.KANSEN] +
            kilo10[KukanTypeObj.TOKUTEI] +
            kilo10[KukanTypeObj.YAMANOTE];
        assertKilo10(sum);
        if (kilo10[KukanTypeObj.CHIHOU] === 0) {
            // 地方交通線を含まない
            if (kilo10[KukanTypeObj.YAMANOTE] === sum) {
                // 山手線内のみ
                return this.calcFareSearch(sum, KukanTypeObj.YAMANOTE);
            } else if (kilo10[KukanTypeObj.KANSEN] === 0) {
                // 電車特定区間（+ 山手線内）のみ
                return this.calcFareSearch(sum, KukanTypeObj.TOKUTEI);
            } else {
                // 幹線（+ 電車特定区間 + 山手線内）
                return this.calcFareSearch(sum, KukanTypeObj.KANSEN);
            }
        } else {
            // 地方交通線を含む
            if (kilo10[KukanTypeObj.CHIHOU] === sum) {
                // 地方交通線のみ
                return this.calcFareSearch(sum, KukanTypeObj.CHIHOU);
            } else {
                // 地方交通線と幹線を両方含む
                if (sum <= 100) {
                    // 幹線と地方交通線それぞれの営業キロの合計が10キロメートル以内の場合は，
                    // 営業キロで，地方交通線の換算表により計算
                    // https://www.jr-odekake.net/railroad/ticket/guide/normal_tickets/normal_fare04.html
                    return this.calcFareSearch(sum, KukanTypeObj.CHIHOU);
                } else {
                    // 運賃計算キロ（地方交通線の賃率換算キロ＋幹線の営業キロ）で，
                    // 幹線の換算表を用いて計算
                    const sum_kansan =
                        kilo10[KukanTypeObj.CHIHOU_KANSAN] +
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
