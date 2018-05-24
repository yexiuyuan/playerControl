import './preView.css';
class preView {
    constructor(node) {
        this.name = 'preView';
        this.node = node;
        this.preView = null;
    }
    render() {
        console.log('preView render');
        this.preView = document.createElement('div');
        this.preView.className = "M706C61796572-control-preView";
        this.node.appendChild(this.preView);
    }

    hasOwnAttribute(str) {
        return ((this.__proto__).hasOwnProperty(str));
    }

    state(value, msg) {
        this.visible = true;
        // data是SDK传进来的类型分为三种loading，leave,error
        let contentHTML = "";
        switch (value) {
            case "loading":
                contentHTML += `
          <div class="preViewContent">
            <div>
              <img src="//test-static-x.pps.tv/flash/test/asset/iqiyi_logo.png" alt="IQiYiLogo"/>
            </div>
            <img src="//test-static-x.pps.tv/flash/test/asset/iqiyi_loading_line.gif" alt="" />
          </div>
        `;
                this.preView.innerHTML = contentHTML;
                break;
            case "leave":
                contentHTML += `
          <div class="preViewContent">
            <p>直播未开始，去看看其他直播吧~</p>
          </div>
        `;
                this.preView.innerHTML = contentHTML;
                break;
            case "error":
                let str = msg ? msg : '当前播放出错';
                contentHTML += `
          <div class="preViewContent">
            <p>${str}</p>
            <a href=""></a>
          </div>
        `;
                this.preView.innerHTML = contentHTML;
                break;
            default:
        }
    }

    set visible(bool) {
        this.preView.style.display = bool ? 'block' : 'none';
    }

    get visible() {
        return this.preView.style == 'none' ? false : true;
    }
}
export default preView