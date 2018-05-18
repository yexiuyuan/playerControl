import {
  EventEmitter
} from "events";

import PlayBtn from './playBtn/playBtn';
import reloadBtn from './reloadBtn/reloadBtn'
import danmuSwitch from './danmuSwitch/danmuSwitch'
import resolution from './resolution/resolution'
import ActView from './actDataView/actDataView'
import setVoice from './setVoice/setVoice'
import fullScreen from './fullScreen/fullScreen'
import pagefull from './pagefull/pagefull'
import PreView from './preView/preView'
import Tips from './tips/tips'
import Title from './title/title'

import Log from './Log';

import './control_css.css';
class control {
  static ins = null;
  static stage = null;
  constructor() {
    this.name = 'ControlModule';
    this.actView = null; //小剧场
    this._emitter = new EventEmitter();

    this.main = document.createElement('div');
    this.main.className = 'M706C61796572-control';
    control.stage.appendChild(this.main);

    this.leftControl = document.createElement('div');
    this.leftControl.className = 'M706C61796572-control-left';
    this.rightControl = document.createElement('div');
    this.rightControl.className = 'M706C61796572-control-right';

    this.main.appendChild(this.leftControl);
    this.main.appendChild(this.rightControl);

    this.itemsDic = new Array(); //所有组件库
    this.eleDic = new Array(); //当前添加进来的组件库
    this.itemsDicFunc();

    control.stage.addEventListener('mouseleave', this.eventHandler.bind(this));
    control.stage.addEventListener('mouseenter', this.eventHandler.bind(this));
  }

  eventHandler(e) {
    if (e.type == 'mouseenter') {
      Log.L(this.name, '鼠标进入')
      // this.controlVisible = true;
      // this.tips && (this.tips.posY = 33);
      // this.title && this.isFullScreen && (this.title.visible = true);
    } else if (e.type == 'mouseleave') {
      Log.L(this.name, '鼠标移出')
      // this.controlVisible = false;
      // this.tips && (this.tips.posY = 0);
      // this.title && (this.title.visible = false);
    }
  }

  itemsDicFunc() {
    this.itemsDic["Play"] = PlayBtn;
    this.itemsDic["Refresh"] = reloadBtn;
    this.itemsDic["Bullet"] = danmuSwitch;
    this.itemsDic["Sharpness"] = resolution;
    this.itemsDic["Voice"] = setVoice;
    this.itemsDic["FullScreen"] = fullScreen;
    this.itemsDic["PageFull"] = pagefull;
  }

  renderCtrol(arr, side) {
    let name = '';
    let item = null;
    for (let i = 0; i < arr.length; i++) {
      name = arr[i];
      if (this.itemsDic[name]) {
        if (side == "left") {
          item = new this.itemsDic[name](this.leftControl)
        } else if (side == "right") {
          item = new this.itemsDic[name](this.rightControl)
          if (name == 'FullScreen') {
            item.getParentNode = control.stage;
          }
        }
        item.name = name;
        if (this.setItemToDic(name, item)) {
          item.render();
          item.on('xycControlView', this._statusEvent.bind(this));
        }
      } else {
        console.log(name, '没找到')
      }
    }
  }

  /**
   * 将组件加入储存数组
   * @name  名字 
   * @instance  组件 
   */
  setItemToDic(name, instance) {
    if (instance == null) {
      console.log('不存在该组件');
      return false;
    }
    if (this.eleDic[name]) {
      console.log('已存在该名称组件', name);
      return false;
    } else {
      this.eleDic[name] = instance;
      return true;
    }
  }

/**
 * 小剧场信息
 */
  renderAct() {
    if (!this.isHasInstanceByName('ActView')) {
      let actView = new ActView(control.stage);
      if(this.setItemToDic('ActView',actView)){
        actView.render();
      }
    }
  }

  /**
   * loading end error
   * @data  
   * @msg 
   */
  rendPreView(data,msg) {
    if (!this.isHasInstanceByName('PreView')) {
      let preView = new PreView(control.stage);
      if (this.setItemToDic('PreView', preView)){
        preView.render();
      }
    }
    this.getInstanceByName('PreView').state(data,msg);
  }
  /**
   * 提示
   * @data 
   */
  renderTips(data) {
    if (!this.isHasInstanceByName('Tips')) {
      let tips = new Tips(control.stage);
      if(this.setItemToDic('Tips',tips)){
        tips.render();
      }
    }
    this.setAttribute('Tips','content','欢迎来到爱奇艺大直播！！！');
  }
  /**
   * 直播标题
   * @data
   */
  renderTitle(data) {
    if (!this.isHasInstanceByName('Title')) {
      let title = new Title(control.stage)
      if(this.setItemToDic('Title',title)){
        title.render();
      }
    }
    this.setAttribute('Title','content','欢迎来到爱奇艺大直播！！！');
  }

  _statusEvent(arg) {
    this._disptchStatusEvent(arg.module, arg.info);
  }

  static get getInstance() {
    if (!control.ins) {
      control.ins = new control();
    }
    return control.ins;
  }

  set controlVisible(bool) {
    this.main.style.display = bool ? 'block' : 'none';
  }

  get isFullScreen() {
    return this.getInstanceByName('FullScreen').isFullScreen;
  }

  _disptchStatusEvent(module, info) {
    this._emitter.emit('xycControlView', {
      module: module,
      info: info
    });
  }

  on(event, listener) {
    this._emitter.addListener(event, listener);
  }
  /**
   * 设置属性参数
   * @name 组件名
   * @attr 属性名
   * @value 属性值
   */
  setAttribute(name, attr, value) {
    if (this.isHasInstanceByName(name) == false) {
      Log.L(name, '不存在该组件');
      return;
    }
    let instance = this.getInstanceByName(name);
    if (instance.hasOwnAttribute(attr)) {
      instance[attr] = (value);
    } else {
      Log.L(this.name, instance.name + '组件没有' + attr + '属性')
    }
  }
  /**
   * 获取属性参数
   * @name 组件名字
   * @attr 属性名字
   * */
  getAttribute(name, attr) {
    var instance = this.getInstanceByName(name);
    if (instance.hasOwnAttribute(attr)) {
      return instance[attr];
    } else {
      return null;
    }
  }

  /**
   * 添加组件
   * @name 组件名字
   * @index 插到第几个组件
   * @type left right
   */
  addElement(name,index,type) {

  }

  /**
   * 移除组件
   * @name 组件名字
   */
  removeElement(name) {

  }

  /**是否有组件对象 */
  isHasInstanceByName(name) {
    if (this.getInstanceByName(name)) {
      return true;
    }
    return false
  }

  /**获取组件*/
  getInstanceByName(name) {
    return this.eleDic[name];
  }

}

export default control;