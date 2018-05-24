import './menu.css'
import btn from '../btn/btn'
class menu extends btn {
    constructor(node) {
        super();
        this.node = node;
        this.name = 'Menu'
        this._menu = null;
        this._ul = null;
        this._point = null;
    }

    render(data) {
        if (data.length <= 0) {
            console.log('缺少参数，右键初始化失败')
            return
        }
        this._menu = document.createElement('div');
        this._menu.className = 'M706C61796572-menu';
        this.node.appendChild(this._menu);

        this._ul = document.createElement('ul')
        this._ul.className = 'M706C61796572-menu-ul';
        this._menu.appendChild(this._ul);

        for (let i = 0; i < data.length; i++) {
            let _li = document.createElement('li');
            _li.className = 'M706C61796572-menu-ul-li';
            _li.index = i;
            _li.innerText = data[i].label;
            this._ul.appendChild(_li);

        }

        this._ul.addEventListener('click', this._itemSelect.bind(this))

        this.node.oncontextmenu = (ev) => {
            var oEvent = ev || event;
            this.visible = true;
            
            let cx = oEvent.clientX;
            let cy = oEvent.clientY;
            let mediaElem = this.node;
            let mediaClientRect = mediaElem.getBoundingClientRect();
            let mediaX = mediaClientRect.left;
            let mediaY = mediaClientRect.top;
            let mediaW = mediaElem.clientWidth;
            let mediaH = mediaElem.clientHeight;

            console.log( cx,cy )
            console.log( mediaX,mediaY )
            console.log( mediaW,mediaH )
            console.log( mediaClientRect )
            this.point = {
                x: oEvent.clientX - this.node.offsetLeft + "px",
                y: oEvent.clientY - this.node.offsetTop + "px"
            }

            return false;

        }
        this.node.addEventListener('click', this._hideMenuHandler.bind(this))
    }

    _itemSelect(e) {
        super.disptchStatusEvent(this.name, e.target.index);
    }

    _hideMenuHandler(ev) {
        this.visible = false;
    }

    set point(obj) {
        this._point = obj;
        this._menu.style.left = this._point.x;
        this._menu.style.top = this._point.y;
    }

    get point() {
        return this._point;
    }

    set visible(bool) {
        this._menu.style.display = bool ? 'block' : 'none';
    }

    get visible() {
        return this._menu.style.display == 'none' ? false : true;
    }

    hasOwnAttribute(str) {
        return ((this.__proto__).hasOwnProperty(str));
    }
}

export default menu;