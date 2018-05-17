/**
 * Created by douxingxiang on 2017/8/30.
 */
class Loader {
    static loadScript(url, callback) {
        Loader.load('js', url, callback);
    }

    static loadStyle(url, callback) {
        Loader.load('css', url, callback);
    }

    static load(type, url, callback) {
        let doc = document;
        let head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement;
        let scriptElem;
        if(type === 'js') {
            scriptElem = doc.createElement('script');
            scriptElem.src = url;
        } else {
            scriptElem = doc.createElement('link');
            scriptElem.setAttribute('type' ,"text/css");
            scriptElem.setAttribute('rel',"stylesheet");
            scriptElem.href = url;
        }

        let loadFunc = () => {
            if(type === 'js') head.removeChild(scriptElem);
            callback && callback();
        };

        if('onload' in scriptElem) {
            scriptElem.onload = loadFunc;
        } else {
            scriptElem.onreadystatechange = () => {
                if (/loaded|complete/.test(scriptElem.readyState)) {
                    loadFunc.call(scriptElem);
                }
            };
        }

        head.appendChild(scriptElem);
    }
}

export default Loader;