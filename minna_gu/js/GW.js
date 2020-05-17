//https://editor.p5js.org/
//
let stage;

let missMoneyRate = 20;
let stunStepNum = 0;

class Stage {
  constructor() {
    this.__init();
  }

  __init() {
    this.wid = 6;
    this.hig = 4;

    this.x = 80;
    this.y = 60;
    this.size = 40;

    this.x = width / 2 - this.size * (this.wid) / 2 + this.size / 2;

    this.lastStepTime = 0;
    this.stepCount = 0;

    this.playersBuf = [];
    this.playersBuf.push(new Player(this, 0, 1, 0, 2));
    this.playersBuf.push(new Player(this, 1, 4, 3, 0));
    this.playersBuf.push(new Player(this, 2, 1, 3, 0));
    this.playersBuf.push(new Player(this, 3, 4, 0, 2));
    
    this.players = [];
    for(let i=0; i<4; i++)this.players.push(this.playersBuf[i]);
    

    this.objects = [];
    this.objects.push(new Money(this, 3, 2, 60));
    this.objects.push(new Money(this, 0, 1, 60));
    this.objects.push(new Wall(this, 2, 2, 3, 100));
    this.objects.push(new Wall(this, 5, 1, 3, 100));

  }

  //~~~~~~~~~~~~~~~~~~~~~~~~
  //       メイン処理
  //~~~~~~~~~~~~~~~~~~~~~~~~

  update() {}

  step() {
    let STEP_DELAY = 10;
    if (frameCount - this.lastStepTime > STEP_DELAY) this.__stepProcess();
  }

  //メインループ
  __stepProcess() {
    this.lastStepTime = frameCount;
    this.stepCount++;

    this.__playerMove();
    this.__moneyGetchu();


    for (let i = 0; i < this.players.length; i++) this.players[i].command = -1;
    //kc.init();
  }




  //その他


  //移動可能かどうかの判定など
  moneyMiss(p){
    if(p.money<=0)return;
    let points = []
    if(p.dir == 0 || p.dir == 2){//縦移動
      let pos;
      pos = [p.x-1, p.y];
      if(this.__objectCollision(pos)==null && this.__edgeCollision(pos)==false){
        points.push(pos);
      }
      pos = [p.x+1, p.y];
      if(this.__objectCollision(pos)==null && this.__edgeCollision(pos)==false){
        points.push(pos);
      }
      let i = p.dir - 1;
      pos = [p.x, p.y - i];
      if(this.__objectCollision(pos)==null && this.__edgeCollision(pos)==false){
        points.push(pos);
      }
    }
    else{//横移動
      let pos;
      pos = [p.x, p.y-1];
      if(this.__objectCollision(pos)==null && this.__edgeCollision(pos)==false){
        points.push(pos);
      }
      pos = [p.x, p.y+1];
      if(this.__objectCollision(pos)==null && this.__edgeCollision(pos)==false){
        points.push(pos);
      }
      let i = p.dir - 2;
      pos = [p.x+i, p.y];
      if(this.__objectCollision(pos)==null && this.__edgeCollision(pos)==false){
        points.push(pos);
      }
    }
    
    //お金を落とす
    let missMoney = int(p.money * (missMoneyRate / 100.0));
    if(points.length>=2){
      p.money -= missMoney;
      this.__moneyOverlay(points[0][0], points[0][1], int(missMoney/2));
      this.__moneyOverlay(points[1][0], points[1][1], int(missMoney/2));
    }else if (points.length==1){
      p.money -= missMoney;
      this.__moneyOverlay(points[0][0], points[0][1], int(missMoney/2));
    }
    
  }
  
  __moneyOverlay(x, y, mass){
    let moneys = [];
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].constructor === Money) moneys.push(this.objects[i]);
    }
    
    for (let i = 0; i < moneys.length; i++) {
      if (moneys[i].x == x && moneys[i].y == y){
        moneys[i].mass += mass;
        return;
      }
    }
    this.objects.push(new Money(this, x, y, mass));
  }
  
  __playerMove() {
    let next = [];
    let type = []; //衝突タイプ

    for (let i = 0; i < this.players.length; i++) {
      next.push(this.players[i].nextStep());
      type[i] = 0;

      if (next[i].length > 2) type[i] = 1; //静止

      //プレイヤーを除いた衝突判定
      if (this.__edgeCollision(next[i])) {
        next[i] = [this.players[i].x, this.players[i].y];
        type[i] = 2; //壁衝突
      }
      
      let o = this.__objectCollision(next[i]);
      
      
      if(o!=null) {
        next[i] = [this.players[i].x, this.players[i].y];
        type[i] = 2; //壁衝突

        if (o.constructor === Wall) o.hit();
      }
    }

    //wall の終了処理
    let walls = [];
    let brokenWall = [];
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].constructor === Wall) walls.push(this.objects[i]);
    }

    for (let i = 0; i < walls.length; i++) {
      if (walls[i].hp > 0) continue;
      brokenWall.push(walls[i]);
    }
    //リストから削除してゲーム中から完全に退場
    for (let k = 0; k < brokenWall.length; k++) {
      let idx = -1;
      for (let j = 0; j < this.objects.length; j++) {
        if (this.objects[j] == brokenWall[k]) idx = j;
      }
      let w = this.objects[idx];
      this.objects.splice(idx, 1);
      this.objects.push(new Money(this, w.x, w.y, w.mass));
    }


    //プレイヤー間の衝突判定

    {
      let playerCollidedCases = []; //何個の地点で同時衝突が起こったか
      let collided = [];
      for (let i = 0; i < this.players.length; i++) collided[i] = false;


      for (let i = 0; i < next.length - 1; i++) {
        if (type[i] != 0) continue;
        if (collided[i]) continue;
        let collidedPlayers = []; //何人が同じ地点で衝突したか

        for (let j = i + 1; j < next.length; j++) {
          if (type[j] != 0) continue;
          if (next[i][0] == this.players[j].x && next[j][0] == this.players[i].x)
            if (next[i][1] == this.players[j].y && next[j][1] == this.players[i].y) {
              //collidedPlayers=[];
              collidedPlayers.push(i);
              collidedPlayers.push(j);
              collided[i] = true;
              collided[j] = true;
              print(" pCollided: " + i + " : " + j + ", at: (" + next[i][0] + " : " + next[i][1] + "), (" + next[j][0] + " : " + next[j][1] + ")");
              break;
            }

          if ((next[i][0] == next[j][0]) && (next[i][1] == next[j][1])) {

            if (!collidedPlayers.includes(i)) collidedPlayers.push(i);
            collidedPlayers.push(j);
            collided[i] = true;
            collided[j] = true;
            print(" pCollided: " + i + " : " + j + ", at: (" + next[i][0] + " : " + next[i][1] + ")");
          }

        }
        if (collidedPlayers.length != 0) playerCollidedCases.push(collidedPlayers);
      }

      for (let i = 0; i < this.players.length; i++) {}


      if (playerCollidedCases != 0) {
        for (let k = 0; k < playerCollidedCases.length; k++) {
          for (let l = 0; l < playerCollidedCases[k].length; l++) {
            let idx = playerCollidedCases[k][l];
            next[idx] = [this.players[idx].x, this.players[idx].y];
            type[idx] = 3; //プレイヤー間衝突（正面衝突）
          }
        }
      }
    }


    //玉突き衝突の検出(本来は複数回やらなければならないが省略 本来のここのオーダーは[プレイヤー数]かも（要検討）)
    for (let h = 0; h < this.players.length; h++) {
      for (let i = 0; i < this.players.length; i++) {
        if (type[i] != 0) continue;
        for (let j = 0; j < this.players.length; j++) {
          if (i == j) continue;
          if (next[i][0] == next[j][0] && next[i][1] == next[j][1]) {
            next[i] = [this.players[i].x, this.players[i].y];
            type[i] = 4; //プレイヤー間衝突（玉突き衝突）
            break;
          }
        }
      }
    }


    let log = "衝突検出: step" + this.stepCount + " (";
    //適用
    for (let i = 0; i < this.players.length; i++) {
      log += type[i] + ", ";
      let dir = this.players[i].command;
      if (dir < 0 || dir > 3) dir = this.players[i].dir;
      this.players[i].refresh(next[i][0], next[i][1], dir, type[i]);
    }
    print(log + ")");

  }
  
  __objectCollision(posit){ //戻り値: Objects型
    for (let j = 0; j < this.objects.length; j++) {
        let o = this.objects[j];
        if (o.movable) continue;
        if ((posit[0] != o.x) || (posit[1] != o.y)) continue;
        return o;
    }
    return null;
  }

  __edgeCollision(posit) {
    if (posit[0] < 0 || posit[0] >= this.wid) return true;
    if (posit[1] < 0 || posit[1] >= this.hig) return true;
    return false;
  }

  //マネゲッチュ
  __moneyGetchu() {
    let moneys = [];
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].constructor === Money) moneys.push(this.objects[i]);
    }

    let gainedMoney = []; //list<Money>
    for (let i = moneys.length - 1; i >= 0; i--) { //
      //移動プレイヤーの処理が最優先
      let gained = false;
      for (let j = 0; j < this.players.length; j++) {
        if (this.players[j].x != moneys[i].x || this.players[j].y != moneys[i].y) continue;
        this.players[j].gainMoney(int(moneys[i].mass));
        gainedMoney.push(moneys[i]);
        gained = true;
        break;
      }
      if (gained) continue;

      //掠め取りの処理
      let aimedPlayer = [];
      for (let j = 0; j < this.players.length; j++) {
        // print(""+ j + " command: "+this.players[j].command);
        if (this.players[j].command != 4) continue;
        let aim = this.players[j].actionRange();

        for (let k = 0; k < aim.length; k++) {
          print("nerai: " + j + ": (" + aim[k][0] + "," + aim[k][1] + ")");
          if (aim[k][0] == moneys[i].x && aim[k][1] == moneys[i].y) {
            print("かすめ: " + j);
            aimedPlayer.push(j);
            break;
          }
        }
      }

      if (aimedPlayer.length == 0) continue;
      if (aimedPlayer.length == 1) {
        if (moneys[i].mass > 20) {
          this.players[aimedPlayer[0]].gainMoney(int(moneys[i].mass / 2));
          moneys[i].mass -= int(moneys[i].mass / 2);
        } else {
          this.players[aimedPlayer[0]].gainMoney(int(moneys[i].mass));
          gainedMoney.push(moneys[i]);
        }
      } else {
        for (let j = 0; j < aimedPlayer.length; j++) {
          this.players[aimedPlayer[j]].gainMoney(int(moneys[i].mass / aimedPlayer.length));
        }
        gainedMoney.push(moneys[i]);
      }
    }

    //リストから削除してゲーム中から完全に退場
    for (let k = 0; k < gainedMoney.length; k++) {
      let idx = -1;
      for (let j = 0; j < this.objects.length; j++) {
        if (this.objects[j] == gainedMoney[k]) idx = j;
      }
      this.objects.splice(idx, 1);
    }

    moneys = [];
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].constructor === Money) moneys.push(this.objects[i]);
    }
    let walls = [];
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].constructor === Wall) walls.push(this.objects[i]);
    }


    while (moneys.length + walls.length < 3) {
      if (!this.__moneyRespone(moneys, walls)) {
        break;
      }
    }
    if (moneys.length + walls.length < 5) {
      if (random() > 0.5) {
        this.__moneyRespone(moneys, walls);
      }
    }

  }

  __moneyRespone(moneys, walls) {
    //出現可能位置の探索
    let sponablePlaces = [];
    for (let i = 0; i < this.wid; i++) {
      for (let j = 0; j < this.hig; j++) {
        let flag = true;
        for (let k = 0; k < this.players.length; k++) {
          if ((this.players[k].x - 1 <= i && i <= this.players[k].x + 1 && j == this.players[k].y) ||
            (this.players[k].y - 1 <= j && j <= this.players[k].y + 1 && i == this.players[k].x))
            flag = false;
        }
        for (let k = 0; k < this.objects.length; k++) {
          if ((this.objects[k].x - 1 <= i && i <= this.objects[k].x + 1 && j == this.objects[k].y) ||
            (this.objects[k].y - 1 <= j && j <= this.objects[k].y + 1 && i == this.objects[k].x))
            flag = false;
        }
        if (flag) sponablePlaces.push([i, j]);
      }
    }


    //出現位置の抽選
    if (sponablePlaces.length > 0) {
      let idx = int(random(0, sponablePlaces.length));
      let pos = sponablePlaces[idx];
      print("マネーリスポン :" + pos[0] + ", " + pos[1]);
      if (random() > 0.6) {
        let o;
        if (moneys.length < 4){
          o = new Money(this, pos[0], pos[1], 60 + 20 * int(random(-1, 3)));
          this.objects.push(o);
          moneys.push(o);
        }
        else if (walls.length < 2){
          o = new Wall(this, pos[0], pos[1], 3, 100 + 60 * int(random(-1, 2)));
          this.objects.push(o);
          walls.push(o);
        }
      } else {
        if (walls.length < 2){
          let o = new Wall(this, pos[0], pos[1], 3, 100 + 60 * int(random(-1, 2)));
          this.objects.push(o);
          walls.push(o);
          
        }
      }
    } else {
      print("マネーリスポン不可");
      return false;
    }
    return true;

  }

  //~~~~~~~~~~~~~~~~~~~~~~~~
  //          描画
  //~~~~~~~~~~~~~~~~~~~~~~~~
  display() {
    this.__drawStage();

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].display();
    }
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].display();
    }





  }

  __drawStage() {
    let size = this.size;
    let x = this.x - size / 2;
    let y = this.y - size / 2;
    strokeWeight(2);
    for (let i = 0; i < this.wid + 1; i++)
      line(x + size * i, y, x + size * i, y + size * this.hig);
    for (let j = 0; j < this.hig + 1; j++)
      line(x, y + size * j, x + size * this.wid, y + size * j);
    textAlign(LEFT, BOTTOM);
    strokeWeight(1);
    text("turn:" + this.stepCount+
         " limit: "+(timer.limit-timer.count)+
         " mmRate: "+(missMoneyRate)+
         " stun...: "+(stunStepNum)+
         "", this.x - this.size / 2, this.y - this.size / 2 - 2);
    
  }
}










class Player {
  constructor(stage, id, x, y, dir) {
    this.__init(stage, id, x, y, dir);
  }

  __init(stage, id, x, y, dir) {
    //変数(システム)
    this.stage = stage;
    this.id = id;
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.command = -1;

    this.money = 0;
    this.stun = 0;



    //変数(描画)
    this.drawX = this.__drawX(this.x);
    this.drawY = this.__drawY(this.y);
    this.myColor = color(255);

    switch (this.id) {
      case 0:
        this.myColor = color(235, 80, 80);
        break;
      case 1:
        this.myColor = color(80, 80, 235);
        break;
      case 2:
        this.myColor = color(235, 175, 80);
        break;
      case 3:
        this.myColor = color(80, 235, 80);
        break;
    }
  }

  refresh(x, y, dir, colledType) {
    if (this.stun > 0) this.stun--;
    this.x = x;
    this.y = y;
    this.dir = dir;

    switch (colledType) {
      case 0:
      case 1:
        break;
      default:
        this.drawX += (this.__drawX(this.nextStep()[0]) - this.drawX) * 0.4;
        this.drawY += (this.__drawY(this.nextStep()[1]) - this.drawY) * 0.4;
        break;
    }

    switch (colledType) {
      case 3:
        this.stage.moneyMiss(this);
        this.stun = stunStepNum;
        break;
    }


    // this.command = -1;
  }


  nextStep() {
    let x = this.x;
    let y = this.y;
    if (this.stun > 0) {
      this.command = -1;
      return [x, y, 0];
    }
    let moved = true;
    switch (this.command) {
      case 0:
        y--;
        break;
      case 1:
        x++;
        break;
      case 2:
        y++;
        break;
      case 3:
        x--;
        break;
      default:
        moved = false;
        break;

    }
    if (moved) return [x, y];
    return [x, y, 0];
  }

  actionRange() {
    let range = [];
    switch (this.dir) {
      case 0:
        range.push([this.x, this.y - 1]);
        break;
      case 1:
        range.push([this.x + 1, this.y]);
        break;
      case 2:
        range.push([this.x, this.y + 1]);
        break;
      case 3:
        range.push([this.x - 1, this.y]);
        break;
    }
    return range;
  }

  gainMoney(mass) {
    this.money += mass;
  }



  //描画
  display() {
    this.drawX += (this.__drawX(this.x) - this.drawX) * 0.14;
    this.drawY += (this.__drawY(this.y) - this.drawY) * 0.14;
    fill(this.myColor);
    strokeWeight(2);
    if (this.stun > 0) fill(red(this.myColor) / 2.0, green(this.myColor) / 2.0, blue(this.myColor) / 2.0);
    ellipse(this.drawX, this.drawY, 25, 25);


    //進行方向ガイド
    fill(red(this.myColor), green(this.myColor), blue(this.myColor), 60);
    if (0 <= this.command && this.command <= 3) {
      let rad = radians(90.0 * this.command - 90);
      //ellipse(x + stage.size/2.0*cos(rad), y+ stage.size/2.0*sin(rad), 30, 30);
      rad = radians(90.0 * this.id - 90);
      let x = stage.x + this.nextStep()[0] * stage.size;
      let y = stage.y + this.nextStep()[1] * stage.size;
      noStroke();
      //ellipse(x + 5.0 * cos(rad), y + 5.0 * sin(rad), 30, 30);
      stroke(0);
    }

    //むている方向
    fill(this.myColor);
    let rad = radians(90.0 * this.dir - 90);
    ellipse(this.drawX + 10.0 * cos(rad), this.drawY + 10.0 * sin(rad), 8, 8);

    this.__displayControler();
  }

  __drawX(n) {
    return this.stage.x + n * this.stage.size;
  }
  __drawY(n) {
    return this.stage.y + n * this.stage.size;
  }

  __displayControler() {
    let x = 20 + (width - 40) / 4 * this.id;
    let y = height / 4 + 20;
    fill(this.myColor);
    strokeWeight(1);
    textAlign(LEFT, TOP);
    text("input: " + this.command + "\n" +
      "score: " + this.money + "\n" +
      "stun: " + this.stun + "\n" +
      "", x, y);

    x += (width - 40) / 8;
    y = height / 2 - (width - 40) / 8 - 20;
    fill(220);
    ellipse(x, y, (width - 40) / 6, (width - 40) / 6);
    if (this.command != -1) {
      fill(red(this.myColor), green(this.myColor), blue(this.myColor), 100);
      ellipse(x, y, (width - 40) / 6, (width - 40) / 6);
    }
  }

}


class Objects {
  constructor(stage, x, y) {
    this.__init(stage, x, y);
  }

  __init(stage, x, y) {
    //定数
    this.movable = false;

    //変数(システム)
    this.stage = stage;
    this.x = x;
    this.y = y;

    //変数(描画)
    this.drawX = this.__drawX(this.x);
    this.drawY = this.__drawY(this.y);

  }

  display() {}

  __setDrawXY() {
    this.drawX = this.__drawX(this.x);
    this.drawY = this.__drawY(this.y);
  }
  __drawX(n) {
    return this.stage.x + n * this.stage.size;
  }
  __drawY(n) {
    return this.stage.y + n * this.stage.size;
  }

  destroy() {

  }
}

class Money extends Objects {
  constructor(stage, x, y, mass) {
    super(stage, x, y);
    this.init(mass);
  }


  init(mass) {
    print(this.stage);
    //定数
    this.movable = true;
    //変数(システム)
    this.mass = mass;
  }

  display() {
    this.__setDrawXY();
    fill(250, 240, 140);
    stroke(100, 100, 0);
    if (this.mass > 40)
      ellipse(this.drawX + 4, this.drawY - 2, 8, 6.5);
    if (this.mass > 80)
      ellipse(this.drawX + 2, this.drawY + 3, 8, 6.5);
    ellipse(this.drawX - 2, this.drawY + 1, 8, 6.5);
  }
}


class Wall extends Objects {
  constructor(stage, x, y, hp, mass) {
    super(stage, x, y);
    this.init(hp, mass);
  }


  init(hp, mass) {
    //定数
    this.movable = false;
    //変数(システム)
    this.hp = hp;
    this.mass = mass;
  }

  hit() {
    this.hp--;
  }

  display() {
    this.__setDrawXY();

    fill(140 + 70.0 * max((3.0 - this.hp) / 3.0, 0));
    stroke(100);
    let siz = 34;
    rect(this.drawX - siz / 2, this.drawY - siz / 2, siz, siz);
  }
}







function setup() {
  createCanvas(400, 800);
  stage = new Stage();
  //kc = new KBController(stage);
  timer = new Timer(120);
  //makeButtons();
}

function draw() {
  background(255);

  stage.update();
  timer.update();


  stage.display();
  //for(let i=0; i<buttons.length; i++)buttons[i].display();
  //kc.display();
  timer.display();
  stroke(70);
}

function mousePressed() {
}

let delCount;
function keyPressed() {
  switch (keyCode) {

    case RETURN:
      if (!timer.counting) timer.countStart();
      else timer.countStop();
      break;
    case BACKSPACE:
      stage.__init();
      timer.countStop();
      break;
  }
  
  switch(key){
    case ",":
    if(!timer.counting)timer.limit-=10;
    break;
    case ".":
    if(!timer.counting)timer.limit+=10;
    break
    
    case "n":
    if(!timer.counting)missMoneyRate-=5;
    break;
    case "m":
    if(!timer.counting)missMoneyRate+=5;
    break
    
    case "v":
    if(!timer.counting)stunStepNum-=1;
    break;
    case "b":
    if(!timer.counting)stunStepNum+=1;
    break
    
    case "1":
    if(!timer.counting&&stage.stepCount==0){
      stage.players=[];
      for(let i=0; i<1; i++)stage.players.push(stage.playersBuf[i]);
      }
    break;
    case "2":
    if(!timer.counting&&stage.stepCount==0){
      stage.players=[];
      for(let i=0; i<2; i++)stage.players.push(stage.playersBuf[i]);
      }
    break
    case "3":
    if(!timer.counting&&stage.stepCount==0){
      stage.players=[];
      for(let i=0; i<3; i++)stage.players.push(stage.playersBuf[i]);
      }
    break;
    case "4":
    if(!timer.counting&&stage.stepCount==0){
      stage.players=[];
      for(let i=0; i<4; i++)stage.players.push(stage.playersBuf[i]);
      }
    break
  }
  multiPlayKeyInput();
}

function keyReleased() {
  multiPlayKeyRelease();
}

function multiPlayKeyInput() {
  let p;
  p = stage.players[0];
  switch (key) {
    case "w":
      p.command = 0;
      p.dir = 0;
      break;
    case "d":
      p.command = 1;
      p.dir = 1;
      break;
    case "s":
      p.command = 2;
      p.dir = 2;
      break;
    case "a":
      p.command = 3;
      p.dir = 3;
      break;
    case "e":
      p.command = 4;
      break;
  }

  p = stage.players[1];
  switch (key) {
    case "i":
      p.command = 0;
      p.dir = 0;
      break;
    case "l":
      p.command = 1;
      p.dir = 1;
      break;
    case "k":
      p.command = 2;
      p.dir = 2;
      break;
    case "j":
      p.command = 3;
      p.dir = 3;
      break;
    case "o":
      p.command = 4;
      break;
  }

  p = stage.players[2];
  switch (key) {
    case "t":
      p.command = 0;
      p.dir = 0;
      break;
    case "h":
      p.command = 1;
      p.dir = 1;
      break;
    case "g":
      p.command = 2;
      p.dir = 2;
      break;
    case "f":
      p.command = 3;
      p.dir = 3;
      break;
    case "y":
      p.command = 4;
      break;
  }

  p = stage.players[3];
  switch (keyCode) {
    case UP_ARROW:
      p.command = 0;
      p.dir = 0;
      break;
    case RIGHT_ARROW:
      p.command = 1;
      p.dir = 1;
      break;
    case DOWN_ARROW:
      p.command = 2;
      p.dir = 2;
      break;
    case LEFT_ARROW:
      p.command = 3;
      p.dir = 3;
      break;
    case SHIFT:
      p.command = 4;
      break;
  }
}

function multiPlayKeyRelease() {
  if (timer.limit - timer.count < timer.limit / 4) return;
  let p;
  p = stage.players[0];
  switch (key) {
    case "w":
    case "d":
    case "s":
    case "a":
    case "e":
      p.command = -1;
      break;
  }

  p = stage.players[1];
  switch (key) {
    case "i":
    case "l":
    case "k":
    case "j":
    case "o":
      p.command = -1;
  }

  p = stage.players[2];
  switch (key) {
    case "t":
    case "h":
    case "g":
    case "f":
    case "y":
      p.command = -1;
  }

  p = stage.players[3];
  switch (keyCode) {
    case UP_ARROW:
    case RIGHT_ARROW:
    case DOWN_ARROW:
    case LEFT_ARROW:
    case SHIFT:
      p.command = -1;
      break;
  }
}

class Timer {
  constructor(limit) {
    this.limit = limit;

    this.counting = false;
    this.count = 0;

    this.colorRate = [];
    this.colorRate.push(0);
    this.colorRate.push(0);
    this.colorRate.push(0);
    this.colorRate.push(0);
  }

  countStart() {
    this.counting = true;
    this.count = 0;
  }
  countStop() {
    this.counting = false;
    this.count = 0;
  }

  update() {
    if (!this.counting) return;
    this.count++;
    if (this.count == int(this.limit / 4 * 1)) this.colorRate[0] = 1.4;
    if (this.count == int(this.limit / 4 * 2)) this.colorRate[1] = 1.4;
    if (this.count == int(this.limit / 4 * 3)) this.colorRate[2] = 1.4;
    if (this.count >= this.limit) {
      this.colorRate[3] = 1.8;
      this.count %= this.limit;
      stage.step();
    }
    for (let i = 0; i < this.colorRate.length; i++) this.colorRate[i] *= 0.9;
  }

  display() {
    let i;
    stroke(70);

    i = 0;
    fill(255, 255 - 140 * this.colorRate[i], 255 - 140 * this.colorRate[i]);
    ellipse(40 + (width - 20) / 4 * i, height / 4 * 3, 40, 40);
    i = 1;
    fill(255, 255 - 140 * this.colorRate[i], 255 - 140 * this.colorRate[i]);
    ellipse(40 + (width - 20) / 4 * i, height / 4 * 3, 40, 40);
    i = 2;
    fill(255, 255 - 140 * this.colorRate[i], 255 - 140 * this.colorRate[i]);
    ellipse(40 + (width - 20) / 4 * i, height / 4 * 3, 40, 40);
    i = 3;
    fill(255, 255 - 140 * this.colorRate[i], 255 - 140 * this.colorRate[i]);
    ellipse(40 + (width - 20) / 4 * i, height / 4 * 3, 80, 80);
    fill(0);
  }
}

class Button {

  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color
  }

  display() {
    fill(this.color);
    stroke(150);
    ellipse(this.x, this.y, this.size * 2, this.size * 2);
  }

  isPressed(x, y) {
    return dist(x, y, this.x, this.y) < this.size;

  }

}

function makeButtons() {
  buttons = [];
  buttons.push(new Button(100, 600, 60, color(255, 160, 160)));
  buttons.push(new Button(300 - 20, 600 - 70, 30, color(160)));
  buttons.push(new Button(300 - 20 + 70, 600, 30, color(160)));
  buttons.push(new Button(300 - 20, 600 + 70, 30, color(160)));
  buttons.push(new Button(300 - 20 - 70, 600, 30, color(160)));

  buttons.push(new Button(300 - 20, 600, 30, color(200, 160, 200)));


  buttons.push(new Button(140, 600 - 120, 30, color(180, 160, 230)));
  buttons.push(new Button(300 - 20 + 70, 600 - 120, 30, color(100)));
}

class KBController {
  constructor(stage) {
    this.stage = stage;
    this.init();
  }

  init() {
    this.cursol = 0;
  }

  __cursolCountup() {
    this.cursol++;
    if (this.cursol >= stage.players.length) this.cursol = 0;
  }

  input(arrow) {
    if (arrow == -2) {
      this.__cursolCountup();
      return;
    }

    this.stage.players[this.cursol].command = arrow;
    this.__cursolCountup();
  }

  display() {

    let p = this.stage.players[this.cursol];
    let x = this.stage.x + p.x * this.stage.size;
    let y = this.stage.y + p.y * this.stage.size;
    // fill(p.myColor);
    stroke(255);
    let rad = radians(4.0 * frameCount);
    fill(red(p.myColor), green(p.myColor), blue(p.myColor), 120);
    ellipse(x, y, 38 + 2.0 * sin(rad), 38 + 2.0 * sin(rad));
    stroke(70);

    x = 20 + (width - 40) / 4 * this.cursol;
    x += (width - 40) / 8;
    y = height / 2 - (width - 40) / 8 - 20;
    fill(p.myColor);
    ellipse(x, y, (width - 40) / 6, (width - 40) / 6);


  }

}



//べんり
function arrow2num(keycode) {
  let a = null;
  switch (keycode) {
    case UP_ARROW:
      a = 0;
      break;
    case RIGHT_ARROW:
      a = 1;
      break;
    case DOWN_ARROW:
      a = 2;
      break;
    case LEFT_ARROW:
      a = 3;
      break;
  }
  return a;
}