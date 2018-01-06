var buttonImages = loadSerialImages("Images/button/", 3);

var seList = [];
function loadSeList() {
    seList.push("SE/car00.wav");
    seList.push("SE/clock02.wav");
    seList.push("SE/clock03.wav");
    seList.push("SE/clock04.wav");
    seList.push("SE/gun30_r.wav");
    seList.push("SE/kan05.wav");
    seList.push("SE/kachi28.wav");
    for (var i = 0; i < seList.length; i++) {
        createjs.Sound.registerSound(seList[i]);
    }
}

var scene;
var stage;
var effectManager;
var players = [];
var frameCount = 0;
var STAGE_W;
var STAGE_H;

var background;

function initStage(){//4キャラクタぶんのリズムパターンを渡すx
    effectManager = new EffectManager();
    $(function() {//jsonからいろいろと初期化
        $.getJSON("charaList.json" , function(data) {
            effectManager.init(data.effects);
        });
    });
    stage = new createjs.Stage("mainField");
    stage.enableMouseOver();
    var canvas = document.getElementById("mainField");
    STAGE_W = canvas.width;
    STAGE_H = canvas.height;

    background = new Sprite(stage, "Images/rafu.png");
        
    initPlayers();
    mainMusic = new Music(loadSound("nJ.wav"), 128);

    scene = new Scene();
}

function initPlayers(){
    players.push(new Player(true));
    players.push(new Player(false));
    players.push(new Player(false));
    players.push(new Player(false));
    
    $(function() {//jsonからいろいろと初期化
        $.getJSON("charaList.json" , function(data) {
            console.log(data.players);
            for(var i = 0; i < data.players.length; i++) {
                players[i].init(data.players[i]);
            }
        });
    });

    //dbのデータをここでインプットする
    // for(p of players){
    //     players.input();
    // }
}

function highUpdate() {
    scene.highUpdate();
    mainMusic.highUpdate();
    audioStateDisplay();
}

//音楽に関するあたり

var term = 0;
var A_BAR = 8;//小節ごとの単位
var termLen = [[A_BAR*2], [A_BAR*2], [A_BAR]];

var mainMusic;

function beating(term, beat, clicked){
    for(player of players)player.beating(term, beat, clicked);
}

function beyondTerm(preTerm, term){
    for(player of players)player.beyondTerm(preTerm, term);
}


//メイン処理
window.addEventListener("load", init);
function init() {
    loadSeList();

    var scoreNum = 0; // スコア
    initStage();
    //initStage();
    changeScene(new CautionScene());
    setInterval("highUpdate()", 50);

    // スコア欄を作成
    var score = new createjs.Text("あああ", "24px sans-serif", "white");
    stage.addChild(score);
    // タッチ操作も可能にする(iOS,Android向け)
    if (createjs.Touch.isSupported()) {
        createjs.Touch.enable(stage);
    }
    
    //イベントの登録
    stage.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    createjs.Ticker.setFPS(40);
    createjs.Ticker.addEventListener("tick", handleUpdate);

    function handleClick(event) {
        scene.click(-1);
    }

    function handleKeyDown(event) {
        var keyCode = event.keyCode;
        scene.click(event.keyCode);
     }

    function handleUpdate() {      
        scene.update();
        for(player of players)player.draw();

        effectManager.draw();
        buttonDraw();
            
        // 自機をマウス座標まで移動させる(減速で移動)
        // player.x += (stage.mouseX - player.x) * 0.1;
        // player.y += (stage.mouseY - player.y) * 0.1;
        frameCount++;
        
        // ステージの更新
        stage.update();
    }
    function showGameOver() {
        alert("ゲームオーバー！ あなたのスコアは " + scoreNum + " でした。");
        // 各種イベントをまとめて解除
        createjs.Ticker.removeAllEventListeners();
        window.removeAllEventListeners();
        stage.removeAllEventListeners();
    }
}



//音楽に関する事



var bgmInstance = null;
var BPM = 165.14;

window.onload = function () {
    // 使用するサウンドは事前に登録します。
    // 音声ファイルのパス、任意のIDを指定します。
    createjs.Sound.registerSound("nothing.wav");
    bgmInstance = createjs.Sound.createInstance("nothing.wav");
    
}

function audioStateDisplay(){
    var posit = bgmInstance.position;//念のためmainloop進行内での時間ブレをなくす
    if (bgmInstance != null) {
        document.getElementById("bgmInstance").textContent = mainMusic.audio;
        document.getElementById("bgmName").textContent = "" + mainMusic.audio.src;
        document.getElementById("bgmPaused").textContent = "" + mainMusic.audio.paused;
        document.getElementById("bgmPos").textContent = "" + mainMusic.audio.position;
        document.getElementById("bgmPlayed").textContent = "" + mainMusic.played;
        // document.getElementById("bgmTerm").textContent = "" + mainMusic.term;
        document.getElementById("bgmBeat").textContent = "" + mainMusic.beat;
    }
    else document.getElementById("bgmInstance").textContent = mainMusic.audio;
}

function playAndPauseSound() {
    // IDを使って再生します。
    mainMusic.play();
    // var playButton = document.getElementById("playButton");

    // if (bgmInstance.paused == false) {
    //     if (bgmInstance.position == 0) {
    //         BPM = parseFloat(document.js.bpmBox.value);
    //         document.js.bpmBox.disabled = "true";
    //         bgmInstance.play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, pan: 0.5 });//playは重複しても効果がない
    //         playButton.textContent = "楽曲を一時停止する";
    //     }
    //     else {
    //         bgmInstance.paused = true;
    //         playButton.textContent = "楽曲を再生する";
    //     }
    // }
    // else {
    //     bgmInstance.play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, pan: 0.5 });//playは重複しても効果がない
    //     playButton.textContent = "楽曲を一時停止する";
    // }
    //createjs.Sound.play("click");
}
function stopSound() {
    // IDを使って停止します。
    bgmInstance.stop();
    mainMusic.stop();
    document.js.bpmBox.disabled = "";
    playButton = document.getElementById("playButton").textContent = "楽曲を再生する";
}

function playSound(pass, loop_ = 0, pan_ = 0) {
    createjs.Sound.createInstance(pass).play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: loop_, pan: pan_ });//playは重
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