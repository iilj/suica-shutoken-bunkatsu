from pathlib import Path
import json


def main() -> None:
    index_csv_path = Path('.') / 'csv' / '2_suica_shutoken' / 'index.csv'
    assert index_csv_path.exists()
    index_csv_str = index_csv_path.read_text(encoding='utf-8').strip()
    index_csv = [line.split(',') for line in index_csv_str.split('\n')]
    print(index_csv)

    sens = []
    # is_kansen, senid, name
    for is_kansen_str, senid_str, name in index_csv:
        is_kansen: int = int(is_kansen_str)
        senid = int(senid_str)
        print(is_kansen, senid, name)
        sen_csv_path = Path('.') / 'csv' / '2_suica_shutoken' / f'{senid}.csv'
        assert sen_csv_path.exists()

        sen_csv_str = sen_csv_path.read_text(encoding='utf-8').strip()
        sen_csv = [line.split(',') for line in sen_csv_str.split('\n')]
        # print(sen_csv)

        stations = []

        for kukan_type, eki_kilo, eki_id, eki_name, eki_ruby in sen_csv:
            kilo10: int = round(float(eki_kilo) * 10)
            kilo10_kansan: int = 0 if is_kansen else round(kilo10 * 1.1)
            stations.append({
                'kukan_type': int(kukan_type),
                'kilo10': kilo10,
                'kilo10_kansan': kilo10_kansan,
                'id': int(eki_id),
                'name': eki_name,
                'ruby': eki_ruby,
            })

        senobj = {
            'is_kansen': is_kansen,
            'id': senid,
            'name': name,
            'stations': stations
        }
        sens.append(senobj)
    js = json.dumps(sens, ensure_ascii=False, indent=2)

    out_json_path = Path('.') / 'csv' / '2_suica_shutoken' / 'index.json'
    out_json_path.write_text(js, encoding='utf-8')


if __name__ == '__main__':
    main()
