import './danmuSwitch.css';
import btn from '../btn/btn';
class danmuSwitch extends btn {
    constructor(node) {
        super();
        this.node = node;
        this.name = 'danmuSwitch';
        this.danmuSwitch = null;
        this._action = null;
        this._bulletVisible = null;
        this._span = null;
    }

    render() {
        this.danmuSwitch = document.createElement('div');
        this.danmuSwitch.className = 'M706C61796572-control-danmuSwitch M706C61796572-btn M706C61796572-control-danmuOn';

        this._span=document.createElement('span');
        this._span.innerText='弹幕';
        this._span.addEventListener('click',(e)=>{
            if ( e && e.stopPropagation ) {
                e.stopPropagation(); 
            }else{
                window.event.cancelBubble = true; 
            } 
        });
        this.danmuSwitch.appendChild(this._span)

        this._bulletVisible = true;
        this.node.appendChild(this.danmuSwitch);
        this.danmuSwitch.addEventListener('click', this.onClickHandle.bind(this));
    }

    onClickHandle(e) {
        if (this._bulletVisible) {
            this._offBullet();
        } else {
            this._onBullet();
        }
        this._action = 'bulletVisible';
        super.disptchStatusEvent(this.name, this._action)
    }

    hasOwnAttribute(str) {
        return ((this.__proto__).hasOwnProperty(str));
    }

    set bulletVisible(bool) {
        if (bool) {
            this._onBullet();
        } else {
            this._offBullet();
        }
    }

    get bulletVisible() {
        return this._bulletVisible;
    }

    _onBullet() {
        this._bulletVisible = true;
        this.danmuSwitch.className = "M706C61796572-control-danmuSwitch M706C61796572-btn M706C61796572-control-danmuOn";
    }
    _offBullet() {
        this._bulletVisible = false;
        this.danmuSwitch.className = "M706C61796572-control-danmuSwitch M706C61796572-btn M706C61796572-control-danmuOff";
    }
}

export default danmuSwitch;