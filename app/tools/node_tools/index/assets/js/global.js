function MyAjax(active,data,fn,method,url){
	if(!url){
		url = "http://127.0.0.1:54222"
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
			if(fn){
				fn(json);
			}
		},
		error:function(e){
			
		}
	});
}