
import msePlayer from "core/newH5Player/mse/msePlayer";
import Logger from "core/newH5Player/utils/logger";
import timeUtil from "core/newH5Player/utils/timeUtil";
import utils from "core/newH5Player/utils/utils";
import flvConfigKey from "core/newH5Player/flv/flvConfigKey";
import FlvConfig from "core/newH5Player/flv/flvConfig";
import VideoStatus from "core/newH5Player/flv/videoStatus";
import LoaderControl from "core/newH5Player/flv/loaderControl";
import EventEmitter from "events";
import LoadEvent from "core/newH5Player/events/loadEvent";
import TransformEvent from "core/newH5Player/events/transformEvent";
import Log from "util/Log";

class LiveManager {
    constructor(player, video=null,metaData=null)
    {
        this.uid = 0;
        this.metaData = metaData;
        this.uuid = 0;
        this.videoElement = video;
        this.startPlayTime = 0;
        this.isStart = false;
        this.maxDelayTimeLength = 10000;

        this.emiiter = new EventEmitter();

        this.EventHandler = {
            onConnectHandler:this.onConnected.bind(this),
            onCloseHandler:this.onClosed.bind(this),
            onDataArrivalHandler:this.onDataArrival.bind(this),
            onSourceEndHandler:this.onSourceEndHandler.bind(this),
            onSourceBufferUpdateError:this.onSourceBufferErrorHandler.bind(this),
            onAppendBufferError:this.onAppendBufferErrorHandler.bind(this),
            onLoaderError:this.onLoaderErrorHandler.bind(this),
            onTestNetSpeed:this.onTestNetSpeedHandler.bind(this)
        };

        //生成加载器
        this.loaderM = new LoaderControl(this);
        this.loaderM.addEventListener(LoadEvent.OPEN,this.EventHandler.onConnectHandler);
        this.loaderM.addEventListener(LoadEvent.CLOSE,this.EventHandler.onCloseHandler);
        this.loaderM.addEventListener(LoadEvent.DATA_ARRIVAL,this.EventHandler.onDataArrivalHandler);
        this.loaderM.addEventListener(LoadEvent.ERROR,this.EventHandler.onLoaderError);
        this.connected = false;
        //生成mediaSource对象
        this.mseControl = new msePlayer(this,"flv");

        this.pauseStartTs = 0;
        this.videoStatus = VideoStatus.VIDEO_STOP;
        this.checkTimes = 0;
        this.checkTimer = setInterval(this.onCheckTimer.bind(this), 1000);
        this.checkFastTimes = 0;
        this.checkFastTimer = setInterval(this.onCheckFastTimer.bind(this), 100);
        this.maxGop = LiveManager.DEFAULT_MAX_GOP;
        this.minPlayDelay = utils.getUintMax();
        this.gopCnt = 0;
        this.pauseTime = 0;
        this.disconnectCnt = 0;
        this.hasPlayed = false;
        this.loadTimeLen = 0;
        this.url = "";
        this.config = new FlvConfig();
        this.receiveDataTime = 0;
        this.receivedDataLength = 0;
        this.nowReceiveBytes = 0;
        //每秒计算下载速度
        this.testNetSpeed = setInterval(this.EventHandler.onTestNetSpeed,1000);
    }
    //=====================获取到数据===================================
    onDataArrival(data)
    {
        let byteArray = new Uint8Array(data);
        this.mseControl.appendData(byteArray);
        this.receiveDataTime = timeUtil.now();
        this.hasPlayed = true;
        this.receivedDataLength += byteArray.length;
    }

    onCheckTimer()
    {
        if (this.isStart)
        {
            let now = timeUtil.now();
            this.checkTimes++;
            if (this.pauseStartTs > 0 && now - this.pauseStartTs > 60 * 1000)
            {
                return false;
            }
            if(!this.isStart)
            {
                return true;
            }

            this.loaderM.onCheckTimer();
            this.onJitterTimer(now, this.checkTimes);
            if (this.checkTimes % 20 === 0 && this.loaderM.isConnected())
            {
                if (this.pauseStartTs)
                {
                    let t = now - this.pauseStartTs;
                    if(t > 200)
                    {
                        Logger.warn("LiveManager.onCheckTimer pauseTime=" + t + " start=" + this.pauseStartTs + " now=" + now);
                    }
                    this.pauseTime += t;
                    this.pauseStartTs = now;
                }
                //Logger.log("FLV_INFO playTime=" + this.mseControl.getCurrentTime() + " bufLen=" + this.mseControl.getBufferLen() + " videoCnt=" + i.videoFrameCnt + " videoLength=" + i.videoLength + " audioCnt=" + i.audioFrameCnt + " audioLength=" + i.audioLength + " emptyCnt=" + i.emptyAudioFrameCnt + (this.pauseCnt ? " pauseCnt=" + this.pauseCnt + " pauseTime=" + this.pauseTime : ""));
                if(this.uuid === 0)
                {
                    this.uuid = Math.round(1e10 * Math.random() % utils.getUintMax());
                    Logger.log("LiveManager.uuid=" + this.uuid);
                }
                this.pauseTime = 0;
            }
        }
    }

    onCheckFastTimer()
    {
        if (this.isStart)
        {
            let now = timeUtil.now();
            this.checkFastTimes++;
            this.mseControl.onCheckFastTimer(now);
        }
    }

    onCheckStop(e)
    {
        if(this.receiveDataTime + 20000 < e)
        {
            Logger.log("onCheckStop receiveDataTime=" + this.receiveDataTime + " now=" + e);
            return true;
        }
        return false;
    }

    /**
     * 开始播放flv流
     * @param url
     * @param index
     * @param linetype
     */
    startFlv(url, index=0, linetype=2)
    {
        Logger.log("LiveManager.startFlv uid= " + this.uid + " url=" + url + " index=" + index + " lineType=" + linetype);
        this.isStart = true;
        this.reset();

        this.url = url;
        //拉取流
        this.loaderM.connect(url);
        this.receiveDataTime = this.startPlayTime = timeUtil.now();
        this.mseControl.setPushGop(this.getConfig(flvConfigKey.PUSH_GOP));
    }

    stopFlv()
    {
        if(this.isStart)
        {
            Logger.log("LiveManager.stopFlv uid=" + this.uid);
            this.reset();
        }
    }

    destroy()
    {
        clearInterval(this.checkFastTimer);
        clearInterval(this.checkTimer);
        clearInterval(this.testNetSpeed);
        if(this.mseControl)
        {
            this.mseControl.removeEventListener(TransformEvent.SB_END,this.EventHandler.onSourceEndHandler);
            this.mseControl.removeEventListener(TransformEvent.SB_ERROR,this.EventHandler.onSourceBufferUpdateError);
            this.mseControl.removeEventListener(TransformEvent.SBAPPEND_ERROR,this.EventHandler.onAppendBufferError);
            this.mseControl.destroy();
            this.mseControl = null;
        }
        if(this.loaderM)
        {
            this.loaderM.destroy();
            this.loaderM = null;
        }
    }

    pause()
    {
        clearInterval(this.checkFastTimer);
        clearInterval(this.checkTimer);
        clearInterval(this.testNetSpeed);
        if(this.mseControl)
        {
            this.mseControl.removeEventListener(TransformEvent.SB_END,this.EventHandler.onSourceEndHandler);
            this.mseControl.removeEventListener(TransformEvent.SB_ERROR,this.EventHandler.onSourceBufferUpdateError);
            this.mseControl.removeEventListener(TransformEvent.SBAPPEND_ERROR,this.EventHandler.onAppendBufferError);
            this.mseControl.pause();
        }
        if(this.loaderM)
        {
            this.loaderM.destroy();
        }
    }


    reset()
    {
        if(this.isStart)
        {
            Logger.log("LiveManager.reset uid=" + this.uid);
            this.mseControl.removeEventListener(TransformEvent.SB_END,this.EventHandler.onSourceEndHandler);
            this.mseControl.removeEventListener(TransformEvent.SB_ERROR,this.EventHandler.onSourceBufferUpdateError);
            this.mseControl.removeEventListener(TransformEvent.SBAPPEND_ERROR,this.EventHandler.onAppendBufferError);
            this.mseControl.destroy();

            this.mseControl = new msePlayer(this,"flv");
            this.mseControl.addEventListener(TransformEvent.SB_END,this.EventHandler.onSourceEndHandler);
            this.mseControl.addEventListener(TransformEvent.SB_ERROR,this.EventHandler.onSourceBufferUpdateError);
            this.mseControl.addEventListener(TransformEvent.SBAPPEND_ERROR,this.EventHandler.onAppendBufferError);
            this.mseControl.setPushGop(this.getConfig(flvConfigKey.PUSH_GOP));

            this.pauseStartTs = 0;
            this.updateVideoStatus(VideoStatus.VIDEO_STOP);
            this.startPlayTime = 0;
            this.isStart = false;
            this.maxGop = LiveManager.DEFAULT_MAX_GOP;
            this.minPlayDelay = utils.getUintMax();
            this.gopCnt = 0;
            this.pauseTime = 0;
            this.disconnectCnt = 0;
            this.hasPlayed = true;
            this.loadTimeLen = 0;
            this.url = "";
            this.checkTimes = 0;
            this.checkFastTimes = 0;
            this.connected = false;
            this.uid = 0;
            this.metaData = null;
        }
    }

    onConnected() {
        this.connected = true
    }

    onClosed()
    {
        if(this.connected)
        {
            this.disconnectCnt++;
        }
        this.updateVideoStatus(VideoStatus.VIDEO_STOP);
        this.emiiter.emit(LoadEvent.CLOSE);
    }

    requestUrl() {

    }

    setConfig(value, value1) {
        this.config.setConfig(value, value1);
    }

    getConfig(value) {
        return this.config.getConfig(value)
    }

    updateMetaData(value)
    {
        if(value )
        {
            this.metaData = value;
        }
    }

    getPlayerVideo() {
        return {
            uid: this.uid,
            video: this.mseControl.getPlayVideo(),
            width: this.mseControl.getWidth(),
            videoStatus: this.videoStatus,
            height: this.mseControl.getHeight(),
            metaData: this.metaData
        }
    }

    onPlayVideo(video, width, height)
    {
        this.mseControl.setVolume(0.8);
        if(this.startPlayTime !== 0)
        {
            this.loadTimeLen = timeUtil.now() - this.startPlayTime;
            Logger.warn("LiveManager.onPlayVideo uid=" + this.uid + " load time=" + (timeUtil.now() - this.startPlayTime));
            this.startPlayTime = 0;
        }

        this.updateVideoStatus(VideoStatus.VIDEO_PLAYING);
    }

    onVideoStop(e) {
        Logger.log("LiveManager.onVideoStop uid=" + this.uid);
        this.updateVideoStatus(VideoStatus.VIDEO_STOP);
    }

    onPlayerError(e) {

    }

    onPlayPause(nowTime)
    {
        this.pauseStartTs = nowTime;
        this.updateVideoStatus(VideoStatus.VIDEO_CACHING);
    }

    //播放恢复
    onPlayResume(nowTime)
    {
        if (this.pauseStartTs)
        {
            var pauseTime = nowTime - this.pauseStartTs;
            if(pauseTime > 200)
            {
                Logger.warn("LiveManager.onPlayResume uid" + this.uid + " pauseTime=" + pauseTime + " start=" + this.pauseStartTs + " now=" + nowTime);
                this.pauseTime += pauseTime;
            }
            this.pauseStartTs = 0;
        }
        this.updateVideoStatus(VideoStatus.VIDEO_PLAYING);
    }

    //调节播放速率
    onJitterTimer(currentTime, checkTimes)
    {
        if (checkTimes % 10 === 0)
        {
            var playVideo = this.mseControl.getPlayVideo();
            if (playVideo !== null)
            {
                if (playVideo.playbackRate !== 1)
                {
                    playVideo.playbackRate = 1;
                    this.minPlayDelay = utils.getUintMax();
                    return;
                }
                var targetDelay = this.maxGop + this.getConfig(flvConfigKey.JIT_BUFLEN);//4000
                let disDelay = 0;
                if(this.minPlayDelay !== utils.getUintMax())
                {
                    disDelay = this.minPlayDelay - targetDelay;
                    if(disDelay > LiveManager.JIT_TOLERATE_LEN)//500
                    {
                        if(disDelay > LiveManager.MAX_ADJUST_JIT)//500
                        {
                            disDelay = LiveManager.MAX_ADJUST_JIT;//500
                        }
                    }
                    else
                    {
                        if(disDelay + LiveManager.JIT_TOLERATE_LEN < 0)
                        {
                            if(disDelay + LiveManager.MAX_ADJUST_JIT < 0)
                            {
                                disDelay = 0 - LiveManager.MAX_ADJUST_JIT;
                            }
                        }
                        else
                        {
                            disDelay = 0;
                        }
                    }
                }
                playVideo.playbackRate = (10000 + disDelay) / 10000;

                if(disDelay !== 0)
                {
                    Logger.log("LiveManager.onJitterTimer uid=" + this.uid + " adjust=" + disDelay + " rate=" + playVideo.playbackRate + " miniDelay=" + this.minPlayDelay + " playDelayTarget=" + targetDelay + " maxGOP=" + this.maxGop);
                }
                this.minPlayDelay = utils.getUintMax()
            }
        }
    }

    onGop(gop)
    {
        if(gop > this.maxGop)
        {
            this.maxGop = gop;
        }
        this.gopCnt++;
        if (this.gopCnt <= 30)
        {
            this.minPlayDelay = utils.getUintMax();
            return;
        }

        var bufLen = this.mseControl.getBufferLen();
        if (bufLen !== 0)
        {
            var delay = bufLen + gop;//当前内存里的Buffer总时长
            if(delay < this.minPlayDelay)
            {
                this.minPlayDelay = delay;
            }
        }
    }

    updateVideoStatus(videoStatus)
    {
        if(this.videoStatus !== videoStatus)
        {
            Logger.log("LiveManager.updateVideoStatus uid=" + this.uid + " status=" + this.videoStatus + "->" + videoStatus);
            this.videoStatus = videoStatus;
        }
    }

    checkRegetUrl(ts) {

    }

    onSourceEndHandler()
    {
        this.emiiter.emit(TransformEvent.SB_END);
    }
    //sourceBuffer监听的错误事件
    onSourceBufferErrorHandler(msg)
    {
        this.emiiter.emit(TransformEvent.SB_ERROR,msg);
    }

    onAppendBufferErrorHandler(type,error)
    {
        this.emiiter.emit(TransformEvent.SBAPPEND_ERROR,type,error);
    }

    onLoaderErrorHandler(e)
    {
        this.emiiter.emit(LoadEvent.ERROR,e);
    }
    //计算下载速度 单位：KB/S
    onTestNetSpeedHandler()
    {
        var disBytes = this.receivedDataLength - this.nowReceiveBytes;
        var currentSpeed = parseInt(disBytes/1024);
        var bufLen = this.mseControl.getBufferLen();
        // if(currentSpeed <= 100 && this.videoElement && !this.videoElement.paused && bufLen < 2000 && this.isStart)
        // {
        //     this.videoElement.pause();
        // }
        // console.log("==========> currentSpeed "+ parseInt(disBytes/1024) + " KB/S");
        this.nowReceiveBytes = this.receivedDataLength;

        let hasQualityInfo = true;
        let decoded = 0;
        let dropped = 0;

        if (this.videoElement.getVideoPlaybackQuality) {
            let quality = this.videoElement.getVideoPlaybackQuality();
            decoded = quality.totalVideoFrames;
            dropped = quality.droppedVideoFrames;
        } else if (this.videoElement.webkitDecodedFrameCount != undefined) {
            decoded = this.videoElement.webkitDecodedFrameCount;
            dropped = this.videoElement.webkitDroppedFrameCount;
        } else {
            hasQualityInfo = false;
        }
        if(hasQualityInfo)
        {
            // console.log("=============> dropped: "+dropped+" decode: "+decoded);
        }

        if(this.mseControl)
        {
            if(bufLen >= this.maxDelayTimeLength)
            {
                Log.append("liveManager","==================timerange max to reload speed: "+currentSpeed);
                this.startFlv(this.url);
            }
        }

    }

    addEventListener(cmd,listener)
    {
        this.emiiter.addListener(cmd,listener);
    }

    removeEventListener(cmd,listener)
    {
        this.emiiter.removeListener(cmd,listener);
    }

    getReceivedDataLen()
    {
        return this.receivedDataLength;
    }

    resetReceviedDataLen()
    {
        this.receivedDataLength = 0;
    }

    endOfStream()
    {
        this.mseControl.endOfStream();
    }
}
LiveManager.DEFAULT_MAX_GOP = 200;
LiveManager.MAX_ADJUST_JIT = 500;
LiveManager.JIT_TOLERATE_LEN = 500;
export default LiveManager;