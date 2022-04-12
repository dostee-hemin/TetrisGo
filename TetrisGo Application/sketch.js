// This variable determines which scenario in the application we are in. It helps in scene navigation
let gameState = 0;

function createEffects() {
  // Load the effects text file and store the time and pose of each effect
  for(let i=0; i<effectsTxt.length; i++) {
    let elements = split(effectsTxt[i], " ");
    mappedPieces[i] = {time: float(elements[0]), type: int(elements[1])};
  }
  console.log(mappedPieces);
}
  
async function setup() {  
  createCanvas(1300, 800);
    
  // Call the setup function for the pose detection part of the application
  setupPoseDetectionPart();

  // Call the setup function for the tetris part of the application
  setupTetrisPart();
  
  effectsTxt = loadStrings('effects.txt', createEffects);
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
    if(armPoints == null) text("Waiting for model to load...", width/2, height/2);

    // If the model is loaded, display a "press start" text
    else text("Press start!", width/2, height/2);
  }
}

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

      // Everytime the countdown timer loses a second (i.e. 60 frames), play a sound
      if(startingCountdownTimer % 60 == 0) {
        if(startingCountdownTimer < 120) goSound.play();
        else playSound(countdownSound);
      }

      
      // Decrement the frames remaining in the timer
      startingCountdownTimer--;
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

  // Once the countdown timer finishes, play the theme song
  if(startingCountdownTimer > -10 && startingCountdownTimer != 20) {
    startingCountdownTimer = -20;
    startSecond = millis()/1000;
  }

  if(millis()/1000 > startSecond + startDelay) themeSong.play();



  /*----------------- Tetris Part ----------------*/

  // Set the current tetromino type to the next piece that's coming in the song
  currentTetrominoType = mappedPieces[0].type;

  // Calculate the y position of the piece in the track
  var y = acceptanceAmount/2+(mappedPieces[0].time+startSecond+startDelay-millis()/1000) * scalingFactor;
  
  // If the player couldn't pose in time, drop a scrambled tetromino
  if (y < 0) {
    upcomingPieces.push(currentTetrominoType+7);
    playSound(wrongSound);
    mappedPieces.shift();
  } 
  // If the player did do the correct pose in the allowed amount of time, drop an ordinary tetromino
  else if(y < acceptanceAmount) {
    if(allLabels.indexOf(label) == currentTetrominoType) {
      upcomingPieces.push(currentTetrominoType);
      playSound(correctSound);
      mappedPieces.shift();
    }
  }

  // If there are pieces ready to drop, drop the first one and wait for it to finish before dropping again
  if(upcomingPieces.length != 0 && canDropPiece) {
    // Drop the current piece with a given type and whether or not to scramble
    dropTetromino(upcomingPieces[0]%7,(upcomingPieces[0]>6));
    canDropPiece = false;
  }

  // After a certain amount of frames, move the current piece down
  if (frameCount % speed == 0 && !canDropPiece) currentTetromino = moveDown(currentTetromino);
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
      if(keyCode == RETURN) {
        gameState = 1;
      }
      break;
  }
}