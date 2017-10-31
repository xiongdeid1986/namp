/*简单ajax提交工具*/
function EasyAjax(active,data,fn,method,url){
	this.url = "";
	if(!url){
		url = this.url ? this.url : "http://127.0.0.1:54222";
	}else{
		url = url.replace(/\/$/g,"")
	}
	if(!data){
		data = {}
	}
	if(data && typeof data == 'function'){
		if(method){
			url = method
		}
		if(fn){
			method = fn
		}
		fn = data;
	}
	if(!method){
		method = "GET"
	}
	$.ajax({
		async:false,
		url: url+"/"+active,
		type: method,
		dataType: 'jsonp',
		jsonp: 'jsoncallback',
		data: data,
		timeout: 200,
		success: function (json){
			if(!json){
				console.log(json)
			}
			try{
                json = JSON.parse(json)
			}catch(e){
				console.log(e);
			}
			if(fn instanceof Function){
				fn(json);
				return;
			}
            if(fn instanceof String){
                return;
                window[fn](json);
            }
		},
		error:function(e){
			
		}
	});
}