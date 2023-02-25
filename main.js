//Game peices
const gameContainer = document.getElementById("boardContainer");
const gameBoard = document.getElementById("gameBoard");
const dialogeBox = document.getElementById("dialogeBox")
const dialoge = document.getElementById("dialoge")

//Buttons
//the stop button. this might be developer only, haven't decided
let stopButton = document.getElementsByClassName("stopButton")
//the rematch button. This is just to add order when the game ends
let rematchButton = document.getElementsByClassName("rematch")

//Score Stuff
//high score
let highScore = document.getElementsByClassName("highScore")
//high score is retrieved from local storage, if there is nothing there it is set at 0
let highScoreValue = localStorage.getItem("highScore") || 0
highScore[0].textContent = highScoreValue
//current score
let currentScore = document.getElementsByClassName("score")
let currentScoreValue = 0

//Moving and stopping the snake
//keeps track of if the snake is currently moving or not
let snakeMoving = false
//incharge of stoping the previous direction when a user changes direction
let moveClearIntervalID

//where the red dot is on the game board
let foodPosition

//the location of the head of the snake
let snakeLocation = 495

//all these are in charge of turning...TURNING!!
//whether or not the snake is turning directions
let changingDirection = false
//the previous direction the snake was moving before a turn
let previousDirection
//the point on the board where the snake turns
let turningPoint
//keeps track of the number of snake pieces that have turned
let changing = 0

//how fast the snake is going/ score multiplier
let speedLevel = 1
//duh
let gameOver = true

//Really only for developer purposes. Stops the snake but not the game
stopButton[0].addEventListener("click", ()=>{
    //clears the setInterval
    clearInterval(moveClearIntervalID)
    //sets moving to false
    snakeMoving=false
})
//only pops up when a player loses. allows them to restart the game
rematchButton[0].addEventListener("click", ()=>{
    //clears and hides the dialog box
    dialogeBox.style.display = "none"
    rematchButton[0].style.display = "none"
    //startes the game over
    newGame()
    gameOver = false
})


//Set up the game board by creating 30 divs that are arranged with css into six rows of five
for(let i = 0; i<900; i++){
    //900 divs are created
    const boardDiv = document.createElement("div")
    //they are all giving the same class and their index
    boardDiv.setAttribute("class", "boardSquare")
    boardDiv.setAttribute("index", i)
    //before being appendined tot he gameboard which is ofcourse a grid
    gameBoard.append(boardDiv)
}

//Lets go get all the board squares we just made!!
const boardSquares = document.getElementsByClassName("boardSquare")
//Set's up the rules for losing...
//the outter loop runs four times, one for each side of the board so it can set those as boundaries
for(let i=0;i<4;i++){
    //the inner loop runns 30 times, once for each gameboard touching a side.
    for(let x=0;x<30;x++){
        //we will need to manipulate x after i's first loop, so we will assign it to a varaiable for us to use. 
        let numVariable = x
        //0 is the top row of the board, squares 0-29 and no manipulation is necessary
        if(i===0){
            //all the squares in the top row are given an attribut of up so we know the snake can't go that way...it'll make sense I promise
            boardSquares[numVariable].setAttribute("up", true)
        //1 is the bottom row of the board, squares 870-899 
        }else if(i===1){
            //add 870 to x so we are targeting the correct squares
            numVariable = numVariable + 870
            //give them the down attribute so we know the snake can't go that way
             boardSquares[numVariable].setAttribute("down", true)
        //2 is the top right of the board, squares 29-899 counting by 30's
        }else if(i===2){
            //look..... this is the math necessary to get those squares, no I will not explain it or how I figured it out...
            numVariable= ((numVariable+1) *30)-1
            //give them the right attribute so we know the snake can't go that way
            boardSquares[numVariable].setAttribute("right", true)
        //3 is the top row of the board, squares 0-870 counting by 30's
        }else if(i===3){
            //multiply x by thirty to target the appropriate square
            numVariable= numVariable*30
            //give them the left attribute so we know the snake can't go that way
            boardSquares[numVariable].setAttribute("left", true)
        }
    }
}

//the boardsquares array can't be manipulated in alot of the ways I need. we create a "potienal snake and food array" and push all the board peices into it.
let potentialSOF = []
for(let i = 0; i<boardSquares.length; i++){
    potentialSOF.push(boardSquares[i])        
}

//our snake!! How exciting!
let snake

//A new game omg things are cooking!!
newGame()

//starts a new game
function newGame(){
    //if our snake is moving for whatever reason, we will clear the interval that is calling the move function.
    moveClearIntervalID && clearInterval(moveClearIntervalID)
    //set our snake as an empty array...
    snake =[]
    //...and push in the middle board square.
    snake.push(boardSquares[495])
    //tell that board square it's a snake now...
    snake[0].classList.add("snake")
    //turn it black... see function for me info
    colorSnake(true)
    //resets the players score to 0
    currentScore[0].textContent=0
    //the high score is set with the value from local storage or the last score, which ever is higher(if the last score was higher that score is saved into storage)
    if(currentScoreValue> highScoreValue){
        highScoreValue = currentScoreValue
        localStorage.setItem("highScore", currentScoreValue)
    }else{
        highScoreValue = highScoreValue
    }
    //I actually don't think this works lol
    document.removeEventListener("keydown", (e)=>{
        arrowKeys(e)
    })
    snakeMoving=false
    gameOver = false
}
//turns gameboard squares into snakes!! 
function colorSnake(newGame){
    //we loop through all of our copied gameboard array...
    potentialSOF.map((square, index)=>{
        //access the class list of their corresponding spot on the board.
        let classList = boardSquares[index].classList
        //if the square from the copied arrray amtches a square in the snake array, we give it our snake class and remove all other classes.
        if(snake.indexOf(square)>=0){
            classList.add("snake")
            classList.remove("food")
        //if it is not in the snake array, we remove that class so it turns back into( or remains) a white game board.
        }else{
            classList.remove("snake")
        }
        //this function gets called everytime the snake eats, and we only want all of the food class removed if it's a new game, ie there shouldn't be any food on the board when the game first starts
        if(newGame){
            classList.remove("food")
        }
    }) 
}
//This is basically the bulk of the game, the function that moves the snake...
//the parameter is the direction the snake is traveling...
function moveSequence(direction){
    //for some reasone I can't manipulate the snake array in some ways i need...so here goes the handy dandy array copy hack.
    let snakeArrayCopy = [...snake]
    //if the snake is chaning direction, the player has just pressed an arrow key, the the turning point is the place where the snake's head was when the run started. this is where every peice must "turn" direction
    turningPoint =changingDirection ? turningPoint : snakeLocation
    //this will help keep track of each peice of the snake in the loop to push the next peice into the place of the previous peice.
    let place
    //the head is a whole nother beast....
    let firstPlace
    //so we know where to add new snake peices
    let lastPlace = potentialSOF.indexOf(snake[snake.length -1])
    //ok, moster loop.... this will run for each peice of snake, so in the beginning only once or twice, for a great player maybe a few dozen towards the end...
    for(let i =0; i<snakeArrayCopy.length;i++){
        //the snakes head...
        if(i===0){
            //The snakes head will set the tone everytime the snake is moved. It will move one space whenever this function is called in the appropriate direction. If the snake was going in the opposite direction it is traveling now, the snake array should just...reverse. 
            if(direction === "left"){
                if(previousDirection === "right" && changingDirection){
                    snake.reverse()
                }
                firstPlace = snakeLocation -1
            }else if(direction === "right"){
                if(previousDirection === "left" && changingDirection){
                    snake.reverse()
                }
                firstPlace = snakeLocation +1
            }else if(direction === "up"){
                if(previousDirection === "down" && changingDirection){
                    snake.reverse()
                }
                firstPlace = snakeLocation -30 
            }else if(direction === "down"){
                if(previousDirection === "up" && changingDirection){
                    snake.reverse()
                }
                firstPlace = snakeLocation +30 
            }
            //if the square being added has the attribute of the direction being traveled, the snake is at the edge of the board 
            if(boardSquares[snakeLocation].getAttribute(direction) || snake.indexOf(potentialSOF[firstPlace])>=0){
                let text = currentScoreValue > highScoreValue ? `New High Score ${currentScoreValue}` : `Score: ${currentScoreValue}`
                dialoge.textContent = text
                dialogeBox.style.display = "block"
                rematchButton[0].style.display = "block"
                clearInterval(moveClearIntervalID)
                console.log("why won't you break??")
                snakeMoving=false
                gameOver = true
                {break}
            }else{
                snake[i]=potentialSOF[firstPlace] 
                place = snakeLocation
                snakeLocation =firstPlace
                if(snakeLocation===foodPosition){
                    snake.push(boardSquares[lastPlace])
                    currentScoreValue = currentScoreValue + (10*speedLevel) 
                    currentScore[0].textContent = currentScoreValue
                    randomFood()
                    colorSnake()
                    clearInterval(moveClearIntervalID )
                    speedLevel = speedLevel +1
                    moveClearIntervalID = setInterval(moveSequence,(1000/speedLevel), direction)
                }
            }
        }else{
            let holder = potentialSOF.indexOf(snake[i])
            snake[i]=boardSquares[place] 
            place = holder
        }      

        colorSnake()
    }
    if(changingDirection){
        if(changing === snake.length){
            changingDirection = false
        }
        changing++
    }
}


function randomFood(){
    let randomNumber = Math.floor(Math.random() * 900)
    boardSquares[randomNumber].classList.add("food")
    foodPosition = randomNumber
}


document.addEventListener("keydown", (e)=>{
    arrowKeys(e)
})

function arrowKeys(e){
    if(!gameOver){
        let direction
        if(e.key === "ArrowUp"){
            dialogeBox.style.display = "none"
            direction = "up"
        }else if(e.key === "ArrowDown"){
            dialogeBox.style.display = "none"
            direction = "down"
        }else if(e.key === "ArrowLeft"){
            dialogeBox.style.display = "none"
            direction = "left"
        }else if(e.key === "ArrowRight"){
            dialogeBox.style.display = "none"
            direction = "right"
        }else{
            dialogeBox.textContent = "Use the arrow keys to play!"
            dialogeBox.style.display = "block"
            return
        }
        if(snakeMoving){
            moveSequence(direction)
            clearInterval(moveClearIntervalID)
        }else{
            randomFood()
        }
            moveClearIntervalID = setInterval(moveSequence,(1000/speedLevel), direction)
            changingDirection = true
            previousDirection = previousDirection === direction ? "null" : direction
            snakeMoving = true
            turningPoint = snakeLocation
            changing=0
    }

}

///things to do
//when a snake runs into a wall a play should lose...
//when the snake suns into itself, a player should lose
//a score
//a high score record
//speeding up the timer as we eat more foo