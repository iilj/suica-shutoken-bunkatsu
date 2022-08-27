# from typing import Dict, List
import urllib.request
from pathlib import Path
from bs4 import BeautifulSoup
from time import sleep
import json

from numpy import outer


def main() -> None:
    index_save_path = Path('.') / 'html' / '2' / 'index.html'
    if not index_save_path.parent.exists():
        index_save_path.parent.mkdir(parents=True)

    if index_save_path.exists():
        body_bytes = index_save_path.read_bytes()
    else:
        url = 'http://www.chikipage.net/rail/line.php?kaisha=2'
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as res:
            body_bytes: bytes = res.read()
        index_save_path.write_bytes(body_bytes)

    body: str = body_bytes.decode('utf-8')

    soup = BeautifulSoup(body, 'html.parser')
    td = soup.select_one('table.bun tr:nth-child(1) > td:nth-child(2) > table tr > td')
    assert(td is not None)

    # station2lines: Dict[int, List[int]] = {}

    # 電車特定区間
    sen2tokutei = {
        1: ['東京', '大船'],  # 東海道本線【東】
        2: ['品川', '鶴見'],  # 東海道本線【品鶴線】
        9: ['川崎', '立川'],  # 南武線
        10: ['尻手', '浜川崎'],  # 南武線【支線】
        11: ['鶴見', '扇町'],  # 鶴見線
        12: ['浅野', '海芝浦'],  # 鶴見線【芝浦支線】
        13: ['安善', '大川'],  # 鶴見線【大川支線】
        14: ['府中本町', '西船橋'],  # 武蔵野線
        15: ['東神奈川', '八王子'],  # 横浜線
        16: ['横浜', '大船'],  # 根岸線
        17: ['大船', '久里浜'],  # 横須賀線
        48: ['東京', '高尾'],  # 中央本線【東】
        51: ['立川', '奥多摩'],  # 青梅線
        52: ['拝島', '武蔵五日市'],  # 五日市線
        117: ['東京', '大宮'],  # 東北本線
        119: ['日暮里', '赤羽'],  # 東北本線【尾久経由】
        121: ['赤羽', '大宮'],  # 東北本線【埼京線】
        122: ['東京', '大宮'],  # 東北新幹線
        7: ['品川', '田端'],  # 山手線
        8: ['池袋', '赤羽'],  # 赤羽線
        123: ['日暮里', '取手'],  # 常磐線
        187: ['東京', '千葉'],  # 総武本線
        188: ['錦糸町', '御茶ノ水'],  # 総武本線【緩行】
        189: ['東京', '千葉みなと'],  # 京葉線
        322: ['市川塩浜', '西船橋'],  # 京葉線
        323: ['西船橋', '南船橋'],  # 京葉線
    }

    # 山手線内
    sen2yamanote = {
        1: ['東京', '品川'],  # 東海道本線【東】
        48: ['東京', '新宿'],  # 中央本線【東】
        117: ['東京', '田端'],  # 東北本線
        122: ['東京', '上野'],  # 東北新幹線
        7: ['品川', '田端'],  # 山手線
        188: ['秋葉原', '御茶ノ水'],  # 総武本線【緩行】
    }

    links = td.select('a')
    lines = []
    for link in links:
        if not ('href' in link.attrs):
            continue
        href = link.attrs['href']
        if not href.startswith('line.php?senid='):
            continue
        name = link.text.strip()  # 「東海道本線【東】」など
        senid = int(href[len('line.php?senid='):])  # 「1」など
        print(senid, name)

        sen_save_path = Path('.') / 'html' / '2' / f'{senid}.html'
        if sen_save_path.exists():
            print('  -> exists')
            sen_body_bytes = sen_save_path.read_bytes()
        else:
            sleep(5)
            url = f'http://www.chikipage.net/rail/line.php?senid={senid}'
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as res:
                sen_body_bytes: bytes = res.read()
            sen_save_path.write_bytes(sen_body_bytes)
            print(f'  -> saved as {sen_save_path.name}')

        sen_body: str = sen_body_bytes.decode('utf-8')
        sen_soup = BeautifulSoup(sen_body, 'html.parser')
        sen_td = sen_soup.select_one('table.bun tr:nth-child(1) > td:nth-child(2) > table tr > td table')
        assert(sen_td is not None)

        sen_type_tag = sen_soup.select_one('h1 img')
        assert(sen_td is not None)
        if not ('alt' in sen_type_tag.attrs):
            raise '幹線/地方交通線 区分不明'
        sen_type_str = sen_type_tag.attrs['alt']
        assert(sen_type_str == '幹線' or sen_type_str == '地方交通線')
        sen_is_kansen = (sen_type_str == '幹線')
        print(f'  -> {sen_is_kansen} ({sen_type_str})')

        lines.append({'id': senid, 'name': name, 'is_kansen': sen_is_kansen})

        stations_rows = sen_td.select('tr')
        stations = []
        kukan_type = 1 if sen_is_kansen else 0
        for station_row in stations_rows:
            name_tag = station_row.select_one('td:nth-child(2) a')
            if name_tag is None:
                continue  # ヘッダ行
            if not ('href' in name_tag.attrs):
                continue
            if not ('title' in name_tag.attrs):
                continue

            eki_kilo_tag = station_row.select_one('td:nth-child(4)')
            if eki_kilo_tag is None:
                raise '営業キロのタグが見つからないよ！'

            eki_href = name_tag.attrs['href']
            eki_ruby = name_tag.attrs['title']
            eki_name = name_tag.text.strip()
            eki_kilo = eki_kilo_tag.text.strip()

            if not eki_href.startswith('stn.php?ekiid='):
                raise '駅リンクが不正だよ'
            eki_id = int(eki_href[len('stn.php?ekiid='):])
            # print(eki_id, eki_kilo, eki_name, eki_ruby)
            stations.append({'kukan_type': kukan_type, 'id': eki_id,
                            'kilo': eki_kilo, 'name': eki_name, 'ruby': eki_ruby})

            # 区間タイプ更新
            if senid in sen2tokutei:
                l, r = sen2tokutei[senid]
                if eki_name == l:
                    kukan_type = 2  # 電車特定区間

            if senid in sen2yamanote:
                l, r = sen2yamanote[senid]
                if eki_name == l:
                    kukan_type = 3  # 山手線内
                elif eki_name == r:
                    kukan_type = 2

            if senid in sen2tokutei:
                l, r = sen2tokutei[senid]
                if eki_name == r:
                    kukan_type = 1 if sen_is_kansen else 0

            # # 駅 id 記録
            # if not eki_id in station2lines:
            #     station2lines[eki_id] = [senid]
            # else:
            #     station2lines[eki_id].append(senid)

        sen_csv_save_path = Path('.') / 'csv' / '2' / f'{senid}.csv'
        # sen_json_save_path.unlink()
        if not sen_csv_save_path.exists():
            sen_outstr = ''
            for station in stations:
                kukan_type = station['kukan_type']
                eki_id = station['id']
                eki_kilo = station['kilo']
                eki_name = station['name']
                eki_ruby = station['ruby']
                sen_outstr += f'{kukan_type},{eki_kilo},{eki_id},{eki_name},{eki_ruby}\n'
            sen_csv_save_path.write_text(sen_outstr, encoding='utf-8')
        #     sen_jsonstr = json.dumps(stations)
        #     sen_json_save_path.write_text(sen_jsonstr)
        # break

    # # dump junctions
    # for k, v in station2lines.items():
    #     if len(v) > 1:
    #         print(f'{k} => {v}')

    index_csv_save_path = Path('.') / 'csv' / '2' / 'index.csv'
    # index_json_save_path.unlink()
    if not index_csv_save_path.exists():
        outstr = ''
        # {'id': senid, 'name': name, 'is_kansen': sen_is_kansen}
        for line in lines:
            senid = line['id']
            name = line['name']
            sen_is_kansen = line['is_kansen']
            outstr += f'{1 if sen_is_kansen else 0},{senid},{name}\n'
        index_csv_save_path.write_text(outstr, encoding='utf-8')
    #     jsonstr = json.dumps(lines)
    #     index_json_save_path.write_text(jsonstr)


if __name__ == '__main__':
    main()
