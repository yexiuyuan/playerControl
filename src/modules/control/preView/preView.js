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


  set setTypeContent(data) {
    // data是SDK传进来的类型分为三种loading，leave，end
    var contentHTML = "";
    switch (data) {
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
            <p>主播离开了，马上回来哦~</p>
          </div>
        `;
        this.preView.innerHTML = contentHTML;
        break;
      case "end":
        contentHTML += `
          <div class="preViewContent">
            <p>直播结束了，有回看哦~</p>
            <a href="javascript:;"></a>
          </div>
        `;
        this.preView.innerHTML = contentHTML;
        break;
      default:
    }
  }
}
export default preView