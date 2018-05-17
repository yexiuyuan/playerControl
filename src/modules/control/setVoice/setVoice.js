import './setVoice.css';
import btn from '../btn/btn';
import drag from '../drag/drag'
class setVoice extends btn {
  constructor(node) {
    super();
    this.node = node;
    this.name = 'setVoice';
    this.setVoice = null;
    this.leftIcon = null;
    this.handBar = null;
    this.voiceTip = null;
    this.rightHighLight = null;
    this.rightBar = null;
    this.currentVoice = 50;
  }
  /**
   * 组件渲染
   */
  render() {
    console.log('resolution render')
    this.setVoice = document.createElement('div'); //创建设置音量容器
    this.setVoice.className = "M706C61796572-control-setVoice M706C61796572-btn";
    //下面是拖拽条的NTML内容
    var html = `<div id="leftIcon"></div>
						<div class="rightBar">
							<div class="rightHighLight" style="width:50%"></div>
							<div class="handBar" style="left:50%">
								<p class="voiceTip">50%</p>
							</div>
						</div>`;
    this.setVoice.innerHTML = html;
    this.node.appendChild(this.setVoice);
    this.handBar = this.setVoice.getElementsByClassName("handBar")[0];
    this.rightHighLight = this.setVoice.getElementsByClassName("rightHighLight")[0];
    this.rightBar = this.setVoice.getElementsByClassName("rightBar")[0];
    this.voiceTip = this.setVoice.getElementsByClassName("voiceTip")[0];
    this.leftIcon = document.getElementById("leftIcon");
    this.leftIcon.addEventListener('click', this.muteSwitch.bind(this)) //静音切换
    this.rightBar.addEventListener('click', this.clickBar.bind(this), true) //点击音量条修改音量
    var myDrag = new drag(this.handBar, this.rightBar, this.dragfn.bind(this)); //引进拖拽类，包装当前的音量条
    myDrag.init();
  }
  /**
   * 静音切换
   */
  muteSwitch() {
    var lastVoiceClass = this.leftIcon.className;
    var lastVoiceNumber = parseInt(this.rightHighLight.style.width);
    var lastBarLeft = this.handBar.offsetLeft;
    if (lastVoiceClass != "mute") {
      localStorage.setItem("lastVoiceNumber", lastVoiceNumber);
      localStorage.setItem("lastBarLeft", lastBarLeft);
      this.actionWithVoice(0)
      this.handBar.style.left = 0;
    } else {
      var nowCurVoice = parseInt(localStorage.getItem("lastVoiceNumber"));
      this.actionWithVoice(nowCurVoice)
      this.handBar.style.left = localStorage.getItem("lastBarLeft") + 'px';
    }
  }
  /**
   * 拖拽执行
   */
  dragfn(e) {
    this.actionWithVoice(e)
  }
  /**
   * 音量变化的联动
   */
  actionWithVoice(e) {
    this.voiceTip.innerText = e + '%';
    this.rightHighLight.style.width = e + '%';
    if (e == 0) {
      console.log("静音");
      this.leftIcon.className = "mute";
    } else if (e > 0 && e <= 30) {
      console.log("小音量");
      this.leftIcon.className = "smallVoice";
    } else if (e > 30 && e <= 60) {
      console.log("中音量");
      this.leftIcon.className = "middleVoice";
    } else if (e > 60 && e <= 100) {
      console.log("大音量");
      this.leftIcon.className = "bigVoice";
    }
    this.currentVoice = e;
    super.disptchStatusEvent(this.name, e)
  }

  /**
   * 进度条点击
   */
  clickBar(ev) {
    if (!drag.clickFlag) {
      console.log("这个点击事件不起效")
      drag.clickFlag = true
      return;
    }
    var oEvt = ev || event;
    var barWidth = this.rightBar.offsetWidth;
    var disX = oEvt.offsetX;
    console.log(oEvt.offsetX, oEvt.layerX)
    var curPersent = ~~(disX / barWidth * 100);
    var w = this.handBar.offsetWidth;
    this.handBar.style.left = disX - w / 2 + 'px';
    this.actionWithVoice(curPersent)
  }




  get voiceSet() {
    return this.currentVoice;
  }
}
export default setVoice;