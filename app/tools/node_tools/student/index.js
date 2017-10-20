/*
* 事件,订阅发布*/
function Person(name){
    this.name = name
    this._events = [];
}
Person.prototype.on = function(name,callback){
    if(this._events[name]){
        this._events[name].push(callback)
    }else{
        this._events[name] = [callback]
    }
}
Person.prototype.emit = function(name){
    var args = Array.prototype.slice.call(arguments,0)
    var _this = this
    args.forEach(function(event_name){
        var callbacks = _this._events[event_name]

        callbacks.forEach(function(callback){
            callback.apply(this,args)
        })
    })

}
var P = new Person()
P.on("event",function a(){
    this.name = "event This A"
    console.log(this.name)
})
P.on("event",function b(){
    this.name = "event This B"
    console.log(this.name)
})
P.on("event2",function c(){
    this.name = "event This 2"
    console.log(this.name)
})
P.on("event3",function d(){
    this.name = "event This 3"
    console.log(this.name)
})
P.emit("event","event2","event3")
return;
const EventEmitter = require("events");

function Bell(name){
    this.name = name
    console.log(name)
}
const util = require("util") // utility
util.inherits(Bell,EventEmitter) //继承
var B = new Bell();
/*
* B.on
* B.emit
* B.addListener
* B.removeListener
* B.removeAllListeners
* process.cwd()
* */