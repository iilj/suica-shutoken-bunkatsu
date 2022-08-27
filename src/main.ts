import { RailwayGraph } from './RailwayGraph';
import { MAX_PATH_COUNT, SameFareSolver, StationStopOption, StationStopOptionsObj } from './SameFareSolver';
import { assert, assertIsDefined } from './utils';

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

    const midInputInputs: [HTMLInputElement, HTMLSelectElement, HTMLDivElement][] = [];
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
            const [, , inputGroup] = midInputInputs.pop() as [HTMLInputElement, HTMLSelectElement, HTMLDivElement];
            inputGroup.remove();
        }
    });

    const displayKiloCheckbox = document.getElementById('js-ssb-input-display-kilo');
    assertIsDefined(displayKiloCheckbox, 'displayKiloCheckbox');
    assert(displayKiloCheckbox instanceof HTMLInputElement);

    const submitButton = document.getElementById('js-ssb-submit');
    assertIsDefined(submitButton, 'submitButton');
    assert(submitButton instanceof HTMLButtonElement);

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
        // 出発駅，到着駅のインデックスを特定する
        const name0 = beginInput.value;
        const name1 = endInput.value;
        if (!railwayGraph.hasStationName(name0)) {
            throw Error(`出発駅名が不正です: ${name0}`);
        }
        if (!railwayGraph.hasStationName(name1)) {
            throw Error(`到着駅名が不正です: ${name1}`);
        }
        const idx0 = railwayGraph.getStationIdxByName(name0);
        const idx1 = railwayGraph.getStationIdxByName(name1);

        const displayKilo = displayKiloCheckbox.checked;

        // 経由駅のインデックスを特定する
        const stationIdxs = [idx0];
        const stationStopOptionsDesignated: StationStopOption[] = [StationStopOptionsObj.MUST];
        midInputInputs.forEach(([midTextInput, midSelect]) => {
            const midNname = midTextInput.value.trim();
            if (midNname === '') return;
            if (!railwayGraph.hasStationName(midNname)) {
                return;
            }
            const midIdx = railwayGraph.getStationIdxByName(midNname);
            stationIdxs.push(midIdx);

            const stopOption = Number(midSelect.value);
            assert(
                stopOption === StationStopOptionsObj.NOT_DESIGNATED ||
                    stopOption === StationStopOptionsObj.MUST ||
                    stopOption === StationStopOptionsObj.MUST_NOT
            );
            stationStopOptionsDesignated.push(stopOption);
        });
        stationIdxs.push(idx1);
        stationStopOptionsDesignated.push(StationStopOptionsObj.MUST);
        console.log(stationIdxs, stationStopOptionsDesignated);

        // ★ 経路検索＋運賃分割を実行
        sameFareSolver.build(stationIdxs, stationStopOptionsDesignated);

        resultParent.style.display = 'block'; // display: none から可視状態に回復
        const routes = sameFareSolver.getRouteSegments();

        // ルート表示用テーブル更新
        {
            resultRoute.innerHTML = '';
            const routeTable = document.createElement('table');
            routeTable.classList.add('table');
            routeTable.classList.add('table-bordered');

            const fare = sameFareSolver.getFare();
            console.log(routes, fare);
            const kilo10list = sameFareSolver.getKilo10list();
            const fareElement = document.createElement('p');
            fareElement.innerHTML = `通常運賃: ${fare} 円`;
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
                } else {
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
                    const routeLabel = `${railwayGraph.getStationNameByIdx(
                        route.stationIdxs[0]
                    )} → ${railwayGraph.getStationNameByIdx(route.stationIdxs[route.stationIdxs.length - 1])}`;
                    if (displayKilo) {
                        tr.innerHTML = `
                        <td>${routeLabel}</td>
                        <td>${route.lineName}</td>
                        <td class="text-end">${route.stationIdxs.length - 1}</td>
                        <td class="text-end">${(route.kilo10list[0] / 10).toFixed(1)}</td>
                        <td class="text-end">${(route.kilo10list[4] / 10).toFixed(1)}</td>
                        <td class="text-end">${(route.kilo10list[1] / 10).toFixed(1)}</td>
                        <td class="text-end">${(route.kilo10list[2] / 10).toFixed(1)}</td>
                        <td class="text-end">${(route.kilo10list[3] / 10).toFixed(1)}</td>
                        `;
                    } else {
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
                        <td class="text-end table-active">${(kilo10list[0] / 10).toFixed(1)}</td>
                        <td class="text-end table-active">${(kilo10list[4] / 10).toFixed(1)}</td>
                        <td class="text-end table-active">${(kilo10list[1] / 10).toFixed(1)}</td>
                        <td class="text-end table-active">${(kilo10list[2] / 10).toFixed(1)}</td>
                        <td class="text-end table-active">${(kilo10list[3] / 10).toFixed(1)}</td>
                        `;
                    } else {
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
                if (pattern === 0) return;
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
                    alertDiv.innerText = `${
                        MAX_PATH_COUNT + 1
                    }通り以上のパターンがあります．${MAX_PATH_COUNT}通りのみ表示しています．`;
                    accordionBody.appendChild(alertDiv);
                }

                detailedPathList.forEach((detailedPath, index) => {
                    const h4 = document.createElement('h4');
                    h4.innerText = `パターン${index + 1}`;
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
                        } else {
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
                        const { startStationName, terminalStationName, lineNames, fare, kilo10list } = segment;
                        const tr = document.createElement('tr');
                        if (displayKilo) {
                            tr.innerHTML = `
                            <td>${startStationName} → ${terminalStationName}</td>
                            <td>${lineNames.join('→')}</td>
                            <td class="text-end${fare === targetFare ? ' table-success' : ''}">${fare}</td>
                            <td class="text-end">${segment.stationIdxs.length - 1}</td>
                            <td class="text-end">${(kilo10list[0] / 10).toFixed(1)}</td>
                            <td class="text-end">${(kilo10list[4] / 10).toFixed(1)}</td>
                            <td class="text-end">${(kilo10list[1] / 10).toFixed(1)}</td>
                            <td class="text-end">${(kilo10list[2] / 10).toFixed(1)}</td>
                            <td class="text-end">${(kilo10list[3] / 10).toFixed(1)}</td>
                            `;
                        } else {
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
    });
})();
