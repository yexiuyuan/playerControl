import {
  EventEmitter
} from "events";
import './btn.css';
export default class btn extends EventEmitter {
  constructor() {
    super();
  }

  render() {
  }
 
  disptchStatusEvent(module,info){
    this.emit('xycControlView',{module:module,info:info});
  }

}