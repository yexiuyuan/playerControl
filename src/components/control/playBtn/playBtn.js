import Mustache from 'mustache';
import template from './playBtn.html';
import './playBtn.styl';
import btn from '../btn/btn';
export default class playBtn extends btn {
  constructor(node) {
    super();
    this.node = node;

  }
  render() {
    this.node.innerHTML += Mustache.render(template, {});
    console.log(this.node);
    console.log(super.getNode())
    let a = document.getElementsByClassName('M706C61796572-control-playBtn')[0];
    a.addEventListener('click', () => {
      console.log('1111')
    });
  }
}