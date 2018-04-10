import $ from 'jquery';
import template from './button.html';
import Mustache from 'mustache';
import './button.styl';

import EventEmitter from 'events';

export default class Button extends EventEmitter {
  constructor(link) {
    super();
    this.link = link;
    console.log(link, 11231)
  }

  onClick(event) {
    event.preventDefault();
    this.emit('playerPlayBtnClik');
    console.log('clicka');
  }

  render(node) {
    const text = $(node).text();
    console.log($(node), text)
    console.log($(node).html())
    // Render our button
    $(node).html(Mustache.render(template, {
      text,
      link:this.link
    }));
    console.log($(node).html());
    // Attach our listeners
    $('.button').click(this.onClick.bind(this));

    let data = {
      "name": "flowerlove",
      "msg": {
        "sex": "female",
        "age": "26",
        "hobit": 'reading'
      },
      "subject": ["CH", "EN", 'Math', 'Physics']
    }
    let tpl = `<p>{{name}}</p>`;
    let html = Mustache.render(tpl, data);
    console.log(html);
    console.log(document.getElementsByClassName('parent')[0])
    document.getElementsByClassName('parent')[0].innerHTML+=html;
    console.log(document.getElementsByClassName('parent')[0])
  }

}