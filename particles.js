var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var focus = true;
var fps = 1000/60;
var mousePos = {'x':-1 , 'y':-1};

canvas.width = window.innerWidth; 
canvas.height = window.innerHeight; 
//tamanho canvas
var W = canvas.width; 
var H = canvas.height;
var maxVelocity = 6;
var x = 100; var y = 100;
var bgImage =document.getElementById('bgImage'); 

var particles = [];
var particleGroup = [];

var noGroups = 0;


window.onblur = function (event) {
    fps = 1000/500; 
}

window.onfocus = function (event) {
    fps = 1000 / 60;
}

window.onresize = function(event) {
	resizeCanvas();
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

canvas.addEventListener('mousemove', function(evt) {
	mousePos = getMousePos(canvas, evt);
});

canvas.addEventListener('mouseout', function(evt) {
	mousePos = {'x':-1 , 'y':-1};
});

function resizeCanvas() { 
	console.log("resize");
	canvas.width = window.innerWidth; 
	canvas.height = window.innerHeight;
//	init();
}

function init(){

	W = canvas.width; 
	H = canvas.height;
	particles = [];
	particleGroup = [];
//	noGroups = ((canvas.width + canvas.height)*0.01)>>0
	noGroups = 1;
	for(var i = 0; i < 0; i++)
	{
		particles.push(new create_particle());
	}
	for(var i = 0; i < noGroups; i++)
	{
		var group = create_group();
		particleGroup.push(group);
		for(var k = 0 ; k < group.length; k++)
		{
			particles.push(group[k]);
		}
	}

}

function create_group(){
	var noParticles = Math.random() * 15;
	var seedParticle = create_particle();
	var group = [];
	
	seedParticle.vx = Math.random()*2-1;
	seedParticle.vy = Math.random()*2-1;
	
	for ( var i = 0 ; i <= 1; i ++ ){
	//for ( var i = 0 ; i <= noParticles ; i ++ ){

		var point = generateRandomPoint(seedParticle, Math.random() * 5 + 3);
		var particle = create_particle_from_point(point.x , point.y, seedParticle.vx, seedParticle.vy);
		
		particle.connectedTo = group[group.length - 1]; 
		
		group.push(particle);
	}
	group[0].connectedTo = group[group.length - 1];
	return group;
}

function create_particle()
{
	var particle = {};
	particle.x = Math.random()*W;
	particle.y = Math.random()*H;
	
	particle.vx = Math.random()*5-2.5;
	particle.vy = Math.random()*5-2.5;
	
	var b = Math.random()*255>>0;
	var r = Math.random()*b>>0;
	var g = Math.random()*r>>0;
	particle.color = "rgba("+r+", "+g+", "+b+", 0.5)";
	
	particle.radius = 4;
	//particle.radius = Math.random()*20+20;
	return particle;
}

function create_particle_from_point(x,y,vx,vy){
	var particle = {};
	particle.x = x;
	particle.y = y;

	particle.vx = vx + Math.random() * 0.5- 0.25;
	particle.vy = vy + Math.random() * 0.5- 0.25;

	var b = Math.random()*255>>0;
	var r = Math.random()*b>>0;
	var g = Math.random()*r>>0;
	particle.color = "rgba("+r+", "+g+", "+b+", 0.5)";
	particle.radius = 4;
	return particle;
}

function generateRandomPoint(center, radius) {
  var x0 = center.x;
  var y0 = center.y;
  // Convert Radius from meters to degrees.
  var rd = radius;

  var u = Math.random()*100;
  var v = Math.random()*100;

  var w = rd * Math.sqrt(u);
  var t = 2 * Math.PI * v;
  var x = w * Math.cos(t);
  var y = w * Math.sin(t);

  var xp = x/Math.cos(y0);
  // Resulting point.
  return {'y': ((y+y0)>>0), 'x': ((xp+x0)>>0)};
}

function manhatanDistance(point1 , point2)
{
	return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

function calculateDesiredVelocity(point){
	var relVelocity = ( maxVelocity) / (manhatanDistance(point, mousePos));
	var relativeMaxVelocity = relVelocity > maxVelocity ? maxVelocity : relVelocity;
	if(relativeMaxVelocity>1)console.log( relativeMaxVelocity);
	var norm = normalize({'x' : mousePos.x - point.x, 'y': mousePos.y - point.y});
	return {
		'vx' : norm.x * relativeMaxVelocity,
		'vy' : norm.y * relativeMaxVelocity
	}
}

function normalize(v){
	length = Math.sqrt(v.x * v.x + v.y * v.y);
	return { 
		'x' : v.x /= length,
		'y' : v.y /= length
	}
}

function draw()
{
	ctx.globalCompositeOperation = "source-over";
	//blend with bg
	ctx.globalAlpha = 0.2;
	ctx.drawImage(bgImage,0,0,W,H);
	ctx.globalAlpha = 1;
	//ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
	//ctx.fillRect(0, 0, W, H);
	
	//blend with bg	
	ctx.globalCompositeOperation = "lighter";
	for(var t = 0; t < particles.length; t++)
	{
		var p = particles[t];
		
		ctx.beginPath();
		
		//colors
		var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
		gradient.addColorStop(0, "white");
		gradient.addColorStop(0.1, "white");
		gradient.addColorStop(0.3, p.color);
		gradient.addColorStop(1, "black");
		//draw particle	
		ctx.fillStyle = gradient;
		ctx.arc(p.x, p.y, p.radius, Math.PI*2, false);
		ctx.fill();
		//lines	
		ctx.beginPath();
		ctx.moveTo(p.x,p.y);
		
		if(p.connectedTo){
			if(manhatanDistance(p, p.connectedTo) < (W / 2.5))
				ctx.lineTo(p.connectedTo.x, p.connectedTo.y)
		}
		else {
			ctx.lineTo(
				t == 0 ? particles[particles.length - 1].x : particles[t-1].x,
				t == 0 ? particles[particles.length - 1].y :particles[t-1].y);
		}

		var b = Math.random()*255>>0;
		var r = Math.random()*b>>0;
		var g = Math.random()*r>>0;

		ctx.strokeStyle = "rgba("+r+", "+g+", "+b+", 0.5)"
		ctx.stroke();
		
		if(mousePos.x != -1){
			var desiredVelocity = calculateDesiredVelocity(p);	
			p.vx = p.vx + desiredVelocity.vx > maxVelocity ? (p.vx < 0 ? maxVelocity * -1 : maxVelocity) : p.vx + desiredVelocity.vx;
			p.vy = p.vy + desiredVelocity.vy > maxVelocity ? (p.vy < 0 ? maxVelocity * -1 : maxVelocity) : p.vy + desiredVelocity.vy;

		}
		p.x += p.vx;
		p.y += p.vy;
		if(p.x < -50) p.vx = p.vx*-1;
		if(p.y < -50) p.vy = p.vy*-1;
		if(p.x > W+50) p.vx = p.vx*-1;
		if(p.y > H+50) p.vy = p.vy*-1;
	}
}

function wrapper(){
    requestID = requestAnimationFrame(function () {
        setTimeout(wrapper, fps);
        draw();
    });
}

$(window).ready(function(){
	init();
	wrapper();
})
//wrapper();
//setInterval(draw, 32);
