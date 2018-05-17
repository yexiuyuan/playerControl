import './resolution.css';
import btn from '../btn/btn';
class resolution extends btn {
  constructor(node) {
    super();
    this.node = node;
    this.name = 'resolution';
    this.resolution = null;
    this.resolutionUl = null;
    this.currentResolutionP = null;
    this.currentResolutionSpan = null;
    this.data = null;
  }
  render() {
    console.log('resolution render')
    this.resolution = document.createElement('div');
    this.resolutionUl = document.createElement('ul');
    this.currentResolutionP = document.createElement('p');
    this.currentResolutionSpan = document.createElement('span');
    // this.resolution.display = "block";
    this.resolution.className = 'M706C61796572-control-resolution btn';
    this.node.appendChild(this.resolution);
    this.resolution.appendChild(this.currentResolutionP);
    this.resolution.appendChild(this.resolutionUl);
    this.currentResolutionP.appendChild(this.currentResolutionSpan)
    this.currentResolutionSpan.addEventListener('click', this.showUpSelect.bind(this))
    this.resolutionUl.addEventListener('click', this.onSelectHandle.bind(this))
  }

  //点击整个组件触发的
  onClickHandle(e) {
    super.disptchStatusEvent(this.name, e)
  }

  //弹出选择列表动作
  showUpSelect() {
    if (this.resolutionUl.className == "showUp") {
      this.resolutionUl.className = "";
    } else {
      this.resolutionUl.className = "showUp";
    }
  }
  // 点击选择列表触发
  onSelectHandle(event) {
    let ev = ev || event;
    var res = ev.target.getAttribute("data-index");
    var resText = ev.target.innerText;
    this.currentResolutionSpan.innerText = resText;
    this.resolutionUl.className = "";
    this.onClickHandle(res)
  }

  resolutionList(data) {
    var contentHTML = '';
    this.currentResolutionSpan.innerText = data.currentResolution;
    for (let i = 0; i < data.select.length; i++) {
      contentHTML += `<li data-index="${i}">${data.select[i]}</li>`;
    }
    this.resolutionUl.innerHTML = contentHTML;
  }

  hasOwnAttribute(str) {
    return ((this.__proto__).hasOwnProperty(str));
  }
}

export default resolution;