from pathlib import Path


def main() -> None:
    index_csv_path = Path('.') / 'csv' / '2' / 'index.csv'
    assert index_csv_path.exists()
    index_csv_str = index_csv_path.read_text(encoding='utf-8').strip()
    index_csv = [line.split(',') for line in index_csv_str.split('\n')]
    print(index_csv)

    # Suica 首都圏エリア
    sen2suica = {
        1: ['東京', '熱海'],  # 東海道本線【東】
        2: ['品川', '鶴見'],  # 東海道本線【品鶴線】
        7: ['品川', '田端'],  # 山手線
        8: ['池袋', '赤羽'],  # 赤羽線
        9: ['川崎', '立川'],  # 南武線
        10: ['尻手', '浜川崎'],  # 南武線【支線】
        189: ['東京', '蘇我'],  # 京葉線
        322: ['市川塩浜', '西船橋'],  # 京葉線
        323: ['西船橋', '南船橋'],  # 京葉線
        11: ['鶴見', '扇町'],  # 鶴見線
        12: ['浅野', '海芝浦'],  # 鶴見線【芝浦支線】
        13: ['安善', '大川'],  # 鶴見線【大川支線】
        14: ['府中本町', '西船橋'],  # 武蔵野線
        15: ['東神奈川', '八王子'],  # 横浜線
        16: ['横浜', '大船'],  # 根岸線
        17: ['大船', '久里浜'],  # 横須賀線
        18: ['茅ヶ崎', '橋本'],  # 相模線
        20: ['熱海', '伊東'],  # 伊東線
        48: ['東京', '塩尻'],  # 中央本線【東】
        # 49: ['岡谷', '塩尻'],  # 中央本線【辰野経由】
        51: ['立川', '奥多摩'],  # 青梅線
        52: ['拝島', '武蔵五日市'],  # 五日市線
        53: ['八王子', '倉賀野'],  # 八高線
        117: ['東京', '黒磯'],  # 東北本線
        119: ['日暮里', '赤羽'],  # 東北本線【尾久経由】
        120: ['岩切', '利府'],  # 東北本線【利府支線】
        121: ['赤羽', '大宮'],  # 東北本線【埼京線】
        123: ['日暮里', '浪江'],  # 常磐線
        126: ['大宮', '高麗川'],  # 川越線
        127: ['大宮', '高崎'],  # 高崎線
        128: ['高崎', '水上'],  # 上越線
        133: ['小山', '新前橋'],  # 両毛線
        135: ['小山', '友部'],  # 水戸線
        137: ['宇都宮', '日光'],  # 日光線
        179: ['高崎', '横川'],  # 信越本線
        187: ['東京', '銚子'],  # 総武本線
        188: ['錦糸町', '御茶ノ水'],  # 総武本線【緩行】
        190: ['千葉', '安房鴨川'],  # 外房線
        191: ['蘇我', '安房鴨川'],  # 内房線
        193: ['佐倉', '松岸'],  # 成田線【松岸線】
        194: ['成田', '我孫子'],  # 成田線【我孫子線】
        195: ['成田', '成田空港'],  # 成田線【空港線】
        198: ['大網', '成東'],  # 東金線
        196: ['香取', '鹿島サッカースタジアム'],  # 鹿島線
        55: ['塩尻', '松本'],  # 篠ノ井線
        54: ['小淵沢', '野辺山'],  # 小海線 ★後処理
        124: ['水戸', '常陸大子'],  # 水郡線 ★後処理
        125: ['上菅谷', '常陸太田'],  # 水郡線【支線】 ★後処理
        131: ['渋川', '万座・鹿沢口'],  # 吾妻線 ★後処理
    }
    outstr = ''

    # is_kansen, senid, name
    for is_kansen, senid_str, name in index_csv:
        senid = int(senid_str)
        print(is_kansen, senid, name)
        sen_csv_path = Path('.') / 'csv' / '2' / f'{senid}.csv'
        assert sen_csv_path.exists()
        # if senid != 1:
        #     continue

        if not (senid in sen2suica):
            continue
        outstr += f'{is_kansen},{senid},{name}\n'

        sen_csv_str = sen_csv_path.read_text(encoding='utf-8').strip()
        sen_csv = [line.split(',') for line in sen_csv_str.split('\n')]
        # print(sen_csv)

        sen_csv_save_path = Path('.') / 'csv' / '2_suica_shutoken' / f'{senid}.csv'
        if sen_csv_save_path.exists():
            continue
        sen_outstr = ''
        for kukan_type, eki_kilo, eki_id, eki_name, eki_ruby in sen_csv:
            print(kukan_type, eki_kilo, eki_id, eki_name, eki_ruby)
            sen_outstr += f'{kukan_type},{eki_kilo},{eki_id},{eki_name},{eki_ruby}\n'
            if eki_name == sen2suica[senid][1]:
                break
        sen_csv_save_path.write_text(sen_outstr, encoding='utf-8')
    # exit()

    index_csv_save_path = Path('.') / 'csv' / '2_suica_shutoken' / 'index.csv'
    if not index_csv_save_path.exists():
        index_csv_save_path.write_text(outstr, encoding='utf-8')


if __name__ == '__main__':
    main()
