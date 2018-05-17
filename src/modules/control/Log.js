class Log{
  constructor(){

  }
  L(name,...str){
    console.log('['+name+']','::::',str);
  }
}
export default new Log;