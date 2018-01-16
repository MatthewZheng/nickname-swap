const login = require("facebook-chat-api");
const fs = require("fs");

//Login details -- necessary to use this to initialize login via appState, far more secure than using credentials
// var credentials = {
//    email:"",
//    password:""
// }

var peopleID = [];
var peopleB = [];
var peopleA =[];

//shutdown keywords
var shutDown = ["shut up", "Shut up", "fuck off", "Fuck off", "stop", "Stop", "Go away", "go away"];

//login -- uncomment below and comment out other login prompt to generate appstate.json
// login(credentials, (err,api) => {
login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
   api.setOptions({selfListen:true});

    var stopListening = api.listen((err, event) => {
        if(err) return console.error(err);
        switch(event.type){
           case "message":

            if(event.body === "/find"){
               api.getThreadInfoGraphQL(event.threadID,(err, info) => {
                  if(err) return console.error(err);
                  peopleID = info.participantIDs;
                  peopleB = info.participantIDs;
                  //Randomize order of array
                  function shuffle(a){
                     var currInd = a.length, tempVal, randomIndex;
                     while( 0!== currInd){
                        randomIndex = Math.floor(Math.random() * currInd);
                        currInd-=1;
                        tempVal = a[currInd];
                        a[currInd] = a[randomIndex];
                        a[randomIndex] = tempVal;
                     }
                     return a;
                     }
                     peopleID = shuffle(peopleID);
                     peopleA = peopleID;
                     api.getUserInfo(peopleA, (err, ret) => {
                        if(err) return console.error(err);
                        for(var i=0; i<peopleA.length; i++){
                           peopleA[i] = ret[peopleA[i]].name;
                        }
                     });
               });
            }

            if(event.body == "/switch"){
               console.log(peopleA);
               api.getThreadInfoGraphQL(event.threadID,(err, p) => {
                  if(err) return console.error(err);
                  peopleID = p.participantIDs;
                  peopleB = p.participantIDs;
                  for(var x=0; x<peopleA.length; x++){
                     api.changeNickname(peopleA[x], event.threadID, peopleB[x],(err, app)=>{
                        if(err) return console.error(err);
                     });
                  }
               });
            }

            if(shutDown.indexOf(event.body) > -1){
               api.sendMessage("Goodbye :(", event.threadID);
               //Necessary to uncomment below and create a .json file called appstate (empty) for login via appstate to work
               // fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
               return stopListening();
            }

            case "event":
               console.log(event);
               break;
        }
    });
});
