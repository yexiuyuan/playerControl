import { EventEmitter } from "events";
import template from './btn.html';
import Mustache from 'mustache';
import './btn.styl';
export default class btn extends EventEmitter{
  constructor(node){
    super();
    this.node=node;

  }

  render(){
    console.log('aaaaaaa',this.node);
    console.log(Mustache.render(template,{}))
    let a=document.write(Mustache.render(template,{}));
    console.log()
  }

  getNode(){
    return document.getElementsByClassName('M706C61796572-control-playBtn')[0];
  }

}