//utility
var onServerVersion = true;

//----------------------------------------------------------------------
//                              クラス設計
//----------------------------------------------------------------------

//プレイヤー
class Player{
    // if(!(this instanceof Player)) return new Player();// new のつけ忘れ時の不具合を矯正

    //コンストラクタ
    constructor(playable){
        //システム的状態
        this.playable = playable; //
        this.id = 0;
        this.state = 0;
        this.input =   [[0,0,1,0,0,0,1,0,0,1,0,1,0,0,1,0],
                        [0,0,1,1,0,0,1,0,0,1,0,0,0,0,1,1],
                        [0,0,1,0,0,0,1,1]];
        //リソース
        this.images = [];
        this.sounds = [];

        //描画関係

        this.sprite = new Sprite(stage, new createjs.Bitmap());
    }
    init(data){//jsonオブジェクトからいろいろと初期設定
        this.id = data.id;
        this.x = data.x * STAGE_W;//グローバル変数
        this.y = data.y * STAGE_H;//グローバル変数
        this.images = loadSerialImages(data.imagesFolder, data.imagesNum);
        // this.sprite.image = this.images[0];
        this.sprite.regX = 50;  //this.sprite.image.width/2;
        this.sprite.regY = 180; //this.sprite.image.height;
    }
    get x() {return this.sprite.x;}             set x(val) {    this.sprite.x = val;}
    get y() {return this.sprite.y;}             set y(val) {    this.sprite.y = val;}

    draw(){
        this.sprite.draw();
    }

    beating(beat){
        //this.sprite.image = this.images[beat % this.images.length];
        if(beat % 2 == 0)
        this.sprite.startAnim(new PopAnimation(this.sprite, 8));
    }
}

//リソース雛形t
function loadSerialImages(pass, num, digit = 3, extens = "png"){
    var ret = [];
    for(let i=0; i<num; i++){
        let pa = pass + zeroFilled(i, digit) + "." + extens;
        ret.push(new createjs.Bitmap(pa).image);
    }
    return ret;
}
function zeroFilled(num, digit){
    var text ="";
    for(var i=0; i<digit - retDigit(num);i++)text = text+"0";
    return text+num;
}
function retDigit(num){
    var digit = 1;
    var _num = num;
    while(_num/10 >= 1){
        digit++;
        _num = _num/10;
    }
    return digit;
}


//----------------------------------------------------------------------
//                          クラス設計おわり
//----------------------------------------------------------------------






















//window.addEventListener("load", init);

var buttonImages = loadSerialImages("images/button/", 3);

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
    mainMusic = new Music(loadSound("iwashii.wav"), 120);
    mainMusic.play();

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
}

function highUpdate() {
    scene.highUpdate();
    metronomo();
    mainMusic.highUpdate();
    audioStateDisplay();
}

//音楽に関するあたり

var term = 0;
var A_BAR = 8;//小節ごとの単位
var termLen = [[A_BAR*2], [A_BAR*2], [A_BAR]];

var mainMusic;

function beating(beat){
    for(player of players)player.beating(beat);
}


//メイン処理
window.addEventListener("load", init);
function init() {
    loadSeList();

    var scoreNum = 0; // スコア
    initStage();
    changeScene(new WaitScene());
    setInterval("highUpdate()", 50);

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
    createjs.Ticker.setFPS(40);
    createjs.Ticker.addEventListener("tick", handleUpdate);

    // クリックした時の処理
    function handleClick(event) {
        scene.click();
    }

    // tick イベントの処理
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
        stage.removeAllEventListeners();
    }
}



//音楽に関する事

var registedSounds = [];

//同一名のものは一度だけレジスタに登録し、インスタンスを返す
function loadSound(name){
    if(registedSounds.indexOf(name) == -1){
        createjs.Sound.registerSound(name);
        registedSounds.push(name);
    }
    return createjs.Sound.createInstance(name);
}

//楽曲 とされるハイコンテキストな集合体
class Music{
    constructor(audio, bpm = 120){
        //楽曲のユニーク値、一度生成されたのち固定である
        this.audio = audio;
        this.bpm = bpm;         //1beat = 4分音譜一つ
        this.measure4 = 4;      //一小節の拍子数。4分の...で記述
        this.termSplit = 8;     //一小節の区切り数
        this.terms = [2,2,1];   //〜の設定
        //状態
        this.prePosit = 0;
        this.preBeat = 0;
        this.playOrdered = false;

        this.term = 0;
    }

    //小節ループ、判定など高解像度でやった方が良いもの
    highUpdate(){
        if(this.playOrdered != this.played)this.play();

        this.prePosit = this.audio.position;
        this.preBeat = this.beat;
    }

    get played(){
        return !(this.audio.paused || this.audio.position == 0);
    }

    get beat(){
        var split = this.measure4 / this.termSplit;
        var spb = 1 / (this.bpm / 60) * 1000 * split;
        var bps = (this.bpm / 60) / 1000 / split;
        var beat = this.audio.position / spb;
        return beat;
    }
    // get term(){
    //     return 1;
    // }

    play(){
        this.preBeat = -0.5;
        this.audio.play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, pan: 0.5 });
        this.playOrdered = true;
    }
    stop(){
        this.audio.stop();
        this.playOrdered = false;
    }
}


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

function playSound(pass, loop_ = 0, pan_ = 0.5) {
    createjs.Sound.createInstance(pass).play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: loop_, pan: pan_ });//playは重
}

function ticktack(num) {
    playSound(seList[num]);
}

function metronomo() {
    var music = mainMusic;
    var pre = music.preBeat+0.07;
    var cur = music.beat+0.07;
    if(Math.floor(pre)!=Math.floor(cur)){
        ticktack(0);
        beating(Math.floor(cur));
    }
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