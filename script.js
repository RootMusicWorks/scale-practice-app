// メトロノーム用のオーディオコンテキストを使用
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let nextTickTime = 0;
let currentBPM = 90;
let metronomeRunning = false;

// 音源ファイルの読み込み
let clickBuffer;
fetch('click.mp3')
    .then(response => response.arrayBuffer())
    .then(buffer => audioContext.decodeAudioData(buffer))
    .then(decodedData => clickBuffer = decodedData);

// 正確にクリック音を再生する関数
function playClickSound(time) {
    if (!clickBuffer) return;
    const clickSource = audioContext.createBufferSource();
    clickSource.buffer = clickBuffer;
    clickSource.connect(audioContext.destination);
    clickSource.start(time);
}

// メトロノームの開始
function startMetronome() {
    if (!metronomeRunning) {
        metronomeRunning = true;
        nextTickTime = audioContext.currentTime;
        scheduleTicks();
    }
}

// スケジューラー: 正確なタイミングでクリック音を鳴らす
function scheduleTicks() {
    while (nextTickTime < audioContext.currentTime + 0.1) {
        playClickSound(nextTickTime);
        nextTickTime += 60.0 / currentBPM;
    }
    if (metronomeRunning) {
        setTimeout(scheduleTicks, 25); // 25msごとにチェック
    }
}

// メトロノームの停止
function stopMetronome() {
    metronomeRunning = false;
}

// BPMの変更
function updateBPM(value) {
    currentBPM = Math.max(40, Math.min(240, value));
    document.getElementById('bpm-input').value = currentBPM;
    if (metronomeRunning) {
        nextTickTime = audioContext.currentTime;
        scheduleTicks();
    }
}

// イベントリスナーの追加
addEventListenersWithTouchSupport('start-metronome', startMetronome);
addEventListenersWithTouchSupport('stop-metronome', stopMetronome);
addEventListenersWithTouchSupport('increase-bpm', () => updateBPM(currentBPM + 1));
addEventListenersWithTouchSupport('decrease-bpm', () => updateBPM(currentBPM - 1));

document.getElementById('bpm-input').addEventListener('change', (event) => {
    updateBPM(Number(event.target.value));
});
