
const socket = io('http://localhost:3000');

socket.on('init',handleInit);
socket.on('gameState',handleGameState);
socket.on('gameOver',handleGameOver);
socket.on('gameCode',handleGameCode);
socket.on('unknownCode',handleUnknownCode);
socket.on('tooManyPlayers',handleTooManyPlayers);
socket.on('waitingForPlayers',handleWaitingForPlayers);
socket.on('error',handleError);

const gameScreen = document.getElementById('gameScreen');
const buttonContainer = document.getElementById("buttonContainer");
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const waitingScreen = document.getElementById("waitingScreen");
const gameMap = document.getElementById("gameMap");
const gameLog = document.getElementById("gameLog");
const gameImg = document.getElementById("mapimg");
const attackScreen = document.getElementById("attackScreen")
const soldierPlaceForm = document.getElementById("soldierPlaceForm");

const playerColors = ["red","aqua","pink","purple"] //m2ngija 1 on punane jne
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame() {
  socket.emit('newGame');
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}
var gameActive = false;
var playerNumber;


function clearGameScreen(){
    gameLog.style.display = 'block'
    gameScreen.textContent = null;
    gameScreen.style.display = "block";
    gameMap.style.display = 'block'
    buttonContainer.textContent = null
    buttonContainer.display = 'block'
}

function renderGame(state){
    /*renderdab m2nguseisu p6hjal kliendile*/
    
    if(!state){
        console.log("State not recieved\n");
        return;
    }
    clearGameScreen(); 
    renderMapState(state);
    displayGameInfo(state);
    
    if(playerNumber==state.currentPlayer && state.gamePhase == 1){
        /*Selle m2ngija kord + esimene faas*/
        // renderActivePlayer(state,playerNumber);
        buttonContainer.style.display = 'block'
        
 
        
        placeSoldierBtn = createButton(buttonContainer,btnId='placeSoldierBtn',);
        placeSoldierBtn.innerText = "Place Soldiers";
        placeSoldierBtn.type ='submit'
        placeSoldierBtn.classList.add('placeSoldier') 
        
        howManySoldiers = createInput(buttonContainer, inputId = 'howManySoldiers');
        howManySoldiers.classList.add('placeSoldier') //sama class, et button teab, et see input v22rtus tuleb v6tta
        
        /*Lisa kuulajad ainult nendele osadele, kus pole s6dur*/
        vabaMaa = checkForFreeStates(state);
        // if(vabaMaa.length == 0){socket.emit('endGamePhase')}; gamephase checkitakse iga turni l6pus
        let = nrOfClicks = 0
        for(i=0;i<vabaMaa.length;i++){
            nimi = vabaMaa[i];
            path = document.getElementById(nimi);
            path.addEventListener('click', (e) =>{
                nrOfClicks++;
                placeSoldierBtn.classList.toggle('red');
                if(nrOfClicks%2==1){
                    e.target.style.fillOpacity = 0.75;
                }else{e.target.style.fillOpacity = 1;}
                
                riik = e.target.id
                sodureid = parseInt(howManySoldiers.value,10);
                console.log(sodureid);
                
                placeSoldierBtn.onclick = ()=>{
                    socket.emit('placeSoldier',{riik:riik,sodureid:sodureid});
                    socket.emit("endTurn");
                }
                
                
            })
            
        }
        
        
        
    }
    if(playerNumber==state.currentPlayer && state.gamePhase == 2){
        skipTurnBtn = createButton(buttonContainer,btnId='skipTurnBtn');
        skipTurnBtn.innerText = "Skip Turn"
        skipTurnBtn.onclick = () => {socket.emit("endTurn");}
        
        attackButton = createButton(buttonContainer, btnId='attackBtn');
        attackButton.innerText = "Attack"
        //tee selle m2ngija alad klikitavaks, ss peale klikki alale display naabrid
        playerAreas = getPlayerAreas(state,playerNumber);
        console.log(playerNumber,playerColors[playerNumber-1])
        var trueNeighbors; //naabrid, mis pole selle m2nigja omad
        gameMap.addEventListener("click",(e)=>{
            if(state.maakonnad.includes(e.target.id) && state.board[e.target.id].owner == playerNumber){
                neighborAreas = state.board[e.target.id].neighbors;
                trueNeighbors = getTrueNeighbors(neighborAreas,playerAreas);
                renderMapState(state);
                highlightNeighbors(trueNeighbors);
                attackButton.style.background = 'white'
                var attacker = document.getElementById(e.target.id);
                e.target.style.fill = 'green'
                
                for(i=0;i<trueNeighbors.length;i++){
                    ala = document.getElementById(trueNeighbors[i]);
                    ala.addEventListener('click',(e)=>{
                        var defender= e.target.id;
                        renderMapState(state); //basically reset fills
                        attacker.style.fill = 'green' //attacker 
                        
                        e.target.style.fill = 'orange';
                        console.log('attacker',attacker.id)
                        console.log('defender',defender)
                        
                        attackButton.style.background = 'red';
                        attackButton.onclick = renderStartAttack(state,attacker.id,defender);
                    })
                }
            }
            
        })
        
    }
       

}

// document.addEventListener('click',(e)=>{console.log(e.target.id)}) /*********************************** */

function handleError(err){
    console.log(err);
    let msg = JSON.parse(err);
    let a = document.createElement("h2");
    a.innerText = msg.text;
    errorLog.append(a);
    setTimeout(()=>{
        errorLog.innerHTML = null;
    },2000)
}
function pad(num, size) {
    /*teeb nr stringks ja lisab n kohta ala 5 -> '05'*/
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}
function renderMapState(state){ //
    //loop states
    //get owner
    //change color
    for(i=0;i<state.maakonnad.length;i++){
        maakond = state.maakonnad[i];
      omanik = state.board[maakond].owner;
      soduriteArv = state.board[maakond].soldiers;
        for(j=0;j<state.numPlayers;j++){
            if(omanik-1==j){
                document.getElementById(maakond).style.fill = playerColors[j];
                document.getElementById(maakond + 'tekst').textContent = pad(soduriteArv,2);
                // document.getElementById().textContent = soduriteArv;
             }
        }
    }
    
  }
function createButton(rootElement,btnId='',btnClass=''){
    /*Loob nupu ja tagastab selle DOM handleri*/
    let btn = document.createElement("button");
    btn.id = btnId;
    if(btnClass !='') btn.classList.add(btnClass);
    rootElement.append(btn);
    return btn;
}
function createInput(rootElement,inputId ='',inputClass = ''){
    let input = document.createElement("input");
    input.type = "number"
    input.id = inputId
    
    if(inputClass!='' && inputClass != null){input.classList.add(inputClass)};
    rootElement.append(input);
    return input
}
function checkForFreeStates(state){
    let maakonnad = state.maakonnad;
    let vabaMaa = [];
    for(i=0;i<maakonnad.length;i++){
        maaNimi = maakonnad[i];
        maakond = state.board[maaNimi];
        if(maakond.owner <0){vabaMaa.push(maaNimi)};
    }
    return vabaMaa;
}
function getPlayerAreas(state,playerNumber){
    playerAreas = []
    maakonnad = state.maakonnad;
    for(i=0;i<maakonnad.length;i++){
        maaNimi = maakonnad[i];
        if(state.board[maaNimi].owner == playerNumber){
            playerAreas.push(maaNimi);
        }
    }
    return playerAreas;
}
function highlightNeighbors(neighborAreas){
    for(i=0;i<neighborAreas.length;i++){
        ala = document.getElementById(neighborAreas[i]);
        ala.style.fill = 'gray'
        ala.style.fillOpacity = 0.55 //naaber
    }
}
function getTrueNeighbors(neighborAreas,playerAreas){
    /*Leiab need naabrid, mis pole ryndaja omad*/
    trueNeighbors = []
    for(j=0;j<neighborAreas.length;j++)
                        if(!playerAreas.includes(neighborAreas[j])){
                            trueNeighbors.push(neighborAreas[j]);
                        }
                    return trueNeighbors;
}
  function renderDice(rootElement){
    var dice = document.createElement("img");
    
    dice.id = "dice-0";
    dice.classList.add("dice")
    rootElement.append(dice);
    dice.src = './img/dice-1.png'
    
    dice.addEventListener("click", () =>{
        rand = Math.floor((Math.random() * 6) + 1);
        dice.src = './img/dice-'+ rand + '.png'
        socket.emit("diceRoll");
    });
}
function renderStartAttack(state,attackingState,defendingState){
    attackScreen.style.display = 'block'
    attackingPlayer = state.nicknames[state.board[attackingState].owner -1]
    defendingPlayer = state.nicknames[state.board[defendingState].owner -1]
    attackScreen.innerText = attackingPlayer +'('+ attackingState +')' + 'is attacking' + '(' +defendingPlayer +')' + ' '+ defendingState;
    for(i=0;i<state.numPlayers;i++){
        renderDice(attackScreen);
    }
}
function emitAttack(attacker,defender){
    socket.emit('attack',{attacker:attacker,defender:defender});
}

function displayGameInfo(state){
    var turnDisplay = document.getElementById("turn-nr");
    turnDisplay.textContent = ("Turn number: " + state.turn);
    var playOrderDisplay = document.getElementById("playOrder-display");
    playOrderDisplay.textContent = "Playorder: " + state.playOrder;
}
function displayInfoAboutMove(state){
    let playerWhoRolled;
    if(state.turn > 0){
        for(j=0;j<state.numPlayers;j++){
            if(state.playOrder[j] == state.currentPlayer){
              playerWhoRolled =  j;
            }
          }
        appendToLog(state,state.nicknames[playerWhoRolled] + " rolled a " + state.dice)
    }
    
}
function renderActivePlayer(state,playerNumber){
                    
    let name = document.getElementById("player-name-" + playerNumber) //n2ita et kliendi kord
    name.innerText="Your turn!";
    let container = document.getElementById("name-score-container-" + playerNumber);
    container.classList.remove("active-player");
    name.classList.toggle("your-turn");
    document.title= "YOUR TURN";
    
    // renderDice(buttonContainer);
    
    let endTurnButton = document.createElement("button");
    endTurnButton.innerText = "End or Skip Turn";
    endTurnButton.addEventListener("click", () => {
        console.log("endturnbutton emiited enturn")
        
    });
    buttonContainer.append(endTurnButton);
    }
    