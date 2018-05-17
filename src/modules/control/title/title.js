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
      this._time.innerHTML = (new Date()).toLocaleTimeString();
    }, 1000);

  }

  hasOwnAttribute(str) {
    return ((this.__proto__).hasOwnProperty(str));
  }

  set Content(str) {
    console.log('aaaaaaaaa');
    this._title.innerText = str;
  }

  set visible(bool) {
    this._view.style.display = bool ? 'block' : 'none';
  }
}

export default title;