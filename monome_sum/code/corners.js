inlets = 1;
outlets = 7;

var dx = 0;
var dy = 0;
var x = 7;
var y = 3;
var i1, i2;
var tx = 0;
var ty = 0;
var g = 100;
var bx =  8;
var by = 8;
var f = 0.995;
var keys = 0;
var vb = 0;
var brake = 0;
var friction = 1;
var update = 0;
var display = 0; // this is a flag to set whether to calculate grid-display
var r = new Array(4);
r[0] = 1;
r[1] = 1;
r[2] = 1;
r[3] = 1;

var oldx = new Array(3);
var oldy = new Array(3);

oldx[0] = oldx[1] = oldx[2] = 0;
oldy[0] = oldy[1] = oldy[2] = 0;


var p = new Array(256);


function describe_it(num)
{
    if(num==0) assist("x");
    else if(num==1) assist("y");
    else if(num==2) assist("dx");
    else if(num==3) assist("dy");
    else if(num==4) assist("edge: 0=right 1=up 2=left 3=down");
	else if(num==5) assist("keys held down");
}
//setoutletassist(-1,describe_it);

function focus(i) { display = i; }

function ref(i, state) {
    r[i] = state;
}

function grr(val) {
    if(val>1) val = 1;
    if(val<0) val = 0;
    val = 1 - val;
    g = val*1000 + 4;
}

function fric(val) {
    if(val>1) val = 1;
    if(val<0) val = 0;
    val = 1 - val;
    f = ((val * 200) + 800) / 1000;
}

function braked(state) {
	brake = state;
	friction = Math.min(f,1-(brake*0.2));
	update = 1; // call led update on next tick
}

function point(kx, ky, state) {
	if(kx==0 && ky==0) {
		braked(state);
	}
    else if(state==1) {
        p[kx+ky*16] = 1;
    } else {
        p[kx+ky*16] = 0;
    }
}

function bounds(xb, yb) {
    bx = xb - 0.5;
    by = yb - 0.5;
}

function tilt(tiltx, tilty) {
	tx = tiltx/8192;
	ty = tilty/8192;
}

function bang() {
 //   dx = dy = 0;

		// these ifs note whether the led display has updated and should redraw grid

		if(oldx[2] != oldx[1]) update=1;
    oldx[2] = oldx[1];
		if(oldx[1] != oldx[0]) update=1;
    oldx[1] = oldx[0];
		if(Math.floor(x) != oldx[0]) update=1;
    oldx[0] = Math.floor(x);

		if(oldy[2] != oldy[1]) update=1;
    oldy[2] = oldy[1];
		if(oldy[1] != oldy[0]) update=1;
    oldy[1] = oldy[0];
		if(Math.floor(y) != oldy[0]) update=1;
    oldy[0] = Math.floor(y);

	keys = 0;
    for(i1=0;i1<16;i1++) {
    for(i2=0;i2<16;i2++) {
        if(p[i1+i2*16]) {
            dx = dx + (i1 - x + 0.5) / g;
            dy = dy + (i2 - y + 0.5) / g;
			keys++;
        }
		dx = dx + (tx / g);
		dy = dy + (ty / g);
    } }
    
    dx = dx * friction;
    dy = dy * friction;

    x = x + dx;

    if(x>bx) { 
        if(r[0]==1) { dx = -dx; x = bx; }
        else { x = x - bx; }
        //outlet(4,0);
    }
    if(x<0) { 
        if(r[2]==1) { dx = -dx; x = 0; }
        else { x = x + bx; }
        //outlet(4,2);
    }

    y = y + dy;

    if(y>by) { 
        if(r[3]==1) { dy = -dy; y = by; }
        else { y = y - by;}
        //outlet(4,3);
    }
    if(y<0) { 
        if(r[1]==1) { dy = -dy; y = 0; }
        else { y = y + by; }
        //outlet(4,1);
    }

    
    //outlet(2,dx);
    //outlet(3,dy);
//	outlet(4,x/bx,1-(y/by),dx/bx,dy/by);
	outlet(4,Math.pow(16,(x/bx))/4,Math.pow(16,(1-(y/by)))/4,Math.pow(16,(dx/bx))/4,Math.pow(16,(1-(dy/by)))/4);
	//outlet(5,keys);

		/////// DRAW LEDS //////
	if(update==1 && display==1) {
	    if(vb==0) { // draw monochrome
			outlet(6,"/b_corners/grid/led/all", 0);
			outlet(6,"/b_corners/grid/led/set",Math.floor(x),Math.floor(y), 1);
			outlet(6,"/b_corners/grid/led/set",0,0, brake);
		}
		else{ // draw varibright if the values have changed
			outlet(6,"/b_corners/grid/led/all", 0);
			outlet(6,"/b_corners/grid/led/level/set", 0,0, brake*10+5);
			outlet(6,"/b_corners/grid/led/level/set", oldx[2],oldy[2], 1);
			outlet(6,"/b_corners/grid/led/level/set", oldx[1],oldy[1], 5);
			outlet(6,"/b_corners/grid/led/level/set", oldx[0],oldy[0], 10);
			outlet(6,"/b_corners/grid/led/level/set", Math.floor(x),Math.floor(y), 15);	
		}
	}
    //outlet(1,y);
    //outlet(0,x);

	update = 0;
}

function varibright(x) {
	vb = x;
}

function reDraw() {
	update = 1;
	bang();
}