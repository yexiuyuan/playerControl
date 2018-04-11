import './playBtn.styl';
import btn from '../btn/btn';
class playBtn extends btn {
  constructor(node) {
    super();
    this.node = node;
    this.name='Play';
    this.play=null;
  }
  render() {
    console.log('playBtn render')

    this.play=document.createElement('div');
    this.play.className='M706C61796572-control-playBtn btn';
    this.node.appendChild(this.play);
    
    this.node.appendChild(this.play);

    this.play.addEventListener('click',this.onClickHandle.bind(this));
  }

  onClickHandle(e){
    super.disptchStatusEvent(this.name,'aaa')
  }

  
  get visible() {
    return (this.play.style.display == 'none' ? false : true);
  }

  set visible(bool) {
    this.play.style.display = (bool ? 'block' : 'none');
  }
}

export default playBtn;