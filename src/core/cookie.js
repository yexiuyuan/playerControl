/**
 * Created by zhouqi@qiyi.com on 16/7/6.
 */
let setCookie = (name,value,path='/',domain='.pps.tv',days = 365) =>{

    var exp = new Date();
    exp.setTime(exp.getTime() + days*24*60*60*1000);
    document.cookie = name + "="+ value + (path && (";path="+ path) || '') +";domain="+domain+";expires=" + exp.toGMTString();

};
let getCookie = name =>{
    var obj = {};
    var pairs = document.cookie.split(/ *; */);
    var pair;
    if ('' == pairs[0]) return '';
    for (var i = 0; i < pairs.length; ++i) {
        pair = pairs[i].split('=');
        let value = "";
        try {
            value = decodeURIComponent(pair[1]);
        } catch(err) {}
        obj[decodeURIComponent(pair[0])] = value;
    }
    return obj[name]||'';


};

export {setCookie,getCookie};
