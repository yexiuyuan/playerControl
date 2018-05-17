/*=============================================================================
#
# Copyright (C) 2016 All rights reserved.
#
# Author:	Larry Wang
#
# Created:	2016-02-26 13:57
#
# Description:
#
=============================================================================*/

'use strict';

// import { qos } from './jsQOS';
import Promise from 'promise-polyfill';
// window.onerror = function(errMsg, src, lineNumber, colNumber, err) {
//     qos.push(1, {
//         ct: {
//             error: errMsg,
//             lineNumber: lineNumber,
//             src: src
//         }
//     })
// };
const C = class {
    constructor(obj) {
        if (!obj)
            this.obj = document.createDocumentFragment();
        else if (typeof(obj) == 'string')
            this.obj = obj === 'html'?document.documentElement:document.querySelector(obj);
        else this.obj = obj;
    }

    addClass(className) {
        if (className)
            className.trim().split(/\s+/).forEach(c =>
                this.obj.classList.add(c)
            );
        return this;
    }

    removeClass(className) {
        if (className)
            className.trim().split(/\s+/).forEach(c =>
                this.obj.classList.remove(c)
            );
        return this;
    }

    hasClass(className) {
        if (!this.obj || !className) return false;
        return this.obj.classList.contains(className);
    }

    css(key, value) {
        if (value != undefined) {
            this.obj.style[key] = value;
        } else if (typeof(key) === 'object') {
            for (let k in key) this.css(k, key[k]);
        } else {
            return this.obj.style[key];
        }
        return this;
    }

    html(html) {
        if (!arguments.length) return this.obj.innerHTML;
        else this.obj.innerHTML = html;
        return this;
    }

    text(text) {
        if (!arguments.length) return this.obj.textContent || this.obj.innerText;
        else if ('textContent' in this.obj) this.obj.textContent = text || '';
        else if ('innerText' in this.obj) this.obj.innerText = text || '';
        return this;
    }

    val(value) {
        if(!arguments.length) return this.obj.value;
        else this.obj.value = value||'';
        return this;
    }

    remove() {
        this.obj && this.obj.parentNode && this.obj.parentNode.removeChild(this.obj);
        return this;
    }

    empty() {
        while (this.obj.firstChild)
            this.obj.removeChild(this.obj.firstChild);
        return this;
    }

    appendTo(parentNode) {
        $(parentNode).obj.appendChild(this.obj);
        return this;
    }

    append(childNode, isFirst) {
        if (isFirst) this.obj.insertBefore($(childNode).obj, this.obj.firstChild);
        else this.obj.appendChild($(childNode).obj);
        return this;
    }

    on(type, listener, capture) {
        this.obj && type.trim().split(/\s+/).forEach(t =>
            this.obj.addEventListener(t, listener, capture)
        );
        return this;
    }

    off(type, listener) {
        this.obj && this.obj.removeEventListener(type, listener);
        return this;
    }

    attr(attribute, value) {
        if (!this.obj) return this;
        if(value === undefined) return this.obj.getAttribute(attribute)
        else this.obj.setAttribute(attribute, value)
        return this
    }
    removeAttr(attribute) {
        this.obj.removeAttribute(attribute)
        return this
    }
}

export function $(obj) {
    if (obj && obj.__proto__ == C.prototype)
        return obj;
    return new C(obj);
}

(['STYLE', 'LINK', 'A', 'UL', 'OL', 'LI', 'DIV', 'STRONG', 'LABEL', 'SPAN',
    'FORM', 'IMG', 'BR', 'P', 'FONT', 'TABLE', 'TD', 'TH', 'TBODY', 'THEAD',
    'TFOOT', 'CAPTION', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SELECT',
    'OPTION', 'OPTGROUP', 'B', 'I', 'U', 'TEXTAREA', 'DD', 'DL', 'DT',
    'PRE', 'HR', 'BUTTON', 'HEADER', 'SECTION', 'INPUT', 'VIDEO', 'AUDIO',
    'EM', 'CANVAS', 'IFRAME', 'TIME', 'SMALL'
]).forEach(o => {
    C.prototype[o] = function(className) {
        let ret = $(document.createElement(o)).addClass(className);
        ret.parent = this;
        this.append(ret);
        return ret;
    };
});

if (!window.Promise) {
    window.Promise = Promise;
}

if (!Object.assign) {
    Object.assign = (..._) => {
        var ret;
        _.forEach(s => {
            if (ret == undefined) ret = s;
            else
                for (let key in s) ret[key] = s[key];
        });
        return ret;
    };
}

const $http = ({method='GET', url='', params={}
    , checkStatus = true,isCache=true} = {}) =>
    new Promise((resolve, reject) => {
        let p = [];
        if(isCache){
            params.r = Math.random();
        }

        for (var key in params) {
            const value = params[key];
            if (value instanceof Array) {
                key += '[]';
                value.forEach(v => p.push(`${key}=${encodeURIComponent(v)}`));
            } else {
                p.push(`${key}=${encodeURIComponent(value)}`);
            }
        }
        p = p.join('&')
        let xhr = new XMLHttpRequest();
        if(method === 'GET') {
            xhr.open(method, `${url}?${p}`);
        } else {
            xhr.open(method, url);
            xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded"); 
        }
        
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4 )return;
            if (!checkStatus || xhr.status == 200)
                resolve({status: xhr.status, data: JSON.parse(xhr.responseText || '{}')});
            if (xhr.status != 200) {
                // qos.push(2, {
                //     curl: url,
                //     sc: xhr.status,
                //     ct: {params:params}
                // });
            }
        };
        xhr.send(method === 'GET' ? null : p);
    });

const jsonp = ((i=0)=>{

    return ({url='',params={}}) => new Promise((resolve, reject) => {
        let pamFormat = [],
            _script = document.createElement('script'),
            cb = 'xjsonp'+ ++i;
        params['_'] = new Date().getTime();
        for(var k  in params) {

            if(Object.prototype.toString.apply(params[k]).toString().toLowerCase() !== '[object function]'){
                pamFormat.push(k+'='+params[k]);
            }

        }

        window[cb] = resolve;

        url = url +'?'+pamFormat.join('&')+'&callback=?';
        _script.src = url.replace(/\?(.+)=\?/, "?$1=" + cb);
        _script.onload = () =>{
            window[cb] = void 0;
			document.head.removeChild(_script);
        };
		_script.onerror = e =>{
			resolve(e);
			window[cb] = void 0;
			document.head.removeChild(_script);

            qos.push(2, {
                curl: url,
                sc: 0
            });


		};
        document.head.appendChild(_script);




    });



})();


$http.get = (url, params,isCache=true) => $http({url, params,isCache}).then(({data}) => data);
$http.post = (url, params) => $http({method: 'POST', url, params}).then(({data}) => data);
$http.jsonp = (url, params) => jsonp({url,params});
export {$http};
