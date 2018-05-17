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
        console.log('playBtn render')
        this.play = document.createElement('div');
        this.play.className = 'M706C61796572-control-playBtn btn';
        this.node.appendChild(this.play);
        this.play.addEventListener('click', this.onClickHandle.bind(this));
    }

    onClickHandle(e) {
        if (this.action == 'Play') {
            this.action = 'Pause';
            this.play.className = 'M706C61796572-control-pauseBtn btn';
        } else {
            this.action = 'Play';
            this.play.className = 'M706C61796572-control-playBtn btn';
        }
        super.disptchStatusEvent(this.name,this.action)
    }

    hasOwnAttribute(str) {
        return ((this.__proto__).hasOwnProperty(str));
    }

    visible(bool) {
        this.play.style.display=bool?'block':'none';
    }
}

export default playBtn;