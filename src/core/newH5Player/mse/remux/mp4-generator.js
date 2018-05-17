/**
 * Created by douxingxiang on 2017/7/5.
 */
class generator {
    constructor() {

    }

    static init() {
        generator.types = {
            avc1: [],
            avcC: [],
            hvc1: [],
            hvcC: [],
            btrt: [],
            dinf: [],
            dref: [],
            esds: [],
            ftyp: [],
            hdlr: [],
            mdat: [],
            mdhd: [],
            mdia: [],
            mfhd: [],
            minf: [],
            moof: [],
            moov: [],
            mp4a: [],
            mvex: [],
            mvhd: [],
            sdtp: [],
            stbl: [],
            stco: [],
            stsc: [],
            stsd: [],
            stsz: [],
            stts: [],
            tfdt: [],
            tfhd: [],
            traf: [],
            trak: [],
            trun: [],
            trex: [],
            tkhd: [],
            vmhd: [],
            smhd: []
        };
        var t = undefined;
        for (t in generator.types)
        {
            if(generator.types.hasOwnProperty(t))
            {
                generator.types[t] = [t.charCodeAt(0), t.charCodeAt(1), t.charCodeAt(2), t.charCodeAt(3)];
            }
        }
        //uint8Array的构造函数传入的数组，一个元素是一个成员。
        var vo = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 118, 105, 100, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 86, 105, 100, 101, 111, 72, 97, 110, 100, 108, 101, 114, 0]);
        var ao = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 115, 111, 117, 110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 83, 111, 117, 110, 100, 72, 97, 110, 100, 108, 101, 114, 0]);
        generator.HDLR_TYPES = {
            video: vo,
            audio: ao
        };
        var a = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 12, 117, 114, 108, 32, 0, 0, 0, 1]);
        var r = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
        generator.STTS = generator.STSC = generator.STCO = r;
        generator.STSZ = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        generator.VMHD = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
        generator.SMHD = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
        generator.STSD = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1]);
        var n = new Uint8Array([105, 115, 111, 109]);
        var o = new Uint8Array([97, 118, 99, 49]);
        var u = new Uint8Array([0, 0, 0, 1]);
        generator.FTYP = generator.box(generator.types.ftyp, n, u, n, o);
        generator.DINF = generator.box(generator.types.dinf, generator.box(generator.types.dref, a));
    }

    static box(boxType)
    {
        var boxSize = 8;//默认header是8个字节，前四个字节表示size，后四个字节表示box type
        var args = arguments.length;
        var s = Array(args > 1 ? args - 1 : 0);//创建args - 1个长度的Array
        for (var a = 1; a < args; a++)
        {
            s[a - 1] = arguments[a];
        }

        var r = s.length;
        for (var n = r; n-- > 0;)
        {
            boxSize += s[n].byteLength;
        }

        var box = new Uint8Array(boxSize);
        box[0] = boxSize >> 24 & 255;
        box[1] = boxSize >> 16 & 255;
        box[2] = boxSize >> 8 & 255;
        box[3] = 255 & boxSize;//前四个字节表示size，后四个字节表示box type,t就是byte length = size
        box.set(boxType, 4);//从box的第4个字节开始复制，e就是box的type
        n = 0;
        for (boxSize = 8; n < r; n++)//为什么t从8开始？因为前8个字节分别表示 size和type。
        {
            box.set(s[n], boxSize);
            boxSize += s[n].byteLength;
        }
        return box;
    }

    static hdlr(t) {
        return generator.box(generator.types.hdlr, generator.HDLR_TYPES[t]);
    }

    static mdat(t) {
        return generator.box(generator.types.mdat, t)
    }

    static mdhd(t, i) {
        return generator.box(generator.types.mdhd, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, 255 & t, i >> 24, i >> 16 & 255, i >> 8 & 255, 255 & i, 85, 196, 0, 0]))
    }

    static mdia(t) {
        return generator.box(generator.types.mdia, generator.mdhd(t.timescale, t.duration), generator.hdlr(t.type), generator.minf(t))
    }

    static mfhd(t) {
        return generator.box(generator.types.mfhd, new Uint8Array([0, 0, 0, 0, t >> 24, t >> 16 & 255, t >> 8 & 255, 255 & t]))
    }

    static minf(t) {
        return "audio" === t.type ? generator.box(generator.types.minf, generator.box(generator.types.smhd, generator.SMHD), generator.DINF, generator.stbl(t)) : generator.box(generator.types.minf, generator.box(generator.types.vmhd, generator.VMHD), generator.DINF, generator.stbl(t))
    }

    static moof(t, i, s) {
        return generator.box(generator.types.moof, generator.mfhd(t), generator.traf(s, i))
    }

    static moov(t) {
        for (var i = t.length, s = []; i--;)
        {
            s[i] = generator.trak(t[i]);
        }
        return generator.box.apply(null, [generator.types.moov, generator.mvhd(t[0].timescale, t[0].duration)].concat(s).concat(generator.mvex(t)))
    }

    static mvex(t) {
        for (var i = t.length, s = []; i--;)
        {
            s[i] = generator.trex(t[i]);
        }
        return generator.box.apply(null, [generator.types.mvex].concat(s))
    }

    static mvhd(t, i) {
        var s = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, 255 & t, i >> 24 & 255, i >> 16 & 255, i >> 8 & 255, 255 & i, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255]);
        return generator.box(generator.types.mvhd, s);
    }

    static sdtp(t) {
        var i = t.samples || [];
        var s = new Uint8Array(4 + i.length);
        var a = void 0;
        var r = void 0;
        for (r = 0; r < i.length; r++)
        {
            a = i[r].flags;
            s[r + 4] = a.dependsOn << 4 | a.isDependedOn << 2 | a.hasRedundancy;
        }
        return generator.box(generator.types.sdtp, s);
    }

    static stbl(t) {
        return generator.box(generator.types.stbl, generator.stsd(t), generator.box(generator.types.stts, generator.STTS), generator.box(generator.types.stsc, generator.STSC), generator.box(generator.types.stsz, generator.STSZ), generator.box(generator.types.stco, generator.STCO))
    }

    static avc1(t) {
        var i = [];
        var s = [];
        var a = void 0;
        var r = void 0;
        var n = void 0;
        for (a = 0; a < t.sps.length; a++)
        {
            r = t.sps[a];
            n = r.byteLength;
            i.push(n >>> 8 & 255);
            i.push(255 & n);
            i = i.concat(Array.prototype.slice.call(r));
        }

        for (a = 0; a < t.pps.length; a++)
        {
            r = t.pps[a];
            n = r.byteLength;
            s.push(n >>> 8 & 255);
            s.push(255 & n);
            s = s.concat(Array.prototype.slice.call(r));
        }

        var o = generator.box(generator.types.avcC, new Uint8Array([1, i[3], i[4], i[5], 255, 224 | t.sps.length].concat(i).concat([t.pps.length]).concat(s)));
        var u = t.width;
        var l = t.height;
        return generator.box(generator.types.avc1, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, u >> 8 & 255, 255 & u, l >> 8 & 255, 255 & l, 0, 72, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 255, 255]), o, generator.box(generator.types.btrt, new Uint8Array([0, 28, 156, 128, 0, 45, 198, 192, 0, 45, 198, 192])))
    }

    static hvc1(t) {
        var i = [];
        var s = [];
        var a = [];
        var r = void 0;
        var n = void 0;
        var o = void 0;

        i.push(161);
        i.push(t.vps.length >>> 8 & 255);
        i.push(255 & t.vps.length);
        for (r = 0; r < t.vps.length; r++)
        {
            n = t.vps[r],
            o = n.byteLength,
            i.push(o >>> 8 & 255),
            i.push(255 & o),
            i = i.concat(Array.prototype.slice.call(n));
        }

        s.push(162);
        s.push(t.sps.length >>> 8 & 255);
        s.push(255 & t.sps.length);
        for (r = 0; r < t.sps.length; r++)
        {
            n = t.sps[r];
            o = n.byteLength;
            s.push(o >>> 8 & 255);
            s.push(255 & o);
            s = s.concat(Array.prototype.slice.call(n));
        }

        var u = [];
        var l = 0;
        for (r = 0; r < s.length;)
        {
            n = s[r];
            if(2 !== l || 3 !== n)
            {
                0 === n ? l++ : l = 0;
                u.push(n);
                ++r;
            }
            else
            {
                ++r;
                l = 0;
            }
        }

        for (a.push(163),
                 a.push(t.pps.length >>> 8 & 255),
                 a.push(255 & t.pps.length),
                 r = 0; r < t.pps.length; r++)
        {
            n = t.pps[r];
            o = n.byteLength;
            a.push(o >>> 8 & 255);
            a.push(255 & o);
            a = a.concat(Array.prototype.slice.call(n));
        }
        var h = generator.box(generator.types.hvcC, new Uint8Array([1, u[8], u[9], u[10], u[11], u[12], u[13], u[14], u[15], u[16], u[17], u[18], u[19], 240, 0, 255, 253, 248, 248, 0, 0, 15].concat([3]).concat(i).concat(s).concat(a)));
        var d = t.width;
        var c = t.height;
        return generator.box(generator.types.hvc1, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, d >> 8 & 255, 255 & d, c >> 8 & 255, 255 & c, 0, 72, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 255, 255]), h, generator.box(generator.types.btrt, new Uint8Array([0, 28, 156, 128, 0, 45, 198, 192, 0, 45, 198, 192])))
    }

    static esds(e) {
        var t = e.config.length;
        return new Uint8Array([0, 0, 0, 0, 3, 23 + t, 0, 1, 0, 4, 15 + t, 64, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5].concat([t]).concat(e.config).concat([6, 1, 2]))
    }

    static mp4a(t) {
        var i = t.audiosamplerate;
        return generator.box(generator.types.mp4a, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, t.channelCount, 0, 16, 0, 0, 0, 0, i >> 8 & 255, 255 & i, 0, 0]), generator.box(generator.types.esds, generator.esds(t)))
    }

    static stsd(t) {
        return "audio" === t.type ? generator.box(generator.types.stsd, generator.STSD, generator.mp4a(t)) : t.isHevc ? generator.box(generator.types.stsd, generator.STSD, generator.hvc1(t)) : generator.box(generator.types.stsd, generator.STSD, generator.avc1(t))
    }

    static tkhd(t) {
        var i = t.id;
        var s = t.duration;
        var a = t.width;
        var r = t.height;
        return generator.box(generator.types.tkhd, new Uint8Array([0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, i >> 24 & 255, i >> 16 & 255, i >> 8 & 255, 255 & i, 0, 0, 0, 0, s >> 24, s >> 16 & 255, s >> 8 & 255, 255 & s, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, a >> 8 & 255, 255 & a, 0, 0, r >> 8 & 255, 255 & r, 0, 0]))
    }

    static traf(t, i) {
        var s = generator.sdtp(t);
        var a = t.id;
        return generator.box(generator.types.traf, generator.box(generator.types.tfhd, new Uint8Array([0, 0, 0, 0, a >> 24, a >> 16 & 255, a >> 8 & 255, 255 & a])), generator.box(generator.types.tfdt, new Uint8Array([0, 0, 0, 0, i >> 24, i >> 16 & 255, i >> 8 & 255, 255 & i])), generator.trun(t, s.length + 16 + 16 + 8 + 16 + 8 + 8), s)
    }

    static trak(t) {
        t.duration = t.duration || 4294967295;
        return  generator.box(generator.types.trak, generator.tkhd(t), generator.mdia(t))
    }

    static trex(t) {
        var i = t.id;
        return generator.box(generator.types.trex, new Uint8Array([0, 0, 0, 0, i >> 24, i >> 16 & 255, i >> 8 & 255, 255 & i, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1]))
    }

    static trun(t, i) {
        var s = t.samples || [];
        var a = s.length;
        var r = 12 + 16 * a
        var n = new Uint8Array(r);
        var o = undefined;
        var u = undefined;
        var l = undefined;
        var h = undefined;
        var d = undefined;
        var c = undefined;
        i += 8 + r;
        n.set([0, 0, 15, 1, a >>> 24 & 255, a >>> 16 & 255, a >>> 8 & 255, 255 & a, i >>> 24 & 255, i >>> 16 & 255, i >>> 8 & 255, 255 & i], 0);
        for (o = 0; o < a; o++)
        {
            u = s[o];
            l = u.duration;
            h = u.size;
            d = u.flags;
            c = u.cts;
            n.set([l >>> 24 & 255, l >>> 16 & 255, l >>> 8 & 255, 255 & l, h >>> 24 & 255, h >>> 16 & 255, h >>> 8 & 255, 255 & h, d.isLeading << 2 | d.dependsOn, d.isDependedOn << 6 | d.hasRedundancy << 4 | d.paddingValue << 1 | d.isNonSync, 61440 & d.degradPrio, 15 & d.degradPrio, c >>> 24 & 255, c >>> 16 & 255, c >>> 8 & 255, 255 & c], 12 + 16 * o);
        }
        return generator.box(generator.types.trun, n);
    }

    static initSegment(t) {
        generator.types || generator.init();
        var i = generator.moov(t);
        var s = void 0;
        s = new Uint8Array(generator.FTYP.byteLength + i.byteLength);
        s.set(generator.FTYP);
        s.set(i, generator.FTYP.byteLength);
        return s;
    }


}
generator.init();
export default generator;