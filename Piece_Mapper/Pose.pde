class Pose {
  float size;
  float speed;
  int type;
  
  Pose(int type) {
    this.type = type;
    size = poseImages[type].width*1.5;
    speed = 3;
  }
  
  void display() {
    int s = int(constrain(size,0,poseImages[type].width));
    imageMode(CENTER);
    image(poseImages[type], width/2, 125, s, s);
  }
  
  void update() {
    size -= speed;
  }
  
  boolean isFinished() {
    return size <= 0;
  }
}
