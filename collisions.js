

var n = 15;  //number of balls in the play area

var i = 0;
var j = 0;
var k = 0;

var balls = [];
var ball = {};
	
ball.h = 20;
ball.w = 20;
ball.mass = 1;

var nextBalls = [];

var collision = [];
el = [];

var bounds = {};
bounds.xMax = 800;
bounds.xMin = 0;
bounds.yMax = 560;
bounds.yMin = 0;

var game = {};
game.dt = 0;
game.score = 0;
game.previous = getTime();
game.MS_PER_UPDATE = 30;


var radius = 10;
var impactDistance = 2 * radius;
var collision = [];
var collisionRecorded = false;

// Returns a random integer between min (included) and max (included)
function myRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//init settings
function init(n) {
	for (i = 0; i < n; i++) {
		balls[i] = {};
		nextBalls[i] = {};
        balls[i].x = myRandom(bounds.xMin, bounds.xMax - ball.w);
        balls[i].y = myRandom(bounds.yMin, bounds.yMax - ball.h);
        balls[i].vx = myRandom(100, 400);
        balls[i].vy = myRandom(100, 400);
        balls[i].top = balls[i].y + ball.h;
        balls[i].bottom = balls[i].y;
        balls[i].left = balls[i].x;
        balls[i].right = balls[i].x + ball.w;
		balls[i].centerX = balls[i].x + ball.w;
		balls[i].centerY = balls[i].y + ball.h;
		balls[i].onBound = false;
        balls[i].onBoundX = false;
        balls[i].onBoundY = false;
		balls[i].update = false;
		balls[i].collider = -1;
	}
}

//init the DOM
function createDom (n) {
	for (i = 0; i < n; i++) {
		el[i] = document.createElement('div');
		el[i].setAttribute('id',"element" + i);
		el[i].setAttribute('class',"elements");
		document.getElementById('playArea').appendChild(el[i]);
		el[i].style.left = balls[i].x + 'px';
		el[i].style.bottom = balls[i].y + 'px';
	}
}

init(n);
createDom(n);

//start loop
loop(); 

//Game loop
function loop() {
    update ();
    render(); 
    setTimeout(loop,1000/game.MS_PER_UPDATE);
}

//Get real new time
function getTime () {
    return +new Date;
}

//Set real new time elapsed : dt
function getDt () {
    game.current = getTime();				
    game.dt = game.current - game.previous;
    game.dt /= 1000;
    game.previous = game.current;
}

//integration engine
function integrate (x,y,vx,vy,dt) {
	nextBalls[i].x = x + vx * dt;
	nextBalls[i].y = y + vy * dt;
}

//Set data for next step to the balls
function setData() {
	for (i = 0; i < n; i++) {	
		balls[i].x = nextBalls[i].x;
		balls[i].y = nextBalls[i].y;
        balls[i].top = balls[i].y + ball.h;
        balls[i].bottom = balls[i].y;
        balls[i].left = balls[i].x;
        balls[i].right = balls[i].x + ball.w;
		balls[i].centerX = balls[i].x + ball.w;
		balls[i].centerY = balls[i].y + ball.h;
	}
}

//Manage with the Bounds of the HTML/CSS area
function manageBounds () {
	for (i = 0; i < n; i++) {
        balls[i].x = Math.min(bounds.xMax - ball.w, balls[i].x);
        balls[i].x = Math.max(bounds.xMin, balls[i].x);
        balls[i].y = Math.min(bounds.yMax - ball.h, balls[i].y);
        balls[i].y = Math.max(bounds.yMin, balls[i].y);
	}
}

//reset the colliders
function resetColliders() {
	collisionRecorded = false;
	for (i = 0; i < n; i++) {
		balls[i].collider = -1;
		balls[i].update = false;
	}
}

function update () {
	k = 0;
	resetColliders();
	getDt();
	for (i = 0; i < n; i++) {
	    integrate(balls[i].x,balls[i].y,balls[i].vx,balls[i].vy,game.dt);
	}
	setData();
	boundDetector();
	collisionRecord();
	manageBounds();
	for (i = 0; i < n; i++) {
	    if (collisionRecorded) {
	        updateVelocityBall();			
		    integrate(balls[i].x,balls[i].y, balls[i].vx, balls[i].vy,game.dt);
	    }
	    if (balls[i].onBound) {
            updateVelocity();
            integrate(balls[i].x,balls[i].y, balls[i].vx, balls[i].vy,game.dt);
            balls[i].onBound = false;
            balls[i].onBoundX = false;
            balls[i].onBoundY = false;	
		}
	}
    setData();
	manageBounds();
}

//COLLISION DETECTION

//Detection of collision against bounds
function boundDetector () {
	for (i = 0; i < n; i++) {
        if (balls[i].right >= bounds.xMax || balls[i].left <= bounds.xMin) {
            balls[i].onBound = balls[i].onBoundX = true;
        }
        if (balls[i].top >= bounds.yMax || balls[i].bottom <= bounds.yMin) {
            balls[i].onBound = balls[i].onBoundY =  true;
        }
	}
}

//detect if collision between balls
function collisionRecord () {
	for (i = 0; i < n ; i++) {
		for (j = 0; j < n; j++) {
			var testDistX = balls[i].centerX - balls[j].centerX;
			var testDistY = balls[i].centerY - balls[j].centerY;
			if (Math.abs(testDistX) <= impactDistance && Math.abs(testDistY) <= impactDistance) {
				if (i != j) {
				    balls[i].collider = j;			
				    k = k + 1;
				}
			}
		}
    }
	if (k != 0) {
		collisionRecorded = true;
	}
}
//COLLISION RESOLUTION
//Elastic collision Cr = v'/v0, Here Cr = 0,50
function restitution (v) {
    return v * (0.5) * (-1);
}

//Set new velocities after collision choc
//onBound
function updateVelocity() {
    if (balls[i].onBoundX) {
        balls[i].vx = (-1) * balls[i].vx;
        balls[i].vy = balls[i].vy;
    }
    if (balls[i].onBoundY) {
        balls[i].vx = balls[i].vx;
        balls[i].vy = (-1) *  balls[i].vy;
    }
}

//Collision on ball
function updateVelocityBall() {
	if (Math.abs(balls[i].vx) <= 0.1 || Math.abs(balls[i].vy) <= 0.1) {
	    balls[i].vx = 100;
		balls[i].vy = 100;
	}
	if (balls[i].collider != -1 ) {
		var newi = balls[i].collider;
		balls[i].vx = -1 * balls[i].vx;
		balls[i].vy = -1 * balls[i].vy;
		balls[newi].update = true;
	}
}

function render () {
	for (i = 0; i < n; i++) {
        el[i].style.left = balls[i].x + 'px';
        el[i].style.bottom = balls[i].y + 'px';
	}
}

//DEBUG
for (i = 0; i < n; i++) {
	console.log("balls.x", balls[i].x);
	console.log("balls.y", balls[i].y);
	console.log("balls.vx", balls[i].vx);
	console.log("balls.vy", balls[i].vy);
	console.log("nextballs.x", nextBalls[i].x);
	console.log("nextballs.y", nextBalls[i].y);
	console.log('el',el[i]);
}