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
    Control.getInstance.renderCtrol(['FullScreen','PageFull' ,'Voice', 'Resolution', 'DanmuSwitch'], 'right');

    Control.getInstance.renderAct();
    Control.getInstance.rendPreView("loading");
    Control.getInstance.renderTips();
    Control.getInstance.renderTitle();

    Control.getInstance.setAttribute('Play','visible',true);
    Control.getInstance.setAttribute('Resolution','resolutionList',{
      'currentResolution': '高清',
      'select': ['蓝光', '高清', '标清']
    });
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