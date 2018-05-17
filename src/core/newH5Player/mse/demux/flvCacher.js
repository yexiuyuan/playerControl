/**
 * Created by douxingxiang on 2017/7/6.
 */
import Logger from "core/newH5Player/utils/logger";
import flvParser from "core/newH5Player/mse/demux/flvParser";

class flvCacher {
    constructor() {
        this.size = 0;
        this.buffers = [];
    }

    destroy() {
        this.reset()
    }

    reset() {
        this.size = 0;
        this.buffers = [];
    }

    append(trunk)
    {
        if(trunk.length != 0)
        {
            this.buffers.push(trunk);
            this.size += trunk.length;
        }
    }

    getByte(index) {

        let t = 0;
        for (let i = 0; i < this.buffers.length; ++i)
        {
            let trunk = this.buffers[i];
            if (t + trunk.length > index)
            {
                var a = index - t;
                return trunk[a]
            }
            t += trunk.length
        }
        Logger.warn("FlvCacher.getByte has no offset=" + index);
        return 0;
    }

    popFront()
    {
        if (this.size == 0)
        {
            return null;
        }

        if (this.buffers.length == 0)
        {
            Logger.error("FlvCacher.popFront error no buffers bu size:" + this.size + " not eq 0");
            this.reset();
            return null;
        }

        if (this.size <= flvParser.FLV_TAG_HEADER_LEN + flvParser.FLV_PREV_TAG_SIZE_LEN)
        {
            return null;
        }

        var e = (this.getByte(1) << 16) + (this.getByte(2) << 8) + this.getByte(3);
        var stashSize = flvParser.FLV_TAG_HEADER_LEN + e + flvParser.FLV_PREV_TAG_SIZE_LEN;
        if (this.size < stashSize)
        {
            return null;
        }

        if (this.buffers.length == 1)
        {
            if (this.buffers[0].length == stashSize)
            {
                var i = this.buffers[0];
                this.buffers.shift();
                this.size -= stashSize;
                return i;
            }
            var s = this.buffers[0].slice(0, stashSize);
            this.buffers[0] = this.buffers[0].slice(stashSize);
            this.size -= stashSize;
            return s;
        }
        var newData = new Uint8Array(stashSize);
        for (var r = 0, n = 0; r < stashSize;)
        {
            var u = stashSize - r;
            if (this.buffers[0].length > u)
            {
                newData.set(this.buffers[0].slice(0, u), n);
                n += u;
                r += u;
                this.buffers[0] = this.buffers[0].slice(u);
                this.size -= u;
                break
            }
            newData.set(this.buffers[0].slice(), n);
            n += this.buffers[0].length;
            r += this.buffers[0].length;
            this.size -= this.buffers[0].length;
            this.buffers.shift();
        }
        return newData;
    }
}
export default flvCacher;