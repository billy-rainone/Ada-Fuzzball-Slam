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



const VP_WIDTH = 920, VP_HEIGHT = 690; //defined global const variables to hold the (vp) details (e.g., size, etc.)
var viewport, engine, world, body; //defined global variables to hold the game's viewport and the 'matter' engine components


function apply_velocity() {
};


function apply_angularvelocity() {
};


function apply_force() {
};


function get_random(min, max) {
}


function preload() {
	//a 'p5' defined function runs automatically and used to handle asynchronous loading of external files in a blocking way; once complete
	//the 'setup' function is called (automatically)
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


	frameRate(1); //specifies the number of (refresh) frames displayed every second

}


function paint_background() {
	//a defined function to 'paint' the default background objects & colours for the world per frame
	background('#a0a1a2'); //use a 'hex' (denoted with '#') RGB colour (red: a0, green: a1, blue: a2 - appears as a grey colour) to set the background
}


function paint_assets() {
	//a defined function to 'paint' assets to the canvas
}


function draw() {
	//a 'p5' defined function that runs automatically and continously (up to your system's hardware/os limit) and based on any specified frame rate
}
