import btn from "../btn/btn";
import template from './pauseBtn.html';
import Mustache from 'mustache';

export default class pauseBtn extends btn {
  constructor(node) {
    super(node);
  }
  render() {
    this.node.innerHTML += Mustache.render(template, {});
  }

  getNode(){
    return document.getElementsByClassName('M706C61796572-control-playBtn')[0];
  }
}