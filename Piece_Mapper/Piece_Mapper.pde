import ddf.minim.*;

Minim minim;
AudioPlayer song;
Timeline timeline;
EffectBoard effectBoard;
ArrayList<PVector> markers = new ArrayList<PVector>();
ArrayList<Effect> effects = new ArrayList<Effect>();
ArrayList<PVector> waveform = new ArrayList<PVector>();
ArrayList<Pose> poses = new ArrayList<Pose>();
PImage[] poseImages = new PImage[7];

int AppState = 1;

float bpm = 140;
float beatOffset = 0.12;
int beatPrecision = 1;
float timelinePosition;
int pixelsPerSecond = 100;
float pixelsPerBeat = pixelsPerSecond / (bpm/60);
float pixelsPerPrecision = pixelsPerBeat / beatPrecision;

int currentFadeType;
int currentColorType;

void setup() {
  size(1400, 800);

  minim = new Minim(this);

  LoadAllData();

  timeline = new Timeline();
  effectBoard = new EffectBoard();
}

void draw() {
  background(0);

  // AppStates:
  // 0 = Main Menu
  // 1 = Editor
  // 2 = Waveform Generator 
  switch(AppState) {
  case 0:
    break;
  case 1:
    /*    Timeline    */
    timeline.update();

    // If the mouse is hovering over the timeline, 
    // move the cursor to the mouse's position
    if (timeline.timeIsUnderMouse() && !song.isPlaying()) {
      timeline.setCursorPosition(mouseX);
    }

    // If the mouse presses one of the arrows
    if (mousePressed && timeline.arrowIsUnderMouse()) {
      // Move the timeline in the given direction with a speed based on the scale of the timeline
      int direction = sign(mouseX - 700);
      float speed = 7 / float(pixelsPerSecond);
      timeline.moveTimelinePosition(direction * speed);
    }

    DisplayEditor();
    break;
  case 2:
    float amp = 0;
    for(int i = 0; i < song.bufferSize() - 1; i++) {
      amp = max(amp, song.left.get(i));
    }
    // Add a new point to the waveform
    // X value is a percentage (0-100)
    // Y value is an amplitude (0-1)
    waveform.add(new PVector(float(song.position())/song.length()*100, amp));

    // Save waveform
    if (!song.isPlaying()) {
      waveform.remove(waveform.size()-1);
      AppState = 1;
      song.pause();
      song.cue(0);
      SaveWaveform();
      LoadWaveform();
    }

    DisplayWaveformGeneration();
    break;
  }
}

color getDarker(color c, float percentage) {
  return color(red(c) * percentage, green(c) * percentage, blue(c) * percentage);
}

int sign(int x) {
  if (x >= 0) {
    return 1;
  } else {
    return -1;
  }
}

float distSq(float x1, float y1, float x2, float y2) {
  return (x2-x1) * (x2-x1) + (y2-y1) * (y2-y1);
}
