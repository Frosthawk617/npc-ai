class ImgGen{
    constructor(actor) {
      this.actor = actor;
    }
}



async function portraitGen(actor){
var sd = "http://127.0.0.1:7861/sdapi/v1/txt2img"
var checkPointApi = "http://127.0.0.1:7861/sdapi/reload-checkpoint"
var ooba = "http://127.0.0.1:5000/v1/chat/completions"
await unloadSD()
await loadOoba()
var base = [{
    "role": "user",
    "content": "[In the next response I want you to provide only a detailed comma-delimited list of keywords and phrases which describe {{char}}. The list must include all of the following items in this order: name, species and race, gender, age, clothing, occupation, physical features and appearances. Do not include descriptions of non-visual qualities such as personality, movements, scents, mental traits, or anything which could not be seen in a still photograph. Do not write in full sentences. Include a facial expression. Prefix your description with the phrase 'portrait,']"}]; 
var persona = await actor.getFlag("npc-ai", "persona");
var speaker = await ChatMessage.getSpeaker({actor});
var data = {
    "messages": 
base,
    "mode": "chat-instruct",
    "temperature": 0.7,
    "top_p": 0.9,
    "context": JSON.stringify(persona)
};

await $.ajax({
    url: ooba,
    type: "POST",
    headers: {"Content-Type": "application/json"},
    data: JSON.stringify(data),
    success: async function (response) {
  ChatMessage.create({"content": ``+response.choices[0].message.content+``, "speaker": speaker})
  var prefix = "score_9_up, score_8_up, score_7_up, score_6_up, score_5_up, score_4_up, BREAK source_anime,"
   var suffix  = "good eyes, detailed face"
   var negative_prompt = "child, bad eyes, bad face,"
   var sampler = "DDIM"
  var prompt = JSON.stringify({
    "prompt": prefix+response.choices[0].message.content+suffix,
    "negative_prompt": negative_prompt,
    "sampler_name": sampler,
    "batch_size": 1,
    "width": 576,
    "height": 1024
});
await reloadCheckpoint();
await reqImage(prompt,actor);
}
});

}


async function reqImage(prompt,actor){
unloadOoba();
var sd = "http://127.0.0.1:7861/sdapi/v1/txt2img"
var checkPointApi = "http://127.0.0.1:7861/sdapi/reload-checkpoint"
var ooba = "http://127.0.0.1:5000/v1/chat/completions"
    await $.ajax({
        url: sd,
        type: "POST",
        headers: {"Content-Type": "application/json"},
        data: prompt,
        success: async function (response) {
            console.log(response.images[0]);
            var image = "data:image/jpg;base64,"+response.images[0];
            console.log(image);
            var test = await ImageHelper.uploadBase64(image,actor.name+".jpg",`modules/npc-ai/outputs`)
            console.log(test.path);
await actor.update({"img": test.path})
await actor.update({"_source.img": test.path})
await actor.update({"_source.prototypeToken.texture.src": test.path})
unloadSD();
     loadOoba()
        }
    });

}

async function unloadOoba(){
    await $.ajax({
        url: "http://127.0.0.1:5000/v1/internal/model/unload",
        type: "POST",
        headers: {"Content-Type": "application/json"},
        success: async function (response) {
            console.log("Unloaded Text Model");
        }
    });
}

async function unloadSD(){
    await $.ajax({
        url: "http://127.0.0.1:7861/sdapi/v1/unload-checkpoint",
        type: "POST",
        headers: {"Content-Type": "application/json"},
        success: async function (response) {
            console.log("Unloaded Text Model");
        }
    });
}

async function loadOoba(){
    var data = JSON.stringify({
        "model_name": "TheBloke_OpenHermes-2.5-Mistral-7B-GPTQ",
        "args":{
            "max_seq_len": 8960
        }
    })
    await $.ajax({
        url: "http://127.0.0.1:5000/v1/internal/model/load",
        type: "POST",
        headers: {"Content-Type": "application/json"},
        data: data,
        success: async function (response) {
            console.log("Loaded Text Model");
        }
    });
}

async function reloadCheckpoint(){
    await $.ajax({
        url: "http://127.0.0.1:7861/sdapi/v1/unload-checkpoint",
        type: "POST",
        headers: {"Content-Type": "application/json"},
        success: async function (response) {
            console.log("Reloaded IMG Mod");
        }
    });
}




export default ImgGen
export {portraitGen}