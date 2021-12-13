const URL = "https://teachablemachine.withgoogle.com/models/UDei8T-wa/";
let model;
let webcam;

let label = "waiting";

let video;

async function setup() {
  createCanvas(1300, 800);

  // Call the setup function for the tetris part of the application
  setupTetrisPart();

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
      
  video = createCapture(VIDEO);
  video.hide();

      
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(640, 480, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load(modelURL, metadataURL);
}

function draw() {
  webcam.update(); // update the webcam frame

  background(255);

  push();
  translate(video.width+width/2,0);
  scale(-1,1);
  image(video, 0, 0);
  pop();
  
  textAlign(CENTER);
  fill(0);
  textSize(60);
  text(label, width/2+video.width/2, video.height+50);
      
  if(model != null && isWaitingForPlayer) {
    predict();
  }

  fill(255,0,0);
  noStroke();
  rectMode(CORNER);
  rect(width/2,video.height+100,(float(poseTimer)/maxTimer) * video.width - 10, 50);
  stroke(0);
  noFill();
  strokeWeight(3);
  rect(width/2,video.height+100, video.width - 10, 50);
  rectMode(CENTER);




  /*----------------- Tetris Part ----------------*/

  if(model != null && isWaitingForPlayer) {
    let poseLabel = -1;
    switch(label) {
      case "O":
      poseLabel = 0;
      break;
      case "I":
      poseLabel = 1;
      break;
      case "T":
      poseLabel = 2;
      break;
      case "S":
      poseLabel = 3;
      break;
      case "Z":
      poseLabel = 4;
      break;
      case "L":
      poseLabel = 5;
      break;
      case "J":
      poseLabel = 6;
      break;
    }
    if(poseLabel == currentTetrominoType) {
      // Create an ordinary tetromino
      createTetromino(false);
      isWaitingForPlayer = false;
    }

    poseTimer--;
    if(poseTimer == 0) {
      // Create a scrambled tetromino
      createTetromino(true);
      isWaitingForPlayer = false;
    }
  }

  // After a certain amount of frames, move down
  if (frameCount % speed == 0 && !isWaitingForPlayer) currentTetromino = moveDown(currentTetromino);

  displayGameElements();
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  let recordProb = 0;
  let recordI = -1;
  for(let i=0; i<prediction.length; i++) {
    let prob = prediction[i].probability.toFixed(2);
    if(prob > recordProb) {
      recordProb = prob;
      recordI = i;
      label = prediction[i].className;
    }
  }
}