

var n = 20;  //number of balls in the play area

var i = 0;
var j = 0;

var radius = 10;
var impactDistance = 2 * radius;

var el = [];

var balls = [];
var ball = {};
ball.h = 20;
ball.w = 20;
ball.mass = 1;

var nextBalls = [];

var collision = [];

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
        balls[i].v0 = myRandom(100, 200);
        balls[i].angle = myRandom(0,360);
        balls[i].vx = (balls[i].v0) * Math.cos(balls[i].angle);
        balls[i].vy = (balls[i].v0) * Math.sin(balls[i].angle);
        balls[i].top = balls[i].y + ball.h;
        balls[i].bottom = balls[i].y;
        balls[i].left = balls[i].x;
        balls[i].right = balls[i].x + ball.w;
        balls[i].centerX = balls[i].x + ball.w;
        balls[i].centerY = balls[i].y + ball.h;
        balls[i].onBoundX = false;
        balls[i].onBoundY = false;
        balls[i].veloUpdate = false;
        balls[i].onCorner = 0;
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

//reset the colliders
function resetColliders() {
    for (i = 0; i < n; i++) {
        balls[i].collider = -1;
        balls[i].veloUpdate = false;
    }
}

//init and start
init(n);
createDom(n);
loop(); 

//Game loop
function loop() {
    update ();
    render(); 
    setTimeout(loop,1000/game.MS_PER_UPDATE);
}

function update () {	
    resetColliders();
    getDt();
    for (i = 0; i < n; i++) {
        if (balls[i].onCorner >= 8) {		
            reIncrementPosition();
	}
        integrate(balls[i].x,balls[i].y,balls[i].vx,balls[i].vy,game.dt);
        setData();
        boundDetector();
        collisionRecord();
        manageBounds();
        if (balls[i].collider != -1 && balls[i].veloUpdate === false ) {      
            updateVelocityBall();			
            integrate(balls[i].x,balls[i].y, balls[i].vx, balls[i].vy,game.dt);	
            setData();
            manageBounds();
        }
        if (balls[i].onBoundX || balls[i].onBoundY) {
            updateVelocityBound();
            integrate(balls[i].x,balls[i].y, balls[i].vx, balls[i].vy,game.dt);	
            setData();
            manageBounds();
        }
    }
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
    balls[i].x = nextBalls[i].x;
    balls[i].y = nextBalls[i].y;
    balls[i].top = balls[i].y + ball.h;
    balls[i].bottom = balls[i].y;
    balls[i].left = balls[i].x;
    balls[i].right = balls[i].x + ball.w;
    balls[i].centerX = balls[i].x + ball.w;
    balls[i].centerY = balls[i].y + ball.h;
}

//Manage with the Bounds of the HTML/CSS area
function manageBounds () {
    balls[i].x = Math.min(bounds.xMax - ball.w, balls[i].x);
    balls[i].x = Math.max(bounds.xMin, balls[i].x);
    balls[i].y = Math.min(bounds.yMax - ball.h, balls[i].y);
    balls[i].y = Math.max(bounds.yMin, balls[i].y);
}

//COLLISION DETECTION

//Detection of collision against bounds
function boundDetector () {
    if (balls[i].right >= bounds.xMax || balls[i].left <= bounds.xMin) {
        balls[i].onBoundX = true;
    }
    if (balls[i].top >= bounds.yMax || balls[i].bottom <= bounds.yMin) {
        balls[i].onBoundY =  true;
    }
    if (balls[i].onBoundX && balls[i].onBoundX) {
        balls[i].onCorner += 1;
    }
}

//detect if collision between balls
function collisionRecord () {
    for (j = 0; j < n; j++) {
        var testDistX = balls[i].centerX - balls[j].centerX;
        var testDistY = balls[i].centerY - balls[j].centerY;
        if (Math.abs(testDistX) <= impactDistance && Math.abs(testDistY) <= impactDistance && i != j) {
             balls[i].collider = j;
        }
    }
}

//COLLISION RESOLUTION
//Set new velocities after collision choc on bounds
function updateVelocityBound() {
    if (balls[i].onBoundX) {
        balls[i].vx = (-1) * balls[i].vx;
        balls[i].vy = balls[i].vy;
        balls[i].onBoundX = false;
    }
    if (balls[i].onBoundY) {
        balls[i].vx = balls[i].vx;
        balls[i].vy = (-1) *  balls[i].vy;
        balls[i].onBoundY = false;
    }	
}

//set new velocities if ball V0 = 0
function reIncrementPosition () {
    balls[i].x = myRandom(bounds.xMin + 100, bounds.xMax - ball.w);
    balls[i].y = myRandom(bounds.yMin + 100, bounds.yMax - ball.h);
    balls[i].onCorner = 0;
}

//Set new velocities after collision choc on ball
function updateVelocityBall() {
    var newi = balls[i].collider;
    balls[i].angle += (180 - balls[newi].angle);
    balls[i].vx = (balls[i].v0) * Math.cos(balls[i].angle);
    balls[i].vy = (balls[i].v0) * Math.sin(balls[i].angle);	

    balls[newi].angle += (180 - balls[i].angle);
    balls[newi].vx = (balls[newi].v0) * Math.cos(balls[newi].angle);
    balls[newi].vy = (balls[newi].v0) * Math.sin(balls[newi].angle);

    balls[i].veloUpdate = true;
    balls[newi].veloUpdate = true;
}

//render
function render () {
    for (i = 0; i < n; i++) {
        el[i].style.left = balls[i].x + 'px';
        el[i].style.bottom = balls[i].y + 'px';
    }
}
