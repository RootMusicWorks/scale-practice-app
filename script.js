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
let nextTickTime = 0; // 次のクリック音の時間
let clickAudio = new Audio('click.mp3'); // 音源のロード

// メトロノームの再生を開始
function playClickSound() {
  clickAudio.currentTime = 0; // 音源の先頭に戻す
  clickAudio.play().catch(e => {
    console.error("Error playing audio:", e); // 音の再生に失敗した場合のエラーハンドリング
  });
}

function startMetronome() {
  nextTickTime = Date.now(); // 最初のtickの時刻
  tick(); // メトロノームの最初のtick
}

function tick() {
  let currentTime = Date.now();
  if (currentTime >= nextTickTime) {
    playClickSound();
    nextTickTime = currentTime + (60000 / currentBPM);  // 次のクリック音のタイミングを設定
  }

  // ループして次のtickをスケジュール
  requestAnimationFrame(tick);
}

function stopMetronome() {
  cancelAnimationFrame(nextTickTime);
}

function updateBPM(value) {
  currentBPM = Math.max(40, Math.min(240, currentBPM + value));
  document.getElementById('bpm-input').value = currentBPM;
  if (nextTickTime) {
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
  イベントリスナー
==================================== */
document.getElementById('generate-task').addEventListener('click', generateTask);
document.getElementById('stop-task-metronome').addEventListener('click', stopMetronome);
document.getElementById('resume-task-metronome').addEventListener('click', startMetronome);

document.getElementById('start-metronome').addEventListener('click', startMetronome);
document.getElementById('stop-metronome').addEventListener('click', stopMetronome);

// BPM増減
document.getElementById('decrease-bpm').addEventListener('click', () => updateBPM(-1));
document.getElementById('increase-bpm').addEventListener('click', () => updateBPM(1));
document.getElementById('decrease5-bpm').addEventListener('click', () => updateBPM(-5));
document.getElementById('increase5-bpm').addEventListener('click', () => updateBPM(5));

// BPM 手入力
document.getElementById('bpm-input').addEventListener('change', (event) => {
  const newValue = Number(event.target.value);
  currentBPM = Math.max(40, Math.min(240, newValue));
  if (nextTickTime) {
    nextTickTime = Date.now();
    tick();
  }
});
