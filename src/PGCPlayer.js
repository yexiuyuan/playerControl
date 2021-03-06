/**
 * Created by douxingxiang on 2018/4/13.
 */
import Polyfill from "./polyfill/Polyfill";
import EventEmitter from "events";
import Control from "./modules/control/ControlModule"
import Storage from './StorageManage'
class PGCPlayer extends EventEmitter {

    constructor() {
        super();
        //播放器类型
        this.type = "h5";
        this.render();
        Storage.set('xyc', {
            a: '1',
            b: '2'
        })
        console.log(Storage.get('xyc'))
        Storage.add('xyc', {
            c: '4'
        })
    }

    render() {
        Control.stage = document.getElementsByClassName("video-container")[0];
        Control.getInstance.renderCtrol(['Play', 'Refresh'], 'left')
        Control.getInstance.renderCtrol(['FullScreen', 'PageFull', 'Voice', 'Sharpness', 'Bullet'], 'right');

        // Control.getInstance.controlVisible=false;

        Control.getInstance.renderAct();
        Control.getInstance.rendPreView("end", '');
        Control.getInstance.renderTips();
        Control.getInstance.renderTitle();
        Control.getInstance.renderMenu([{label:'版本号：2018.5.21.01'},{label:'切换到flash播放器'},{label:'保存日志'}]);
        Control.getInstance.renderLogo();
        Control.getInstance.setAttribute('Logo','point',{top:20,right:20})
        Control.getInstance.setAttribute('Logo','scale',0.8)
        Control.getInstance.setAttribute('Logo','visible',true)

        Control.getInstance.setAttribute('Play', 'visible', true);
        Control.getInstance.setAttribute('Play', 'playState', false);
        Control.getInstance.setAttribute('Sharpness', 'sharpnessList', [{
            label: '清晰度1',
            level: 1
        }, {
            label: '清晰度2',
            level: 2
        }, {
            label: '清晰度3',
            level: 3
        }]);
        Control.getInstance.setAttribute('Sharpness', 'curSharpnessIndex', 2);
        Control.getInstance.setAttribute('Sharpness', 'curSharpnessVo', {
            label: '清晰度2'
        });
        // control.getInstance.setAttribute('Sharpness','visible',false)
        console.log(Control.getInstance.getAttribute('Sharpness', 'curSharpnessVo'));
        // Control.getInstance.setAttribute('Bullet', 'bulletVisible', false);
        Control.getInstance.rendPreView('error')
        Control.getInstance.setAttribute('PreView', 'visible', false);
        Control.getInstance.setAttribute("Tips", 'content', 'lei啊lei啊，快活啊！');
        Control.getInstance.setAttribute("Title", 'content', 'lei啊lei啊，快活啊！');

        Control.getInstance.setAttribute('ActView', 'visible', true);
        Control.getInstance.setAttribute('ActView', 'viewData', {
            videoTitle: '爱奇艺大剧场',
            videoDuration: 222,
            videoPlayTime: 111
        });


        console.log(Control.getInstance.getAttribute('Play', 'visible'));
        console.log(Control.getInstance.getAttribute('Play', 'playState'));


        console.log(Control.getInstance.getAttribute('Voice', 'volunm'));
        Control.getInstance.setAttribute('Voice', 'volunm', 80);
        console.log(Control.getInstance.getAttribute('Voice', 'volunm'));
        Control.getInstance.on('xycControlView', (arg) => {
            console.log(arg.module, ':::::', arg.info);
            switch (arg.module) {
                case 'Play':
                    if (Control.getInstance.getAttribute('Play', 'playState')) {
                        console.log('点击播放')
                    } else {
                        console.log('点击暂停')
                    }
                    break;
                case 'Refresh':
                    console.log('点击刷新');
                    break;
                case 'Bullet':
                    switch (arg.info) {
                        case 'bulletVisible':
                            console.log('弹幕开关', Control.getInstance.getAttribute('Bullet', 'bulletVisible'));
                        default:
                            break;
                    }
                    break;
                case 'Sharpness':
                    console.log('选择当前清晰度信息', Control.getInstance.getAttribute('Sharpness', 'curSharpnessVo'));
                    break;
                case 'Voice':
                    console.log('音量', arg.info)
                    console.log(Control.getInstance.getAttribute('Voice', 'volunm'))
                    break;
                case 'PageFull':
                    if (Control.getInstance.getAttribute('PageFull', 'isPageFull')) {

                    } else {

                    }
                    Control.getInstance.setAttribute('FullScreen', 'isFullScreen', false)
                    break;
                case 'FullScreen':
                    if (Control.getInstance.getAttribute('FullScreen', 'isFullScreen')) {
                        Control.getInstance.setAttribute('Title', 'visible', true);
                        Control.getInstance.setAttribute('ActView', 'visible', false);
                    } else {
                        Control.getInstance.setAttribute('Title', 'visible', false);
                        Control.getInstance.setAttribute('ActView', 'visible', true);
                    }
                    Control.getInstance.setAttribute('PageFull', 'isPageFull', false)
                    break;
                case 'LineHeight':
                    // console.log('是否有标题、ACT、底部且高度是', arg.info)
                    break;
                case 'Menu':
                    console.log('右键键值',arg.info)
                    if(arg.info === 1)
                    {
                        //TODO 切换成flash
                    }
                    else if(arg.info === 2)
                    {
                        //TODO 保存是日志
                        let data = `哈哈哈哈哈，我是测试文件`;
                        let blob = new Blob([data], {type: 'text/plain'}),
                            fileName = 'log.txt';
                        let link = document.createElement('a');
                        link.style = "display: none";
                        link.href = window.URL.createObjectURL(blob);
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        setTimeout(()=> {
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(link.href);
                        }, 5);
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