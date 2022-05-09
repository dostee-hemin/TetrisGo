/*  This code file is split into the following sub-sections:
  Variables                 (the variables globally associated with animations)
  Setup                     (like setup(), but for the animation)
  Main Menu Animations      (contains the code for the animations used in the main menu)
  Camera Adjust Animations  (contains the code for the animations used in the camera adjustment panel)
  Select Song Animations    (contains the code for the animations used in the song selection panel)
  Game Scene Animations     (contains the code for the animations used in the game)
  Game Over Animations      (contains the code for the animations used in the game over screen)
  Game Completed Animations (contains the code for the animations used in the level completed scene)
  General Animations        (contains the code for general animations used in many scenes)
*/






/*-------------------- Variables -------------------*/

//------ For the transition
let transGrid = [];                 // The grid used for the transition
let transScl = 70;                  // The scale (in pixels) of each cell in the transition grid
let transCols, transRows;           // The dimensions of the transition grid (columns and rows)
let transExtra = 4;                 // Extra amount of columns and rows added to the transition grid to fill any holes
let destinationScene;               // Represents the game state we want to transition to
let transitionPieces = [];          // Stores the pieces that will cover the screen in the transition
let currentTransitionPiece = 0;     // Stores how far in the transition we are
let isTransitioning;                // Boolean that determines whether or not we should show the transition animation
let isShrinking;                    // Boolean that determines whether we should grow or shrink the transition pieces

//------ For the main menu
let logoSize = 0;                   // The scale of the logo (between 0 and 1)
let promptSize = 0;                 // The scale of the prompt (between 0 and 1)
let prompt = "Press 'Enter'";       // The actual prompt
let promptOffsets = [];             // The y offsets of each of the prompt characetrs
let rainEffect;                     // The particle system for creating a rain effect











/*-------------------- Setup -------------------*/
function setupAnimationPart() {
    // Assign the columns and rows according to the width and height of the canvas
    transCols = floor(width / transScl) + transExtra;
    transRows = floor(height / transScl) + transExtra;

    // Initialize all of the prompt offsets to 0
    for(var i=0; i<prompt.length; i++) promptOffsets[i] = 0;

    // Initialize the rain effect manager
    rainEffect = new RainEffect();
}










/*-------------------- Main Menu -------------------*/

// Class that controls falling pieces to create a rain effect
class RainEffect {
    // Create an empty array that will contain out falling pieces
    constructor() {
        this.fallingPieces = [];
    }

    // Loop through every piece in the array and display it
    display() {
        for (const piece in this.fallingPieces) piece.display();
    }

    update() {
        // Every frame, there's a random chance of adding a new falling piece
        if(random(1) < 0.05) this.fallingPieces.push(new FallingPiece());

        // Loop through all the falling pieces
        for(var i=this.fallingPieces.length-1; i>=0; i--) {
            var piece = this.fallingPieces[i];

            // Update the current piece
            piece.update();

            // If the piece has reached the bottom of the screen, remove it from the array
            if(piece.isFinished()) this.fallingPieces.splice(i, 1);
        }
    }
}

// Class that represents a falling piece for the rain effect
class FallingPiece {
    constructor() {
        // Set the location of the piece to a random horizontal position above the screen
        this.x = random(width);
        this.y = -50;

        // Give the piece a random rotation, type, and speed
        this.rotation = floor(random(4));
        this.type = floor(random(7));
        this.speed = random(3,7);

        // Set the frame this piece is created to the current frame
        this.startingFrame = frameCount;

        // Set the size according to the speed of the piece (to create a parralax effect)
        this.size = this.speed * 5;
    }

    display() {
        // Display the piece shape with the correct rotation
        push();
        translate(this.x,this.y);
        for(var i=0; i<this.rotation; i++) rotate(HALF_PI);
        noStroke();
        colorFromType(this.type+1);
        drawPieceShape(this.type,0,0,this.size);
        pop();
    }

    update() {
        // Every couple of frames, rotate the piece
        if((frameCount - this.startingFrame) % 40 == 0) (this.rotation++)%4;

        // Move the piece down by the speed
        this.y += this.speed;
    }

    // Returns true if the piece has reached the bottom of the screen
    isFinished() {
        return this.y > height+200;
    }
}














/*-------------------- General Animations -------------------*/

// Function to create the grid that contains filled tetris pieces that will cover the screen for the transition animation
function makeTransition(scene) {
    // Create a new empty grid
    for (let i = 0; i < transCols; i++) {
        transGrid[i] = [];
        for (let j = 0; j < transRows; j++) {
            transGrid[i][j] = 0;
        }
    }
    // Reset all the values
    transitionPieces = [];
    isTransitioning = true;
    isShrinking = false;
    currentTransitionPiece = 0;

    // Set the scene we want to transition into using the given scene
    destinationScene = scene;

    // Represents the number of times we have tried to add a new piece to the grid
    var currentIteration = 0;

    // Continuously add new pieces to the grid (we will break out of the loop later)
    while (true) {
        // Pick a random column in the grid
        var currentColumn = floor(random(transCols));

        // Pick a random piece type
        var type = currentIteration % 7;

        // Create the piece from the type at the top of the grid
        var currentPiece = [];
        for (var i = 0; i < 7; i++) currentPiece[i] = [];
        createTetrominoFromType(currentPiece, type);

        // Loop through every possible rotation of the current piece
        for (let currentRotation = 0; currentRotation < 4; currentRotation++) {
            // If the current piece is an I piece and it is vertical, don't add this piece.
            // This is because this piece will always be placed, but will end up creating pillars.
            if (type == 1 && currentRotation % 2 == 0) break;

            // Duplicate the current tetromino to represent the current rotation
            let testPiece = duplicateTetromino(currentPiece);

            // Rotate the tetromino to the current rotation position
            for (let i = 0; i < currentRotation; i++) {
                // If the current tetromino is an O piece, there's no need to calculate a rotation so just leave the loop
                if (type == 0) break;

                // This is a duplicate of the current tetromino so that we can confirm first if rotating is possible
                let futureTetromino = duplicateTetromino(testPiece);

                // Loop through every box in the tetromino that's not the center (not at index 0)
                for (let j = 1; j < 4; j++) {
                    // Calculate the offset of the current box from the center box
                    let xOff = testPiece[0][0] - testPiece[j][0];
                    let yOff = testPiece[0][1] - testPiece[j][1];

                    // Set the future tetromino's pieces based on those offsets, but flipped
                    futureTetromino[j][0] = testPiece[0][0] - yOff;
                    futureTetromino[j][1] = testPiece[0][1] + xOff;
                }

                // If rotating is not possible, don't update the current tetromino's position, so just leave the loop
                if (goesOut(futureTetromino)) break;
                if (lands(futureTetromino)) break;

                // At this point, we can rotate, so set the current tetromino to the rotated version
                testPiece = futureTetromino;
            }

            // Move the tetromino all the way to the left side of the board so that it's touching the edge
            while (true) {
                // This is a duplicate of the current tetromino so that we can confirm first if moving sideways is possible
                let futureTetromino = duplicateTetromino(testPiece);

                // Move the future tetromino one unit horizontally in the given direction
                for (let i = 0; i < 4; i++) futureTetromino[i][0]--;

                // If moving sideways is not possible, don't update the current tetromino's position, so just leave the loop
                if (goesOut(futureTetromino)) break;
                if (lands(futureTetromino)) break;

                // At this point, we can move sideways, so set the current tetromino to the new version
                testPiece = futureTetromino;
            }

            // These two values represent the min and max 'x' values of the tetromino's boxes
            let leftmostBox = testPiece[0][0];
            let rightmostBox = leftmostBox;

            // Loop through all the boxes of the tetromino and find the min and max boxes
            for (let i = 0; i < 4; i++) {
                leftmostBox = min(testPiece[i][0], leftmostBox);
                rightmostBox = max(testPiece[i][0], rightmostBox);
            }

            // Calculate how wide the tetromino is based on the min and max values
            let pieceWidth = rightmostBox - leftmostBox;

            // Move over the piece to the current simulation column
            for (let j = 0; j < currentColumn && j < transCols - pieceWidth; j++) {
                for (let k=0; k<4; k++) testPiece[k][0]++;
            }

            /* Calculate where the piece will land if we let it drop */
            // Continuously move the piece down
            while (true) {
                for (var i=0; i<4; i++) testPiece[i][1]++;

                // If the piece hits the bottom of the grid, leave the loop
                if (goesOut(testPiece)) break;
                if (lands(testPiece)) break;
            }
            // This boolean determines whether or not the current rotation is valid (i.e. if the piece isn't outside the grid from the rotation)
            let isRotationValid = true;
            // Move the piece one unit back up (to fix overshooting)
            for (let i = 0; i < 4; i++) {
                testPiece[i][1]--;
                // If the box is outside the grid, the current rotation is not valid so leave the loop
                if (testPiece[i][0] < 0 || testPiece[i][0] > transCols - 1 || testPiece[i][1] < transExtra - 4) {
                    isRotationValid = false;
                    break;
                }
            }
            // If the rotation is invalid, move on to the next rotation
            if (!isRotationValid) continue;

            // This check is used to see if the current placement is above the screen (i.e. unnecessary to place)
            var isBelowScreen = false;
            for (var b = 0; b < 4; b++) {
                if (testPiece[b][1] >= transExtra) {
                    isBelowScreen = true;
                }
            }
            if (!isBelowScreen) continue;

            // Represents a copied version of the grid that we 
            // use to check if the current piece is valid in this position
            var copiedGrid = [];

            // Copy the grid over to the new version
            for (let i = 0; i < transCols; i++) {
                copiedGrid[i] = [];
                for (let j = 0; j < transRows; j++) {
                    copiedGrid[i][j] = transGrid[i][j];
                }
            }

            // Set the grid at the current piece's location to be -1 (just so we can understand the layout of the stack later)
            for (let j = 0; j < 4; j++) {
                copiedGrid[testPiece[j][0]][testPiece[j][1]] = -1;
            }

            /* Look for holes that the tetromino creates */
            // Loop through every column in the grid
            var canBePlaced = true;
            for (let j = 0; j < transCols; j++) {
                // This variable represents the top of the stack at the current column
                let topI = 0;
                // Find the top of the stack by continuously moving down
                while (copiedGrid[j][topI] == 0) topI++;

                // Loop through every row underneath the top of the stack
                for (let i = topI; i < transRows; i++) {
                    // If the current grid element is empty, that means it's a hole, which also means
                    // we can not place the current piece here, so update the boolean and leave the loop
                    if (copiedGrid[j][i] == 0) {
                        canBePlaced = false;
                        break;
                    }
                }
            }

            // If the current piece does not create any holes, we can add it to the transition grid
            if (canBePlaced) {
                // Add it to the list of pieces
                transitionPieces.push(new TransitionPiece(testPiece, type, currentRotation));

                // Update the grid
                for (var i = 0; i < 4; i++) {
                    transGrid[testPiece[i][0]][testPiece[i][1]] = type + 1;
                }

                // At this point, the new piece might have created a column that only a vertical I piece can fill,
                // so look for those columns and fill them.
                // Loop through every column in the grid
                for (let j = 0; j < transCols - 1; j++) {
                    // This variable represents the top of the stack at the current column
                    let topI = 0;
                    // Find the top of the stack by continuously moving down
                    let columnCount = 0;
                    while (transGrid[j][topI] == 0) {
                        topI++;

                        // At each iteration, check if a column exists to the left and right of the current column
                        if (j == 0) {
                            if (transGrid[j + 1][topI] != 0) columnCount++;
                        } else if (j == transCols - 1) {
                            if (transGrid[j - 1][topI] != 0) columnCount++;
                        } else {
                            if (transGrid[j - 1][topI] != 0 && transGrid[j + 1][topI] != 0) columnCount++;
                        }
                    }
                    // If a column exists that's too tall, add a vertical I piece in that location
                    if (columnCount > 3) {
                        // Update the grid
                        topI--;
                        for (var b=0; b<4; b++) transGrid[j][topI - b] = 2;

                        // Add it to the list of pieces
                        transitionPieces.push(new TransitionPiece([[j, topI - 1], [j, topI], [j, topI - 2], [j, topI - 3]], 1, 3));
                    }
                }
                break;
            }
        }

        currentIteration++;

        // Check to see if we have finished filling the grid
        var canContinue = false;
        // Loop through all the columns of the top-most row.
        // If all the cells are filled, we are finished, so we can break out of the loop
        for (var j = 0; j < transCols - transExtra; j++) {
            if (transGrid[j][transExtra] == 0) {
                canContinue = true;
                break;
            }
        }
        if (!canContinue) break;
    }
}

// Similar function to outOfBounds(), but for the transition grid
function goesOut(tetromino) {
    // Loop through all the tetromino's blocks
    for (let i = 0; i < 4; i++) {
        // If the current block is too far left, too far right, or too far down, it is outside of the grid, so return true
        if (
            tetromino[i][0] < 0 ||
            tetromino[i][0] > transCols - 1 ||
            tetromino[i][1] > transRows - 1
        ) return true;
    }

    // At this point, none of the boxes lay outside the grid, so return false
    return false;
}

// Similar function to landsOnStack(), but for the transition grid
function lands(tetromino) {
    // Loop through all the tetromino's blocks
    for (let i = 0; i < 4; i++) {
        // If the grid at the current box's location is filled, that means the block is overlapping with the stack, so return true
        if (transGrid[tetromino[i][0]][tetromino[i][1]] > 0) return true;
    }

    // At this point, none of the boxes overlap with the stack, so return false
    return false;
}

// Function that will display and update the transition animation
function showTransition() {
    // If we aren't currently transitioning, then leave the loop
    if (!isTransitioning) return;
    
    // Keep showing more and more pieces
    currentTransitionPiece++;

    // If we have shown all the pieces, start shrinking the pieces
    if (currentTransitionPiece > transitionPieces.length + 30) {
        // Change to the scene that we wanted to transition to
        if (!isShrinking) {
            isShrinking = true;
            gameState = destinationScene;
        }
        // End of the animation
        else isTransitioning = false;

        currentTransitionPiece = 0;
    }

    // Loop through all the pieces in the list and update and display them
    for (var i = 0; i < transitionPieces.length; i++) {
        if (i < currentTransitionPiece) transitionPieces[i].update();
        transitionPieces[i].display();
    }
}

// This class stores each piece we will be using in the transition animation
class TransitionPiece {
    constructor(boxes, type, rotation) {
        // Stores the x-y coordinates of the center block of the current piece
        this.center = { 
            x: (boxes[0][0]+0.5) * transScl, 
            y: (boxes[0][1] - transExtra+0.5) * transScl };

        this.type = type;
        this.rotation = rotation;
        this.size = 0;
    }

    display() {
        // Fill it with the correct color
        colorFromType(this.type + 1);

        // Black outline
        stroke(0);
        strokeWeight(3);

        push();
        translate(this.center.x, this.center.y);
        // Scale the shape by a factor between 0 and 1
        scale(this.size / transScl);
        // Rotate the piece to the correct orientation
        for (var i = 0; i < this.rotation && this.type != 0; i++) rotate(-HALF_PI);
        // Draw the shape based on the type
        beginShape();
        switch (this.type) {
            case 0: // O piece
                vertex(-transScl * 0.5, -transScl * 0.5);
                vertex(transScl * 1.5, -transScl * 0.5);
                vertex(transScl * 1.5, transScl * 1.5);
                vertex(-transScl * 0.5, transScl * 1.5);
                break;
            case 1: // I piece
                vertex(-transScl * 2.5, -transScl * 0.5);
                vertex(transScl * 1.5, -transScl * 0.5);
                vertex(transScl * 1.5, transScl * 0.5);
                vertex(-transScl * 2.5, transScl * 0.5);
                break;
            case 2: // T piece
                vertex(-transScl * 1.5, -transScl * 0.5);
                vertex(transScl * 1.5, -transScl * 0.5);
                vertex(transScl * 1.5, transScl * 0.5);
                vertex(transScl * 0.5, transScl * 0.5);
                vertex(transScl * 0.5, transScl * 1.5);
                vertex(-transScl * 0.5, transScl * 1.5);
                vertex(-transScl * 0.5, transScl * 0.5);
                vertex(-transScl * 1.5, transScl * 0.5);
                break;
            case 3: // S piece
                vertex(-transScl * 0.5, -transScl * 0.5);
                vertex(transScl * 1.5, -transScl * 0.5);
                vertex(transScl * 1.5, transScl * 0.5);
                vertex(transScl * 0.5, transScl * 0.5);
                vertex(transScl * 0.5, transScl * 1.5);
                vertex(-transScl * 1.5, transScl * 1.5);
                vertex(-transScl * 1.5, transScl * 0.5);
                vertex(-transScl * 0.5, transScl * 0.5);
                break;
            case 4: // Z piece
                vertex(transScl * 0.5, -transScl * 0.5);
                vertex(-transScl * 1.5, -transScl * 0.5);
                vertex(-transScl * 1.5, transScl * 0.5);
                vertex(-transScl * 0.5, transScl * 0.5);
                vertex(-transScl * 0.5, transScl * 1.5);
                vertex(transScl * 1.5, transScl * 1.5);
                vertex(transScl * 1.5, transScl * 0.5);
                vertex(transScl * 0.5, transScl * 0.5);
                break;
            case 5: // L piece
                vertex(-transScl * 1.5, -transScl * 0.5);
                vertex(transScl * 1.5, -transScl * 0.5);
                vertex(transScl * 1.5, transScl * 0.5);
                vertex(-transScl * 0.5, transScl * 0.5);
                vertex(-transScl * 0.5, transScl * 1.5);
                vertex(-transScl * 1.5, transScl * 1.5);
                break;
            case 6: // J piece
                vertex(transScl * 1.5, -transScl * 0.5);
                vertex(-transScl * 1.5, -transScl * 0.5);
                vertex(-transScl * 1.5, transScl * 0.5);
                vertex(transScl * 0.5, transScl * 0.5);
                vertex(transScl * 0.5, transScl * 1.5);
                vertex(transScl * 1.5, transScl * 1.5);
                break;
        }
        endShape(CLOSE);
        pop();
    }

    update() {
        // Choose whether the target size should be the normal size or 0
        var target = transScl;
        if (isShrinking) target = 0;

        // Interpolate the current size to the target size
        this.size = lerp(this.size, target, 0.2);
    }
}