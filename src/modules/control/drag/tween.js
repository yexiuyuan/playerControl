class Tween {
  constructor() {
    this.tween = {
      linear: function (t, b, c, d) {
        return c * t / d + b;
      },
      easeIn: function (t, b, c, d) {
        return c * (t /= d) * t + b;
      },
      strongEaseIn: function (t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
      },
      strongEaseOut: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
      },
      sineaseIn: function (t, b, c, d) {
        return c * (t /= d) * t * t + b;
      },
      sineaseOut: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t + 1) + b;
      }
    };
  }

  Animate(dom) {
    this.dom = dom;
    this.startTime = 0;
    this.startPos = 0;
    this.endPos = 0;
    this.propertyName = null;
    this.easing = null;
    this.duration = null;
  }

  start(dom, propertyName, endPos, duration, easing) {
    this.Animate(dom);

    this.startTime = +new Date;
    this.startPos = this.dom.getBoundingClientRect()[propertyName];
    this.propertyName = propertyName;
    this.endPos = this.startPos + endPos;
    this.duration = duration;
    this.easing = this.tween[easing];

    var self = this;
    var timeId = setInterval(function () {
      if (self.step() === false) {
        clearInterval(timeId);
      }
    }, 19);
  }

  step() {
    var t = +new Date;
    if (t >= this.startTime + this.duration) {
      this.update(this.endPos);
      return false;
    }
    var pos = this.easing(t - this.startTime, this.startPos, this.endPos - this.startPos, this.duration);
    this.update(pos);
  }
  update(pos) {
    this.dom.style[this.propertyName] = pos + 'px';
  }
}

export default new Tween;