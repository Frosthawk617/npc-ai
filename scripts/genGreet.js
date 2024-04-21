import { startChat,menu } from "./chatManager.js";
class GenGreet{
    constructor(actor) {
      this.actor = actor;
    }
}
async function genGreet(actor){
    
    var persona = await actor.getFlag("npc-ai","persona");
    var mem = await actor.getFlag("npc-ai","longterm");
    var data = {
        "messages": history,
        "mode": "chat-instruct",
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 200
        
    };
    var history = await actor.getFlag("npc-ai","charGenHistory");
    new Dialog({
        title: "Enter Prompt",
        content: `<p>Enter things to include in the scenario: <input type="text" name="prompt" id="promptInput"> People: <input type="text" name="people" id="promptInput"><p>Use last encounter: 
        <input type="checkbox" name="memory" id="memory"></p>`,
        buttons: {
          buttonA: {
            label: "Generate",
            callback: async (html) => {
              let prompt = html.find('[name="prompt"]').val();
              let people = ["\nUser:", "\n", "\nUndefined:", "\nundefined:"]
              let memCheck = $('#memory').is(':checked');
              if(html.find('[name="people"]').val() === "") {
                canvas.tokens.objects.children.forEach(element => {
                    var name = element.document.name;
                    people.push("\n"+name+":");
                });
              }else{
              people.push("\n"+html.find('[name="people"]').val()+":")
              }
              console.log(memCheck);
              if(memCheck === true){
                var mem = await actor.getFlag("npc-ai","longterm");
                data.stopping_strings = people;
                data.stop = people;
                var lastmem = mem.slice(-1);
                console.log(lastmem);
                console.log("true");
                var scenprompt = "Write the initial message in this roleplay from "+actor.name+"'s pov based on the "+prompt+" and "+lastmem[0]+". Impersonating, controlling or speaking as a character other than "+actor.name+" is strictly forbidden. Never mention a character named User. Never mention characters other than those mentioned here("+prompt+") You are "+actor.name+" don't include speech or actions from characters other than "+actor.name+""
} else {
                data.stopping_strings = people;
                data.stop = people;
               var scenprompt = "Write an interesting and engaging scenario for roleplay with "+actor.name+" involving the following"+prompt
   }
              var message= {
              "role": "user",
              "content":  scenprompt} 
history.push(message);
data.messages = history;


const ooba = "http://127.0.0.1:5000/v1/chat/completions";  
await $.ajax({
    url: ooba,
    type: "POST",
    headers: {"Content-Type": "application/json"},
    data: JSON.stringify(data),
    success: async function (response) {
 console.log(response);
 await history.push(response.choices[0].message);
 console.log(response.choices[0].message.content);
 var res = response.choices[0].message;
 await actor.setFlag('npc-ai','memory', [res]);
 console.log(memCheck);
 if(memCheck === true){
    await actor.setFlag("npc-ai", "greeting", res.content);
    var shortMem =  await actor.getFlag("npc-ai", "memory");
    shortMem.push(response.choices[0].message);
    await actor.setFlag("npc-ai", "memory", shortMem);
    console.log("Done");
   var hooks = await startChat(actor);
    Hooks.once("combatStart",async()=>{
      Hooks.off("chatMessage", hooks.chat);
      Hooks.off("createChatMessage", hooks.commands);
      await ChatMessage.create({"content": "Conversation with: "+actor.name+" ended due to combat!"})
      });
    return false;
} else {
 await actor.setFlag("npc-ai", "scenario", res);
message.content = "Write the initial message in this roleplay that would introduce "+actor.name+" based on the scenario. Never impersonate, control or speak as a character other than "+actor.name+""
    data.messages = history;
    await $.ajax({
        url: ooba,
        type: "POST",
        headers: {"Content-Type": "application/json"},
        data: JSON.stringify(data),
        success: async function (response2) {
            console.log(response2.choices[0].message.content);
            var res2=response2.choices[0].message.content;
            if($('#memory').is(':checked') === true){}else{
            await actor.setFlag("npc-ai", "greeting", res2);
            var mem = await actor.getFlag("npc-ai","memory");
            console.log(mem);
            mem.push(response2.choices[0].message);
            await actor.setFlag("npc-ai", "memory", mem);
            }
           var shortMem =  await actor.getFlag("npc-ai", "memory");
            shortMem.push(response2.choices[0].message);
            await actor.setFlag("npc-ai", "memory", shortMem);
            console.log(res2);
           var hooks = await startChat(actor);
            Hooks.once("combatStart",async()=>{
              Hooks.off("chatMessage", hooks.chat);
              Hooks.off("createChatMessage", hooks.commands);
              await ChatMessage.create({"content": "Conversation with: "+actor.name+" ended due to combat!"})
              });
        }
    });
}
}
});

            }
          }
        }
      }).render(true)


}


export default GenGreet
export {genGreet}