import './resolution.css';
import btn from '../btn/btn';
class resolution extends btn {
    constructor(node) {
        super();
        this.node = node;
        this.name = 'resolution';
        this.resolution = null;
        this.resolutionUl = null;
        this.currentResolutionP = null;
        this.currentResolutionSpan = null;

        this._streamArr = null; //流数组
        this._selectIndex = 0;

        this._showUl=false;//清晰度列表是否显示
        this._ulTimer=null;
    }
    render() {
        this.resolution = document.createElement('div');
        this.resolutionUl = document.createElement('ul');
        this.currentResolutionP = document.createElement('p');
        this.currentResolutionSpan = document.createElement('span');
        // this.resolution.display = "block";
        this.resolution.className = 'M706C61796572-control-resolution M706C61796572-btn';
        this._tip = '清晰度'
        this.node.appendChild(this.resolution);
        this.resolution.appendChild(this.currentResolutionP);
        this.resolution.appendChild(this.resolutionUl);
        this.currentResolutionP.appendChild(this.currentResolutionSpan);

        this.currentResolutionSpan.addEventListener('click', this.showUpSelect.bind(this))
        this.currentResolutionSpan.addEventListener('mouseleave',this._leavelUlBoard.bind(this));
        this.currentResolutionSpan.addEventListener('mouseenter',this._clearUlTimer.bind(this));

        this.resolutionUl.addEventListener('click', this.onSelectHandle.bind(this));
        this.resolutionUl.addEventListener('mouseenter',this._clearUlTimer.bind(this));
        this.resolutionUl.addEventListener('mouseleave',this._leavelUlBoard.bind(this));
    }

    _clearUlTimer(e){
        clearTimeout(this._ulTimer);
        this._ulTimer=null;
    }

    _leavelUlBoard(e){
        if(this._showUl==true){
            this._ulTimer=setTimeout(() => {
                this.showUpSelect();
            }, 1500);
        }
    }

    //点击整个组件触发的
    onClickHandle(e) {
        if (this._selectIndex == e) return;
        this._selectIndex = e;
        this._refresh();
        super.disptchStatusEvent(this.name, this._streamArr[this._selectIndex]);
    }

    //弹出选择列表动作
    showUpSelect() {
        if (this.resolutionUl.className == "M706C61796572-showUp") {
            this.resolutionUl.className = "";
            this._showUl=false;
        } else {
            this.resolutionUl.className = "M706C61796572-showUp";
            this._showUl=true;
        }
    }
    // 点击选择列表触发
    onSelectHandle(event) {
        let ev = ev || event;
        let res = ev.target.getAttribute("data-index");
        this.resolutionUl.className = "";
        this.onClickHandle(res);
    }

    set sharpnessList(arr) {
        this._streamArr = arr;
        for (let i = 0; i < this._streamArr.length; i++) {
            this._streamArr[i].label = this._streamArr[i].label;
        }
        this._refresh();
    }

    get sharpnessList() {
        return this._streamArr;
    }

    set curSharpnessVo(obj) {
        try {
            for (let i = 0; i < this._streamArr.length; i++) {
                if (this._streamArr[i].label == obj.label) {
                    this.curSharpnessIndex = i;
                }
            }
        } catch (e) {
            console.log('你设置的清晰度不在初始化列表里面');
        }
    }

    get curSharpnessVo() {
        if (this._streamArr == 0) {
            return null;
        }
        return this._streamArr[this._selectIndex];
    }

    set curSharpnessIndex(index) {
        this._selectIndex = index;
        this._refresh();
    }

    get curSharpnessIndex() {
        if (this._streamArr == 0) {
            return null;
        }
        return this._streamArr[this._selectIndex];
    }

    set visible(bool) {
        this.resolution.style.display = bool ? 'block' : 'none';
    }

    get visible() {
        return this.resolution.style.display == 'none' ? false : true;
    }

    _refresh() {
        let contentHTML = '';
        for (let i = this._streamArr.length - 1; i >= 0; i--) {
            contentHTML += `<li class="${i==this._selectIndex?'M706C61796572-selectStream':''}" data-index="${i}">${this._streamArr[i].label}</li>`;
        }
        this.resolutionUl.innerHTML = contentHTML;
        this.currentResolutionSpan.innerText = this._streamArr[this._selectIndex].label;
    }

    _tip(str) {
        this.resolution.title = str;
    }

    hasOwnAttribute(str) {
        return ((this.__proto__).hasOwnProperty(str));
    }
}

export default resolution;