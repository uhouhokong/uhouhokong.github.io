//utility
var onServerVersion = false;

//データ型に関すること~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//プレイヤー
var Player = function(){
    // if(!(this instanceof Player)) return new Player();// new のつけ忘れ時の不具合を矯正

    //コンストラクタ
    var Player = function(playable){
        //システム的状態
        this.playable = playable; //
        this.id = 0;
        this.state = 0;
        this.input =   [[0,0,1,0,0,0,1,0,0,1,0,1,0,0,1,0],
                        [0,0,1,1,0,0,1,0,0,1,0,0,0,0,1,1],
                        [0,0,1,0,0,0,1,1]];
        //描画関係
        this.x = 0;
        this.y = 0;
        this.wid = 60;
        this.hig = 90;

        this.sprite = new createjs.Shape();
        this.sprite.graphics.beginFill("white").moveTo(5, 0).lineTo(-10, +5).lineTo(-10, -5).closePath();
        stage.addChild(this.sprite);
    }

    //各メソッドの実装
    var p = Player.prototype;
    p.init = function(data){//jsonオブジェクトからいろいろと初期設定
        this.id = data.id;
        this.x = data.x * STAGE_W;
        this.y = data.y * STAGE_H;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        alert(data.x);
    }


    return Player;
}

//リソース雛形
var Resourse = function Resourse(){

}





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

var stage;
var players = [];
var frameCount;
var STAGE_W;
var STAGE_H;

function initStage(){//4キャラクタぶんのリズムパターンを渡すx
    stage = new createjs.Stage("mainField");
    var canvas = document.getElementById("mainField");
    STAGE_W = canvas.width;
    STAGE_H = canvas.height;

    var bg = new createjs.Shape();
    bg.graphics.beginFill("black").drawRect(0, 0, STAGE_W, STAGE_H);
    // if(onServerVersion) bg = new createjs.Bitmap("Images/rafu.png");
    stage.addChild(bg);
    
    players.push(new Player(true));
    players.push(new Player(false));
    players.push(new Player(false));
    players.push(new Player(false));
    
    $(function() {//jsonからいろいろと初期化
        alert("あ");
        $.getJSON("charaList.json" , function(data) {
            alert("son");
            for(var i = 0; i < data.players.length; i++) {
                alert(i);
                players[i].init(data[i]);
            }
        });
    });
}

//音楽に関するあたり

var term = 0;
var A_BAR = 8;//小節ごとの単位
var termLen = [[A_BAR*2], [A_BAR*2], [A_BAR]];

//メイン処理
window.addEventListener("load", init);
    function init() {
        //背景
        // var stage = new createjs.Stage("mainField");
        var players = []; // 敵の配列
        var bulletList = []; // 発射弾の配列
        // var count = 0; // フレーム番号
        var scoreNum = 0; // スコア
        initStage();

        // 自機を作成
        var player = new createjs.Shape();
        player.graphics.beginFill("white").moveTo(5, 0).lineTo(-10, +5).lineTo(-10, -5).closePath();
        stage.addChild(player);
        // スコア欄を作成
        var score = new createjs.Text("あああ", "24px sans-serif", "white");
        stage.addChild(score);
        // タッチ操作も可能にする(iOS,Android向け)
        if (createjs.Touch.isSupported()) {
        createjs.Touch.enable(stage);
        }
        // マウスイベントの登録
        stage.addEventListener("click", handleClick);
        // tick イベントの登録
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", handleTick);

        // クリックした時の処理
        function handleClick(event) {
        }

        // tick イベントの処理
        function handleTick() {
        // 自機をマウス座標まで移動させる(減速で移動)
        player.x += (stage.mouseX - player.x) * 0.1;
        player.y += (stage.mouseY - player.y) * 0.1;
        // フレーム番号を更新(インクリメント)
        frameCount = frameCount + 1;
        
        // ステージの更新
        stage.update();
        }
        function showGameOver() {
        alert("ゲームオーバー！ あなたのスコアは " + scoreNum + " でした。");
        // 各種イベントをまとめて解除
        createjs.Ticker.removeAllEventListeners();
        stage.removeAllEventListeners();
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