/**
 * Created by douxingxiang on 2017/6/19.
 */
let start = 0;

export default {
    now: function() {
        if(0 === start) {
            start = Date.now() - 1;
        }
        let pass = Date.now() - start;
        if(pass > 0xFFFFFFFF) {
            start += 0xFFFFFFFF;
            pass = Date.now() - start;
        }
        return pass;
    },

    utc: function() {
        return Math.round(Date.now() / 1000);
    }
};