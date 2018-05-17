/**
 * Created by douxingxiang on 2017/6/19.
 */
import Logger from "core/newH5Player/utils/logger";
import TimeUtil from "core/newH5Player/utils/timeUtil";
import FetchLoader from "core/newH5Player/flv/fetchLoader";
import MozChunkLoader from "core/newH5Player/flv/mozChunkLoader";
import EventEmitter from "events";
import LoadEvent from "core/newH5Player/events/loadEvent"

/**
 * 连接管理
 * 连接检测，重连，连接事件监听
 */
class LoaderControl
{
    constructor(liveM)
    {
        // this.liveM = liveM;
        this.eventHandler ={
            onOpenHandler:this.onopen.bind(this),
            onErrorHandler:this.onerror.bind(this),
            onCloseHandler:this.onclose.bind(this)
        };
        this.loader = this.getLoader();
        this.addLoaderEvent();
        this.url = null;
        this.started = false;
        this.lastGetProxyTime = 0;
        this.getProxyPeriod = LoaderControl.DEFAULT_GET_PROXY_PERIOD;

        this.emitter = new EventEmitter();
    }

    destroy() {
        this.reset();
        this.started = false;
        Logger.log("LoaderControl destroy");
    }

    getLoader() {
        if(FetchLoader.isSupport()) {
            return new FetchLoader(this.onData.bind(this));
        }
        return new MozChunkLoader(this.onData.bind(this));
    }

    connect(url)
    {
        if(url)
        {
            this.reset();
            this.lastGetProxyTime = TimeUtil.now() - 2000;
            this.url = url;
            //开始连接
            this.loader.connect(this.url);
            this.started = true;
        }
        else
        {
            Logger.warn("LoaderControl.connect url is null");
        }
    }

    addEventListener(cmd,listener)
    {
        this.emitter.addListener(cmd,listener);
    }

    removeEventListener(cmd,listener)
    {
        this.emitter.removeListener(cmd,listener);
    }

    addLoaderEvent()
    {
        if(this.loader)
        {
            this.loader.addEventListener(LoadEvent.OPEN,this.eventHandler.onOpenHandler);
            this.loader.addEventListener(LoadEvent.CLOSE,this.eventHandler.onCloseHandler);
            this.loader.addEventListener(LoadEvent.ERROR,this.eventHandler.onErrorHandler);
        }
    }

    removeLoaderEvent()
    {
        if(this.loader)
        {
            this.loader.removeEventListener(LoadEvent.OPEN,this.eventHandler.onOpenHandler);
            this.loader.removeEventListener(LoadEvent.CLOSE,this.eventHandler.onCloseHandler);
            this.loader.removeEventListener(LoadEvent.ERROR,this.eventHandler.onErrorHandler);
        }
    }
    //重置 - 重新加载
    reset() {
        if(this.started){
            Logger.log("LoaderControl reset");
            this.removeLoaderEvent();
            this.loader.destroy();
            this.loader = this.getLoader();
            this.addLoaderEvent();
            this.url = null;
            this.lastGetProxyTime = 0;
        }
    }

    onopen() {
        Logger.log("LoaderControl onopen");
        this.getProxyPeriod = LoaderControl.DEFAULT_GET_PROXY_PERIOD;
        this.emitter.emit(LoadEvent.OPEN);
        // this.liveM.onConnected();
    }

    onclose() {
        Logger.log("LoaderControl onclose");
        this.emitter.emit(LoadEvent.CLOSE);
        // this.liveM.onClosed();
        this.getProxy();
    }

    onerror(e) {
        Logger.log("LoaderControl onerror: " + e);
        this.emitter.emit(LoadEvent.ERROR,e);
        // this.liveM.onClosed();
        this.getProxy();
    }

    onData(data) {
        this.emitter.emit(LoadEvent.DATA_ARRIVAL,data);
        // this.liveM.onDataArrival(data);
    }

    onCheckTimer() {
        this.started && this.onCheckConnect();
    }

    isConnected() {
        return this.loader && this.loader.connected
    }

    onCheckConnect() {
        this.isConnected() || this.getProxy();
    }

    getProxy() {
        var nowTime = TimeUtil.now();
        if ((nowTime - this.lastGetProxyTime) >= this.getProxyPeriod)
        {
            Logger.log("LoaderControl lastGetProxyTime=" + this.lastGetProxyTime + " now=" + nowTime+ " period=" + this.getProxyPeriod);
            let period = Math.min(2 * this.getProxyPeriod, 128000);
            this.reset();
            this.lastGetProxyTime = nowTime;
            this.getProxyPeriod = period;
        }
    }

    static isSupport() {
        return FetchLoader.isSupport() || MozChunkLoader.isSupport();
    }
}

LoaderControl.DEFAULT_GET_PROXY_PERIOD = 4000;

export default LoaderControl;