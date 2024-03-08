//variables
//bring in stuff from html
//gameboard
const body = document.getElementsByTagName("body")
const screenType = screen.orientation.type === "landscape-primary" && screen.orientation.angle < 1 ? "desktop" : "mobile"
const gameBoard = document.getElementById("gameboard")
//dialoge box, displays instructions for playing, starting a newgame, and score info
const dialogeBox = document.getElementById("dialogeBox")
dialogeBox.textContent = screenType === "mobile" ? "Tap outside this box to start!" : "Click or press a button to start!"
//placeholder for scores
const scoreText = document.getElementById("score")
const highScoreText = document.getElementById("highScore")
//buttons to control level selection
const easyButton = document.getElementById("easy")
const medButton = document.getElementById("medium")
const hardButton = document.getElementById("hard")


//simulate keyboard events on click for phone play
const upArrow = document.getElementById("up")
const downArrow = document.getElementById("down")
const leftArrow = document.getElementById("left")
const rightArrow = document.getElementById("right")
const mobileControls = [upArrow, rightArrow, downArrow, leftArrow]


// //timer for easy level
// const timer = document.getElementById("timer")
// const timerBox = document.getElementById("timerBox")
//placeholder to categorize score
const hardness = document.getElementById("hardness")
//stop button is developer only you will need to comment in the element in the HTML for it to work
const stopButton = document.getElementById("stop")

//I have the css grid, but assigning grid squares with ids make keeping track of the snake easier and more intuitive.
let gameSquares=[]
//snake is an array of divs that are appended to the board
const snake=[]
//keeps track of the direction the snake is moving
let previousDirection = false
//timer for easy level
// let time =  timer.textContent
//stops a snakes movement,  for chaning direction/stopping game
let stopMovement
//stops the clock on easy difficulty
// let stopTimer
//keeps trak of food on the board, assigned with a function, see generate food
let food = false
//speed of the snake is determined by the level, it increases as the snake "eats" food
let level = 1
//keeps track of difficulty
let difficulty = 1
//score is calculate/traked every game, highscore is stored and retrieved from local storage
let score = 0
let easyHighScore = localStorage.getItem("easyScore") ? localStorage.getItem("easyScore") : 0
let medHighScore = localStorage.getItem("medScore") ? localStorage.getItem("medScore") : 0
let hardHighScore = localStorage.getItem("hardScore") ? localStorage.getItem("hardScore") : 0
//set the HTML score placeholders
scoreText.children[0].textContent = score
let highScore = difficulty === 1 ? easyHighScore : difficulty === 2 ? medHighScore : hardHighScore
highScoreText.textContent = highScore
//I fell like this is pretty intuitive...
let newGame = false

//for loop for game squares
for(let i=0; i<625; i++){
    const newSquare = document.createElement("div")
    newSquare.setAttribute("id", i)
    gameBoard.append(newSquare)
    gameSquares.push(newSquare)
}


//events and functions
//You can't die, how many points can you get in 60 seconds
const easyGame = ()=>{
    highScore = easyHighScore
    highScoreText.textContent = highScore
    difficulty = 1
    hardness.textContent = "Easy"
    easyButton.classList.add("selected")
    gameBoard.classList.add("easy")
    medButton.classList.remove("selected")
    gameBoard.classList.remove("med")
    hardButton.classList.remove("selected")
    gameBoard.classList.remove("hard")
}
easyButton.addEventListener("click", easyGame)

//you can die by running into the top and bottom wall
const medGame = ()=>{
    highScore = medHighScore
    highScoreText.textContent = highScore
    difficulty = 2
    hardness.textContent = "Medium"
    easyButton.classList.remove("selected")
    gameBoard.classList.remove("easy")
    medButton.classList.add("selected")
    gameBoard.classList.add("med")
    hardButton.classList.remove("selected")
    gameBoard.classList.remove("hard")
}
medButton.addEventListener("click", medGame)
//you can die by running into yourself or any wall
const hardGame = ()=>{
    highScore = hardHighScore
    highScoreText.textContent = highScore
    difficulty = 3
    hardness.textContent = "Hard"
    easyButton.classList.remove("selected")
    gameBoard.classList.remove("easy")
    medButton.classList.remove("selected")
    gameBoard.classList.remove("med")
    hardButton.classList.add("selected")
    gameBoard.classList.add("hard")
}
hardButton.addEventListener("click", hardGame)


//adds keyboard event, appropriate dialoge, and resets score if necessary

const startGame = ()=>{
    console.log("?")
    dialogeBox.innerHTML = screenType === "desktop" ? `Press the arrow keys to start` : `Press the arrows below to start`
    newGame=true
    //any key can activate a game (start game function) ...
    document.removeEventListener("keydown", startGame)
    //but only arrow keys can be used to play (keyboard functions)
    if(screenType === "mobile"){
        mobileControls.forEach(control=>control.removeEventListener("click", startGame))
        upArrow.addEventListener("click", ()=>{keyBoardEvents({key:"ArrowUp"})})
        downArrow.addEventListener("click", ()=>{keyBoardEvents({key:"ArrowDown"})})
        leftArrow.addEventListener("click", ()=>{keyBoardEvents({key:"ArrowLeft"})})
        rightArrow.addEventListener("click", ()=>{keyBoardEvents({key:"ArrowRight"})})
    }else{
        document.addEventListener("keydown", keyBoardEvents)
    }

    //reset score
    scoreText.children[0].textContent = 0  
}
//stop button for development only
stopButton.addEventListener("click", ()=>{
    clearInterval(stopMovement)
})

//ends the game
const gameOver = ()=>{
    let scorePhrase 
    //set lose phrase and highscore if neccessary
    if(highScore<score){
        scorePhrase = "New High Score"
        difficulty === 1 ? localStorage.setItem("easyScore", score) : difficulty === 2 ? localStorage.setItem("medScore", score) : localStorage.setItem("hardScore", score)
        highScoreText.textContent = score
    }else{
        scorePhrase = "Game Over"
    }
    //stop the snake, erase everything but the head and put the head back at the start point.
    clearInterval(stopMovement)
    snake.map((snkpce, i)=>{
        if(i===0){
            gameSquares[312].append(snkpce)
        }else{
            snkpce.remove()
        }
    })
    //remove any food on the board
    food.remove()
    food = false
    //set the place holder for dialoge
    dialogeBox.innerHTML = `${scorePhrase}<span>Press any key to try again</span>`
    dialogeBox.style.display="grid"
    //again... intuitive
    newGame = false
    //remove keyboard events so it doesn't automatically start again...
    document.removeEventListener("keydown", keyBoardEvents)
    document.addEventListener("keydown",startGame)
    //empty snake array
    snake.splice(1)
    //reset to level one
    level = 1
    //reset previous direction for start game stuff
    previousDirection = false
    //enable buttons
    easyButton.disabled = false
    medButton.disabled = false
    hardButton.disabled = false
}

//function to set the food variable 
const generateFood = ()=>{
    //a random place on the baord
    let place = Math.floor(Math.random() * 626)
    //create food div... 
    const foodPiece = document.createElement("div")
    //give it food class for styling...
    foodPiece.classList.add("food")
    //set it's place on the board as an attribute...
    foodPiece.setAttribute("place", place)
    //append it to the board
    gameSquares[place].append(foodPiece)
    //return the div
    return foodPiece
}

//function to add pieces to the snake array
const newSnakePiece = (place)=>{
    //create snake piece div
    const snakePiece = document.createElement("div")
    //give it snake class for styling...
    snakePiece.classList.add("snake")
    //if it's the snakes head, assign it the appropriate id...
    snakePiece.setAttribute("id", snake.length === 0 && "head")
    snakePiece.setAttribute("place", place)
    //append snake to gameboard
    gameSquares[place].append(snakePiece)
    //push it into our snake array
    snake.push(snakePiece)
}
//placing the head in the start position
newSnakePiece(312)

//addes events to arrow keys and nothing else
const keyBoardEvents =  (e)=>{
    //closes any boxes that might be open from a new game or pressing the wrong button
    dialogeBox.style.display="none"
    //the slither function to move the snake will be called with the direction of the arrow key pressed
    let direction
    if(e.key === "ArrowUp"){
        if(previousDirection === "down"){
            return
        }
        direction = "up"
    }else if(e.key === "ArrowDown"){
        if(previousDirection === "up"){
            return
        }
        direction = "down"
    }else if(e.key === "ArrowLeft"){
        if(previousDirection === "right"){
            return
        }
        direction = "left"
    }else if(e.key === "ArrowRight"){
        if(previousDirection === "left"){
            return
        }
        direction = "right"
    }else{
        //if anything other than an arrow key is pressed we say aht aht aht
        dialogeBox.textContent = "Use the arrow keys to play"
        dialogeBox.style.display = "grid"
        return
    }
    //if the snake is moving, we clear the interval and call the move funtion to prevent any delays with setInterval, this is for turning
    if(previousDirection && previousDirection !== direction){
        clearInterval(stopMovement)
        //the only case there should be no previous direction is the start of the game, so all this is stuff that should happen when the game starts
    }else if(!previousDirection){
        //places food on the board
        food = food ? food : generateFood()
        //starts timer on easy mode
        // if(difficulty === 1){
        //     timerBox.style.display="block"
        //     stopTimer = setInterval(()=>{
        //         if(time>0){
        //             time--
        //         }else{
        //             time = 60
        //             gameOver()
        //             clearInterval(stopTimer)
        //         }
        //         timer.textContent = time
        //     }, 1000)
        // }
        //disables buttons
        easyButton.disabled = true
        medButton.disabled = true
        hardButton.disabled = true
    }else{
        //if a person double presses an arrow key nothing should happen
        return
    }
    
    //set clear interval variable and call set interval with our move function. 
    slither(direction)
    stopMovement =  setInterval(slither, (1000/level), direction)   
}

//this is the meat of the game, the function that makes our snake move.
const slither = async (direction) => {
    const snakePositionArray = snake.map((peice)=>Number(peice.getAttribute("place")))
    //the new position each snake link moves into
    let newPos
    //the position each snake link was in previously
    let prevPos
    //I think this is the easiest way to make sure my snake isn't eating itself!
    //for loop that goes through each snake link, saves where it was for the next peice, and moves it into the position of the previous piece.
        for(let i = 0; i <snake.length;i++){
            //we get the position of each snake link on the board (snake peices are appended to game squares and game squares have an id with their place in the grid)
            boardSquarePosition = Number(snake[i].parentElement.id)
            //the head is the only thing that matters, everything else will just move to the spot of the link before it
            if(i===0){
                //up arrow adds 25 to the grid position to go up one
                if(direction === "up"){
                    newPos = boardSquarePosition - 25
                    if((boardSquarePosition-25)<0){
                        //if it's easy, we add 600 to put us at the bottom med and hard the game will end at the top and bottom
                        if(difficulty === 1){
                            newPos = boardSquarePosition + 600
                        }else{
                            gameOver()
                            return
                        }
                    }
                //right arrow adds 1 to the grid position to go to the right one
                }else if(direction === "right"){
                    newPos = boardSquarePosition + 1
                    //any position that is divisible by 25 after adding 1 is the right most edge
                    if((boardSquarePosition+1)%25===0){
                        //running into the side walls only kills you on hard levels. 
                        if(difficulty === 3){
                            gameOver()
                            return
                        }
                    }
                //left arrow subtracts 1 from the grid position to go to the left one
                }else if(direction === "left"){
                    newPos = boardSquarePosition - 1
                    //any position that is divisible by 25 is the left most edge
                    if(boardSquarePosition%25===0){
                        //running into the side walls only kills you on hard levels. 
                        if(difficulty === 3){
                            gameOver()
                            return
                        }
                    }
                //down arrow subtracts 25 from the grid position to go down one
                }else if(direction === "down"){
                    newPos = boardSquarePosition + 25
                    //if it's easy, we add 600 to put us at the bottom med and hard the game will end at the top and bottom
                    if((boardSquarePosition+25)>625){
                        if(difficulty === 1){
                            newPos = boardSquarePosition - 600
                        }else{
                            gameOver()
                            return
                        }
                    }
                }
                //if the run into a piece of food...
                if(newPos === Number(food.getAttribute("place"))){
                    //the food gets 'eaten'
                    food.remove()
                    //new food is placed on the board
                    food = generateFood()
                    //a new snake piece is added to the snake
                    newSnakePiece(Number(snake[snake.length-1].parentElement.id))
                    //add points to the score based od the level
                    score = score + (10 * level)
                    //increase the level
                    level++
                    //set the score
                    scoreText.children[0].textContent = score
                }else if(snakePositionArray.indexOf(newPos)>=0){
                 gameOver()
                 clearInterval(stopMovement)
                 return
                }
            }else{
            //for all links that are not the head we just need to record where they were.
                newPos = prevPos
            }
                snake[i].setAttribute("place", newPos)
            //appended the snake peice to its new spots
            gameSquares[newPos].append(snake[i])
            //record previous location
            prevPos = boardSquarePosition
        }


        //if they turned we record the new direction
        if(direction !== previousDirection){
            previousDirection = direction
        }
}

//add keyBoard events so the player can start the game with arrow keys.
console.log(screenType)
if(screenType ===  "mobile"){
    console.log("here")
    mobileControls.forEach(control=>control.addEventListener("click", startGame))
}else{
    document.addEventListener("keydown", startGame)
}







