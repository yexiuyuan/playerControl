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
import Menu from './menu/menu'
import Logo from './logo/logo'

import Log from './Log';

import './control_css.css';
class control {
    static ins = null;
    static stage = null;
    _inControl; //鼠标是否在菜单栏
    _showControl = true; //控制栏是否在舞台上
    _inStage = false;
    _onFocusStage=false;//当前焦点是否在舞台上
    constructor() {
        this.name = 'ControlModule';
        this.actView = null; //小剧场
        this._emitter = new EventEmitter();

        this._mouseInterval = null;

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
        this._leftEleArr = new Array(); //control左边
        this._rightEleArr = new Array(); //control右边
        this.itemsDicFunc();

        control.stage.addEventListener('mouseleave', this._eventHandler.bind(this));
        control.stage.addEventListener('mouseenter', this._eventHandler.bind(this));
        control.stage.addEventListener('mousemove', this._eventHandler.bind(this));

        // this.main.addEventListener('webkitTransitionEnd',(e)=>{
        //     console.log('缓动完成');
        // });

        this.main.addEventListener('mouseleave', () => {
            this._inControl = false;
        });

        this.main.addEventListener('mouseenter', () => {
            this._inControl = true;
        });

        this._vestInterval();

        document.addEventListener('keydown', this._keyBoardHnalder.bind(this));

        //以下两个监听是判断当前焦点是否在video中的依据
        document.addEventListener('click',(e)=>{
            if(e.target==control.stage){
                this._onFocusStage=true;
            }else{
                this._onFocusStage=false;
            }
        })
      

    }

    _keyBoardHnalder(e) {
        if (this._onFocusStage == false ) {
            return
        }else { //焦点在播放器
            if (e.key == 'ArrowUp') {
                this.setAttribute('Voice', 'changeVolunm', 10);
            } else if (e.key == 'ArrowDown') {
                this.setAttribute('Voice', 'changeVolunm', -10);
            }
            e.preventDefault();
            e.stopPropagation();
        }

    }

    _vestInterval() {
        if (this._mouseInterval != null) {
            return
        }
        this._mouseInterval = setInterval(() => {
            if (this._showControl == true) {
                this._controlHide();
            }
        }, 5000);
    }

    _killInterval() {
        clearInterval(this._mouseInterval);
        this._mouseInterval = null;
    }

    _controlHide() {
        if (this._showControl == false) {
            return
        }
        if (this._inControl == true) {
            return;
        }
        this._showControl = false;
        this.controlHide();
        this.setAttribute('Tips', 'posY', 0)
        this._killInterval();
        this._disptchStatusEvent('LineHeight', 0)
        if (this.isHasInstanceByName('ActView')) {
            this.setAttribute('ActView', 'show', false);
        }
        this.setAttribute('Title', 'visible', false);
    }

    _controlShow() {
        if (this._showControl == true) {
            return
        }
        this._showControl = true;
        this.controlShow();

        this.setAttribute('Tips', 'posY', 33)
        this._vestInterval()
        if (this.isHasInstanceByName('ActView')) {
            this._disptchStatusEvent('LineHeight', 40);
            this.setAttribute('ActView', 'show', true);
        } else {
            this._disptchStatusEvent('LineHeight', 0)
        }
        if (this.getAttribute('Title', 'visible')) {
            this._disptchStatusEvent('LineHeight', 40)
        }
        this.setAttribute('Title', 'visible', ((this.isFullScreen) ? true : false));
    }

    _eventHandler(e) {
        if (e.type == 'mouseenter') {
            // document.addEventListener('keydown',this._keyBoardHnalder.bind(this));
            this._inStage = true;
            this._controlShow();
        } else if (e.type == 'mouseleave') {
            // document.removeEventListener('keydown',this._keyBoardHnalder.bind(this));
            this._inStage = false;
            setTimeout(() => {
                this._controlHide();
            }, 1000);
        } else if (e.type == 'mousemove') {
            this._controlShow()
        } else if (e.type == 'mouseover') {
            this._controlShow();
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

    renderLeft(arr) {
        this._leftEleArr = arr;
        this.renderCtrol(arr, 'left');
    }

    renderRight(arr) {
        this._rightEleArr = arr;
        this.renderCtrol(arr, 'right');
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
                    } else if (name == 'PageFull') {
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
            if (this.setItemToDic('ActView', actView)) {
                actView.render();
            }
        }
    }

    /**
     * loading end error
     * @data  
     * @msg 
     */
    rendPreView(data, msg) {
        if (!this.isHasInstanceByName('PreView')) {
            let preView = new PreView(control.stage);
            if (this.setItemToDic('PreView', preView)) {
                preView.render();
            }
        }
        this.getInstanceByName('PreView').state(data, msg);
    }
    /**
     * 提示
     * @data 
     */
    renderTips(data) {
        if (!this.isHasInstanceByName('Tips')) {
            let tips = new Tips(control.stage);
            if (this.setItemToDic('Tips', tips)) {
                tips.render();
            }
        }
        this.setAttribute('Tips', 'content', '欢迎来到爱奇艺大直播！！！');
    }
    /**
     * 直播标题
     * @data
     */
    renderTitle(data) {
        if (!this.isHasInstanceByName('Title')) {
            let title = new Title(control.stage)
            if (this.setItemToDic('Title', title)) {
                title.render();
            }
        }
        this.setAttribute('Title', 'content', '欢迎来到爱奇艺大直播！！！');
    }

    /**
     * 鼠标右键
     */
    renderMenu(data) {
        if (!this.isHasInstanceByName('Menu')) {
            let menu = new Menu(control.stage);
            if (this.setItemToDic('Menu', menu)) {
                menu.render(data);
                menu.on('xycControlView', this._statusEvent.bind(this));
            }
        }
    }

    /**
     * logo 水印
     */
    renderLogo() {
        if (!this.isHasInstanceByName('Logo')) {
            let logo = new Logo(control.stage);
            if (this.setItemToDic('Logo', logo)) {
                logo.render();
            }
        }
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

    get controlVisible() {
        return this._showControl;
    }

    //通过css来实现缓动
    controlShow() {
        this.main.className = 'M706C61796572-control M706C61796572-control-show';
    }

    controlHide() {
        this.main.className = 'M706C61796572-control M706C61796572-control-hide';
    }

    get isFullScreen() {
        return this.getInstanceByName('FullScreen').isFullScreen;
    }

    /**
     * 
     * @module 组件名
     * @info 信息
     */
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
    addElement(name, index, type) {

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