import btn from "../btn/btn";
import './pauseBtn.css';
export default class pauseBtn extends btn {
  constructor(node) {
    super();
    this.node = node;
    this.name='Pause';
    this.pause = null;
  }
  render() {
    console.log('pauseBtn render');

    this.pause = document.createElement('div');
    this.pause.className = 'M706C61796572-control-pauseBtn btn';
    this.pause.style.display = 'block';

    this.node.appendChild(this.pause);

    this.pause.addEventListener('click',this.onClickHandle.bind(this));
  }

  onClickHandle(e){
    super.disptchStatusEvent(this.name,'bbb');
  }

}