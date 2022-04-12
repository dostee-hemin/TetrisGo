let video;                // The p5 DOM element representing the webcam feed
let armPoints = [];       // The list of pose keypoints that make up the left and right arm of the current pose 

function setup() {
  // Create the canvas
  createCanvas(640,480);

  // Create the video element from the webcam and set the size
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Create a new pose detector using the BlazePose model
  let pose = new Pose({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }});
  pose.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
  });

  // Set the function that will run when we get a pose
  pose.onResults(onResults);

  // Get the HTML video element that is our webcam
  let videoElement = document.getElementById('video');
  // Provide the webcam feed to the pose detector
  let camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({image: videoElement});
    },
    width: 640,
    height: 480
  });
  camera.start();

  // Disable the HTML video element so that it doesn't interfere with our p5 sketch
  videoElement.style.display = "none";
}

function draw() {
  background(255);

  // Draw the flipped version of the webcam feed
  push();
  translate(video.width,0);
  scale(-1,1);
  image(video, 0, 0);
  pop();

  // If we do have points we can work with...
  if(armPoints.length != 0) {
    let label = "";
    // Set the label according to the position the arms are in
    if(isInPosition([0,0,2,2])) label = "T";
    else if(isInPosition([1,3,1,3])) label = "O";
    else if(isInPosition([3,3,3,3])) label = "I";
    else if(isInPosition([0,3,2,1])) label = "S";
    else if(isInPosition([0,1,2,3])) label = "Z";
    else if(isInPosition([0,0,1,1])) label = "J";
    else if(isInPosition([1,1,2,2])) label = "L";

    // Show the label on the screen
    fill(255);
    noStroke();
    textSize(60);
    textAlign(CENTER);
    text(label, width/2, height/2);

    stroke(255,0,0);
    strokeWeight(4);
    for(let i=0; i<armPoints.length-1; i++) {
      // Get the current keypoint and the next keypoint
      let p1 = createVector(armPoints[i].x,armPoints[i].y);
      let p2 = createVector(armPoints[i+1].x,armPoints[i+1].y);

      // Draw a line between the two keypoints
      line(p1.x,p1.y,p2.x,p2.y);
      if(i==1)i++;
    }
  }
}

// Function that is called everytime a pose is detected
function onResults(results) {
  // The keypoints in the current pose
  let points = results.poseLandmarks;

  // Set all the arm keypoints according to pose (each armPoint is an (x, y) coordinate)
  // (leftShoulder, leftElbow, leftWrist, rightShoulder, rightElbow, rightWrist)
  armPoints[0] = {x: points[12].x, y: points[12].y};
  armPoints[1] = {x: points[14].x, y: points[14].y};
  armPoints[2] = {x: points[16].x, y: points[16].y};
  armPoints[3] = {x: points[11].x, y: points[11].y};
  armPoints[4] = {x: points[13].x, y: points[13].y};
  armPoints[5] = {x: points[15].x, y: points[15].y};

  // The coordinates are represented as values from 0-1, 
  // so we need to scale them up and flip them horizontally to be in the correct position
  for(let i=0; i<armPoints.length; i++) {
    armPoints[i].x = (1-armPoints[i].x)*video.width;
    armPoints[i].y *= video.height;
  }
}

// Function that determines whether or not the current pose is in a given position
function isInPosition(orientations) {
  // This variable stores the acceptable angle range that a vector can be in for it to be considered in the correct orientation
  let angleRange = PI/4;

  // This variable stores which keypoint we are currently on
  let index = 0;

  // Go through all the given orientations
  for(let i=0; i<orientations.length; i++) {
    // Get the current keypoint and the next keypoint
    let p1 = createVector(armPoints[index].x,armPoints[index].y);
    let p2 = createVector(armPoints[index+1].x,armPoints[index+1].y);
    
    // Create a vector that points from the first keypoint to the second
    let dir = p2.sub(p1);

    // Get the angle of that vector
    let angle = dir.heading();

    // Based on the current orientation, return false if the vector's angle is not within the acceptable angle range of the position
    switch(orientations[i]) {
      case 0:
        if(abs(angle) > angleRange) return false;
        break;
      case 1:
        if(abs(PI/2 - angle) > angleRange) return false;
        break;
      case 2:
        if(abs(PI-abs(angle)) > angleRange) return false;
        break;
      case 3:
        if(abs(PI/2-abs(angle)) > angleRange || angle > 0) return false;
        break;
    }
    
    // Move on to the next keypoint
    index++;
    if(index == 2) index++;
  }

  // At this point, all keypoints are in the correct position, so return true
  return true;
}