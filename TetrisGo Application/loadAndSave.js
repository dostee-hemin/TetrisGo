/*  This code file is split into the following sub-sections:
  Variables               (all the variables used for the sound system)
  Load Data               (load all the necessary data)
*/


/*-------------------- Variables -------------------*/

// These are the sounds of the game that will be played...
let songs = [];                     // The list of the songs that can be played and their info
let countdownSound;                 // When the countdown decrements
let correctSound;                   // When the player makes the correct pose
let wrongSound;                     // When the player runs out of posing time
let lineclearSound;                 // When 1-3 lines are cleared
let tetrisSound;                    // When 4 lines are cleared
let gameoverSound;                  // When the player tops out
let fireworkSound;                  // When a firework explodes
let winSound;                       // When the player reaches the Level Completed scene

let poseImages = [];                // Contains the images used in the tutorial to show how to pose
let logoImage;                      // Contains the image of the game logo
let gameOverImage;                  // Contains the image for the game over title
let countdownImages = [];           // Contains the images for the 3, 2, 1, GO!
let statsImages = [];               // Contains the title of the statistics that we display during the game









/*-------------------- Load Data -------------------*/
// Loads all the necessary files into the prgram

// This function will be run before the setup() of the program to load all the song files into the program
function preload() {
    // I will be accessing the HTML audio elements and controlling their behavior via script rather than use p5.sound
    themeSong = document.getElementById("themeSong");
    countdownSound = document.getElementById("countdown");
    correctSound = document.getElementById("correct");
    wrongSound = document.getElementById("wrong");
    lineclearSound = document.getElementById("lineclear");
    tetrisSound = document.getElementById("tetris");
    gameoverSound = document.getElementById("gameover");
    fireworkSound = loadSound("assets/Sounds/firework.mp3");
    fireworkSound.playMode("sustain");
    winSound = loadSound("assets/Sounds/win.mp3");
    
    poseImages.push(loadImage("assets/Images/O.png"));
    poseImages.push(loadImage("assets/Images/I.png"));
    poseImages.push(loadImage("assets/Images/T.png"));
    poseImages.push(loadImage("assets/Images/S.png"));
    poseImages.push(loadImage("assets/Images/Z.png"));
    poseImages.push(loadImage("assets/Images/L.png"));
    poseImages.push(loadImage("assets/Images/J.png"));

    logoImage = loadImage("assets/Images/Logo.png");
    gameOverImage = loadImage("assets/Images/gameover.png");

    countdownImages.push(loadImage("assets/Images/3.png"));
    countdownImages.push(loadImage("assets/Images/2.png"));
    countdownImages.push(loadImage("assets/Images/1.png"));
    countdownImages.push(loadImage("assets/Images/GO!.png"));

    statsImages.push(loadImage("assets/Images/score.png"));
    statsImages.push(loadImage("assets/Images/lines.png"));
    statsImages.push(loadImage("assets/Images/prediction.png"));
}

function setupHighScore() {
  highScore = int(highscoreTxt[0]);
  highScoreLineCount = int(highscoreTxt[1]);
}

// Loads the songs and their information
function loadSongsInfo() {
    // Here is where you add new songs to the list.
    // Every element needs the name of the song and the difficulty
    songs.push(new Card("Tetris Theme", 2));
    songs.push(new Card("Beggin'", 1));
    songs.push(new Card("Ah Yani", 0));
    songs.push(new Card("Dance Monkey", 0));
    songs.push(new Card("Kurda", 1));
    songs.push(new Card("Khappa Gyan Bukhom", 0));
    songs.push(new Card("Gangnam Style", 1));

    // Bubble sort the songs based on difficulty in ascending order
    for(var i=0; i<songs.length-1; i++) {
      for(var j=0; j<songs.length-1-i; j++) {
        if(songs[j].difficulty > songs[j+1].difficulty) {
          var temp = songs[j];
          songs[j] = songs[j+1];
          songs[j+1] = temp;
        }
      }
    }
  
    // Loop through all songs and load their music and cover images
    for(var i=0; i<songs.length; i++) {
      songs[i].setAssets(
        loadSound('assets/Songs/' + songs[i].name + ' Song.mp3'),
        loadImage('assets/Cover Images/'+songs[i].name+' Cover.png'));
    }
}
  
// Function to be called once the text file that contains the mapped pieces is laoded
function setupMappedPieces() {
    // Load the mapped pieces text file and store the time and pose of each effect
    for(let i=0; i<mappedPiecesTxt.length; i++) {
        let elements = split(mappedPiecesTxt[i], " ");
        mappedPieces[i] = {time: float(elements[0]), type: int(elements[1])};
    }
}