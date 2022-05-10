/*  This code file is split into the following sub-sections:
  Variables               (all the variables used for the pose detection)
  Setup                   (like setup(), but for the pose detection)
  Prediction Functions    (predicts the pose from webcam feed)
  Drawing Functions       (draws the elements of the pose detection)
*/







/*-------------------- Variables -------------------*/
let video;                // The p5 DOM element representing the webcam feed
let armPoints = [];       // The list of pose keypoints that make up the left and right arm of the current pose 
let keypoints = [];       // The list of all the pose keypoints in the prediction

// The label of the model's prediction 
// (by default it's set to waiting until the model comes online)
let label = "waiting";

// This array contains all the possible pose labels that could come out of the model
let allLabels = ["O", "I", "T", "S", "Z", "L", "J"];







/*-------------------- Setup -------------------*/
// This function sets up the pose detection part of the application before running
function setupPoseDetectionPart() {
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
  pose.onResults(predict);

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









/*-------------------- Prediction Functions -------------------*/
// Function that is called everytime a pose is detected
function predict(results) {
  // The keypoints in the current pose
  let points = results.poseLandmarks;
  if(points == null) return;

  // Set all the keypoints to the landmarks we just found
  keypoints = [];
  for(var i=0; i<points.length; i++) {
    if(points[i].x < 0 || points[i].x > 1 || points[i].y < 0 || points[i].y > 1) continue;
    keypoints.push({x: (1-points[i].x)*video.width, y: points[i].y*video.height});
  }

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

  // Classify the pose into a character representing the piece type
  if(isInPosition([0,0,2,2])) label = "T";
  else if(isInPosition([1,3,1,3])) label = "O";
  else if(isInPosition([3,3,3,3])) label = "I";
  else if(isInPosition([0,3,2,1])) label = "Z";
  else if(isInPosition([0,1,2,3])) label = "S";
  else if(isInPosition([0,0,1,4])) label = "L";
  else if(isInPosition([1,4,2,2])) label = "J";
  else label = "Nothing";
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
        if(abs(PI/2-abs(angle)) > angleRange  || angle > 0) return false;
        break;
    }
    
    // Move on to the next keypoint
    index++;
    if(index == 2) index++;
  }

  // At this point, all keypoints are in the correct position, so return true
  return true;
}










/*-------------------- Drawing Functions -------------------*/
// These functions contribute to the drawing of the pose detection in any way possible.
// If it controls color, shape, or text, it lies in this area.
function displayPoseElements() {
    push();
    translate(width/2,height/2);
    // If there is a webcam feed available, draw it on the right side of the screen
    push();
    translate(video.width,-video.height/2);
    scale(-1,1);
    imageMode(CORNER);
    image(video,0,0);
    pop();
    
    // Get the index in the allLabels array that the current prediction is located
    let indexOfLabel = allLabels.indexOf(label);
    // Display the current label of the model only if it is a piece
    if(indexOfLabel < 7 && indexOfLabel > -1) {
        // Display the label as a piece
        colorFromType(indexOfLabel+1);
        noStroke();
        drawPieceShape(indexOfLabel, video.width/2, video.height/2+50, 28);
    }
    pop();
}