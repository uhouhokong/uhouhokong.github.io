//----------------------------------------------------------------------
//          Playerクラス
//----------------------------------------------------------------------

//プレイヤー
class Player{
    //コンストラクタ
    constructor(playable){
        //システム状態
        this.playable = playable; 
        this.id = 0;
        this.state = 0;
        // this.recipe =   [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        //                 [0,0,1,0,0,0,1,0,0,1,0,1,0,0,1,0],//playableは使わない
        //                 [0,0,1,1,0,0,1,0,0,1,0,0,0,0,1,1],
        //                 [0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0]];
        
        this.focusTerm = 0;
        //リソース
        this.images = [];
        this.sounds = [];

        //描画関係

        this.sprite = new Sprite(stage, new createjs.Bitmap());
    }
    init(data){//jsonオブジェクト
        this.id = data.id;
        this.x = data.x * STAGE_W;//グローバル変数
        this.y = data.y * STAGE_H;//グローバル変数
        this.images = loadSerialImages(data.imagesFolder, data.imagesNum);
        this.sprite.image = this.images[0];
        this.sprite.regX = 50;  //this.sprite.image.width/2;
        this.sprite.regY = 180; //this.sprite.image.height;
        
        this.tickNum = data.tick;
        this.recipe = data.recipe;
        console.log(this.id, this.recipe);
        this.input =   [];
        for(let i=0; i<this.recipe.length; i++)this.input.push([]);
    }
    get x() {return this.sprite.x;}             set x(val) {    this.sprite.x = val;}
    get y() {return this.sprite.y;}             set y(val) {    this.sprite.y = val;}

    draw(){
        this.sprite.draw();
    }

    beyondTerm(preTerm, term){
        this.input[term] = [];
        for(let i=0; i < mainMusic.beatLenAt(term); i++)this.input[term][i] = 0;
        this.focusTerm = term;
        // console.log(" "+preTerm+" -> "+term);
        // console.log(this.input[preTerm]);
        // console.log(this.recipe[term]);
    }
    beating(term, beat, clicked){
        var cl = 0;

        if(this.playable){
            if(clicked){
                cl = 1;
                console.log(beat);
                effectManager.play("white",0,0);
                this.sprite.startAnim(new PopAnimation(this.sprite, 8));
            }
            
        }
        else{
            cl = this.recipe[term][beat];
            if(cl == 1){
                this.sprite.startAnim(new PopAnimation(this.sprite, 8));
            }
            
        }

        if(cl == 0){
            if(beat % 2 == 0)this.sprite.startAnim(new PopAnimation(this.sprite, 8, true, 0.46));
        }else{
            ticktack(this.tickNum);
        }
        this.input[term][beat] = cl;
        this.sprite.image = this.images[beat % this.images.length];
        
    }
}