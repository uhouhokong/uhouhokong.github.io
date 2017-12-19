class MyCursor{
	constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.visco = 1;
  }
  
  draw(){
  	if(this.visco == 1){
    	this.x = mouseX;
      this.y = mouseY;
    }else{
      this.x += (mouseX - this.x) * 0.1 / this.visco;
      this.y += (mouseY - this.y) * 0.1 / this.visco;
    }
  
  	fill(255);
    stroke(0);
    strokeWeight(0.4);
    ellipse(this.x,this.y,this.r*2, this.r*2);
    noStroke();
    fill(210,8,13);
    ellipse(this.x,this.y,this.r*1.3, this.r*1.3);
  }
}

class Area{
	constructor(cx, cy, wid, hig, visco, color, soundName, soundRate){
    this.x = cx - wid/2;
    this.y = cy - hig/2;
    this.wid = wid;
    this.hig = hig;
    this.visco = visco;//viscocity: 粘度 の意
    this.color = color;
    this.sound = loadSound(soundName);
    this.soundRate = soundRate;
  }
  
  mouseover(x, y){
  	return (x > this.x && x < this.x + this.wid && y > this.y && y < this.y + this.hig);
  }
  draw(){
    noStroke();
  	fill(this.color);
  	rect(this.x,this.y,this.wid,this.hig);
  }
  
}

var areas =[];
var playingSound;
var playingRate;
var myCursor;

function setup() {
  createCanvas(1080, 720);
  //音声ファイル名は"sound_<再生倍率(百分率)>.wav"で
  //areas[]はマウスオーバーの優先度順(降順)にソートされています
  areas.push(new Area(width/4, height/2, width/3, height/2, 1.2, color(200, 230, 180), "sound_70.mp3", 0.7));
  areas.push(new Area(width*3/4, height/2, width/3, height/2, 3, color(130, 120, 170), "sound_45.mp3", 0.45));
  areas.push(new Area(0, 0, width*2, height*2, 1, color(250,250,250), "sound_100.mp3", 1));
  myCursor = new MyCursor(0,0,6.5);
  noCursor();
}

function draw() {
	background(255);
	for(let i=0; i<areas.length; i++){//順走査
  	if(areas[i].mouseover(myCursor.x, myCursor.y)){
      myCursor.visco = areas[i].visco;
      if(playingSound!=areas[i].sound)changeSound(playingSound, playingRate, areas[i].sound, areas[i].soundRate);
      break;
    }
  }
  rect(20,10,10,10);
  //
  for(let i=areas.length-1; i>=0; i--) areas[i].draw();//逆走査
  myCursor.draw();
  
  
  
  rect(10,10,10,10);
}

function mouseClicked(){
	text("こんにちは", mouseX, mouseY);
}


//音声の再生に関するいくつか

function loadSound(name){//ファイル読み込み
  createjs.Sound.registerSound(name);
  return createjs.Sound.createInstance(name);
}

function changeSound(current, currentRate, next, nextRate){//
  if(current == undefined)return;
  let nextPos = current.position * (currentRate / nextRate);
  console.log(current, currentRate, next, nextRate);
  current.stop();
  next.play({ interrupt: createjs.Sound.INTERRUPT_ANY, offset:nextPos, loop: -1, pan: 0 });
  playingSound = next;
  playingRate = nextRate;
}

window.onload = function () {
  // 使用するサウンドは事前に登録します。
  // 音声ファイルのパス、任意のIDを指定します。
  playingSound = loadSound("sound_100.mp3");
  playingRate = 1;
  setInterval("mainLoop()", 100);
  }

  var prePosit;//mainLoop一回につき逐一記録
function mainLoop() {
  var posit = playingSound.position;//念のためmainloop進行内での時間ブレをなくす
  if (playingSound != null) {
      document.getElementById("playingSound").textContent = playingSound;
      document.getElementById("bgmName").textContent = "" + playingSound.src;
      document.getElementById("bgmPaused").textContent = "" + playingSound.paused;
      document.getElementById("bgmPos").textContent = "" + playingSound.position;
  }
  else document.getElementById("playingSound").textContent = playingSound;
  prePosit = posit;
}

function playAndPauseSound() {
  // IDを使って再生します。
  var playButton = document.getElementById("playButton");

  if (playingSound.paused == false) {
      if (playingSound.position == 0) {
          BPM = parseFloat(document.js.bpmBox.value);
          document.js.bpmBox.disabled = "true";
          playingSound.play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, pan: 0 });//playは重複しても効果がない
          playButton.textContent = "楽曲を一時停止する";
      }
      else {
          playingSound.paused = true;
          playButton.textContent = "楽曲を再生する";
      }
  }
  else {
      playingSound.play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, pan: 0.5 });//playは重複しても効果がない
      playButton.textContent = "楽曲を一時停止する";
  }
}
function stopSound() {
  // IDを使って停止します。
  playingSound.stop();
  document.js.bpmBox.disabled = "";
  playButton = document.getElementById("playButton").textContent = "楽曲を再生する";
}

function playSound(pass, loop_ = 1, pan_ = 0.5) {
  createjs.Sound.createInstance(pass).play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: loop_, pan: pan_ });//playは重
}