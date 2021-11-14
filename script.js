"use strict"; //incorporating this 'expression' tells the browser to enable 'strict mode' - this mode helps ensure you write better code, for example, it prevents the use of undeclared variables.

//CONSTANTS

//viewport constants
const VP_WIDTH = 920, VP_HEIGHT = 690; //defined global const variables to hold the (vp) details (e.g., size, etc.)

//player constants

const P_SPEED = 2;
const P_SIZE = 30;
var arc_x = 5;
var arc_y = 10;
var e_xvel = -5;
var e_yvel = 15;
var p_score = 0;
var e_score = 0;
//background colour constants
const BG_COLOUR_R = get_random(0,55); 
const BG_COLOUR_G = get_random(0,55);
const BG_COLOUR_B = get_random(0,55);

//engine constants
const FPS = 60;

var engine, world, body; //defined global variables to hold the game's viewport and the 'matter' engine components
var viewport;
var p;
var e;
var floor;
var cooldown = 0;
var e_cooldown = 0;
var wall;
var bullet;
var bullet_ls = [];
var notinteractable = 0x0001, interactable = 0x0002;
var dir = "right";
var bulx;
var buly;

var game_state = "start";


function get_random(min, max) {
	//returns a random number in the range of min(int) and max(int)
	//min(int): the lowest possible value
	//max(int): the highest possible value
	return Math.floor((Math.random() * max) + min);
}


//this class creates a floor which we are using as the base of our game 
class Wall { 
	constructor(
	xx,
	yy,
	columns,
	rows,
	columnGap,
	rowGap,
	crossBrace,
	sideLen, 
	re=get_random(90, 255), 
	g=get_random(90, 255), 
	b=get_random(90, 255)
	){

		this.r = sideLen;

		this.re = re;
		this.g = g;
		this.b = b;

		let options ={
			restitution: 0.00,
			isStatic: true,
			density: 0.99,
			friction: 0.99
			};

		this.composite = Matter.Composites.stack(
			xx,
			yy,
			columns,
			rows,
			columnGap,
			rowGap,
			function(x, y) {
				return Matter.Bodies.rectangle(x, y, sideLen, sideLen, options);
				}
			);
		this.mesh = Matter.Composites.mesh(this.composite, columns, rows, crossBrace);

		Matter.World.add(world, this.composite);
	}

	draw_floor() {
	var parr = [];
	parr = Matter.Composite.allBodies(this.composite);
	for (var i = 0; i < parr.length; i++) {
		var pos = parr[i].position;
		push();
		translate(pos.x, pos.y);
		let c = color(this.re, this.g, this.b);
		fill(c);
		rect(0, 0, this.r*2, this.r*2);
		pop()
		}
	}
}

class Actor {
	constructor
		(x, 
		y, 
		width, 
		height, 
		r=get_random(90, 255), 
		g=get_random(90, 255), 
		b=get_random(90, 255)
		){

			//coords
			this.x = x;
			this.y = y;
			this.w = width;
			this.h = height;

			//colours 
			this.r = r;
			this.g= g;
			this.b = b;
			var options;
			//matter :D stuff
			
			options = {
				restitution: 0,
				isStatic: false,
				density: 0.95,
				friction: 0.99,
				inertia: Infinity //prevents rotation in the physics engine
				};

			
			this.body = Matter.Bodies.rectangle(x, y, width, height, options);
			Matter.World.add(world, this.body);
			this.pos = this.body.position;
		}

	move_rand() {
		let sel = get_random(0, 10);
		switch (sel) {
			case (9):
				this.pos.x--;
				break;
			case (5):
				this.pos.x++;
				break;
			case (3):
				if (e_cooldown <= 0) {
					shoot("left", this, e_xvel, e_yvel);
					e_cooldown = 30;
					}
			}
		sel = get_random(0, e_xvel) 
			switch (sel) {
				case (e_xvel):
					e_xvel--;
					break;
				case (e_xvel+1):
					e_xvel++;
					break;
				}
		sel = get_random(0, e_yvel)
			switch (sel) { 
				case (e_yvel):
					e_yvel--;
					break;
				case (e_yvel + 1):
					e_yvel++;
					break;
				}
			}
	
	
	//this is our player
	draw_actor() { 
		rectMode(CENTER);
		let c = color(this.r, this.g, this.b);
		fill(c);
		rect(this.pos.x, this.pos.y, this.w, this.h);
		}

	wall_check(pushval, forbul = false, obj=wall) {
		let wall_block_ls = [];
		wall_block_ls = Matter.Composite.allBodies(obj.composite);
		for (let i =0; i < wall_block_ls.length; i++) {
		if (Matter.Bounds.overlaps(this.body.bounds, wall_block_ls[i].bounds)) {
			this.pos.x += pushval;
			if (forbul) {
				let vals = [true, wall_block_ls[i], i]
				return vals;
				}
			}
		}
	}
}
//PREVENT X COORDS FROM LEAVING X RANGE todo
//this is the enemy 
class Player extends Actor{
	constructor(x, y, width, height, r=get_random(90, 255), g=get_random(90, 255), b=get_random(90, 255)) {
		//the player class is a subclass of actor (any character in the game)
		//it is a moving character that the player controls and thus shares a lot of similarities with actors, but with extra functionality.
		super(x, y, width, height, r, g, b,);
	}

	player_move(dir, amt){
		//move the player a set amount(amt) in a set direction(dir).
		//dir will take either "x" or "y" and amt will take any number, pos or neg to allow for all the directions.
		if (dir == "x") {
			this.pos.x += amt;
		}
		else {
			this.pos.y += amt; 
		}
		
	}

	player_wall_check() {
	//prevents player crossing border
	if (this.pos.x + this.w/2 > VP_WIDTH/2) {
		this.pos.x = VP_WIDTH/2 - this.w/2 - 5;
		}
	}
	
}
class Bullet extends Actor{
	constructor(x, y, width, height, obj, xvel, yvel, r=get_random(90, 255), g=get_random(90, 255), b=get_random(90, 255)) {
		//the player class is a subclass of actor (any character in the game)
		//it is a moving character that the player controls and thus shares a lot of similarities with actors, but with extra functionality.
		super(x, y, width, height, r, g, b);
		this.obj = obj;
		this.destroyed = false;
		this.block_to_destroy = "no";
		if (this.obj == e) {
			console.log(xvel, yvel);
		}
		Matter.Body.setVelocity(this.body, {x: xvel, y: -yvel});
	}

	collide(obj) {
		let toDelete = this.wall_check(0, true, obj);
		if (toDelete != undefined) {
			if (toDelete[0] == true) {
				Matter.World.remove(world, this.body);
				this.destroyed = true;
				console.log(toDelete[1]);
				this.block_to_destroy=toDelete[1];
				this.block_idx = toDelete[2];
				Matter.World.remove(world, this.block_to_destroy);
			}
		}
	}
}

function preload() {
	//a 'p5' defined function runs automatically and used to handle asynchronous loading of external files in a blocking way; once complete
	//the 'setup' function is called (automatically)
}

function shoot(dir, obj, xvel=arc_x, yvel=arc_y) {
	if (dir == "right") {
		bulx = obj.pos.x; //+ 50;
		buly = obj.pos.y - 50;
	}
	else {
		bulx = obj.pos.x; //- 50;
		buly = obj.pos.y - 50;
	}
	bullet = new Bullet(bulx, buly, 5, 5, obj, xvel, yvel);
	bullet_ls.push(bullet);
}

function key_press() {
	//a simple method to add listening events for if a key is pressed and then to direct the code to the appropriate action through selection
	document.addEventListener('keydown', function (event) {
		console.log(event.key);

		if (game_state != "play") {
			console.log("starting round");
			game_state = "play";
			play_setup();
		}

		switch (event.key) {

		case('a'): 
			p.player_move("x", (P_SPEED - P_SPEED*2));
			dir = "left";
			break;

		case('d'):
			p.player_move("x", P_SPEED);
			dir = "right";
			break;

		case(' '):
			if (game_state == "play"){ 
				
				if (cooldown <= 0) {
					shoot(dir, p, arc_x, arc_y);
					cooldown = 30;
				}
		break;

		}

		case ('ArrowUp'):
			if (arc_y < 25) {
				arc_y++;
			}
			break;

		case ('ArrowDown'):
			if (arc_y > 0) { 
				arc_y--;
			}
			break;

		case ('ArrowRight'):
			if (arc_x < 25) { 
				arc_x++;
			}
			break;

		case ('ArrowLeft'):
			if (arc_x > 0) { 
				arc_x--;
			}
			break;
		}		  
	});
}

//todo make shoot and move function more general - just pass through obj

function setup() {
	//a 'p5' defined function runs automatically once the preload function is complete
	viewport = createCanvas(VP_WIDTH, VP_HEIGHT); //set the viewport (canvas) size
	viewport.parent("viewport_container"); //attach the created canvas to the target div
	//cooldown = 0
	//enable the matter engine
	engine = Matter.Engine.create(); //the 'engine' is a controller that manages updating the 'simulation' of the world
	world = engine.world; //the instance of the world (contains all bodies, constraints, etc) to be simulated by the engine
	body = Matter.Body; //the module that contains all 'matter' methods for creating and manipulating 'body' models a 'matter' body 
	engine.positionIterations = 10;
	engine.velocityIterations = 10;
	//is a 'rigid' body that can be simulated by the Matter.Engine; generally defined as rectangles, circles and other polygons)

	frameRate(FPS); //specifies the number of (refresh) frames displayed every second
	key_press();

}

function paint_background() {
	//a defined function to 'paint' the default background objects & colours for the world per frame
	background(BG_COLOUR_R, BG_COLOUR_G, BG_COLOUR_B); //use a 'hex' (denoted with '#') RGB colour (red: a0, green: a1, blue: a2 - appears as a grey colour) to set the background
}

function paint_assets() {
	//a defined function to 'paint' assets to the canvas
	p.draw_actor();
	e.draw_actor();
	wall.draw_floor();
	floor.draw_floor();
	for (let i=0; i < bullet_ls.length; i++) {
		if (bullet_ls[i].destroyed == false) {
			bullet_ls[i].draw_actor();
		}
		else {
			Matter.Composite.remove(floor.composite, bullet_ls[i].block_to_destroy);
			let floor_arr = Matter.Composite.allBodies(floor.composite);
			floor_arr[bullet_ls[i].block_idx] = "";
			//console.log(bullet_ls[i].block_to_destroy);
			//Matter.Composite.remove(composite, object
			bullet_ls.splice(i, 1);
		}
	}
}

function play_setup() {
	wall = new Wall(VP_WIDTH/2, VP_HEIGHT/2, 2, 20, 10, 10, true, 10);
	p = new Player(50, 300, P_SIZE + 10, P_SIZE, get_random(30, 90), get_random(30, 90), get_random(30, 90));
	e = new Actor(VP_WIDTH-50, 300, P_SIZE + 10, P_SIZE);
	floor = new Wall(0, VP_HEIGHT/2+100, 30, 5, 20, 20, true, 20); //see draw for reasoning on floor fix
}

function draw_text(x=50, y=50, text_to_display=p_score + " -" + e_score, colour='white', size=50) { 
	rectMode(CENTER);
	let c = color(colour);
	fill(c);
	textSize(size);
	text(text_to_display, x, y);
}
function frameCalcs() {
	//p.player_wall_check();
	p.wall_check(-5, false, wall);
	//p.wall_check(-5, false, floor);
	//p.wall_check(5, false, floor);
	e.move_rand();
	e.wall_check(5);
	for (let i=0; i < bullet_ls.length; i++) {
		bullet_ls[i].collide(wall);
		bullet_ls[i].collide(floor);
	}
	cooldown--;
	e_cooldown--;
	if (p.pos.y > VP_HEIGHT || e.pos.y > VP_HEIGHT) {
		if (p.pos.y > VP_HEIGHT) {
			e_score++;
		}
		if (e.pos.y > VP_HEIGHT) {
			p_score++;
		}

		game_state = "round over screen";

		Matter.World.remove(world, p.body);
		Matter.World.remove(world, e.body);

		for (let i = 0; i < bullet_ls.length; i++) {
			Matter.World.remove(world, bullet_ls[i].body);
			bullet_ls.splice(i, 1);
		}
		Matter.Composite.clear(floor.composite, false);
		Matter.Composite.clear(wall.composite, false);
	}	
}

function draw() {
	//a 'p5' defined function that runs automatically and continously (up to your system's hardware/os limit) and based on any specified frame rate
	//Matter.Body.setAngle(p.body, 0); //this stops the player from spinning in the pyhsics engine thus fixing the floor issue and allowing collison to hold up the actor.
	paint_background();
	if (game_state == "play") {
		frameCalcs();
		Matter.Engine.update(engine);
		paint_assets();
		draw_text();
	}
	if (game_state == "start") {
		draw_text(VP_WIDTH/2-200, VP_HEIGHT/2-200, "tanks?", 'green', 100);
		draw_text(VP_WIDTH/2, VP_HEIGHT/2, "press space to start", 'green', 50);
		draw_text(0,VP_HEIGHT-20, "graphic design is my passion", 'red', 20);
	}
	if (game_state == "round over screen") {
		draw_text();
		draw_text(VP_WIDTH/2-200, VP_HEIGHT/2-200, "round over", 'purple', 100);
	}
}
