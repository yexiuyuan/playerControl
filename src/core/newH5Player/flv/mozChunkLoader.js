/**
 * Created by douxingxiang on 2018/3/6.
 */
import Logger from "core/newH5Player/utils/logger";
import EventEmitter from "events";
import LoadEvent from "core/newH5Player/events/loadEvent"

class MozChunkLoader
{
    constructor(dataHandler) {
        this.dataHandler = dataHandler;
        this.connected = false;
        this.requestAbort = false;
        this.emitter = new EventEmitter();

        this._xhr = null;
    }

    destroy() {
        this.abort();
        this.dataHandler = null;
        this.emitter = null;
        this.reset();
    }

    addEventListener(cmd,listener) {
        this.emitter.addListener(cmd,listener);
    }

    removeEventListener(cmd,listener) {
        this.emitter.removeListener(cmd,listener);
    }

    reset() {
        this.connected = false;
    }

    abort() {
        this.requestAbort = true;
        if (this._xhr) {
            this._xhr.abort();
        }
    }

    connect(url) {
        if(!this._xhr) {
            this._xhr = new XMLHttpRequest();
        }

        this._xhr.open('GET', url, true);
        this._xhr.responseType = "moz-chunked-arraybuffer";
        if(!this.e) {
            this.e = {
                onprogress: this.onprogress.bind(this),
                onloadend: this.onloadend.bind(this),
                onreadystatechange: this.onreadystatechange.bind(this),
                onerror:  this.onerror.bind(this)
            };
            this._xhr.onprogress = this.e.onprogress;
            this._xhr.onloadend = this.e.onloadend;
            this._xhr.onreadystatechange = this.e.onreadystatechange;
            this._xhr.onerror = this.e.onerror;
        }
        this._xhr.send();
    }

    onprogress(e) {
        let chunk = this._xhr.response;
        if(this.dataHandler) {
            this.dataHandler(chunk);
        }
    }

    onloadend(e) {
        Logger.log("MozChunkLoader result done");
        this.onclose();
    }

    onclose(e) {
        Logger.log("MozChunkLoader.onclose");
        this.connected = false;
        this.emitter.emit(LoadEvent.CLOSE);
    }

    onreadystatechange(e) {
        if(this._xhr.readyState === 2) {
            if(this._xhr.status % 100 === 2) {
                this.onopen();
            } else {
                this.onclose(this._xhr.statusText);
                Logger.log("MozChunkLoader invalid status:" + e.status + " " + e.statusText);
            }
        }
    }

    onerror(e) {
        Logger.log("MozChunkLoader.onerror " + e);
        this.connected = false;
        this.emitter.emit(LoadEvent.ERROR,{error:e});
    }

    onopen() {
        Logger.log("MozChunkLoader.onopen");
        this.connected = true;
        this.emitter.emit(LoadEvent.OPEN);
    }

    static isSupport() {
        let xhr = new XMLHttpRequest();
        try {
            xhr.open("GET", "https://example.domain");
            xhr.responseType = "moz-chunked-arraybuffer";
            return (xhr.responseType === 'moz-chunked-arraybuffer')
        } catch(e) {
            return false;
        }
    }
}

export default MozChunkLoader;