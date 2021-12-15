// This variable determines which scenario in the application we are in. It helps in scene navigation
let gameState = 0;

async function setup() {
  createCanvas(1300, 800);

  // Call the setup function for the pose detection part of the application
  setupPoseDetectionPart();

  // Call the setup function for the tetris part of the application
  setupTetrisPart();
}

function draw() {
  switch(gameState) {
    // Main Menu
    case 0:
      mainMenu();
      break;
    // Game Scene
    case 1:
    case 2:
      gameScene();
      break;
    // Adjust Camera
    case 3:
      adjustCamera();
      break;
  }
}

function mainMenu() {
  // Set a solid background color
  background(0,40,120);

  // Display blinking text
  fill(255,0,0);
  textSize(100);
  textAlign(CENTER);
  if(int(frameCount/30)%2 == 0) {
    // If the model is not yet loaded, display a "waiting" text
    if(model == null) text("Waiting for model to load...", width/2, height/2);

    // If the model is loaded, display a "press start" text
    else text("Press start!", width/2, height/2);
  }
}

function keyPressed() {
  switch(gameState) {
    case 0:
      // In the main menu, if the user presses the enter key, move on to adjusting the camera
      if(keyCode == RETURN) gameState = 3;
      break;
    case 2:
      // In the game over scene, if the user presses the r key, reset the game
      if(key == 'r') {
        setupTetrisPart();
        gameState = 1;
      }
      break;
    case 3:
      // In the adjust camera panel, if the user presses the enter key, start the tetris game
      if(keyCode == RETURN) gameState = 1;
      break;
  }
}

function adjustCamera() {
  // Update the webcam frame
  webcam.update();

  // Make the model predict what pose the user is currently doing
  predict();

  // Set a solid background color
  background(0,40,120);

  // If there is a webcam feed available, draw it in the middle of the screen
  if(webcam.canvas) {
    push();
    translate(width/2-webcam.width/2,height/2-webcam.height/2-50);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(webcam.canvas, 0, 0);
    pop();
  }

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
    drawPieceShape(indexOfLabel, width/2, height/2+webcam.height/2+30, 28);
  } 
  // Display the current label as text
  else {
    textSize(60);
    text(label, width/2, height/2+webcam.height/2+30);
  }

  // Display instructions for confirming the camera position
  textSize(40);
  fill(200);
  text("Press 'Enter' to Confirm", 230, height-50);
}

function gameScene() {
  // Update the webcam frame
  webcam.update();

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

  // At this point, the program has displayed the game scene, 
  // but we should update only if the countdown timer has finished.
  if(gameState == 1) {
    if(startingCountdownTimer > 0) {
      // Dim the screen black
      fill(0,200);
      noStroke();
      rectMode(CORNER);
      rect(0,0,width,height);

      // Timer
      let txts = ["GO!", "1", "2", "3"];
      fill(255,255,0);
      textSize(150);
      textAlign(CENTER);
      text(txts[int(startingCountdownTimer/60)], width/2, height/2);

      startingCountdownTimer-=1.5;
      return;
    }  
  } else {
    // Dim the screen black
    fill(0,200);
    noStroke();
    rectMode(CORNER);
    rect(0,0,width,height);

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
    return;
  }
  
  
  // If the model is loaded and we need to make a prediction, make the prediction
  if(model != null && isWaitingForPlayer) predict();




  /*----------------- Tetris Part ----------------*/

  // If the model is loaded and we need to make a prediction, create a tetromino based on the pose
  if(model != null && isWaitingForPlayer) {
    // If the model's predicted pose matches the current tetromino type,
    //  that means the player has correctly performed the pose, so drop the next tetromino
    if(allLabels.indexOf(label) == currentTetrominoType) {
      // Drop an ordinary tetromino
      dropTetromino(false);
      isWaitingForPlayer = false;
    }

    // While we are waiting for the player to get into the correct pose,
    // decrease the amount of frames left for posing
    poseTimer--;
    
    // If we have run out of frames for posing, drop the tetromino but scrambled
    if(poseTimer == 0) {
      // Drop a scrambled tetromino
      dropTetromino(true);
      isWaitingForPlayer = false;
    }
  }

  // After a certain amount of frames, move down
  if (frameCount % speed == 0 && !isWaitingForPlayer) currentTetromino = moveDown(currentTetromino);
}