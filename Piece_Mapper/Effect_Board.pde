class EffectBoard {
  PVector cursor;

  EffectBoard() {  
    cursor = new PVector();
  }

  void display() {
    // The effect board
    fill(25);
    noStroke();
    rectMode(CENTER);
    rect(700, 600, 1200, 300);

    float startX = 100 - (timelinePosition - beatOffset) * pixelsPerSecond;
    stroke(0, 0, 100);
    strokeWeight(6);
    // Display the bars every beat
    for (float x=startX; x<=1300; x+=pixelsPerBeat) {
      if (x < 100) {
        continue;
      }
      line(x, 450, x, 750);
    }

    // Bar based on precision scale
    stroke(100);
    strokeWeight(2);
    for (float x=startX - pixelsPerBeat; x<=1300; x+=pixelsPerPrecision) {
      if (x < 100) {
        continue;
      }
      line(x, 450, x, 750);
    }
    // Gray outline of board
    strokeWeight(4);
    stroke(200);
    noFill();
    rect(700, 600, 1200, 300);

    /*    Cursor on board    */
    if (isUnderMouse()) {
      // Snap onto the nearest bar based on the mouse's position
      if (pmouseX != mouseX || song.isPlaying()) {
        cursor.x = round((mouseX - startX)/pixelsPerPrecision) * pixelsPerPrecision + startX;
      }
      if (pmouseY != mouseY) {
        cursor.y = mouseY-420;
        cursor.y = round(cursor.y/42.8) * 42.8;
        cursor.y += 420;
      }

      // Display the cursor
      fill(200);
      stroke(255, 100);
      strokeWeight(2);
      triangle(cursor.x, cursor.y-10, cursor.x, cursor.y+10, cursor.x+10, cursor.y);
      line(cursor.x, 450, cursor.x, 750);
    }


    // Info text (bpm, offset, and precision)
    fill(255);
    textSize(15);
    textAlign(CENTER);
    text("BPM:", 50, 555);
    text(int(bpm), 50, 575);
    text("Beat Offset:", 50, 605);
    text(nfs(beatOffset, 1, 2), 50, 625);
    text("Precision:", 50, 655);
    text(beatPrecision, 50, 675);

    // Plus and minus signs for increasing and decreasing values
    textSize(25);
    fill(#A2D7FF);
    text("-      +", 53, 575);
    text("-      +", 53, 625);
    text("-      +", 53, 675);


    // Update and display all the effects
    for (Effect e : effects) {
      e.display();
    }
  }

  boolean isUnderMouse() {
    // Return true if the mouse is in the effect board
    return mouseX > 100 && mouseX < 1300 && mouseY > 450 && mouseY < 750;
  }
}


class Effect {
  float position;

  boolean hasBeenPlayed;
  int effectType;

  color fillColor;
  float yPosition;

  Effect(float position, int effectType) {
    this.position = position;
    this.effectType = effectType;

    switch(effectType) {
    case 0:
      // O
      fillColor = color(255, 255, 0);
      break;
    case 1:
      // I
      fillColor = color(0, 255, 255);
      break;
    case 2:
      // T
      fillColor = color(255, 0, 255);
      break;
    case 3:
      // S
      fillColor = color(0, 255, 0);
      break;
    case 4:
      // Z
      fillColor = color(255, 0, 0);
      break;
    case 5:
      // L
      fillColor = color(255, 100, 0);
      break;
    case 6:
      // J
      fillColor = color(0, 0, 255);
      break;
    }

    yPosition = 480 + effectType*42.8;
    yPosition -= 10;
  }

  void display() {
    float xPosition = 100 + (position - timelinePosition) * pixelsPerSecond;
    if (xPosition > 100 && xPosition < 1300) {
      int maxSize = 35;

      fill(fillColor);
      stroke(getDarker(color(fillColor), 0.6));
      colorMode(RGB);
      strokeWeight(3);
      switch(effectType) {
      case 0:
        // O
        rect(xPosition, yPosition, maxSize*0.9, maxSize*0.9);
        break;
      case 1:
        // I
        rect(xPosition, yPosition, maxSize*0.4, maxSize*0.9);
        break;
      case 2:
        // T
        beginShape();
        vertex(xPosition-maxSize/2, yPosition-maxSize/4);
        vertex(xPosition+maxSize/2, yPosition-maxSize/4);
        vertex(xPosition+maxSize/2, yPosition+maxSize/5);
        vertex(xPosition+maxSize/4, yPosition+maxSize/5);
        vertex(xPosition+maxSize/4, yPosition+maxSize/2);
        vertex(xPosition-maxSize/4, yPosition+maxSize/2);
        vertex(xPosition-maxSize/4, yPosition+maxSize/5);
        vertex(xPosition-maxSize/2, yPosition+maxSize/5);
        endShape(CLOSE);
        break;
      case 3:
        // S
        beginShape();
        vertex(xPosition+maxSize/2, yPosition-maxSize/4);
        vertex(xPosition+maxSize/2, yPosition);
        vertex(xPosition+maxSize/5, yPosition);
        vertex(xPosition+maxSize/5, yPosition+maxSize/4);
        vertex(xPosition-maxSize/2, yPosition+maxSize/4);
        vertex(xPosition-maxSize/2, yPosition);
        vertex(xPosition-maxSize/5, yPosition);
        vertex(xPosition-maxSize/5, yPosition-maxSize/4);
        endShape(CLOSE);
        break;
      case 4:
        // Z
        beginShape();
        vertex(xPosition-maxSize/2, yPosition-maxSize/4);
        vertex(xPosition-maxSize/2, yPosition);
        vertex(xPosition-maxSize/5, yPosition);
        vertex(xPosition-maxSize/5, yPosition+maxSize/4);
        vertex(xPosition+maxSize/2, yPosition+maxSize/4);
        vertex(xPosition+maxSize/2, yPosition);
        vertex(xPosition+maxSize/5, yPosition);
        vertex(xPosition+maxSize/5, yPosition-maxSize/4);
        endShape(CLOSE);
        break;
      case 5:
        // L
        beginShape();
        vertex(xPosition-maxSize/4, yPosition-maxSize/2);
        vertex(xPosition, yPosition-maxSize/2);
        vertex(xPosition, yPosition+maxSize/4);
        vertex(xPosition+maxSize/4, yPosition+maxSize/4);
        vertex(xPosition+maxSize/4, yPosition+maxSize/2);
        vertex(xPosition-maxSize/4, yPosition+maxSize/2);
        endShape(CLOSE);
        break;
      case 6:
        // J
        beginShape();
        vertex(xPosition+maxSize/4, yPosition-maxSize/2);
        vertex(xPosition, yPosition-maxSize/2);
        vertex(xPosition, yPosition+maxSize/4);
        vertex(xPosition-maxSize/4, yPosition+maxSize/4);
        vertex(xPosition-maxSize/4, yPosition+maxSize/2);
        vertex(xPosition+maxSize/4, yPosition+maxSize/2);
        endShape(CLOSE);
        break;
      }
    }
  }
}
