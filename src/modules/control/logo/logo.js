import './logo.css'
class logo {
    constructor(node) {
        this.node = node;
        this.name = 'Logo';
        this._logo = null;
    }

    render() {
        this._logo = document.createElement('img');
        this._logo.className = 'M706C61796572-logo';
        this._logo.src = '//test-static-x.pps.tv/flash/test/asset/logo.png';
        this.node.appendChild(this._logo);
    }

    set point(obj) {
        this._logo.style.top = obj.top + 'px';
        this._logo.style.right = obj.right + 'px';
    }

    set scale(s) {
        this._logo.style.width = 79 * s + 'px';
        this._logo.style.height = 65 * s + 'px';
    }

    set visible(bool) {
        this._logo.style.display = bool ? 'block' : 'none';
    }

    get visible() {
        return this._logo.style.display == 'none' ? false : true;
    }

    hasOwnAttribute(str) {
        return ((this.__proto__).hasOwnProperty(str));
    }


}

export default logo;