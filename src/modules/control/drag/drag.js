class drag {
  constructor(handBar, parentContent, fn) {
    this.handBar = handBar;
    this.parentContent = parentContent;
    this.dragFn = fn;
    console.log(handBar, parentContent, fn)
  }
  init() {
    this.handBar.addEventListener('mousedown', this.onMousedownHandle.bind(this), false);
  }

  onMousedownHandle(ev) {
    var _this = this.handBar;
    var _this_parent = this.parentContent;
    var bWidth = _this.offsetWidth; //这里获取到的是拖拽元素的宽度
    var pWidth = _this_parent.offsetWidth; //这里取到的是容器的宽度
    var bHeight = _this.offsetHeight; //这里获取到的是拖拽元素的高度
    var pHeight = _this_parent.offsetHeight; //这里取到的是容器的高度

    var oEvt = ev || event;
    var disX = oEvt.clientX - _this.offsetLeft; //记录一个不变的距离X轴
    var disY = oEvt.clientY - _this.offsetTop; //记录一个不变的距离Y轴

    document.onmousemove = (ev) => {
      var oEvt = ev || event;
      var left_x = oEvt.clientX - disX + (bWidth / 2); //计算百分比
      var l = oEvt.clientX - disX;
      var t = _this.offsetTop;
      // 确保在父级容器内拖拽
      if (l < -(bWidth / 2)) {
        l = -(bWidth / 2);
      } else if (l > pWidth - (bWidth / 2)) {
        l = pWidth - (bWidth / 2);
      }
      //清除点击事件
      if (l > 7) {
        drag.clickFlag = false
      }
      if (left_x < 0) {
        left_x = 0;
      } else if (left_x > pWidth) {
        left_x = pWidth;
      }
      var widthPersent = ~~(left_x / pWidth * 100);
      // 判断可以拖拽的方向
      _this.style.top = t + 'px';
      _this.style.left = l + 'px';
      this.dragFn && this.dragFn(widthPersent);
    }
    document.onmouseup = (ev) => {
      document.onmousemove = null; //为了不粘我
      document.onmouseup = null; //为了性能考虑
      _this.releaseCapture && _this.releaseCapture(); //释放截获

    }
    _this.setCapture && _this.setCapture(); //截获所有其他事件
    oEvt.preventDefault && oEvt.preventDefault()
    return false; //阻止默认  for  高
  }
}
drag.clickFlag = true;
export default drag;