/*  This code file is split into the following sub-sections:
  Variables               (all the variables used for the pose detection)
  Setup                   (like setup(), but for the pose detection)
  Prediction Functions    (predicts the pose from webcam feed)
  Drawing Functions       (draws the elements of the pose detection)
*/








/*-------------------- Variables -------------------*/

// URL of the posenet model
//const URL = "https://teachablemachine.withgoogle.com/models/UDei8T-wa/";          // Version 1 (basic piece poses and "Nothing")
const URL = "https://teachablemachine.withgoogle.com/models/rdqmqZekC/";          // Version 2 (piece poses and camera adjustment)
let model;      // The posenet model that converts an image to an ID of a pose
let webcam;     // The HTML element that recieves video input from the webcam

// The label of the model's prediction 
// (by default it's set to waiting until the model comes online)
let label = "waiting";

// This array contains all the possible pose labels that could come out of the model
let allLabels = ["O", "I", "T", "S", "Z", "L", "J", "Just Right", "Too Close", "Too Far", "Too High", "Too Low", "Anybody there?"];








/*-------------------- Setup -------------------*/
// This function sets up the pose detection part of the application before running
async function setupPoseDetectionPart() {
    // Create a new mirrored webcam feed with a given width and height
    webcam = new tmPose.Webcam(640, 480, true);
    await webcam.setup(); // request access to the webcam
    await webcam.play();  // Initiate the webcam

    // Get the canvas element in the DOM to render the webcam feed
    const canvas = document.getElementById("canvas");
    canvas.height = 0;  // Set the height to 0 so it doesn't affect the layout of the p5 sketch

    // Get the URLs of the model and metadata
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata
    model = await tmPose.load(modelURL, metadataURL);
}









/*-------------------- Prediction Functions -------------------*/
// These functions contribute to running the webcam feed into the model to get the best prediction
async function predict() {
    // Prediction #1: Run webcam feed through posenet to get a sequence of pose points
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

    // Prediction 2: Run sequence of pose points through classification model to get a pose label
     const prediction = await model.predict(posenetOutput);
    
    // Find the best pose label that represents the current video feed
    let recordProbability = 0;
    for(let i=0; i<prediction.length; i++) {
        let prob = prediction[i].probability.toFixed(2);
        if(prob > recordProbability) {
            recordProbability = prob;
            label = prediction[i].className;
        }
    }
}











/*-------------------- Drawing Functions -------------------*/
// These functions contribute to the drawing of the pose detection in any way possible.
// If it controls color, shape, or text, it lies in this area.
function displayPoseElements() {
    push();
    translate(width/2,height/2);
    // Draw the posing timer as a bar that's shrinking in length
    // The red fill in side the bar
    fill(255,0,0);
    noStroke();
    rectMode(CORNER);
    rect(0,-webcam.height/2-60,(float(poseTimer)/maxTimer) * webcam.width, 50);

    // The outline of the bar
    stroke(0);
    noFill();
    strokeWeight(3);
    rect(0,-webcam.height/2-60, webcam.width, 50);
    rectMode(CENTER);
    
    // If there is a webcam feed available, draw it on the right side of the screen
    if(webcam.canvas) {
        push();
        translate(0,-webcam.height/2);
        let ctx = canvas.getContext("2d");
        ctx.drawImage(webcam.canvas, 0, 0);
        pop();
    }
    
    // Get the index in the allLabels array that the current prediction is located
    let indexOfLabel = allLabels.indexOf(label);
    // Display the current label of the model only if it is a piece
    if(indexOfLabel < 7 && indexOfLabel > -1) {
        // Display the label as a piece
        colorFromType(indexOfLabel+1);
        noStroke();
        drawPieceShape(indexOfLabel, webcam.width/2, webcam.height/2+50, 28);
    }
    pop();
}