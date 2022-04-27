/*-------------------- User Interaction -------------------*/
// Function that is called when the user presses a key
function keyPressed() {
    switch(gameState) {
      case "Main Menu":
        // In the main menu, if the user presses the enter key, move on to adjusting the camera
        if(keyCode == RETURN) gameState = "Adjust Camera";
        break;
      case "Game Scene":
      case "Game Over":
        // If the user presses the r key, reset the game
        if(key == 'r') {
          setupTetrisPart();
          gameState = "Select Song";
        }
        break;
      case "Adjust Camera":
        // In the adjust camera panel, if the user presses the enter key, start the tetris game
        if(keyCode == RETURN) gameState = "Select Song";
        break;
    }
  }
  
  // Function that is called when the user presses the mouse
  function mousePressed() {
    switch(gameState) {
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