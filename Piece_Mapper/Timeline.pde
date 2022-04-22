class Timeline {
  float previousCursorPosition;
  float cursorPosition;

  boolean isPlayingSong;

  Timeline() {
  }

  void display() {
    // Main timeline box
    stroke(255);
    strokeWeight(1);
    fill(255);
    textAlign(CENTER);
    textSize(20);
    line(100, 300, 1300, 300);
    int seconds = -1;
    int minutes = 0;
    for (float x=100-(timelinePosition*pixelsPerSecond); x<=1300; x+=pixelsPerSecond) {
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
      }
      if (x < 100) {
        continue;
      }
      line(x, 260, x, 300);
      text(minutes + ":" + nf(seconds, 2), x, 240);
    }

    // Scale of board
    textSize(13);
    text("Pixels/second:", 1350, 440);
    text(pixelsPerSecond, 1350, 460);
    textSize(25);
    fill(#A2D7FF);
    text("-     +", 1353, 460);

    // Arrow at the right and left (respectively)
    fill(200);
    strokeWeight(2);
    triangle(1310, 280, 1310, 320, 1330, 300);
    triangle(90, 280, 90, 320, 70, 300);

    // Current time
    String difference = str(cursorPosition - floor(cursorPosition));
    String milliseconds = "00";
    if (difference.length() == 3 && float(difference) != 0) {
      milliseconds = difference.substring(2, 3) + "0";
    } else if (difference.length() > 3) { 
      milliseconds = difference.substring(2, 4);
    }
    seconds = 0;
    minutes = 0;
    for (int i=1; i<=cursorPosition; i++) {
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
      }
    }
    fill(255);
    textSize(20);
    textAlign(CORNER);
    text("Current time = " + minutes + ":" + nf(seconds, 2) + ":" + milliseconds, 100, 440);

    // Waveform box
    rectMode(CENTER);
    fill(50);
    stroke(255);
    strokeWeight(2);
    rect(700, 360, 1200, 120);

    // Waveform 
    if (!waveform.isEmpty()) {
      fill(130);
      beginShape();
      for (PVector p : waveform) {
        float x = p.x - timelinePosition*pixelsPerSecond;
        if (x < 100) {
          continue;
        } else if (x > 1300) {
          break;
        }
        vertex(x, p.y);
      }
      vertex(1300, 420);
      vertex(100, 420);
      endShape(CLOSE);
    }
  }

  void displayCursor() {
    // Red cursor line
    stroke(255, 0, 0);
    strokeWeight(2);
    float cursorX = constrain(getCursorX(), 100, 1300);
    line(cursorX, 250, cursorX, 750);
    fill(255, 0, 0);
    noStroke();
    triangle(cursorX - 10, 250, cursorX + 10, 250, cursorX, 265);
  }

  void moveTimelinePosition(float amount) {
    // Move the timeline by the given amount and constrain it
    timelinePosition += amount;
    float maxPosition = (song.length()/1000) - (1200.0/pixelsPerSecond);
    if (timelinePosition < 0 || timelinePosition > maxPosition) {
      timelinePosition = constrain(timelinePosition, 0, maxPosition);
      return;
    }

    // Move all the markers by the given amount
    for (PVector m : markers) {
      m.x -= amount * pixelsPerSecond;
    }
  }

  void setCursorPosition(int x) {
    // Calculate the exact second the cursor is on based on the given x value
    cursorPosition = (x - (100-timelinePosition*pixelsPerSecond)) / pixelsPerSecond;

    // Cue the song to the cursor position
    song.cue(int(cursorPosition*1000));
  }

  void update() {
    if (isPlayingSong) {
      // Update the cursor position (set it directly to the song position)
      previousCursorPosition = cursorPosition;
      cursorPosition = float(song.position())/1000;

      activateEffects();

      // If the cursor goes past halfway of the screen, 
      // move the timeline in the opposite direction
      if (getCursorX() > 700) {
        float speed = cursorPosition-previousCursorPosition;
        moveTimelinePosition(speed);
      }
    }
  }

  void activateEffects() {
    for (Effect e : effects) {
      if (cursorPosition > e.position) {
        if (!e.hasBeenPlayed) {
          poses.add(new Pose(e.effectType));
          e.hasBeenPlayed = true;
        }
      } else {
        e.hasBeenPlayed = false;
      }
    }
  }

  float getCursorX() {
    // Convert the cursor's position in seconds to its position in pixels
    return (cursorPosition - timelinePosition)*pixelsPerSecond + 100;
  }

  boolean timeIsUnderMouse() {
    // Return true if the mouse is underneath the timeline board
    return mouseX > 100 && mouseX < 1300 && mouseY > 260 && mouseY < 300;
  }

  boolean arrowIsUnderMouse() {
    // Return true if the mouse is underneath one of the arrows
    return distSq(mouseX, mouseY, 80, 300) < 400 || 
      distSq(mouseX, mouseY, 1320, 300) < 400;
  }
}
