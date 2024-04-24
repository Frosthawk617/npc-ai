async function main(){
const target = game.user.targets.first().actor;
const transplanter = canvas.tokens.controlled[0].actor;

var persona = await transplanter.getFlag('npc-ai', 'persona');
var memory = await transplanter.getFlag('npc-ai', 'memory');
var chargen = await transplanter.getFlag('npc-ai', 'charGenHistory');
var longterm = await transplanter.getFlag('npc-ai', 'longterm');
var portrait = actor.img;
var token = actor.prototypeToken.texture.src;

await target.setFlag('npc-ai', 'persona', persona);
await target.setFlag('npc-ai', 'memory', memory);
await target.setFlag('npc-ai', 'charGenHistory', chargen);
await target.setFlag('npc-ai', 'longterm', longterm);
await target.update({"img": portrait});
await target.update({"prototypeToken.texture.src": token});
};
main();