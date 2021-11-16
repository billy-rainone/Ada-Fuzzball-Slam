"use strict"; //incorporating this 'expression' tells the browser to enable 'strict mode' - this mode helps ensure you write better code, for example, it prevents the use of undeclared variables.

//CONSTANTS

//viewport constants
const VP_WIDTH = 920, VP_HEIGHT = 690; //defined global const variables to hold the (vp) details (e.g., size, etc.)

//player constants

const P_SPEED = 1;
const P_SIZE = 40;
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
var round_count = 0;
var col;
var game_state = "start";


function get_random(min, max) {
	//returns a random number in the range of min(int) and max(int)
	//min(int): the lowest possible value
	//max(int): the highest possible value
	return Math.floor((Math.random() * max) + min);
}


class Wall { 
	/*
	Class for block arrays used for the floor and wall
		-xx (int) the top left x coord for the composite
		-yy (int) the top left y coord for the composite
		-columns(int) the amount of blocks in a row
		-rows(int) the amount of blocks in a collumn
		-columnGap(int) the distance between each block column(note each block will overlap if set to 0)
		-columnGap(int) the distance between each block column(note each block will overlap if set to 0)
		-crossBrace(bool) matter js variable that stiches the composite as x joints (true) instead of + joints (false)
		-sideLen(int) the length of the sides of an individual block
		-[optional]red(int) red value to colour block (default is random)
		-[optional]g(int) green value to colour block (default is random)
		-[optional]b(int) blue value to colour block (default is random)
	*/
	constructor(
	xx,
	yy,
	columns,
	rows,
	columnGap,
	rowGap,
	crossBrace,
	sideLen, 
	red=get_random(90, 255), 
	g=get_random(90, 255), 
	b=get_random(90, 255)
	){
		//set vars
		this.r = sideLen;
		this.red = red;
		this.g = g;
		this.b = b;

		//set options (JSON) for matter.js
		let options ={
			restitution: 0.00,
			isStatic: true,
			density: 0.99,
			friction: 0.99
			};

		//set the composite using the passed through variables
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

		//add the composite to the matter-js world
		Matter.World.add(world, this.composite);
	}

	draw_floor() {
	/*
	This method draws the composite and is run every frame
		-parr(list) temporarily stores all the bodies of the composite in a list so that the code can iterate through each block and draw it
	*/
	//set parr to all bodies in composite
	let parr = [];
	parr = Matter.Composite.allBodies(this.composite);

	//get each block
	for (let i = 0; i < parr.length; i++) {
		//draw block
		let pos = parr[i].position;
		push();
		translate(pos.x, pos.y);
		fill(color(this.red, this.g, this.b));
		rect(0, 0, this.r*2, this.r*2);
		pop()
		}
	}
}

class Actor {
	/*
	Class for every object that is a moveable entity within the game (parent class for player and bullet)
		-x(int) the spawn (starting) x coordinate for the entity
		-y(int) the spawn y coordinate for the entity
		-width(int) the width of the entity
		-height(int) the height of the entity
		-[optional]r(int) red value to colour block (default is random)
		-[optional]g(int) green value to colour block (default is random)
		-[optional]b(int) blue value to colour block (default is random)
	*/
	constructor
		(x, 
		y, 
		width, 
		height,
		is_bullet=true,
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
			
			//matter-js stuff
			options = {
				restitution: 0,
				isStatic: false,
				density: 0.95,
				friction: 0.99,
				inertia: Infinity //prevents rotation in the physics engine
				};
			if (is_bullet) {
				//adds ignore collisions
				options = {
					ignoresCollisions: true,
					restitution: 0,
					isStatic: false,
					density: 0.95,
					friction: 0.99,
					inertia: Infinity //prevents rotation in the physics engine
				}
			}
			
			//add to matter-js
			this.body = Matter.Bodies.rectangle(x, y, width, height, options);
			Matter.World.add(world, this.body);
			this.pos = this.body.position;
		}

	move_rand() {
		/*
		method for the enemy decision tree - very simple rng switch case
			-sel(int) random integer for decision tree to calculate what the enemy is going to do
			-shoot(func)starts the process of shooting a bullet object
				-dir(string) the direction the entitt is facing (set to left to avoid enemy shooting the wrong direction)
				-obj(object) the object calling the shoot function
				-xvel(int) the x velocity of the bullet to be shot
				-yvel(int) the y velocity of the bullet to be shot
		*/

		//create selection number
		let sel = get_random(0, 10);

		//start switch case
		switch (sel) {
			case (9):
				//move left
				this.pos.x--;
				break;
			case (8):
				//move right
				if (this.pos.x++ >= VP_WIDTH) {
					this.pos.x--;
				}
				else {
					this.pos.x++;
				}
				break;
			case (7):
				//shoot
				if (e_cooldown <= 0) {
					shoot("left", this, e_xvel, e_yvel);
					e_cooldown = 30;
					}
			}

		sel = get_random(0, e_xvel);
		switch (sel) {
			case (e_xvel):
				//arc goes further left
				e_xvel--;
				break;
			case (1):
				//arc goes further right
				e_xvel++;
				break;
		}
		sel = get_random(0, e_yvel);
		switch(sel) {
			case(e_yvel):
				//arc goes further up
				e_yvel--;
			case(1):
				//arc goes further down
				e_yvel++;
			}
		}
			
	
	
	
	draw_actor() {
		/*
		this method draws the actor and is run every frame
		*/	
		
		//classic draw function stuff
		rectMode(CENTER);
		fill(color(this.r, this.g, this.b));
		rect(this.pos.x, this.pos.y, this.w, this.h);
		}

	wall_check(pushval, forbul = false, obj=wall) {
		/*
		this method checks if actor is in a wall class (default wall) and if it is a bullet it returns information about the collision to delete bullet, otherwise it just pushes the actor back
			-pushval(int) the amount the entity is pushed back
			-[optional]forbul(bool) is the object in question a bullet (default: it isn't i.e. false)
			-[optional]obj(object)the composite the object is being checked for collision
		--------------------------------------------------------------------------------
			-wall_block_ls(list) all the blocks in the wall as a temporary list
			-vals(list) returned to the bullet with the information sought after
		*/

		//get each block body in temp list
		let wall_block_ls = [];
		wall_block_ls = Matter.Composite.allBodies(obj.composite);

		//iterate through each body
		for (let i =0; i < wall_block_ls.length; i++) {
			//check if a collision has been made
			if (Matter.Bounds.overlaps(this.body.bounds, wall_block_ls[i].bounds)) {
				this.pos.x += pushval;
				//if the object is a bullet return the information to delete
				if (forbul) {
					let vals = [true, wall_block_ls[i], i]
					return vals; 
				}
			}
		}
	}
}
//PREVENT X COORDS FROM LEAVING X RANGE todo
class Player extends Actor{
	/*
	class for the player - child class of actor as the player is a movable object
		-(see Actor for var explaination)
	*/
	constructor(x, y, width, height, r=get_random(90, 255), g=get_random(90, 255), b=get_random(90, 255)) {
		//the player class is a subclass of actor (any character in the game)
		//it is a moving character that the player controls and thus shares a lot of similarities with actors, but with extra functionality.
		super(x, y, width, height, r, g, b);
	}

	player_move(dir, amt){
		//move the player a set amount(amt) in a set direction(dir).
		//dir will take either "x" or "y" and amt will take any number, pos or neg to allow for all the directions.
		if (dir == "x") {
			if (this.pos.x + amt <= 0) {
				this.pos.x -= amt;
			}
			else {
			this.pos.x += amt;
			}
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
	constructor(x, y, width, height, obj, xvel, yvel, is_bullet=true, r=get_random(90, 255), g=get_random(90, 255), b=get_random(90, 255)) {
		/*
		class for bullets - child class where actor is parent
			-(see Actor for var explainations)
			-obj(object)the object calling the bullet function
			-xvel(int)the arc the bullet will follow x value
			-yvel(int)the arc the bullet will follow y value
		*/

		//get actor vars
		super(x, y, width, height, is_bullet, r, g, b);

		//get passed through vars
		this.obj = obj;
		this.destroyed = false;
		this.block_to_destroy = "no";

		//set the velocity for the bullet
		Matter.Body.setVelocity(this.body, {x: xvel, y: -yvel});
	}

	collide(obj) {
		/*
		this method checks for collisions and adds any collisions to a variable that will later delete the block, as well as deleting the bullet
			-obj(object)object shooting bullet
			-----------------------------------
			-toDelete(list) what is returned from the wall_check func. 
				toDelete[0](bool)is there any block to delete?
				toDelete[1](object)the block that needs to be deleted
				toDelete[2](int)the index of the block that needs to be deleted
		*/

		//check for collisions using wall_check method
		let toDelete = this.wall_check(0, true, obj);
		if (toDelete != undefined) {
			//if there is something to delete
			if (toDelete[0] == true) {
				//remove the bullet
				Matter.World.remove(world, this.body);
				this.destroyed = true; //this is used to check if it needs to be drawn later

				//remove the block from matter-js world
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
	/*
	this function creates a bullet which follows a trajectory based on the settings controlled by the actor that called the function
		-dir(string)what direction the bullet will go
		-obj(object) what object called the function
		-[optional]xvel(int)the x controller of the arc (default is player vars)
		-[optionAL]yvel(int)the y controller of the arc (default is player vars)
	*/

	//set starting position of the bullet to be above the actor who called the funtion
	bulx = obj.pos.x; 
	buly = obj.pos.y - 50;

	//create new bullet and push bullet to bullet_ls
	bullet = new Bullet(bulx, buly, 5, 5, obj, xvel, yvel, true);
	bullet_ls.push(bullet);
}

function key_press() {
	/*
	this function adds listening events for if a key is pressed and what key in order to take appropriate action
		-game_state(string)what screen is the game on (playing, round over or start)
	*/

	//add event listener
	document.addEventListener('keydown', function (event) {
		console.log(event.key);
		//if any key is pressed and the game is currently not playing
		if (game_state != "play") {
			if (game_state == "game over") {
				//reset scores and round count if it was a game over
				round_count = 0;
				p_score = 0;
				e_score = 0;
			}
			//start playing the game
			game_state = "play";
			play_setup();
		}
		//if any key is pressed and the game is playing
		else {
			switch (event.key) {

			case('a'): 
			//move player left
				p.player_move("x", (P_SPEED - P_SPEED*2));
				dir = "left";
				break;

			case('d'):
			//move player right
				p.player_move("x", P_SPEED);
				dir = "right";
				break;

			case(' '):
			//shoot if cooldown has worn out
				if (cooldown <= 0) {
					shoot(dir, p, arc_x, arc_y);
					cooldown = 30;
				}
				break;

			case ('ArrowUp'):
				//change arc
				if (arc_y < 25) {
					arc_y++;
				}
				break;

			case ('ArrowDown'):
				//change arc
				if (arc_y > 0) { 
					arc_y--;
				}
				break;

			case ('ArrowRight'):
				//change arc
				if (arc_x < 25) { 
					arc_x++;
				}
				break;

			case ('ArrowLeft'):
				//change arc
				if (arc_x > 0) { 
					arc_x--;
				}
				break;
			}
		}		  
	});
}

function setup() {
	/*
	a 'p5' defined function runs automatically once the preload function is complete
		-engine(matter engine) a controller that manages updating the 'simulation' of the world
		-world(matter world) the instance of the world (contains all bodies, constraints, etc) to be simulated by the engine
		-body(matter body)  the module that contains all 'matter' methods for creating and manipulating 'body' models a 'matter' body
	*/

	//p5
	viewport = createCanvas(VP_WIDTH, VP_HEIGHT); //set the viewport (canvas) size
	viewport.parent("viewport_container"); //attach the created canvas to the target div

	//matter-js
	engine = Matter.Engine.create(); 
	world = engine.world; 
	body = Matter.Body;  
	engine.positionIterations = 10;
	engine.velocityIterations = 10;

	//other setups for the game
	frameRate(FPS); //specifies the number of (refresh) frames displayed every second
	key_press();

}

function paint_background() {
	//a defined function to 'paint' the default background objects & colours for the world per frame
	background(BG_COLOUR_R, BG_COLOUR_G, BG_COLOUR_B); //use a 'hex' (denoted with '#') RGB colour (red: a0, green: a1, blue: a2 - appears as a grey colour) to set the background
}

function paint_assets() {
	/*
	a defined function to 'paint' assets to the canvas
		-bullet_ls(list) a list containing all the bullets in play
		-floor_arr(list) an array containing all the block bodies of the floor
	*/

	//draw actors
	p.draw_actor();
	e.draw_actor();

	//draw composites
	floor.draw_floor();
	wall.draw_floor();
	

	//draw bullets
	for (let i=0; i < bullet_ls.length; i++) {
		if (bullet_ls[i].destroyed == false) {
			//if the bullet is not meant to be destroyed
			bullet_ls[i].draw_actor();
		}
		else {
			//if it is meant to be destroyed
			//remove floor block
			Matter.Composite.remove(floor.composite, bullet_ls[i].block_to_destroy);
			//remove bullet from the bullet list (which is where the bullets are drawn from)
			bullet_ls.splice(i, 1);
		}
	}
}

function play_setup() {
	/*
	this function is called whenever the game state changes to playing - it sets up the main game environment through intialising the objects
		-wall(object) the wall in the middle
		-p(object) the player
		-e(object) the enemy
		-floor(object) the floor
	*/
	wall = new Wall(VP_WIDTH/2, VP_HEIGHT/2-100, 2, 20, 10, 10, true, 10);
	p = new Player(50, 300, P_SIZE + 10, P_SIZE, get_random(30, 90), get_random(30, 90), get_random(30, 90));
	e = new Actor(VP_WIDTH-50, 300, P_SIZE + 10, P_SIZE);
	floor = new Wall(0, VP_HEIGHT/2, 30, 5, 20, 20, true, 20); //see draw for reasoning on floor fix
}

function draw_text(x=50, y=50, text_to_display=p_score + " - " + e_score, colour='white', size=50) {
	/*
	this function displays the text on p5
	*/

	//basically like drawing a rect but with a string passed through
	rectMode(CENTER);
	let c = color(colour);
	fill(c);
	textSize(size);
	text(text_to_display, x, y);
}
function frameCalcs() {
	/*
	this function runs all the game stuff during each frame while the game is playing
	*/
	//wall check and move enemy
	p.wall_check(-5, false, wall);
	e.move_rand();
	e.wall_check(5);

	//bullet check collision
	for (let i=0; i < bullet_ls.length; i++) {
		bullet_ls[i].collide(wall);
		bullet_ls[i].collide(floor);
	}

	//cooldown counters
	cooldown--;
	e_cooldown--;

	//win condition
	if (p.pos.y > VP_HEIGHT || e.pos.y > VP_HEIGHT) {
		//update actor of whom did not fall below the screen
		if (p.pos.y > VP_HEIGHT) {
			e_score++;
		}
		if (e.pos.y > VP_HEIGHT) {
			p_score++;
		}
		round_count++;
		if (p_score == 3 || e_score == 3) {
			//best of 5 game
			game_state = "game over";
		}
		else {
			//if game not over it is round end
			game_state = "round over";
		}
		

		//remove actors
		Matter.World.remove(world, p.body);
		Matter.World.remove(world, e.body);
		for (let i = 0; i < bullet_ls.length; i++) {
			Matter.World.remove(world, bullet_ls[i].body);
			bullet_ls.splice(i, 1);
		}

		//and remove blocks
		Matter.Composite.clear(floor.composite, false);
		Matter.Composite.clear(wall.composite, false);
	}	
}

function draw() {
	/*
	a 'p5' defined function that runs automatically and continously (up to your system's hardware/os limit) and based on the framrate defined in setup
		-game_state(string) what mode the game is in - start, round over, or play
	*/

	//draw background no matter what state
	paint_background();

	//play state
	if (game_state == "play") {
		//game stuff
		frameCalcs();
		//matter stuff
		Matter.Engine.update(engine);
		//draw stuff
		paint_assets();
		draw_text();
	}
	//start state
	if (game_state == "start") {
		//draw text
		draw_text(VP_WIDTH/2-200, VP_HEIGHT/2-200, "tanks?", 'green', 100);
		draw_text(VP_WIDTH/2, VP_HEIGHT/2, "press any key to start", 'green', 50);
		draw_text(0,VP_HEIGHT-20, "graphic design is my passion", 'red', 20);
	}
	//round over state
	if (game_state == "round over") {
		//draw text
		draw_text();
		let next_round = round_count+1
		draw_text(VP_WIDTH/2-200, VP_HEIGHT/2-100, "round over", 'white', 100);
		draw_text(VP_WIDTH/2-200, VP_HEIGHT/2, "start round " + next_round +"/5", 'purple', 100);
	}
	//game over state
	if (game_state == "game over") {
		//draw text
		draw_text();

		//if player won
		if (p_score > e_score) {
			//display text in green and congrat player
			col = 'green';
			draw_text(VP_WIDTH/2-100, VP_HEIGHT/2+50, "you won omg", 'yellow', 100);
		}
		else {
			//display text in red and condemn player bad player
			col = 'red'
			draw_text(VP_WIDTH/2-100, VP_HEIGHT/2+50, "you lost :(", 'yellow', 100);
		}
		draw_text(VP_WIDTH/2-200, VP_HEIGHT/2-50, "game over!", col, 100);
	}
}
