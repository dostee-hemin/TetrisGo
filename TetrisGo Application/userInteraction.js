/*-------------------- User Interaction -------------------*/
// Function that is called when the user presses a key
function keyPressed() {
    switch(gameState) {
      case "Main Menu":
        // In the main menu, if the user presses the enter key, move on to adjusting the camera
        if(keyCode == RETURN) makeTransition("Adjust Camera");
        break;
      case "Game Scene":
      case "Game Over":
      case "Level Completed":
      case "Tutorial":
        // If the user presses the r key, reset the game
        if(key == 'r' || key == 'R') {
          songs[chosenSong].music.stop();
          makeTransition("Select Song");
        }
        break;
      case "Adjust Camera":
        // In the adjust camera panel, if the user presses the enter key, start the tetris game
        if(keyCode == RETURN) makeTransition("Select Song");
        break;
      case "Select Song":
        // Go back to the camera adjustment panel
        if(key == 'c' || key == 'C') makeTransition("Adjust Camera");
        break;
    }
  }
  
  // Function that is called when the user presses the mouse
  function mousePressed() {
    switch(gameState) {
      case "Adjust Camera":
        // Toggle switches for showing the keypoints and arms
        if(mouseInRect(width-width/8-100,width-width/8+100,height/3+25,height/3+75)) showKeypoints = !showKeypoints;
        if(mouseInRect(width-width/8-100,width-width/8+100,height/2+75,height/2+125)) showArms = !showArms;
        break;
      case "Select Song":
        // In the select song panel, allow the user to select the song the mouse is currently hovering over
        canPickSong = true;
  
        if(mouseInRect(width/2-32,width/2+32,height-82,height-18))
          isDoingTutorial = !isDoingTutorial;
        break;
    }
  }
  
  // Function that is called when the user releases the mouse
  function mouseReleased() {
    canPickSong = false;
  }
  
  function mouseInRect(x1,x2,y1,y2) {
    return mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2;
  }