import './fullScreen.css';
import btn from '../btn/btn';
class fullScreen extends btn {
  constructor(node) {
    super();
    this.node = node;
    this.name = 'FullScreen';
    this.fullScreen = null;
    this.action = 'fullScreen';
    this.videoNode = null;
    this.oldSize = {
      width: 0,
      height: 0
    };
  }
  render() {
    console.log('fullScreen render')
    this.fullScreen = document.createElement('div');
    this.fullScreen.className = 'M706C61796572-control-fullScreen M706C61796572-btn';
    this.node.appendChild(this.fullScreen);
    this.fullScreen.addEventListener('click', this.onClickHandle.bind(this));

    this.bindFullEvent();
  }

  bindFullEvent() {
    ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"].forEach((eventType) => {
      document.addEventListener(eventType, (event) => {
        if (this.isFullScreen) {
          console.log('进入全屏');
          this.action = 'fullScreen';
          this.fullScreen.className = 'M706C61796572-control-resizeScreen M706C61796572-btn';
          this.videoNode.style.width = "100%";
          this.videoNode.style.height = "100%";
        } else {
          console.log('退出全屏');
          this.action = 'exitFullScreen';
          this.fullScreen.className = 'M706C61796572-control-fullScreen M706C61796572-btn';
          this.videoNode.style.width = this.oldSize["width"] + "px";
          this.videoNode.style.height = this.oldSize["height"] + "px";
        }
        super.disptchStatusEvent(this.name, this.action)
      });
    });
  }

  onClickHandle(e) {
    if (!this.isFullScreen) {
      this.requestFullScreen();
    } else {
      this.exitFullScreen();
    }
  }

  requestFullScreen() {
    if (this.videoNode.requestFullscreen) {
      this.videoNode.requestFullscreen();
    } else if (this.videoNode.mozRequestFullScreen) {
      this.videoNode.mozRequestFullScreen();
    } else if (this.videoNode.msRequestFullscreen) {
      this.videoNode.msRequestFullscreen();
    } else if (this.videoNode.webkitRequestFullscreen) {
      this.videoNode.webkitRequestFullScreen();
    }
  }

  exitFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  set getParentNode(obj) {
    this.videoNode = obj;
    this.oldSize = {
      "width": obj.offsetWidth,
      "height": obj.offsetHeight
    };
  }

  get isFullScreen() {
    return document.webkitIsFullScreen === true ||
      document.mozFullScreen === true ||
      document.msFullscreenElement === true ||
      (document.fullscreenElement ? true : false);
  }

  set isFullScreen(bool){
    console.log('aaaa')
    this.onClickHandle(null);
  }

}

export default fullScreen;