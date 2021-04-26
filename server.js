const io = require('socket.io')();
const { initGame, checkIsWinner, moveRollDice,endTurn,movePlaceSoldier} = require('./game');
const { makeid } = require('./utils');
const {NR_OF_PLAYERS} = require("./constants");


const state = {}; //siia iga roomi loodud state, access state[roomName]
const clientRooms = {}; // client-id:roomname, saab teada kus toas mis klient
 //kuidagi tootab selle game creationisse

io.on('connection', client => {

  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame); 
  client.on('diceRoll',handleRollDice);
  client.on('placeSoldier',(data)=>{
    handlePlaceSoldier(data.riik,data.sodureid);  
  });
  client.on('attack',(data) =>{
    handleAttack(data.attacker,data.defender);
  })
  client.on('endTurn',handleEndTurn);
  // client.on('endGamePhase',handleEndGamePhase);
  
  

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];
    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    }
    numClients += 1; //selle kes m2ngu alustas 
    
    client.emit('waitingForPlayers',numClients); //et 2sja liitunud klient n2eb playerite arvu
    console.log(roomName,"-",numClients);
    
     if(numClients > 1 && numClients < NR_OF_PLAYERS){ //midagi lobby sarnast 
      //k6ik selles roomis saavad  selle
      console.log("Lobby started");
      io.sockets.in(roomName)
      .emit('waitingForPlayers', numClients);
    } 
    else if(numClients > NR_OF_PLAYERS){
      client.emit('tooManyPlayers');
      return;
    }
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);// saadab m2ngu koodi
    client.emit('init', numClients); //numClients saab frontendis kliendi playerNumber 
    client.join(roomName);
    if(numClients==NR_OF_PLAYERS){ 

      console.log("Game Initialized..");
      state[roomName] = initGame(NR_OF_PLAYERS,roomName);
      client.number = numClients;
    }
    

    
    gameInterval(roomName); //hakkab gamestate saatma
  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);
    client.emit('waitingForPlayers',1); //n2itab, et 1 m2ngija liitund
    client.join(roomName);
    client.number = 1;
    client.emit('init', 1); // esimene m2ngjia joinib
  }
  function returnRoomName(){
    /*Kontrollib, kas s6numi saatnud klient on roomis, ja ss tagastab vastava roomName
    *v6i mitte midagi, kui pole
    */
    let roomName = clientRooms[client.id];
  if (!state[roomName]) {
    console.log("This gamestate doesnt exist");
    return;
  }
  return roomName;
  }  
/************************LISTEN FOR MOVES************* */
  function handleRollDice() {  
  let roomName = returnRoomName();
  
   console.log("DICE ROLLED");
   moveRollDice(state[roomName]);
   console.log("state b4",state[roomName]);
   gameInterval(roomName); //kontrollib kas winner ja saadab k6igile gamestate
  }
  function handleEndTurn(){
    let roomName = returnRoomName();
   endTurn(state[roomName]);
   gameInterval(roomName); //kontrollib kas winner ja saadab k6igile gamestate
   
  }
  function handlePlaceSoldier(country, soldiers){
    console.log(country)
    let roomName = returnRoomName();
    let validCountry = movePlaceSoldier(state[roomName],country,soldiers); //return -1 if no country selected etc.
    if(validCountry == true){
      console.log(state[roomName])
      // gameInterval(roomName);
      // endTurn(state[roomName]);
    }
    else{
      
      io.sockets.in(roomName)
      .emit('error', JSON.stringify({text:"Error placing soldier!"}));
    }
  }
  function handleAttack(attacker,defender){
    
  }
  

  
  
  
  return; //client on connection return
});

function gameInterval(roomName) {
  /*Funktsioon, mis kontrollib, kas keegi v6itis, kui ei ss saadab k6igile gamestate
  *kui jh siis saadab gameover*/
 
    const winner = checkIsWinner(state[roomName]);
    if(!winner) { // kui pole winner, ss saada gamestate
      emitGameState(roomName, state[roomName])
    }else{
      console.log("Someone won");
    emitGameOver(roomName, winner);
    state[roomName] = null; //kustutab selle m2ngu seisu 2ra
    }
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  console.log("gamestate sent",gameState);
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}


  
  io.listen(process.env.PORT || 3000);