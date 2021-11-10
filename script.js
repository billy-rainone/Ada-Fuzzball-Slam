"use strict"; //incorporating this 'expression' tells the browser to enable 'strict mode' - this mode helps ensure you write better code, for example, it prevents the use of undeclared variables.


//task 1 --------------
//task 1.1 - download and setup the starter code (this project) from GitHub to a suitable (and remembered) location
//task 1.2 - open the project (from its location) using a suitable editor (e.g., vscode or replit, etc)
//task 1.3 - generally review the html and css code/files (for quick reference; should be fairly clear based on work done to date) 
//task 1.4 - review the js code to help ensure you understand what each line is and does (recapped from the earlier group review to help reenforce your own learning and understanding)
//task 1.5 - reflect on the terms 'abstraction' and 'decomposition' and create a general flow diagram (covered in week 1) to illustrate the codebase use of sequence, conditional (branching), looping (iteration) and function; ideally on paper – awareness of this will be highly useful as you progress through the week

//task 2 -------------- use the ideas of 'abstraction' and 'decomposition' when reflecting on the challenges of the following tasks 
//task 2.1 - open and check the project (in this case the 'index.html' file) using the preferred browser, i.e., Chrome
//task 2.2 - implement the paint functions and debug any issue/s found; as suggested (in the brief) you will need to enable the developer tools – n.b., there are likely several layers of different problems; useful note: you can ignore any 'AudioContext' warning for the time being as we will discuss this later - however, in interested now please ask :)
//task 2.3 - expand the paint_assets function so that it draws a rectangle utilising the get_random function to position it dynamically at random positions within the defined canvas; start your research by searching “js random numbers”.  Once you developed and tested your ‘get_random’ function you will likely need to research (or recall) how to draw a rectangle with the p5 library; start your research by searching “p5 draw rectangle” - to complete this task you will likely need to combine your research and test your ideas
//task 2.4 - update the paint_background function so that the colour format uses 'integer' rgb values rather than 'hex'; start your research by searching "p5 set background color" *note ‘us’ spelling although it shouldn't make too much of a difference research-wise!

//task 3 (extended challenge) --------------
//task 3.1 - expand your 2.3 task so that your rectangle changes colour during each frame update; reflect on what you have done so far and consider and test ways this could be achieved and implemented as simply as possible 
//task 3.2 - continue to expand your 2.3 (and now 3.1) task so that your rectangle cycles through all shades of the same colour (e.g., from the darkest to the lightest shade); reflect on what you have already completed and consider and test ways this could be achieved and implemented as simply as possible; for your recall and ease of reference, colour values start from 00 (darkest, i.e., no white added) to FF (lightest, i.e., full white added) in hex or 00 - 255 in decimal

//CONSTANTS

//viewport constants
const VP_WIDTH = 920, VP_HEIGHT = 690; //defined global const variables to hold the (vp) details (e.g., size, etc.)

//player constants
const P_COLOUR = 'green'
const P_SPEED = 1;

//background colour constants
const BG_COLOUR_R = get_random(0,55); 
const BG_COLOUR_G = get_random(0,55);
const BG_COLOUR_B = get_random(0,55);

//engine constants
const FPS = 60;

var engine, world, body; //defined global variables to hold the game's viewport and the 'matter' engine components
var viewport;
var p;

function apply_velocity() {
};


function apply_angularvelocity() {
};


function apply_force() {
};


function get_random(min, max) {
	//returns a random number in the range of min(int) and max(int)
	//min(int): the lowest possible value
	//max(int): the highest possible value
	return Math.floor((Math.random() * max) + min);
}

class Actor {
	constructor(x, y, width, height, grav=true, r=get_random(90, 255), g=get_random(90, 255), b=get_random(90, 255)) {
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
		console.log(grav, x)
		if (grav != 0) {
		options = {
			restitution: 0.09,
			isStatic: false
		}
	}
		else { //this is for the floor 
			options = {
				restitution: 0.0,
				isStatic: true
			}
		}
		this.body = Matter.Bodies.rectangle(x, y, width, height, options);
		Matter.World.add(world, this.body);
		this.pos = this.body.position;
	}

	draw_actor() {
		let pos = this.body.position;
		rectMode(CENTER);
		let c = color(this.r, this.g, this.b);
		fill(c);
		rect(this.pos.x, this.pos.y, this.w, this.h);
	}
}

class Player extends Actor{
	constructor(x, y, width, height, grav=true, r=get_random(90, 255), g=get_random(90, 255), b=get_random(90, 255)) {
		//the player class is a subclass of actor (any character in the game)
		//it is a moving character that the player controls and thus shares a lot of similarities with actors, but with extra functionality.
		
		super(x, y, width, height, r, g, b,);
	}

	player_move(dir, amt){
		//move the player a set amount(amt) in a set direction(dir).
		//dir will take either "x" or "y" and amt will take any number, pos or neg to allow for all the directions.
		if (dir == "x") {
			if (this.pos.x + this.w  + amt < VP_WIDTH) { //check for if actor attempts to go off screen
				if (this.pos.x + amt > 0) {
					this.pos.x += amt;
				}
			}
		}
		else {
			if (this.pos.y + this.h + amt < VP_HEIGHT) { //same check different coord value
				if (this.pos.y + amt > 0) {
					this.pos.y += amt;
				}
			}
		}
	}
}

function preload() {
	//a 'p5' defined function runs automatically and used to handle asynchronous loading of external files in a blocking way; once complete
	//the 'setup' function is called (automatically)
}

function key_press() {
	//a simple method to add listening events for if a key is pressed and then to direct the code to the appropriate action through selection
	document.addEventListener('keydown', function (event) {
		switch (event.key) {
		case('w'):
			p.player_move("y", (P_SPEED - P_SPEED*2));
			break;
		
		case ('s'):
			p.player_move("y", P_SPEED);
			break;
		
		case('a'): 
			p.player_move("x", (P_SPEED - P_SPEED*2));
			break;
		  
		case('d'):
			  p.player_move("x", P_SPEED);
			  break;
		}
		  
	});
}
function setup() {
	//a 'p5' defined function runs automatically once the preload function is complete
	viewport = createCanvas(VP_WIDTH, VP_HEIGHT); //set the viewport (canvas) size
	viewport.parent("viewport_container"); //attach the created canvas to the target div
	
	//enable the matter engine
	engine = Matter.Engine.create(); //the 'engine' is a controller that manages updating the 'simulation' of the world
	world = engine.world; //the instance of the world (contains all bodies, constraints, etc) to be simulated by the engine
	body = Matter.Body; //the module that contains all 'matter' methods for creating and manipulating 'body' models a 'matter' body 
	//is a 'rigid' body that can be simulated by the Matter.Engine; generally defined as rectangles, circles and other polygons)
	p = new Player(100, 50, 60, 50, true, get_random(30, 90), get_random(30, 90), get_random(30, 90));
	floor = new Actor(VP_WIDTH/2, VP_HEIGHT-80, VP_WIDTH, 150, false, get_random(30, 90), get_random(30, 90), get_random(30, 90));

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
	floor.draw_actor();
}


function draw() {
	//a 'p5' defined function that runs automatically and continously (up to your system's hardware/os limit) and based on any specified frame rate
	Matter.Engine.update(engine);
	paint_background();
	paint_assets();
}
