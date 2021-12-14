async function setup() {
  createCanvas(1300, 800);

  // Call the setup function for the pose detection part of the application
  setupPoseDetectionPart();

  // Call the setup function for the tetris part of the application
  setupTetrisPart();
}

function draw() {
  background(255);


  // Update the webcam frame
  webcam.update();
      
  // If the model is loaded and we need to make a prediction, make the prediction
  if(model != null && isWaitingForPlayer) predict();

  // Display all the graphics related to the pose detection
  displayPoseElements();




  /*----------------- Tetris Part ----------------*/

  // If the model is loaded and we need to make a prediction, create a tetromino based on the pose
  if(model != null && isWaitingForPlayer) {
    // This array contains all the possible piece labels that could come out of the model
    allPoses = ["O", "I", "T", "S", "Z", "L", "J"];

    // If the model's predicted pose matches the current tetromino type,
    //  that means the player has correctly performed the pose, so drop the next tetromino
    if(allPoses.indexOf(label) == currentTetrominoType) {
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

  // Display all the graphics related to the tetris game
  displayGameElements();
}