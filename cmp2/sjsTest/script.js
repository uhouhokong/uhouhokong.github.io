//window.addEventListener("load", init);
var bgmInstance = null;
var BPM = 165.14;
var seList = [];
function loadSeList() {
    seList.push("SE/car00.wav");
    seList.push("SE/clock02.wav");
    seList.push("SE/clock03.wav");
    seList.push("SE/clock04.wav");
    seList.push("SE/gun30_r.wav");
    for (var i = 0; i < seList.length; i++) {
        createjs.Sound.registerSound(seList[i]);
    }
}

window.onload = function () {
    // 使用するサウンドは事前に登録します。
    // 音声ファイルのパス、任意のIDを指定します。
    createjs.Sound.registerSound("nc126967_165.wav");
    bgmInstance = createjs.Sound.createInstance("nc126967_165.wav");
    loadSeList();
    setInterval("mainLoop()", 10);
}

function detectBPM() {
    // var bpmBox = document.js.bpmBox.value;

}

function playAndPauseSound() {
    // IDを使って再生します。
    var playButton = document.getElementById("playButton");

    if (bgmInstance.paused == false) {
        if (bgmInstance.position == 0) {
            BPM = parseFloat(document.js.bpmBox.value);
            document.js.bpmBox.disabled = "true";
            bgmInstance.play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, pan: 0.5 });//playは重複しても効果がない
            playButton.textContent = "楽曲を一時停止する";
        }
        else {
            bgmInstance.paused = true;
            playButton.textContent = "楽曲を再生する";
        }
    }
    else {
        bgmInstance.play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, pan: 0.5 });//playは重複しても効果がない
        playButton.textContent = "楽曲を一時停止する";
    }
    //createjs.Sound.play("click");
}
function stopSound() {
    // IDを使って停止します。
    bgmInstance.stop();
    document.js.bpmBox.disabled = "";
    playButton = document.getElementById("playButton").textContent = "楽曲を再生する";
}

function playSound(pass, loop_ = 1, pan_ = 0.5) {
    createjs.Sound.createInstance(pass).play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: loop_, pan: pan_ });//playは重
}

var prePosit;//mainLoop一回につき逐一記録
function mainLoop() {
    var posit = bgmInstance.position;//念のためmainloop進行内での時間ブレをなくす
    if (bgmInstance != null) {
        document.getElementById("bgmInstance").textContent = bgmInstance;
        document.getElementById("bgmName").textContent = "" + bgmInstance.src;
        document.getElementById("bgmPaused").textContent = "" + bgmInstance.paused;
        document.getElementById("bgmPos").textContent = "" + bgmInstance.position;
    }
    else document.getElementById("bgmInstance").textContent = bgmInstance;

    metronome(posit, BPM);
    prePosit = posit;
}

function ticktack(num) {
    playSound(seList[num]);
}


function metronome(posit, bpm) {
    var split = 4;
    var spb = 1 / (bpm / 60) * 1000 * split;
    var bps = (bpm / 60) / 1000 / split;
    var beat = Math.floor(posit / spb);

    var eventList = [0, 0.5, 1, 1.5, 1.75, 2.0, 2.25, 2.5, 3.0, 3.5, 3.75];
    for (var i = 0; i < eventList.length; i++) {
        var dist = posit - prePosit;
        var ratio = (posit % spb) / spb;
        var preRatio = ((posit % spb) - dist) / spb;
        if (preRatio <= eventList[i] / split && eventList[i] / split < ratio) {
            switch (i) {//アーメン
                case 0: ticktack(0); break;
                case 1: ticktack(0); break;
                case 2: ticktack(1); break;
                case 3: ticktack(2); break;
                case 4: ticktack(1); break;
                case 5: ticktack(0); break;
                case 6: ticktack(1); break;
                case 7: ticktack(2); break;
                case 8: ticktack(1); break;
                case 9: ticktack(0); break;
                case 10: ticktack(1); break;
            }
        }
    }
}