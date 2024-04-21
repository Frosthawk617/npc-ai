import { loadModel,unloadModel } from "./oobaController.js";
class CharGen{
    constructor(actor,prompt) {
      this.actor = actor;
      this.prompt = prompt;
    }
}
async function charGen(actor,prompt){
const name = actor.name;
const ooba = "http://127.0.0.1:5000/v1/chat/completions";  
    var persona = {
        "description": "",
        "personality": "",
        "dialogue": ""
    }
    var history = [
        {"role": "system",
        "content": "You are an expert in creating interesting roleplay characters."
        },
        {"role": "user",
        "content": "Here is a brief overview of a character. Expand it into a detailed description. Include details about character's personality, their outfit and figure. Mention their age and gender, if applicable. "+name+" is a "+prompt+""
        }
    ]
    var data = {
        "messages": history,
        "mode": "instruct",
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 300
    };

descGen(data);

async function descGen(data){
    await $.ajax({
        url: ooba,
        type: "POST",
        headers: {"Content-Type": "application/json"},
        data: JSON.stringify(data),
        success: async function (response) {
            console.log(response);
             history.push({
            "role": "assistant",
            "content": response.choices[0].message.content
        });
        history.push({
            "role": "user",
            "content": "Write several personal qualities that characterize "+name+"."
        })
        persona.description = response.choices[0].message.content;
        data.messages = history;
        persGen(data);
        }
    });
    }

    async function persGen(data){
       await $.ajax({
            url: ooba,
            type: "POST",
            headers: {"Content-Type": "application/json"},
            data: JSON.stringify(data),
            success: async function (response) {
            persona.personality = response.choices[0].message.content;
            console.log(persona);
            history.push({
                "role": "assistant",
                "content": response.choices[0].message.content
            });
            history.push({
                "role": "user",
                "content": "Write a few example exchanges between User and "+name+" in chat format. Separate each exchange with a <START> tag. Include the detailed descriptions of actions that "+name+"'s would do within *"
            })
            }
        });
        data.messages = history;
        diaGen(data);
        }

        async function diaGen(data){
            console.log(data);
          await $.ajax({
                url: ooba,
                type: "POST",
                headers: {"Content-Type": "application/json"},
                data: JSON.stringify(data),
                success: async function (response) {
                persona.dialogue = response.choices[0].message.content;
                console.log(JSON.stringify(persona));
                history.push({
                    "role": "assistant",
                    "content": response.choices[0].message.content
                });
                await actor.setFlag('npc-ai', 'persona', persona);
                await actor.setFlag('npc-ai', 'memory', []);
                await actor.setFlag('npc-ai', 'charGenHistory', history);
                await actor.setFlag('npc-ai', 'longterm', []);
                }
            });
            }
}

async function charRegen(actor,prompt, memories){
    await unloadModel();
    await loadModel("TheBloke_OpenHermes-2.5-Mistral-7B-GPTQ", 8960);
    var memList = [];
  for (let i = 0; i < memories.length; i++) {
    const element = memories[i];
    var coreMem = "Core Memory"+i+":"+element+""
    memList.push(coreMem);
  }
    const name = actor.name;
    const ooba = "http://127.0.0.1:5000/v1/chat/completions";  
        var persona = {
            "description": "",
            "personality": "",
            "dialogue": ""
        }
        var history = [
            {"role": "system",
            "content": "You are an expert in creating interesting roleplay characters."
            },
            {"role": "user",
            "content": "Here is the original persona of a character named "+actor.name+": "+prompt+". Adjust this persona to include the evolution of the character and relationships that are included in these memories"+JSON.stringify(memList)+". Expanded upon the detail and include details about character's personality, their outfit and figure. Mention their age and gender, and new relationships if applicable." 
            }
        ]
        var data = {
            "messages": history,
            "mode": "instruct",
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 400
        };
    
    descRegen(data);
    
    async function descRegen(data){
        await $.ajax({
            url: ooba,
            type: "POST",
            headers: {"Content-Type": "application/json"},
            data: JSON.stringify(data),
            success: async function (response) {
                console.log(response);
                 history.push({
                "role": "assistant",
                "content": response.choices[0].message.content
            });
            history.push({
                "role": "user",
                "content": "Write several single word or short phrase personal qualities that characterize "+name+"."
            })
            persona.description = response.choices[0].message.content;
            data.messages = history;
            data.max_tokens = 200;
            await unloadModel();
            await loadModel("CharGen-v2-GGUF.Q4_K_M.gguf", 8960);
            persRegen(data);
            }
        });
        }
        async function persRegen(data){
           await $.ajax({
                url: ooba,
                type: "POST",
                headers: {"Content-Type": "application/json"},
                data: JSON.stringify(data),
                success: async function (response) {
                persona.personality = response.choices[0].message.content;
                console.log(persona);
                history.push({
                    "role": "assistant",
                    "content": response.choices[0].message.content
                });
                history.push({
                    "role": "user",
                    "content": "Write a few example exchanges between a character and "+name+" in chat format. Separate each exchange with a <START> tag. Include the detailed descriptions of actions that "+name+"'s would do within *"
                })
                }
            });
            data.max_tokens = 300;
            data.messages = history;
            diaRegen(data);
            }
    
            async function diaRegen(data){
                console.log(data);
              await $.ajax({
                    url: ooba,
                    type: "POST",
                    headers: {"Content-Type": "application/json"},
                    data: JSON.stringify(data),
                    success: async function (response) {
                    persona.dialogue = response.choices[0].message.content;
                    console.log(JSON.stringify(persona));
                    history.push({
                        "role": "assistant",
                        "content": response.choices[0].message.content
                    });
                    new Dialog({
                        title: "End Conversation?",
                        content: `<p><textarea name="prompt">`+JSON.stringify(persona)+`</textarea></p>`,
                        buttons: {
                          buttonA: {
                            label: "Implant",
                            callback: async (html) => { 
                               var persona2 = JSON.parse(html.find('[name="prompt"]').val());
                                console.log(persona2);
                                await actor.setFlag('npc-ai', 'persona', persona2);
                                await actor.setFlag('npc-ai', 'memory', []);
                                await actor.setFlag('npc-ai', 'charGenHistory', history);
                                await actor.setFlag('npc-ai', 'longterm', []);
                            }
                          },
                          buttonB: {
                            label: "Regenerate",
                            callback: async (html) => { 
                                await charRegen(actor,prompt, memories);
                            }
                          }
                        },
                        width: 80,
                        height: 360
                      }).render(true)
                    console.log(persona);
                    }
                });
                }
    }

export default CharGen
export {charGen,charRegen}
