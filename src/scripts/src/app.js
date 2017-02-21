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
    for (let i=0; i<selector.length; i++) {
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
function getCSSPrefix(properties) {
  for (var i = 0; i < properties.length; i++) {
    if (typeof document.body.style[properties[i]] != "undefined") {
      return properties[i];
    }
  }
  return null;
}

const transformPrefix = ["transform", "msTransform", "webkitTransform", "mozTransform", "oTransform"];
const transitionPrefix = ["transition", "msTransition", "webkitTransition", "mozTransition", "oTransition"];
const transformProperty = getCSSPrefix(transformPrefix);
const transitionProperty = getCSSPrefix(transitionPrefix);

/**
 * Start hover fucntion
 * @param  {Object} selector
 */
function startHover(selector) {
  const transform3DBase = { x: 0, y: 0, z: 0 };
  const transitionBase = 'all 0.2s ease';
  const Selector = document.querySelector(selector.selector);
  
  Selector.style.perspective = "1000px";
  Selector.style[transformProperty] = "rotateZ(0deg) translateZ(0)";

  Selector.addEventListener('mouseleave', (e) => reset(e.currentTarget, selector));
  Selector.addEventListener('mousemove', (e) => {
    
    const _this = e.currentTarget;
    const _children = selector.children;
    const _mousepos = {
      x: e.pageX - _this.offsetLeft,
      y: e.pageY - _this.offsetTop
    }

    for (let i=0; i<_children.length; i++) {
      let r = (_children[i].rotate) ? _children[i].rotate : transform3DBase;
      let t = (_children[i].translate) ? _children[i].translate : transform3DBase;
      t = calculatePosition(t)
      r = calculatePosition(r)
      
      const transforms = {
        translate : {
          x: (t.x[1]-t.x[0])/_this.offsetWidth*_mousepos.x + t.x[0],
          y: (t.y[1]-t.y[0])/_this.offsetHeight*_mousepos.y + t.y[0],
          z: (t.z[1]-t.z[0])/_this.offsetHeight*_mousepos.y + t.z[0],
        },
        rotate : {
          x: (r.x[1]-r.x[0])/_this.offsetHeight*_mousepos.y + r.x[0],
          y: (r.y[1]-r.y[0])/_this.offsetWidth*_mousepos.x + r.y[0],
          z: (r.z[1]-r.z[0])/_this.offsetWidth*_mousepos.x + r.z[0],
        }
      };

      const name = _this.querySelectorAll(_children[i].className);
      const transit = (_children[i].transition) ? _children[i].transition : transitionBase;
      const matrix = gerMatrix(transforms);

      transform(matrix, name);
      transition(transit, name);
    }
  });

  // Generate real mouse position in selector
  const calculatePosition = (obj) => {
    let result = {};
    for (var k in obj) {
      if(!obj[k]) {
        result[k] = [0,0];
      } else if ( typeof obj[k] === 'number' ) {
        result[k] = [-1*obj[k],obj[k]];
      }
    }
    return result;
  };

  // Reset Matrix transform and transition
  const reset = (obj, selector) => {
    const transforms = {
      translate: transform3DBase,
      rotate: transform3DBase
    }
    for (let i=0; i<selector.children.length; i++) {
      const name = obj.querySelectorAll(selector.children[i].className);
      const transit = (selector.children[i].transition) ? selector.children[i].transition : transitionBase;
      const matrix = gerMatrix(transforms);

      transform(matrix, name);
      transition(transit, name);
    }
  }

  // Generate Matrix transform
  const gerMatrix = (transform) => {
    const { rotate, translate } = transform;
    var ScaleX=1,
        ScaleY=1,
        DepthY=0,
        DepthX=0,
        B=Math.cos(rotate.y*(Math.PI/180)),
        F=Math.sin(rotate.y*(Math.PI/180)),
        Y=Math.cos(rotate.x*(Math.PI/180)),
        Z=Math.sin(rotate.x*(Math.PI/180)),
        I=Math.cos(rotate.z*(Math.PI/180)),
        P=Math.sin(rotate.z*(Math.PI/180));

    var a=new Array(16);
        a[0]=B*I*ScaleX,
        a[1]=-1*P,
        a[2]=F,
        a[3]=DepthY,
        a[4]=P,
        a[5]=Y*I*ScaleY,
        a[6]=Z,
        a[7]=DepthX,
        a[8]=-1*F,
        a[9]=-1*Z,
        a[10]=B*Y,
        a[11]=0,
        a[12]=translate.x,
        a[13]=translate.y,
        a[14]=translate.z,
        a[15]=1;

    let matrix3d = '';
    for (let i=0; i<a.length; i++) {
      const cm = i == 0 ? '' : ',';
      matrix3d = matrix3d.concat(cm+a[i]);
    }
    return matrix3d;
  }

  // Transform
  const transform = (matrix, target) => {
    Array.prototype.forEach.call(target, (el, i) => {
      el.style[transformProperty] = `matrix3d(${matrix})`;
    });
  }

  // Transition
  const transition = (transition, target) => {
    Array.prototype.forEach.call(target, (el, i) => {
      el.style[transitionProperty] = transition;
    });
  }
}