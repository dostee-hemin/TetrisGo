void LoadAllData() {
  song = minim.loadFile("song.mp3");
  
  LoadPoses();
  LoadInfo();
  LoadMarkers();
  LoadEffects();
  LoadWaveform();
}

void LoadPoses() {
  poseImages[0] = loadImage("Poses/O.jpg");
  poseImages[1] = loadImage("Poses/I.jpg");
  poseImages[2] = loadImage("Poses/T.jpg");
  poseImages[3] = loadImage("Poses/S.jpg");
  poseImages[4] = loadImage("Poses/Z.jpg");
  poseImages[5] = loadImage("Poses/L.jpg");
  poseImages[6] = loadImage("Poses/J.jpg");
  
  for (PImage p : poseImages) p.resize(150, 150);
}


void LoadInfo() {
  try {
    String[] txt = loadStrings("Text Data/beats info.txt");
    bpm = float(split(txt[0], "= ")[1]);
    beatOffset = float(split(txt[1], "= ")[1]);
    beatPrecision = constrain(beatPrecision, 1, 16);
    pixelsPerBeat = pixelsPerSecond / (bpm/60);
    pixelsPerPrecision = pixelsPerBeat / beatPrecision;
  } 
  catch (NullPointerException e) {
    println("No beat info loaded!");
  }
}

void LoadEffects() {
  try {
    String[] txt = loadStrings("Text Data/effects.txt");
    for (int i=0; i<txt.length; i++) {
      String[] elements = splitTokens(txt[i], "( , )");
      float position = float(elements[0]);
      int effectType = int(elements[1]);
      effects.add(new Effect(position, effectType));
    }
  } 
  catch(NullPointerException e) {
    println("No effects loaded");
  }
}

void LoadMarkers() {
  try {
    String[] txt = loadStrings("Text Data/markers.txt");
    for (int i=0; i<txt.length; i++) {
      String[] elements = splitTokens(txt[i], "( , )");
      float x = float(elements[0]);
      float y = float(elements[1]);
      markers.add(new PVector(x, y));
    }
  } 
  catch(NullPointerException e) {
    println("No markers loaded");
  }
}

void LoadWaveform() {
  // Load the waveform if it exists
  // The x values are percentages (ranging from 0-100)
  // The y values are amplitudes (ranging from 0-1)
  // When creating the waveform, convert the raw (x,y) values to pixel coordinates
  try {
    waveform.clear();
    String[] txt = loadStrings("Text Data/waveform.txt");
    for (int i=0; i<txt.length; i++) {
      float x = float(splitTokens(txt[i], "( , )")[0]);
      x = ((x/100) * (song.length()/1000) * pixelsPerSecond) + 100;
      float y = float(splitTokens(txt[i], "( , )")[1]);
      y = 420 - y*120;
      waveform.add(new PVector(x, y));
    }
  } 
  catch (NullPointerException e) {
    println("No waveform found!");
  }
}

void SaveBeatsInfo() {
  String[] txt = new String[2];
  txt[0] = "Beats per minute = " + bpm;
  txt[1] = "Beat offset = " + beatOffset;
  saveStrings("Text Data/beats info.txt", txt);
}

void SaveEffects() {
  String[] txt = new String[effects.size()];
  ArrayList<Effect> temp = new ArrayList<Effect>();
  temp.addAll(effects);
  for(int i=0; i<effects.size(); i++) {
    Effect recordSmallest = null;
    for (Effect e : temp) {
      if(recordSmallest == null) {
        recordSmallest = e;
        continue;
      }
      if (e.position < recordSmallest.position) {
        recordSmallest = e;
      }
    }
    txt[i] = recordSmallest.position + " " + recordSmallest.effectType;
    temp.remove(recordSmallest);
  }
  saveStrings("Text Data/effects.txt", txt);
}

void SaveMarkers() {
  String[] txt = new String[markers.size()];
  for (int i=0; i<markers.size(); i++) {
    PVector m = markers.get(i);
    txt[i] = "(" + m.x + " , " + m.y + ")";
  }
  saveStrings("Text Data/markers.txt", txt);
}

void SaveWaveform() {
  String[] txt = new String[waveform.size()];
  for (int i=0; i<waveform.size(); i++) {
    PVector p = waveform.get(i);
    txt[i] = "(" + p.x + " , " + p.y + ")";
  }
  saveStrings("Text Data/waveform.txt", txt);
}
