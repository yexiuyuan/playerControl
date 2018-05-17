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
    console.log(this.name, 'render');
    this.pageFull = document.createElement('div');
    this.status = 'normal';
    this.node.appendChild(this.pageFull);
    this.pageFull.addEventListener('click', this.pageFullHandler.bind(this));
  }
  pageFullHandler(e) {
    if (this.action == 'normal') {
      this.status = 'pageFull';
      this.action = 'pageFull';
    } else if (this.action == 'pageFull') {
      this.status = 'normal';
      this.action = 'normal';
    }
    super.disptchStatusEvent(this.name,this.action)
  }
  set status(status) {
    if (status == 'normal') {
      this.pageFull.className = 'M706C61796572-control-pageFull btn';
    } else if (status == 'pageFull') {
      this.pageFull.className = 'M706C61796572-control-exitPageFull btn';
    }
  }

  get status(){
    return this.action;
  }

}

export default pageFull;