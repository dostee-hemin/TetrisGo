/*  This code file is split into the following sub-sections:
  Variables               (the variables globally associated with the game)
  Setup                   (initial setup of the program that is run once at the start)
  Draw                    (continuous loop that is run every frame)
  Game States             (the different stages of the program)
*/





/*-------------------- Variables -------------------*/

// This variable determines which scenario in the application we are in. It helps in scene navigation
let gameState = "Main Menu";      // Determines which environment of the program we are in
let iconSize = 150;               // Determines the size of the song boxes that you select
let isDoingTutorial = false;      // Determines whether or not the player would like to start the game with a tutorial

let showKeypoints = false;        // Determines whether or not we should show the keypoints of the predictions
let showArms = false;             // Determines whether or not we should show the arm segments of the predictions
let switchPosition = {x1: 0, x2: 0};
let framerateLogs = [];           // Stores a bunch of framerate values to display as a graph







/*-------------------- Setup -------------------*/
// This is the starting point of the program. 
// It manages setting up the scene, loading data, and other initial preparations.
function setup() {
  createCanvas(1260, 700);

  // Initialize the toggle switch positions
  switchPosition.x1 = width - width / 8 - 50;
  switchPosition.x2 = switchPosition.x1;

  // Load the info about the songs
  loadSongsInfo();

  // Call the setup function for the pose detection part of the application
  setupPoseDetectionPart();

  // Call the setup function for the tetris part of the application
  setupTetrisPart();

  setupAnimationPart();
}







/*-------------------- Draw -------------------*/
// This code is run every frame, 
// and it is what we use to display and update the game
function draw() {
  switch (gameState) {
    case "Main Menu":
      mainMenu();
      break;
    case "Game Scene":
      gameScene();
      break;
    case "Game Over":
      gameOver();
      break;
    case "Adjust Camera":
      adjustCamera();
      break;
    case "Select Song":
      selectSong();
      break;
    case "Tutorial":
      tutorialScene();
      break;
    case "Level Completed":
      levelCompleted();
      break;
  }

  showTransition();

  // Add a new framerate to the list of logs
  framerateLogs.push(round(frameRate()));
  // If the number of logs gets too large, remove the oldest log
  if (framerateLogs.length > 200) framerateLogs.shift();
}









/*-------------------- Game States -------------------*/
// Function that is called when we are in the main menu
function mainMenu() {
  // Set a solid background color
  background(255);

  // After we have shown the prompt, start adding and updating pieces in the rain effect
  if (promptSize > 0.95) rainEffect.update();
  rainEffect.display();

  // Draw the logo with the proper scale and rotation
  push();
  translate(width / 2 - 20, height / 2);
  rotate(logoSize * HALF_PI - HALF_PI);
  scale(logoSize);
  tint(0);
  imageMode(CENTER);
  image(logoImage, 7, 7);
  noTint();
  image(logoImage, 0, 0);
  pop();

  // Draw the prompt that asks the user to press enter
  push();
  translate(width / 2, height - 50);
  scale(promptSize);
  textAlign(CENTER);
  strokeWeight(5);
  fill(98, 176, 245);
  stroke(0);

  // Loop through all the characters in the prompt string
  for (var i = 0; i < promptOffsets.length; i++) {
    // Get the current position and character
    var x = -(promptOffsets.length / 2 * 25) + i * 25;
    var y = -promptOffsets[i];
    var c = prompt.charAt(i);

    // Display the character
    textSize(40);
    text(c, x, y);

    // Calculate where the current position of the wave is (between 0 and the length of the prompt)
    var wavePosition = (frameCount % 90) / 90 * promptOffsets.length;

    // If the current character is withing a short distance of the wave position, make it rise, if not, make it fall
    var target = 0;
    if (abs(i - wavePosition) < 1) target = 30;
    promptOffsets[i] = lerp(promptOffsets[i], target, 0.1);
  }
  pop();

  // Grow the logo and the prompt in size
  logoSize = lerp(logoSize, 1, 0.1);
  if (logoSize > 0.98) promptSize = lerp(promptSize, 1, 0.1);

}


// Function that is called when we are adjusting the camera
function adjustCamera() {
  // Set a solid background color
  background(255);


  // Draw the webcam feed in the middle of the screen
  imageMode(CENTER);
  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  image(video, 0, 0);
  pop();
  // Outline
  stroke(0);
  strokeWeight(10);
  noFill();
  rect(width / 2, height / 2, video.width, video.height);

  if (showArms) {
    stroke(255, 0, 0);
    strokeWeight(4);
    for (let i = 0; i < armPoints.length - 1; i++) {
      // Get the current keypoint and the next keypoint
      let p1 = createVector(armPoints[i].x, armPoints[i].y);
      let p2 = createVector(armPoints[i + 1].x, armPoints[i + 1].y);

      // Add a correction so that we always get the right pair of arm points
      if (i == 1) i++;

      // If any of the points are outside of the video box, don't display this segment
      if (p1.x < 0 || p1.x > video.width || p1.y < 0 || p1.y > video.height ||
        p2.x < 0 || p2.x > video.width || p2.y < 0 || p2.y > video.height)
        continue;

      // Draw a line between the two keypoints
      line(p1.x + (width - video.width) / 2, p1.y + (height - video.height) / 2, p2.x + (width - video.width) / 2, p2.y + (height - video.height) / 2);
    }
  }

  if (showKeypoints) {
    fill(255, 255, 0);
    stroke(0);
    strokeWeight(3);
    // Loop through all the keypoints and show them as circles
    for (let i = 0; i < keypoints.length; i++) {
      var x = keypoints[i].x + (width - video.width) / 2;
      var y = keypoints[i].y + (height - video.height) / 2;
      ellipse(x, y, 6, 6);
    }
  }


  // Title of page
  noStroke();
  fill(98, 176, 245);
  stroke(0);
  rectMode(CENTER);
  strokeWeight(2);
  rect(width / 2, 88, 700, 6);
  strokeWeight(5);
  textSize(60);
  textAlign(CENTER, BASELINE);
  text("Adjust Camera Position", width / 2, 75);

  // Stats titles
  textSize(30);
  strokeWeight(2);
  text("Model Prediction:", width / 8, height / 3);
  text("Frame rate:", width / 8, height / 2 + 50);
  text("Show Keypoints:", width - width / 8, height / 3);
  text("Show Arms:", width - width / 8, height / 2 + 50);

  // Yes and no boxes
  stroke(0);
  strokeWeight(4);
  fill(0, 150, 0);
  rect(width - width / 8 - 50, height / 3 + 50, 100, 50);
  rect(width - width / 8 - 50, height / 2 + 100, 100, 50);
  fill(150, 0, 0);
  rect(width - width / 8 + 50, height / 3 + 50, 100, 50);
  rect(width - width / 8 + 50, height / 2 + 100, 100, 50);

  // Yes and no texts
  textAlign(CENTER, CENTER);
  strokeWeight(3);
  fill(0, 255, 0);
  stroke(0, 200, 0);
  text("Yes", width - width / 8 - 50, height / 3 + 50);
  text("Yes", width - width / 8 - 50, height / 2 + 100);
  fill(255, 0, 0);
  stroke(200, 0, 0);
  text("No", width - width / 8 + 50, height / 3 + 50);
  text("No", width - width / 8 + 50, height / 2 + 100);

  // Toggle switches
  fill(0, 200);
  noStroke();
  var x = width - width / 8 - 50;
  if (showKeypoints) x += 100;
  switchPosition.x1 = lerp(switchPosition.x1, x, 0.2);
  rect(switchPosition.x1, height / 3 + 50, 100, 50);
  x = width - width / 8 - 50;
  if (showArms) x += 100;
  switchPosition.x2 = lerp(switchPosition.x2, x, 0.2);
  rect(switchPosition.x2, height / 2 + 100, 100, 50);

  // Get the index in the allLabels array that the current prediction is located
  let indexOfLabel = allLabels.indexOf(label);
  // Display the current label as a piece
  if (indexOfLabel < 7 && indexOfLabel > -1) {
    colorFromType(indexOfLabel + 1);
    noStroke();
    drawPieceShape(indexOfLabel, width / 8, height / 3 + 60, 28);
  }
  // Display the current label as text
  else {
    fill(0);
    noStroke();
    text(label, width / 8, height / 3 + 60);
  }
  
  // Display the current framerate
  fill(0);
  text(round(frameRate()), width / 8, height / 2 + 110);

  // Create the graph from the list of framerate logs
  fill(0, 255, 0, 100);
  stroke(0, 200, 0);
  strokeWeight(1);
  beginShape();
  vertex(width / 8 - 100, height / 2 + 200)
  for (var i = 0; i < framerateLogs.length; i++) {
    vertex(width / 8 - 100 + i, height / 2 + 200 - framerateLogs[i] / 70 * 50);
  }
  vertex(width / 8 - 101 + framerateLogs.length, height / 2 + 200)
  endShape(CLOSE);

  // Create the graph axis
  stroke(0);
  strokeWeight(3);
  line(width / 8 - 100, height / 2 + 150, width / 8 - 100, height / 2 + 200);
  line(width / 8 - 100, height / 2 + 200, width / 8 + 100, height / 2 + 200);

  // Display instructions for confirming the camera position
  textSize(40);
  fill(200);
  text("Press 'Enter' to Confirm", width / 2, height - 50);
}


// Function that is called when we want to choose a song
function selectSong() {
  // Set a solid background color
  background(255);

  // Title of page
  fill(98, 176, 245);
  stroke(0);
  strokeWeight(5);
  textSize(60);
  text("Select Your Song", width / 2, 75);


  // Display and update the song cards
  for(var i=0; i<songs.length; i++) {
    songs[i].display(lerpCardX+i*cardWidth*1.1);
    songs[i].interactWithMouse();
  }

  // Draw a white fade on both sides of the screen over the cards
  strokeWeight(2);
  for(var i=0; i<100; i++) {
    stroke(255,map(i,0,100,255,0));
    line(100+i,0,100+i,height);
    line(width-100-i,0,width-100-i,height);
  }
  noStroke();
  fill(255);
  rect(50,height/2,100,height);
  rect(width-50,height/2,100,height);

  // Move the cards to the correct position
  lerpCardX = lerp(lerpCardX,startCardX,0.1);

  // Toggle switch for Tutorial
  strokeWeight(4);
  if(isDoingTutorial) {
    fill(255,154,0,50);
    stroke(255,77,0);
  } else {
    noFill();
    stroke(100);
  }
  rectMode(CENTER);
  rect(width/2,height-50,180,60,5)
  fill(200);
  stroke(0);
  strokeWeight(3);
  textSize(50);
  text("Tutorial", width/2, height-50);

  // Move left and right buttons
  strokeWeight(5);
  triangle(30,height/2,90,height/2-30,90,height/2+30);
  triangle(width-30,height/2,width-90,height/2-30,width-90,height/2+30);
}


// Function that is called when we are in the game scene
function gameScene() {
  // Draw a gradient background
  for (let y = 0; y < height; y++) {
    stroke(0, map(y, 0, height, 0, 255), 255);
    strokeWeight(1);
    line(0, y, width, y);
  }
  
  // Display all the graphics related to the pose detection
  displayPoseElements();
  
  // Display all the graphics related to the tetris game
  displayGameElements();
  displayTetrisElements();

  if(isTransitioning) return;

  if(countdownStart == 0) countdownStart = millis();
  
  // Update and display the countdown timer and leave the function
  var currentSecond = floor(millis() - countdownStart) / 1000;
  if (currentSecond < 4) {

    // Dim the screen black
    fill(0, 200);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, width, height);

    // Timer
    var txts = ["3", "2", "1", "GO!"];
    fill(255, 255, 0);
    textSize(150);
    textAlign(CENTER);
    text(txts[int(currentSecond)], width / 2, height / 2);

    // Everytime the countdown timer loses a second (i.e. 60 frames), play a sound
    if (currentSecond % 1 < 0.1) {
      if (currentSecond > 3) goSound.play();
      else playSound(countdownSound);
    }
    return;
  }
  // Once the countdown timer finishes, set the time that the game starts
  else if (startSecond == 0) {
    startSecond = millis() / 1000;
    songs[chosenSong].music.play(startDelay);
  }

  // If we have reached the end of the song, the level has been completed so move on to the level completion scene
  if (millis() / 1000 > startSecond + startDelay + songs[chosenSong].music.duration()) {
    gameState = "Level Completed";
  }

  updateGameElements();
}


function tutorialScene() {
  // Draw a gradient background
  for (let y = 0; y < height; y++) {
    stroke(0, map(y, 0, height, 0, 255), 255);
    strokeWeight(1);
    line(0, y, width, y);
  }

  // Display what the pose detector sees and the upcoming pieces
  displayPoseElements();
  displayTetrisElements();

  if(isTransitioning) return;
  if(startSecond == 0) startSecond = millis()/1000;

  updateGameElements();

  // For the first few seconds in the tutorial, display some text indicating when to pose properly
  if (startSecond + startDelay - millis() / 1000 > -1.5) {
    fill(255);
    textSize(25);
    textAlign(CENTER);
    noStroke();
    text("When the piece comes here,\nmake the correct pose", 170, 50 + acceptanceAmount / 2);

    // Arrow pointing to the middle of the acceptance zone
    stroke(255);
    strokeWeight(5);
    line(340, 50 + acceptanceAmount / 2, 390, 50 + acceptanceAmount / 2);
    line(365, 25 + acceptanceAmount / 2, 390, 50 + acceptanceAmount / 2);
    line(365, 75 + acceptanceAmount / 2, 390, 50 + acceptanceAmount / 2);
  }

  // If there are pieces coming, display the correct pose image that represents the current piece
  if (mappedPieces.length != 0) {
    if (abs((mappedPieces[0].time + startSecond + startDelay) - millis() / 1000) < poseTime - 0.3) {
      imageMode(CENTER);
      image(poseImages[mappedPieces[0].type], 210, height / 2, 400, 400);
    }
  }

  // If we have finished the tutorial, enter the game scene
  if (millis() / 1000 > startSecond + 40) {
    gameState = "Game Scene";
    countdownStart = millis();
    startSecond = 0;
    setupTetrisPart();
    mappedPiecesTxt = loadStrings("assets/Mapped Pieces/" + songs[chosenSong].name + " Pieces.txt", setupMappedPieces);
  }
}

function gameOver() {
  // Draw a gradient background
  for (let y = 0; y < height; y++) {
    stroke(0, map(y, 0, height, 0, 255), 255);
    strokeWeight(1);
    line(0, y, width, y);
  }

  // Game over text
  fill(255, 0, 0);
  textSize(150);
  textAlign(CENTER);
  if (int(frameCount / 30) % 2 == 0) text("Game Over", width / 2, 200);

  // Stats
  fill(255);
  textSize(75);
  text("Score = " + score, width / 2, height / 2 - 50);
  text("Line Count = " + lineCount, width / 2, height / 2 + 50);
  text("Best Score = " + highScore, width / 2, height / 2 + 150);
  text("Best Line Count = " + highScoreLineCount, width / 2, height / 2 + 250);

  // Restart
  fill(200);
  text("Press 'r' to restart", width / 2, height / 2 + 350);
}

function levelCompleted() {
  // Draw a gradient background
  for (let y = 0; y < height; y++) {
    stroke(0, map(y, 0, height, 0, 255), 255);
    strokeWeight(1);
    line(0, y, width, y);
  }

  // Win text
  fill(255, 255, 0);
  textSize(150);
  textAlign(CENTER);
  noStroke();
  text("Level Completed!", width / 2, 200);

  // Stats
  fill(255);
  textSize(75);
  text("Score = " + score, width / 2, height / 2 - 50);
  text("Line Count = " + lineCount, width / 2, height / 2 + 50);
  text("Best Score = " + highScore, width / 2, height / 2 + 150);
  text("Best Line Count = " + highScoreLineCount, width / 2, height / 2 + 250);
}