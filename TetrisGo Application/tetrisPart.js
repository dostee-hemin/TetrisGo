/*  This code file is split into the following sub-sections:
  Variables               (all the variables used for the tetris game)
  Setup                   (like setup(), but for the tetris game)
  Movement Functions      (controlling the movement of a tetromino)
  Grid Functions          (controlling the grid)
  Tetromino Functions     (operations on a tetromino)
  Placement Algorithm     (figures out the best place to put the current piece)
  Drawing Functions       (draws the elements of the tetris game)
  Update Functions        (updates the elements of the tetris game every frame)
  Miscellaneous Functions (performs various non-tetris-specific functions)
*/








/*-------------------- Variables -------------------*/

let grid = [];                  // The 2D array representing the tetris grid
let cols = 10;                  // The number of columns in the grid
let rows = 20;                  // The number of rows in the grid
let scl = 30;                   // The size of each cell/box (in pixels)
let currentTetrominoType;       // An integer ID representing the shape of the current tetromino
let currentTetromino = [];      // The 2D array representing the coordinates of each box of the current tetromino
let upcomingPieces = [];        // Contains pieces that are ready to be dropped (IDs) (note that normal tetrominos have IDs 0-7 and scrambled tetrominos have IDs 7-14)
let canDropPiece = true;        // Determines whether or not the upcoming piece can be dropped (because another piece might be dropping)

let chosenSong = 0;             // The index of the song we want to play
let mappedPieces = [];          // Contains the list of pieces that have been mapped to the current song
let mappedPiecesTxt;            // Stores the text file that contains the mapped pieces for a given song

let countdownStart;             // The time (in milliseconds) of the program when we enter the game scene
let acceptanceAmount = 150;     // Amount in pixels that the piece has to be near the end before being accepted as a correct pose
let startSecond = 0;            // Represents the exact second the player started playing the game
let poseTime = 3;               // Time (in seconds) give to the player to pose a given piece
let scalingFactor = scl*rows/poseTime;    // Converts seconds of the song to pixels in the screen
let startDelay = 3;             // Amount of time (in seconds) before the music starts

let lineCount = 0;              // Number of lines cleared in total
let highScoreLineCount = 0;     // Best number of line clears
let score = 0;                  // Score of the game
let highScore = 0;              // Best score of the game

// The weights of each attribute used in determining the optimum piece placement
let costWeights = [0.87,3.54,0.99,1.48,2.49,1.87];
let maximumNumberOfRotations = 0;   // The number of times its possible to rotate the current piece
let optimumRotation = -1;           // The optimum rotation for the current piece
let lowestPlacementCost = 10000;    // The lowest cost of the current piece placement
let optimumRight = -1;              // The optimum distance from the left side of the board for the current piece

let tutorialPieces = [          // Stores the pieces that will be used in the tutorial section
  {time: 4, type: 0}, 
  {time: 7, type: 1}, 
  {time: 10, type: 2}, 
  {time: 13, type: 3}, 
  {time: 16, type: 4}, 
  {time: 19, type: 5}, 
  {time: 22, type: 6},
  {time: 25, type: 0}, 
  {time: 25.6, type: 2}, 
  {time: 28, type: 3}, 
  {time: 28.6, type: 4}, 
  {time: 31, type: 5}, 
  {time: 31.6, type: 6}, 
  {time: 34, type: 1},
  {time: 34.6, type: 2}];












/*-------------------- Setup -------------------*/
// This function sets up the tetris part of the application before running
function setupTetrisPart() {
  // Create an empty 2D grid
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
    }
  }

  
  // Create an empty 2D tetromino (each box of the tetromino will have an x and y value)
  for (let i = 0; i < 4; i++) currentTetromino[i] = [];
  
  // If the score beats the highscore, then save the record values
  if(score > highScore) {
    highScore = score;
    highScoreLineCount = lineCount;
  }
  
  // Reset these values for the next game
  score = 0;
  lineCount = 0;

  mappedPieces = [];
  upcomingPieces = [];
  canDropPiece = true;
  startSecond = 0;
  countdownStart = 0;
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

  // This is a duplicate of the current tetromino so that we can confirm first if rotating is possible
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























/*-------------------- Grid Functions -------------------*/
// These functions control the grid's behavior
function endGame() {
  gameState = "Game Over";
  resetSound(songs[chosenSong].music);
  playSound(gameoverSound);
}

function checkLines() {
  // This variable keeps track of the number of lines cleared in the grid
  let numberOfClears = 0;

  // Loop through every row in the grid
  for (let i = 0; i < rows; i++) {
    // This counter keeps track of the number of cells in the current row that are filled in
    let boxCounter = 0;
    // Loop through all the columns in this row; if there's a box, add 1 to the counter
    for (let j = 0; j < cols; j++) if (grid[j][i] != 0) boxCounter++;

    // If all boxes in the row are full (i.e. the line is completed), move all the previous rows down
    if (boxCounter == cols) {
      // Loop through all the columns
      for (let j = 0; j < cols; j++) {
        // Loop through all the rows above the current one in reverse order
        for (let I = i - 1; I >= -1; I--) {
          // This if statement corrects the issue when there's a box at the very top of the grid.
          // Rather than bringing the box above it down (which does not exist), it simply creates an empty cell
          if(I == -1) grid[j][0] = 0;

          // For every other box that's not at the very top of the grid, replace it with the one above
          else grid[j][I + 1] = grid[j][I];
        }
      }
      // At this point, one row has been cleared, so increment the numberOfClears
      numberOfClears++;
    }
  }

  // Play the correct sound based on the number of lines cleared
  if(gameScene != "Tutorial") {
    if(numberOfClears == 4) playSound(tetrisSound);
    else if(numberOfClears > 0) playSound(lineclearSound);
  }

  // Based on the number of lines cleared, increase the score
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

  // Increase the linecount
  lineCount += numberOfClears;
}

function duplicateGrid() {
  // This variable represents the identical version of the grid
  let copiedGrid = [];

  // Copy the grid over to the new version
  for (let i = 0; i < cols; i++) {
    copiedGrid[i] = [];
    for (let j = 0; j < rows; j++) {
      copiedGrid[i][j] = grid[i][j];
    }
  }

  // Return the copied version
  return copiedGrid;
}



















/*-------------------- Tetromino Functions -------------------*/
// These functions perferm actions or do tasks based on a tetromino

// Creates a new tetromino and moves it to the best location
function dropTetromino(type, isScrambled) {
  // If the piece should be scrambled, create 4 random boxes for the tetromino
  if(isScrambled) createScrambledTetromino();
  // If the piece should not be scrambled, create an ordinary tetromino from the piece type
  else createTetrominoFromType(currentTetromino, type);

  findOptimumPiecePlacement();
  moveTetrominoToOptimumPosition();

  // If the new generated tetromino is created on the stack, we have topped out, so reset the game.
  if (landsOnStack(currentTetromino)) endGame();
}

// Returns true if the given tetromino overlaps with any block on the stack
function landsOnStack(tetromino) {
  // Loop through all the tetromino's blocks
  for (let i = 0; i < 4; i++) {
    // If the grid at the current box's location is filled, that means the block is overlapping with the stack, so return true
    if (grid[tetromino[i][0]][tetromino[i][1]] > 0) return true;
  }

  // At this point, none of the boxes overlap with the stack, so return false
  return false;
}


// Return true if the given tetromino lies outside of the grid's dimensions
function outOfBounds(tetromino) {
  // Loop through all the tetromino's blocks
  for (let i = 0; i < 4; i++) {
    // If the current block is too far left, too far right, or too far down, it is outside of the grid, so return true
    if (
      tetromino[i][0] < 0 ||
      tetromino[i][0] > cols - 1 ||
      tetromino[i][1] > rows - 1
    ) return true;
  }

  // At this point, none of the boxes lay outside the grid, so return false
  return false;
}

// Returns a copied version of the given tetromino
function duplicateTetromino(tetromino) {
  // This variable stores the copied boxes of the given tetromino
  let copiedTetromino = [];

  // Loop through all boxes of the given tetromino
  for (let i = 0; i < 4; i++) {
    // Set the current element to be an array (it will store the x and y)
    copiedTetromino[i] = [];

    // Copy the given tetromino's box's x and y location to the new array
    copiedTetromino[i][0] = tetromino[i][0];
    copiedTetromino[i][1] = tetromino[i][1];
  }

  // Return the copied version
  return copiedTetromino;
}


function placePiece() {
  // Set the grid to solid blocks at the location of the current tetromino.
  // The type/color of the solid block will be based on the tetromino type
  for (let i = 0; i < 4; i++) {
    grid[currentTetromino[i][0]][currentTetromino[i][1]] = (upcomingPieces[0]%7)+1;
  }

  // Check lines for clearing
  checkLines();

  // Move on to the next upcoming piece
  upcomingPieces.shift();
  canDropPiece = true;
}



function createScrambledTetromino() {
  // Create a list of possible positions the boxes can be at
  // (The list contains the indecies of positions in a 4x4 grid, so numbers between 0-16)
  let possiblePositions = [];

  // Fill in the list with all the possible indecies
  for(let i=0; i<16; i++) possiblePositions[i] = i;

  // Shuffle the list of positions to add randomness
  shuffleArray(possiblePositions);

  // Take only the first four possible positions and set the current tetromino's boxes to those positions
  for(let i=0; i<4; i++) {
    currentTetromino[i][0] = possiblePositions[i]%4 + 3;
    currentTetromino[i][1] = int(possiblePositions[i]/4);
  }

  // The maximum number of times you can rotate this random piece is 4
  maximumNumberOfRotations = 4;
}

function createTetrominoFromType(tetromino, type) {
  // Based on the type of the piece, generate the tetromino
  switch (type) {
    // O piece
    case 0:
      tetromino[0][0] = 4;
      tetromino[0][1] = 0;
      tetromino[1][0] = 5;
      tetromino[1][1] = 0;
      tetromino[2][0] = 4;
      tetromino[2][1] = 1;
      tetromino[3][0] = 5;
      tetromino[3][1] = 1;
      maximumNumberOfRotations = 1;
      break;
    // I piece
    case 1:
      tetromino[0][0] = 5;
      tetromino[0][1] = 0;
      tetromino[1][0] = 4;
      tetromino[1][1] = 0;
      tetromino[2][0] = 3;
      tetromino[2][1] = 0;
      tetromino[3][0] = 6;
      tetromino[3][1] = 0;
      maximumNumberOfRotations = 2;
      break;
    // T piece
    case 2:
      tetromino[0][0] = 5;
      tetromino[0][1] = 0;
      tetromino[1][0] = 4;
      tetromino[1][1] = 0;
      tetromino[2][0] = 6;
      tetromino[2][1] = 0;
      tetromino[3][0] = 5;
      tetromino[3][1] = 1;
      maximumNumberOfRotations = 4;
      break;
    // S piece
    case 3:
      tetromino[0][0] = 5;
      tetromino[0][1] = 0;
      tetromino[1][0] = 4;
      tetromino[1][1] = 1;
      tetromino[2][0] = 6;
      tetromino[2][1] = 0;
      tetromino[3][0] = 5;
      tetromino[3][1] = 1;
      maximumNumberOfRotations = 2;
      break;
    // Z piece
    case 4:
      tetromino[0][0] = 5;
      tetromino[0][1] = 0;
      tetromino[1][0] = 4;
      tetromino[1][1] = 0;
      tetromino[2][0] = 6;
      tetromino[2][1] = 1;
      tetromino[3][0] = 5;
      tetromino[3][1] = 1;
      maximumNumberOfRotations = 2;
      break;
    // L piece
    case 5:
      tetromino[0][0] = 5;
      tetromino[0][1] = 0;
      tetromino[1][0] = 4;
      tetromino[1][1] = 0;
      tetromino[2][0] = 4;
      tetromino[2][1] = 1;
      tetromino[3][0] = 6;
      tetromino[3][1] = 0;
      maximumNumberOfRotations = 4;
      break;
    // J piece
    case 6:
      tetromino[0][0] = 5;
      tetromino[0][1] = 0;
      tetromino[1][0] = 4;
      tetromino[1][1] = 0;
      tetromino[2][0] = 6;
      tetromino[2][1] = 1;
      tetromino[3][0] = 6;
      tetromino[3][1] = 0;
      maximumNumberOfRotations = 4;
      break;
  }
}
















/*-------------------- Placement Algorithm -------------------*/
// These functions contribute to the finding the optimum location on the board that the current piece should go to
// The way we calculate scores is based on:
// - Vertical position (the bottom of the grid is favored)
// - Number of holes created (less holes created is favored)
// - Number of lines cleared (more lines cleared is favored)
// - Tetrises (tetrises are very favored)
// - Roughness of the stack (a flatter stack is favored)
// - Pillars created (less pillars is favored)

// Returns the current tetromino with a given rotation at the leftmost side of the board
function getStartingPosition(numberOfRotations) {
  // Duplicate the current tetromino to represent the current rotation
  let rotatedTetromino = duplicateTetromino(currentTetromino);

  // Rotate the tetromino to the current rotation position
  for (let i = 0; i < numberOfRotations; i++) 
    rotatedTetromino = rotatePiece(1, rotatedTetromino);

  // Move the tetromino all the way to the left side of the board so that it's touching the edge
  while (moveSideways(-1, rotatedTetromino) != rotatedTetromino)
    rotatedTetromino = moveSideways(-1, rotatedTetromino);
  
  return rotatedTetromino;
}

function findOptimumPiecePlacement() {
  // Loop through every possible rotation of the current piece
  for (let currentRotation = 0; currentRotation < maximumNumberOfRotations; currentRotation++) {
    let startingPlacement = getStartingPosition(currentRotation);

    // These two values represent the min and max 'x' values of the tetromino's boxes
    let leftmostBox = startingPlacement[0][0];
    let rightmostBox = leftmostBox;

    // Loop through all the boxes of the tetromino and find the min and max boxes
    for (let i = 0; i < 4; i++) {
      leftmostBox = min(startingPlacement[i][0], leftmostBox);
      rightmostBox = max(startingPlacement[i][0], rightmostBox);
    }

    // Calculate how wide the tetromino is based on the min and max values
    let pieceWidth = rightmostBox - leftmostBox;

    // Now we will simulate the tetromino being placed at every possible column and calculate its cost
    for (let currentColumn = 0; currentColumn < cols - pieceWidth; currentColumn++) {
      // This cost value represents how bad a piece is to be placed (i.e. a high cost is bad, a low cost is good)
      let cost = 0;

      // Get a copy of the rotated tetromino for this current column
      let currentSimulationTetromino = duplicateTetromino(startingPlacement);

      // Move over the piece to the current simulation column
      for (let j = 0; j < currentColumn; j++) {
        for (let k = 0; k < 4; k++) {
          currentSimulationTetromino[k][0]++;
        }
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
        cost += (rows-currentSimulationTetromino[i][1])*costWeights[0];
      }
      // If the rotation is invalid, move on to the next rotation
      if(!isRotationValid) continue;

      let copiedGrid = duplicateGrid();
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
        cost -= costWeights[1]*3;
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
      if (cost < lowestPlacementCost) {
        lowestPlacementCost = cost;
        optimumRotation = currentRotation;
        optimumRight = currentColumn;
      }
    }
  }
}

function moveTetrominoToOptimumPosition() {
  // Rotate the current piece to the optimum rotation
  for (let i = 0; i < optimumRotation; i++) 
  currentTetromino = rotatePiece(1, currentTetromino);

  // Move the piece to the left-most part of the board
  while (moveSideways(-1, currentTetromino) != currentTetromino)
    currentTetromino = moveSideways(-1, currentTetromino);

  // Move the piece to the optimum horizontal position
  for (let i = 0; i < optimumRight; i++)
    currentTetromino = moveSideways(1, currentTetromino);

  // Reset the piece placement optimizing values
  optimumRotation = -1;
  lowestPlacementCost = 10000;
  optimumRight = -1;
}
















/*-------------------- Drawing Functions -------------------*/
// These functions contribute to the drawing of the tetris game in any way possible.
// If it controls color, shape, or text, it lies in this area.

// Set the fill color based on the given tetromino type
function colorFromType(type) {
  let allColors = [
    color(0),             // Black    (empty cell)
    color(255,255,0),     // Yellow   (O piece)
    color(0,255,255),     // Cyan     (I piece)
    color(255,0,255),     // Magenta  (T piece)
    color(0,255,0),       // Green    (S piece)
    color(255,0,0),       // Red      (Z piece)
    color(255,100,0),     // Orange   (L piece)
    color(0,0,255)];      // Blue     (J piece)
  
  // Set the fill to the color in the array at the index with the "type" value
  fill(allColors[type]);
}

// Draw the representation of a given piece at a specific location with a specific size
function drawPieceShape(pieceType, centerX, centerY, blockSize) {
  rectMode(CENTER);
  // Based on the given piece type, draw a series of rectangles that represent the piece shape
  switch(pieceType) {
    // O piece
    case 0:
      rect(centerX, centerY, blockSize*2, blockSize*2);
      break;
    // I piece
    case 1:
      rect(centerX, centerY, blockSize, blockSize*3);
      break;
    // T piece
    case 2:
      rect(centerX, centerY - blockSize*0.5, blockSize*3, blockSize);
      rect(centerX, centerY + blockSize*0.5, blockSize, blockSize);
      break;
    // S piece
    case 3:
      rect(centerX, centerY, blockSize*2, blockSize);
      rect(centerX - blockSize*0.5, centerY - blockSize, blockSize, blockSize);
      rect(centerX + blockSize*0.5, centerY + blockSize, blockSize, blockSize);
      break;
    // Z piece
    case 4:
      rect(centerX, centerY, blockSize*2, blockSize);
      rect(centerX + blockSize*0.5, centerY - blockSize, blockSize, blockSize);
      rect(centerX - blockSize*0.5, centerY + blockSize, blockSize, blockSize);
      break;
    // L piece
    case 5:
      rect(centerX, centerY, blockSize*3, blockSize);
      rect(centerX - blockSize, centerY + blockSize, blockSize, blockSize);
      break;
    // J piece
    case 6:
      rect(centerX, centerY, blockSize*3, blockSize);
      rect(centerX + blockSize, centerY + blockSize, blockSize, blockSize);
      break;
  }
}

// Displays every tetris element like it was in the draw function
function displayTetrisElements() {
  // Display the board that contains the upcoming pieces
  fill(0);
  stroke(25);
  strokeWeight(4);
  rectMode(CORNER);
  rect(scl*cols + 150, 50, width-(scl*cols+150), 100);
  stroke(100);
  strokeWeight(4);
  for(var i=0; i<width; i+=67) {
    var x = i;
    if(startSecond != 0) x -= ((millis()/1000-startSecond)%1)*67*poseTime;
    if(x < 0) continue;
    x += scl*cols + 150 + acceptanceAmount;
    line(x,50,x,150);
  }

  // Period in the board for accepting correct poses
  fill(255,50);
  stroke(200);
  strokeWeight(10);
  rectMode(CENTER);
  rect(scl*cols + 150+acceptanceAmount/2, 100, acceptanceAmount, 100, 4);
  noFill();
  stroke(0);
  strokeWeight(2);
  rect(scl*cols + 150+acceptanceAmount/2, 100, acceptanceAmount, 100, 4);
  
  // Display the upcoming pieces
  if(startSecond != 0) {
    noStroke();
    for(let i=0; i<mappedPieces.length; i++) {
      var x = acceptanceAmount/2 + (mappedPieces[i].time+startSecond+startDelay-millis()/1000) * scalingFactor;
      colorFromType(mappedPieces[i].type+1);
      drawPieceShape(mappedPieces[i].type, scl*cols+150+x, 100, 24);
    }
  }
}

function displayGameElements() {
  push();
  translate(100,50);
  // Display all elements in the grid
  rectMode(CORNER);
  noStroke();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      colorFromType(grid[i][j]);
      rect(i * scl, j * scl, scl, scl);
    }
  }
  // Display the borders of the grid and stats
  noFill();
  stroke(98, 176, 245);
  strokeWeight(10);
  rect(0,0,scl*cols,scl*rows);
  fill(0);
  rect(scl*cols,scl*rows-300,200,150);
  rect(scl*cols,scl*rows-150,200,150);
  noFill();
  stroke(0);
  strokeWeight(2);
  rect(0,0,scl*cols,scl*rows);
  rect(scl*cols,scl*rows-300,200,150);
  rect(scl*cols,scl*rows-150,200,150);
  

  // Display the current tetromino only if it is currently being dropped
  if(!canDropPiece) {
    for (let i = 0; i < 4; i++) {
      colorFromType((upcomingPieces[0]%7)+1);
      rect(currentTetromino[i][0] * scl, currentTetromino[i][1] * scl, scl, scl);
    }
  }

  // Display the score and line count
  imageMode(CENTER);
  image(statsImages[0], scl*cols+100, scl*rows-260, 150, 50);
  image(statsImages[1], scl*cols+100, scl*rows-110, 150, 50);
  fill(255);
  noStroke();
  textSize(50);
  textAlign(CENTER, CENTER);
  text(score, scl*cols+100, scl*rows-200);
  text(lineCount, scl*cols+100, scl*rows-40);
  pop();
}




















/*-------------------- Update Functions -------------------*/
// These functions update the game every frame of animation

// General update function that is called every frame
function updateGameElements() {
  // If we still have pieces left in the song...
  if(mappedPieces.length != 0) {
    // Set the current tetromino type to the next piece that's coming in the song
    currentTetrominoType = mappedPieces[0].type;

    // Calculate the y position of the piece in the track
    var y = acceptanceAmount/2+(mappedPieces[0].time+startSecond+startDelay-millis()/1000) * scalingFactor;
    
    // If the player couldn't pose in time, drop a scrambled tetromino
    if (y < 0) {
      upcomingPieces.push(currentTetrominoType+7);
      playSound(wrongSound);
      mappedPieces.shift();
    } 
    // If the player did do the correct pose in the allowed amount of time, drop an ordinary tetromino
    else if(y < acceptanceAmount) {
      if(allLabels.indexOf(label) == currentTetrominoType) {
        upcomingPieces.push(currentTetrominoType);
        playSound(correctSound);
        mappedPieces.shift();
      }
    }
  }

  // If there are pieces ready to drop, drop the first one and wait for it to finish before dropping again
  if(upcomingPieces.length != 0 && canDropPiece) {
    // Drop the current piece with a given type and whether or not to scramble
    dropTetromino(upcomingPieces[0]%7,(upcomingPieces[0]>6));
    canDropPiece = false;
  }

  // After a certain amount of frames, move the current piece down
  if (!canDropPiece) currentTetromino = moveDown(currentTetromino);
}









/*-------------------- Miscellaneous Functions -------------------*/
// These functions perform various actions that aren't specific to one characteristic of the tetris game

// Stops playing the given sound and sets it back to the beginning
function resetSound(sound) {
  sound.pause();
  sound.currentTime = 0;
}

// Resets the given sound and plays it (essentially it plays a sound from the beginning)
function playSound(sound) {
  resetSound(sound);
  sound.play();
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