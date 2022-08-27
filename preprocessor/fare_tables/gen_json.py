import csv
import json
from pathlib import Path
from typing import List, Tuple

from sqlalchemy import outparam


def main() -> None:
    # 地方交通線，幹線，電車特定区間，山手線内
    filenames = [
        'table2_chihou.csv',
        'table1_kansen.csv',
        'table3_tokutei.csv',
        'table4_yamanote.csv'
    ]
    fares: List[List[Tuple[int, int]]] = []
    for filename in filenames:
        path = Path('csv') / filename
        print(path)
        rows: List[List[str]] = []
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                # print(row)
                rows.append(row)
        rows.pop(0)
        head = rows.pop(0)
        rows.pop(0)
        idx_ic = head.index('JRE IC')
        fares_tmp: List[Tuple[int, int]] = []
        for row in rows:
            kilo_ub = int(row[1])
            fare = int(row[idx_ic])
            print(kilo_ub, fare)
            fares_tmp.append((kilo_ub, fare))
        # break
        fares.append(fares_tmp)

    jsonstr = json.dumps(fares)
    outpath = Path('csv') / 'fare.json'
    outpath.write_text(jsonstr, encoding='utf-8')


if __name__ == '__main__':
    main()
