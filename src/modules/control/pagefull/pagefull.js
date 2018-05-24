import './pagefull.css'
import btn from '../btn/btn';
class pageFull extends btn {
  constructor(node) {
    super();
    this.node = node;
    this.name = 'PageFull';
    this.pageFull = null;
    this.action = 'normal';
  }

  render() {
    this.pageFull = document.createElement('div');
    this.pageFull.className = 'M706C61796572-control-pageFull M706C61796572-btn';
    this.action = 'normal';
    this._tip='网页全屏';
    this.node.appendChild(this.pageFull);
    this.pageFull.addEventListener('click', this.pageFullHandler.bind(this));
  }

  pageFullHandler(e) {
    if (this.status == 'pageFull') {
      this.status = 'normal';
    } else if (this.status == 'normal') {
      this.status = 'pageFull';
    }
    super.disptchStatusEvent(this.name, this.action)
  }
  set status(status) {
    if (status == 'pageFull') {
      this._pageFull();
    } else if (status == 'normal') {
      this._exitPageFull();
    }
    
  }

  set isPageFull(bool) {
    if(bool){
      this._pageFull();
      
    }else{
      this._exitPageFull();
    }
  }

  get isPageFull() {
    return this.action == 'normal' ? false : true;
  }

  get status() {
    return this.action;
  }

  set _tip(str) {
    this.pageFull.title = str;
  }

  _pageFull() {
    this.pageFull.className = 'M706C61796572-control-exitPageFull M706C61796572-btn';
    this._tip = '退出网页全屏'
    this.action = 'pageFull';
  }
  _exitPageFull() {
    this.pageFull.className = 'M706C61796572-control-pageFull M706C61796572-btn';
    this._tip = '网页全屏'
    this.action = 'normal';
    // localStorage.setItem('oblSize',JSON.stringify(this.oldSize));
  }

  set getParentNode(obj) {
    let oldSize = {
      "width": obj.offsetWidth,
      "height": obj.offsetHeight
    };
    localStorage.setItem('oldSize',JSON.stringify(oldSize));
  }

  hasOwnAttribute(str) {
    return ((this.__proto__).hasOwnProperty(str));
  }
}

export default pageFull;