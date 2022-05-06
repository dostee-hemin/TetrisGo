/*  This code file is split into the following sub-sections:
  Variables               (all the variables used for the sound system)
  Load Data               (load all the necessary data)
*/


/*-------------------- Variables -------------------*/

// These are the sounds of the game that will be played...
let songs = [];                     // The list of the songs that can be played and their info
let goSound;                        // When the countdown reaches "GO"
let countdownSound;                 // When the countdown decrements
let correctSound;                   // When the player makes the correct pose
let wrongSound;                     // When the player runs out of posing time
let lineclearSound;                 // When 1-3 lines are cleared
let tetrisSound;                    // When 4 lines are cleared
let gameoverSound;                  // When the player tops out

let poseImages = [];










/*-------------------- Load Data -------------------*/
// Loads all the necessary files into the prgram

// This function will be run before the setup() of the program to load all the song files into the program
function preload() {
    // I will be accessing the HTML audio elements and controlling their behavior via script rather than use p5.sound
    themeSong = document.getElementById("themeSong");
    goSound = document.getElementById("go");
    countdownSound = document.getElementById("countdown");
    correctSound = document.getElementById("correct");
    wrongSound = document.getElementById("wrong");
    lineclearSound = document.getElementById("lineclear");
    tetrisSound = document.getElementById("tetris");
    gameoverSound = document.getElementById("gameover");

    poseImages[0] = loadImage("assets/Images/O.jpg");
    poseImages[1] = loadImage("assets/Images/I.jpg");
    poseImages[2] = loadImage("assets/Images/T.jpg");
    poseImages[3] = loadImage("assets/Images/S.jpg");
    poseImages[4] = loadImage("assets/Images/Z.jpg");
    poseImages[5] = loadImage("assets/Images/L.jpg");
    poseImages[6] = loadImage("assets/Images/J.jpg");
}

function setupHighScore() {
  highScore = int(highscoreTxt[0]);
  highScoreLineCount = int(highscoreTxt[1]);
}

// Loads the songs and their information
function loadSongsInfo() {
    // Here is where you add new songs to the list.
    // Every element needs the name of the song and the difficulty
    songs[0] = {name: "Tetris Theme", difficulty:2};
    songs[1] = {name: "Beggin'", difficulty:1};
    songs[2] = {name: "Ah Yani", difficulty:0};
  
    // Loop through all songs and load their music and cover images
    for(var i=0; i<songs.length; i++) {
      songs[i] = {
        music: loadSound('assets/Songs/' + songs[i].name + ' Song.mp3'),
        cover: loadImage('assets/Cover Images/'+songs[i].name+' Cover.png'),
        name: songs[i].name,
        difficulty: songs[i].difficulty};
      songs[i].music.onended(winTheGame);
    }
  
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
}
  
// Function to be called once the text file that contains the mapped pieces is laoded
function setupMappedPieces() {
    // Load the mapped pieces text file and store the time and pose of each effect
    for(let i=0; i<mappedPiecesTxt.length; i++) {
        let elements = split(mappedPiecesTxt[i], " ");
        mappedPieces[i] = {time: float(elements[0]), type: int(elements[1])};
    }
}