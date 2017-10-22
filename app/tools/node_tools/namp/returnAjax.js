/*
* 以ajax跨域返回*/
const url = require('url')
exports.returnAjax = function(req,res,r,jsoncallback){
    if(!jsoncallback){
        jsoncallback = 'jsoncallback'
    }
    var query = url.parse(req.url,true).query
    var typeofR = typeof r;
    switch(typeofR){
        case 'object':
            r = JSON.stringify(r);
            break;
        case 'string':
            r = r.replace(/\"/,'\\"');
            r = `"${r}"`;
            break;
    }
    if(jsoncallback in query){
        r = `${query.jsoncallback}(${r})`
    }
    res.end(r);
}