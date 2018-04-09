import $ from 'jquery';
import template from './button.html';
import Mustache from 'mustache';
import './button.styl';

import EventEmitter from 'events';

export default class Button extends EventEmitter {
  constructor(link) {
    super();
    this.link = link;
    console.log(link,11111)
  }

  onClick(event) {
    event.preventDefault();
    this.emit('playerPlayBtnClik');
    console.log('clicka');
    alert('aaaa');
    console.log('aaa')
  }

  render(node) {
    const text = $(node).text();
    console.log($(node), text)
    // Render our button
    $(node).html(Mustache.render(template, {
      text
    }));

    // Attach our listeners
    $('.button').click(this.onClick.bind(this));
  }

}