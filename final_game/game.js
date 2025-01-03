import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  query,
  getDocs,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
var Finalscore;
var serverHighestscore;
var ThisisHighest;
var highScore;
const firebaseConfig = {
  apiKey: "AIzaSyA3nKMFkMmTKfcGiHDnT5QTAnBwRFbDNpM",
  authDomain: "fruit-ninja-b29b2.firebaseapp.com",
  projectId: "fruit-ninja-b29b2",
  storageBucket: "fruit-ninja-b29b2.firebasestorage.app",
  messagingSenderId: "536332668503",
  appId: "1:536332668503:web:b2478321443955798c9d12",
  measurementId: "G-P2N0LHL122",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in");
  } else {
    window.location.href = "start.html";
  }
});

function saveuserScore(Scoreholder) {
  const user = auth.currentUser;
  if (user) {
    let username = user.displayName;
    const scoreDocRef = doc(collection(db, "users/" + username + "/scores"));

    try {
      setDoc(scoreDocRef, {
        score: Scoreholder,
      });
      console.log("Score saved successfully");
    } catch (error) {
      console.error("Error saving score ", error);
    }
  } else {
    console.log("User not signed in");
  }
}

async function getHighestScore() {
  const user = auth.currentUser;
  if (user) {
    let username = user.displayName;
    const scoreRef = collection(db, "users/" + username + "/scores");
    const q = query(scoreRef, orderBy("score", "desc"), limit(1));

    try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const g = querySnapshot.docs[0].data().score;

        ThisisHighest = g;

        return g;
      } else {
        console.log("No scores found");
        return null;
      }
    } catch (error) {
      console.error("error fetching scores ", error);
      return null;
    }
  } else {
    console.log("User not signed in");
    return null;
  }
}
console.log("ServerHIGH: " + serverHighestscore);
const serverScore = getHighestScore();
if (serverScore != null) {
  if (serverScore > Finalscore) {
    serverHighestscore = serverScore;
  } else {
    serverHighestscore = Finalscore;
  }
}
if (serverHighestscore === undefined) {
  serverHighestscore = 0;
}

const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("scoreDisplay");
const livesContainer = document.getElementById("livesContainer");
const lifeIcons = livesContainer.querySelectorAll(".life");
const gameOverText = document.getElementById("gameOver");
const retryButton = document.getElementById("retryButton");
const highScoreDisplay = document.getElementById("highScoreDisplay");
const backButton = document.getElementById("backButton");
const slicingSound = new Audio("splatter.mp3");
const BoomSound = new Audio("boom.mp3");
let isSpecialActive = false;
const bonusMusic = new Audio("bonusbgsong.mp3");
const bonusStart = new Audio("bonus.mp3");
bonusStart.playbackRate = 0.8;
BoomSound.volume = 0.2;
BoomSound.playbackRate = 1.5;
bonusMusic.volume = 0.4;
bonusStart.volume = 0.4;
const audioEffects = [
  "audio1.mp3",
  "audio2.mp3",
  "audio3.mp3",
  "audio4.mp3",
  "audio5.mp3",
];

function playAudioOnFruitSlice() {
  const audio = new Audio("splatter.mp3");

  audio.volume = 0.07;

  audio.play();
}

function onFruitSliced() {
  playAudioOnFruitSlice();
}

let audioCounter = 0;

function playAudioOnSlice() {
  const audio = new Audio(audioEffects[audioCounter]);

  audio.volume = 0.02;

  audio.play();

  audioCounter++;

  if (audioCounter >= audioEffects.length) {
    audioCounter = 0;
  }
}

function onSpecialFruitSliced() {
  playAudioOnSlice();
}

//wowwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
document.addEventListener("DOMContentLoaded", () => {
  gameArea.classList.add("yocursor");
  const trail = document.getElementById("trail");

  let isMousePressed = false;

  function createTrail(event) {
    if (isMousePressed) {
      const x = event.clientX;
      const y = event.clientY;

      const trailClone = trail.cloneNode();
      document.body.appendChild(trailClone);

      trailClone.style.left = `${x}px`;
      trailClone.style.top = `${y}px`;

      setTimeout(() => {
        trailClone.remove();
      }, 600);
    }
  }


  document.addEventListener("mousedown", () => {
    isMousePressed = true;
  });

  document.addEventListener("mouseup", () => {
    isMousePressed = false;
  });


  document.addEventListener("mousemove", createTrail);
});

document.addEventListener("DOMContentLoaded", () => {
  let score = 0;
  let lives = 5;
  let gameActive = true;
  let fruitCount = 0;
  let activeFruits = new Set();
  let fruitInterval;
  let animationId;
  var gamePause = false;
  const maxFruits = 5;
  const fruits = ["apple.png", "banana.png", "sandia.png"];
  const bomb = "bomb.png";
  var isGameover = false;
  // const splfruits='special_fruit.png';

  window.missFruit = function (fruit) {
    if (gameActive && activeFruits.has(fruit)) {
      activeFruits.delete(fruit);

      if (lives > 0 && !fruit.style.backgroundImage.includes("bomb.png")) {
        lives--;
        lifeIcons[lives].src = "red_cross.png";
        console.log(`Lives remaining: ${lives}`);
        if (lives === 0) {
          endGame();
        }
      }
    }
  };

  function increaseScore() {
    if (isSpecialActive) {
      score += 5;
    } else {
      score += 1;
    }
    scoreDisplay.textContent = `Score: ${score}`;
    if ((score === 100 || score % 300 === 0) && !isSpecialActive && score > 0 && gameActive) {
      displayBonusText();
    }
  }
  //Bonus Text

  function displayBonusText() {
    gamePause = true;
    
    const bonusTextElement = document.getElementById("bonusText");
    console.log(isGameover)
    clearAllElements();
    
      setTimeout(() => {
        
        bonusTextElement.style.display = "block";
        bonusStart.play();
        clearAllElements();
        console.log(isGameover)
        gameArea.classList.remove("yocursor");
        gameArea.classList.add("special-cursor");

        setTimeout(() => {
          bonusTextElement.style.display = "none";
          activateSpecialMode();
        }, 3000);
      }, 2000);
    
    
  }

  function clearAllElements() {
    document.querySelectorAll('.fruit, .splfruit, .bomb').forEach(element => element.remove());
    activeFruits.forEach((fruit) => {activeFruits.delete(fruit);});
}











  //specialllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll
  function createsplfruit() {
    if (!gameActive) return;

    const splfruit = document.createElement("div");
    splfruit.classList.add("splfruit");
    const spawnProb = Math.random() < 0.05;

    if (spawnProb) {
      splfruit.style.backgroundImage = 'url("special_fruit.png")';
      splfruit.style.width = "60px";
      splfruit.style.height = "60px";
      splfruit.style.zIndex = 4;
      const startX =
        Math.random() * (gameArea.clientWidth - parseInt(splfruit.style.width));
      const endX =
        Math.random() * (gameArea.clientWidth - parseInt(splfruit.style.width));

      const duration = 1.3;
      const peakHeight = gameArea.clientHeight * (0.5 + Math.random() * 0.25);

      splfruit.style.left = startX + "px";
      splfruit.style.bottom = "-100px";
      splfruit.style.zIndex = 4;
      gameArea.appendChild(splfruit);

      let startTime = null;

      function animateFruit(timestamp) {
        if (!gameActive) return;
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);

        if (progress < 1) {
          const currentX = startX + (endX - startX) * progress;
          const currentY = peakHeight * (1 - 4 * (progress - 0.5) ** 2) - 100;

          splfruit.style.left = currentX + "px";
          splfruit.style.bottom = currentY + "px";

          animationId = requestAnimationFrame(animateFruit);
        }
      }

      animationId = requestAnimationFrame(animateFruit);

      let mouseDown = false;

      gameArea.addEventListener("mousedown", () => {
        mouseDown = true;
      });

      gameArea.addEventListener("mouseup", () => {
        mouseDown = false;
      });

      gameArea.addEventListener("mousemove", (event) => {
        if (gameActive && mouseDown && !isGameover) {
          const mouseX = event.clientX;
          const mouseY = event.clientY;

          const splfruitRect = splfruit.getBoundingClientRect();
          const splfruitCenterX = splfruitRect.left + splfruitRect.width / 2;
          const splfruitCenterY = splfruitRect.top + splfruitRect.height / 2;
          const radius = Math.max(splfruitRect.width, splfruitRect.height) / 2;

          const distance = Math.sqrt(
            (mouseX - splfruitCenterX) ** 2 + (mouseY - splfruitCenterY) ** 2
          );

          if (distance < radius) {
            onSpecialFruitSliced();
            increaseScore();
          }
        }
      });
    }
  }

  function createFruit() {
    if (!gameActive || fruitCount >= maxFruits) return;

    const fruit = document.createElement("div");
    fruit.classList.add("fruit");
    fruit.style.zIndex = 4;
    const isBomb = Math.random() < 0.2;
    const randomFruit = isBomb
      ? bomb
      : fruits[Math.floor(Math.random() * fruits.length)];

    fruit.style.backgroundImage = `url(${randomFruit})`;

    if (randomFruit === "sandia.png") {
      fruit.style.width = "70px";
      fruit.style.height = "70px";
      fruit.style.zIndex = 4;
    } else if (randomFruit === "bomb.png") {
      fruit.style.width = "50px";
      fruit.style.height = "50px";
      fruit.style.zIndex = 4;
    } else if (randomFruit === "apple.png") {
      fruit.style.width = "55px";
      fruit.style.height = "55px";
      fruit.style.zIndex = 4;
    } else {
      fruit.style.width = "45px";
      fruit.style.height = "45px";
      fruit.style.zIndex = 4;
    }

    const startX =
      Math.random() * (gameArea.clientWidth - parseInt(fruit.style.width));
    const endX =
      Math.random() * (gameArea.clientWidth - parseInt(fruit.style.width));
    const baseDuration = 3;
    const speedIncrease = Math.min(score * 0.05, 1.5);
    const duration = Math.max(1.5, baseDuration - speedIncrease);
    const peakHeight = gameArea.clientHeight * (0.5 + Math.random() * 0.25);

    fruit.style.left = startX + "px";
    fruit.style.bottom = "-100px";
    fruit.style.zIndex = 4;
    gameArea.appendChild(fruit);
    fruitCount++;
    activeFruits.add(fruit);

    let startTime = null;

    function animateFruit(timestamp) {
      if (!gameActive) return;
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        const currentX = startX + (endX - startX) * progress;
        const currentY = peakHeight * (1 - 4 * (progress - 0.5) ** 2) - 100;

        fruit.style.left = currentX + "px";
        fruit.style.bottom = currentY + "px";

        animationId = requestAnimationFrame(animateFruit);
      } else {
        fruit.remove();
        fruitCount--;
        missFruit(fruit);
      }
    }

    animationId = requestAnimationFrame(animateFruit);

    let mouseDown = false;

    gameArea.addEventListener("mousedown", () => {
      mouseDown = true;
    });

    gameArea.addEventListener("mouseup", () => {
      mouseDown = false;
    });

    gameArea.addEventListener("mousemove", (event) => {
      if (gameActive && mouseDown && !isGameover) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        activeFruits.forEach((fruit) => {
          const fruitRect = fruit.getBoundingClientRect();
          const fruitCenterX = fruitRect.left + fruitRect.width / 2;
          const fruitCenterY = fruitRect.top + fruitRect.height / 2;
          const radius = Math.max(fruitRect.width, fruitRect.height) / 2;

          const distance = Math.sqrt(
            (mouseX - fruitCenterX) ** 2 + (mouseY - fruitCenterY) ** 2
          );

          if (distance < radius) {
            sliceFruit(fruit);
          }
        });
      }
    });

    function sliceFruit(fruit) {
      if (activeFruits.has(fruit)) {
        activeFruits.delete(fruit);

        const isBomb = fruit.style.backgroundImage.includes("bomb.png");
        const fruitRect = fruit.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();

        const offsetX = fruitRect.left - gameAreaRect.left;
        const offsetY = fruitRect.top - gameAreaRect.top;

        const fruitRotation = getComputedStyle(fruit).transform;

        if (isBomb) {
          bonusMusic.pause();
          bonusMusic.currentTime = 0;
          bonusStart.pause();
          bonusStart.currentTime = 0;
          BoomSound.play();
          const frozenBomb = document.createElement("div");
          const computedStyle = getComputedStyle(fruit);
          frozenBomb.id = "frozenBomb";
          frozenBomb.style.left = computedStyle.left;
          frozenBomb.style.bottom = computedStyle.bottom;
          frozenBomb.style.width = computedStyle.width;
          frozenBomb.style.height = computedStyle.height;
          frozenBomb.style.position = "absolute";
          frozenBomb.style.transform = fruitRotation;
          frozenBomb.style.backgroundImage = fruit.style.backgroundImage;
          frozenBomb.style.backgroundSize = "contain";
          frozenBomb.style.backgroundRepeat = "no-repeat";

          gameArea.appendChild(frozenBomb);
          fruit.remove();

          increaseBrightnessAndEndGame();
        } else {
          onFruitSliced();
          const fruitType = fruit.style.backgroundImage
            .match(/url\(['"]?(.*?)\.[a-zA-Z0-9]+['"]?\)/)[1]
            .split(".")[0];

          const fruitPart1 = document.createElement("div");
          fruitPart1.style.zIndex = 3;
          fruitPart1.classList.add("fruitPart");
          fruitPart1.style.backgroundImage = `url(${fruitType}-1.png)`;
          fruitPart1.style.left = `${offsetX}px`;
          fruitPart1.style.top = `${offsetY}px`;
          fruitPart1.style.width = fruit.style.width;
          fruitPart1.style.height = fruit.style.height;
          fruitPart1.style.position = "absolute";
          fruitPart1.style.backgroundSize = "contain";
          fruitPart1.style.backgroundRepeat = "no-repeat";
          fruitPart1.style.transform = fruitRotation;

          const fruitPart2 = document.createElement("div");
          fruitPart2.style.zIndex = 3;
          fruitPart2.classList.add("fruitPart");
          fruitPart2.style.backgroundImage = `url(${fruitType}-2.png)`;
          fruitPart2.style.left = `${offsetX}px`;
          fruitPart2.style.top = `${offsetY}px`;
          fruitPart2.style.width = fruit.style.width;
          fruitPart2.style.height = fruit.style.height;
          fruitPart2.style.position = "absolute";
          fruitPart2.style.backgroundSize = "contain";
          fruitPart2.style.backgroundRepeat = "no-repeat";
          fruitPart2.style.transform = fruitRotation;

          gameArea.appendChild(fruitPart1);
          gameArea.appendChild(fruitPart2);
          fruit.remove();

          increaseScore();
          animateSlicedParts(fruitPart1, fruitPart2);
          fruitPart2.style.zIndex = 3;
          fruitPart1.style.zIndex = 3;
        }
      }
    }

    function animateSlicedParts(part1, part2) {
      const gravity = 0.2;
      let rotateSpeed1 = -2;
      let rotateSpeed2 = 2;
      const horizontalDrift = 1;

      let part1Top = parseFloat(part1.style.top);
      let part2Top = parseFloat(part2.style.top);
      let part1Left = parseFloat(part1.style.left);
      let part2Left = parseFloat(part2.style.left);
      let part1VelocityY = 0;
      let part2VelocityY = 0;

      function fall() {
        part1VelocityY += gravity;
        part2VelocityY += gravity;
        part1Top += part1VelocityY;
        part2Top += part2VelocityY;
        part1Left -= horizontalDrift;
        part2Left += horizontalDrift;

        part1.style.top = `${part1Top}px`;
        part2.style.top = `${part2Top}px`;
        part1.style.left = `${part1Left}px`;
        part2.style.left = `${part2Left}px`;
        part1.style.transform = `rotate(${rotateSpeed1}deg)`;
        part2.style.transform = `rotate(${rotateSpeed2}deg)`;

        rotateSpeed1 -= 0.5;
        rotateSpeed2 += 0.5;

        if (
          part1Top < gameArea.clientHeight &&
          part2Top < gameArea.clientHeight
        ) {
          requestAnimationFrame(fall);
        } else {
          part1.remove();
          part2.remove();
        }
      }

      requestAnimationFrame(fall);
    }
  }

  function increaseBrightnessAndEndGame() {
    gameActive = false;
    gameArea.style.transition = "filter 1.5s";
    gameArea.style.filter = "brightness(3)";
    bonusMusic.pause();
    bonusMusic.currentTime = 0;
    bonusStart.pause();
    bonusStart.currentTime = 0;

    activeFruits.forEach((fruit) => {
      const computedStyle = getComputedStyle(fruit);
      fruit.style.left = computedStyle.left;
      fruit.style.bottom = computedStyle.bottom;
      fruit.style.transform = computedStyle.transform;
      fruit.style.animation = "none";
      fruit.style.transition = "none";
      fruit.style.position = "absolute";
    });

    cancelAnimationFrame(animationId);
    const splfruits = document.getElementsByClassName("splfruit");
    Array.from(splfruits).forEach((splfruit) => {
      const computedStyle = getComputedStyle(splfruit);

      const frozensplfruit = document.createElement("div");

      frozensplfruit.className = "frozensplfruit";
      frozensplfruit.style.left = computedStyle.left;
      frozensplfruit.style.bottom = computedStyle.bottom;
      frozensplfruit.style.width = computedStyle.width;
      frozensplfruit.style.height = computedStyle.height;
      frozensplfruit.style.position = "absolute";
      frozensplfruit.style.transform = computedStyle.transform;
      frozensplfruit.style.backgroundImage = splfruit.style.backgroundImage;
      frozensplfruit.style.backgroundSize = "contain";
      frozensplfruit.style.backgroundRepeat = "no-repeat";

      gameArea.appendChild(frozensplfruit);
      splfruit.remove();
    });

    setTimeout(() => {
      gameArea.style.filter = "brightness(1)";
      endGame();
    }, 1000);
  }
  //Bonus Rounddd
  function activateSpecialMode() {
    let boomm = isGameover;
    if (!boomm){
    isSpecialActive = true;
    gamePause = false;
    bonusMusic.play();

    setTimeout(() => {
      isSpecialActive = false;
      gameArea.classList.remove("special-cursor");
      gameArea.classList.add("yocursor");
      bonusMusic.pause();
      bonusMusic.currentTime = 0;
    }, 7000); // thala for a reason
  }}

  function clearGameArea() {
    const fruits = gameArea.querySelectorAll(".fruit");
    fruits.forEach((fruit) => fruit.remove());
    fruitCount = 0;
    activeFruits.clear();

    const frozenBombElement = document.getElementById("frozenBomb");
    if (frozenBombElement) {
      frozenBombElement.remove();
    }

    const frozensplfruits = gameArea.querySelectorAll(".frozensplfruit");
    frozensplfruits.forEach((frozensplfruit) => frozensplfruit.remove());

    const splfruits = gameArea.querySelectorAll(".splfruit");
    splfruits.forEach((splfruit) => splfruit.remove());
  }

  function spawnFruits() {
    if (!gameActive) return;
    if (!gamePause) {
      const fruitElements = document.querySelectorAll(".fruit");
      fruitElements.forEach((fruit) => {
        fruit.style.zIndex = "4";
      });
      const simultaneousFruits = Math.min(maxFruits - fruitCount, 4);

      for (let i = 0; i < simultaneousFruits; i++) {
        setTimeout(createFruit, i * 500);
        setTimeout(createsplfruit, i * 500);
      }
    }
  }

  function resetGame() {
    clearGameArea();
    score = 0;
    lives = 5;
    gameActive = true;
    isGameover = false;
    fruitCount = 0;
    scoreDisplay.style.display = "block";
    livesContainer.style.display = "flex";
    scoreDisplay.textContent = `Score: ${score}`;
    lifeIcons.forEach((icon) => (icon.src = "cross.png"));
    gameOverText.style.display = "none";
    retryButton.style.display = "none";
    highScoreDisplay.style.display = "none";
    backButton.style.display = "none";
    gameArea.style.filter = "brightness(1)";

    clearInterval(fruitInterval);

    console.log("Game reset");
    setTimeout(() => {
      spawnFruits();
    }, 2000);

    fruitInterval = setInterval(() => {
      if (gameActive) {
        spawnFruits();
      }
    }, 2000);
  }

  console.log(score);

  async function endGame() {
    bonusMusic.pause();
    bonusMusic.currentTime = 0;
    bonusStart.pause();
    bonusStart.currentTime = 0;
    gameOverText.style.display = "block";
    retryButton.style.display = "block";
    highScoreDisplay.style.display = "block";
    backButton.style.display = "block";
    console.log(score);
    isGameover = true;

    await getHighestScore();

    const serverScore = ThisisHighest;

    highScore = serverScore;
    if (highScore === undefined) {
      highScore = 0;
    }

    if (score > highScore) {
      highScore = score;

      scorePrint();
      saveuserScore(Finalscore);
    } else {
      scorePrint();
    }

    clearInterval(fruitInterval);
    console.log("Game Over");
  }

  function scorePrint() {
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    Finalscore = highScore;
  }

  retryButton.addEventListener("click", resetGame);

  // retryButton.addEventListener('click', () => {
  //     window.location.href = 'index.html';
  // });

  backButton.addEventListener("click", () => {
    window.location.href = "start.html";
  });

  fruitInterval = setInterval(() => {
    if (gameActive) {
      spawnFruits();
    }
  }, 2000);
});
