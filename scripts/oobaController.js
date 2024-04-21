class OobaController{
    constructor(model) {
      this.model = model;
    }
}

async function loadModel(model,seq_length){
    var data = JSON.stringify({
        "model_name": model,
        "args":{
            "max_seq_len": seq_length
        }
    })
    await $.ajax({
        url: "http://127.0.0.1:5000/v1/internal/model/load",
        type: "POST",
        headers: {"Content-Type": "application/json"},
        data: data,
        success: async function (response) {
            console.log("Loaded: "+model+" Seq_Length: "+seq_length+"");
        }
    });
}

async function unloadModel(){
    await $.ajax({
        url: "http://127.0.0.1:5000/v1/internal/model/unload",
        type: "POST",
        headers: {"Content-Type": "application/json"},
        success: async function (response) {
            console.log("Unloaded Text Model");
        }
    });
}



export default OobaController
export {loadModel,unloadModel}