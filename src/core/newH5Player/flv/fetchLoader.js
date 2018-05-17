/**
 * Created by douxingxiang on 2017/6/19.
 */
import Logger from "core/newH5Player/utils/logger";
import EventEmitter from "events";
import LoadEvent from "core/newH5Player/events/loadEvent"
/**
 * 加载器
 */
class FetchLoader
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler;
        this.connected = false;
        this.requestAbort = false;
        this.emitter = new EventEmitter();
    }

    destroy() {
        this.abort();
        this.dataHandler = null;
        this.emitter = null;
        this.reset();
    }

    addEventListener(cmd,listener)
    {
        this.emitter.addListener(cmd,listener);
    }

    removeEventListener(cmd,listener)
    {
        this.emitter.removeListener(cmd,listener);
    }

    reset() {
        this.connected = false;
    }


    pump(reader) {
        reader.read().then((resp) =>{
            if (resp.done) {
                Logger.log("Fetch result done");
                this.onclose();
            } else {
                if (this.requestAbort === true) {
                    Logger.log("Fetch cancel");
                    this.requestAbort = false;
                    return reader.cancel();
                }
                let data = resp.value.buffer;

                //收到数据，回传给onData
                if(this.dataHandler) {
                    this.dataHandler(data)
                }
                this.pump(reader);
            }
        }).catch((e) => {
            Logger.log("Fetch exception:" + e.message);
            this.onerror(e.message);
        });
    }

    connect(url) {
        window.fetch(url).then((resp) => {
            if(resp.ok && resp.status >= 200 && resp.status <= 299) {
                this.onopen();
                //读取流数据
                this.pump(resp.body.getReader());
            } else {
                this.onerror(resp.statusText);
                Logger.log("Fetch invalid status:" + e.status + " " + e.statusText);
            }
        }).catch((e) => {
            this.onerror(e.message);
            Logger.log("Fetch exception:" + e.message)
        })
    }

    abort() {
        this.requestAbort = true;
    }

    onopen() {
        Logger.log("Fetch.onopen");
        this.connected = true;
        this.emitter.emit(LoadEvent.OPEN);
    }

    onerror(e) {
        Logger.log("Fetch.onerror " + e);
        this.connected = false;
        this.emitter.emit(LoadEvent.ERROR,{error:e});
    }

    onclose() {
        Logger.log("Fetch.onclose");
        this.connected = false;
        this.emitter.emit(LoadEvent.CLOSE);
    }

    static isSupport()
    {
        return "fetch" in window && "ReadableStream" in window;
    }
}

export default FetchLoader;