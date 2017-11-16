var fn_global = require("./namp/fn_global.js")

fn_global.server_is_run("FileZilla Server",function(is){
    console.log(is);
})
fn_global.is_server("FileZilla Server",function(is){
    console.log(is);
});