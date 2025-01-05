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

// メトロノーム関連
let metronomeInterval;
let currentBPM = 90;
let nextTickTime = 0;

// MP3 音源を読み込む
const clickAudio = new Audio('click.mp3');

/* ====================================
  初期化: 各チェックボックスの選択値を読み込む
==================================== */
function initializeSettings() {
  // スケール（ペンタ以外 + ペンタ）
  const scalesNonPenta = getCheckedValues('#scales-nonpenta input:checked');
  const scalesPenta = getCheckedValues('#scales-penta input:checked');
  settings.scales = scalesNonPenta.concat(scalesPenta);

  // キー
  settings.keys = getCheckedValues('#keys-suboptions input:checked');

  // スタートポジション
  settings.positionsNonPenta = getCheckedValues('#positions-nonpenta input:checked');
  settings.positionsPenta = getCheckedValues('#positions-penta input:checked');

  // フレーズ
  settings.phrasesNonPenta = getCheckedValues('#phrases-nonpenta input:checked');
  settings.phrasesPenta = getCheckedValues('#phrases-penta input:checked');

  // 連符
  settings.lenpu = getCheckedValues('#lenpu-suboptions input:checked');

  // BPM範囲
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
  順: スケール → キー → スタートポジション → フレーズ → 連符 → BPM
==================================== */
function generateTask() {
  initializeSettings();

  // スケール / キー / スタートポジション / フレーズ / 連符 が足りているかチェック
  if (!settings.scales.length || !settings.keys.length) {
    alert('スケールとキーのチェックを最低1つずつは入れてください。');
    return;
  }
  if (
    (!settings.positionsNonPenta.length && !settings.positionsPenta.length) ||
    (!settings.phrasesNonPenta.length && !settings.phrasesPenta.length) ||
    (!settings.lenpu.length)
  ) {
    alert('スタートポジションやフレーズがすべて未選択です。');
    return;
  }

  // スケール決定
  const selectedScale = getRandomItem(settings.scales);
  // 「ペンタ」を含むかどうか
  const isPenta = selectedScale.includes('ペンタ');

  // キー決定
  const selectedKey = getRandomItem(settings.keys);

  // スタートポジション / フレーズ
  let selectedPosition;
  let selectedPhrase;
  if (isPenta) {
    if (!settings.positionsPenta.length || !settings.phrasesPenta.length) {
      alert('ペンタ系のスタートポジションまたはフレーズが選択されていません。');
      return;
    }
    selectedPosition = getRandomItem(settings.positionsPenta);
    selectedPhrase = getRandomItem(settings.phrasesPenta);
  } else {
    if (!settings.positionsNonPenta.length || !settings.phrasesNonPenta.length) {
      alert('ペンタ以外のスタートポジションまたはフレーズが選択されていません。');
      return;
    }
    selectedPosition = getRandomItem(settings.positionsNonPenta);
    selectedPhrase = getRandomItem(settings.phrasesNonPenta);
  }

  // 4) 連符
  const selectedLenpu = getRandomItem(settings.lenpu);

  // BPM
  const randomBPM = getRandomBPM(settings.bpmRange.min, settings.bpmRange.max);

  // お題表示
  document.getElementById('scale-display').textContent = `スケール: ${selectedScale}`;
  document.getElementById('key-display').textContent = `キー: ${selectedKey}`;
  document.getElementById('position-display').textContent = `スタートポジション: ${selectedPosition}`;
  document.getElementById('phrase-display').textContent = `フレーズ: ${selectedPhrase}`;
  document.getElementById('lenpu-display').textContent = `連符: ${selectedLenpu}`;
  document.getElementById('bpm-display').textContent = `BPM: ${randomBPM}`;

  // メトロノームに反映 & 自動スタート
  updateBPM(randomBPM - currentBPM);
  startMetronome();
}

/* ====================================
  メトロノーム関連
==================================== */
function playClickSound() {
  // 音源を先頭に戻し、再生
  clickAudio.currentTime = 0;
  clickAudio.play().catch(e => {
    console.log("Audio play error:", e);  // 音が再生できない場合のエラーハンドリング
  });
}

function startMetronome() {
  nextTickTime = performance.now();  // 最初のtick時間を設定
  requestAnimationFrame(tick);  // メトロノームを開始
}

function tick(currentTime) {
  if (currentTime >= nextTickTime) {
    playClickSound();
    nextTickTime = currentTime + (60000 / currentBPM);  // 次のクリック音の時間を計算
  }
  requestAnimationFrame(tick);  // 継続的にtickを呼び出す
}

function stopMetronome() {
  cancelAnimationFrame(nextTickTime);  // メトロノームを停止
}

function updateBPM(value) {
  currentBPM = Math.max(40, Math.min(240, currentBPM + value));
  document.getElementById('bpm-input').value = currentBPM;
  // メトロノームが動いていれば BPM 変更を即反映
  if (nextTickTime) {
    nextTickTime = performance.now();
    requestAnimationFrame(tick);
  }
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
    nextTickTime = performance.now();
    requestAnimationFrame(tick);
  }
});
