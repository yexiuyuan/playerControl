/**
 * Created by douxingxiang on 2018/4/13.
 */
import Polyfill from "./polyfill/Polyfill";
import EventEmitter from "events";
import Control from "./modules/control/ControlModule"
class PGCPlayer extends EventEmitter {

  constructor() {
    super();
    //播放器类型
    this.type = "h5";
    this.render();
  }

  render() {
    Control.stage = document.getElementsByClassName("video-container")[0];
    Control.getInstance.renderCtrol(['Play', 'Reload'], 'left')
    Control.getInstance.renderCtrol(['FullScreen', 'PageFull', 'Voice', 'Sharpness', 'Bullet'], 'right');

    Control.getInstance.renderAct();
    Control.getInstance.rendPreView("loading");
    Control.getInstance.renderTips();
    Control.getInstance.renderTitle();

    Control.getInstance.setAttribute('Play', 'visible', true);
    Control.getInstance.setAttribute('Play', 'playState', false);
    Control.getInstance.setAttribute('Sharpness', 'sharpnessList', {
      'currentResolution': '高清',
      'select': ['蓝光', '高清', '标清']
    });
    Control.getInstance.setAttribute('Bullet', 'bulletVisible', false);
    Control.getInstance.setAttribute('PreView', 'visible', false);
    Control.getInstance.setAttribute("PreView", 'State', 'end');
    Control.getInstance.setAttribute("Tips", 'Content', 'lei啊lei啊，快活啊！');
    Control.getInstance.setAttribute("Title", 'Content', 'lei啊lei啊，快活啊！');
    console.log(Control.getInstance.getAttribute('Play', 'visible'));
    console.log(Control.getInstance.getAttribute('Play', 'playState'));
    Control.getInstance.on('xycControlView', (arg) => {
      switch (arg.module) {
        case 'Play':
          if (Control.getInstance.getAttribute('Play','playState')) {
            console.log('播放状态')
          } else {
            console.log('暂停状态')
          }
          break;
        case 'FullScreen':
          if(Control.getInstance.getAttribute('FullScreen','isFullScreen')){
            Control.getInstance.setAttribute('Title','visible',true);
          }else{
            Control.getInstance.setAttribute('Title','visible',true);
          }
          break;
        default:
          break;
      }
    })
  }

  /**
   *
   * @param opts
   *  container   Element
   *  playerId    string
   */
  init(opts) {
    this.opts = opts;
    this.createDOM();
    this.bindEvents();
  }

  createDOM() {
    let container = this.opts.container;
    if (!container) {
      throw new Error("container not exists");
    }
    let elem = document.getElementById(this.opts.playerId || "xplayer");
    if (!elem) {
      //todo 创建dom
      // elem =
      container.appendChild(elem);
    }
  }

  bindEvents() {

  }

  unbindEvents() {

  }

  /**
   * 开始播放
   * @param url 流地址
   * @param type 流类型 可选
   */
  startPlay(url, type) {

  }

  pausePlay() {

  }

  stopPlay() {

  }

  resumePlay() {

  }

  destroy() {
    this.unbindEvents();
  }

  //静态实例引用
  static ins = null;
  static initialize() {
    if (!PGCPlayer.ins) {
      PGCPlayer.ins = new PGCPlayer();
      if (window.PlayerSDK) {
        PlayerSDK.H5Player = PGCPlayer.ins;
      }
      Polyfill.install();
    }
  }
}

PGCPlayer.initialize();
export default PGCPlayer.ins;