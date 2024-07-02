var events = new Events();
events.add = function(obj) {
  obj.events = { };
}
events.implement = function(fn) {
  fn.prototype = Object.create(Events.prototype);
}

function Events() {
  this.events = { };
}
Events.prototype.on = function(name, fn) {
  var events = this.events[name];
  if (events == undefined) {
    this.events[name] = [ fn ];
    this.emit('event:on', fn);
  } else {
    if (events.indexOf(fn) == -1) {
      events.push(fn);
      this.emit('event:on', fn);
    }
  }
  return this;
}
Events.prototype.once = function(name, fn) {
  var events = this.events[name];
  fn.once = true;
  if (!events) {
    this.events[name] = [ fn ];
    this.emit('event:once', fn);
  } else {
    if (events.indexOf(fn) == -1) {
      events.push(fn);
      this.emit('event:once', fn);
    }
  }
  return this;
}
Events.prototype.emit = function(name, args) {
  var events = this.events[name];
  if (events) {
    var i = events.length;
    while(i--) {
      if (events[i]) {
        events[i].call(this, args);
        if (events[i].once) {
          delete events[i];
        }
      }
    }
  }
  return this;
}
Events.prototype.unbind = function(name, fn) {
  if (name) {
    var events = this.events[name];
    if (events) {
      if (fn) {
        var i = events.indexOf(fn);
        if (i != -1) {
          delete events[i];
        }
      } else {
        delete this.events[name];
      }
    }
  } else {
    delete this.events;
    this.events = { };
  }
  return this;
}

var userPrefix;

var prefix = (function () {
  var styles = window.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice
      .call(styles)
      .join('') 
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1],
    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
  userPrefix = {
    dom: dom,
    lowercase: pre,
    css: '-' + pre + '-',
    js: pre[0].toUpperCase() + pre.substr(1)
  };
})();

function bindEvent(element, type, handler) {
  if(element.addEventListener) {
    element.addEventListener(type, handler, false);
  } else {
    element.attachEvent('on' + type, handler);
  }
}

function Viewport(data) {
  events.add(this);

  var self = this;

  this.element = data.element;
  this.fps = data.fps;
  this.sensivity = data.sensivity;
  this.sensivityFade = data.sensivityFade;
  this.touchSensivity = data.touchSensivity;
  this.speed = data.speed;

  this.lastX = 0;
  this.lastY = 0;
  this.mouseX = 0;
  this.mouseY = 0;
  this.distanceX = 0;
  this.distanceY = 0;
  this.positionX = 40;//40;//1122;
  this.positionY = 0;//136;
  this.torqueX = 0;
  this.torqueY = 0;

  this.down = false;
  this.upsideDown = false;

  this.previousPositionX = 0;
  this.previousPositionY = 0;

  this.currentSide = 0;
  this.calculatedSide = 0;

  this.shift = 0;
  this.delay = 0;

  this.sideNumber = 0;

  this.counter = 0;
  this.flag = 0;

  document.getElementsByClassName('hand-image')[0].style.transition = 'linear 900ms';

  //document.getElementsByClassName('hand-image')[0].style.transform = 'translateX('+ 1000 +'px)';

  


  bindEvent(document, 'mousedown', function() {
    self.down = true;
    document.getElementsByClassName('hand-image')[0].style.display = 'none';
    document.getElementsByClassName('hand-image')[0].style.transition = 'none';


  });

  bindEvent(document, 'mouseup', function() {
    self.down = false;
    document.getElementsByClassName('hand-image')[0].style.display = 'none';
    document.getElementsByClassName('hand-image')[0].style.transition = 'none';

    document.getElementsByClassName('cube')[0].style.transition = '';
    document.getElementsByClassName('cube')[0].style.transition = 'ease 500ms';
  });
  
  bindEvent(document, 'keyup', function() {
    self.down = false;
  });

  bindEvent(document, 'mousemove', function(e) {
    self.mouseX = e.pageX;
    self.mouseY = e.pageY;

  });

  bindEvent(document, 'touchstart', function(e) {

    self.down = true;
    e.touches ? e = e.touches[0] : null;
    self.mouseX = e.pageX / self.touchSensivity;
    self.mouseY = e.pageY / self.touchSensivity;
    self.lastX  = self.mouseX;
    self.lastY  = self.mouseY;

     document.getElementsByClassName('hand-image')[0].style.display = 'none';
     document.getElementsByClassName('hand-image')[0].style.transition = 'none';


  });

  bindEvent(document, 'touchmove', function(e) {

     document.getElementsByClassName('hand-image')[0].style.display = 'none';
     document.getElementsByClassName('hand-image')[0].style.transition = 'none';

 
    if(e.preventDefault) { 
      e.preventDefault();
    }

    if(e.touches.length == 1) {

      e.touches ? e = e.touches[0] : null;

      self.mouseX = e.pageX / self.touchSensivity;
      self.mouseY = e.pageY / self.touchSensivity;

    }
  });

  bindEvent(document, 'touchend', function(e) {
    self.down = false;

    document.getElementsByClassName('cube')[0].style.transition = '';
    document.getElementsByClassName('cube')[0].style.transition = 'ease 500ms';

  });  

  setInterval(this.animate.bind(this), this.fps);

}
events.implement(Viewport);
Viewport.prototype.animate = function() {

  
  this.distanceX = (this.mouseX - this.lastX);
  this.distanceY = (this.mouseY - this.lastY);

  this.lastX = this.mouseX;
  this.lastY = this.mouseY;

  if(this.down) {

    this.flag = 1;
    this.element.style[userPrefix.js + 'Transition'] = 'none';
    this.torqueX = this.torqueX * this.sensivityFade + (this.distanceX * this.speed - this.torqueX) * this.sensivity;
    this.torqueY = 0;//this.torqueY * this.sensivityFade + (this.distanceY * this.speed - this.torqueY) * this.sensivity;


        if(this.positionX >= 42 && this.positionX <= 130) {
          this.calculatedSide = 5;
          this.sideNumber = 5;
        } else if(this.positionX >= 131 && this.positionX <= 223) {
          this.calculatedSide = 4;
          this.sideNumber = 4;
        } else if(this.positionX >= 224 && this.positionX <= 314) {
          this.calculatedSide = 3;
          this.sideNumber = 3;
        }else if(this.positionX >= 315  && this.positionX < 360){
           this.calculatedSide = 1;
           this.sideNumber = 2;
        } else {
          this.calculatedSide = 2;
          this.sideNumber = 2;
        } 

    //if(this.calculatedSide !== this.currentSide) {
      this.currentSide = this.calculatedSide;
      this.emit('sideChange');
    //}

    this.element.style[userPrefix.js + 'Transform'] = 'rotateX(' + 0 + 'deg) rotateY(' + this.positionX + 'deg)';


  }else{


      if(this.flag == 0){

              this.counter++;

              //document.getElementsByClassName('hand-image')[0].style.transition = 'linear 980ms';
              

              if(this.counter<=80){
                this.torqueX = this.torqueX * this.sensivityFade + (1.5 * this.speed - this.torqueX) * this.sensivity;
                
                document.getElementsByClassName('hand-image')[0].style.transform = 'translateX('+  this.torqueX*200 +'px)';
                //document.getElementsByClassName('hand-image')[0].style.transform = 'rotate('+ this.torqueX *50+'deg)';
                //console.log(document.getElementsByClassName('hand-image')[0].style);
                //console.log( document.getElementsByClassName('hand-image')[0]);
              }else{
                this.torqueX = this.torqueX * this.sensivityFade + (-1.5 * this.speed - this.torqueX) * this.sensivity;
                document.getElementsByClassName('hand-image')[0].style.transform = 'translateX('+  this.torqueX*200 +'px)';
                //document.getElementsByClassName('hand-image')[0].style.transform = 'rotate('+ this.torqueX*50 +'deg)';
              }
              if(this.counter>=160){
                this.counter =0;
              }
        }else{

          //document.getElementsByClassName('hand-image')[0].style.display = 'none';



          //this.element.style[userPrefix.js + 'Transition'] = '';
          //this.element.style[userPrefix.js + 'Transition'] = 'ease 500ms';
  

        //--
          if(this.currentSide == 2){

            this.positionX = 0;
            this.shift = 0;
            this.sideNumber = 2;

          }else if(this.currentSide == 3){

             this.positionX = 270;
             this.shift = 270;
             this.sideNumber = 3;

          }else if(this.currentSide == 4){

             this.positionX = 180;
             this.shift = 180;
             this.sideNumber = 4;

          }else if(this.currentSide == 5){

             this.positionX = 90;
             this.shift = 90;
             this.sideNumber = 5;

          }else if(this.currentSide == 1){

             this.positionX = 359;
             this.shift = 359;
             this.sideNumber = 2;

          }
        //--

      }
    this.element.style[userPrefix.js + 'Transform'] = 'rotateX(' + 0 + 'deg) rotateY(' + this.positionX + 'deg)';


  }

  if(Math.abs(this.torqueX) > 1.0 || Math.abs(this.torqueY) > 1.0){
    if(!this.down) {
      this.torqueX *= this.sensivityFade;
      this.torqueY *= this.sensivityFade;
    }

    this.positionY -= this.torqueY;

    if(this.positionY > 360) {
      this.positionY -= 360;
    } else if(this.positionY < 0) {
      this.positionY += 360;
    }

    if(this.positionY > 90 && this.positionY < 270) {
      this.positionX -= this.torqueX;

      //if(!this.upsideDown) {
        //this.upsideDown = true;
        //this.emit('upsideDown', { upsideDown: this.upsideDown });
      //}

    } else {

      this.positionX += this.torqueX;

      //if(this.upsideDown) {
        //this.upsideDown = false;
        //this.emit('upsideDown', { upsideDown: this.upsideDown });
      //}
    }

    if(this.positionX > 360) {
      this.positionX -= 360;
      
    } else if(this.positionX < 0) {
      this.positionX += 360;
      
    }

   
  }


  
    if(this.positionY != this.previousPositionY || this.positionX != this.previousPositionX) {
    this.previousPositionY = this.positionY;
    this.previousPositionX = this.positionX;

    this.emit('rotate');

  }


}
var viewport = new Viewport({
  element: document.getElementsByClassName('cube')[0],
  fps: 20,
  sensivity: .1,
  sensivityFade: .93,
  speed: 2,
  touchSensivity: 1.5
});

function Cube(data) {
  var self = this;

  this.element = data.element;
  this.sides = this.element.getElementsByClassName('side');

  this.viewport = data.viewport;
  this.viewport.on('rotate', function() {
    self.rotateSides();
  });
  this.viewport.on('upsideDown', function(obj) {
    self.upsideDown(obj);
  });
  this.viewport.on('sideChange', function() {
    self.sideChange();
  });
}
Cube.prototype.rotateSides = function() {

  var viewport = this.viewport;
  if(viewport.positionY > 90 && viewport.positionY < 270) {
    this.sides[0].getElementsByClassName('cube-image')[0].style[userPrefix.js + 'Transform'] = 'rotate(' + (viewport.positionX + viewport.torqueX) + 'deg)';
    this.sides[5].getElementsByClassName('cube-image')[0].style[userPrefix.js + 'Transform'] = 'rotate(' + -(viewport.positionX + 180 + viewport.torqueX) + 'deg)';
  } else {
    this.sides[0].getElementsByClassName('cube-image')[0].style[userPrefix.js + 'Transform'] = 'rotate(' + (viewport.positionX - viewport.torqueX) + 'deg)';
    this.sides[5].getElementsByClassName('cube-image')[0].style[userPrefix.js + 'Transform'] = 'rotate(' + -(viewport.positionX + 180 - viewport.torqueX) + 'deg)';
  }
}
Cube.prototype.upsideDown = function(obj) {

  var deg = (obj.upsideDown == true) ? '180deg' : '0deg';
  var i = 5;

  while(i > 0 && --i) {
    this.sides[i].getElementsByClassName('cube-image')[0].style[userPrefix.js + 'Transform'] = 'rotate(' + deg + ')';
  }

}
Cube.prototype.sideChange = function() {

  for(var i = 0; i < this.sides.length; ++i) {
    this.sides[i].getElementsByClassName('cube-image')[0].className = 'cube-image'; 
    
    
  }

  //this.sides[this.viewport.currentSide - 1].getElementsByClassName('cube-image')[0].className = 'cube-image active';
  this.sides[this.viewport.sideNumber - 1].getElementsByClassName('cube-image')[0].className = 'cube-image active';

}

new Cube({
  viewport: viewport,
  element: document.getElementsByClassName('cube')[0]
});
