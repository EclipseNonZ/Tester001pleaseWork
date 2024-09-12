// Default, Player
let board;
let boardWidth = 1200;
let boardHeight = 300;
let context;
let playerWidth = 85;
let playerHeight = 150;
let playerX = 50;
let playerY = 150;
let playerImg;
let player = {
    x: playerX,
    y: playerY,
    width: playerWidth,
    height: playerHeight
};
let playerParry = false;
let gameOver = false;
let score = 0;
let time = 0;
let life = 3;

// Object

let touched = false;

// Setting Object
let boxesArray = [];
let boxSpeed = -8; //TODO

// Gravity, Velocity
let VelocityY = 0;
let Gravity = 0.25;


//RetryButton
let Retry = document.getElementById("RetryDisplay");
let canParry = true;  // Flag to control parry availability
let parryCooldown = 3000;  // 1 second cooldown for parry
let parryCooldownDisplay = 0;


let lifeIMG = new Image();
lifeIMG.src = "life.png";
let lifeWidth = 40;
let lifeHeight = 40;
//Animation

//TODO
let playerFrame = [
    "Walk2.png",
    "Walk1.png"
]
let playeGameOverFrame = "GameOverAnimation.png" //TODO          
let playerJumpFrame = "Jump.png";
let playerParryFrame = "Parry.png";
//TODO

let playerFrameIndex = 0;
let playerFrameCount = playerFrame.length;  // Assuming the sprite has 5 frames
let playerFrameWidth = 85; // Width of each frame in the spritesheet
let frameDelay = 5;  // Number of updates before switching frame
let frameCounter = 0;

//Cloud
let cloudImg = new Image();
cloudImg.src = "cloud.png";
let cloudWidth = 160;
let cloudHeight = 160;
let cloudX = 1300;
let cloudY = 10;
let cloudArray = [];
let cloudSpeed = -8

//Box

// Load box images
let box1Img = new Image();

let box2Img = new Image();

let box3Img = new Image()
box1Img.src = "Object1.png";
box2Img.src = "Object2.png";
box3Img.src = "Object3.png";

console.log(player);
window.onload = function () {
    // Display
    board = document.getElementById("Board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Player
    playerImg = new Image();
    playerImg.src = playerFrame[playerFrameIndex];
    playerImg.onload = function () {
        context.drawImage(playerImg, player.x, player.y, player.width, player.height);
    };

    // Request animation frame
    requestAnimationFrame(update);

    document.addEventListener("keydown", movePlayer);
  
    createCloudWithRandomInterval();
    createBoxWithRandomInterval();
};

// Function to create a box at a random time interval
function createBoxWithRandomInterval() {

    if (gameOver) {
        return;
    }

    createBox(); // Create a box
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Generate a random time between 1 and 3 seconds (1000 to 3000 milliseconds)
    let randomTime = rnd(1000, 2500);

    // Use setTimeout instead of setInterval to create boxes at random times
    setTimeout(createBoxWithRandomInterval, randomTime);
}

function rnd(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

// Update Function
function update() {
    requestAnimationFrame(update); // Always update animation

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);
    VelocityY += Gravity;
    if(playerParry){
        playerImg.src = playerParryFrame;
    }else{
        if(player.y < playerY){
            playerImg.src = playerJumpFrame;
        }
    
        else{
            updatePlayerFrame();
            playerImg.src = playerFrame[playerFrameIndex];
        }
    }
    for (let index = 0; index < cloudArray.length; index++) {
        
        let cloud = cloudArray[index];
        cloud.x += cloudSpeed;
        context.drawImage(cloud.img, cloud.x, cloud.y, cloud.width, cloud.height);
    }
    
    
    player.y = Math.min(player.y + VelocityY, playerY);
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);

    for (let index = 0; index < boxesArray.length; index++) {
        let box = boxesArray[index];
        box.x += box.Speed;
        context.drawImage(box.img, box.x, box.y, box.width, box.height);
        
        if (onCollision(player, box)) {
            gameOver = true;
            life -= 1;
            

            playerImg.src = playeGameOverFrame;
            context.drawImage(playerImg, player.x, player.y, player.width, player.height);
            context.font = "normal bold 40px Arial";
            context.textAlign = "center";
            context.fillStyle = "red";
            context.fillText("GameOver!", boardWidth / 2, boardHeight / 2);

            context.font = "normal bold 20px Monospace";
            context.fillText("Your Score : "+score,boardWidth/2 ,(boardHeight/2)+20);


            setTimeout(() => {
                Retry.style.display = "block";
            }, 500);
        }
    }

    
    context.fillStyle = "black";
    score++;
    time += 0.01;
    context.font = "normal bold 20px Monospace";
    context.textAlign = "left";
    context.fillText("Score : " + score, 10, 20);
    context.fillText("Time : " + time.toFixed(0), 10, 40);
    for (let i = 0; i < life; i++) {
        // Adjust the X position of each heart based on its index
        context.drawImage(lifeIMG, 20 + (lifeWidth + 10) * i, 80, lifeWidth, lifeHeight);
    }

    if(parryCooldownDisplay > 0){
        context.fillText("Parry Cooldown:"+parryCooldownDisplay.toFixed(0)/1000 , 10 , 60)
        parryCooldownDisplay -= 10;
    }else{
        context.fillText("Parry Cooldown:Ready!" , 10 , 60)
    }
    if (time == 60) {
        gameOver = true;
        context.font = "normal bold 20px Monospace";
        context.textAlign = "center";
        context.fillText("You Won! With Score :" + score, boardWidth / 2, boardHeight / 2);
        
        setTimeout(() => {
            Retry.style.display = "block";
        }, 500);
    }
}

function movePlayer(e) {

    if (e.code == "Space" && gameOver &&life > 0) {
        Retry.innerHTML = "Wait..."
        setTimeout(() => {
            gameReset()
            Retry.innerHTML = "Press Space To Try Again"
        }, 1000);
    }

    if (gameOver) {
        return;
    }

    if (e.code === "Space" && player.y === playerY && !gameOver) {
        VelocityY = -9;
    }

    if (e.code === "KeyF"){
        if(player.y == playerY){
            parry()
        }
    }
}

function createBox(e) {
    if (gameOver) {
        return;
    }
    let randomType = rnd(1, 3); // Randomly choose between 1 and 2
    let boxImg,boxWidth, boxHeight, boxSpeed , boxY ,boxX = 1300;

    if (randomType === 1) {
        boxImg = box1Img;
        boxWidth = 80;
        boxHeight = 80;
        boxSpeed = -5; // Default speed
        boxY = 215;
    } else if (randomType === 2) {
        boxImg = box2Img;
        boxWidth = 80; // Different size for box2
        boxHeight = 80;
        boxSpeed = -5; // Faster speed for box2
        boxY = 215;
    } else {
        boxImg = box3Img;
        boxWidth = 80; // Different size for box2
        boxHeight = 150;
        boxSpeed = -5; // Faster speed for box2
        boxY = 175;
    }


    let box = {
        img: boxImg,
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight,
        Speed: boxSpeed
    };

    boxesArray.push(box);

    if (boxesArray.length > 5) {
        boxesArray.shift();
    }
}

function onCollision(obj1, obj2) {
    return obj1.x+20 < (obj2.x + obj2.width) && (obj1.x-20 + obj1.width) > obj2.x // Crash in X move
        && obj1.y < (obj2.y + obj2.height) && (obj1.y + obj1.height) > obj2.y; // Crash in Y move
}

function parry(){
    if (!canParry) return;  // If parry is on cooldown, do nothing

    playerParry = true;  // Show parry animation
    canParry = false;  // Set parry to unavailable
    parryCooldownDisplay = parryCooldown;

    // Handle parry logic
    for (let i = 0; i < boxesArray.length; i++) {
        let box = boxesArray[i];
        if(parryAble(player, box)){
            boxesArray.splice(i, 1);  // Remove box if parried
        }
    }

    setTimeout(() => {
        playerParry = false
    }, 250);

    // Start cooldown timer
    setTimeout(() => {
        canParry = true;  // Reset parry cooldown after 1 second
    }, parryCooldown);
}




function parryAble(obj1,obj2){
    return obj1.x-100 < (obj2.x + obj2.width) && (obj1.x+50 + obj1.width) > obj2.x // Crash in X move
        && obj1.y < (obj2.y + obj2.height) && (obj1.y + obj1.height) > obj2.y; // Crash in Y move

}

function gameReset() {
    if (!gameOver) {
        return;
    }

    if (life > 0) {
        gameOver = false;
        Retry.style.display = "none"; // Hide the Retry button
        
        parryCooldownDisplay = 0
        canParry = true;
        score = 0;
        time = 0;
        boxesArray = [];
        VelocityY = 0; // Reset gravity effect
        player.y = playerY; // Reset player position

        createBoxWithRandomInterval(); // Restart creating boxes
    }
}

function updatePlayerFrame() {
    frameCounter++;
    if (frameCounter >= frameDelay) {
        frameCounter = 0;
        playerFrameIndex++;
        if (playerFrameIndex >= playerFrameCount) {
            playerFrameIndex = 0;  // Loop back to the first frame
        }
    }
    return playerFrameIndex;
}

function createCloudWithRandomInterval() {

    if (gameOver) {
        return;
    }

    createCloud(); // Create a box

    // Generate a random time between 1 and 3 seconds (1000 to 3000 milliseconds)
    let randomTime = rnd(1000, 2500);

    // Use setTimeout instead of setInterval to create boxes at random times
    setTimeout(createCloudWithRandomInterval, randomTime);
}


function createCloud(e) {
    if (gameOver) {
        return;
    }

    let cloud = {
        img: cloudImg,
        x: cloudX,
        y: cloudY,
        width: cloudWidth,
        height: cloudHeight
    };

    cloudArray.push(cloud);

    if (cloudArray.length > 5) {
        cloudArray.shift();
    }
}