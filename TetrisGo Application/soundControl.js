/*  This code file is split into the following sub-sections:
  Variables               (all the variables used for the sound system)
  Preload                 (loads all the sound files into the program)
  Sound Control           (controls the playback of sounds)
*/



/*-------------------- Variables -------------------*/

// These are the sounds of the game that will be played...
let themeSong;                      // In the background
let goSound;                        // When the countdown reaches "GO"
let countdownSound;                 // When the countdown decrements
let correctSound;                   // When the player makes the correct pose
let wrongSound;                     // When the player runs out of posing time
let lineclearSound;                 // When 1-3 lines are cleared
let tetrisSound;                    // When 4 lines are cleared
let gameoverSound;                  // When the player tops out






/*-------------------- Preload -------------------*/
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
}






/*-------------------- Sound Control -------------------*/

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