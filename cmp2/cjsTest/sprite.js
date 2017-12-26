//------------------------------------------------------------------------------------------------
//    Spriteクラス
//------------------------------------------------------------------------------------------------

class Sprite{
    //コンストラクタ
    constructor(parent, bitmap){
        this.parent = parent;
        if(typeof bitmap == 'string' || bitmap.toString() == '[object HTMLImageElement]')this.bitmap = new createjs.Bitmap(bitmap);
        else this.bitmap = bitmap;
        this.parent.addChild(this.bitmap);
        this.animations = [];
        this.animTransform = {alpha: 1, x: 0, y: 0, regX: 0, regY: 0, rotation: 0, scaleX: 1, scaleY: 1};
        this.transed = false;
        this.isEffect = false;
    }

    setAlignCenter(){
        this.regX = this.image.width/2;
        this.regY = this.image.height/2;
    }

    get image() {return this.bitmap.image;}     set image(val) {this.bitmap.image = val;}
    get alpha() {return this.bitmap.alpha;}     set alpha(val) {this.bitmap.alpha = val;}
    get x() {return this.bitmap.x;}             set x(val) {    this.bitmap.x = val;}
    get y() {return this.bitmap.y;}             set y(val) {    this.bitmap.y = val;}
    get regX() {return this.bitmap.regX;}       set regX(val) { this.bitmap.regX = val;}
    get regY() {return this.bitmap.regY;}       set regY(val) { this.bitmap.regY = val;}
    get rotation() {return this.bitmap.rotation;}   set rotation(val) {this.bitmap.rotation = val;}
    get scaleX() {return this.bitmap.scaleX;}   set scaleX(val) {this.bitmap.scaleX = val;}
    get scaleY() {return this.bitmap.scaleY;}   set scaleY(val) {this.bitmap.scaleY = val;}
    applyTransform(direction){// 1 or -1
        if(this.animTransform == undefined)return;
        this.alpha *= Math.pow(this.animTransform.alpha, direction);
        this.x += direction * this.animTransform.x;
        this.y += direction * this.animTransform.y;
        this.regX += direction * this.animTransform.regX;
        this.regY += direction * this.animTransform.regY;
        this.rotation += direction * this.animTransform.regY;
        this.scaleX *= Math.pow(this.animTransform.scaleX, direction);
        this.scaleY *= Math.pow(this.animTransform.scaleY, direction);
    }

    draw(){
        if(this.transed)this.applyTransform(-1);
        this.animTransform = {alpha: 1, x: 0, y: 0, regX: 0, regY: 0, rotation: 0, scaleX: 1, scaleY: 1};
        this.transed = false;
        for(let i=0; i<this.animations.length; i++){
            this.transed = true;
            let reject = this.animations[i].draw();
            if(reject)this.animations.splice(i--, 1);
        }
        if(this.isEffect && this.animations.length == 0)return true;
        if(this.transed)this.applyTransform(1);
        return false;
    }
    startAnim(anim){//Animation を new していれよう
        this.animations.push(anim);
        return anim;
    }
    destroy(){
        this.parent.removeChild(this.bitmap);
    }
}


//------------------------------------------------------------------------------------------------
//    Animation 及び一連のクラス
//------------------------------------------------------------------------------------------------



//Animation、一連のそれはSprite の内部クラスの想定
class Animation{
    //drawの前でインスタンス化することを想定
    constructor(sprite, frameLimit, finishable = true){
        this.frameCount = 0;
        this.finishable = finishable;
        this.destroyed = false;
        this.frameLimit = frameLimit;
        this.sprite = sprite;
        
    }
    draw(){//最後
        this.frameCount++;
        if(this.frameCount >= this.frameLimit && this.finishable){
            return true;
        }
        return false;
    }
    destroy(){
        this.destroyed = true;
    }
    get rate(){console.log("get:"+this.frameCount/this.frameLimit); return this.frameCount/this.frameLimit;}
    rate(direction){console.log("get():"+(1-direction)/2+direction*(this.rate));return (1-direction)/2+direction*(this.rate);}
    dirPow(direction, rate){console.log("dirPow:"+Math.pow(this.rate(this.direction), rate));return Math.pow(this.rate(this.direction), rate);}
}
class MoveToAnimation extends Animation{
    //drawの前でインスタンス化することを想定
    constructor(sprite, frameLimit, finishable = true, direction = 1, endX = 0.13, endY = 0.98){
        super(sprite, frameLimit, finishable);
        this.x = endX;
        this.y = endY;
    }
    draw(){//最後
        if(this.destroyed)return true;
        if(this.sprite.animTransform == undefined) return super.draw();
        this.sprite.animTransform.x += this.x * (1-Math.pow(1-(Math.min(this.frameCount/this.frameLimit, 1)), 2));
        this.sprite.animTransform.y += this.y * (1-Math.pow(1-(Math.min(this.frameCount/this.frameLimit, 1)), 2));
        return super.draw();
    }
}
class MoveFromAnimation extends Animation{
    //drawの前でインスタンス化することを想定
    constructor(sprite, frameLimit, finishable = true, direction = 1, startX = 0.13, startY = 0.98, endX = 0, endY = 0){
        super(sprite, frameLimit, finishable);
        this.sx = startX;
        this.sy = startY;
        this.ex = endX;
        this.ey = endY;
    }
    draw(){//最後
        if(this.destroyed)return true;
        if(this.sprite.animTransform == undefined) return super.draw();
        this.sprite.animTransform.x += this.ex + (this.sx - this.ex) * (Math.pow(1-(Math.min(this.frameCount/this.frameLimit, 1)), 2));
        this.sprite.animTransform.y += this.ey + (this.sy - this.ey)* (Math.pow(1-(Math.min(this.frameCount/this.frameLimit, 1)), 2));
        return super.draw();
    }
}

class PopAnimation extends Animation{
    //drawの前でインスタンス化することを想定
    constructor(sprite, frameLimit, finishable = true, direction = 1){
        super(sprite, frameLimit, finishable);
        this.startScaleX = 0.13;
        this.startScaleY = 0.08;
    }
    draw(){//最後
        if(this.destroyed)return true;
        if(this.sprite.animTransform == undefined) return super.draw();
        this.sprite.animTransform.scaleX *= 1 + this.startScaleX * Math.pow(1.0-(this.frameCount/this.frameLimit), 2);
        this.sprite.animTransform.scaleY *= 1 + this.startScaleY * Math.pow(1.0-(this.frameCount/this.frameLimit), 2);
        return super.draw();
    }
}

class FadeOutAnimation extends Animation{
    //drawの前でインスタンス化することを想定
    constructor(sprite, frameLimit, finishable = true){
        super(sprite, frameLimit, finishable);
        this.startAlpha = 1;
    }
    draw(){//最後
        if(this.destroyed)return true;
        if(this.sprite.animTransform == undefined) return super.draw();
        this.sprite.animTransform.alpha *= 1 - this.startAlpha * Math.pow((this.frameCount/this.frameLimit), 2);
        return super.draw();
    }
}

class FlashAnimation extends Animation{
    //drawの前でインスタンス化することを想定
    constructor(sprite, frameLimit, finishable = true){
        super(sprite, frameLimit, finishable);
    }
    draw(){//最後
        if(this.destroyed)return true;
        if(this.sprite.animTransform == undefined) return super.draw();
        // if((Math.pow((this.frameCount/this.frameLimit), 2) * this.frameLimit*10) % 2 < 1) ;this.sprite.animTransform.alpha *= 0;
        if(this.frameCount % 4 < 2) this.sprite.animTransform.alpha *= 1 * (1 - Math.pow((this.frameCount/this.frameLimit), 2));
        // console.log(Math.pow((this.frameCount/this.frameLimit), 2) * this.frameLimit*10);
        // console.log((Math.pow((this.frameCount/this.frameLimit), 2) * this.frameLimit*10) % 2 + "  :"+this.sprite.animTransform.alpha);
        return super.draw();
    }
}


//------------------------------------------------------------------------------------------------
//    Effect 及び一連のクラス
//------------------------------------------------------------------------------------------------

class EffectManager{
    constructor(data){
        this.effects = [];
        this.data = data;
        console.log(data);
    }

    draw(){
        for(let i=0; i<this.effects.length; i++){
            let reject = this.effects[i].draw();
            if(reject){
                this.effects[i].destroy();
                this.effects.splice(i--, 1);
            }
        }
    }

    play(name, x, y){
        var newEffect = new Effect(stage, this.data[name].sourse);
        newEffect.x = x;
        newEffect.y = y;
        var animations =[];
        for(let i=0; i < this.data[name].anims.length; i++){
            let anim = this.data[name].anims[i];
            switch(anim.type){
                case "Pop": animations.push(new PopAnimation(newEffect, anim.limit));
                case "FadeOut": animations.push(new FadeOutAnimation(newEffect, anim.limit));
            }
        }
        
        newEffect.init(animations);
        this.effects.push(newEffect);
    }
}

class EffectPool{//??????????    
}

//全アニメーションを再生しきったら自然消滅するSprite
class Effect extends Sprite{
    constructor(stage, bitmap){
        super(stage, bitmap);
    }
    init(animations){
        this.animations = animations;
    }
    draw(){
        if(this.transed)this.applyTransform(-1);
        this.animTransform = {alpha: 1, x: 0, y: 0, regX: 0, regY: 0, rotation: 0, scaleX: 1, scaleY: 1};
        this.transed = false;
        for(let i=0; i<this.animations.length; i++){
            this.transed = true;
            let reject = this.animations[i].draw();
            if(reject)this.animations.splice(i--, 1);
        }
        if(this.animations.length == 0)return true;
        if(this.transed)this.applyTransform(1);
        return false;
    }
}

