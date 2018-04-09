import Button from './components/button/button.js';
const button=new Button('google.com');
button.render('a');

button.on('playerPlayBtnClik',()=>{
  console.log('click index.js')
})