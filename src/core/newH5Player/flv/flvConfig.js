/**
 * Created by douxingxiang on 2017/6/19.
 */
import flvConfigKey from "core/newH5Player/flv/flvConfigKey";

class FlvConfig {
    constructor(config) {
        this.configs = new Map();
        this.configs.set(flvConfigKey.PUSH_GOP, false);
        this.configs.set(flvConfigKey.JIT_BUFLEN, 4000);
    }

    setConfig(key, value) {
        this.configs.set(key, value);
    }

    getConfig(key) {
        return this.configs.get(key);
    }
}

export default FlvConfig;