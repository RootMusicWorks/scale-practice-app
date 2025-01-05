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

// Web Audio APIのセットアップ
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let clickBuffer = null;  // 音源を格納するバッファ

// メトロノームの状態
let currentBPM = 90;
let nextTickTime = 0; // 次のクリック音の時間

// MP3 音源を読み込む
const clickAudio = new Audio('click.mp3');
clickAudio.addEventListener('canplaythrough', () => {
  const request = new XMLHttpRequest();
  request.open('GET', 'click.mp3', true);
  request.responseType = 'arraybuffer';
  request.onload = () => {
    audioContext.decodeAudioData(request.response, (buffer) => {
      clickBuffer = buffer; // 読み込んだ音源をバッファにセット
    }, (e) => {
      console.error("Error decoding audio data", e);
    });
  };
  request.send();
});

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
  メトロノーム関連
==================================== */
function playClickSound() {
  if (clickBuffer) {
    const clickSource = audioContext.createBufferSource();
    clickSource.buffer = clickBuffer;
    clickSource.connect(audioContext.destination);
    clickSource.start(0);
  } else {
    console.error("Audio buffer is not loaded yet.");
  }
}

function startMetronome() {
  nextTickTime = audioContext.currentTime; // 最初のtickの時刻
  tick(); // メトロノームの最初のtick
}

function tick() {
  if (audioContext.currentTime >= nextTickTime) {
    playClickSound();
    nextTickTime = audioContext.currentTime + (60 / currentBPM);  // 次のクリック音のタイミングを設定
  }
  
  // ループして次のtickをスケジュール
  requestAnimationFrame(tick);
}

function stopMetronome() {
  // メトロノームを停止
  cancelAnimationFrame(nextTickTime);
}

function updateBPM(value) {
  currentBPM = Math.max(40, Math.min(240, currentBPM + value));
  document.getElementById('bpm-input').value = currentBPM;
  // メトロノームが動いていれば BPM 変更を即反映
  if (nextTickTime) {
    nextTickTime = audioContext.currentTime;
    tick();
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
    nextTickTime = audioContext.currentTime;
    tick();
  }
});
