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
let tetrisCount = 0;
let recordTetrisCount = 0;
let tetrisRate = 0;
let recordTetrisRate = 0;
let pieceCount = 0;
let recordPieceCount = 0;


//let population = [[1,1,1,1,1,1,1,1]];
let population = [];
let startingGenes = [2.67,1.31,1.32,1.78,1.35,1.02,1.52,1.11]
let populationSize = 16;
let numberOfGenes = 8;
let currentSpecies = 0;
let bestSpeciesRecord = 0;
let bestSpecies = -1;
let generationCount = 0;
let bestGenesOverall = [];
let speedUpSimulation = false;

function setup() {
  createCanvas(displayWidth, displayHeight * 0.8);

  // for(let i=0; i<populationSize; i++) {
  //   population[i] = [];
  //   for(let j=0; j<numberOfGenes; j++) {
  //     population[i][j] = random(1,3);
  //   }
  // }
  for(let i=0; i<populationSize; i++) {
    population[i] = [];
    for(let j=0; j<numberOfGenes; j++) {
      if(random(1) < 0.5) {
        population[i][j] = startingGenes[j] + random(-0.5,0.5);
      } else {
        population[i][j] = startingGenes[j];
      }
    }
  }
  for(let i=0; i<numberOfGenes; i++) {
    bestGenesOverall[i] = 0;
  }

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
  if(bagCounter == 0) {
    bagCounter = 7;
    shuffleArray(pieceBag);
  }
  // Choose a random tetromino type
  currentTetrominoType = pieceBag[bagCounter-1];
  bagCounter--;

  let maximumNumberOfRotations = 0;

  pieceCount++;


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

  // Top out
  if (landsOnStack(currentTetromino)) {
    reset();
  }



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
            cost += population[currentSpecies][0];
          }
        }
        cost += population[currentSpecies][6];
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
        cost += (rows-currentSimulationTetromino[i][1])*population[currentSpecies][1];
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
        cost -= population[currentSpecies][7]*3;
      } else {
        cost += numberOfClears*population[currentSpecies][2];
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
            cost += i*population[currentSpecies][3];
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
          cost += columnCount*population[currentSpecies][4];
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
          cost += abs(currentHeight-previousHeight)*population[currentSpecies][5];
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

function draw() {
  background(50);

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
  if (frameCount % speed == 0) {
    if(speedUpSimulation) {
      while(moveDown(currentTetromino) != currentTetromino) {
        currentTetromino = moveDown(currentTetromino);
      }
    }else {
      currentTetromino = moveDown(currentTetromino);
    }
  }

  fill(255);
  textSize(30);
  text("Score = " + score, width / 4 + 100, 50);
  text("Line Count = " + lineCount, width / 4 + 100, 100);
  text("Tetrises = " + tetrisCount, width / 4 + 100, 150);
  text("Tetris rate = " + nf(tetrisRate,1,5), width / 4 + 100, 200);
  text("Piece count = " + pieceCount, width / 4 + 100, 250);

  text("Best score = " + highScore, width / 4 + 500, 50);
  text("Best lines = " + highScoreLineCount, width / 4 + 500, 100);
  text("Best tetrises = " + recordTetrisCount, width / 4 + 500, 150);
  text("Best tetris rate = " + nf(recordTetrisRate,1,5), width / 4 + 500, 200);
  text("Best piece count = " + recordPieceCount, width / 4 + 500, 250);
  
  text("Generation = " + generationCount, width / 4 + 100, 350);
  text("Species = " + currentSpecies, width / 4 + 100, 400);
  text("Current genes = " + nf(population[currentSpecies],1,2), width / 4 + 100, 450);
  text("Best genes = " + bestGenesOverall, width / 4 + 100, 500);
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

function reset() {
  // Create an empty 2D grid
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
    }
  }

  if(tetrisRate*tetrisCount > recordTetrisRate*recordTetrisCount) {
    for(let gene=0; gene<numberOfGenes; gene++) {
      bestGenesOverall[gene] = nf(population[currentSpecies][gene],1,2);
    }
    highScore = score;
    highScoreLineCount = lineCount;
    recordTetrisCount = tetrisCount;
    recordTetrisRate = tetrisRate;
    recordPieceCount = pieceCount;
  }

  if(tetrisRate*tetrisCount > bestSpeciesRecord) {
    bestSpeciesRecord = tetrisRate*tetrisCount;
    bestSpecies = currentSpecies;
  }

  currentSpecies++;
  if(currentSpecies > populationSize-1) {
    let bestGenes = [];
    for(let gene=0; gene<numberOfGenes; gene++) {
      bestGenes[gene] = population[bestSpecies][gene];
    }
    for(let species=0; species<populationSize; species++) {
      for(let gene=0; gene<numberOfGenes; gene++) {
        // There's a 50% chance that the current gene will not be edited
        if(random(1) < 0.5) {
          population[species][gene] = bestGenes[gene];
          continue;
        }
        population[species][gene] = bestGenes[gene] + random(-0.5,0.5);
        if(population[species][gene] < 0) {
          population[species][gene] = 0;
        }
      }
    }
    bestSpeciesRecord = 0;
    currentSpecies = 0;
    generationCount++;
  }

  score = 0;
  lineCount = 0;
  tetrisCount = 0;
  tetrisRate = 0;
  pieceCount = 0;

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

function moveDown(tetromino) {
  // This is a duplicate of the current tetromino so that we can confirm first if moving down is possible
  let futureTetromino = duplicateTetromino(tetromino);

  // Move the future tetromino one unit down
  for (let i = 0; i < 4; i++) {
    futureTetromino[i][1]++;
  }

  // This variable determines whether or not moving down is possible
  let canMoveDown = !(
    landsOnStack(futureTetromino) || outOfBounds(futureTetromino)
  );

  // If moving down is possible, move the real tetromino piece one unit down
  if (canMoveDown) {
    return futureTetromino;
  }
  // If moving down is not possible, that means we must place the current piece
  else {
    placePiece();
    return tetromino;
  }
}

function rotatePiece(dir, tetromino) {
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

  // This variable determines whether or not moving down is possible
  let canRotate = !(
    landsOnStack(futureTetromino) || outOfBounds(futureTetromino)
  );

  // If we can rotate, set the current tetromino to the future tetromino
  if (canRotate) {
    return futureTetromino;
  }
  return tetromino;
}

function moveSideways(dir, tetromino) {
  // This is a duplicate of the current tetromino so that we can confirm first if moving sideways is possible
  let futureTetromino = duplicateTetromino(tetromino);

  for (let i = 0; i < 4; i++) {
    futureTetromino[i][0] += dir;
  }

  if (outOfBounds(futureTetromino)) {
    return tetromino;
  }

  if (landsOnStack(futureTetromino)) {
    return tetromino;
  }

  return futureTetromino;
}

function placePiece() {
  // Set the grid to solid blocks at the location of the current tetromino
  for (let i = 0; i < 4; i++) {
    grid[currentTetromino[i][0]][currentTetromino[i][1]] =
      currentTetrominoType + 1;
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
      tetrisCount++;
      break;
  }
  lineCount += numberOfClears;
  tetrisRate = (tetrisCount*4)/lineCount;
}

function keyPressed() {
  switch (key) {
    case 'p':
      reset();
    break;
    case 's':
    speedUpSimulation = !speedUpSimulation;
    break;
    // case "a":
    //   currentTetromino = moveSideways(-1, currentTetromino);
    //   break;
    // case "d":
    //   currentTetromino = moveSideways(1, currentTetromino);
    //   break;
    // case "z":
    //   currentTetromino = rotatePiece(1, currentTetromino);
    //   break;
    // case "c":
    //   currentTetromino = rotatePiece(-1, currentTetromino);
    //   break;
  }
}
