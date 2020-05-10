//https://editor.p5js.org/
//
let stage;

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

    this.players = [];
    this.players.push(new Player(this, 0, 1, 0, 2));
    this.players.push(new Player(this, 1, 4, 3, 0));
    this.players.push(new Player(this, 2, 1, 3, 0));
    this.players.push(new Player(this, 3, 4, 0, 2));

    this.objects = [];
    this.objects.push(new Money(this, 2, 1, 60));
    this.objects.push(new Money(this, 3, 2, 60));
    this.objects.push(new Money(this, 1, 1, 60));
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
    kc.init();
  }




  //その他

  
  //移動可能かどうかの判定など
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
      for(let j=0; j<this.objects.length; j++){
        let o = this.objects[j];
        if(o.movable)continue;
        if ((next[i][0] != o.x) || (next[i][1] != o.y))continue;
        next[i] = [this.players[i].x, this.players[i].y];
        type[i] = 2; //壁衝突
        
        if(o.constructor === Wall)o.hit();
      }
    }
    
    //wall の終了処理
    let walls = [];
    let brokenWall = [];
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].constructor === Wall) walls.push(this.objects[i]);
    }
    
    for (let i = 0; i < walls.length; i++) {
      if (walls[i].hp>0) continue;
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
          this.players[j].gainMoney(int(moneys[i].mass / 2));
          moneys[i].mass -= int(moneys[i].mass / 2);
        } else {
          this.players[j].gainMoney(int(moneys[i].mass));
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
    if(moneys.length < 3){
      if(random() > 0.5){
        //出現可能位置の探索
        let sponablePlaces = [];
        for(let i=0; i<this.wid; i++){
          for(let j=0; j<this.hig; j++){
            let flag = true;
            for(let k=0; k<this.players.length; k++){
              if((this.players[k].x-1 <= i && i <= this.players[k].x+1 && j == this.players[k].y)  ||
                 (this.players[k].y-1 <= j && j <= this.players[k].y+1 && i == this.players[k].x))
                flag = false;
            }
            for(let k=0; k<this.objects.length; k++){
              if((this.objects[k].x-1 <= i && i <= this.objects[k].x+1 && j == this.objects[k].y)  ||
                 (this.objects[k].y-1 <= j && j <= this.objects[k].y+1 && i == this.objects[k].x))
                flag = false;
            }
            if(flag)sponablePlaces.push([i,j]);
          }
        }
        
        
        //出現位置の抽選
        if(sponablePlaces.length>0){
          let idx = int(random(0, sponablePlaces.length));
          let pos = sponablePlaces[idx];
          print("マネーリスポン :"+pos[0]+", "+pos[1]);
          if(random() > 0.6){
            this.objects.push(new Money(this, pos[0], pos[1], 60 + 20*int(random(-1,3))));
          }else{
            if(walls.length<2)
            this.objects.push(new Wall(this, pos[0], pos[1], 3, 100 + 60*int(random(-1,2))));
          }
        }else{
          print("マネーリスポン不可");
        }
      }
    }

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
    text("turn:" + this.stepCount, this.x - this.size / 2, this.y - this.size / 2 - 2);
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
        this.stun = 3;
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
      ellipse(x + 5.0 * cos(rad), y + 5.0 * sin(rad), 30, 30);
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
    let y = height / 2 + 20;
    fill(this.myColor);
    strokeWeight(1);
    textAlign(LEFT, TOP);
    text("input: " + this.command + "\n" +
      "score: " + this.money + "\n" +
      "stun: " + this.stun + "\n" +
      "", x, y);

    x += (width - 40) / 8;
    y = height - (width - 40) / 8 - 20;
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
  
  hit(){
    this.hp--;
  }

  display() {
    this.__setDrawXY();
    
    fill(140 + 70.0 * max((3.0-this.hp)/3.0, 0));
    stroke(100);
    let siz = 34;
    rect(this.drawX - siz/2, this.drawY - siz/2 , siz, siz);
  }
}







function setup() {
  createCanvas(400, 400);
  stage = new Stage();
  kc = new KBController(stage);
}

function draw() {
  background(255);

  stage.update();


  stage.display();
  kc.display();
}



function keyPressed() {
  switch (keyCode) {
    case RETURN:
      stage.step();
      break;
    case SHIFT:
      kc.input(-2);
      break;
    case DELETE:
    case BACKSPACE:
      kc.input(-1);
      break;
    case CONTROL:
      kc.input(4);
      break;

  }

  let arrow = arrow2num(keyCode);
  if (arrow != null) kc.input(arrow);
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
    y = height - (width - 40) / 8 - 20;
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