const URL = "https://teachablemachine.withgoogle.com/models/UDei8T-wa/";
let model;
let webcam;

let label = "waiting";

let video;

let grid = [];
let cols = 10;
let rows = 20;
let scl = 30;
let speed = 1;
let currentTetrominoType;
let currentTetromino = [];
let pieceBag = [];
let bagCounter = 0;

let lineCount = 0;
let highScoreLineCount = 0;
let score = 0;
let highScore = 0;

let costWeights = [2.67,1.31,1.32,1.78,1.35,1.02,1.52,1.11];

let isWaitingForPlayer = false;
let maxTimer = 100;
let poseTimer = maxTimer;

async function setup() {
  createCanvas(1300, 800);

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
      
  video = createCapture(VIDEO);
  video.hide();

  // Create an empty 2D grid
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
    }
  }

  for(let i=0; i<7; i++) {
    pieceBag[i] = i;
  }

  // Create an empty 2D tetromino
  for (let i = 0; i < 4; i++) {
    currentTetromino[i] = [];
  }

  // Create the next tetromino
  newTrominio();

      
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
      createTetromino(false);
      isWaitingForPlayer = false;
    }

    poseTimer--;
    if(poseTimer == 0) {
      createTetromino(true);
      isWaitingForPlayer = false;
    }
  }


  if (recordRotation != -1) {
    for (let i = 0; i < recordRotation; i++) {
      currentTetromino = rotatePiece(1, currentTetromino);
    }
    while (moveSideways(-1, currentTetromino) != currentTetromino) {
      currentTetromino = moveSideways(-1, currentTetromino);
    }
    for (let i = 0; i < recordRight; i++) {
      currentTetromino = moveSideways(1, currentTetromino);
    }
    recordRotation = -1;
    recordCost = 10000;
    recordRight = -1;
  }

  // Display all elements in the grid
  noStroke();
  rectMode(CORNER);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      colorFromType(grid[i][j]);
      rect(i * scl, j * scl, scl, scl);
    }
  }

  // Display the current tetromino
  for (let i = 0; i < 4; i++) {
    colorFromType(currentTetrominoType + 1);
    rect(currentTetromino[i][0] * scl, currentTetromino[i][1] * scl, scl, scl);
  }

  // After a certain amount of frames, move down
  if (frameCount % speed == 0 && !isWaitingForPlayer) {
    currentTetromino = moveDown(currentTetromino);
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

  fill(0);
  textSize(30);
  text("Score = " + score, 100, 20 * scl + 50);
  text("Line Count = " + lineCount, 100, 20*scl + 100);

  text("Best score = " + highScore, 100, 20 * scl + 150);
  text("Best lines = " + highScoreLineCount, 100, 20 * scl + 200);
  for(let i=bagCounter; i>=0; i--) {
    showPiece(pieceBag[i], scl*10 + 50, 650 - i*90);
  }

  fill(255,100);
  stroke(255,200);
  rectMode(CENTER);
  switch(currentTetrominoType) {
    case 0:
      rect(width/2 + video.width/2, video.height/2, 200, 200);
    break;
    case 1:
      rect(width/2 + video.width/2, video.height/2, 100, 400);
    break;
    case 2:
      rect(width/2 + video.width/2, video.height/2+95, 150, 150);
      rect(width/2 + video.width/2, video.height/2-55, 450, 150);
    break;
    case 3:
      rect(width/2 + video.width/2, video.height/2, 300, 150);
      rect(width/2 + video.width/2-75, video.height/2-150, 150, 150);
      rect(width/2 + video.width/2+75, video.height/2+150, 150, 150);
    break;
    case 4:
      rect(width/2 + video.width/2, video.height/2, 300, 150);
      rect(width/2 + video.width/2+75, video.height/2-150, 150, 150);
      rect(width/2 + video.width/2-75, video.height/2+150, 150, 150);
    break;
    case 5:
      rect(width/2 + video.width/2, video.height/2-55, 450, 150);
      rect(width/2 + video.width/2-150, video.height/2+95, 150, 150);
    break;
    case 6:
      rect(width/2 + video.width/2, video.height/2-55, 450, 150);
      rect(width/2 + video.width/2+150, video.height/2+95, 150, 150);
    break;
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


function showPiece(type, x, y) {
  let sz = 25;
  colorFromType(type+1);
  stroke(0);
  strokeWeight(3);
  rectMode(CENTER);
  switch(type) {
    case 0:
    rect(x,y,sz*2,sz*2);
    break;
    case 1:
    rect(x,y,sz,sz*4);
    break;
    case 2:
    rect(x,y-sz*0.5,sz*3,sz);
    rect(x,y+sz*0.5,sz,sz);
    break;
    case 3:
    rect(x,y,sz*2,sz);
    rect(x-sz*0.5,y-sz,sz,sz);
    rect(x+sz*0.5,y+sz,sz,sz);
    break;
    case 4:
    rect(x,y,sz*2,sz);
    rect(x+sz*0.5,y-sz,sz,sz);
    rect(x-sz*0.5,y+sz,sz,sz);
    break;
    case 5:
    rect(x,y,sz*3,sz);
    rect(x-sz,y+sz,sz,sz);
    break;
    case 6:
    rect(x,y,sz*3,sz);
    rect(x+sz,y+sz,sz,sz);
    break;
  }

}





/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

let recordRotation = -1;
let recordCost = 10000;
let recordRight = -1;
function newTrominio() {
  // Create an empty 2D tetromino
  for (let i = 0; i < 4; i++) {
    currentTetromino[i] = [-10,-10];
  }

  if(bagCounter == 0) {
    bagCounter = 7;
    shuffleArray(pieceBag);
  }
  // Choose a random tetromino type
  currentTetrominoType = pieceBag[bagCounter-1];
  bagCounter--;

  isWaitingForPlayer = true;
}


function createTetromino(isScrambled) {
  let maximumNumberOfRotations = 0;
  if(isScrambled) {
    let xPos = [];
    let yPos = [];
    for(let i=0; i<4; i++) {
      xPos[i] = i;
      yPos[i] = i;
    }
    shuffleArray(xPos);
    shuffleArray(yPos);
    for(let i=0; i<4; i++) {
      currentTetromino[i][0] = xPos[i]+3;
      currentTetromino[i][1] = yPos[i];
    }
    maximumNumberOfRotations = 4;
  } else {

  // Based on the type of the piece, generate the tetromino
  switch (currentTetrominoType) {
    // O piece
    case 0:
      currentTetromino[0][0] = 4;
      currentTetromino[0][1] = 0;
      currentTetromino[1][0] = 5;
      currentTetromino[1][1] = 0;
      currentTetromino[2][0] = 4;
      currentTetromino[2][1] = 1;
      currentTetromino[3][0] = 5;
      currentTetromino[3][1] = 1;
      maximumNumberOfRotations = 1;
      break;
    // I piece
    case 1:
      currentTetromino[0][0] = 5;
      currentTetromino[0][1] = 0;
      currentTetromino[1][0] = 4;
      currentTetromino[1][1] = 0;
      currentTetromino[2][0] = 3;
      currentTetromino[2][1] = 0;
      currentTetromino[3][0] = 6;
      currentTetromino[3][1] = 0;
      maximumNumberOfRotations = 2;
      break;
    // T piece
    case 2:
      currentTetromino[0][0] = 5;
      currentTetromino[0][1] = 0;
      currentTetromino[1][0] = 4;
      currentTetromino[1][1] = 0;
      currentTetromino[2][0] = 6;
      currentTetromino[2][1] = 0;
      currentTetromino[3][0] = 5;
      currentTetromino[3][1] = 1;
      maximumNumberOfRotations = 4;
      break;
    // S piece
    case 3:
      currentTetromino[0][0] = 5;
      currentTetromino[0][1] = 0;
      currentTetromino[1][0] = 4;
      currentTetromino[1][1] = 1;
      currentTetromino[2][0] = 6;
      currentTetromino[2][1] = 0;
      currentTetromino[3][0] = 5;
      currentTetromino[3][1] = 1;
      maximumNumberOfRotations = 2;
      break;
    // Z piece
    case 4:
      currentTetromino[0][0] = 5;
      currentTetromino[0][1] = 0;
      currentTetromino[1][0] = 4;
      currentTetromino[1][1] = 0;
      currentTetromino[2][0] = 6;
      currentTetromino[2][1] = 1;
      currentTetromino[3][0] = 5;
      currentTetromino[3][1] = 1;
      maximumNumberOfRotations = 2;
      break;
    // L piece
    case 5:
      currentTetromino[0][0] = 5;
      currentTetromino[0][1] = 0;
      currentTetromino[1][0] = 4;
      currentTetromino[1][1] = 0;
      currentTetromino[2][0] = 4;
      currentTetromino[2][1] = 1;
      currentTetromino[3][0] = 6;
      currentTetromino[3][1] = 0;
      maximumNumberOfRotations = 4;
      break;
    // J piece
    case 6:
      currentTetromino[0][0] = 5;
      currentTetromino[0][1] = 0;
      currentTetromino[1][0] = 4;
      currentTetromino[1][1] = 0;
      currentTetromino[2][0] = 6;
      currentTetromino[2][1] = 1;
      currentTetromino[3][0] = 6;
      currentTetromino[3][1] = 0;
      maximumNumberOfRotations = 4;
      break;
  }
}

  // Top out
  if (landsOnStack(currentTetromino)) {
    reset();
  }

  poseTimer = maxTimer;



  /* Find the best way to place the current piece */
  // The way we calculate scores is based on:
  // - Horizontal position (left side of the grid is favored)
  // - Tetris column (rightmost side of the grid is unfavored)
  // - Vertical position (the bottom of the grid is favored)
  // - Number of holes created (less holes created is favored)
  // - Number of lines cleared (more lines cleared is favored)
  // - Tetrises (tetrises are very favored)
  // - Roughness of the stack (a flatter stack is favored)
  // - Pillars created (less pillars is favored)

  // Loop through every possible rotation of the current piece
  for (let currentRotation = 0; currentRotation < maximumNumberOfRotations; currentRotation++) {
    // Duplicate the current tetromino to represent the current rotation
    rotatedTetromino = duplicateTetromino(currentTetromino);

    // Rotate the tetromino to the current rotation position
    for (let i = 0; i < currentRotation; i++) {
      rotatedTetromino = rotatePiece(1, rotatedTetromino);
    }

    // These two values represent the min and max 'x' values of the tetromino's boxes
    let leftmostBox = rotatedTetromino[0][0];
    let rightmostBox = leftmostBox;

    // Loop through all the boxes of the tetromino and find the min and max boxes
    for (let i = 0; i < 4; i++) {
      leftmostBox = min(rotatedTetromino[i][0], leftmostBox);
      rightmostBox = max(rotatedTetromino[i][0], rightmostBox);
    }

    // Calculate how wide the tetromino is based on the min and max values
    let pieceWidth = rightmostBox - leftmostBox;

    // Move the tetromino all the way to the left side of the board so that it's touching the edge
    while (moveSideways(-1, rotatedTetromino) != rotatedTetromino) {
      rotatedTetromino = moveSideways(-1, rotatedTetromino);
    }

    // Now we will simulate the tetromino being placed at every possible column and calculate its cost
    for (let currentColumn = 0; currentColumn < cols - pieceWidth; currentColumn++) {
      // This cost value represents how bad a piece is to be placed (i.e. a high cost is bad, a low cost is good)
      let cost = 0;

      // Get a copy of the rotated tetromino for this current column
      let currentSimulationTetromino = duplicateTetromino(rotatedTetromino);

      // Move over the piece to the current simulation column
      let maxX = 0;
      for (let j = 0; j < currentColumn; j++) {
        for (let k = 0; k < 4; k++) {
          currentSimulationTetromino[k][0]++;
          if(currentSimulationTetromino[k][0] == cols-1) {
            cost += costWeights[0];
          }
        }
        cost += costWeights[6];
      }
      

      /* Calculate where the piece will land if we let it drop */
      // Continuously move the piece down
      while (true) {
        for (let i = 0; i < 4; i++) {
          currentSimulationTetromino[i][1]++;
        }
        
        // If the piece hits the bottom of the grid, leave the loop
        if(outOfBounds(currentSimulationTetromino)) {
          break;
        }
        
        // If the piece lands on the stack, leave the loop
        if(landsOnStack((currentSimulationTetromino))) {
          break;
        }
      }
      // This boolean determines whether or not the current rotation is valid (i.e. if the piece isn't outside the grid from the rotation)
      let isRotationValid = true;
      // Move the piece one unit back up (to fix overshooting)
      for (let i = 0; i < 4; i++) {
        currentSimulationTetromino[i][1]--;
        // If the box is outside the grid, the current rotation is not valid so leave the loop
        if(currentSimulationTetromino[i][0] < 0 || currentSimulationTetromino[i][0] > cols-1 || currentSimulationTetromino[i][1] < 0) {
          isRotationValid = false;
          break;
        }

        // Increase the cost based on the height of the box
        cost += (rows-currentSimulationTetromino[i][1])*costWeights[1];
      }
      // If the rotation is invalid, move on to the next rotation
      if(!isRotationValid) {
        continue;
      }

      let copiedGrid = [];
      // Create an empty 2D grid
      for (let i = 0; i < cols; i++) {
        copiedGrid[i] = [];
        for (let j = 0; j < rows; j++) {
          copiedGrid[i][j] = grid[i][j];
        }
      }
      // Set the grid at the current piece's location to be -1 (just so we can understand the layout of the stack later)
      for (let j = 0; j < 4; j++) {
        copiedGrid[currentSimulationTetromino[j][0]][currentSimulationTetromino[j][1]] = -1;
      }

      /* Calculate how many lines the current piece will clear */
      // This variable keeps track of the number of lines the current piece will clear
      let numberOfClears = 0;
      // Loop through every row in the grid
      for (let i = 0; i < rows; i++) {
        // This counter keeps track of the number of boxes in the current row
        let counter = 0;
        // Loop through all the columns in this row; if there's a box, add 1 to the counter
        for (let j = 0; j < cols; j++) {
          if (copiedGrid[j][i] != 0) {
            counter++;
          }
        }
        // If all boxes in the row are full (i.e. the line is completed), move all the previous rows down
        if (counter == cols) {
          for (let j = 0; j < cols; j++) {
            for (let I = i - 1; I >= -1; I--) {
              // This if fixes the issue when moving down the top row of the grid
              if(I == -1) {
                copiedGrid[j][0] = 0;
              } else {
                copiedGrid[j][I + 1] = copiedGrid[j][I];
              }
            }
          }
          numberOfClears++;
        }
      }
      // Favor more tetrises and less burns
      if(numberOfClears == 4) {
        cost -= costWeights[7]*3;
      } else {
        cost += numberOfClears*costWeights[2];
      }





      /* Look for holes that the tetromino creates */
      // Loop through every column in the grid
      for(let j=0; j<cols; j++) {
        // This variable represents the top of the stack at the current column
        let topI=0;
        // Find the top of the stack by continuously moving down
        while(copiedGrid[j][topI] == 0) {
          topI++;
        }

        // Loop through every row underneath the top of the stack
        for(let i=topI; i<rows; i++) {
          // If the current grid element is empty, that means it's a hole, so increase the cost
          // because we don't want to create holes. Favor holes that are at the bottom of the grid
          if (copiedGrid[j][i] == 0) {
            cost += i*costWeights[3];
          }
        }
      }
      /* Find the columns that the tetromino creates */
      // Loop through every column in the grid
      for(let j=0; j<cols-1; j++) {
        // This variable represents the top of the stack at the current column
        let topI=0;
        // Find the top of the stack by continuously moving down
        let columnCount = 0;
        while(copiedGrid[j][topI] == 0) {
          topI++;

          if(j == 0) {
            if(copiedGrid[j+1][topI] != 0) {
              columnCount++;
            }
          } else if(j==cols-1) {
            if(copiedGrid[j-1][topI] != 0) {
              columnCount++;
            }
          } else {
            if(copiedGrid[j-1][topI] != 0 && copiedGrid[j+1][topI] != 0) {
              columnCount++;
            }
          }
        }
        if(columnCount > 2) {
          cost += columnCount*costWeights[4];
        }
      }
      

      /* Calculate how rough or flat the stack will be with the current piece */
      // These two variables represent the change in rows from one column to the next
      let currentHeight;
      let previousHeight;
      // Loop through every column
      for(let j=0; j<cols-1; j++) {
        // Set the previous height to the current height
        previousHeight = currentHeight;

        // This variable represents the top of the stack at the current column
        let topI=0;
        // Find the top of the stack by continuously moving down
        while(copiedGrid[j][topI] == 0) {
          topI++;
        }
        // The current height is the top of the stack we just found
        currentHeight = topI;

        // Only calculate the cost when we have a difference between 2 columns
        if(j > 0) {
          // Increase the cost based on the delta of heights (flatter stacks are favored)
          cost += abs(currentHeight-previousHeight)*costWeights[5];
        }
      }

      // If the current move we just calculated beats the best move, record all the values so we can use it later
      if (cost < recordCost) {
        recordCost = cost;
        recordRotation = currentRotation;
        recordRight = currentColumn;
      }
    }
  }
}

function colorFromType(type) {
  switch (type) {
    case 1:
      fill(255, 255, 0);
      break;
    case 2:
      fill(0, 255, 255);
      break;
    case 3:
      fill(255, 0, 255);
      break;
    case 4:
      fill(0, 255, 0);
      break;
    case 5:
      fill(255, 0, 0);
      break;
    case 6:
      fill(255, 100, 0);
      break;
    case 7:
      fill(0, 0, 255);
      break;
    case 0:
      fill(0);
      break;
      case -1:
      fill(127);
      break;
  }
}
/*-------------------- Movement Functions -------------------*/
// These functions control how a given tetromino moves down, sideways, and rotates.
// They return the new locations of the tetromino blocks after the movement has been carried out.
function moveDown(tetromino) {
  // This is a duplicate of the current tetromino so that we can confirm first if moving down is possible
  let futureTetromino = duplicateTetromino(tetromino);

  // Move the future tetromino one unit down
  for (let i = 0; i < 4; i++) {
    futureTetromino[i][1]++;
  }

  // If moving down is not possible, don't update the current tetromino's position, so just leave the function
  if (outOfBounds(futureTetromino)) {
    placePiece();
    return tetromino;
  }
  if (landsOnStack(futureTetromino)) {
    placePiece();
    return tetromino;
  }

  // At this point, we can move down, so return the new location of the tetromino
  return futureTetromino;
}

function rotatePiece(dir, tetromino) {
  // If the current tetromino is an O piece, there's no need to calculate a rotation so just leave the function
  if (currentTetrominoType == 0) return tetromino;

  // This is a duplicate of the current tetromino so that we can confirm first if moving down is possible
  let futureTetromino = duplicateTetromino(tetromino);

  // Loop through every box in the tetromino that's not the center (not at index 0)
  for (let i = 1; i < 4; i++) {
    // Calculate the offset of the current box from the center box
    let xOff = tetromino[0][0] - tetromino[i][0];
    let yOff = tetromino[0][1] - tetromino[i][1];

    // Set the future tetromino's pieces based on those offsets, but flipped
    futureTetromino[i][0] = tetromino[0][0] - yOff * dir;
    futureTetromino[i][1] = tetromino[0][1] + xOff * dir;
  }

  // If rotating is not possible, don't update the current tetromino's position, so just leave the function
  if (outOfBounds(futureTetromino)) return tetromino;
  if (landsOnStack(futureTetromino)) return tetromino;

  // At this point, we can rotate, so return the new location of the tetromino
  return futureTetromino;
}

function moveSideways(dir, tetromino) {
  // This is a duplicate of the current tetromino so that we can confirm first if moving sideways is possible
  let futureTetromino = duplicateTetromino(tetromino);

  // Move the future tetromino one unit horizontally in the given direction
  for (let i = 0; i < 4; i++) futureTetromino[i][0] += dir;

  // If moving sideways is not possible, don't update the current tetromino's position, so just leave the function
  if (outOfBounds(futureTetromino)) return tetromino;
  if (landsOnStack(futureTetromino)) return tetromino;
  
  // At this point, we can move sideways, so return the new location of the tetromino
  return futureTetromino;
}













function reset() {
  // Create an empty 2D grid
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
    }
  }

  if(score > highScore) {
    highScore = score;
    highScoreLineCount = lineCount;
  }

  score = 0;
  lineCount = 0;

  // Create the next tetromino
  newTrominio();
}

function landsOnStack(tetromino) {
  for (let i = 0; i < 4; i++) {
    // If the box has landed on the stack, return true
    if (grid[tetromino[i][0]][tetromino[i][1]] > 0) {
      return true;
    }
  }
  return false;
}

function outOfBounds(tetromino) {
  for (let i = 0; i < 4; i++) {
    if (
      tetromino[i][0] < 0 ||
      tetromino[i][0] > cols - 1 ||
      tetromino[i][1] > rows - 1
    ) {
      return true;
    }
  }
  return false;
}

function duplicateTetromino(tetromino) {
  let copiedTetromino = [];
  for (let i = 0; i < 4; i++) {
    copiedTetromino[i] = [];
    copiedTetromino[i][0] = tetromino[i][0];
    copiedTetromino[i][1] = tetromino[i][1];
  }
  return copiedTetromino;
}

function placePiece() {
  // Set the grid to solid blocks at the location of the current tetromino
  for (let i = 0; i < 4; i++) {
    grid[currentTetromino[i][0]][currentTetromino[i][1]] = currentTetrominoType + 1;
  }

  // Check lines for clearing
  checkLines();

  // Create a new tetromino piece
  newTrominio();
}

function checkLines() {
  let numberOfClears = 0;
  // Loop through every row in the grid
  for (let i = 0; i < rows; i++) {
    // This counter keeps track of the number of boxes in the current row
    let counter = 0;
    // Loop through all the columns in this row; if there's a box, add 1 to the counter
    for (let j = 0; j < cols; j++) {
      if (grid[j][i] != 0) {
        counter++;
      }
    }
    // If all boxes in the row are full (i.e. the line is completed), move all the previous rows down
    if (counter == cols) {
      for (let j = 0; j < cols; j++) {
        for (let I = i - 1; I >= -1; I--) {
          if(I == -1) {
            grid[j][0] = 0;
          } else {
            grid[j][I + 1] = grid[j][I];
          }
        }
      }
      numberOfClears++;
    }
  }
  switch(numberOfClears) {
    case 1:
      score += 40;
      break;
    case 2:
      score += 100;
      break;
    case 3:
      score += 300;
      break;
    case 4:
      score += 1200;
      break;
  }
  lineCount += numberOfClears;
  maxTimer -= 5*numberOfClears;
  if(maxTimer < 30) {
    maxTimer = 30;
  }
}