var skillListOrg;
var intervalList;
var probabilityList;
var periodList;
var expectedValueList;

/**
 * ページ読み込み時
 */
$(document).ready(function() {
    $.ajaxSetup({async: false});
    LoadSkillTypeJson();
    AddSkillListBody(skillListOrg);
    SetConditionOption();
    $.ajaxSetup({async: true});
});

/**
 * 比較関数
 */
const comparefunction = function(a, b) {
    return a - b;
}

/**
 * json読み込み
 */
function LoadSkillTypeJson() {
    $.getJSON('./data/skill_type.json', function(data) {
        // リストを初期化
        skillListOrg = [];
        let intervalSet = new Set();
        let probabilitySet = new Set();
        let periodSet = new Set();
        let expectedValueSet = new Set();

        if (data) {
            data.forEach(function(element){
                // 検索条件用
                intervalSet.add(element.interval);
                probabilitySet.add(element.probability);
                periodSet.add(element.period);
                expectedValueSet.add(element.expected_value);

                skillListOrg.push(
                    {
                        interval: element.interval
                        , probability: element.probability
                        , period: element.period
                        , effect: element.effect
                        , expected_value: element.expected_value
                    }
                );
            });
            intervalList = Array.from(intervalSet).sort(comparefunction);
            probabilityList = Array.from(probabilitySet).sort(comparefunction).reverse();
            periodList = Array.from(periodSet).sort(comparefunction);
            expectedValueList = Array.from(expectedValueSet).sort(comparefunction).reverse();
        }
    });
}

/**
 * body展開
 */
function AddSkillListBody(list) {
    $('#skill_list_body').empty();
    let rowCnt = 0;
    if(list && list.length > 0) {
        list.forEach(function(row){
            let rowInfo = '';
            rowCnt++;
            rowInfo += '<tr class="' + (rowCnt % 2 == 0 ? "even_row" : "odd_row") + '">';
            rowInfo += '<td class="interval">' + row.interval + '秒</td>';
            rowInfo += '<td class="probability">' + row.probability + '%</td>';
            rowInfo += '<td class="period">' + row.period + '秒間</td>';
            rowInfo += '<td class="effect">' + row.effect + '</td>';
            rowInfo += '<td class="expected_value">' + row.expected_value + '</td>';
            rowInfo += '</tr>';
            $('#skill_list_body').append(rowInfo);
        });
    }
}

/**
 * 検索条件選択肢設定
 */
function SetConditionOption() {
    // 間隔
    $('#interval_condition option').remove();
    $('#interval_condition').append($('<option>').html('').val(''));
    intervalList.forEach(function(row){
        $('#interval_condition').append($('<option>').html(row).val(row));
    });

    // 確率
    $('#probability_condition option').remove();
    $('#probability_condition').append($('<option>').html('').val(''));
    probabilityList.forEach(function(row){
        $('#probability_condition').append($('<option>').html(row).val(row));
    });

    // 期間
    $('#period_condition option').remove();
    $('#period_condition').append($('<option>').html('').val(''));
    periodList.forEach(function(row){
        $('#period_condition').append($('<option>').html(row).val(row));
    });

    // 期待値
    $('#expected_value_condition option').remove();
    $('#expected_value_condition').append($('<option>').html('').val(''));
    expectedValueList.forEach(function(row){
        $('#expected_value_condition').append($('<option>').html(row).val(row));
    });
}

/**
 * 条件リセットボタン押下
 */
function ConditionResetClick() {
    $('#interval_condition').val('');
    $('#probability_condition').val('');
    $('#period_condition').val('');
    $('#effect_condition').val('');
    $('#expected_value_condition').val('');
    AddSkillListBody(skillListOrg);
}

/**
 * 検索条件変更
 */
function ChangeSearchCondition() {
    AddSkillListBody(FilterSkillList());
}

/**
 * リスト絞り込み
 */
function FilterSkillList() {
    let skillList = [];

    // 入力値
    let interval = $('#interval_condition').val();
    let probability = $('#probability_condition').val();
    let period = $('#period_condition').val();
    let expected_value = $('#expected_value_condition').val();

    skillListOrg.forEach(function(row) {
        if (
            (!interval || Number(row.interval) == Number(interval)) &&
            (!probability || Number(row.probability) == Number(probability)) &&
            (!period || Number(row.interval) == Number(period)) &&
            (!expected_value || Number(row.expected_value) == Number(expected_value)) &&
            SearchEffect(row.effect)
            ) {
                skillList.push(row);
            }
    });

    return skillList;
}

/**
 * スキル効果検索
 */
function SearchEffect(targetEffect) {
    let result = false;
    let effect = $('#effect_condition').val();

    // 未入力なら検索条件を見ない
    if (!effect) return true;

    // 全角空白を半角空白に変換
    effect = effect.replace('　', ' ');
    // 全角を半角へ変換（英数字）
    effect = effect.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    // 半角カナを全角カナへ変換
    let kanaMap = {
        'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
        'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
        'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
        'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
        'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
        'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
        '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・', '％': '%'
    };
    let reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
    effect = effect.replace(reg, function (match) {
            return kanaMap[match];
        })
        .replace(/ﾞ/g, '゛')
        .replace(/ﾟ/g, '゜');

    // 検索処理
    effect.split(' ').forEach(function(row) {
        result = targetEffect.includes(row);
    });

    return result;
}
