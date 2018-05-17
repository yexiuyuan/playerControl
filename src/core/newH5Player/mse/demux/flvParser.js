/**
 * Created by douxingxiang on 2017/7/4.
 */
import aacFrame from "../../utils/aacFrame";
import Logger from "core/newH5Player/utils/logger";
import exp_golomb from "core/newH5Player/mse/demux/exp-golomb";
import flvCacher from "core/newH5Player/mse/demux/flvCacher";

class flvParser {
    constructor(t, i) {
        this.parseFlvHead = !1;
        this.spsUnit = null;
        this.ppsUnit = null;
        this.vpsUnit = null;
        this.paused = !1;
        this.printTs = 0;
        this.mse = t;
        this.videoType = i;
        this.flvCacher = new flvCacher();
        this.DEFAULT_GOP = 200;
        this.bufLen = 400;
        this.pushGop = !0;
        this.parseFlvHead = !1;
        this.lengthSizeMinusOne = 0;
        this.audioConfig = [43, 138, 8, 0];
        this.audioSampleRate = 22500;
        this.aacTimeLen = 1024e3 / this.audioSampleRate;
        this.audioChannelCount = 1;
        this.spsUnit = null;
        this.ppsUnit = null;
        this.vpsUnit = null;
        this.hasCtsZero = !1;
        this.paused = !1;
        this.nextAacDts = -1;
        this.playVideoFrameCnt = 0;
        this.playVideoLength = 0;
        this.playAudioFrameCnt = 0;
        this.playAudioLength = 0;
        this.playEmptyAudioFrameCnt = 0;
        var s = navigator.userAgent;
        this.isFirefox = s.indexOf("firefox") !== -1;
        this.isMQQBrowser = s.indexOf("MQQBrowser") !== -1;
        this.isAndroid = s.indexOf("Android") !== -1;
        this.reset();
    }

    destroy()
    {
        this.reset();
    }

    reset() {
        this.avcTrack = {
            type: "video",
            id: 1,
            sequenceNumber: 0,
            samples: [],
            len: 0,
            nbNalu: 0,
            duration: 0,
            startDts: -1,
            endDts: 0
        };
        this.avcTrack.isHevc = !1;
        this.avcTrack.timescale = this.mse.remuxer.timescale;

        this.aacTrack = {
            type: "audio",
            id: 2,
            sequenceNumber: 0,
            samples: [],
            len: 0,
            duration: 0,
            startDts: -1,
            endDts: 0
        };
        this.aacTrack.config = this.audioConfig;
        this.aacTrack.audiosamplerate = this.audioSampleRate;
        this.aacTrack.channelCount = this.audioChannelCount;
        this.aacTrack.codec = "mp4a.40.2";
        this.aacTrack.timescale = this.mse.remuxer.timescale;

        this.bufLen = 400;
        this.nextAacDts = -1;
        this.hasCtsZero = !1;
    }

    getPlayStat() {
        var e = {
            videoFrameCnt: this.playVideoFrameCnt,
            videoLength: this.playVideoLength,
            audioFrameCnt: this.playAudioFrameCnt,
            audioLength: this.playAudioLength,
            emptyAudioFrameCnt: this.playEmptyAudioFrameCnt
        };
       this.playVideoFrameCnt = 0;
       this.playVideoLength = 0;
       this.playAudioFrameCnt = 0;
       this.playAudioLength = 0;
       this.playEmptyAudioFrameCnt = 0;
       return e;
    }

    setPaused(e) {
        this.paused = e;
    }

    setPushGop(e) {
        this.pushGop = e;
        Logger.log("FlvParser.setPushGop val=" + e);
    }

    getParserBufLen() {

        if(this.avcTrack.samples.length !== 0)
        {
            return this.avcTrack.endDts - this.avcTrack.startDts;
        }

        if(this.aacTrack.samples.length !== 0)
        {
            return this.aacTrack.endDts - this.aacTrack.startDts;
        }
        return 0;
    }

    parse(track) {
        var headLen = 0;
        var tLen = track.length;
        if (this.parseFlvHead === !1)
        {
            if (tLen < flvParser.FLV_HEADER_LEN + flvParser.FLV_PREV_TAG_SIZE_LEN)
            {
                return void Logger.warn("FlvParser.parseFlv flv has no header len=" + tLen);
            }
            headLen += flvParser.FLV_HEADER_LEN + flvParser.FLV_PREV_TAG_SIZE_LEN;
            this.parseFlvHead = !0;
            Logger.log("FlvParser.parseFlv flv handle flv header");
        }
        if(headLen === 0)
        {
            this.flvCacher.append(track);
        }
        else
        {
            this.flvCacher.append(track.subarray(headLen));
        }
        for (var a = void 0; null !== (a = this.flvCacher.popFront());)
        {
            this.parseTag(a);
        }
    }

    parseTag(byteArray)
    {
        var frameType = undefined;
        var dataSize = undefined;
        var timestamp = undefined;
        var frameTyep = undefined;
        var dataType = undefined;
        var packetType = undefined;
        var spsLen = undefined;
        var ppsLen = undefined;
        var naluLen = undefined;
        var offset = 0;
        var bLength = byteArray.length;
        var compositionTime = 0;
        var unit = undefined;
        var unitList = [];
        var unitLength = 0;
        if (bLength < flvParser.FLV_TAG_HEADER_LEN + flvParser.FLV_PREV_TAG_SIZE_LEN)
        {
            return void Logger.warn("FlvParser.parseTag flv has no whole tag len=" + bLength + " data=" + byteArray);
        }
        frameType = byteArray[offset++];
        dataSize = (byteArray[offset++] << 16) + (byteArray[offset++] << 8) + byteArray[offset++];
        if (bLength - (flvParser.FLV_TAG_HEADER_LEN + flvParser.FLV_PREV_TAG_SIZE_LEN) < dataSize)
        {
            return void Logger.warn("FlvParser.parseTag flv has no enough data dataLen=" + dataSize + " len=" + bLength);
        }
        if (0 === dataSize)
        {
            return  Logger.warn("FlvParser.parseTag flvtag empty type=" + frameType);
        }

        timestamp = (byteArray[offset++] << 16) + (byteArray[offset++] << 8) + byteArray[offset++] + (byteArray[offset++] << 24);
        if (frameType === flvParser.VIDEO_TYPE)
        {
            offset += 3;
            if (dataSize < 5)
            {
                return void Logger.warn("FlvParser.parseTag avc videotag not enough dataLen=" + dataSize);
            }
            //|---------------videoData-----------|
            //|帧类型（4b）|编码类型（4b）|videoData|
            frameTyep = byteArray[offset] >> 4;
            var codecID = 15 & byteArray[offset++];
            //codecID = 7 tagData = AVCVideoPacket格式.
            //CodecID=2，tagData = H263VideoPacket；
            //CodecID=3，tagData = ScreenVideopacket；
            //CodecID=4，tagData = VP6FLVVideoPacket；
            //CodecID=5，tagData = VP6FLVAlphaVideoPacket；
            //CodecID=6，tagData = ScreenV2VideoPacket；
            //CodecID=7，tagData = AVCVideoPacket；

            // |------------------videoData--------------------|
            // | AVCPacketType(8)| CompostionTime(24) |  Data  |
            // |----------------Head------------------|--body--|
            dataType = byteArray[offset++];
            if (2 === dataType)
                return void Logger.log("FlvParser.parseTag avc_end dataLen=" + dataSize);
            if (5 === dataSize)
                return void Logger.log("FlvParser.parseTag avc_empty frameType=" + frameTyep + " avcPacketType=" + dataType);
            if (dataType === 0)
            {
            // | cfgVersion(8) | avcProfile(8) | profileCompatibility(8) |avcLevel(8) | reserved(6) | lengthSizeMinusOne(2) | reserved(3) | numOfSPS(5) |spsLength(16) | sps(n) | numOfPPS(8) | ppsLength(16) | pps(n) |
                offset += 3;//CompostionTime 过滤CompostionTime3个字节
                var P = [];
                var spsArr = [];
                var ppsArr = [];
                var needReset = !1
                offset += 4;
                this.lengthSizeMinusOne = 3 & byteArray[offset++];//| reserved(6) | lengthSizeMinusOne(2) |
                var numOfSPS = 31 & byteArray[offset++];//| reserved(3) | numOfSPS(5) | 00011111 & byteArray[offset++]
                var widths = 0;
                var heights = 0;
                var codecss = "";
                //SequenceParameterSets（SPS）和 PictureParameterSets（PPS）
                for (var startSize = 0; startSize < numOfSPS; ++startSize)
                {
                    spsLen = (byteArray[offset++] << 8) + byteArray[offset++];//|spsLength(16) |
                    var spsUnit = {
                        data: byteArray.subarray(offset, offset + spsLen),//| numOfPPS(8) | ppsLength(16) | pps(n) |
                        type: 7
                    };
                    if(this.spsUnit && this.spsUnit.data.toString(16) !== spsUnit.data.toString(16))
                    {
                        Logger.log("FlvParser.parseTag sps changed");
                        needReset = !0
                    }

                    this.spsUnit = spsUnit;
                    offset += spsLen;
                    var golomb = new exp_golomb(spsUnit.data);
                    var x = golomb.readSPS();
                    widths = x.width;
                    heights= x.height;
                    spsArr.push(spsUnit.data);
                    for (var V = spsUnit.data.subarray(1, 4), N = "avc1.", L = 0; L < 3; L++)
                    {
                        var F = V[L].toString(16);
                        if( F.length < 2)
                        {
                            F = "0" + F;
                        }
                        N += F
                    }
                    codecss = N;
                    var maxSize = byteArray[offset++];
                    for (startSize = 0; startSize < maxSize; ++startSize)//| numOfPPS(8) |
                    {
                        ppsLen = (byteArray[offset++] << 8) + byteArray[offset++];
                        var ppsUnit = {
                            data: byteArray.subarray(offset, offset + ppsLen),
                            type: 8
                        };
                        if(this.ppsUnit && this.ppsUnit.data.toString(16) !== ppsUnit.data.toString(16))
                        {
                            Logger.log("FlvParser.parseTag pps changed"),
                            needReset = !0;
                        }
                        this.ppsUnit = ppsUnit;
                        offset += ppsLen;
                        ppsArr.push(ppsUnit.data);
                    }
                    if(needReset)
                    {
                        this.reset();
                        this.paused = this.mse.onAvcCfgChange();
                    }
                    this.avcTrack.isHevc = !1;
                    this.avcTrack.sps = spsArr;
                    this.avcTrack.pps = ppsArr;
                    this.avcTrack.width = widths;
                    this.avcTrack.height = heights;
                    this.avcTrack.codec = codecss;
                    this.mse.setResolution(widths, heights);
                }
                Logger.log("FlvParser.parseTag avc  dataLen=" + dataSize + " spsLen=" + spsLen + " ppsLen=" + ppsLen + " w/h=" + this.avcTrack.width + "/" + this.avcTrack.height + " codec=" + this.avcTrack.codec);
            }
            else if (1 === dataType)//AVCVideoPacket 格式数据
            {
                //| AVCPacketType(8)| CompostionTime(24) | Data |
                compositionTime = (byteArray[offset++] << 16) + (byteArray[offset++] << 8) + byteArray[offset++];
                if(0 === compositionTime)
                {
                    this.hasCtsZero || (Logger.log("FlvParser.parseTag cts has 0"),
                        this.hasCtsZero = !0)
                }
                else
                {
                    if( compositionTime >= 8388608)//100000000000000000000000 溢出
                    {
                        Logger.warn("FlvParser.parseTag negative cts=" + compositionTime + " dts=" + timestamp);
                        compositionTime -= 16777216//  0
                    }
                    else
                    {
                        if(compositionTime > 2500 && compositionTime < 3500)
                        {
                            compositionTime = 0;
                        }
                        else
                        {
                            compositionTime > 600 && Logger.warn("FlvParser.parseTag large cts=" + compositionTime + " dts=" + timestamp);
                        }
                    }
                }

                if (this.avcTrack.startDts !== -1 && !this.paused)
                {
                    var needRemux = !1;
                    if(this.pushGop)
                    {
                        frameTyep === flvParser.IFRAME && (needRemux = !0);
                    }
                    else
                    {
                        if(this.hasCtsZero)
                        {
                            timestamp >= this.avcTrack.startDts + this.bufLen && (needRemux = !0);
                        }
                        else
                        {
                            frameTyep === flvParser.IFRAME && (needRemux = !0);
                        }
                    }
                    needRemux && (this.avcTrack.endDts = timestamp,this.remux());
                }
                if(frameTyep === flvParser.IFRAME)
                {
                    unitList.push(this.spsUnit);
                    unitLength += this.spsUnit.data.length;

                    unitList.push(this.ppsUnit);
                    unitLength += this.ppsUnit.data.length;
                }

                for (var startIndex = dataSize - 5; startIndex;)
                {
                    naluLen = 0;
                    for (var startSize = 0; startSize <= this.lengthSizeMinusOne; ++startSize)
                    {
                        naluLen += byteArray[offset++] << 8 * (this.lengthSizeMinusOne - startSize);
                    }
                    //lengthSizeMinusOne决定了NALU的长度
                    //帧数据是将多个 NALU 使用 byte[] {00, 00, 01} 连接的字节数组 {00, 00, 01} 就是lengthSizeMinusOne
                    if (startIndex -= this.lengthSizeMinusOne + 1,0 !== naluLen)//NALU数据的长度，也就是纯视频数据的长度
                    {
                        if (naluLen > startIndex)
                        {
                            offset += startIndex;
                            break
                        }
                        startIndex -= naluLen;
                        unit = {
                            data: byteArray.subarray(offset, offset + naluLen),
                            type: 1 === frameTyep ? 5 : 1
                        };
                        this.isH264Sei(unit.data) || (unitList.push(unit),
                        unitLength += unit.data.length),
                        offset += naluLen;
                    }
                }
                if (unitLength > 0)
                {
                    var sample = {
                        units: {
                            units: unitList,
                            length: unitLength
                        },
                        pts: 90 * (timestamp + compositionTime),
                        dts: 90 * timestamp,
                        key: 1 === frameTyep
                    };
                    this.avcTrack.samples.push(sample);
                    this.avcTrack.nbNalu += unitList.length;
                    this.avcTrack.len += unitLength;
                    this.playVideoFrameCnt++;
                    this.playVideoLength += dataSize;
                    this.avcTrack.startDts === -1 && (this.avcTrack.startDts = timestamp);
                    this.avcTrack.endDts = timestamp;
                    timestamp < this.printTs && Logger.log("FlvParser.parseTag avc dts=" + timestamp + " pts=" + (timestamp + compositionTime) + " dataLen=" + dataSize + " naluLen=" + naluLen + " unitsLen=" + sample.units.length + " unitsNum=" + sample.units.units.length + " frameType=" + frameTyep)
                }
                else
                {
                    Logger.warn("FlvParser.parseTag discard empty nalu dts=" + timestamp + " pts=" + (timestamp + compositionTime) + " dataLen=" + dataSize + " naluLen=" + naluLen);
                }
            }
            else
            {
                Logger.warn("FlvParser.parseTag error avc packet type=" + dataType);
            }
        }
        else if (frameType === flvParser.AUDIO_TYPE)
        {
            if (offset += 4,packetType = byteArray[offset++],0 === packetType)
            {
                if (dataSize >= 4)
                {
                    var H = byteArray[offset] >> 3;
                    var Y = ((7 & byteArray[offset]) << 1) + ((128 & byteArray[offset + 1]) >> 7);
                    this.audioChannelCount = (120 & byteArray[offset + 1]) >> 3;
                    var x = this.getAdtsConfig(H, Y, this.audioChannelCount);
                    x.toString() !== this.audioConfig.toString() && Logger.warn("FlvParser.parseTag adts changed old=" + this.audioConfig.toString() + " new=" + x.toString()),
                    this.audioConfig = x
                }
                else
                {
                    Logger.warn("FlvParser.parseTag adts error dataLen=" + dataSize + " ts=" + timestamp);
                }
            }
            else if (1 === packetType)
            {
                if(this.aacTrack.startDts !== -1 && timestamp >= this.aacTrack.startDts + this.bufLen && this.avcTrack.samples.length === 0)
                {
                    this.aacTrack.endDts = timestamp;
                    this.remux();
                }
                // this.aacTrack.startDts !== -1 && timestamp >= this.aacTrack.startDts + this.bufLen && 0 === this.avcTrack.samples.length && (),
                this.aacTrack.startDts === -1 && (this.aacTrack.startDts = timestamp);
                var Q = dataSize - 2;
                var sample = {
                    unit: byteArray.subarray(offset, offset + Q),
                    pts: 90 * timestamp,
                    dts: 90 * timestamp,
                    ts: timestamp
                };
                this.aacTrack.samples.push(sample);
                this.aacTrack.endDts = timestamp;
                this.aacTrack.len += sample.unit.length;
                timestamp < this.printTs && Logger.log("FlvParser.parseTag aac dts=" + timestamp + " dataLen=" + dataSize + " unitLen=" + sample.unit.length)
            }
            else
            {
                Logger.warn("FlvParser.parseTag error aac packet type=" + packetType);
            }
        }
        else
        {
            18 === frameType ? (Logger.log("FlvParser.parseTag script tag len=" + dataSize),
            this.reset(),
            this.audioConfig = [43, 138, 8, 0],
            this.audioSampleRate = 22500,
            this.aacTimeLen = 1024e3 / this.audioSampleRate,//audio的播放时长
            this.audioChannelCount = 1,
            this.spsUnit = null,
            this.ppsUnit = null,
            this.vpsUnit = null,
            this.mse.onRestart()) : Logger.warn("FlvParser.parseTag discard type=" + frameType + " len=" + dataSize)
        }
    }

    //重新对audio进行洗刷
    remux()
    {
        var avcTrack = this.avcTrack;
        var aacTrack = this.aacTrack;
        var aacSamples = aacTrack.samples;

        var aacTrackB = {
                type: "audio",
                id: 2,
                sequenceNumber: 0,
                samples: [],
                len: 0,
                duration: 0,
                startDts: -1,
                endDts: 0
            };
        aacTrackB.config = this.audioConfig;
        aacTrackB.audiosamplerate = this.audioSampleRate;
        aacTrackB.channelCount = this.audioChannelCount;
        aacTrackB.codec = "mp4a.40.2";
        aacTrackB.timescale = this.mse.remuxer.timescale;

        var avcStartDts = avcTrack.startDts;
        var avcEndDts = avcTrack.endDts;
        if(avcStartDts === -1)
        {
            avcStartDts = aacTrack.startDts;
            avcEndDts = aacTrack.endDts;
        }
        var aacSample = null;
        if(aacSamples.length > 0)
        {
            aacSample = aacSamples[0];
        }
        if(this.nextAacDts === -1)
        {
            this.nextAacDts = avcStartDts;
            if(this.nextAacDts === 0)
            {
                this.nextAacDts += this.aacTimeLen;
            }
        }

        var dts = 0;
        for (var nextAacDts = this.nextAacDts; nextAacDts < avcEndDts; nextAacDts += this.aacTimeLen)//this.aacTimeLen = 23ms
        {
            dts = Math.round(nextAacDts);
            if (aacSample && aacSample.ts <= dts)
            {
                aacSample = aacSamples.shift();
                aacSample.pts = aacSample.dts = 90 * dts;
                aacSample.ts = dts;
                aacTrackB.samples.push(aacSample);
                aacTrackB.len += aacSample.unit.length;
                this.playAudioFrameCnt++;
                this.playAudioLength += aacSample.unit.length;
                aacTrackB.startDts === -1 && (aacTrackB.startDts = aacSample.ts);
                aacTrackB.endDts = aacSample.ts;
                aacSample = aacSamples.length > 0 ? aacSamples[0] : null;
            }
           else if ("flv" === this.videoType)
            {
                if (22050 === this.audioSampleRate)
                {
                    Logger.log("FlvParser.remux aac add empty aacDts=" + dts);
                    var d = {
                        unit: new Uint8Array(aacFrame.emptyAacFrame),
                        pts: 0,
                        dts: 0,
                        ts: 0
                    };
                    d.pts = d.dts = 90 * dts;
                    d.ts = dts;
                    aacTrackB.samples.push(d);
                    aacTrackB.len += d.unit.length;
                    this.playAudioFrameCnt++;
                    this.playEmptyAudioFrameCnt++;
                    this.playAudioLength += d.unit.length;
                    aacTrackB.startDts === -1 && (aacTrackB.startDts = d.ts);
                    aacTrackB.endDts = d.ts;
                }
                else if (aacTrackB.samples.length)
                {
                    Logger.log("FlvParser.remux aac add empty2 aacDts=" + dts);
                    var c = aacTrackB.samples[aacTrackB.samples.length - 1];
                    var d = {
                        unit: new Uint8Array(c.unit),
                        pts: 0,
                        dts: 0,
                        ts: 0
                    };
                    d.pts = d.dts = 90 * dts;
                    d.ts = dts;
                    aacTrackB.samples.push(d);
                    aacTrackB.len += d.unit.length;
                    this.playAudioFrameCnt++;
                    this.playEmptyAudioFrameCnt++;
                    this.playAudioLength += d.unit.length;
                    aacTrackB.startDts === -1 && (aacTrackB.startDts = d.ts);
                    aacTrackB.endDts = d.ts;
                }
            }
        }
        this.nextAacDts = nextAacDts;
        if(aacSamples.length > 0)
        {
            this.aacTrack.startDts = aacSamples[0].ts;
            this.aacTrack.endDts = aacSamples[aacSamples.length - 1].ts;
        }
        else
        {
            this.aacTrack.startDts = -1;
            this.aacTrack.endDts = 0;
        }

        aacTrackB.duration = Math.round((aacTrackB.endDts - aacTrackB.startDts) * (this.mse.remuxer.timescale / 1e3));
        avcTrack.duration = Math.round((this.avcTrack.endDts - this.avcTrack.startDts) * (this.mse.remuxer.timescale / 1e3));
        if(avcEndDts < this.printTs)
        {
            Logger.log("REMUX aac ts=" + aacTrackB.startDts + "-" + aacTrackB.endDts + " len=" + aacTrackB.len + " samples=" + aacTrackB.samples.length + " duration=" + aacTrackB.duration);
            Logger.log("REMUX avc ts=" + avcTrack.startDts + "-" + avcTrack.endDts + " len=" + avcTrack.len + " samples=" + avcTrack.samples.length + " nalus=" + avcTrack.nbNalu + " duration=" + avcTrack.duration);
        }
        //--------------设置gop--------------------------->
        this.mse.onGop(avcEndDts - avcStartDts);
        //---------------提交、封装track------------------->
        this.mse.remuxer.remux(aacTrackB, avcTrack, 0, !1);
        //------------------重置avctrack------------------->
        this.avcTrack = {
            type: "video",
            id: 1,
            sequenceNumber: 0,
            samples: [],
            len: 0,
            nbNalu: 0,
            duration: 0,
            startDts: -1,
            endDts: 0
        };
        this.bufLen = this.DEFAULT_GOP;
    }

    getAdtsConfig(e, t, i) {
        var s = null
            , a = 0
            , r = null
            , n = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350];
        return this.isFirefox ? t >= 6 ? (e = 5,
            r = new Array(4),
            a = t - 3) : (e = 2,
            r = new Array(2),
            a = t) : this.isAndroid ? this.isMQQBrowser ? (e = 2,
            r = new Array(2),
            a = t) : (e = 5,
            r = new Array(4),
            a = t) : (e = 5,
            r = new Array(4),
            s && (s.indexOf("mp4a.40.29") !== -1 || s.indexOf("mp4a.40.5") !== -1) || !s && t >= 6 ? a = t - 3 : ((s && s.indexOf("mp4a.40.2") !== -1 && t >= 6 && 1 === i || !s && 1 === i) && (e = 2,
                r = new Array(2)),
                a = t)),
            this.audioSampleRate = n[t],
            this.aacTimeLen = 1024e3 / this.audioSampleRate,
            r[0] = e << 3,
            r[0] |= (14 & t) >> 1,
            r[1] |= (1 & t) << 7,
            r[1] |= i << 3,
        5 === e && (r[1] |= (14 & a) >> 1,
            r[2] = (1 & a) << 7,
            r[2] |= 8,
            r[3] = 0),
            Logger.log("FlvParser.getAdtsConfig type=" + e + " index=" + t + " channel=" + i + " exIndex=" + a + " config=" + r),
            r
    }

    isHevcNal(e, t) {
        return 0 === e[t] && 0 === e[t + 1] && 0 === e[t + 2] && 1 === e[t + 3]
    }

    isH264Sei(e) {
        return e[2] === e.length - 4 && 249 === e[3] && 243 === e[4]
    }
}

flvParser.FLV_HEADER_LEN = 9,
    flvParser.FLV_TAG_HEADER_LEN = 11,
    flvParser.FLV_PREV_TAG_SIZE_LEN = 4,
    flvParser.VIDEO_TYPE = 9,
    flvParser.AUDIO_TYPE = 8,
    flvParser.IFRAME = 1,
    flvParser.NAL_VPS = 32,
    flvParser.NAL_SPS = 33,
    flvParser.NAL_PPS = 34;
export default flvParser;