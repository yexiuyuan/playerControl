import Logger from "core/newH5Player/utils/logger";
import timeUtil from "core/newH5Player/utils/timeUtil";
import flvParser from "core/newH5Player/mse/demux/flvParser";
import mp4Remuxer from "core/newH5Player/mse/remux/mp4-remuxer";
import EventEmitter from "events";
import TransformEvent from "core/newH5Player/events/transformEvent";

class msePlayer
{
    constructor(liveManager, type="flv")
    {
        this.paused = false;
        this.audioSourceBuffer = null;
        this.videoSourceBuffer = null;
        this.audioCodec = null;
        this.videoCodec = null;
        this.liveManager = liveManager;

        this.emiiter = new EventEmitter();

        this.remuxer = new mp4Remuxer(this);
        this.parser = new flvParser(this,type);

        this.audioSegments = [];
        this.videoSegments = [];
        this.playing = false;
        this.videoElement = liveManager.videoElement;
        this.video = liveManager.videoElement;
        this.lastPlayTime = 0;
        this.lastCheckPlayTime = 0;
        this.paused = false;
        this.maxGop = 0;
        this.playStartTime = 0;
        this.mediaSource = new MediaSource;

        this.EventHandler = {
            onSourceOpenHandler:this.onMediaSourceOpen.bind(this),
            onSourceEndedHandler:this.onMediaSourceEnded.bind(this),
            onSourceCloseHandler:this.onMediaSourceClose.bind(this),

            onVideoSeekingHandler:this.onMediaSeeking.bind(this),
            onVideoSeekedHandler:this.onMediaSeeked.bind(this),
            onVideoMetaDataHandler:this.onMediaMetadata.bind(this),
            onVideoEndedHandler:this.onMediaEnded.bind(this),

            onAudioSBupdateEndHandler:this.onAudioSBUpdateEnd.bind(this),
            onVideoSBupdateEndHandler:this.onVideoSBUpdateEnd.bind(this),
            onSBupdateErrorHandler:this.onSBUpdateError.bind(this)
        }

        this.mediaSource.addEventListener("sourceopen", this.EventHandler.onSourceOpenHandler);
        this.mediaSource.addEventListener("sourceended", this.EventHandler.onSourceEndedHandler);
        this.mediaSource.addEventListener("sourceclose", this.EventHandler.onSourceCloseHandler);

        // this.onvseeking = this.onMediaSeeking.bind(this);
        // this.onvseeked = this.onMediaSeeked.bind(this);
        // this.onvmetadata = this.onMediaMetadata.bind(this);
        // this.onvended = this.onMediaEnded.bind(this);

        this.video.src = URL.createObjectURL(this.mediaSource);
        // this.onasbue = this.onAudioSBUpdateEnd.bind(this);
        // this.onvsbue = this.onVideoSBUpdateEnd.bind(this);
        // this.onsbe = this.onSBUpdateError.bind(this)

        this.audioSourceBuffer = null;
        this.videoSourceBuffer = null;
        this.audioCodec = null;
        this.videoCodec = null;
        this.width = 1280;
        this.height = 720;
        var ua = navigator.userAgent.toLowerCase();
        this.isAndroid = ua.indexOf("Android") !== -1;
        this.delayReset = false;
    }

    destroy() {
        Logger.log("MSEPlayer.destroy");
        this.liveManager.onVideoStop();
        this.liveManager = null;
        this.remuxer.destroy();
        this.parser.destroy();
        this.audioSegments = [];
        this.videoSegments = [];
        if (this.audioSourceBuffer) {
            try {
                this.mediaSource.removeSourceBuffer(this.audioSourceBuffer);
                this.audioSourceBuffer.removeEventListener("updateend", this.EventHandler.onAudioSBupdateEndHandler);
                this.audioSourceBuffer.removeEventListener("error", this.EventHandler.onSBupdateErrorHandler);
            } catch (e) {
                Logger.warn("MSEPlayer.destroy audio error=" + e.message);
            }
            this.audioSourceBuffer = null
        }
        if (this.videoSourceBuffer)
        {
            try {
                this.mediaSource.removeSourceBuffer(this.videoSourceBuffer);
                this.videoSourceBuffer.removeEventListener("updateend", this.EventHandler.onVideoSBupdateEndHandler);
                this.videoSourceBuffer.removeEventListener("error", this.EventHandler.onSBupdateErrorHandler);
            } catch (e) {
                Logger.warn("MSEPlayer.destroy video error=" + e.message)
            }
            this.videoSourceBuffer = null
        }
        this.EventHandler.onAudioSBupdateEndHandler = this.EventHandler.onVideoEndedHandler = this.EventHandler.onSBupdateErrorHandler = null;
        this.EventHandler.onVideoWaitHandler = null;
        if(this.mediaSource)
        {
            this.mediaSource.removeEventListener("sourceopen", this.EventHandler.onSourceOpenHandler);
            this.mediaSource.removeEventListener("sourceended", this.EventHandler.onSourceEndedHandler);
            this.mediaSource.removeEventListener("sourceclose", this.EventHandler.onSourceCloseHandler);
            this.EventHandler.onSourceOpenHandler = null;
            this.EventHandler.onSourceEndedHandler = null;
            this.EventHandler.onSourceCloseHandler = null;
            this.mediaSource = null
        }

        if(this.video)
        {
            this.video.pause();
            this.video.removeEventListener("seeking", this.EventHandler.onVideoSeekingHandler);
            this.video.removeEventListener("seeked", this.EventHandler.onVideoSeekedHandler);
            this.video.removeEventListener("loadedmetadata", this.EventHandler.onVideoMetaDataHandler);
            this.video.removeEventListener("ended", this.EventHandler.onVideoEndedHandler);
            this.EventHandler.onVideoSeekingHandler = null;
            this.EventHandler.onVideoSeekedHandler = null;
            this.EventHandler.onVideoMetaDataHandler = null;
            this.EventHandler.onVideoEndedHandler = null;
            this.video.src = "";
            this.video = null;
        }
        if(this.emiiter)
        {
            this.emiiter.removeAllListeners();
        }
    }

    pause()
    {
        Logger.log("MSEPlayer.destroy");
        this.liveManager.onVideoStop();
        this.remuxer.destroy();
        this.parser.destroy();
        this.audioSegments = [];
        this.videoSegments = [];
        if (this.audioSourceBuffer) {
            try {
                this.audioSourceBuffer.removeEventListener("updateend", this.EventHandler.onAudioSBupdateEndHandler);
                this.audioSourceBuffer.removeEventListener("error", this.EventHandler.onSBupdateErrorHandler);
            } catch (e) {
                Logger.warn("MSEPlayer.destroy audio error=" + e.message);
            }
        }
        if (this.videoSourceBuffer)
        {
            try {
                this.videoSourceBuffer.removeEventListener("updateend", this.EventHandler.onVideoSBupdateEndHandler);
                this.videoSourceBuffer.removeEventListener("error", this.EventHandler.onSBupdateErrorHandler);
            } catch (e) {
                Logger.warn("MSEPlayer.destroy video error=" + e.message)
            }
        }
        this.EventHandler.onAudioSBupdateEndHandler = this.EventHandler.onVideoEndedHandler = this.EventHandler.onSBupdateErrorHandler = null;
        this.EventHandler.onVideoWaitHandler = null;
        if(this.mediaSource)
        {
            this.mediaSource.removeEventListener("sourceopen", this.EventHandler.onSourceOpenHandler);
            this.mediaSource.removeEventListener("sourceended", this.EventHandler.onSourceEndedHandler);
            this.mediaSource.removeEventListener("sourceclose", this.EventHandler.onSourceCloseHandler);
            this.EventHandler.onSourceOpenHandler = null;
            this.EventHandler.onSourceEndedHandler = null;
            this.EventHandler.onSourceCloseHandler = null;
        }

        if(this.video)
        {
            this.video.pause();
            this.video.removeEventListener("seeking", this.EventHandler.onVideoSeekingHandler);
            this.video.removeEventListener("seeked", this.EventHandler.onVideoSeekedHandler);
            this.video.removeEventListener("loadedmetadata", this.EventHandler.onVideoMetaDataHandler);
            this.video.removeEventListener("ended", this.EventHandler.onVideoEndedHandler);
            this.EventHandler.onVideoSeekingHandler = null;
            this.EventHandler.onVideoSeekedHandler = null;
            this.EventHandler.onVideoMetaDataHandler = null;
            this.EventHandler.onVideoEndedHandler = null;
        }
        if(this.emiiter)
        {
            this.emiiter.removeAllListeners();
        }
    }

    reset()
    {
        Logger.log("MSEPlayer.reset");
        this.liveManager.onVideoStop();
        this.remuxer.destroy();
        this.remuxer = new mp4Remuxer(this);
        this.audioSegments = [];
        this.videoSegments = [];
        this.playing = false;
        this.lastPlayTime = 0;
        this.lastCheckPlayTime = 0;
        if(this.paused) {
            this.liveManager.onPlayResume(timeUtil.now());
        }
        this.paused = false;
        this.maxGop = 0;
        this.playStartTime = 0;
        if (this.audioSourceBuffer) {
            try {
                this.mediaSource.removeSourceBuffer(this.audioSourceBuffer);
                this.audioSourceBuffer.removeEventListener("updateend", this.EventHandler.onAudioSBupdateEndHandler);
                this.audioSourceBuffer.removeEventListener("error", this.EventHandler.onSBupdateErrorHandler)
            } catch (e) {
                Logger.log("MSEPlayer.reset error 1")
            }
            this.audioSourceBuffer = null
        }
        if (this.videoSourceBuffer)
        {
            try {
                this.mediaSource.removeSourceBuffer(this.videoSourceBuffer);
                this.videoSourceBuffer.removeEventListener("updateend", this.EventHandler.onVideoSBupdateEndHandler);
                this.videoSourceBuffer.removeEventListener("error", this.EventHandler.onSBupdateErrorHandler)
            }
            catch (e) {
                Logger.log("MSEPlayer.reset error 2")
            }
            this.videoSourceBuffer = null
        }
        if(this.mediaSource)
        {
            this.mediaSource.removeEventListener("sourceopen", this.EventHandler.onSourceOpenHandler);
            this.mediaSource.removeEventListener("sourceended", this.EventHandler.onSourceEndedHandler);
            this.mediaSource.removeEventListener("sourceclose", this.EventHandler.onSourceCloseHandler);
        }

        this.mediaSource = new MediaSource;
        this.mediaSource.addEventListener("sourceopen", this.EventHandler.onSourceOpenHandler);
        this.mediaSource.addEventListener("sourceended", this.EventHandler.onSourceEndedHandler);
        this.mediaSource.addEventListener("sourceclose", this.EventHandler.onSourceCloseHandler);

        if(this.video)
        {
            this.video.removeEventListener("seeking", this.EventHandler.onVideoSeekingHandler);
            this.video.removeEventListener("seeked", this.EventHandler.onVideoSeekedHandler);
            this.video.removeEventListener("loadedmetadata", this.EventHandler.onVideoMetaDataHandler);
            this.video.removeEventListener("ended", this.EventHandler.onVideoEndedHandler);
            this.video.src = "";
            this.video = null
        }

        this.video = this.videoElement;//document.createElement("video");
        this.video.src = URL.createObjectURL(this.mediaSource);
        this.audioCodec = null;
        this.videoCodec = null;
    }

    addEventListener(cmd,listener)
    {
        this.emiiter.addListener(cmd,listener);
    }

    removeEventListener(cmd,listener)
    {
        this.emiiter.removeListener(cmd,listener);
    }

    setPushGop(e) {
        this.parser.setPushGop(e)
    }
    getPlayStat() {
        return this.parser.getPlayStat()
    }
    getPlayVideo() {
        return this.video
    }

    getBufferLen()
    {
        var len = 0;
        if (this.video)
        {
            var buffer = this.video.buffered;
            if(buffer.length > 0)
            {
                len = Math.round(1000 * (buffer.end(buffer.length - 1) - this.video.currentTime))
            }
        }
        return len
    }
    getParserBufLen() {
        return this.parser.getParserBufLen()
    }
    getCurrentDts() {
        if(this.remuxer.getInitDts() < 0) {
            return 0;
        }
        return Math.round(1e3 * this.video.currentTime) + this.remuxer.getInitDts()
    }
    getCurrentTime() {
        return Math.round(1e3 * this.video.currentTime)
    }
    getMaxGop() {
        return this.maxGop
    }

    appendData(byteArray) {
        var nowTime = timeUtil.now();
        this.checkBuffer(nowTime);
        this.parser.parse(byteArray);
    }

    checkBuffer(e)
    {
        var videoBuffer = this.video.buffered;
        let bufferLen = this.getBufferLen();
        if(this.video.currentTime === 0)
        {
            if (this.lastPlayTime !== 0)
            {
                Logger.warn("MSEPlayer.checkBuffer onPlayerError(false) lastPlayTime=" + this.lastPlayTime + " bufLen=" + bufferLen);
                this.liveManager.onPlayerError(false);
                this.lastPlayTime = 0;
                return;
            }

            this.lastPlayTime = this.video.currentTime;
            if (this.playStartTime !== 0 && e > this.playStartTime + 5000 && (bufferLen > 5000 || bufferLen == 0))
            {
                this.playStartTime = 0;
                if (this.video.currentTime === 0 && !this.isAndroid)
                {
                    Logger.warn("MSEPlayer.checkBuffer onPlayerError(true) playTime=" + this.video.currentTime + " bufLen=" + bufferLen);
                    this.liveManager.onPlayerError(true);
                    return;
                }
                else
                {
                    if(videoBuffer.length && this.video.currentTime - videoBuffer.start(0) > 20)
                    {
                        this.audioSourceBuffer && !this.audioSourceBuffer.updating && this.audioSourceBuffer.remove(0, this.video.currentTime - 10);
                        this.videoSourceBuffer && !this.videoSourceBuffer.updating && this.videoSourceBuffer.remove(0, this.video.currentTime - 10);
                    }

                    if(this.delayReset && this.getBufferLen() < 500)
                    {
                        Logger.log("MSEPlayer.checkBuffer delay reset");
                        this.reset();
                        this.parser.setPaused(false);
                        this.delayReset = false;
                    }
                    return;
                }
            }
        }

        if(videoBuffer.length && this.video.currentTime - videoBuffer.start(0) > 40)
        {
            this.audioSourceBuffer && !this.audioSourceBuffer.updating && this.audioSourceBuffer.remove(0, this.video.currentTime - 10);
            this.videoSourceBuffer && !this.videoSourceBuffer.updating && this.videoSourceBuffer.remove(0, this.video.currentTime - 10);
        }
    }

    appendTs(e)
    {
        this.checkBuffer(timeUtil.now());
        this.parser.parse(e);
    }

    onAvcCfgChange()
    {
        Logger.log("MSEPlayer.onAvcCfgChange");
        if(this.getBufferLen() < 500)
        {
            Logger.log("MSEPlayer.onAvcCfgChange reset player");
            this.reset();
            this.delayReset = false;
            return false
        }
        this.delayReset = true;
        return true;
    }
    onRestart() {
        Logger.log("MSEPlayer.onRestart");
        this.reset()
    }
    onGop(timestampDis)
    {
        if(this.liveManager.onGop )
        {
            this.liveManager.onGop(timestampDis);
        }
        if(timestampDis > this.maxGop)
        {
            this.maxGop = timestampDis;
            Logger.log("MSEPlayer.onGop update maxGop=" + this.maxGop);
        }
    }
    setVolume(value)
    {
        if(this.video) {
            this.video.volume = value
        }
    }
    setResolution(e, t) {
        Logger.log("MSEPlayer.setResolution w/h=" + e + "/" + t);
        this.width = e;
        this.height = t;
    }
    getWidth() {
        return this.width
    }
    getHeight() {
        return this.height
    }

    onInitSegment(e)
    {
        var i = this.audioCodec = e.audioCodec;
        var s = this.videoCodec = e.videoCodec;
        if(i && !this.audioSourceBuffer && "open" === this.mediaSource.readyState)
        {
            Logger.log("MSEPlayer.onInitSegment create audio sb codec=" + this.audioCodec);
            this.audioSourceBuffer = this.mediaSource.addSourceBuffer("video/mp4;codecs=" + i);
            this.audioSourceBuffer.addEventListener("updateend", this.EventHandler.onAudioSBupdateEndHandler);
            this.audioSourceBuffer.addEventListener("error", this.EventHandler.onSBupdateErrorHandler)
        }

        if(s && !this.videoSourceBuffer && "open" === this.mediaSource.readyState)
        {
            Logger.log("MSEPlayer.onInitSegment create video sb codec=" + this.videoCodec);
            this.videoSourceBuffer = this.mediaSource.addSourceBuffer("video/mp4;codecs=" + s);
            this.videoSourceBuffer.addEventListener("updateend", this.EventHandler.onVideoSBupdateEndHandler);
            this.videoSourceBuffer.addEventListener("error", this.EventHandler.onSBupdateErrorHandler)
        }

        if(e.audioMoov) {
            this.audioSegments.push(e.audioMoov);
        }

        if(e.videoMoov) {
            this.videoSegments.push(e.videoMoov);
        }
        this.playStartTime = 0;
    }
    onFragParsing(track) {
        if("audio" === track.type) {
            this.audioSegments.push(track.moof);
            this.audioSegments.push(track.mdat)
        } else if("video" === track.type) {
            this.videoSegments.push(track.moof);
            this.videoSegments.push(track.mdat)
        }
    }

    onFragParsed() {
        if (this.audioSourceBuffer && this.audioSourceBuffer.updating === false && this.audioSegments.length > 0) {
            try {
                var e = this.audioSegments.shift();
                this.audioSourceBuffer.appendBuffer(e)
            } catch (e) {
                Logger.error("MSEPlayer.onFragParsed audio append err=" + e.message);
                this.liveManager.onPlayerError(true);
                this.emiiter.emit(TransformEvent.SBAPPEND_ERROR,"audio",e);
            }
        }

        if (this.videoSourceBuffer && this.videoSourceBuffer.updating === false && this.videoSegments.length > 0) {
            try {
                var e = this.videoSegments.shift();
                this.videoSourceBuffer.appendBuffer(e)
            } catch (e) {
                Logger.error("MSEPlayer.onFragParsed video append err=" + e.message);
                this.liveManager.onPlayerError(true);
                this.emiiter.emit(TransformEvent.SBAPPEND_ERROR,"video",e);
            }
        }

        if(!this.playing)
        {
            if(this.audioSourceBuffer || this.videoSourceBuffer) {
                this.liveManager.onPlayVideo(this.video, this.width, this.height);
                this.playing = true;
                this.playStartTime = timeUtil.now();
            }
        }
    }
    onMediaSourceOpen()
    {
        this.video.addEventListener("seeking", this.EventHandler.onVideoSeekingHandler);
        this.video.addEventListener("seeked", this.EventHandler.onVideoSeekedHandler);
        this.video.addEventListener("loadedmetadata", this.EventHandler.onVideoMetaDataHandler);
        this.video.addEventListener("ended", this.EventHandler.onVideoEndedHandler);

        this.mediaSource.removeEventListener("sourceopen", this.onmso);
        var e = null;
        if (this.audioSegments.length > 0 || this.videoSegments.length > 0)
        {
            if (this.audioCodec && !this.audioSourceBuffer)
            {
                Logger.log("MSEPlayer.onMediaSourceOpen create audio sb codec=" + this.audioCodec);

                e = this.audioSourceBuffer = this.mediaSource.addSourceBuffer("video/mp4;codecs=" + this.audioCodec);
                e.addEventListener("updateend", this.EventHandler.onAudioSBupdateEndHandler);
                e.addEventListener("error", this.EventHandler.onSBupdateErrorHandler);
                try {
                    var t = this.audioSegments.shift();
                    this.audioSourceBuffer.appendBuffer(t);
                } catch (e) {
                    Logger.error("MSEPlayer.onMediaSourceOpen audio append err=" + e.message);
                    this.liveManager.onPlayerError(true);
                    this.emiiter.emit(TransformEvent.SBAPPEND_ERROR,"audio",e);
                }
            }

            if (this.videoCodec && !this.videoSourceBuffer)
            {
                Logger.log("MSEPlayer.onMediaSourceOpen create video sb codec=" + this.videoCodec);
                e = this.videoSourceBuffer = this.mediaSource.addSourceBuffer("video/mp4;codecs=" + this.videoCodec);
                e.addEventListener("updateend", this.EventHandler.onVideoSBupdateEndHandler);
                e.addEventListener("error", this.EventHandler.onSBupdateErrorHandler);
                try {
                    var t = this.videoSegments.shift();
                    this.videoSourceBuffer.appendBuffer(t)
                } catch (e) {
                    Logger.error("MSEPlayer.onMediaSourceOpen video append err=" + e.message);
                    this.liveManager.onPlayerError(true);
                    this.emiiter.emit(TransformEvent.SBAPPEND_ERROR,"video",e);
                }
            }
            if(!this.playing) {
                this.liveManager.onPlayVideo(this.video, this.width, this.height);
                this.playing = true;
                this.playStartTime = timeUtil.now();
            }
        }
    }
    onMediaSourceClose() {
        Logger.log("MSEPlayer.onMediaSourceClose")
    }
    onMediaSourceEnded() {
        // Logger.log("MSEPlayer.onMediaSourceEnded")
        this.emiiter.emit(TransformEvent.SB_END);
    }
    onMediaSeeking() {
        Logger.log("MSEPlayer.onMediaSeeking")
    }

    onMediaWait()
    {
        console.log("==========================> onMediaWait");
    }

    onMediaPlay()
    {
        console.log("==========================> onMediaPlay");
    }

    onMediaSeeked() {
        Logger.log("MSEPlayer.onMediaSeeked")
    }
    onMediaMetadata() {
        Logger.log("MSEPlayer.onMediaMetadata")
    }
    onMediaEnded() {
        Logger.log("MSEPlayer.onMediaEnded")
    }

    onCheckFastTimer(nowTime)
    {
        var videoTime = this.video.currentTime;
        if(this.lastCheckPlayTime !== 0)
        {
            if(videoTime === this.lastCheckPlayTime)//说明video已经暂停了
            {
                if(!this.paused)
                {
                    this.paused = true;
                    Logger.warn("MSEPlayer checkSensePause pause now= " + nowTime);
                    this.printBuffer();
                    this.liveManager.onPlayPause(nowTime);
                }
            }
            else
            {
                if(this.paused)
                {
                    this.paused = false;
                    Logger.warn("MSEPlayer checkSensePause resume now= " + nowTime);
                    this.printBuffer();
                    this.liveManager.onPlayResume(nowTime);
                }
            }
        }
        this.lastCheckPlayTime = this.video.currentTime;
    }

    printBuffer()
    {
        if (this.video)
        {
            var e = this.video.buffered;
            if (e.length > 0)
            {
                for (var t = " bufferIndex: ", i = 0; i < e.length; i++)
                {
                    t += "i = " + i + " [" + e.start(i) + "," + e.end(i) + "]\n";
                }
                Logger.log("printBuffer Buflen=" + Math.round(1e3 * (e.end(e.length - 1) - this.video.currentTime)) + t);
            }
        }
    }
    onAudioSBUpdateEnd()
    {
        if (this.audioSourceBuffer.updating === false && this.audioSegments.length > 0)
        {
            try {
                var e = this.audioSegments.shift();
                this.audioSourceBuffer.appendBuffer(e);
                this.checkAppendOver()
            } catch (e) {
                Logger.warn("MSEPlayer.onAudioSBUpdateEnd audio append err=" + e.message);
                this.liveManager.onPlayerError(true);
                this.emiiter.emit(TransformEvent.SBAPPEND_ERROR,"audio",e);
            }
        }
    }
    onVideoSBUpdateEnd()
    {
        if (this.videoSourceBuffer.updating === false && this.videoSegments.length > 0)
        {
            try {
                var e = this.videoSegments.shift();
                this.videoSourceBuffer.appendBuffer(e);
                this.checkAppendOver()
            } catch (e) {
                Logger.warn("MSEPlayer.onAudioSBUpdateEnd video append err=" + e.message);
                this.liveManager.onPlayerError(true);
                this.emiiter.emit(TransformEvent.SBAPPEND_ERROR,"video",e);
            }
        }
    }
    checkAppendOver()
    {
        if(0 === this.videoSegments.length && 0 === this.audioSegments.length && this.liveManager.onSBUpdateEnd)
        {
            this.liveManager.onSBUpdateEnd();
        }
    }

    endOfStream()
    {
        if(this.mediaSource.readyState == "open")
        {
            this.mediaSource.endOfStream();
        }
    }

    onSBUpdateError(e)
    {
        Logger.warn("MSEPlayer.onSBUpdateError error:" + e);
        this.emiiter.emit(TransformEvent.SB_ERROR,e.message);
    }
}
export default msePlayer;