/**
 * Created by douxingxiang on 2017/6/19.
 */

function round2(str) {
    str = '00' + str;
    return str.substr(str.length - 2, 2);
}

function round3(str) {
    str = '000' + str;
    return str.substr(str.length - 3, 3);
}

function getPrefix() {
    let d = new Date();
    return `h5 ${round2(d.getHours())}:${round2(d.getMinutes())}:${d.getSeconds()}.${round3(d.getMilliseconds())}:`;
}

let Logger = {
    _data: [],
    _length: 0,
    _visible: false,

    debug: function(str) {
        if(Logger.level <= Logger.DEBUG) {
            str = getPrefix() + str
            Logger.record(str, 'debug');
            console.debug(str);
        }
    },

    log: function(str) {
        return;
        if(Logger.level <= Logger.LOG) {
            str = getPrefix() + str
            Logger.record(str, 'log');
            console.log(str);
        }
    },

    info: function(str) {
        return;
        if(Logger.level <= Logger.INFO) {
            str = getPrefix() + str
            Logger.record(str, 'info');
            console.info(str);
        }
    },

    warn: function(str) {
        return;
        if(Logger.level <= Logger.WARN) {
            str = getPrefix() + str
            Logger.record(str, 'warn');
            console.warn(str);
        }
    },

    error: function(str) {
        return;
        if(Logger.level <= Logger.ERROR) {
            str = getPrefix() + str
            Logger.record(str, 'error');
            console.error(str);
        }
    },

    record: function(str, level) {
        return;
        if(Logger._length === Logger.MAX_LENGTH + 100) {
            Logger._data.splice(0, 100);
            Logger._length = Logger.MAX_LENGTH;
        }
        Logger._length++;
        Logger._data.push(`${str} [${level}]`);
        if(Logger._visible) {
            let elem = document.getElementById("__h5playerLogWin");
            elem.value += `${str}\r\n`;
            elem.scrollTop = 10000;
        }
    },

    setLevel: function(level) {
        return;
        console.log(`${getPrefix()}set level from ${Logger.level} to ${level}`);
        Logger.level = level;
    },

    getLog: function() {
        return Logger._data
    },

    setLogVisible: function(visible) {
        Logger._visible = visible;
        let elem = document.getElementById("__h5playerLogWin");
        if (visible) {
            if(!elem) {
                elem = document.createElement("textarea")
                elem.id = "__h5playerLogWin",
                elem.style.display = "block",
                elem.style.position = "absolute",
                elem.style.top = "0",
                elem.style.width = "500px",
                elem.style.height = "300px",
                document.body.appendChild(elem);
            }

            let output = '';
            for(let msg of Logger._data) {
                output += `${msg}\r\n`;
            }
            elem.value = output;
            elem.scrollTop = 10000;
        } else {
            if(elem) {
                elem.style.display = "none";
            }
        }
    }

};

Logger.DEBUG = -1;
Logger.LOG = 0;
Logger.INFO = 1;
Logger.WARN = 2;
Logger.ERROR = 3;
Logger.level = Logger.DEBUG;
Logger.MAX_LENGTH = 1000;

window._h5playerLogger = Logger;

export default Logger;