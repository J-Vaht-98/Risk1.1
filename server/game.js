module.exports = {
    initGame,
    checkIsWinner,
    moveRollDice,
    endTurn,
    movePlaceSoldier,
}
const { shuffle } = require('./utils');

  
function initGame(numPlayers,room){
    const state = createGameState(numPlayers,room); 
    return state;
}
function createGameState(numPlayers,room){
    //Asjad, mis s6ltuvad m2ngijate arvust
    console.log("game state created");
    let scores = [];
    let pOrder = [2,1];
    let nicknames = [];
    
    for(i=1;i<pOrder.length+1;i++){
      nicknames.push("Plr " + i);
    }
    /***TODO: GENERATE RANDOM PLAY ORDER */
    /**TODO: ADD NICKNAMES U CAN PUT IN AT INITIALIZATION */
    /***TODO: GIVE GAME STARTER A HOW MANY PLRS OPTION (MAX TULEB PAIKA PANNA) */
    /***TODO: winner handling */
    
    return{
        room:room,
        scores:Array(numPlayers).fill(0),
        playOrder:pOrder,
        dice:[0],
        nicknames:nicknames,
        currentPlayer: pOrder[0],
        numPlayers:numPlayers,
        turn:0,
        winner:false,
        active:true,
        gamePhase:1, //gamephase 1 on see kus s6durid paigutatakse 2 on p2ris m2ng 
        turnPhase:{
          nrOfDiceRolls:3
        },
        maakonnad:["hiiumaa","saaremaa","laanemaa","harjumaa",
        "rapla","parnu","laaneviru","idaviru","jogeva","tartu",
        "valga","polva","voru","viljandi","jarva"],
        board:createRiskBoard(),
        cards:null,
        attackOnGoing:false,
        attack:{
          attacker:null,
          defender:null,
          
          nrOfDice:2,
          attackerDice:Array(2).fill(null), //mdea palju t2ringuid panna ja kuidas seda dynaamiliselt muuta
          defenderDice:Array(2).fill(null) 
          
        }
    }
}

function checkIsWinner(state){
    if(!state){ //kui state tyhi 2ra tee midagi
        console.log("state on tyhi");
        return;
    }
    if(state.scores[state.currentPlayer] >= 60){
        state.winner = true;
        return state.currentPlayer;
    }
    
}
/********************MOVES**************/

function moveRollDice(state){
  let dice = Math.floor(Math.random() * 7 + 1) //1-6
  state.scores[state.currentPlayer -1] += dice; //lisa vastavasse skooride arraysse saadud punktid
  console.log("Added" + dice  + "to" + (state.currentPlayer-1))
  state.dice[0] = dice;
  state.turnPhase.nrOfDiceRolls -= 1;
  if(state.turnPhase.nrOfDiceRolls <= 0){
    endTurn(state);
  }
}
function movePlaceSoldier(state, country,soldiers){
    if(country == '' || country == undefined){
      return false;
    }
    
    if(state.board[country].owner == -1){
      console.log("added soldiers + owner")
      state.board[country].owner = state.currentPlayer;
      state.board[country].soldiers += soldiers;
    }
    if(checkIfAllStatesFilled(state)){
      state.gamePhase = 2;
    }
    return true;
      
    /**SOME check on how many soldiers u can place during a turn */
}

function endTurn(state){
  /*Vahetab currenplayer j2rgmise m2ngija playOrderis vastu*/
  /**STUFF THAT HAPPENS AT TURN BEGIN */
  state.turnPhase.nrOfDiceRolls = 3;
  /********************************************************** */
  let playerIndexInOrder = getElementIndex(state);
    if(state.currentPlayer == state.playOrder[state.numPlayers-1]){ //kui playorderis viimane,ss j2rgmine on esimene
         state.currentPlayer = state.playOrder[0];
  }else
  {
    state.currentPlayer = state.playOrder[playerIndexInOrder + 1]; //breakpoint.
  }
  state.turn += 1;
  
  /**Siia peaks panema mingi state reset funktsioon, et asjad, nt dice iga k2igu l6pus nulli lyya */
  // state.turn  = state.turn +  1;
}
function startAttack(state, attacker, defender){
  state.attackOnGoing = true
  
  state.attack.attacker = state.board[attacker].owner
  state.attack.defender = state.board[defender].owner
  
}
function getElementIndex(state){
  for(i=0;i<state.numPlayers;i++){
    if(state.playOrder[i] == state.currentPlayer){
      return i;
    }
  }
  console.log("getElementIndex function didnt work");
  return;
}
function checkIfAllStatesFilled(state){
  maakonnad = state.maakonnad;
  for(i=0;i<maakonnad.length;i++){
    maakond = state.board[maakonnad[i]];
    if(maakond.owner <0){return false}
  }
  return true;
}
function createRiskBoard(){
  /*teeb JSON objekti, kus iga kontinendi kohta riigid ja info nende riikide kohta
  *naabrid, mis m2ngijale kuulub, mitu s6durit peal etc*/
  var board = {
    hiiumaa:{owner:-1,soldiers:0,neighbors:["saaremaa","laanemaa"]},
    saaremaa:{owner:-1,soldiers:0,neighbors:["hiiumaa","laanemaa","parnu"]},
    laanemaa:{owner:-1,soldiers:0,neighbors:["hiiumaa","saaremaa","parnu","harjumaa","raplamaa"]},
    harjumaa:{owner:-1,soldiers:0,neighbors:["laanemaa","rapla","jarva","laaneviru"]},
    rapla:{owner:-1,soldiers:0,neighbors:["harjumaa","laanemaa","jarva","parnu"]},
    
    parnu:{owner:-1,soldiers:0,neighbors:["saaremaa","viljandi","laanemaa","rapla","jarva"]},
    laaneviru:{owner:-1,soldiers:0,neighbors:["harjumaa","jarva","jogeva","idaviru"]},
    idaviru:{owner:-1,soldiers:0,neighbors:["jogeva","laaneviru"]},
    jogeva:{owner:-1,soldiers:0,neighbors:["idaviru","laaneviru","tartu","viljandi","jarva"]},
    tartu:{owner:-1,soldiers:0,neighbors:["polva","valga","jogeva","viljandi"]},
    
    jarva:{owner:-1,soldiers:0,neighbors:["harjumaa","rapla","parnu","viljandi","jogeva","laaneviru"]},
    valga:{owner:-1,soldiers:0,neighbors:["viljandi","tartu","polva","voru"]},
    polva:{owner:-1,soldiers:0,neighbors:["tartu","valga","voru"]},
    voru:{owner:-1,soldiers:0,neighbors:["valga","polva"]},
    viljandi:{owner:-1,soldiers:0,neighbors:["parnu","jarva","jogeva","tartu","valga"]}
    
  }
  return board;
}
/*   */
    /*hiiumaa:{owner:1,soldiers:3,neighbors:["saaremaa","laanemaa"]},
    saaremaa:{owner:1,soldiers:6,neighbors:["hiiumaa","laanemaa","parnu"]},
    laanemaa:{owner:2,soldiers:0,neighbors:["hiiumaa","saaremaa","parnu","harjumaa","rapla"]},
    harjumaa:{owner:2,soldiers:0,neighbors:["laanemaa","rapla","jarva","laaneviru"]},
    rapla:{owner:1,soldiers:0,neighbors:["harjumaa","laanemaa","jarva","parnu"]},
    
    parnu:{owner:2,soldiers:0,neighbors:["saaremaa","viljandi","laanemaa","rapla","jarva"]},
    laaneviru:{owner:2,soldiers:0,neighbors:["harjumaa","jarva","jogeva","idaviru"]},
    idaviru:{owner:2,soldiers:0,neighbors:["jogeva","laaneviru"]},
    jogeva:{owner:2,soldiers:0,neighbors:["idaviru","laaneviru","tartu","viljandi","jarva"]},
    tartu:{owner:2,soldiers:0,neighbors:["polva","valga","jogeva","viljandi"]},
    
    jarva:{owner:2,soldiers:0,neighbors:["harjumaa","rapla","parnu","viljandi","jogeva","laaneviru"]},
    valga:{owner:2,soldiers:0,neighbors:["viljandi","tartu","polva","voru"]},
    polva:{owner:1,soldiers:0,neighbors:["tartu","valga","voru"]},
    voru:{owner:2,soldiers:0,neighbors:["valga","polva"]},
    viljandi:{owner:1,soldiers:0,neighbors:["parnu","jarva","jogeva","tartu","valga"]}*/