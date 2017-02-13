"use strict";

/*
╔══════════════════════╗
╫	┬─── ┬──┬ ┬─┬─┬ ┬──┬ ╫
╫	│ ─┬ ├──┤	│ ┴ │ │  │ ╫
╫	┴──┴ ┴  ┴ ┴   ┴ ┴──┴ ╫
╚══════════════════════╝
Hover effect transform with mouse position.
*/

/**
 * Check selector type
 * @param {Oject or Array} selector
 */
function GHover(selector) {
  if (Array.isArray(selector)) {
    for (var i = 0; i < selector.length; i++) {
      startHover(selector[i]);
    }
  } else {
    startHover(selector);
  }
}

/**
 * Get prefix properties
 * @param  {Object} prefix
 */
function getPrefix(properties) {
  for (var i = 0; i < properties.length; i++) {
    if (typeof document.body.style[properties[i]] != "undefined") {
      return properties[i];
    }
  }
  return null;
}

var transformPrefix = ["transform", "msTransform", "webkitTransform", "mozTransform", "oTransform"];
var transitionPrefix = ["transition", "msTransition", "webkitTransition", "mozTransition", "oTransition"];
var transformProperty = getPrefix(transformPrefix);
var transitionProperty = getPrefix(transitionPrefix);

/**
 * Start hover fucntion
 * @param  {Object} selector
 */
function startHover(selector) {
  var transform3DBase = { x: 0, y: 0, z: 0 };
  var transitionBase = 'all 0.2s ease';
  var Selector = document.querySelector(selector.selector);

  Selector.style.perspective = "1000px";
  Selector.style[transformProperty] = "rotateZ(0deg) translateZ(0)";

  Selector.addEventListener('mouseleave', function (e) {
    return reset(e.currentTarget, selector);
  });
  Selector.addEventListener('mousemove', function (e) {

    var _this = e.currentTarget;
    var _children = selector.children;
    var _mousepos = {
      x: e.pageX - _this.offsetLeft,
      y: e.pageY - _this.offsetTop
    };

    for (var i = 0; i < _children.length; i++) {
      var r = _children[i].rotate ? _children[i].rotate : transform3DBase;
      var t = _children[i].translate ? _children[i].translate : transform3DBase;
      t = calculatePosition(t);
      r = calculatePosition(r);

      var transforms = {
        translate: {
          x: (t.x[1] - t.x[0]) / _this.offsetWidth * _mousepos.x + t.x[0],
          y: (t.y[1] - t.y[0]) / _this.offsetHeight * _mousepos.y + t.y[0],
          z: (t.z[1] - t.z[0]) / _this.offsetHeight * _mousepos.y + t.z[0]
        },
        rotate: {
          x: (r.x[1] - r.x[0]) / _this.offsetHeight * _mousepos.y + r.x[0],
          y: (r.y[1] - r.y[0]) / _this.offsetWidth * _mousepos.x + r.y[0],
          z: (r.z[1] - r.z[0]) / _this.offsetWidth * _mousepos.x + r.z[0]
        }
      };

      var name = _this.querySelectorAll(_children[i].className);
      var transit = _children[i].transition ? _children[i].transition : transitionBase;
      var matrix = gerMatrix(transforms);

      transform(matrix, name);
      transition(transit, name);
    }
  });

  // Generate real mouse position in selector
  var calculatePosition = function calculatePosition(obj) {
    var result = {};
    for (var k in obj) {
      if (!obj[k]) {
        result[k] = [0, 0];
      } else if (typeof obj[k] === 'number') {
        result[k] = [-1 * obj[k], obj[k]];
      }
    }
    return result;
  };

  // Reset Matrix transform and transition
  var reset = function reset(obj, selector) {
    var transforms = {
      translate: transform3DBase,
      rotate: transform3DBase
    };
    for (var i = 0; i < selector.children.length; i++) {
      var name = obj.querySelectorAll(selector.children[i].className);
      var transit = selector.children[i].transition ? selector.children[i].transition : transitionBase;
      var matrix = gerMatrix(transforms);

      transform(matrix, name);
      transition(transit, name);
    }
  };

  // Generate Matrix transform
  var gerMatrix = function gerMatrix(transform) {
    var rotate = transform.rotate,
        translate = transform.translate;

    var ScaleX = 1,
        ScaleY = 1,
        DepthY = 0,
        DepthX = 0,
        B = Math.cos(rotate.y * (Math.PI / 180)),
        F = Math.sin(rotate.y * (Math.PI / 180)),
        Y = Math.cos(rotate.x * (Math.PI / 180)),
        Z = Math.sin(rotate.x * (Math.PI / 180)),
        I = Math.cos(rotate.z * (Math.PI / 180)),
        P = Math.sin(rotate.z * (Math.PI / 180));

    var a = new Array(16);
    a[0] = B * I * ScaleX, a[1] = -1 * P, a[2] = F, a[3] = DepthY, a[4] = P, a[5] = Y * I * ScaleY, a[6] = Z, a[7] = DepthX, a[8] = -1 * F, a[9] = -1 * Z, a[10] = B * Y, a[11] = 0, a[12] = translate.x, a[13] = translate.y, a[14] = translate.z, a[15] = 1;

    var matrix3d = '';
    for (var i = 0; i < a.length; i++) {
      var cm = i == 0 ? '' : ',';
      matrix3d = matrix3d.concat(cm + a[i]);
    }
    return matrix3d;
  };

  // Transform
  var transform = function transform(matrix, target) {
    Array.prototype.forEach.call(target, function (el, i) {
      el.style[transformProperty] = "matrix3d(" + matrix + ")";
    });
  };

  // Transition
  var transition = function transition(_transition, target) {
    Array.prototype.forEach.call(target, function (el, i) {
      el.style[transitionProperty] = _transition;
    });
  };
}