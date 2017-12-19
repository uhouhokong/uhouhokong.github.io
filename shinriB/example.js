//const
var FPS = 60;

//var
var canvas, ctx, timer, img;
var canvasOn;
var mouse = {x:0, y:0};
var pointer = {x:0, y:0};

//Physical
var Physical = function(xx, yy)
{
	this.x = xx;
	this.y = yy;
	this.b = 0.2;
	this.vx = 0;
	this.vy = 0;

	var d = new Date();
	this.currentTime = d.getTime();//経過時間

}

Physical.prototype = {

	update : function(aax, aay)
	{

		this.vx += aax;
		this.vy += aay;

		this.vx *= this.b;
		this.vy *= this.b;

		this.x += this.vx;
		this.y += this.vy;

	}
}

function onEnterFrameHandler(e){

	update();
	draw();

}

var preMx;
var preMy;

function update()
{
	pointer.x += (mouse.x - pointer.x) * 0.05;
	pointer.y += (mouse.y - pointer.y) * 0.05;
	// pointer.x += (mouse.x - (pointer.x - 0.2*(mouse.x - preMx))) * 0.15;
	// pointer.y += (mouse.y - (pointer.y - 0.2*(mouse.y - preMy))) * 0.15;

	preMx = mouse.x;
	preMy = mouse.y;
}


function draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if(img!=undefined && canvasOn)ctx.drawImage(img, pointer.x, pointer.y);


}


function init()
{
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	img = new Image();
  img.src = "cursol_.png";

	timer = setInterval(onEnterFrameHandler, 1000 / FPS);

}


function onMouseMove(e)
{

	var bbox = canvas.getBoundingClientRect();

	var dx = e.x || e.clientX;
	var dy = e.y || e.clientY;

	mouse.x = dx - bbox.left;
	mouse.y = dy - bbox.top;

}

function moverCanvas(){
	pointer.x = mouse.x;
	pointer.y = mouse.y;
	canvasOn = true;
}
function moutCanvas(){
	canvasOn = false;
}

window.addEventListener("mousemove", onMouseMove);
window.addEventListener("load", init);




