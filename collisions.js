

var n = 10;  //number of balls in the play area

var i = 0;
var j = 0;

var radius = 10;
var impactDistance = 2 * radius + 3;

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
        balls[i].vx = myRandom(-20, 70);
        balls[i].vy = myRandom(-20, 70);
        balls[i].top = balls[i].y + ball.h;
        balls[i].bottom = balls[i].y;
        balls[i].left = balls[i].x;
        balls[i].right = balls[i].x + ball.w;
        balls[i].centerX = balls[i].x + ball.w;
        balls[i].centerY = balls[i].y + ball.h;
        balls[i].onBoundX = false;
        balls[i].onBoundY = false;
        balls[i].veloSet = false;
        balls[i].interference = false;
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
        balls[i].veloSet = false;
        balls[i].interference = false;
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
		if (Math.abs(balls[i].vx) < 8) {
	        balls[i].vx = 50;		
		}
		if (Math.abs(balls[i].vy) < 8) {
	        balls[i].vy = 50;		
		}
        integrate(balls[i].x,balls[i].y,balls[i].vx,balls[i].vy,game.dt);
        setData(i);
        boundDetector();
        collisionRecord();
        manageBounds();
        if (balls[i].collider != -1 && balls[i].veloSet === false) {
		    var newi = balls[i].collider;
            updateVelocityBall();			
            integrate(balls[i].x,balls[i].y, balls[i].vx, balls[i].vy,game.dt);
            setData(i);
            integrate(balls[newi].x,balls[newi].y, balls[newi].vx, balls[newi].vy,game.dt);
			setData(newi);
            manageBounds();
        }
        if (balls[i].onBoundX || balls[i].onBoundY) {
            updateVelocityBound();
            integrate(balls[i].x,balls[i].y, balls[i].vx, balls[i].vy,game.dt);	
            setData(i);
            manageBounds();
        }
    }
    for (i = 0; i < n; i++) {
		console.log('balls[i].x',i, balls[i].x);
        console.log('balls[i].y',i, balls[i].y);
        console.log('balls[i].vx',i, balls[i].vx);
        console.log('balls[i].vy',i, balls[i].vy);
        console.log('balls[i].top',i, balls[i].top );
        console.log('balls[i].bottom',i, balls[i].bottom);
        console.log('balls[i].left',i, balls[i].left);
        console.log('balls[i].right',i, balls[i].right);
        console.log('balls[i].centerX',i, balls[i].centerX);
        console.log('balls[i].centerY',i, balls[i].centerY);
        console.log('balls[i].onBoundX',i, balls[i].onBoundX);
        console.log('balls[i].onBoundY',i, balls[i].onBoundY);
        console.log('balls[i].collider',i, balls[i].collider);
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

//Calcul of magnitude
function getMagnitude(vx,vy) {
	return Math.sqrt(vx * vx + vy * vy);
}

//Set data for next step to the balls
function setData(a) {
    balls[a].x = nextBalls[a].x;
    balls[a].y = nextBalls[a].y;
    balls[a].top = balls[a].y + ball.h;
    balls[a].bottom = balls[a].y;
    balls[a].left = balls[a].x;
    balls[a].right = balls[a].x + ball.w;
    balls[a].centerX = balls[a].x + ball.w;
    balls[a].centerY = balls[a].y + ball.h;
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
        var dx = balls[i].centerX - balls[j].centerX;
        var dy = balls[i].centerY - balls[j].centerY;
        if (Math.abs(dx) <= impactDistance && Math.abs(dy) <= impactDistance && i != j) {
             balls[i].collider = j;
        }
        if (Math.abs(dx) < impactDistance && Math.abs(dy) < impactDistance && i != j) {
             balls[i].interference = true;
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

/*Set new velocities after collision choc on ball
Counterclockwise rotation of a vector (x, y):
   x1= cos(α) * x + sin(α) * y
   y1= cos(α) * y − sin(α) * x
Clockwise rotation of a vector (x, y):
   x1= cos(α) * x - sin(α) * y
   y1= cos(α) * y + sin(α) * x
*/
function updateVelocityBall() {
	var newi = balls[i].collider;
	var dx = balls[i].centerX - balls[newi].centerX;
    var dy = balls[i].centerY - balls[newi].centerY;
	var beforeChocVx1 = balls[i].vx;
	var beforeChocVy1 = balls[i].vy;
	var beforeChocVx2 = balls[newi].vx;
	var beforeChocVy2 = balls[newi].vy;
    var collisionAngle = Math.atan2(dx,dy);
    var cosa = Math.cos(collisionAngle);
    var sina = Math.sin(collisionAngle);
	
	balls[i].vx = cosa * beforeChocVx1 + sina * beforeChocVy1; 
	balls[i].vy = cosa * beforeChocVx1 - sina * beforeChocVy1;
	balls[newi].vx = cosa * beforeChocVx2 + sina * beforeChocVy2; 
	balls[newi].vy = cosa * beforeChocVx2 - sina * beforeChocVy2;
	
	var vx1 = balls[i].vx;
	var vy1 = balls[i].vy;
	var vx2 = balls[newi].vx;
	var vy2 = balls[newi].vy;

	var tempvx = vx1;
	vx2 = vx1;
	vx1 = tempvx;
	var tempvy = vy1;
	vy2 = vy1;
	vy1 = tempvy;
	
	balls[i].vx = cosa * vx1 - sina * vy1;
	balls[i].vy = cosa * vy1 + sina * vx1;
	balls[newi].vx = cosa * vx2 - sina * vy2;
	balls[newi].vy = cosa * vy2 + sina * vx2;
		
	if(balls[i].interference) {
		balls[i].x += balls[i].x > 0? 5: -5;
		balls[i].y += balls[i].y > 0? 5: -5;
		balls[i].centerX = balls[i].x + ball.w;
        balls[i].centerY = balls[i].y + ball.h;
		balls[newi].vx += balls[newi].x > 0? 5: -5;
		balls[newi].vy += balls[newi].y > 0? 5: -5;
		balls[newi].centerX = balls[newi].x + ball.w;
        balls[newi].centerY = balls[newi].y + ball.h;
		balls[i].interference = false;
		balls[newi].interference = false;
	}
	
	balls[newi].veloSet = true;
	balls[i].veloSet = true;
}

//render
function render () {
    for (i = 0; i < n; i++) {
        el[i].style.left = balls[i].x + 'px';
        el[i].style.bottom = balls[i].y + 'px';
    }
}
