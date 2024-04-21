import { summarize } from "./summarizer.js";
import { charRegen } from "./chargen.js";

class ChatManager{
    constructor(actor,prompt) {
      this.actor = actor;
      this.prompt = prompt;
    }
}
async function menu(chatHook,commandHook,actor){
    new Dialog({
      title: "End Conversation?",
      content: `<p>`,
      buttons: {
        buttonA: {
          label: "Pause",
          callback: async (html) => { 
        Hooks.off("renderChatMessage",chatHook);
        Hooks.off("chatMessage",commandHook);
  ChatMessage.create({"content": "Conversation with: "+actor.name+" is paused"})
          }
        },
        buttonB: {
          label: "Don't save",
          callback: async (html) => { 
  await actor.unsetFlag("npc-ai", "memory");
  await actor.setFlag("npc-ai", "memory",[]);
  Hooks.off("renderChatMessage",chatHook);
  Hooks.off("chatMessage",commandHook);
  ChatMessage.create({"content": "Conversation with: "+actor.name+" is over"})
          }
        },
        buttonC: {
          label: "Summarize",
          callback: async (html) => { 
  Hooks.off("renderChatMessage",chatHook);
  Hooks.off("chatMessage",commandHook);
  ChatMessage.create({"content": "Conversation with: "+actor.name+" is over"})
  await summarize(actor);
  await actor.unsetFlag("npc-ai", "memory");
  await actor.setFlag("npc-ai", "memory",[]);
          }
        },
        buttonD: {
          label: "Continue",
          callback: async (html) => { 
            var persona = await actor.getFlag('npc-ai', 'persona');
           var history = await actor.getFlag('npc-ai', 'memory');
        var data = {
            "messages": 
     history
            ,
            "mode": "chat-instruct",
            "temperature": 0.7,
            "top_p": 0.9,
            "name1": "",
            "name2": actor.name,
            "context": JSON.stringify(persona),
            "min_token": 15,
            "max_token": 30,
            "repetition_penalty": 1.3,
        };
        sendPayload(data,history,actor);
        menu(chatHook,commandHook,actor);
          }
        },        buttonE: {
          label: "Regenerate",
          callback: async (html) => { 
            var persona = await actor.getFlag('npc-ai', 'persona');
                var mem = await actor.getFlag('npc-ai', 'memory');
                  var longMem =  await actor.getFlag('npc-ai', 'longterm');
  Hooks.off("renderChatMessage",chatHook);
  Hooks.off("chatMessage",commandHook);
            charRegen(actor,""+JSON.stringify(persona)+"", longMem)
          }
        }
      }
    }).render(true)
  }
async function startChat(actor){
var listen = true;
var persona = await actor.getFlag('npc-ai', 'persona');
var greeting = await actor.getFlag('npc-ai', 'greeting');
var mem = await actor.getFlag('npc-ai', 'memory');
var speak = ChatMessage.getSpeaker({actor});
if (mem.length >0) {
var lastMessage = mem.slice(-1);
ChatMessage.create({"content": lastMessage[0].content, "speaker": speak})
} else {
ChatMessage.create({"content": greeting, "speaker": speak})
}
var commands = Hooks.on("chatMessage", async (bla,content,blah)=>{
    listen = false;
    switch (content) {
        case "!stop":
            Hooks.once("preCreateChatMessage", ()=>{
                return false;
            });
        case "!c":
        return false;
        case "!wipe":
            await actor.unsetFlag("npc-ai", "memory");
            await actor.setFlag("npc-ai", "memory",[]);
            Hooks.off("renderChatMessage",chat);
            Hooks.off("chatMessage",commands);
            ChatMessage.create({"content": "Conversation with: "+actor.name+" is over"})
                 await ChatMessage.create({"content": ""+actor.name+"'s memory has been wiped!"})
                 listen = true;
                  return false;
        default:
            listen = true;
            break;
    }
})

var chat = Hooks.on("createChatMessage",async(content,misc,user)=>{
  var speakerActor = await game.actors.get(content.speaker.actor);
  console.log(speakerActor);
  if(content.type != 5){
    var speaker = content.speaker.alias
if (content.speaker.actor != actor._id & listen & content.content != "!c" ) {
  var sysPrompt = {
    "role": "system",
    "content": "Develop the plot, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions. If required you can generate names of new characters and locations when needed but only when asked by another character. Don't assume knowledge characters you are speaking with, only use their name once introduced or if you spoken to them in the past."
  }
    var nHistory =[];
    var memory = actor.getFlag('npc-ai', 'memory');
    console.log(memory);
    if (typeof await speakerActor.getFlag("npc-ai", "persona") != 'undefined') {
    var speakerPers = await speakerActor.getFlag("npc-ai", "persona");
    var speakerData = speakerPers.description;
    } else {
    var speakerData = speakerActor.system.description;
    }
    var speakerDescription = {
      "role": "user",
      "content": speakerData
    }
    var message =            {
        "role": "user",
         "content": ""+speaker+": "+content.content+""
         }
         if (memory[0].content != sysPrompt.content) {
          nHistory.push(sysPrompt);
         }
        var testMem = memory;
        var detectData = null;
        for (let t = 0; t < testMem.length; t++) {
          const element = testMem[t];
          if (element.content === speakerData.description) {
            detectData = element.content;
            break;
          }
        }
      // var detectData = await testMem.find(element => element.content = speakerData.description);
      console.log(detectData);
         if(!detectData){
          nHistory.push(speakerDescription);
         }
    var speakerActor = await game.actors.get(content.speaker.actor);
   var history = nHistory.concat(memory);
    history.push(message);
    console.log(history);
    var past= actor.getFlag("npc-ai","longterm");
    var data = {
        "messages": 
 history
        ,
        "mode": "chat-instruct",
        "temperature": 0.7,
        "repeat_penalty": 1.1,
        "top_p": 0.9,
        "name1": speaker,
        "name2": actor.name,
        "context": JSON.stringify(persona) +" Past Events: "+ JSON.stringify(past),
        "greeting": greeting,
        "instruction_template": "ChatML"
    };
    sendPayload(data,history,actor);

}

}});
menu(chat,commands,actor);
return {chat, commands}
}
async function sendPayload(data, history,actor){
    const ooba = "http://127.0.0.1:5000/v1/chat/completions";  
    await $.ajax({
        url: ooba,
        type: "POST",
        headers: {"Content-Type": "application/json"},
        data: JSON.stringify(data),
        success: async function (response) {
          var newMem = response.choices[0].message;
          // newMem.content = ""+actor.name+": "+newMem.content;
      history.push(newMem);
      await actor.setFlag('npc-ai', 'memory', history);
      ChatMessage.create({"content": ``+response.choices[0].message.content+``, "speaker": ChatMessage.getSpeaker({actor})})

        }
    });
}

export default ChatManager
export {startChat,menu}