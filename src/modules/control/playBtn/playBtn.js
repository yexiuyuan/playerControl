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
            this.action = 'Pause';
            this.play.className = 'M706C61796572-control-pauseBtn M706C61796572-btn';
        } else {
            this.action = 'Play';
            this.play.className = 'M706C61796572-control-playBtn M706C61796572-btn';
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
            this.action = 'Play';
            this.play.className = 'M706C61796572-control-playBtn M706C61796572-btn';
        } else {
            this.action = 'Pause';
            this.play.className = 'M706C61796572-control-pauseBtn M706C61796572-btn';
        }
    }

    get playState() {
        return this.action == 'Play' ? true : false;
    }
}

export default playBtn;