import './tips.css';
class tips {
  constructor(node) {
    this.node = node;
    this.name = 'Tips';
    this._view = null;
  }
  render() {
    this._view = document.createElement('div');
    this._view.className = 'M706C61796572-control-tips';
    this.node.appendChild(this._view);
    this.visible=false;
  }

  set content(str) {
    this._view.innerHTML = str;
    this.visible=true;
    setTimeout(() => {
      this.visible=false;
    }, 3000)
  }

  set visible(bool) {
    this._view.style.display = bool ? 'block' : 'none';
  }

  set posY(num) {
    this._view.style.bottom = num + 'px';
  }

}
export default tips;