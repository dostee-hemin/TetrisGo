/*  This code file is split into the following sub-sections:
  Variables               (the variables globally associated with the game)
  Setup                   (initial setup of the program that is run once at the start)
  Draw                    (continuous loop that is run every frame)
  Game States             (the different stages of the program)
  User Interaction        (manages user input like key presses and mouse clicks)
*/





/*-------------------- Variables -------------------*/

// This variable determines which scenario in the application we are in. It helps in scene navigation
let gameState = "Main Menu";
let iconSize = 200;
let canPickSong = false;
let isDoingTutorial = false;
  






/*-------------------- Setup -------------------*/
// This is the starting point of the program. 
// It manages setting up the scene, loading data, and other initial preparations.
function setup() {  
  createCanvas(1300, 800);

  // Load the info about the songs
  loadSongsInfo();
    
  // Call the setup function for the pose detection part of the application
  setupPoseDetectionPart();

  // Call the setup function for the tetris part of the application
  setupTetrisPart();
}







/*-------------------- Draw -------------------*/
// This code is run every frame, 
// and it is what we use to display and update the game
function draw() {
  switch(gameState) {
    // Main Menu
    case "Main Menu":
      mainMenu();
      break;
    // Game Scene
    case "Game Scene":
      gameScene();
      break;
    case "Game Over":
      gameOver();
      break;
    // Adjust Camera
    case "Adjust Camera":
      adjustCamera();
      break;
    case "Select Song":
      selectSong();
      break;
    case "Tutorial":
      tutorialScene();
      break;
  }
}









/*-------------------- Game States -------------------*/
// Function that is called when we are in the main menu
function mainMenu() {
  // Set a solid background color
  background(0,40,120);

  // Display blinking text
  fill(255,0,0);
  textSize(100);
  textAlign(CENTER);
  if(int(frameCount/30)%2 == 0) {
    // If the model is not yet loaded, display a "waiting" text
    if(armPoints == null) text("Waiting for model to load...", width/2, height/2);

    // If the model is loaded, display a "press start" text
    else text("Press start!", width/2, height/2);
  }
}


// Function that is called when we are adjusting the camera
function adjustCamera() {
  // Set a solid background color
  background(0,40,120);
  
  // Draw the webcam feed in the middle of the screen
  push();
  translate(width/2-video.width/2+video.width,height/2-video.height/2-50);
  scale(-1,1);
  image(video, 0, 0);
  pop();

  if(armPoints != null) {
    stroke(255,0,0);
    strokeWeight(4);
    for(let i=0; i<armPoints.length-1; i++) {
      // Get the current keypoint and the next keypoint
      let p1 = createVector(armPoints[i].x,armPoints[i].y);
      let p2 = createVector(armPoints[i+1].x,armPoints[i+1].y);

      // Draw a line between the two keypoints
      line(p1.x+(width-video.width)/2,p1.y+(height-video.height)/2-50,p2.x+(width-video.width)/2,p2.y+(height-video.height)/2-50);
      if(i==1)i++;
    }
  }
  
  noStroke();

  // Title of page
  fill(255);
  textSize(80);
  text("Adjust Camera Position", width/2, 75);

  // Get the index in the allLabels array that the current prediction is located
  let indexOfLabel = allLabels.indexOf(label);
  // Display the current label as a piece
  if(indexOfLabel < 7 && indexOfLabel > -1) {
    colorFromType(indexOfLabel+1);
    noStroke();
    drawPieceShape(indexOfLabel, width/2, height/2+video.height/2+30, 28);
  } 
  // Display the current label as text
  else {
    textSize(60);
    text(label, width/2, height/2+video.height/2+30);
  }

  // Display instructions for confirming the camera position
  textSize(40);
  fill(200);
  text("Press 'Enter' to Confirm", 230, height-50);
}


// Function that is called when we want to choose a song
function selectSong() {
  // Set a solid background color
  background(0,40,120);

  // Title of page
  fill(255);
  textSize(80);
  noStroke();
  textAlign(CENTER, CENTER);
  text("Select a Song", width/2, 75);

  // Toggle switch for Tutorial
  if(isDoingTutorial) fill(0,255,0);
  else noFill();
  stroke(150);
  strokeWeight(10);
  rectMode(CENTER);
  rect(width/2,height-50,75,75);
  fill(255);
  noStroke();
  textSize(50);
  text("Tutorial", width/2-150,height-45);

  for(var i=0; i<4; i++) {
    for(var j=0; j<3; j++) {
      var x = 50+i*iconSize*1.25;
      var y = 150+j*iconSize*1.25;

      var index = i+j*4;

      if(index >= songs.length) continue;

      // Display picture
      noStroke();
      image(songs[index].cover, x, y, iconSize, iconSize);

      
      // Display difficulty
      switch(songs[index].difficulty) {
        case 0:
          fill(0,255,0,100);
          break;
        case 1:
          fill(255,255,0,100);
          break;
        case 2:
          fill(255,0,0,100);
          break;
      }
      noStroke();
      rectMode(CORNER);
      rect(x,y+iconSize*0.8,iconSize,iconSize*0.2);
      
      
      
      // Display Name
      fill(255);
      textSize(40);
      textAlign(CENTER);
      text(songs[index].name, x+iconSize/2, y+iconSize*1.2);
      
      // Display mouse over image
      if(mouseInRect(x,x+iconSize,y,y+iconSize)) {
        stroke(0,255,0);

        // If the mouse has been clicked, enter the game scene with the song the user has picked
        if(canPickSong) {
          chosenSong = index;

          if(isDoingTutorial) {
            startSecond = millis()/1000;
            gameState = "Tutorial";
            mappedPieces = tutorialPieces;
            return;
          }

          gameState = "Game Scene";
          countdownStart = millis();
          mappedPiecesTxt = loadStrings("assets/Mapped Pieces/" + songs[chosenSong].name + " Pieces.txt", setupMappedPieces);
        }
      }
      else stroke(200);
      strokeWeight(10);
      noFill();
      rectMode(CORNER);
      rect(x,y,iconSize,iconSize, 10);
    }
  }
}


// Function that is called when we are in the game scene
function gameScene() {
  // Draw a gradient background
  for(let y=0; y<height; y++) {
    stroke(0,map(y,0,height,0,255),255);
    strokeWeight(1);
    line(0,y,width,y);
  }

  // Display all the graphics related to the pose detection
  displayPoseElements();

  // Display all the graphics related to the tetris game
  displayGameElements();
  displayTetrisElements();

  // Update and display the countdown timer and leave the function
  var currentSecond = floor(millis()-countdownStart)/1000;
  if(currentSecond < 4) {

    // Dim the screen black
    fill(0,200);
    noStroke();
    rectMode(CORNER);
    rect(0,0,width,height);

    // Timer
    var txts = ["3", "2", "1", "GO!"];
    fill(255,255,0);
    textSize(150);
    textAlign(CENTER);
    text(txts[int(currentSecond)], width/2, height/2);

    // Everytime the countdown timer loses a second (i.e. 60 frames), play a sound
    if(currentSecond % 1 < 0.1) {
      if(currentSecond > 3) goSound.play();
      else playSound(countdownSound);
    }
    return;
  } 
  // Once the countdown timer finishes, set the time that the game starts
  else if (startSecond == 0) {
    startSecond = millis()/1000;
    songs[chosenSong].music.play(startDelay);
  }
  

  updateGameElements();
}


function tutorialScene() {
  // Draw a gradient background
  for(let y=0; y<height; y++) {
    stroke(0,map(y,0,height,0,255),255);
    strokeWeight(1);
    line(0,y,width,y);
  }

  displayPoseElements();
  displayTetrisElements();
  updateGameElements();

  if(startSecond + startDelay - millis()/1000 > -1.5) {
    fill(255);
    textSize(25);
    textAlign(CENTER);
    noStroke();
    text("When the piece comes here,\nmake the correct pose", 170, 50+acceptanceAmount/2);

    stroke(255);
    strokeWeight(5);
    line(340,50+acceptanceAmount/2,390,50+acceptanceAmount/2);
    line(365,25+acceptanceAmount/2,390,50+acceptanceAmount/2);
    line(365,75+acceptanceAmount/2,390,50+acceptanceAmount/2);
  }
  
  if(mappedPieces.length != 0) {
    if(abs((mappedPieces[0].time + startSecond + startDelay)-millis()/1000) < poseTime-0.3) {
      imageMode(CENTER);
      image(poseImages[mappedPieces[0].type], 210, height/2, 400, 400);
    }
  }

  if(millis()/1000 > startSecond+40) {
    gameState = "Game Scene";
    countdownStart = millis();
    startSecond = 0;
    setupTetrisPart();
    mappedPiecesTxt = loadStrings("assets/Mapped Pieces/" + songs[chosenSong].name + " Pieces.txt", setupMappedPieces);
  }
}

function gameOver() {
  // Draw a gradient background
  for(let y=0; y<height; y++) {
    stroke(0,map(y,0,height,0,255),255);
    strokeWeight(1);
    line(0,y,width,y);
  }

  // Game over text
  fill(255,0,0);
  textSize(150);
  textAlign(CENTER);
  if(int(frameCount/30)%2 == 0) text("Game Over", width/2, 200);

  // Stats
  fill(255);
  textSize(75);
  text("Score = " + score, width/2, height/2-50);
  text("Line Count = " + lineCount, width/2, height/2+50);
  text("Best Score = " + highScore, width/2, height/2+150);
  text("Best Line Count = " + highScoreLineCount, width/2, height/2+250);

  // Restart
  fill(200);
  text("Press 'r' to restart", width/2, height/2+350);
}