/*
	熊@
	针对bootstrap
	name : ajaxxy
	ajaxxy.t(调用翻译事件)
	ajaxxy.submit(自动提交事件)
	@github.com
*/
(function(jQuery) {
    if (typeof jQuery === 'undefined' ) { throw new Error('ajax-xy request jQuery') } else { var $ = jQuery }
    $(document).ready(function() { $("form").find("button[type='submit']").bind("click",function() { ajaxxy_submit(this) }) });
    ajaxxy = function(f) {
        f = $(f).get(0);if (f) {return getPrimaryFn(f)} else {return getPrimaryFn(ajaxxy)}
    }
    function getPrimaryFn(e) {/*给初始属性*/
        if (e && e._ajaxxy == true) {return e}
        if (e) {
            e['_ajaxxy'] = true;
            e['submit'] = ajaxxy_submit;
            e['t'] = Translate;
            e['set'] = set;
            e['get'] = get;
            e['info'] = PrivateCreateInfo;
            e['isForm'] = isForm;
            return e;
        }
        return getPrimaryFn(ajaxxy);
    }
    function isForm(e, n) {
        if (!n) n = 6;
        if (n <= 0) {
            console.warn('-------------' + n + '个上级查找不到Form,取消提交-----------------');
            return false;
        }
        if ($(e).parent().get(0).tagName.toLowerCase() == 'form') {
            return $(e).parent();
        } else {
            n--;
            return isForm($(e).parent(), n);
        }
    }
    function get(d) {
        if (d) {
            console.log("-----------==get==-------------");
            console.log(this.primaryInterior);
        }
        if ( !this.primaryInterior ) {
            return createInterior(this);
        } else {
            return this.primaryInterior ;
        }
    }
    /*设置提交参数*/
    function set(a, b, c) {
        var help = !a || b || c || (typeof a == "object" && b);
        if (help) {
            console.log("------------ajaxxy设置帮助------------");
            createInterior(true);
        }
        var primaryInterior = createInterior(this);
        if (typeof a == "object" || a instanceof Object) {
            for (var p in a) {
                if (p in primaryInterior) {
                    primaryInterior[p] = a[p];
                }
            }
            this.primaryInterior = primaryInterior;
        } else {
            if (a && b) {
                if (a in this.primaryInterior) {
                    this.primaryInterior[a] = b;
                }
            }
        }
    }
    function D(a) {
        /*一个被调用的符加函数*/
        if (D._thisD === true) {
            var arg = Array.prototype.slice.call(arguments);
            arg.splice(0, 1);
            var t = "";
            for (var i = 0; i < arg.length; i++) {
                if (typeof arg[i] == "string") {
                    if (t) {
                        t += " --> " + arg[i];
                    } else {
                        t += arg[i];
                    }
                } else {
                    if (t) {
                        console.log(t);
                        t = "";
                    }
                    console.log(arg[i]);
                }
            }
        }
    }
    function is_edit(n) {
        /*根据class值判断该元素是否edit编辑器.*/
        /*如果class有包含数组中的值,则该元素为编辑器*/
        var j = { "editClass": ['wysiwyg-editor'] }
        if (n in j) { return j[n] }
        return [];
    }
    function createInterior(e) {
        var help = false,
            ele = ajaxxy;
        if (typeof e == "boolean") help = e;
        else if ( e ) ele = e;
        /*创建一个传入ajaxxy_submit的默认JSON,若在提交时对Submit传入的JSON会自动覆盖该JSON.之所有用外置函数,是因为该数组在其他函数也有调用*/
        var interior = {
            "functionName": {
                "value": false,
                "comment": "回调函数 -> 以window[functionName]()形式调用"
            },
            "callback": {
                "value": false,
                "comment": "回调执行函数"
            },
            "prefixback": {
                "value": null,
                "comment": "前置函数,在没有提交时执行."
            },
            "unique": {
                "value": [],
                "comment": "必须校验的input,即input不能为空值"
            },
            "abandon": {
                "value": false,
                "comment": "是否跳过所有的表单验证,优先级不如 unique"
            },
            "alert": {
                "value": true,
                "comment": "是否显示返回的警告信息"
            },
            "alertStyle": {
                "value": "info",
                "comment": "显示的警告信息的样式 warning | success | dismissable | danger"
            },
            "alertTo": {
                "value": "default",
                "comment": "警告内容的显示元素 #xxx | .xxx 字符串,由$ 获取"
            },
            "alertLocation": {
                "value": "before",
                "comment": "显示在元素的位置 before | after | self(内部)"
            },
            "alertMax": {
                "value": 1,
                "comment": "警告最多显示多少条"
            },
            "debug": {
                "value": false,
                "comment": "是否开启调试"
            },
            "callbackScroll": {
                "value": true,
                "comment": "执行完回调函数后scroll是否运动"
            },
            "scrollTop": {
                "value": "0px",
                "comment": "scroll运动到那个px"
            },
            "confirm": {
                "value": false,
                "comment": "提交时是否二次确认"
            },
            "confirmText": {
                "value": "",
                "comment": "提交时是否二次确认文字"
            },
            "jsonp": {
                "value": false,
                "comment": "是否跨域请求"
            },
            "jsoncallback": {
                "value": "jsoncallback",
                "comment": "跨域回调函数名"
            },
            "ajaxErrorCallback": {
                "value": null,
                "comment": "ajax错误回调函数"
            },
            "timeout": {
                "value": 2000,
                "comment": "Ajax超时时间"
            }
            /*,"form":{
                "value":"",
                "comment":"表单的值 如$("#from")"
            }*/
        };
        if (help) {
            var n = 0;
            for (var p in interior) {
                n++;
                console.log('(' + n + ') ' + p + ':' + interior[p].comment);
            }
        }
        if (!ele.primaryInterior) {
            var a = {}
            for (var p in interior) {
                a[p] = interior[p].value;
            }
            ele.primaryInterior = a;
        }
        return ele.primaryInterior;
    }
    function ajaxxy_submit(e, j, _event) {
        /*
            e:提交按钮button本身.会根据button自动父级递归,找到from表单
            j:提交的行为JSON 默认则createInterior() 生成
            _event:event事件,可不传入,只做预留
        */
        $(e).attr({
            "type": "button"
        });
        var f = isForm(e, 7);
        if (!f) {
            return;
        }
        var source_form_ele = $(f).get(0);
        var interior = source_form_ele.primaryInterior ? source_form_ele.primaryInterior: createInterior(f);
        if (!j) {
            j = {};
        }
        D._thisD = ("debug" in j) ? j["debug"] : interior['debug'];
        /*通过bind 返回一个修改过的函数*/
        for (var p in j) {
            interior[p] = j[p];
            /*内部值替换为传入值*/
            D(p);
            D(j[p]);
        }
        if (interior["confirm"]) {
            var confirmText = interior["confirmText"] ? interior["confirmText"] : '是否确认提交?';
            if (!confirm(confirmText)) {
                return false;
            }
        }
        if (typeof interior.prefixback == "function") {
            /*执行前置函数*/
            interior.prefixback();
        }
        D('-------from start--------');
        var form_ = $(f).get(0);
        interior['form'] = form_;
        /*报错时需要用到,默认在表单上面报错.*/
        var submit_ = true;
        var sendtype = $(form_).attr('method');
        if (!sendtype) {
            sendtype = "get";
        }
        sendtype = sendtype.toLowerCase();
        var pwd = '';
        var repwd = '';
        var repwdObj = null;
        var names_ = $(f).find('[name]').toArray().reverse();
        var getData = {};
        var lastEle = null;
        var editClass = is_edit('editClass'); //带有class值的 div为编辑器.
        D(form_);
        if (sendtype == 'post') {
            var form_up = new FormData();/*新建一个Form用于提交*/
            D('-------------打印From表单------------', form_up);
        }
        $(names_).each(function(a, b) {
            /*翻转为了正向提示*/
            if (interior.abandon !== true || InArr(interior.unique, $(b).attr('name'))) {
                if ($(b).attr('type') == 'password') {
                    if (pwd == '') {
                        pwd = $(b).val();
                    } else {
                        repwd = $(b).val();
                        repwdObj = b;
                    }
                }
                if ($(b).attr('type') != 'file') {
                    if (!$(b).val() || $(b).val().length < 1) {
                        $(b).focus();
                        lastEle = b;
                        submit_ = false;
                        /*console.log(b)*/
                    }
                }
            }
            var name_tmp = $(b).attr('name');
            D(name_tmp);
            if (InArr(editClass, $(b).attr('class'))) {
                /*自带的编辑器,不是读取val而是html()*/
                if (sendtype == 'post') {
                    form_up.append(name_tmp, $(b).html());
                }
                if (sendtype == 'get') {
                    getData[name_tmp] = $(b).html();
                }
            } else {
                var tmptype_input = $(b).attr('type');

                if (sendtype == 'post') {
                    D('---------post开始获取数据----------');
                    if (tmptype_input == 'file') {
                        D(name_tmp);
                        if ($(b)[0].files[0]) {
                            form_up.append(name_tmp, $(b)[0].files[0]);
                        }
                    } else {
                        /*------------加入对hceckbox的判断------------*/
                        switch (tmptype_input) {
                            case 'checkbox':
                                /*复选框取值方式不同*/
                                if ($(b).get(0).checked) {
                                    var v_tmp = $(b).val();
                                } else {
                                    var v_tmp = '';
                                }
                                D('---------提取checkbox值' + name_tmp + '--' + v_tmp + '--');
                                form_up.append(name_tmp, v_tmp);
                                break;
                            case 'radio':
                                /*复选框取值方式不同*/
                                var v_tmp = $("input:radio[name='" + name_tmp + "']:checked").val();
                                D('---------提取radio值' + name_tmp + '--' + v_tmp + '--');
                                form_up.append(name_tmp, v_tmp);
                                break;
                            default:
                                var v_tmp = $(b).val();
                                D('---------提取input值' + name_tmp + '--' + v_tmp + '--');
                                form_up.append(name_tmp, v_tmp);
                                break;
                        }
                        /*------------加入对hceckbox的判断------------*/
                    }
                }
                if (sendtype == 'get') {
                    /*------------加入对hceckbox的判断------------*/
                    D('---------get开始获取数据----------');
                    switch (tmptype_input) {
                        case 'checkbox':
                            /*复选框取值方式不同*/
                            if ($(b).get(0).checked) {
                                getData[name_tmp] = $(b).val();
                            } else {
                                getData[name_tmp] = '';
                            }
                            break;
                        case 'radio':
                            /*复选框取值方式不同*/
                            getData[name_tmp] = $("input:radio[name='" + name_tmp + "']:checked").val();
                            break;
                        default:
                            getData[name_tmp] = $(b).val();
                            break;
                    }
                }
            }
        });
        if (!submit_) {
            D('---------表单值需要验证,为空无法提交----------', lastEle);
            var name_ = $(lastEle).attr('name');
            var alert_ = $('[for=' + name_ + ']').html();
            if (alert_) {
                PrivateONECreateInfo('请先填写 : ' + alert_);
            } else {
                PrivateONECreateInfo('请先填写 : ' + name_);
            }
            return false;
        }
        if (repwd != '' && pwd != repwd) {
            D(pwd);
            D(repwd);
            $(repwdObj).focus();
            alert('---------两次密码不一样---------');
        } else {
            D('-------------From 表单名称-------------', form_);
            D('请求类型 : ' + sendtype);
            var url = $(form_).attr('action');
            if (!url) {
                throw new Error("ajaxxy : the form not action address");
            }
            D('请求url : ' + url);
            var ajaxOption = {
                async: false,
                url: url,
                type: sendtype,
                dataType: 'json',
                timeout: interior["timeout"] ? interior["timeout"] : 2500,
                success: function(data) {
                    D("Ajax请求结束", data);
                    CallBackFn(interior, data);
                },
                error: function(err) { //报错后自动处理
                    interior["ajaxErrorCallback"] ? interior["ajaxErrorCallback"](err) : (function() {
                        PrivateCreateInfo(err, 'danger');
                        console.log(err);
                    })();
                }
            };
            var submit_qeust = {};
            /*GET POST提交判断*/
            if (sendtype == "post") {
                ajaxOption["data"] = form_up;
                submit_qeust["up_data_name"] = "form_up";
                submit_qeust["data"] = form_up;
            } else {
                ajaxOption["data"] = getData;
                submit_qeust["up_data_name"] = "getData";
                submit_qeust["data"] = getData;
            }
            /*是否跨域判断*/
            if (interior['jsonp']) {
                ajaxOption["dataType"] = "jsonp";
                ajaxOption["jsonp"] = interior['jsoncallback'] ? interior['jsoncallback'] : "jsoncallback";
                submit_qeust["text"] = "*跨域*";
            } else {
                submit_qeust["text"] = "非跨域";
            }
            D('------------' + sendtype + '提交 [' + submit_qeust["text"] + '][提交数据:' + submit_qeust["up_data_name"] + ']-------------', submit_qeust["data"]);
            $.ajax(ajaxOption);
            return false;
        }
        function InArr(arr, str) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == str) {
                    return true;
                }
            }
            return false;
        }
        function IsEle(e, name, value, max, n) {
            /*查找元素的父级指定元素*/
            if (!n) {
                var n = 0;
            }
            if (max) {
                if (n > max) {
                    return false;
                }
            } else {
                var max = false;
                if (n > 6) {
                    return false;
                }
            }
            if ($(e).parent().attr(name) == value) {
                return $(e).parent();
            } else {
                n++;
                return IsEle($(e).parent(), name, value, max, n);
            }
        }
        /*-------------回调执行函数---------------*/
        function CallBackFn(interior, data) {
            try {
                D('-------------执行try-------------');
                var j = data;
                /*如果已经是直接返回JSON,则不用JSON.parse()*/
                if (typeof j == "object" || j instanceof Object) {
                } else {
                    j = JSON.parse(data);
                }
                D('-------------parseJSON结果-------------', j);
                var infotype = "";
                if ('type' in j) {
                    infotype = j["type"];
                }
                if ('info' in j) {
                    var alertHTML = j.info;
                } else {
                    var alertHTML = data;
                }
                if ('info' in j) {
                    if (typeof j.info == "object") {
                        GetJavaScriptCode(j.info, data, interior['debug']);
                    }
                }
                D('----------执行私有CreateInfo信息-----------', infotype);
                PrivateCreateInfo(alertHTML, infotype, interior);
                D('----------开始GETJavaScriptCode-----------', infotype);
                GetJavaScriptCode(j, data, interior['debug']);
                /*自动请求JAVASCRIPTCODE后台事件驱动*/
                D('-------------try完毕-------------');
            } catch(e) {
                console.log('-------------执行catch-------------', e);
                try {
                    data = eval("'" + data + "'");
                    data = unescape(data.replace(/\u/g, "%u"));
                } catch(er) {
                    console.log(er);
                }
                var html_ = '<i class="ace-icon fa fa-exclamation-triangle bigger-120"></i>' + data;
                PrivateCreateInfo(html_, 'warning', interior);
                D('-------------catch完毕-------------');
            }
            if (interior.functionName) {
                D('-------------通过window[name]执行回调-------------', data);
                window[interior.functionName](data);
            };
            if (interior.callback) {
                D('-------------通过callback执行回调-------------', data);
                interior.callback(data);
            };

        }
        /*-------------------------------------------------*/
        function PrivateONECreateInfo(text, infotype) {
            if (!infotype) {
                infotype = 'danger';
            }
            var text_ = '<i class="ace-icon fa ' + infotype + ' bigger-120"></i>' + text;
            PrivateCreateInfo(text_, infotype);
        }
        /*-------------------------------------------------*/
    }
    function PrivateCreateInfo(info_text, info_type, interior, from_element, debug) {
        if (debug) {
            console.log("----------======Info DeBug======---------");
            console.log(info_text);
            console.log(info_type);
            console.log(interior);
            console.log(from_element);
        }
        /*服务端返回样式 {'type':'warning','info':{'a':'b'}}*/
        if (!interior) {
            interior = $(from_element).get(0) ? $(from_element).get(0).primaryInterior: createInterior(ajaxxy);
        }
        interior.alertLocation = interior.alertLocation.replace(/\s/g, '').toLowerCase();
        /*info => fa-comment  | warning => fa-exclamation-triangle | success =>fa-check | dismissable(不理会) +> fa-info-circle | danger(危险) fa-times*/
        var icon = 'fa-times';
        if (!info_type) {
            info_type = 'danger';/*显示类型*/
        }
        var infoTitle = '错误 : ';
        switch (info_type) {
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
        D('-------------infotype1-------------', info_type);
        var alertHTML = '';
        if (typeof info_text == "object") {
            for (var p in info_text) {
                alertHTML += '<p>';
                alertHTML += '<strong>';
                alertHTML += '<i class="ace-icon fa ' + icon + '"></i>';
                alertHTML += p + ' ';
                alertHTML += '</strong>';
                alertHTML += info_text[p];
                alertHTML += '</p>';
            };
        } else {
            alertHTML += '<p>';
            alertHTML += '<strong>';
            alertHTML += '<i class="ace-icon fa ' + icon + '"></i>';
            alertHTML += '提示:';
            alertHTML += '</strong>';
            alertHTML += info_text;
            alertHTML += '</p>';
        }
        D(info_type);
        var after_html = '';
        after_html += '<div class="clearfix" data-alertinfo="true" >';
        after_html += '<div class="pull alert alert-' + info_type + '" ' + ((interior.alertLocation != 'before') ? 'style="margin-top: 10px;margin-bottom: 0px;"': '') + '>';
        after_html += '<button type="button" class="close" data-dismiss="alert">';
        after_html += '<i class="ace-icon fa fa-times"></i>';
        after_html += '</button>';
        after_html += alertHTML;
        after_html += '</div>';
        after_html += '</div>';
        D(after_html);
        /*得到显示的元素*/
        if (!from_element) {
            from_element = interior['form'];
        }
        /*得到显示的元素*/
        var alertTo = $(from_element);
        D(alertTo);
        if (interior.alertTo != 'default') {
            alertTo = $(interior.alertTo);
        }
        D(alertTo);
        var alerts = $('[data-alertinfo="true"]');
        D(alerts);
        if (alerts.length >= interior.alertMax) {
            D('--------移除多余警告---------');
            D(alerts.eq(0));
            alerts.eq(0).remove();
        }
        switch (interior.alertLocation) {
            case 'before':
                $(alertTo).before(after_html);
                break;
            case 'after':
                $(alertTo).after(after_html);
                break;
            case 'self':
                $(alertTo).html(after_html + $(alertTo).html());
                break;
        }
        if (interior.callbackScroll === true) {
            var ScrollTop = parseInt(interior.scrollTop);
            if (ScrollTop > $(document).height()) {
                interior.scrollTop = $(document).height();
            }
            $('html,body').animate({scrollTop: interior.scrollTop},300);
        }
    }
    function SetVale() {
        /*批量设置默认的值,该值在于元素的data-value上,由模版文件或后端给,该函数只是对select,radio,编辑器等进行设置.*/
        $('select').each(function(a, b) {
            var $v = $(b).attr('data-value');
            if ($v) {
                $(b).find("option[value='" + $v + "']").attr("selected", true);
            }
        });
        $('[type="radio"]').each(function(a, b) {
            $("input:radio[value='" + $(b).attr('data-value') + "']").attr('checked', 'true');
        });
    }
    function SaveRadio(nameName, v) {
        $('[name="' + nameName + '"]').each(function(a, b) {
            if ($(b).val() == v) {
                $(b).attr('checked', 'true');
            }
        });
    }
    function PrivateHTMLencode(str) {
        /*给HTML编码*/
        var s = "";
        if (str.length == 0) {
            return ""
        };
        s = str.replace(/&/g, "&amp;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/ /g, "&nbsp;");
        s = s.replace(/\'/g, "&#39;");
        s = s.replace(/\"/g, "&quot;");
        return s;
    }
    function PrivateHTMLdecode(str) {
        /*给HTML解码*/
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&amp;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        return s;
    }
    function AotuHeight(o) {
        /*textarea自适应高度*/
        o = $(o).get(0);
        o.style.height = o.scrollTop + o.scrollHeight + "px";
    }
    function Translate(q, fn, deb) {
        /*调用翻译事件*/
        var obj = {
            'from': 'zh',
            'to': 'en',
            'q': '',
            'key': 'dt'
        }
        if (q instanceof Object || typeof q == "object") {
            for (var a in q) {
                obj[a] = q[a];
            }
        } else {
            obj['q'] = q;
        }
        if (deb) {
            console.log(obj);
        }
        /*使用AJAX跨域来访问翻译*/
        $.ajax({
            type: 'get',
            url: 'http://api.ddweb.com.cn/index.php/Api/translate/act/translate',
            dataType: 'jsonp',
            jsonp: "JSON_Callback",
            data: obj,
            success: function(d) {
                if (deb) {
                    console.log(d);
                }
                try {
                    if (typeof d == "object" || d instanceof Object) {
                        var j = d;
                    } else {
                        var j = JSON.parse(d);
                    }
                    if (j.trans_result.dst) {
                        /*得到翻译结果*/
                        var dst = j.trans_result.dst.replace(/[^a-zA-Z0-9]/g, ' ');
                        dst = dst.replace(/\s+/, ' ');
                        var a = dst.split(' ');
                        var reStr = '';
                        var firstArr = [];
                        for (var i = 0; i < a.length; i++) {
                            if (a[i]) {
                                var first = a[i].substr(0, 1);
                                var last = a[i].slice(1);
                                first = first.toUpperCase();
                                firstArr.push(first);
                                var newStr = first + last;
                                newStr = newStr.replace(/\s/, '');
                                reStr += newStr;
                            }
                        }
                        if (reStr.length > 64) {
                            /*如果长度大于64位,只取前面的首字母+最后的结尾*/
                            reStr = firstArr.join('') + last;
                        }
                        if (reStr.length > 64) {
                            /*如果仍然大于64位,则只取前面的所有首字母*/
                            reStr = firstArr.join('');
                        }
                        if (reStr.length > 64) {
                            /*如果仍然大于64位,则强制截取*/
                            reStr = firstArr.join('');
                            reStr = reStr.substr(0, 64);
                        }
                        if (reStr.length > 1) {
                            var reStrFirst = reStr.substr(0, 1);
                            var reStrLast = reStr.substr(1);
                            reStrFirst = reStrFirst.toUpperCase();
                            reStrLast = reStrLast.toLowerCase();
                            reStr = reStrFirst + reStrLast;
                        }
                        if (deb) {
                            console.log(reStr);
                        }
                        if (fn) {
                            fn(reStr);
                        }
                    }
                } catch(e) {
                    console.log(e);
                    if (deb) {
                        console.log(reStr);
                    }
                    if (fn) {
                        fn(d);
                    }
                }
            },
            error: function() {
                console.log('翻译失败!');
            }
        });
    }
    function GetJavaScriptCode(j, data, bug) {
        D.D = bug;
        if (!data) {
            console.log(data);
            console.log('javascriptCode模块有错误,没有传入data');
        }
        /*自动请求后端JS事件驱动.*/
        var u = '/index.php/Api/Get/javascriptCode?id=';
        if (j instanceof Object) {
            if ('javascriptCode' in j) {
                $.get(u + j.javascriptCode,
                    function(code) {
                        D('-------------javascriptCode-------------', code);
                        code = code.replace(/\#data\#/, data);
                        D('-------------javascriptCode-------------', code);
                        eval(code);
                    })
            } else {
                if ('info' in j) {
                    j = j.info;
                    if (j instanceof Object) {
                        GetJavaScriptCode(j, bug);
                    }
                }
            }
        }
    }
})(jQuery);