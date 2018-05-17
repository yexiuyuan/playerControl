/**
 * Created by douxingxiang on 2017/6/6.
 */
class Log {
    constructor() {

    }

    // static set withConsole(v) {
    //     Log._withConsole = v;
    // }
    //
    // static get withConsole() {
    //     if(Log._withConsole === undefined) {
    //         Log._withConsole = false;
    //     }
    //     return Log._withConsole;
    // }

    /**
     * 追加日志
     * @param tag
     * @param msg
     */
    static append(tag, msg, level) {
        if(!level) level = Log.IMPORTANT;
        let t = tag;
        let m = msg;
        if(arguments.length < 2) {
            t = '';
            m = t;
        }
        if(Log.isSupport) {
            let date = new Date();
            let h = date.getHours();
            let m = date.getMinutes();
            let s = date.getSeconds();
            let ms = date.getMilliseconds();
            let line = `${Log.padzero(h, 2)}:${Log.padzero(m, 2)}:${Log.padzero(s, 2)}:${Log.padzero(ms, 3)}:[${t}] ==>${msg}\r\n`;
            if(Log.withConsole) {
                console.log(line);
            }
            if(level === Log.IMPORTANT) {
                let d = Log.data || "";
                d += line;
                if(d && d.length > Log.MAX_LENGTH) {
                    d = d.substr(d.length - Log.MAX_LENGTH);
                }
                sessionStorage.setItem(Log.KEY, d);
                Log.data = d;
            }
        }
    }

    /**
     * 重要内容，会记录在sessionStorage
     * @param tag
     * @param msg
     */
    static appendImportant(tag, msg) {
        Log.append(tag, msg, Log.IMPORTANT);
    }

    /**
     * 清理缓存
     */
    static clear() {
        if(Log.isSupport) {
            sessionStorage.removeItem(Log.KEY);
        }
    }

    /**
     * 获得所有缓存日志
     * @returns {string}
     */
    // static get data() {
    //     return Log.getData(Log.KEY);
    // }

    static getPlayerLog() {
        return Log.getData(Log.KEY);
    }

    static getChatLog() {
        return Log.getData(Log.CHAT_KEY);
    }

    static getData(key) {
        let data = "";
        if(Log.isSupport) {
            data = sessionStorage.getItem(key);
        }
        if(!data) data = "";
        return data;
    }

    // static get isSupport() {
    //     return "sessionStorage" in window;
    // }

    static padzero(num, len) {
        let str = '000' + num;
        return str.substr(str.toString().length - len);
    }
}
//keys
Log.KEY = "h5p_log";
Log.CHAT_KEY = "h5c_log";
Log.MAX_LENGTH = 20 * 1024;//20k
//levels
Log.IMPORTANT = "important";
Log.NORMAL = "normal";
//flag
Log.withConsole = false;//false;
Log.isSupport = "sessionStorage" in window;
Log.data = '';
// if(PlayerSDK) {//h5player里控制打出日志
//     Log.withConsole = PlayerSDK.env === PlayerSDK.DEBUG;
// }

export default Log;