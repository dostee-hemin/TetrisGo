const URL = "https://teachablemachine.withgoogle.com/models/UDei8T-wa/";
let model;
let webcam;

let label = "waiting";

let video;


async function setup() {
  createCanvas(640, 800);

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
  translate(video.width,0);
  scale(-1,1);
  image(video, 0, 0);
  pop();
  
  fill(0);
  textSize(60);
  text(label, width/2, 600);
      
  if(model != null) {
    predict();
  }
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