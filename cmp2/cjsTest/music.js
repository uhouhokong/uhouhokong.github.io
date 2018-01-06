var registedSounds = [];

//同一名のものは一度だけレジスタに登録し、インスタンスを返す
function loadSound(name){
    if(registedSounds.indexOf(name) == -1){
        createjs.Sound.registerSound(name);
        registedSounds.push(name);
    }
    return createjs.Sound.createInstance(name);
}

class Music{
    constructor(audio, bpm = 120, endTerm = 1){
        //楽曲のユニーク値、一度生成されたのち固定である
        this.audio = audio;
        this.bpm = bpm;         //1beat = 4分音譜一つ
        this.measure4 = 4;      //一小節の拍子数。4分の...で記述
        this.termSplit = 8;     //一小節の区切り数
        this.terms = [2,2,2,2];   //〜の設定
        this.puffing = 1;
        this.surplusDetection = 0.3; // 定数。余剰判定
        this.offset = 0.05;
        //状態
        this.prePosit = 0;
        this.preBeat = 0;
        this.playOrdered = false;

        this.clickTrigger = false;
        this.preClickTrigger = false;
        
        this._startTerm = 0;
        this._endTerm = 1;
        this.startTerm = 0;
        this.endTerm = endTerm;
        console.log("sT: "+this.startTerm+", eT: "+ this.endTerm);
    }
    get startTerm(){return this._startTerm;}
    set startTerm(value){
        this._startTerm = Math.max(0 , Math.min(value, this.terms.length));
        this.endTerm = this._endTerm;
    }
    get endTerm(){return this._endTerm;}
    set endTerm(value){this._endTerm = Math.max(this.startTerm + 1, Math.min(value, this.terms.length + 1));}

    //小節ループ、判定など高解像度でやった方が良いもの
    highUpdate(){
        if(this.playOrdered != this.played)this.play();
        this.metronome();
        this.prePosit = this.audio.position;
        this.preBeat = this.beat;
    }
    metronome() {
        var pre = (this.preBeat+this.offset) - this.termToBeat(this.term);
        var cur = (this.beat+this.offset) - this.termToBeat(this.term);
        //ビート間またぎ
        if(Math.floor(pre)!=Math.floor(cur)){
            if(this.clickTrigger){
                ticktack(0);
                this.preClickTrigger = true;
            }
            beating(this.term(cur), Math.floor(cur) - this.termToBeat(this.term(cur)), this.clickTrigger);//メインループに還元

            //ターム間またぎ
            if(this.term(pre)!=this.term(cur)){
                let nextTerm = this.term(cur);
                if(this.term(cur) >= this.endTerm){
                    // console.log("nextTerm:"+this.termToBeat(this.startTerm) + "sT: "+this._startTerm+", eT: "+ this._endTerm);
                    nextTerm = this.startTerm;
                    this.audio.position = this.beatToPosit(this.termToBeat(nextTerm));
                }
                beyondTerm(this.term(pre), nextTerm);//メインループに還元
            } 
            
            this.clickTrigger = false;
        }
        if(cur % 1 > this.surplusDetection+0.25){
            this.preClickTrigger = false;
        }
    }
    changeTerm(){
        beyondTerm(this.term(this.beat), this.term);//メインループに還元
        this.audio.position = this.beatToPosit(this.termToBeat(this.startTerm) + this.beat - this.termToBeat(this.term));
    }
    click(){
        var cur = this.beat+this.offset;
        if(cur % 1 < this.surplusDetection){
            if(!this.preClickTrigger){
                beating(this.term(cur), Math.floor(cur) - this.termToBeat(this.term(cur)), true);//メインの流れに還元
            }
            this.preClickTrigger = true;
        }else{
            this.clickTrigger = true;
        }
    }

    get played(){
        return !(this.audio.paused || this.audio.position == 0);
    }
    get len(){return this.terms.length;}
    beatLenAt(term){return this.terms[term] * this.termSplit;}
    get beat(){
        var split = this.measure4 / this.termSplit;
        var spb = 1 / (this.bpm / 60) * 1000 * split;
        var beat = this.audio.position / spb;
        return beat;
    }
    term(){
        return this.term(this.beat);
    }
    term(beat){
        var term=0;
        for(; term<this.terms.length; term++){
            if(beat < this.terms[term]*this.termSplit)return term;
            else beat -= this.terms[term]*this.termSplit;
        }
        // console.log("beat error: ターム指定外");
        return this.terms.length;
    }
    termToBeat(term){
        var len = 0;
        for(let i=0; i<term; i++){
            len += this.terms[i]*this.termSplit;
        }
        return len;
    }
    beatToPosit(beat){
        var split = this.measure4 / this.termSplit;
        var spb = 1 / (this.bpm / 60) * 1000 * split;
        var posit = beat * spb;
        return posit;
    }

    play(posit = 0){
        this.preBeat = -0.5;
        this.audio.play({ interrupt: createjs.Sound.INTERRUPT_ANY,position: posit, loop: -1, pan: 0 });
        this.playOrdered = true;
    }
    stop(){
        this.audio.stop();
        this.playOrdered = false;
    }
}