var command_once_split = "   aad  ".replace(/^\s*|\s*$/g,"").replace(/\s{2,}/g," ").split(" ");;
var command_once = command_once_split.splice(0,1)[0];
console.log(command_once);
console.log(command_once_split);