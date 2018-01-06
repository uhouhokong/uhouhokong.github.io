//----------------------------------------------------------------------
//          Playerクラス
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
                        [0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0]];
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
        this.sprite.image = this.images[0];
        this.sprite.regX = 50;  //this.sprite.image.width/2;
        this.sprite.regY = 180; //this.sprite.image.height;
    }
    get x() {return this.sprite.x;}             set x(val) {    this.sprite.x = val;}
    get y() {return this.sprite.y;}             set y(val) {    this.sprite.y = val;}

    draw(){
        this.sprite.draw();
    }

    beating(beat, clicked){
        if(clicked){
            if(this.playable){
                console.log(beat);
                effectManager.play("white",0,0);
                this.sprite.startAnim(new PopAnimation(this.sprite, 8));
            }
        }
        else{
            if(beat % 2 == 0)this.sprite.startAnim(new PopAnimation(this.sprite, 8, true, 0.46));
        }
        this.sprite.image = this.images[beat % this.images.length];
        
    }
}