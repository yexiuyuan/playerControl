import Logger from "core/newH5Player/utils/logger";
import EventEmitter from "events";
import LiveManager from "core/newH5Player/liveManager.js";
import LoadEvent from "core/newH5Player/events/loadEvent";
import TransformEvent from "core/newH5Player/events/transformEvent";
/**
 * 9
 * 播放器入口
 */
class H5Player
{
    constructor(mediaDataSource, video)
    {
        this.version = 1;
        this.mediaDataSource = mediaDataSource;
        this.emiiter = new EventEmitter();
        this.videoElement = video;
        this.retryCount = 0;
        this.retryMax = 3;
        this.retryTime = 0;
        console.log("new H5 player");
        this.EventHandler = {
            onVideoStalled:this.onVideoStalled.bind(this),
            onVideoPlay:this.onVideoPlay.bind(this),
            onVideoWaiting:this.onVideoWaiting.bind(this),
            onVideoError:this.onVideoErrorHandler.bind(this),
            onLoaderError:this.onLoaderError.bind(this),
            onAppendBufferError:this.onAppendBufferErrorHandler.bind(this),
            onSourceBufferUpdateError:this.onSourceBufferUpdateErrorHandler.bind(this),
            onFetchClose:this.onFetchCloseHandler.bind(this),
            onMediaSourceEnded:this.sourceEndHandler.bind(this)
        };

        this.addVideoEvent();
        this.liveM = new LiveManager(this,video);

        this.liveM.addEventListener(LoadEvent.CLOSE,this.EventHandler.onFetchClose);
        this.liveM.addEventListener(LoadEvent.ERROR,this.EventHandler.onLoaderError);
        this.liveM.addEventListener(TransformEvent.SB_END,this.EventHandler.onMediaSourceEnded);
        this.liveM.addEventListener(TransformEvent.SBAPPEND_ERROR,this.EventHandler.onAppendBufferError);
        this.liveM.addEventListener(TransformEvent.SB_ERROR,this.EventHandler.onSourceBufferUpdateError);
        Logger.warn("sdk version => " + this.version);
        Logger.warn("userAgent=" + navigator.userAgent);

        this.setFlvConfig(1,4000);
    }

    destroy()
    {
        if(this.liveM)
        {
            this.liveM.removeEventListener(LoadEvent.CLOSE,this.EventHandler.onFetchClose);
            this.liveM.removeEventListener(LoadEvent.ERROR,this.EventHandler.onLoaderError);
            this.liveM.removeEventListener(TransformEvent.SB_END,this.EventHandler.onMediaSourceEnded);
            this.liveM.removeEventListener(TransformEvent.SBAPPEND_ERROR,this.EventHandler.onAppendBufferError);
            this.liveM.removeEventListener("SourceBufferUpdateError",this.EventHandler.onSourceBufferUpdateError);
            this.liveM.destroy();
            this.liveM = null;
        }
        this.removeVideoEvent();
    }

    retryLoad()
    {
        if(this.retryCount < this.retryMax)
        {
            if(this.retryTime == 0)
            {
               this.retryTime = setTimeout(()=>{

                   this.retryTime = 0;
                   this.liveM.stopFlv();
                   this.liveM.reset();
                   this.removeVideoEvent();
                   this.addVideoEvent();
                   this.load();
                },3000);
            }
        }
        else
        {
            this.emiiter.emit("player_event_streamerror");
        }
    }

    //页面切出去后暂停
    tablePause()
    {
        if(this.videoElement)
        {
            this.videoElement.pause();
        }
        if(this.liveM)
        {
            this.liveM.removeEventListener(LoadEvent.CLOSE,this.EventHandler.onFetchClose);
            this.liveM.removeEventListener(LoadEvent.ERROR,this.EventHandler.onLoaderError);
            this.liveM.removeEventListener(TransformEvent.SB_END,this.EventHandler.onMediaSourceEnded);
            this.liveM.removeEventListener(TransformEvent.SBAPPEND_ERROR,this.EventHandler.onAppendBufferError);
            this.liveM.removeEventListener("SourceBufferUpdateError",this.EventHandler.onSourceBufferUpdateError);
            this.liveM.pause();
        }
        this.removeVideoEvent();
    }

    attachMediaElement(value,value2)
    {

    }

    //TODO:需要移除事件监听
    addVideoEvent()
    {
        this.videoElement.addEventListener("play",this.EventHandler.onVideoPlay);
        this.videoElement.addEventListener("stalled",this.EventHandler.onVideoStalled);
        this.videoElement.addEventListener("waiting",this.EventHandler.onVideoWaiting);
        this.videoElement.addEventListener("error",this.EventHandler.onVideoError);
    }

    removeVideoEvent()
    {
        if(this.videoElement)
        {
            this.videoElement.removeEventListener("play",this.EventHandler.onVideoPlay);
            this.videoElement.removeEventListener("stalled",this.EventHandler.onVideoStalled);
            this.videoElement.removeEventListener("waiting",this.EventHandler.onVideoWaiting);
            this.videoElement.removeEventListener("error",this.EventHandler.onVideoError);
        }
    }

    on(type, handler) {
        this.emiiter.on(type, handler);
    }

    off(type, handler) {
        this.emiiter.removeListener(type, handler);
    }

    trigger(type) {

    }

    emit(type) {
        let args = Array.prototype.slice.call(arguments, 1);
        this.emiiter.emit.apply(this.emiiter, [type, type].concat(args));
    }

    setLogLevel(level) {
        Logger.setLevel(level)
    }

    setFlvConfig(e, t) {
        if(this.liveM)
        {
            this.liveM.setConfig(e, t)
        }
    }

    load(linetype=2)
    {
        if(this.liveM)
        {
            this.liveM.startFlv(this.mediaDataSource.url, 0, linetype);
        }
    }

    start() {
        this.load();
    }

    pause() {
        this.stopFlv();
    }

    stopFlv() {
        this.liveM && this.liveM.stopFlv()
    }

    //生成sourceBuffer时发生错误
    onSourceBufferUpdateErrorHandler(e)
    {
        this.retryLoad();
        this._emitter.emit("player_event_record",{errorType:"SBUpdateError",errorCode:e.code,detail:ErrorDetails.MEDIA_MSE_ERROR,info:e.message});
    }

    sourceEndHandler()
    {
        this.emiiter.emit("player_event_sourceend");
    }

    onFetchCloseHandler()
    {
        this.emiiter.emit(LoadEvent.CLOSE);
        this.liveM.endOfStream();
    }

    //appendBufferError
    onAppendBufferErrorHandler(type,msg)
    {
        this.retryLoad();
    }

    //fetch加载错误
    onLoaderError(e)
    {
        this.retryLoad();
    }

    onVideoErrorHandler()
    {

    }

    onVideoWaiting()
    {

    }

    onVideoPlay()
    {
        this.emiiter.emit("player_event_start_play");
    }

    onVideoStalled()
    {

    }

    static isSupported() {
        return window.MediaSource && window.MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
    }

    static get Events() {
        //return myEvents;
    }
}
export default H5Player;