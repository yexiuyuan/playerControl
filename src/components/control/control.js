import PlayBtn from './playBtn/playBtn';
import PauseBtn from './pauseBtn/pauseBtn';
class control {
  // static ins = null;
  constructor() {
    this.leftControl = document.getElementsByClassName('control-left')[0];
    this.rightControl = document.getElementsByClassName('control-right')[0];

    this.itemsDic=new Array();

    this.itemsDicFunc();
  }

  itemsDicFunc(){
    this.itemsDic["Play"]=PlayBtn;
    this.itemsDic["Pause"]=PauseBtn;
  }

  renderLeft(arr) {
    console.log(this.itemsDic['Play1'])
    let name='';
    for(let i=0;i<arr.length;i++){
      name=arr[i];
      if(this.itemsDic[name]){
        let item=new this.itemsDic[name](this.leftControl)
        item.render();
        item.on('xycControlView',(e)=>{
          console.log(item.name)
        });
      }else{
        console.log(name,'没找到')
      }
     
    }
  }

  renderRight(arr){
    
  }

  static getInstance() {
    if (!control.ins) {
      control.ins = new control();
    }
    return control.ins;
  }

  disptchStatusEvent(module,info){
    this.emit('xycControlView',{module:module,info:info});
  }
}

export default control;