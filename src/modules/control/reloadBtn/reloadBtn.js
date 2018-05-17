import './reloadBtn.css';
import btn from '../btn/btn';
class reloadBtn extends btn{
  constructor(node){
    super();
    this.name = 'reloadBtn';
    this.node = node;
    this.reload = null;
    this.action = "reload"
  }

  render(){
    this.reload = document.createElement('div');
    this.reload.className = "M706C61796572-control-reloadBtn M706C61796572-btn";
    this.node.appendChild(this.reload);
    this.reload.addEventListener('click',this.onClickHandle.bind(this));
  }

  onClickHandle(){
    super.disptchStatusEvent(this.name,this.action)
  }
}
export default  reloadBtn