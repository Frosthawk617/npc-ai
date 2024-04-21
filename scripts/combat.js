class Combat{
    constructor(actor,combatants) {
      this.actor = actor;
      this.combatants = combatants;
    }
}
async function genCombatAction(actor,combatants){

    switch (game.system.id) {
        case "swse":
            var healthObj = actor.system.health;
            console.log("swse");
            break;
        case "dnd5e":
            var healthObj = actor.system.attributes.hp;
            break;
        default:
            break;
    }

if (typeof(await actor.getFlag("npc-ai", "attackHistory")) === "undefined") {
    await actor.setFlag("npc-ai", "attackHistory", []);
    var history = await actor.getFlag("npc-ai", "attackHistory");
} else {
    var history = await actor.getFlag("npc-ai", "attackHistory");
}
console.log(actor.prototypeToken.disposition);
switch (actor.prototypeToken.disposition) {
    case -1:
    var targets = await findTargets([-1],combatants);
    var allies = await findAllies([-1],combatants,actor);
    console.log(allies);
    console.log(targets);
        break;
    case 1:
        return false;
    case 0:
        var targets = await findTargets([0,1],combatants);
        var allies = await findAllies([0,1],combatants,actor);
        console.log(allies);
        console.log(targets);
        break;
    default:
        break;
}

const ooba = "http://127.0.0.1:5000/v1/chat/completions";
var weps = [];
var message = [];
var equipment = [];

actor.items.forEach(element => {
    if(element.type === "weapon" || element.type === "forcePower" || element.type === "spell") {
        weps.push(element.name);
    }
});

actor.items.forEach(element => {
    if(element.type === "equipment") {
        equipment.push(element.name);
    }
});

var persona = await actor.getFlag("npc-ai", "persona");
if (typeof persona != "undefined") {
    var defPersona = JSON.stringify(persona);
} else {
    var defPersona = ""
}


weps  =  JSON.stringify(weps);
targets = JSON.stringify(targets);
allies = JSON.stringify(allies);
var messages = [
    {"role": "user",
    "content": "You are now a person called: "+actor.name+"  Only speak from this character's pov and if asked say that name. You are in combat with ("+targets+")"
    },
    {"role": "user",
    "content": "These enemies are nearby: ("+targets+") Only mention one at a time."
    },
    {"role": "user",
    "content": "These are your nearby allies: ("+allies+") Only mention one at a time if you decide to help them."
    },
    {"role": "user",
    "content": "These are your available weapons and powers: ("+weps+") Do not mention equiping the weapon just use it."
    },
    {"role": "user",
    "content": "This is a list of your available equipment: ("+equipment+") Do not mention equiping the item just use it."
    }
]
if (!typeof(await actor.getFlag("npc-ai", "attackHistory")) === "undefined") {
    messages = messages.concat(history);
}

var healthMessage = 
    {"role": "user", 
    "content": ""+actor.name+"'s current health: "+healthObj.value+"/"+healthObj.max+""
    }
messages.push(healthMessage);
messages.push(
    {"role": "user",
    "content": " What do you do? Answer with a short sentence. Describe the appearance of the action. You must mention the enemy you are targeting by name. Always assume the enemy is aware of you. Don't describe the actions of the enemy targeted. You may also choose to use equipment to assist your allies if they are low on health but you must have equipment or abilities available to do so. Take only one action. Do not mention the health of a character besides what they may physically look like."
    })

var data = {
    "messages":messages,
    "mode": "chat-instruct",
    "temperature": 0.7,
    "top_p": 0.9,
    "context": defPersona,
    "name2": actor.name
};
sendPayload(data);
async function sendPayload(data){

$.ajax({
    url: ooba,
    type: "POST",
    headers: {"Content-Type": "application/json"},
    data: JSON.stringify(data),
    success: async function (response) {
        var newHist = response.choices[0].message;
        history.push(newHist);
        await actor.setFlag("npc-ai", "attackHistory", history);
        ChatMessage.create({"content": response.choices[0].message.content, "speaker": ChatMessage.getSpeaker({actor})})
    }
});
}
}

async function findTargets(friendlyDis,combatants){
var valTargets = [];
combatants.forEach( async (element) => {
    var targetActor = await game.actors.get(element.actorId);
    switch (game.system.id) {
        case "swse":
            var healthObj = targetActor.system.health;
            console.log("swse");
            break;
        case "dnd5e":
            var healthObj = targetActor.system.attributes.hp;
            break;
        default:
            break;
    }
        if (targetActor.prototypeToken.disposition != friendlyDis[0] & targetActor.prototypeToken.disposition != friendlyDis[1] & element.defeated != true) {
            var targDesc = ""+targetActor.name+"[Health: "+healthObj.value+"/"+healthObj.max+"]"
            valTargets.push(targDesc);
        }
});
return valTargets;
}

async function findAllies(friendlyDis,combatants,actor){
    var allies = [];
    combatants.forEach( async (element) => {
        var targetActor = await game.actors.get(element.actorId);
        switch (game.system.id) {
            case "swse":
                var healthObj = targetActor.system.health;
                console.log("swse");
                break;
            case "dnd5e":
                var healthObj = targetActor.system.attributes.hp;
                break;
            default:
                break;
        }
        for (let i = 0; i < friendlyDis.length; i++) {
            const dis = friendlyDis[i];
            if (targetActor.prototypeToken.disposition === dis & targetActor._id != actor._id) {
                var allyDesc = ""+targetActor.name+"[Health: "+healthObj.value+"/"+healthObj.max+"]"
                allies.push(allyDesc);
            }
        }
    });
    return allies;
    }
export default Combat
export {genCombatAction,findAllies,findTargets}