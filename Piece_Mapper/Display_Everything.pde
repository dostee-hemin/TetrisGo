void DisplayEditor() {
  // Timeline, arrows, and waveform
  timeline.display();

  // Effect board and effects
  effectBoard.display();

  // Blue markers
  displayMarkers();

  // Red cursor line
  timeline.displayCursor();
  
  // Dance poses
  displayPoses();
}

void displayPoses() {
  for(int i=0; i<poses.size(); i++) {
    Pose p = poses.get(i);
    p.update();
    p.display();
    
    if(p.isFinished()) {
      poses.remove(p);
      i--;
    }
  }
}

void DisplayWaveformGeneration() {
  // Waveform box
  fill(50);
  stroke(255);
  strokeWeight(1);
  rectMode(CORNER);
  rect(0, 280, 933, 240);

  // Waveform
  stroke(255);
  strokeWeight(3);
  fill(130);
  beginShape();
  int lastI = waveform.size()-1;
  for (int i=waveform.size()-1; i>=0; i--) {
    float x = 933 - (waveform.size()-1-i)*2;
    if (x < 0) {
      break;
    }
    float y = 520 - waveform.get(i).y*240;
    vertex(x, y);
    lastI = i;
  }
  vertex(933 - (waveform.size()-1-lastI)*2, 520);
  vertex(933, 520);
  endShape(CLOSE);

  // Info text
  fill(255);
  textSize(20);
  textAlign(CORNER);
  text("Current time = " + int(song.position()/1000) + "s", 983, 400);
  text("Song duration = " + int(song.length()/1000) + "s", 983, 430);
  text("Waveform size = " + waveform.size() + " points", 983, 460);

  // Giant text at top
  textSize(60);
  textAlign(CENTER);
  text("Generating Waveform", 700, 100);

  // Text at the bottom
  textSize(30);
  text("Please do not quit the program,", 700, 650);
  text("the waveform will be saved once the song is finished playing", 700, 700);
}

void displayMarkers() {
  stroke(#17AEFC);
  fill(#17AEFC);
  strokeWeight(1);
  for (int i=markers.size()-1; i>=0; i--) {
    PVector m = markers.get(i);
    if (m.x < 100 || m.x > 1300) {
      continue;
    }

    // Display the markers
    line(m.x, m.y, m.x, 750);
    ellipse(m.x, m.y, 10, 10);

    // Highlight the marker if it's close to the mouse
    float distanceToMouse = distSq(m.x, m.y, mouseX, mouseY);
    if (distanceToMouse < 100) {
      ellipse(m.x, m.y, 15, 15);
      if (mousePressed && mouseButton == RIGHT) {
        // Remove the marker the user presses the right mouse button
        markers.remove(m);
        SaveMarkers();
      }
    }
  }
}
