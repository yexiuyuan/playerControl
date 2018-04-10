import PlayBtn from './components/control/playBtn/playBtn';
import PauseBtn from './components/control/pauseBtn/pauseBtn'

const leftControl = document.getElementsByClassName('control-left')[0];
const rightControl = document.getElementsByClassName('control-right')[0];
const playBtn = new PlayBtn(leftControl);
playBtn.render();
const pauseBtn = new PauseBtn(leftControl);
pauseBtn.render();