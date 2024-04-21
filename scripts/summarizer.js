class Summarizer{
    constructor(actor) {
      this.actor = actor;
    }
}
async function summarize(actor){
var shortMemory = await actor.getFlag("npc-ai","memory");
var message = {"role": "user", "content": "Summarize this conversation. Ensure all important details are retained. Focus on character names, interactions and general actions."}
console.log(shortMemory);
let people = ["\nUser:", "\nuser:", "\n", "\nUndefined:", "\nundefined:"]
shortMemory.push(message);
    var data = {
        "messages": shortMemory,
        "mode": "instruct",
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 300,
        "min_tokens": 100,
        "stopping_strings": people
    };

    const ooba = "http://127.0.0.1:5000/v1/chat/completions";  
    await $.ajax({
        url: ooba,
        type: "POST",
        headers: {"Content-Type": "application/json"},
        data: JSON.stringify(data),
        success: async function (response) {
            console.log(response.choices[0].message.content);
            var newLong = response.choices[0].message.content
    var past = await actor.getFlag("npc-ai","longterm");
    past.push(newLong)
            await actor.setFlag('npc-ai', 'longterm', past);
        }
    });

}

async function summarizeCombat(actor, allies, enemies, healthObj){
    console.log(allies,enemies);
    var shortMemory = await actor.getFlag("npc-ai","attackHistory");
    var message = {"role": "user", "content": "Summarize this entire combat sequence. Ensure all important details are retained. Focusing on "+actor.name+" and her allies("+allies+") fighting against ("+enemies+"). Include interactions and general actions."+actor.name+" ended combat with this much health: "+healthObj.value+"/"+healthObj.max+" Always suffix the summary with a general condition of "+actor.name+". If combat ends with "+actor.name+"'s health at or below 0 she is unconscious."}
    console.log(message);
    let people = ["\nUser:", "\nuser:", "\n", "\nUndefined:", "\nundefined:"]
    shortMemory.push(message);
        var data = {
            "messages": shortMemory,
            "mode": "instruct",
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 150,
            "min_tokens": 50,
            "stop": people
        };
    
        const ooba = "http://127.0.0.1:5000/v1/chat/completions";  
        await $.ajax({
            url: ooba,
            type: "POST",
            headers: {"Content-Type": "application/json"},
            data: JSON.stringify(data),
            success: async function (response) {
                console.log(response.choices[0].message.content);
                var newLong = response.choices[0].message
        var past = await actor.getFlag("npc-ai","longterm");
                await actor.setFlag('npc-ai', 'longterm', past);
                new Dialog({
                    title: "Combat Memory Editor:"+actor.name+"",
                    content: `<p><textarea name="prompt">`+JSON.stringify(newLong.content)+`</textarea></p>`,
                    buttons: {
                      buttonA: {
                        label: "Implant",
                        callback: async (html) => { 
                           var newLong2 = JSON.parse(html.find('[name="prompt"]').val());
                            newLong.content = newLong2;
                            past.push(newLong)
                            await actor.setFlag('npc-ai', 'attackHistory', []);
                        }
                      },
                      buttonB: {
                        label: "Regenerate",
                        callback: async (html) => { 
                            await summarizeCombat(actor, allies, enemies, healthObj);
                        }
                      }
                    },
                    width: 80,
                    height: 360
                  }).render(true)
            }
        });
    
    }


export default Summarizer
export {summarize,summarizeCombat}