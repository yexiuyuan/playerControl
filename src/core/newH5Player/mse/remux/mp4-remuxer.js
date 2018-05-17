/**
 * Created by douxingxiang on 2017/7/5.
 */
import Logger from "core/newH5Player/utils/logger";
import generator from "core/newH5Player/mse/remux/mp4-generator";

class mp4Remuxer {
    constructor(t) {
        this.mse = t;
        this.ISGenerated = !1;
        this.PES2MP4SCALEFACTOR = 1;
        this.PES_TIMESCALE = 90 * 1000;
        this.MP4_TIMESCALE = this.PES_TIMESCALE / this.PES2MP4SCALEFACTOR;
    }

    destroy()
    {
        this.insertDiscontinuity();
        this.ISGenerated = !1;
    }

    insertDiscontinuity()
    {
        this._initPTS = this._initDTS = this.nextAacPts = this.nextAvcDts = undefined;
    }

    getInitDts()
    {
        if(this._initDTS !== undefined)
        {
            return this._initDTS / 90;
        }
        return -1;
        // return void 0 !== this._initDTS ? this._initDTS / 90 : -1;
    }

    switchLevel()
    {
        this.ISGenerated = !1
    }

    remux(aacTrack, avcTrack, value, value1)
    {
        this.ISGenerated || this.generateIS(aacTrack, avcTrack, value);
        avcTrack.samples.length && this.remuxVideo(avcTrack, value1);
        aacTrack.samples.length && this.remuxAudio(aacTrack, value1);
        this.mse.onFragParsed();
        this.mse.checkBuffer();
    }

    generateIS(aacTrack, avcTrack, value)
    {
        var mse = this.mse;
        var a = null;
        var aacSamples = aacTrack.samples;
        var avcSamples = avcTrack.samples;
        var aacSamplesLen = aacSamples.length;
        var avcSamplesLen = avcSamples.length;
        var preTimeScale = this.PES_TIMESCALE;

        if(aacSamplesLen === 0 && avcSamplesLen === 0)
        {
            Logger.warn("mp4-remuxer.generateIS have no nbAudio&nbVideo");
        }
        else
        {
            if(avcSamplesLen === 0)
            {
                if(aacTrack.config)
                {
                    a = {
                        audioMoov: generator.initSegment([aacTrack]),
                        audioCodec: aacTrack.codec,
                        audioChannelCount: aacTrack.channelCount
                    };
                    mse.onInitSegment(a);
                    this.ISGenerated = !0;
                    if(this._initPTS === undefined)
                    {
                        this._initPTS = aacSamples[0].pts - preTimeScale * value;
                        this._initDTS = aacSamples[0].dts - preTimeScale * value;
                    }
                }
                else
                {
                    Logger.warn("mp4-remuxer.generateIS have no sps or pps");
                }
            }
            else
            {
                if(0 === aacSamplesLen)
                {
                    if(avcTrack.sps && avcTrack.pps)
                    {
                        a = {
                            videoMoov: generator.initSegment([avcTrack]),
                            videoCodec: avcTrack.codec,
                            videoWidth: avcTrack.width,
                            videoHeight: avcTrack.height
                        };
                        mse.onInitSegment(a);
                        this.ISGenerated = !0;
                        if(this._initPTS === undefined)
                        {
                            this._initPTS = avcSamples[0].pts - preTimeScale * value;
                            this._initDTS = avcSamples[0].dts - preTimeScale * value;
                        }
                    }
                    else {

                        Logger.warn("mp4-remuxer.generateIS have no sps or pps");
                    }
                }
                else
                {
                    if(aacTrack.config && avcTrack.sps && avcTrack.pps)
                    {
                        a = {
                            audioMoov: generator.initSegment([aacTrack]),
                            audioCodec: aacTrack.codec,
                            audioChannelCount: aacTrack.channelCount,
                            videoMoov: generator.initSegment([avcTrack]),
                            videoCodec: avcTrack.codec,
                            videoWidth: avcTrack.width,
                            videoHeight: avcTrack.height
                        };
                        mse.onInitSegment(a);
                        this.ISGenerated = !0;
                        if(this._initPTS === undefined)
                        {
                            this._initPTS = Math.min(avcSamples[0].pts, aacSamples[0].pts) - preTimeScale * value;
                            this._initDTS = Math.min(avcSamples[0].dts, aacSamples[0].dts) - preTimeScale * value;
                        }
                    }
                    else {

                        Logger.warn("mp4-remuxer.generateIS have no audioConfig or sps or pps");
                    }
                }
            }
        }
    }

    remuxVideo(avcTrack, value)
    {
        var dataView = undefined;
        var baseLen = 8
        var preTimeScale = this.PES_TIMESCALE
        var pes2MP4ScaleFactor = this.PES2MP4SCALEFACTOR
        var avcSample = undefined;
        var  sample = undefined;
        var  size = undefined;
        var  unit = undefined;
        var  avcTrackUnitArray = undefined;
        var  moof = undefined;
        var  p = undefined;
        var  ptsNormalLizeMax = undefined;
        var  y = undefined;
        var  pts = undefined;
        var  dts = undefined;
        var  P = undefined;
        var  ptsNormalLize = undefined;
        var  samples = [];

        avcTrackUnitArray = new Uint8Array(avcTrack.len + 4 * avcTrack.nbNalu + 8);
        dataView = new DataView(avcTrackUnitArray.buffer);
        dataView.setUint32(0, avcTrackUnitArray.byteLength);
        avcTrackUnitArray.set(generator.types.mdat, 4);

        for (; avcTrack.samples.length;)
        {
            avcSample = avcTrack.samples.shift();
            for (size = 0; avcSample.units.units.length;)
            {
                unit = avcSample.units.units.shift();
                dataView.setUint32(baseLen, unit.data.byteLength);
                baseLen += 4;
                avcTrackUnitArray.set(unit.data, baseLen);
                baseLen += unit.data.byteLength;
                size += 4 + unit.data.byteLength;
            }

            pts = avcSample.pts - this._initDTS;
            dts = avcSample.dts - this._initDTS;

            if (y !== undefined)
            {
                P = this._PTSNormalize(pts, y);
                ptsNormalLize = this._PTSNormalize(dts, y);
                sample.duration = (ptsNormalLize - y) / pes2MP4ScaleFactor;//duration = byteLength/timescale
                if(sample.duration < 0)
                {
                    Logger.warn("mp4-remuxer.remuxVideo invalid sample duration at pts=" + avcSample.pts / 90 + " dts=" + avcSample.dts / 90 + " duration=" + sample.duration / 90);
                    sample.duration = 0;
                    ptsNormalLize = y;
                }
            }
            else
            {
                var nextAvcDts = this.nextAvcDts;
                var b = undefined;
                P = this._PTSNormalize(pts, nextAvcDts);
                ptsNormalLize = this._PTSNormalize(dts, nextAvcDts);
                b = Math.round((ptsNormalLize - nextAvcDts) / 90);
                if(Math.abs(b) < 600 && b)
                {
                    if(b > 1)
                    {
                        Logger.log("mp4-remuxer.remuxVideo hole=" + b + " filling it")
                    }
                    else
                    {
                        if(b < -1)
                        {
                            Logger.log("mp4-remuxer.remuxVideo overlapping=" + -b + " detected");
                        }
                    }
                    ptsNormalLize = nextAvcDts;
                    P = Math.max(P - b, ptsNormalLize);
                }
                p = Math.max(0, P);
                ptsNormalLizeMax = Math.max(0, ptsNormalLize);
            }
            sample = {
                size: size,
                duration: 0,
                cts: (P - ptsNormalLize) / pes2MP4ScaleFactor,
                flags: {
                    isLeading: 0,
                    isDependedOn: 0,
                    hasRedundancy: 0,
                    degradPrio: 0
                }
            };

            if( avcSample.key === !0)
            {
                sample.flags.dependsOn = 2;
                sample.flags.isNonSync = 0;
            }
            else
            {
                sample.flags.dependsOn = 1;
                sample.flags.isNonSync = 1;
            }
            samples.push(sample);
            y = ptsNormalLize;
        }

        if(void 0 !== avcTrack.endDts)
        {
            sample.duration = (90 * avcTrack.endDts - this._initDTS - ptsNormalLize) / pes2MP4ScaleFactor;
            if(sample.duration < 0)
            {
                sample.duration = 0;
                this.nextAvcDts = ptsNormalLize;
            }
            else
            {
                this.nextAvcDts = 90 * avcTrack.endDts - this._initDTS;
            }
        }
        else
        {
            if(samples.length >= 2)
            {
                sample.duration = samples[samples.length - 2].duration;
            }
            this.nextAvcDts = ptsNormalLize + sample.duration * pes2MP4ScaleFactor;
        }

        avcTrack.len = 0;
        avcTrack.nbNalu = 0;

        if(navigator.userAgent.toLowerCase().indexOf("chrome") > -1)
        {
            samples[0].flags.dependsOn = 2;
            samples[0].flags.isNonSync = 0;
        }
        avcTrack.samples = samples;
        moof = generator.moof(avcTrack.sequenceNumber++, ptsNormalLizeMax / pes2MP4ScaleFactor, avcTrack);
        avcTrack.samples = [];
        var track = {
            moof: moof,
            mdat: avcTrackUnitArray,
            startPTS: p / preTimeScale,
            endPTS: (P + pes2MP4ScaleFactor * sample.duration) / preTimeScale,
            startDTS: ptsNormalLizeMax / preTimeScale,
            endDTS: (ptsNormalLize + pes2MP4ScaleFactor * sample.duration) / preTimeScale,
            type: "video",
            nb: samples.length
        };
        this.mse.onFragParsing(track)
    }

    remuxAudio(aacTrack, value)
    {
        var dataView = void 0;
        var baseLen = 8;
        var preTimeScale = this.PES_TIMESCALE;
        var pes2MP4ScaleFactor = this.PES2MP4SCALEFACTOR;
        var aacSample = void 0;
        var sample = void 0;
        var aacUnit = void 0;
        var aacTrackUnitArray = void 0;
        var moof = void 0;
        var ptsNormalLizeMax = void 0;
        var ptsNormalLizeMax2 = void 0;
        var latPtsNormalLize2 = void 0;
        var ptsDis = void 0;
        var dtsDis = void 0;
        var ptsNormalLize = void 0;
        var ptsNormalLize2 = void 0;
        var samples = [];

        aacTrackUnitArray = new Uint8Array(aacTrack.len + 8);
        dataView = new DataView(aacTrackUnitArray.buffer);
        dataView.setUint32(0, aacTrackUnitArray.byteLength);
        aacTrackUnitArray.set(generator.types.mdat, 4);
        for (; aacTrack.samples.length;)
        {
            aacSample = aacTrack.samples.shift();
            aacUnit = aacSample.unit;
            aacTrackUnitArray.set(aacUnit, baseLen);
            baseLen += aacUnit.byteLength;
            ptsDis = aacSample.pts - this._initDTS;
            dtsDis = aacSample.dts - this._initDTS;
            if (latPtsNormalLize2 !== undefined)
            {
                ptsNormalLize = this._PTSNormalize(ptsDis, latPtsNormalLize2);
                ptsNormalLize2 = this._PTSNormalize(dtsDis, latPtsNormalLize2);
                sample.duration = (ptsNormalLize2 - latPtsNormalLize2) / pes2MP4ScaleFactor;
                if(sample.duration < 0)
                {
                    Logger.warn("mp4-remuxer.remuxAudio invalid AAC sample duration at PTS=" + aacSample.pts + " duration=" + sample.duration);
                    sample.duration = 0;
                    ptsNormalLize = ptsNormalLize2 = latPtsNormalLize2;
                }
            }
            else
            {
                var nextAacPts = this.nextAacPts;
                var timeLen = undefined;
                ptsNormalLize = this._PTSNormalize(ptsDis, nextAacPts);
                ptsNormalLize2 = this._PTSNormalize(dtsDis, nextAacPts);
                timeLen = Math.round(1e3 * (ptsNormalLize - nextAacPts) / preTimeScale);
                if((value || Math.abs(timeLen) < 600) && timeLen)
                {
                    (ptsNormalLize = ptsNormalLize2 = nextAacPts);
                }
                ptsNormalLizeMax = Math.max(0, ptsNormalLize);
                ptsNormalLizeMax2 = Math.max(0, ptsNormalLize2);
            }
            sample = {
                size: aacUnit.byteLength,
                cts: 0,
                duration: 0,
                flags: {
                    isLeading: 0,
                    isDependedOn: 0,
                    hasRedundancy: 0,
                    degradPrio: 0,
                    dependsOn: 1
                }
            };
            samples.push(sample);
            latPtsNormalLize2 = ptsNormalLize2;
        }
        samples.length >= 2 && (sample.duration = samples[samples.length - 2].duration);
        this.nextAacPts = ptsNormalLize + pes2MP4ScaleFactor * sample.duration;
        aacTrack.len = 0;
        aacTrack.samples = samples;
        moof = generator.moof(aacTrack.sequenceNumber++, ptsNormalLizeMax2 / pes2MP4ScaleFactor, aacTrack);
        aacTrack.samples = [];
        var track = {
            moof: moof,
            mdat: aacTrackUnitArray,
            startPTS: ptsNormalLizeMax / preTimeScale,
            endPTS: this.nextAacPts / preTimeScale,
            startDTS: ptsNormalLizeMax2 / preTimeScale,
            endDTS: (ptsNormalLize2 + pes2MP4ScaleFactor * sample.duration) / preTimeScale,
            type: "audio",
            nb: samples.length
        };
        this.mse.onFragParsing(track);
    }

    _PTSNormalize(e, t)
    {
        var i = undefined;
        if (t === undefined)
            return e;
        for (i = t < e ? -8589934592 : 8589934592; Math.abs(e - t) > 4294967296;)
        {
            e += i;
        }
        return e
    }

    get timescale() {
        return this.MP4_TIMESCALE
    }
}
export default mp4Remuxer;