import { charGen,importChar } from "./chargen.js";
import { startChat } from "./chatManager.js";
import { genGreet } from "./genGreet.js";
import { genCombatAction,findTargets,findAllies} from "./combat.js";
import { portraitGen } from "./imgGen.js";
import { summarizeCombat } from "./summarizer.js";

Hooks.on("updateCombat",async(combatData)=>{
  var nextCombatant = await canvas.tokens.get(combatData.current.tokenId).actor;
  var combatants = combatData.combatants._source;
  var combatant = combatants.filter(obj => {
    return obj.tokenId === combatData.current.tokenId;
  })
console.log(combatant);
  if (combatant[0].defeated === false) {
  genCombatAction(nextCombatant,combatants);
  }
  console.log(nextCombatant,combatants);
  })

Hooks.on("combatStart", async(combatData)=>{

  Hooks.once("preDeleteCombat", async (info)=>{
    var fighters = info.combatants._source;    
    fighters.forEach(async element => {
        var fighterActor = await game.actors.get(element.actorId);
        var persona = await fighterActor.getFlag("npc-ai","persona");
        if ( typeof persona != `undefined`){
          switch (fighterActor.prototypeToken.disposition) {
            case -1:
            var targets = await findTargets([-1],fighters);
            var allies = await findAllies([-1],fighters,fighterActor);
            console.log(allies);
            console.log(targets);
                break;
            case 1:
                return false;
            case 0:
                var targets = await findTargets([0,1],fighters);
                var allies = await findAllies([0,1],fighters,fighterActor);
                console.log(allies);
                console.log(targets);
                break;
            default:
                break;
        }

        switch (game.system.id) {
          case "swse":
              var healthObj = fighterActor.system.health;
              var healthValue = healthObj.value;
              var healthMax = healthObj.max;
              break;
          default:
              break;
      }

            await summarizeCombat(fighterActor,allies,targets,healthObj);
        }
    });
    
    
    })

})
  Hooks.on("getActorSheetHeaderButtons",async(sheet, buttons)=>{
    console.log(sheet,buttons);
      const target = (sheet.actor);
        console.log(target);
        buttons.unshift({
            class: 'persona',
            icon: 'fa-solid fa-brain',
            onclick: () => {
              new Dialog({
                title: "Choose Function",
                content: `<p></p>`,
                buttons: {
                  buttonA: {
                    label: "Persona",
                    callback: async (html) => {
                      new Dialog({
                        title: "Enter Starting Prompt",
                        content: `<p>`+target.name+` is a <input type="text" name="prompt" id="promptInput">`,
                        buttons: {
                          buttonA: {
                            label: "Generate",
                            callback: async (html) => {
                              let prompt = html.find('[name="prompt"]').val();
                              console.log(target.name,prompt);
                              charGen(target,prompt);
                            }
                          },
                          buttonB: {
                            label: "Import",
                            callback: async (html) => {
                              await importChar(target);
                            }
                          }
                        }
                      }).render(true)
                    }
                  },
                  buttonB: {
                    label: "Start Conversation",
                    callback: async (html) => {
  
  console.log("started convo");
if (target.getFlag("npc-ai","memory").length < 1) {
  genGreet(target);
}else{
await ChatMessage.create({"content": "Conversation with: "+target.name+" started! to end the conversation type '!stop'"})
var hooks = await startChat(target);
Hooks.once("combatStart",async()=>{
Hooks.off("chatMessage", hooks.chat);
Hooks.off("createChatMessage", hooks.commands);
await ChatMessage.create({"content": "Conversation with: "+target.name+" ended due to combat!"})
});
console.log(hooks);

          }
                    }
                  },
                  buttonC: {
                    label: "Image Gen",
                    callback: async (html) => {
                      await portraitGen(target);}
                  }
                }
              }).render(true)
            }
        });
    });
