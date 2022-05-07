void keyPressed() {
  switch(key) {
  case ' ':
    timeline.isPlayingSong = !timeline.isPlayingSong;
    if (timeline.isPlayingSong) {
      song.play(song.position());
    } else {
      song.pause();
    }
    break;

  case 'w':
    AppState = 2;
    waveform.clear();
    song.cue(0);
    delay(30);
    song.play();
    delay(20);
    break;

  case 'm':
    float x = timeline.getCursorX();
    float y = 280;
    markers.add(new PVector(x, y));

    SaveMarkers();
    break;

  case 'z':
    currentColorType = 0;
    break;
  case 'x':
    currentColorType = 1;
    break;

  case '1':
    currentFadeType = 0;
    break;
  case '2':
    currentFadeType = 1;
    break;
  case '3':
    currentFadeType = 2;
    break;
  case '4':
    currentFadeType = 3;
    break;
  }
}


void mousePressed() {
  switch(AppState) {
  case 1:
    if (effectBoard.isUnderMouse()) {
      // Add effect
      if (mouseButton == LEFT) {
        boolean canAddEffect = true;
        for (Effect e : effects) {
          float position = (effectBoard.cursor.x-100)/pixelsPerSecond + timelinePosition;
          if (position == e.position && abs(e.yPosition-effectBoard.cursor.y) < 20) {
            canAddEffect = false;
            break;
          }
        }
        int type = round((effectBoard.cursor.y-480)/42.8);
        if (canAddEffect && mouseButton == LEFT && type != 7) {
          float position = (effectBoard.cursor.x-100)/pixelsPerSecond + timelinePosition;
          effects.add(new Effect(position, type));
          SaveEffects();
        }
      } 

      // Delete closest effect
      else if (mouseButton == RIGHT) {
        Effect closestEffect = null;
        float closestDistance = 10000;
        for (Effect e : effects) {
          float d = distSq((e.position - timelinePosition) * pixelsPerSecond + 100, e.yPosition, mouseX, mouseY);
          if (d < closestDistance*closestDistance) {
            closestDistance = d;
            closestEffect = e;
          }
        }
        if (closestEffect != null && closestDistance < 4000) {
          effects.remove(closestEffect);
          SaveEffects();
        }
      }
    }

    // Increase and decrease the number of pixels per second
    // Once the scale has changed, generate the waveform again
    if (distSq(mouseX, mouseY, 1378, 460) < 100) {
      pixelsPerSecond += 50;
      if (pixelsPerSecond > 500) {
        pixelsPerSecond = 500;
        return;
      }
      LoadWaveform();
    } else if (distSq(mouseX, mouseY, 1328, 460) < 100) {
      pixelsPerSecond -= 50;
      if (pixelsPerSecond < 50) {
        pixelsPerSecond = 50;
        return;
      }
      LoadWaveform();
    }


    // Increase and decrease beats per minute
    if (distSq(mouseX, mouseY, 78, 570) < 100) {
      bpm++;
    } else if (distSq(mouseX, mouseY, 28, 570) < 100) {
      bpm--;
    }

    // Increase and decrease beat offset
    else if (distSq(mouseX, mouseY, 78, 620) < 100) {
      beatOffset += 0.01;
    } else if (distSq(mouseX, mouseY, 28, 620) < 100) {
      beatOffset -= 0.01;
    }

    // Increase and decrease beat precision
    else if (distSq(mouseX, mouseY, 78, 670) < 100) {
      beatPrecision *= 2;
    } else if (distSq(mouseX, mouseY, 28, 670) < 100) {
      beatPrecision /= 2;
    }

    bpm = constrain(bpm, 1, 300);
    beatOffset = constrain(beatOffset, 0, 9.99);
    beatPrecision = constrain(beatPrecision, 1, 16);
    pixelsPerBeat = pixelsPerSecond / (bpm/60);
    pixelsPerPrecision = pixelsPerBeat / beatPrecision;

    SaveBeatsInfo();
    break;
  }
}

void mouseWheel(MouseEvent event) {
  float direction = -event.getCount();
  float speed = 50 / float(pixelsPerSecond);
  timeline.moveTimelinePosition(direction * speed);
}
