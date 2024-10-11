/*-------------------- User Interaction -------------------*/
// Function that is called when the user presses a key
function keyPressed() {
  switch (gameState) {
    case "Main Menu":
      // In the main menu, if the user presses the enter key, move on to adjusting the camera
      if (keyCode == RETURN) {
        label = "waiting";
        camera.start();
      }
      break;
    case "Game Scene":
    case "Game Over":
    case "Level Completed":
    case "Tutorial":
      // If the user presses the r key, reset the game
      if (key == 'r' || key == 'R') {
        songs[chosenSong].music.stop();
        makeTransition("Main Menu");
      }
      break;
    case "Adjust Camera":
      // In the adjust camera panel, if the user presses the enter key, start the tetris game
      if (keyCode == RETURN) makeTransition("Select Song");
      break;
    case "Select Song":
      // Go back to the camera adjustment panel
      if (key == 'c' || key == 'C') makeTransition("Adjust Camera");
      break;
  }
}

// Function that is called when the user presses the mouse
function mousePressed() {
  switch (gameState) {
    case "Adjust Camera":
      // Toggle switches for showing the keypoints and arms
      if (mouseInRect(width - width / 8 - 100, width - width / 8 + 100, height / 3 + 25, height / 3 + 75)) showKeypoints = !showKeypoints;
      if (mouseInRect(width - width / 8 - 100, width - width / 8 + 100, heightDiv2 + 75, heightDiv2 + 125)) showArms = !showArms;
      break;
    case "Select Song":
      // Moving the cards
      if (songs.length > 3) {
        if (dist(mouseX, mouseY, 60, heightDiv2) < 30) {
          startCardX += cardWidth * 1.1;
        } else if (dist(mouseX, mouseY, width - 60, heightDiv2) < 30) {
          startCardX -= cardWidth * 1.1;
        }
        startCardX = constrain(startCardX, widthDiv2 - cardWidth * 1.1 * (songs.length - 2), widthDiv2 - cardWidth * 1.1);
      }

      // Selecting a card
      for (var i = 0; i < songs.length; i++) {
        if (songs[i].isPressed()) {
          chosenSong = i;

          setupTetrisPart();

          // If the user chose to do the tutorial, enter the tutorial scene
          if (isDoingTutorial) {
            makeTransition("Tutorial");

            // Load the tutorial pieces into the game
            for (var x = 0; x < tutorialPieces.length; x++) {
              mappedPieces[x] = { time: tutorialPieces[x].time, type: tutorialPieces[x].type };
            }
            return;
          }

          // At this point, the user is not doing the tutorial, so directly enter the game
          makeTransition("Game Scene");
          mappedPiecesTxt = loadStrings("./TetrisGo Application/assets/Mapped Pieces/" + songs[chosenSong].name + " Pieces.txt", setupMappedPieces);
        }
      }

      // Toggle Switch
      if (mouseInRect(widthDiv2 - 90, widthDiv2 + 90, height - 90, height - 10))
        isDoingTutorial = !isDoingTutorial;
      break;
  }
}

// Returns true if the mouse is within the range of the given values
function mouseInRect(xMin, xMax, yMin, yMax) {
  return mouseX > xMin && mouseX < xMax && mouseY > yMin && mouseY < yMax;
}