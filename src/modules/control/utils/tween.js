class Tween {
    myEffect;
    constructor() {
        this.myEffect = {
            Linear: function (t, b, c, d) {
                return c * t / d + b
            },
            Quad: { //二次方的缓动（t^2）；
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return -c * (t /= d) * (t - 2) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                    return -c / 2 * ((--t) * (t - 2) - 1) + b;
                }
            },
            Cubic: { //三次方的缓动（t^3）
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t + 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                    return c / 2 * ((t -= 2) * t * t + 2) + b;
                }
            },
            Quart: { //四次方的缓动（t^4）；
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t * t * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
                }
            },
            Quint: { //5次方的缓动（t^5）；
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t * t * t * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
                }
            },
            Sine: { //正弦曲线的缓动（sin(t)）
                easeIn: function (t, b, c, d) {
                    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * Math.sin(t / d * (Math.PI / 2)) + b;
                },
                easeInOut: function (t, b, c, d) {
                    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
                }
            },
            Expo: { //指数曲线的缓动（2^t）；
                easeIn: function (t, b, c, d) {
                    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
                },
                easeOut: function (t, b, c, d) {
                    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if (t == 0) return b;
                    if (t == d) return b + c;
                    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
                }
            },
            Circ: { //圆形曲线的缓动（sqrt(1-t^2)）；
                easeIn: function (t, b, c, d) {
                    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
                }
            },
            Elastic: { //指数衰减的正弦曲线缓动；
                easeIn: function (t, b, c, d, a, p) {
                    if (t == 0) return b;
                    if ((t /= d) == 1) return b + c;
                    if (!p) p = d * .3;
                    if (!a || a < Math.abs(c)) {
                        a = c;
                        var s = p / 4;
                    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                },
                easeOut: function (t, b, c, d, a, p) {
                    if (t == 0) return b;
                    if ((t /= d) == 1) return b + c;
                    if (!p) p = d * .3;
                    if (!a || a < Math.abs(c)) {
                        a = c;
                        var s = p / 4;
                    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                    return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
                },
                easeInOut: function (t, b, c, d, a, p) {
                    if (t == 0) return b;
                    if ((t /= d / 2) == 2) return b + c;
                    if (!p) p = d * (.3 * 1.5);
                    if (!a || a < Math.abs(c)) {
                        a = c;
                        var s = p / 4;
                    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
                }
            },
            Back: { //超过范围的三次方缓动（(s+1)*t^3 - s*t^2）；
                easeIn: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c * (t /= d) * t * ((s + 1) * t - s) + b;
                },
                easeOut: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
                },
                easeInOut: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
                }
            },
            zfBounce: { //指数衰减的反弹缓动。
                easeIn: function (t, b, c, d) {
                    return c - zhufengEffect.zfBounce.easeOut(d - t, 0, c, d) + b;
                },
                easeOut: function (t, b, c, d) {
                    if ((t /= d) < (1 / 2.75)) {
                        return c * (7.5625 * t * t) + b;
                    } else if (t < (2 / 2.75)) {
                        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                    } else if (t < (2.5 / 2.75)) {
                        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                    } else {
                        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                    }
                },
                easeInOut: function (t, b, c, d) {
                    if (t < d / 2) return zhufengEffect.zfBounce.easeIn(t * 2, 0, c, d) * .5 + b;
                    else return zhufengEffect.zfBounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
                }
            }
        };
    }
    //move:实现多方向的运动动画
    /*
      curEle:当前要运动的元素
      target:当前动画的目标位置,存储的是每一个方向的目标位置{left:xxx,top:xxx...}
      duration:当前动画的总时间
    */
    //effect支持以下的情况
    /*
       
    */
    move(curEle, target, duration, effect, callback) {
        //处理我们需要的动画效果
        var tempEffect = this.myEffect.Linear;
        if (typeof effect === "number") {
            switch (effect) {
                case 0:
                    tempEffect = this.myEffect.Linear;
                    break;
                case 1:
                    tempEffect = this.myEffect.Circ.easeInOut;
                    break;
                case 2:
                    tempEffect = this.myEffect.Elastic.easeOut;
                    break;
                case 3:
                    tempEffect = this.myEffect.Back.easeOut;
                    break;
                case 4:
                    tempEffect = this.myEffect.Bounce.easeOut;
                    break;
                case 5:
                    tempEffect = this.myEffect.Expo.easeIn;
            }
        } else if (effect instanceof Array) {
            tempEffect = effect.length >= 2 ? this.myEffect[effect[0]][effect[1]] : this.myEffect[effect[0]]
        } else if (typeof effect === "function") {
            //我们的实际意义应该是:effect是不传递值的，传递进来的函数应该是回调函数的值
            callback = effect;
        }

        //在每一次执行方法之前，首先把当前元素之前正在运行的动画结束掉
        window.clearInterval(curEle.timer);
        //根据target获取每一个方向的起始值begin和总距离change
        var begin = {},
            change = {};
        for (var key in target) {
            if (target.hasOwnProperty(key)) {
                begin[key] = curEle.style[key].substring(0, curEle.style[key].length-2)//this.css(curEle, key);
                change[key] = target[key] - begin[key];
                console.log('开始的位置',begin[key],'目标位置',target[key],'改变位置大小', change[key])
            }
        }
        //实现多方向的运动动画
        var time = 0;
        curEle.timer = window.setInterval( ()=> {
            time += 10;
            //到达目标：结束动画，让当前元素的样式值等于目标样式值
            if (time >= duration) {
                // utils.css(curEle, target);
                window.clearInterval(curEle.timer);
                //在动画结束的时候，如果用户把回调函数传递给我了，我就把用户传递的回调函数执行,不仅执行还把this的指向改为当前操作的元素

                typeof callback === "function" ? callback.call(curEle) : null;
                //或者callback && callback()
                return;
            }
            //没到达目标:分别获取每一个方向的当前位置，给当前位置设置样式即可。
            for (var key in target) {
                if (target.hasOwnProperty(key)) {
                    var curPos = tempEffect(time, begin[key], change[key], duration);
                    // this.css(curEle, key, curPos);
                    curEle.style[key]=curPos+'px';
                }
            }
        }, 10)
    };
    css(dom,key,cur){
        console.log(typeof(cur))
        if(typeof(cur)!='string'){
           return dom.style[key]=cur+'px';
        }else{
            return dom.style[key];
        }
    };
}

export default new Tween;
