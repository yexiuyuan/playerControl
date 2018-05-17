/**
 * Created by douxingxiang on 2017/6/20.
 */

import Logger from "core/newH5Player/utils/logger";

/**
 * 哥伦布编码
 */
class ExpGolomb {
    constructor(data) {
        this.data = data;
        this.bytesAvailable = this.data.byteLength;
        this.word = 0;
        this.bitsAvailable = 0;
    }

    loadWord() {
        var e = this.data.byteLength - this.bytesAvailable;
        var t = new Uint8Array(4);
        var i = Math.min(4, this.bytesAvailable);
        if (0 === i)
        {
            throw new Error("no bytes available");
        }

        t.set(this.data.subarray(e, e + i));
        this.word = new DataView(t.buffer).getUint32(0);
        this.bitsAvailable = 8 * i;
        this.bytesAvailable -= i;
    }

    skipBits(e) {
        var t = void 0;
        if(this.bitsAvailable > e)
        {
            this.word <<= e;
            this.bitsAvailable -= e;
        }
        else
        {
            e -= this.bitsAvailable;
            t = e >> 3;
            e -= t >> 3;
            this.bytesAvailable -= t;
            this.loadWord();
            this.word <<= e;
            this.bitsAvailable -= e;
        }
    }

    readBits(bLen)//读取的Bits的长度
    {
        var t = Math.min(this.bitsAvailable, bLen);
        var i = this.word >>> 32 - t;

        bLen > 32 && Logger.error("Cannot read more than 32 bits at a time"),
        this.bitsAvailable -= t;
        this.bitsAvailable > 0 ? this.word <<= t : this.bytesAvailable > 0 && this.loadWord();
        t = bLen - t;
        return    t > 0 ? i << t | this.readBits(t) : i;
    }

    skipLZ()
    {
        var e = undefined;
        for (e = 0; e < this.bitsAvailable; ++e)
        {
            if (0 !== (this.word & 2147483648 >>> e))
                return this.word <<= e,
                    this.bitsAvailable -= e,
                    e;
        }
        this.loadWord();
        return e + this.skipLZ();
    }

    skipUEG() {
        this.skipBits(1 + this.skipLZ());
    }

    skipEG() {
        this.skipBits(1 + this.skipLZ());
    }

    readUEG() {
        var e = this.skipLZ();
        return this.readBits(e + 1) - 1;
    }

    readEG() {
        var e = this.readUEG();
        return 1 & e ? 1 + e >>> 1 : -1 * (e >>> 1);
    }

    readBoolean() {
        return 1 === this.readBits(1)
    }

    readUByte() {
        return this.readBits(8)
    }

    skipScalingList(e) {
        var t = 8;
        var i = 8;
        var s = undefined;
        var a = undefined;
        for (s = 0; s < e; s++)
        {
            0 !== i && (a = this.readEG(),
                i = (t + a + 256) % 256),
                t = 0 === i ? t : i;
        }
    }

    readSPS() {
        var e = 0;
        var t = 0;
        var i = 0;
        var s = 0;
        var a = undefined;
        var r = undefined;
        var n = undefined;
        var o = undefined;
        var u = undefined;
        var l = undefined;
        var h = undefined;
        var d = undefined;
        var c = undefined;

        this.readUByte();
        a = this.readUByte();
        r = this.readBits(5);
        this.skipBits(3);
        n = this.readUByte();
        this.skipUEG();

        if (a === 100 || a === 110 || a === 122 || a === 144)
        {
            var f = this.readUEG();

            if(f === 3)this.skipBits(1);
            this.skipUEG();
            this.skipUEG();
            this.skipBits(1);

            if (this.readBoolean())
            {
                d = 3 !== f ? 8 : 12;
                for (c = 0; c < d; c++)
                {
                    this.readBoolean() && (c < 6 ? this.skipScalingList(16) : this.skipScalingList(64));
                }
            }
        }
        this.skipUEG();
        var p = this.readUEG();
        if (0 === p)
        {
            this.readUEG();
        }
        else if (1 === p)
        {
            this.skipBits(1);
            this.skipEG();
            this.skipEG();
            o = this.readUEG();
            for (c = 0; c < o; c++)
            {
                this.skipEG();
            }
        }
        this.skipUEG();
        this.skipBits(1);
        u = this.readUEG();
        l = this.readUEG();
        h = this.readBits(1);
        0 === h && this.skipBits(1);
        this.skipBits(1);
        if(this.readBoolean())
        {
            e = this.readUEG();
            t = this.readUEG();
            i = this.readUEG();
            s = this.readUEG();
        }
            // {
            //     width: 16 * (u + 1) - 2 * e - 2 * t,
            //     height: (2 - h) * (l + 1) * 16 - 2 * i - 2 * s
            // }
        return { width: 16 * (u + 1) - 2 * e - 2 * t,height: (2 - h) * (l + 1) * 16 - 2 * i - 2 * s};
    }

    readSliceType() {
        this.readUByte();
        this.readUEG();
        return    this.readUEG();
    }
}

export default ExpGolomb;

