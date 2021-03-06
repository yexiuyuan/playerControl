import './title.css'

class title {
    constructor(node) {
        this.node = node;
        this.name = 'Title';
        this._view = null;
    }
    render() {
        this._view = document.createElement('div');
        this._view.className = 'M706C61796572-control-title';

        this._title = document.createElement('div');
        this._title.className = 'M706C61796572-control-title-content';
        this._view.appendChild(this._title);

        this._time = document.createElement('div');
        this._time.className = 'M706C61796572-control-title-time';
        this._view.appendChild(this._time);

        this.node.appendChild(this._view);

        this.visible = false;

        setInterval((e) => {
            let time=(new Date()).toLocaleTimeString('chinese',{hour12:false});
            this._time.innerHTML = time.substring(0,time.length-3);
        }, 1000);

    }

    hasOwnAttribute(str) {
        return ((this.__proto__).hasOwnProperty(str));
    }

    set content(str) {
        this._title.innerText = str;
    }

    set visible(bool) {
        this._view.style.display = bool ? 'block' : 'none';
    }

    get visible() {
        return this._view.style.display == 'none' ? false : true;
    }
}

export default title;