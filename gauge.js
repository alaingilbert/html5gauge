/*
Copyright (c) 2010, ALAIN GILBERT.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by ALAIN GILBERT.
4. Neither the name of the ALAIN GILBERT nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY ALAIN GILBERT ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL ALAIN GILBERT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

window.Gauge = function() {
   var params = arguments[1] !== undefined ? arguments[1] : {};
   this.elemId = arguments[0];
   this.needleColor = params['needleColor'] !== undefined ? params['needleColor'] : 'black';
   this.gaugeColor = params['gaugeColor'] !== undefined ? params['gaugeColor'] : 'lightblue';

   this.min = 0;
   this.max = 100;
   this.value = 0;
   this.interval = null;

   this.fromValue = null;
   this.newValue = null;
   this.callback = null;

   this.bindElems = [];

   this.canvas = document.getElementById(this.elemId);
   this.width = this.canvas.width;
   this.height = this.canvas.height;
   this.ctx = this.canvas.getContext('2d');
   this.paint();
};

Gauge.prototype.bind = function(elemId) {
   this.bindElems.push(document.getElementById(elemId));
};

Gauge.prototype.setValue = function(value, callback) {
   if (this.value == value) { return; }
   window.clearInterval(this.interval);
   this.fromValue = this.value;
   this.newValue = value;
   this.startTime = new Date().getTime();
   this.callback = callback;
   var self = this;
   this.interval = window.setInterval(function() {
      self.update();
      self.paint();
   }, 1000/60);
};

Gauge.prototype.update = function() {
   var duration = 2000;
   var effect = this.formulas['<>']( (new Date().getTime() - this.startTime) / duration )
   if (new Date().getTime() - this.startTime <= duration) {
      this.value = ((this.newValue - this.fromValue) / duration) * (effect * duration) + this.fromValue;
      for (var i=0; i<this.bindElems.length; i++) {
         this.bindElems[i].innerHTML = Math.floor(this.value);
      }
   } else {
      this.value = this.newValue;
      for (var i=0; i<this.bindElems.length; i++) {
         this.bindElems[i].innerHTML = this.value;
      }
      window.clearInterval(this.interval);

      if (this.callback) {
         this.callback();
      }
   }
};

Gauge.prototype.paint = function() {
   this.ctx.clearRect(0, 0, this.width, this.height);

   // Draw background
   this.ctx.save();
   this.ctx.beginPath();
   this.ctx.translate(this.width/2, this.height);
   var angle = Math.atan( (this.height/2) / (this.width/2) );
   this.ctx.arc(0, 0, this.width/2, -Math.PI+angle, -angle);
   this.ctx.arc(0, 0, this.width/2-45, -angle, -Math.PI+angle, true);
   this.ctx.closePath();
   this.ctx.fillStyle = this.gaugeColor;
   this.ctx.fill();
   this.ctx.restore();

   // Draw needle
   var minAngle = -Math.PI/2+angle;
   var maxAngle = -Math.PI/2+angle + (Math.PI-(2*angle));
   var diff = maxAngle - minAngle;
   var pct = (this.value / this.max);

   this.ctx.save();
   this.ctx.translate(this.width/2, this.height);
   this.ctx.rotate(pct * diff + minAngle);

   this.ctx.beginPath();
   this.ctx.moveTo(0, 0);
   this.ctx.lineTo(-5, -5);
   this.ctx.lineTo(0, -this.height);
   this.ctx.lineTo(5, -5);
   this.ctx.closePath();

   this.ctx.fillStyle = this.needleColor;
   this.ctx.fill();
   this.ctx.restore();
};


Gauge.prototype.formulas = {
   'linear': function(n) { return n; },
   '<': function(n) { return Math.pow(n, 3); },
   '>': function(n) { return Math.pow(n - 1, 3) + 1; },
   '<>': function(n) {
      n = n * 2;
      if (n < 1) {
         return Math.pow(n, 3) / 2;
      }
      n -= 2;
      return (Math.pow(n, 3) + 2) / 2;
   },
   backIn: function (n) {
      var s = 1.70158;
      return n * n * ((s + 1) * n - s);
   },
   backOut: function (n) {
      n = n - 1;
      var s = 1.70158;
      return n * n * ((s + 1) * n + s) + 1;
   },
   elastic: function (n) {
      if (n == 0 || n == 1) {
         return n;
      }
      var p = .3,
          s = p / 4;
      return Math.pow(2, -10 * n) * Math.sin((n - s) * (2 * Math.PI) / p) + 1;
   },
   bounce: function (n) {
      var s = 7.5625,
         p = 2.75,
         l;
      if (n < (1 / p)) {
         l = s * n * n;
      } else {
         if (n < (2 / p)) {
            n -= (1.5 / p);
            l = s * n * n + .75;
         } else {
            if (n < (2.5 / p)) {
               n -= (2.25 / p);
               l = s * n * n + .9375;
            } else {
               n -= (2.625 / p);
               l = s * n * n + .984375;
            }
         }
      }
      return l;
   }
};
