import './playBtn.css';
import btn from '../btn/btn';
import Log from '../Log'
class playBtn extends btn {
    constructor(node) {
        super();
        this.node = node;
        this.name = 'Play';
        this.play = null;
        this.action = 'Play';
    }
    render() {
        this.play = document.createElement('div');
        this.play.className = 'M706C61796572-control-playBtn M706C61796572-btn';
        this.node.appendChild(this.play);
        this.play.addEventListener('click', this.onClickHandle.bind(this));
    }

    onClickHandle(e) {
        if (this.action == 'Play') {
            this._pause();
        } else {
            this._play();
        }
        super.disptchStatusEvent(this.name, this.action)
    }

    hasOwnAttribute(str) {
        return ((this.__proto__).hasOwnProperty(str));
    }

    set visible(bool) {
        this.play.style.display = bool ? 'block' : 'none';
    }

    get visible() {
        return this.play.style.display == 'none' ? false : true;
    }

    set playState(bool) {
        if (bool) {
            this._play();
        } else {
            this._pause();
        }
    }

    get playState() {
        return this.action == 'Play' ? false : true;
    }

    _play() {
        this.action = 'Play';
        this.play.className = 'M706C61796572-control-playBtn M706C61796572-btn';
        this._tip='播放';
    }

    _pause() {
        this.action = 'Pause';
        this.play.className = 'M706C61796572-control-pauseBtn M706C61796572-btn';
        this._tip='暂停';
    }

    set _tip(str) {
        this.play.title = str;
    }
}

export default playBtn;