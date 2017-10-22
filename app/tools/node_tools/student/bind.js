/*
* bind 返回一个修改过的新函数
* call 改变this指向,并执行
* apply 改变this指向,第二个参数只能传数组*/

var a = {
    a:"ok",
    f : function(a,b,c){
        console.log(this.a)
        console.log(a+b+c)
    }
}
var b = a.f
b()
b.call(a,1,3,532)

var c = {
    a :"this c",
    f :function(a,b){
        console.log(this.a)
        console.log(this === global)
    }
}
var d = c.f
d.call(null,324,"dfs")

var d = {
    a:"this d",
    f:function(a,b,c,d){
        console.log(this.a)
        console.log(a+b+c+d)
    }
}
var e = d.f
e.apply(d,[1,"fdssfds",3,4])
