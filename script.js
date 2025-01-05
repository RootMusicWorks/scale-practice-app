// 設定オブジェクト
const settings = {
  scales: [],         // ペンタ以外 + ペンタ
  keys: [],
  positionsNonPenta: [],
  positionsPenta: [],
  phrasesNonPenta: [],
  phrasesPenta: [],
  lenpu: [],          // 連符
  bpmRange: { min: 90, max: 120 },  // デフォルト 90～120
};

// メトロノームの状態
let currentBPM = 90;
let nextTickTime = 0; 
let metronomeRunning = false;  // メトロノームが動作中かどうか
let metronomeRequestId;        // requestAnimationFrameのID管理用

// 音源を準備
let clickAudio = new Audio('click.mp3');
clickAudio.load(); 

// メトロノームの再生を開始
function playClickSound() {
    clickAudio.currentTime = 0;
    clickAudio.play().catch(e => {
        console.error("Error playing audio:", e);
    });
}

function startMetronome() {
    if (!metronomeRunning) {
        metronomeRunning = true;
        nextTickTime = Date.now();
        tick();
    }
}

function tick() {
    if (!metronomeRunning) return;
    
    let currentTime = Date.now();
    if (currentTime >= nextTickTime) {
        playClickSound();
        nextTickTime = currentTime + (60000 / currentBPM);
    }
    metronomeRequestId = requestAnimationFrame(tick);
}

function stopMetronome() {
    metronomeRunning = false;
    if (metronomeRequestId) {
        cancelAnimationFrame(metronomeRequestId);
    }
}

function updateBPM(value) {
    currentBPM = Math.max(40, Math.min(240, currentBPM + value));
    document.getElementById('bpm-input').value = currentBPM;
    if (metronomeRunning) {
        nextTickTime = Date.now();
        tick();
    }
}

/* ====================================
  初期化: 各チェックボックスの選択値を読み込む
==================================== */
function initializeSettings() {
    const scalesNonPenta = getCheckedValues('#scales-nonpenta input:checked');
    const scalesPenta = getCheckedValues('#scales-penta input:checked');
    settings.scales = scalesNonPenta.concat(scalesPenta);
    settings.keys = getCheckedValues('#keys-suboptions input:checked');
    settings.positionsNonPenta = getCheckedValues('#positions-nonpenta input:checked');
    settings.positionsPenta = getCheckedValues('#positions-penta input:checked');
    settings.phrasesNonPenta = getCheckedValues('#phrases-nonpenta input:checked');
    settings.phrasesPenta = getCheckedValues('#phrases-penta input:checked');
    settings.lenpu = getCheckedValues('#lenpu-suboptions input:checked');
    
    const minVal = Number(document.getElementById('bpm-min').value);
    const maxVal = Number(document.getElementById('bpm-max').value);
    settings.bpmRange.min = Math.max(40, minVal);
    settings.bpmRange.max = Math.min(240, maxVal);
}

/* ====================================
  チェックが入っている値を取得
==================================== */
function getCheckedValues(selector) {
    return Array.from(document.querySelectorAll(selector)).map(el => el.value);
}

/* ====================================
  ランダム関数
==================================== */
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomBPM(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ====================================
  お題生成
==================================== */
function generateTask() {
    initializeSettings();
    
    if (!settings.scales.length || !settings.keys.length) {
        alert('スケールとキーのチェックを最低1つずつは入れてください。');
        return;
    }
    
    const selectedScale = getRandomItem(settings.scales);
    const selectedKey = getRandomItem(settings.keys);
    const selectedPosition = getRandomItem(settings.positionsNonPenta);
    const selectedPhrase = getRandomItem(settings.phrasesNonPenta);
    const selectedLenpu = getRandomItem(settings.lenpu);
    const randomBPM = getRandomBPM(settings.bpmRange.min, settings.bpmRange.max);

    document.getElementById('scale-display').textContent = `スケール: ${selectedScale}`;
    document.getElementById('key-display').textContent = `キー: ${selectedKey}`;
    document.getElementById('position-display').textContent = `スタートポジション: ${selectedPosition}`;
    document.getElementById('phrase-display').textContent = `フレーズ: ${selectedPhrase}`;
    document.getElementById('lenpu-display').textContent = `連符: ${selectedLenpu}`;
    document.getElementById('bpm-display').textContent = `BPM: ${randomBPM}`;
    
    updateBPM(randomBPM - currentBPM);
    startMetronome();
}

/* ====================================
  イベントリスナー（スマホ対応済み）
==================================== */

// クリックとタップの両方に対応
function addEventListenersWithTouchSupport(elementId, callback) {
    const element = document.getElementById(elementId);
    element.addEventListener('click', callback);
    element.addEventListener('touchstart', (e) => {
        e.preventDefault(); // 二重実行防止
        callback();
    });
}

// タスク生成とメトロノームの制御
addEventListenersWithTouchSupport('generate-task', generateTask);
addEventListenersWithTouchSupport('stop-task-metronome', stopMetronome);
addEventListenersWithTouchSupport('resume-task-metronome', startMetronome);
addEventListenersWithTouchSupport('start-metronome', startMetronome);
addEventListenersWithTouchSupport('stop-metronome', stopMetronome);

// BPM増減ボタン
addEventListenersWithTouchSupport('decrease-bpm', () => updateBPM(-1));
addEventListenersWithTouchSupport('increase-bpm', () => updateBPM(1));
addEventListenersWithTouchSupport('decrease5-bpm', () => updateBPM(-5));
addEventListenersWithTouchSupport('increase5-bpm', () => updateBPM(5));

// BPM入力変更
document.getElementById('bpm-input').addEventListener('change', (event) => {
    const newValue = Number(event.target.value);
    currentBPM = Math.max(40, Math.min(240, newValue));
    if (metronomeRunning) {
        nextTickTime = Date.now();
        tick();
    }
});
