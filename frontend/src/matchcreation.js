function init() {
    initialScreen.style.display = "none";
      waitingScreen.style.display = "block";
      gameActive = true;
    }
    function handleInit(number){
        playerNumber = number;
        document.title += "(Plr " + playerNumber + ")";
    }
    function handleGameCode(gameCode){
        gameCodeDisplay.innerText = gameCode;
    }
    function handleGameState(gameState){
        console.log(gameActive,"gameactive")
        if(!gameActive){
            return;
        }
        
        gameState = JSON.parse(gameState);
        waitingScreen.style.display = "none";
        window.scrollTo(0,0);
        renderGame(gameState);
    }
    
    function handleGameOver(data){
        if(!gameActive){
            return;
        }
        data = JSON.parse(data);
        
        gameActive = false;
        
        if(data.winner  === playerNumber){
            alert("you win");
        } else {
            alert("you lose");
        }
    }
    function handleWaitingForPlayers(nrOfJoined){
        let span = document.getElementById("joined-players-nr");
        span.innerText = nrOfJoined;
    }
    
    function handleUnknownCode(){
        resetInitScreen();
        alert("unknown game code")
    }
    function handleTooManyPlayers(){
        resetInitScreen();
        alert("This game is already in progress")
    }
    function resetInitScreen() {  //Resettib UI, vaja kui pannakse nt vale kood m2ngule mis pole olemas vms
        playerNumber = null;
        gameCodeInput.value = '';
        initialScreen.style.display = "block";
        gameScreen.style.display = "none";
        gameLog.style.display = 'block';
      }