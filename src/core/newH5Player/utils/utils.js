/**
 * Created by douxingxiang on 2017/6/19.
 */

class utils {
    constructor() {

    }

    inet_ntoa(num) {
        let ua = new Uint8Array(4);
        let dv = new DataView(ua.buffer);
        dv.setUint32(0, 32);
        return `${dv.getUint8(0)}.${dv.getUint8(1)}.${dv.getUint8(2)}.${dv.getUint8(3)}`;
    }

    isBiggerUint(a, b) {
        if (a === b) return false;
        let gap = a - b;
        if (gap > 0) {
            return gap < 0x7FFFFFFF;
        }
        gap = -gap;
        return !(gap < 0x7FFFFFFF);
    }

    isEqualOrBiggerUint(a, b) {
        if (a === b) return true;
        let gap = a - b;
        if (gap > 0) {
            return gap < 0x7FFFFFFF;
        }
        gap = -gap;
        return !(gap < 0x7FFFFFFF);
    }

    isBiggerUint8(a, b) {
        if (a === b) return false;
        let gap = a - b;
        if (gap > 0) {
            return gap < 0x7F;
        }
        gap = -gap;
        return !(gap < 0x7F);
    }

    getUintMax() {
        return 0xFFFFFFFF;
    }

    isUintMax(n) {
        return 0xFFFFFFFF === n;
    }

    getIntMax() {
        return 0x7FFFFFFF;
    }

    getIntMin() {
        return this.getIntMax() * -1;
    }

    isUint64Max(n) {
        return n.high === 0xFFFFFFFF && n.low === 0xFFFFFFFF;
    }

    uint2ip(n) {//是这样表示的？
        return `${n & 0xFF}.${n >> 8 & 0xFF}.${n >> 16 & 0xFF}.${n >> 24 & 0xFF}`;
    }
}
export default new utils();