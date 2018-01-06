function changeScene(nextScene){
    if(nextScene == null)return false;
    if(scene!=null)scene.end ();
    scene = nextScene;
    scene.wakeup();
    return true;
}

class Scene{//abstruct
    constructor(){
        this.frameCont = 0;
        //this.field = field; ~~~とかいって
    }
    wakeup(){}
    update(){this.frameCont++;}
    click(keyCode){
        //stage.setChildIndex(background.bitmap, (stage.getNumChildren())-1); //深度変更
        //effectManager.play("white", 0,0);
    }
    highUpdate(){}
    end(){}
}

class CautionScene extends Scene{
    constructor(){
        super();
        this.state = 0;
    }
    wakeup(){
        this.bg = new createjs.Shape();
        this.bg.graphics.beginFill("black").drawRect(0, 0, STAGE_W, STAGE_H);
        this.bg.alpha = 0.7;
        stage.addChild(this.bg);

        this.t = new createjs.Text("Hello World!", "30px sans-serif", "#FFFFFF");
        this.t.x = STAGE_W/2;
        this.t.y = STAGE_H/2;
        this.t.text = "このページは\"音\"を出して遊びます\n十分に音を鳴らせる環境をご用意ください";
        this.t.textAlign = "center";
        this.t.textBaseline = "middle";
        stage.addChild(this.t);

        this.buttons = [];
        this.buttons.push(new Button("確 認", STAGE_W/2, STAGE_H*15/18, this.toWait.bind(this)));
    }
    update(){
        super.update();
        if(this.state == 1 && this.frameCont - this.timeMarker > 20)changeScene(new WaitScene());
    }
    click(keyCode){
        
    }
    toWait(){
        this.state = 1;
        this.timeMarker = this.frameCont;
    }

    highUpdate(){

    }
    end(){
        this.buttons[0].destroy();
        stage.removeChild(this.bg);
        stage.removeChild(this.t);
    }
}

class WaitScene extends Scene{
    constructor(){
        super();
        this.state = 0;
        mainMusic.play();
    }
    wakeup(){
        this.bg = new createjs.Shape();
        this.bg.graphics.beginFill("black").drawRect(0, 0, STAGE_W, STAGE_H);
        this.bg.alpha = 0.7;
        stage.addChild(this.bg);

        this.t = new createjs.Text("Hello World!", "24px sans-serif", "#FFFFFF");
        this.t.x = STAGE_W/2;
        this.t.y = STAGE_H/2;
        this.t.text = "";
        this.t.textAlign = "center";
        this.t.textBaseline = "middle";
        stage.addChild(this.t);

        this.buttons = [];
        this.buttons.push(new Button("お仕事開始", STAGE_W/2, STAGE_H*15/18, this.toPlay.bind(this)));
        this.buttons.push(new Button("あそびかた", STAGE_W*15/17, STAGE_H*3/18, this.toPlay.bind(this), 0.5));
    }
    update(){
        super.update();
        if(this.state == 1 && this.frameCont - this.timeMarker > 20)changeScene(new PlayScene());
    }
    click(keyCode){
        
    }
    toPlay(){
        this.state = 1;
        this.timeMarker = this.frameCont;
    }

    highUpdate(){

    }
    end(){
        this.buttons[0].destroy();
        this.buttons[1].destroy();
        stage.removeChild(this.bg);
        stage.removeChild(this.t);
    }
}

class PlayScene extends Scene{
    constructor(){
        super();
    }
    wakeup(){
        mainMusic.startTerm++;
        mainMusic.changeTerm();
    }
    update(){
        
    }
    click(keyCode){
        
        if (keyCode == 16 || keyCode == -1) { // シフトキー/ クリック
            mainMusic.click();
        }
        else if (keyCode == 32) { // スペースキー
            mainMusic.startTerm = mainMusic.startTerm + 1;
        }
    }
    highUpdate(){

    }
}

var buttons = [];

function buttonDraw(){
    for(button of buttons)button.draw();
}

class Button{
    constructor(text, x, y, callback, scale = 1){
        this.callback = callback;
        this.cont;
        this.label;
        this.destroyed = false;
        this.cont = new createjs.Container();
        this.cont.cursor = "pointer"; // ホバー時にカーソルを変更する
        stage.addChild(this.cont);

        this.sprites = [];//0:ベース, 1,2:右上、左下
        for(let i=0; i<buttonImages.length; i++){
            this.sprites.push(new Sprite(this.cont, buttonImages[i]));
            if(i>0)this.sprites[i].bitmap.mouseEnabled = false;
        }

        this.label = new createjs.Text("Hello World!", "24px sans-serif", "#FFFFFF");
        this.label.color = "white";
        this.label.text = text;
        this.label.textAlign = "center";
        this.label.textBaseline = "middle";
        this.label.mouseEnabled = false;
        this.cont.addChild(this.label);

        this.x = x;
        this.y = y;
        this.scale = scale;
        for(let s of this.sprites)s.setAlignCenter();

        this.cont.addEventListener("click",     function(){this.click();    }.bind(this));
        this.cont.addEventListener("mouseover", function(){this.mouseOver();}.bind(this));
        this.cont.addEventListener("mouseout",  function(){this.mouseOut(); }.bind(this));

        buttons.push(this);
    }

    get x() {return this.cont.x;}
    set x(val) {    this.cont.x = val;}
    get y() {return this.cont.y;}
    set y(val) {    this.cont.y = val;}
    get scale() {return this.sprites[0].scale;}
    set scale(val) {    
        for(let i=0; i<this.sprites.length; i++){
            this.sprites[i].scaleX = val;
            this.sprites[i].scaleY = val;
        }
        this.label.scaleX = val * 1.12;
        this.label.scaleY = val * 1.12;
    }
    draw(){
        for(let sprite of this.sprites){
            sprite.draw();
        }
    }

    destroy(){
        for(let sprite of this.sprites){
            sprite.destroy();
        }
        stage.removeChild(this.cont);
        for(let i=0; i<buttons.length; i++){
            if(buttons[i] == this){
                buttons.splice(i--, 1);
                break;
            }
        }
        this.cont.removeAllEventListeners();
    }
    click(){
        ticktack(5);
        if(typeof this.callback == 'function')this.callback();
        this.sprites[1].startAnim(new MoveFromAnimation(this.sprites[1], 12, false, 1, -10, 4, 50, -20));
        this.sprites[2].startAnim(new MoveFromAnimation(this.sprites[2], 12, false, 1, 10, -4, -50, 20));
        this.sprites[1].startAnim(new FlashAnimation(this.sprites[1], 12, false));
        this.sprites[2].startAnim(new FlashAnimation(this.sprites[2], 12, false));
        this.sprites[0].bitmap.mouseEnabled = false;
    }
    mouseOver() {
        ticktack(6);
        this.expand = [];
        // this.expand.push(this.sprites[1].startAnim(new PopAnimation(this.sprites[1], 8, false)));
        this.expand.push(this.sprites[1].startAnim(new MoveToAnimation(this.sprites[1], 8, false, 1, -10, 4)));
        this.expand.push(this.sprites[2].startAnim(new MoveToAnimation(this.sprites[2], 8, false, 1, 10, -4)));
    }
    mouseOut() {
        this.expand[0].destroy();
        this.expand[1].destroy();
        this.sprites[1].startAnim(new MoveFromAnimation(this.sprites[1], 8, true, 1, -10, 4));
        this.sprites[2].startAnim(new MoveFromAnimation(this.sprites[2], 8, true, 1, 10, -4));
    }
}