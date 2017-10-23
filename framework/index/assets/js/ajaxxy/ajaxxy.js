/*
	熊@
	针对bootstrap
	name : ajaxxy
	ajaxxy.t(调用翻译事件)
	ajaxxy.submit(自动提交事件)
	@github.com
*/

(function(){
    if (typeof jQuery === 'undefined') { throw new Error('ajax-xy request jQuery') }

    jQuery(document).ready(function(){
        jQuery("form").find("button[type='submit']").bind("click",function(){
            auto_submit(this);
        });
    })

    ajaxxy = {
        "submit":auto_submit,
        "t":Translate,
        "set":set,
        "get":get,
        "info":PrivateCreateInfo
    }
    var primaryInterior = {};
    function get(){
        var r = primaryInterior
        if(r == {}){
            r = createInterior();
        }
        console.log("-----------==get==-------------")
        console.log(r)
    }
    /*输入调试*/
    var _debug = null;
    /*设置提交参数*/
    function set(a,b,c){
        var help =  !a || b =="help" || c || (typeof a == "object" && b) ;
        if(help){
            console.log("------------ajaxxy设置帮助------------")
            var help_set = createInterior(true);
            var i = 0;
            for(var p in help_set){
                ++i;
                console.log("("+i+") :" +p+" => "+help_set[p]);
            }
            console.log("--------------------------------------")

        }
        if(typeof a == "object" ||a instanceof Object){
            primaryInterior = createInterior();
            for(var p in a){
                if(p in primaryInterior){
                    primaryInterior[p] = a[p];
                }
            }
        }else{
            if(a && b){
                if(a in primaryInterior){
                    primaryInterior[a] = b;
                }
            }
        }
        if(help){
            console.log(primaryInterior);
        }
    }
    function echoError(power,a){
        /*一个被调用的符加函数*/
        if(power === true){
            var arg = Array.prototype.slice.call(arguments);
            arg.splice(0,1);
            var t = "";
            for(var i =0;i<arg.length;i++){
                if(typeof arg[i] == "string"){
                    if(t){
                        t += " --> "+arg[i];
                    }else{
                        t += arg[i];
                    }

                }else{
                    if(t){
                        console.log(t);
                        t="";
                    }
                    console.log(arg[i]);

                }
            }
            console.log(t);
        }
    }
    function is_edit(name){
        /*根据class值判断该元素是否edit编辑器.*/
        /*如果class有包含数组中的值,则该元素为编辑器*/
        var j = {
            "editClass":['wysiwyg-editor']
        }
        if(name in j){
            return j[name];
        }
        return [];
    }

    function createInterior(help){
        /*创建一个传入auto_submit的默认JSON,若在提交时对Submit传入的JSON会自动覆盖该JSON.之所有用外置函数,是因为该数组在其他函数也有调用*/
        var interior={
            "functionName":{
                "value":false,
                "comment":"回调函数 -> 以window[functionName]()形式调用"
            },
            "callback":{
                "value":false,
                "comment":"回调执行函数"
            },
            "prefixback":{
                "value":null,
                "comment":"前置函数,在没有提交时执行."
            },
            "unique":{
                "value":[],
                "comment":"必须校验的input,即input不能为空值"
            },
            "abandon":{
                "value":false,
                "comment":"是否跳过所有的表单验证,优先级不如 unique"
            },
            "alert":{
                "value":true,
                "comment":"是否显示返回的警告信息"
            },
            "alertStyle":{
                "value":"info",
                "comment":"显示的警告信息的样式 warning | success | dismissable | danger"
            },
            "alertTo":{
                "value":"default",
                "comment":"警告内容的显示元素 #xxx | .xxx 字符串,由JQUERY 获取"
            },
            "alertLocation":{
                "value":"before",
                "comment":"显示在元素的位置 before | after | self(内部)"
            },
            "alertMax":{
                "value":1,
                "comment":"警告最多显示多少条"
            },
            "debug":{
                "value":false,
                "comment":"是否开启调试"
            },
            "callbackScroll":{
                "value":true,
                "comment":"执行完回调函数后scroll是否运动"
            },
            "scrollTop":{
                "value":"0px",
                "comment":"scroll运动到那个px"
            },
            "confirm":{
                "value":false,
                "comment":"提交时是否二次确认"
            },
            "confirmText":{
                "value":"",
                "comment":"提交时是否二次确认文字"
            },
            "jsonp":{
                "value":false,
                "comment":"是否跨域请求"
            },
            "jsoncallback":{
                "value":"jsoncallback",
                "comment":"跨域回调函数名"
            },
            "ajaxErrorCallback":{
                "value":null,
                "comment":"ajax错误回调函数"
            },
            "timeout":{
                "value":2000,
                "comment":"Ajax超时时间"
            }
            /*
            ,"form":{
                "value":"",
                "comment":"表单的值 如jQuery("#from")"
            }*/
        };
        var a = {}
        if(!help){
            for(var p in interior){
                a[p] = interior[p].value;
            }
        }else{
            for(var p in interior){
                a[p] = interior[p].comment;
            }
        }
        return a;
    }
    function auto_submit(e,j,ev_){
        /*
            e:提交按钮button本身.会根据button自动父级递归,找到from表单
            j:提交的行为JSON 默认则createInterior() 生成
            ev_:event事件,可不传入,只做预留
        */
        $(e).attr({
            "type":"button"
        });

        if(!j){
            var j={};
        }
        var interior= primaryInterior ? primaryInterior : createInterior();
        /*通过bind 返回一个修改过的函数*/
        _debug = echoError.bind(this,interior['debug']);
        for(var p in j){
            interior[p] = j[p];/*内部值替换为传入值*/
            _debug(p);
            _debug(j[p]);
        }
        if(interior["confirm"]){
            var confirmText = interior["confirmText"] ? interior["confirmText"] : '是否确认提交?';
            if(!confirm(confirmText)){
                return false;
            }
        }
        if(typeof interior.prefixback == "function"){
            /*执行前置函数*/
            interior.prefixback();
        }
        _debug('-------from start--------');

        var f=IsForm(e);
        if(!f){
            _debug('-------------5个上级查找不到Form,取消提交-----------------');
            return;
        }
        var form_ = jQuery(f).get(0);
        interior['form'] = form_;/*报错时需要用到,默认在表单上面报错.*/
        var submit_ = true;
        var sendtype = jQuery(form_).attr('method');
        if(!sendtype){
            sendtype ="get";
        }
        sendtype = sendtype.toLowerCase()
        var pwd='';
        var repwd='';
        var repwdObj = null;
        var names_ = jQuery(f).find('[name]').toArray().reverse();
        var getData={};
        var lastEle = null;
        var editClass = is_edit('editClass');//带有class值的 div为编辑器.
        _debug(form_);
        if(sendtype == 'post'){
            var form_up = new FormData();/*新建一个Form用于提交*/
            _debug('-------------打印From表单------------',form_up);
        }
        jQuery(names_).each(function(a,b){/*翻转为了正向提示*/
            if(interior.abandon !== true || InArr(interior.unique,jQuery(b).attr('name')) ){
                if(jQuery(b).attr('type') == 'password'){
                    if(pwd== '' ){
                        pwd = jQuery(b).val();
                    } else {
                        repwd = jQuery(b).val();
                        repwdObj = b;
                    }
                }
                if(jQuery(b).attr('type') != 'file'){
                    if( !jQuery(b).val() || jQuery(b).val().length < 1){
                        jQuery(b).focus();
                        lastEle = b;
                        submit_ = false;
                        /*console.log(b)*/
                    }
                }
            }
            var name_tmp = jQuery(b).attr('name');
            _debug(name_tmp);
            if(InArr(editClass,jQuery(b).attr('class'))){
                /*自带的编辑器,不是读取val而是html()*/
                if(sendtype == 'post'){
                    form_up.append(name_tmp, jQuery(b).html());
                }
                if(sendtype == 'get'){
                    getData[name_tmp] = jQuery(b).html();
                }
            }else{
                var tmptype_input = jQuery(b).attr('type');

                if(sendtype == 'post'){
                    _debug('---------post开始获取数据----------');
                    if( tmptype_input == 'file' ){
                        _debug(name_tmp);
                        if(jQuery(b)[0].files[0]){
                            form_up.append(name_tmp, jQuery(b)[0].files[0]);
                        }
                    }else{
                        /*------------加入对hceckbox的判断------------*/
                        switch(tmptype_input){
                            case 'checkbox':/*复选框取值方式不同*/
                                if (jQuery(b).get(0).checked) {
                                    var v_tmp = jQuery(b).val();
                                }else{
                                    var v_tmp = '';
                                }
                                _debug('---------提取checkbox值'+name_tmp+'--'+v_tmp+'--');
                                form_up.append(name_tmp, v_tmp);
                                break;
                            case 'radio':/*复选框取值方式不同*/
                                var v_tmp = jQuery("input:radio[name='"+name_tmp+"']:checked").val();
                                _debug('---------提取radio值'+name_tmp+'--'+v_tmp+'--');
                                form_up.append(name_tmp, v_tmp);
                                break;
                            default:
                                var v_tmp = jQuery(b).val();
                                _debug('---------提取input值'+name_tmp+'--'+v_tmp+'--');
                                form_up.append(name_tmp, v_tmp);
                                break;
                        }
                        /*------------加入对hceckbox的判断------------*/
                    }
                }
                if(sendtype == 'get'){
                    /*------------加入对hceckbox的判断------------*/
                    _debug('---------get开始获取数据----------');
                    switch(tmptype_input){
                        case 'checkbox':/*复选框取值方式不同*/
                            if (jQuery(b).get(0).checked) {
                                getData[name_tmp] = jQuery(b).val();
                            }else{
                                getData[name_tmp] = '';
                            }
                            break;
                        case 'radio':/*复选框取值方式不同*/
                            getData[name_tmp] = jQuery("input:radio[name='"+name_tmp+"']:checked").val();
                            break;
                        default:
                            getData[name_tmp] = jQuery(b).val();
                            break;
                    }

                }
            }
        });
        if(!submit_){
            _debug('---------表单值需要验证,为空无法提交----------',lastEle);
            var name_ = jQuery(lastEle).attr('name');
            var alert_ = jQuery('[for='+name_+']').html();
            if(alert_){
                PrivateONECreateInfo('请先填写 : '+alert_);
            }else{
                PrivateONECreateInfo('请先填写 : '+name_);
            }
            return false;
        }
        if(repwd != '' && pwd != repwd){
            _debug(pwd);
            _debug(repwd);
            jQuery(repwdObj).focus();
            alert('---------两次密码不一样---------');
        }else{
            _debug('-------------From 表单名称-------------',form_);
            _debug('请求类型 : '+sendtype);
            var url = jQuery(form_).attr('action');
            if(!url){
                throw new Error("ajaxxy : the form not action address");
            }
            _debug('请求url : '+url);
            var ajaxOption = {
                async:false,
                url: url,
                type: sendtype,
                dataType: 'json',
                timeout: interior["timeout"] ? interior["timeout"] : 2500,
                success: function (data){
                    _debug("Ajax请求结束",data);
                    CallBackFn(interior,data);
                },
                error:function(err){
                    if(interior["ajaxErrorCallback"]){
                        console.log(err);
                        interior["ajaxErrorCallback"](err);
                    }
                }
            };
            var submit_qeust = {};
            /*GET POST提交判断*/
            if(sendtype == "post"){
                ajaxOption["data"] =  form_up;
                submit_qeust["up_data_name"] = "form_up";
                submit_qeust["data"] = form_up;
            }else{
                ajaxOption["data"] =  getData;
                submit_qeust["up_data_name"] = "getData";
                submit_qeust["data"] = getData;
            }
            /*是否跨域判断*/
            if( interior['jsonp'] ){
                ajaxOption["dataType"] = "jsonp";
                ajaxOption["jsonp"] = interior['jsoncallback'] ? interior['jsoncallback'] : "jsoncallback";
                submit_qeust["text"] = "*跨域*";
            }else{
                submit_qeust["text"] = "非跨域";

            }
            _debug('------------'+sendtype+'提交 ['+submit_qeust["text"]+'][提交数据:'+submit_qeust["up_data_name"]+']-------------',submit_qeust["data"]);


            $.ajax(ajaxOption);
            return false;
        }


        function InArr(arr,str){
            for(var i=0; i < arr.length;i++) {
                if (arr[i] == str) {
                    return true;
                }
            }
            return false;
        }
        function IsForm(e,n){
            if(!n){
                var n = 6;
            }
            if(n < 0){
                return false;
            }
            if( jQuery(e).parent().get(0).tagName.toLowerCase() == 'form' ){
                return jQuery(e).parent();
            }else{
                n--;
                return IsForm(jQuery(e).parent(),n);
            }
        }


        function IsEle(e,name,value,max,n){
            /*查找元素的父级指定元素*/
            if(!n){
                var n = 0;
            }
            if(max){
                if(n > max){
                    return false;
                }
            }else{
                var max = false;
                if(n > 6){
                    return false;
                }
            }
            if( jQuery(e).parent().attr(name) == value ){
                return jQuery(e).parent();
            }else{
                n++;
                return IsEle(jQuery(e).parent(),name,value,max,n);
            }
        }
        /*-------------回调执行函数---------------*/
        function CallBackFn(interior,data){
            try{
                _debug('-------------执行try-------------');
                var j = data;/*如果已经是直接返回JSON,则不用JSON.parse()*/
                if(typeof j == "Object" || j instanceof Object){

                }else{
                    j = JSON.parse(data);
                }
                _debug('-------------parseJSON结果-------------',j);
                var infotype = "";
                if('type' in j){
                    infotype = j["type"];
                }
                if('info' in j){
                    var alertHTML =j.info;
                }else{
                    var alertHTML =data;
                }

                if('info' in j){
                    if(typeof j.info == "object"){
                        GetJavaScriptCode(j.info,data,interior['debug']);
                    }
                }
                _debug('----------执行私有CreateInfo信息-----------',infotype);
                PrivateCreateInfo(alertHTML,infotype,interior);
                _debug('----------开始GETJavaScriptCode-----------',infotype);
                GetJavaScriptCode(j,data,interior['debug']);/*自动请求JAVASCRIPTCODE后台事件驱动*/
                _debug('-------------try完毕-------------');
            }catch(e){
                console.log('-------------执行catch-------------',e);
                try{
                    data = eval("'" + data + "'");
                    data = unescape(data.replace(/\u/g, "%u"));
                }catch(er){
                    console.log(er);
                }
                var html_ = '<i class="ace-icon fa fa-exclamation-triangle bigger-120"></i>'+data;
                PrivateCreateInfo(html_,'warning',interior);
                _debug('-------------catch完毕-------------');
            }


            if(interior.functionName){
                _debug('-------------通过window[name]执行回调-------------',data);
                window[interior.functionName](data);
            };
            if(interior.callback){
                _debug('-------------通过callback执行回调-------------',data);
                interior.callback(data);
            };

        }
        /*-------------------------------------------------*/
        function PrivateONECreateInfo(text,infotype){
            if(!infotype){
                infotype = 'danger';
            }
            var text_ = '<i class="ace-icon fa '+infotype+' bigger-120"></i>'+text;
            PrivateCreateInfo(text_,infotype);
        }
        /*-------------------------------------------------*/
    }

    function PrivateCreateInfo(info_text,info_type,interior,from_element,debug){
        if(debug){
            console.log("----------======Info DeBug======---------");
            console.log(info_text);
            console.log(info_type);
            console.log(interior);
            console.log(from_element);
        }
        /*服务端返回样式
            {
            'type':'warning',
            'info':{
                'a':'b',
                }
            }
        */
        if(!interior){
            interior= primaryInterior ? primaryInterior : createInterior();
        }
        interior.alertLocation = interior.alertLocation.replace(/\s/g,'').toLowerCase();
        /*info => fa-comment  | warning => fa-exclamation-triangle | success =>fa-check | dismissable(不理会) +> fa-info-circle | danger(危险) fa-times*/
        var icon = 'fa-times';
        if(!info_type){
            info_type = 'danger';/*显示类型*/
        }
        var infoTitle = '错误 : ';
        switch(info_type){
            case 'info':
                infoTitle = '信息 : ';
                icon = 'fa-comment';
                break;
            case 'success':
                infoTitle = '成功 : ';
                icon = 'fa-check';
                break;
            case 'dismissable':
                infoTitle = '提示 : ';
                icon = 'fa-info-circle';
                break;
            case 'warning':
                infoTitle = '警告 : ';
                icon = 'fa-exclamation-triangle';
                break;
        }
        _debug('-------------infotype1-------------',info_type);

        var alertHTML = '';
        if(typeof info_text == "object"){
            for(var p in info_text){
                alertHTML +='<p>';
                alertHTML +='<strong>';
                alertHTML +='<i class="ace-icon fa '+icon+'"></i>';
                alertHTML +=p+' ';
                alertHTML +='</strong>';
                alertHTML +=info_text[p];
                alertHTML +='</p>';
            };
        }else{
            alertHTML +='<p>';
            alertHTML +='<strong>';
            alertHTML +='<i class="ace-icon fa '+icon+'"></i>';
            alertHTML +='提示:';
            alertHTML +='</strong>';
            alertHTML +=info_text;
            alertHTML +='</p>';
        }
        _debug(info_type);
        var after_html = '';
        after_html += '<div class="clearfix" data-alertinfo="true" >';
        after_html += '<div class="pull alert alert-'+info_type+'" '+( (interior.alertLocation != 'before') ? 'style="margin-top: 10px;margin-bottom: 0px;"' : '' )+'>';
        after_html += '<button type="button" class="close" data-dismiss="alert">';
        after_html += '<i class="ace-icon fa fa-times"></i>';
        after_html += '</button>';
        after_html += alertHTML;
        after_html += '</div>';
        after_html += '</div>';
        _debug(after_html);
        /*得到显示的元素*/
        if(!from_element){
            from_element = interior['form'];
        }
        /*得到显示的元素*/
        var alertTo = jQuery(from_element);
        _debug(alertTo);

        if(interior.alertTo != 'default'){
            alertTo = jQuery(interior.alertTo);
        }
        _debug(alertTo);
        var alerts = jQuery('[data-alertinfo="true"]');

        echoError(interior,alerts);
        if(alerts.length >= interior.alertMax){
            _debug('--------移除多余警告---------');
            _debug(alerts.eq(0));
            alerts.eq(0).remove();
        }
        switch( interior.alertLocation ){
            case 'before':
                jQuery(alertTo).before(after_html);
                break;
            case 'after':
                jQuery(alertTo).after(after_html);
                break;
            case 'self':
                jQuery(alertTo).html(after_html+jQuery(alertTo).html());
                break;
        }
        if(interior.callbackScroll === true){
            var ScrollTop = parseInt(interior.scrollTop);
            if(ScrollTop > jQuery(document).height()){
                interior.scrollTop = jQuery(document).height();
            }
            jQuery('html,body').animate({scrollTop: interior.scrollTop}, 300);
        }
    }

    function SetVale(){
        /*批量设置默认的值,该值在于元素的data-value上,由模版文件或后端给,该函数只是对select,radio,编辑器等进行设置.*/
        jQuery('select').each(function(a,b){
            var $v= jQuery(b).attr('data-value');
            if($v){
                jQuery(b).find("option[value='"+$v+"']").attr("selected",true);
            }
        });
        jQuery('[type="radio"]').each(function(a,b){
            jQuery("input:radio[value='"+jQuery(b).attr('data-value')+"']").attr('checked','true');
        });
    }

    function SaveRadio(nameName,v){
        jQuery('[name="'+nameName+'"]').each(function(a,b){
            if(jQuery(b).val() == v){
                jQuery(b).attr('checked','true');
            }
        });
    }

    function PrivateHTMLencode(str){
        /*给HTML编码*/
        var s = "";
        if(str.length == 0){
            return ""
        };
        s = str.replace(/&/g,"&amp;");
        s = s.replace(/</g,"&lt;");
        s = s.replace(/>/g,"&gt;");
        s = s.replace(/ /g,"&nbsp;");
        s = s.replace(/\'/g,"&#39;");
        s = s.replace(/\"/g,"&quot;");
        return s;
    }
    function PrivateHTMLdecode(str){
        /*给HTML解码*/
        var s = "";
        if(str.length == 0) return "";
        s = str.replace(/&amp;/g,"&");
        s = s.replace(/&lt;/g,"<");
        s = s.replace(/&gt;/g,">");
        s = s.replace(/&nbsp;/g," ");
        s = s.replace(/&#39;/g,"\'");
        s = s.replace(/&quot;/g,"\"");
        return s;
    }

    function AotuHeight(o) {
        /*textarea自适应高度*/
        o = jQuery(o).get(0);
        o.style.height = o.scrollTop + o.scrollHeight + "px";
    }


    function Translate(q,fn,deb){
        /*调用翻译事件*/
        var obj={
            'from':'zh',
            'to':'en',
            'q':'',
            'key':'dt'
        }
        if(q instanceof Object || typeof q == "Object"){
            for(var a in q){
                obj[a] = q[a];
            }
        }else{
            obj['q'] = q;
        }
        if(deb){
            console.log(obj);
        }
        /*使用AJAX跨域来访问翻译*/
        $.ajax(
            {
                type:'get',
                url : 'http://api.ddweb.com.cn/index.php/Api/translate/act/translate',
                dataType : 'jsonp',
                jsonp:"JSON_Callback",
                data:obj,
                success:function(d) {
                    if(deb){
                        console.log(d);
                    }
                    try{
                        if(typeof d == "Object" || d instanceof Object){
                            var j = d;
                        }else{
                            var j = JSON.parse(d);
                        }
                        if(j.trans_result.dst){
                            /*得到翻译结果*/
                            var dst=j.trans_result.dst.replace(/[^a-zA-Z0-9]/g,' ');
                            dst = dst.replace(/\s+/,' ');
                            var a = dst.split(' ');
                            var reStr = '';
                            var firstArr = [];
                            for(var i=0;i<a.length;i++){
                                if(a[i]){
                                    var first = a[i].substr(0,1);
                                    var last = a[i].slice(1);
                                    first = first.toUpperCase();
                                    firstArr.push(first);
                                    var newStr = first+last;
                                    newStr = newStr.replace(/\s/,'');
                                    reStr += newStr;
                                }
                            }
                            if(reStr.length > 64){/*如果长度大于64位,只取前面的首字母+最后的结尾*/
                                reStr = firstArr.join('')+last;
                            }
                            if(reStr.length > 64){/*如果仍然大于64位,则只取前面的所有首字母*/
                                reStr = firstArr.join('');
                            }
                            if(reStr.length > 64){/*如果仍然大于64位,则强制截取*/
                                reStr = firstArr.join('');
                                reStr = reStr.substr(0,64);
                            }
                            if(reStr.length > 1){
                                var reStrFirst = reStr.substr(0,1);
                                var reStrLast = reStr.substr(1);
                                reStrFirst = reStrFirst.toUpperCase();
                                reStrLast = reStrLast.toLowerCase();
                                reStr = reStrFirst + reStrLast;
                            }
                            if(deb){
                                console.log(reStr);
                            }
                            if(fn){
                                fn(reStr);
                            }
                        }
                    }catch(e){
                        console.log(e);
                        if(deb){
                            console.log(reStr);
                        }
                        if(fn){
                            fn(d);
                        }
                    }
                },
                error : function() {
                    console.log('翻译失败!');
                }
            }
        );
    }
    function GetJavaScriptCode(j,data,bug){
        if(!data){
            console.log(data);
            console.log('javascriptCode模块有错误,没有传入data');
        }
        /*自动请求后端JS事件驱动.*/
        var u = '/index.php/Api/Get/javascriptCode?id=';
        if(j instanceof Object){
            if('javascriptCode' in j){
                $.get(u+j.javascriptCode,function(code){
                    echoError(bug,'-------------javascriptCode-------------',code);
                    code = code.replace(/\#data\#/,data);
                    echoError(bug,'-------------javascriptCode-------------',code);
                    eval(code);
                })
            }else{
                if('info' in j){
                    j = j.info;
                    if(j instanceof Object){
                        GetJavaScriptCode(j,bug);
                    }
                }
            }
        }
    }

})();


