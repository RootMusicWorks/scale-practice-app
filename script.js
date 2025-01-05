// 高精度メトロノーム用コード (バッファリングと先読みを実装)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let nextTickTime = 0;
let currentBPM = 90;
let metronomeRunning = false;
const scheduleAheadTime = 0.1;  // 100ms先読みバッファ
const lookahead = 25;           // 25msごとにチェック

// 音源ファイルの読み込み
let clickBuffer;
fetch('click.mp3')
    .then(response => response.arrayBuffer())
    .then(buffer => audioContext.decodeAudioData(buffer))
    .then(decodedData => clickBuffer = decodedData);

// 音源の再生
function playClickSound(time) {
    if (!clickBuffer) return;
    const clickSource = audioContext.createBufferSource();
    clickSource.buffer = clickBuffer;
    clickSource.connect(audioContext.destination);
    clickSource.start(time);
}

// スケジューリング
function scheduleTick(time) {
    playClickSound(time);
    nextTickTime += 60.0 / currentBPM;
}

// 先読みとバッファリング
function scheduler() {
    while (nextTickTime < audioContext.currentTime + scheduleAheadTime) {
        scheduleTick(nextTickTime);
    }
    if (metronomeRunning) {
        setTimeout(scheduler, lookahead);
    }
}

// メトロノームの開始
function startMetronome() {
    if (!metronomeRunning) {
        nextTickTime = audioContext.currentTime;
        metronomeRunning = true;
        scheduler();
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
    }
}

// イベントリスナー設定
addEventListenersWithTouchSupport('start-metronome', startMetronome);
addEventListenersWithTouchSupport('stop-metronome', stopMetronome);
addEventListenersWithTouchSupport('increase-bpm', () => updateBPM(currentBPM + 1));
addEventListenersWithTouchSupport('decrease-bpm', () => updateBPM(currentBPM - 1));

document.getElementById('bpm-input').addEventListener('change', (event) => {
    updateBPM(Number(event.target.value));
});
