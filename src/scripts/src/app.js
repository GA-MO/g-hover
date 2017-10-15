/*
╔══════════════════════╗
╫ ┬─── ┬──┬ ┬─┬─┬ ┬──┬ ╫
╫ │ ─┬ ├──┤ │ ┴ │ │  │ ╫
╫ ┴──┴ ┴  ┴ ┴   ┴ ┴──┴ ╫
╚══════════════════════╝
Hover effect transform with mouse position.
*/

/**
 * Check selector type
 * @param {Oject or Array} selector
 */
function GHover(selector) {
  if (Array.isArray(selector)) {
    for (let i = 0; i < selector.length; i++) {
      initGHover(selector[i])
    }
  } else {
    initGHover(selector)
  }
}

/**
 * Start hover fucntion
 * @param  {Object} selector
 */
function initGHover(selector) {
  const DOM = document.querySelector(selector.selector)
  const children = selector.children
  const transformDefault = { x: 0, y: 0, z: 0 }
  const transitionDefault = 'all 0.2s ease'
  const perspective = '1000px'
  const transformPrefix = [
    'transform',
    'msTransform',
    'webkitTransform',
    'mozTransform',
    'oTransform'
  ]
  const transitionPrefix = [
    'transition',
    'msTransition',
    'webkitTransition',
    'mozTransition',
    'oTransition'
  ]
  const transformProperty = getCSSPrefix(transformPrefix)
  const transitionProperty = getCSSPrefix(transitionPrefix)

  // Initial method call
  setUpDefaultTrasform()
  initMouseEvents()

  // CSS with prefix
  function getCSSPrefix(properties) {
    for (var i = 0; i < properties.length; i++) {
      if (typeof document.body.style[properties[i]] != 'undefined') {
        return properties[i]
      }
    }
    return null
  }

  // Init transform
  function setUpDefaultTrasform() {
    DOM.style.perspective = perspective
    DOM.style[transformProperty] = 'rotateZ(0deg) translateZ(0)'
  }

  // Get real mouse position
  function getMousePosition(e) {
    const bound = DOM.getBoundingClientRect()
    const pageScroll = {
      left: document.body.scrollLeft + document.documentElement.scrollLeft,
      top: document.body.scrollTop + document.documentElement.scrollTop
    }
    const mousepos = {
      x: e.clientX + pageScroll.left,
      y: e.clientY + pageScroll.top
    }
    const mouseposInDOM = {
      x: mousepos.x - bound.left - pageScroll.left,
      y: mousepos.y - bound.top - pageScroll.top
    }
    return mouseposInDOM
  }

  // Move layout when mouse move
  function moveLayout(e) {
    const mousepos = getMousePosition(e)

    for (let i = 0; i < children.length; i++) {
      let r = children[i].rotate ? children[i].rotate : transformDefault
      let t = children[i].translate ? children[i].translate : transformDefault
      t = calculatePosition(t)
      r = calculatePosition(r)

      const transforms = {
        translate: {
          x: (t.x[1] - t.x[0]) / DOM.offsetWidth * mousepos.x + t.x[0],
          y: (t.y[1] - t.y[0]) / DOM.offsetHeight * mousepos.y + t.y[0],
          z: (t.z[1] - t.z[0]) / DOM.offsetHeight * mousepos.y + t.z[0]
        },
        rotate: {
          x: (r.x[1] - r.x[0]) / DOM.offsetHeight * mousepos.y + r.x[0],
          y: (r.y[1] - r.y[0]) / DOM.offsetWidth * mousepos.x + r.y[0],
          z: (r.z[1] - r.z[0]) / DOM.offsetWidth * mousepos.x + r.z[0]
        }
      }

      const name = DOM.querySelectorAll(children[i].className)
      const transit = children[i].transition ? children[i].transition : transitionDefault
      const matrix = getMatrix(transforms)

      transform(matrix, name)
      transition(transit, name)
    }
  }

  // Initail Mouse events
  function initMouseEvents() {
    const mouseMove = e => requestAnimationFrame(() => moveLayout(e))
    const mouseLeave = () => requestAnimationFrame(() => reset(DOM, selector))

    DOM.addEventListener('mouseleave', mouseLeave)
    DOM.addEventListener('mousemove', mouseMove)
  }

  // Generate real mouse position in selector
  function calculatePosition(obj) {
    let result = {}
    for (var k in obj) {
      if (!obj[k]) {
        result[k] = [0, 0]
      } else if (typeof obj[k] === 'number') {
        result[k] = [-1 * obj[k], obj[k]]
      }
    }
    return result
  }

  // Reset Matrix transform and transition
  function reset(obj, selector) {
    const transforms = {
      translate: transformDefault,
      rotate: transformDefault
    }
    for (let i = 0; i < children.length; i++) {
      const name = obj.querySelectorAll(children[i].className)
      const transit = children[i].transition ? children[i].transition : transitionDefault
      const matrix = getMatrix(transforms)

      transform(matrix, name)
      transition(transit, name)
    }
  }

  // Generate Matrix transform
  function getMatrix(transform) {
    const { rotate, translate } = transform
    var ScaleX = 1,
      ScaleY = 1,
      DepthY = 0,
      DepthX = 0,
      B = Math.cos(rotate.y * (Math.PI / 180)),
      F = Math.sin(rotate.y * (Math.PI / 180)),
      Y = Math.cos(rotate.x * (Math.PI / 180)),
      Z = Math.sin(rotate.x * (Math.PI / 180)),
      I = Math.cos(rotate.z * (Math.PI / 180)),
      P = Math.sin(rotate.z * (Math.PI / 180))

    var a = new Array(16)
    ;(a[0] = B * I * ScaleX),
      (a[1] = -1 * P),
      (a[2] = F),
      (a[3] = DepthY),
      (a[4] = P),
      (a[5] = Y * I * ScaleY),
      (a[6] = Z),
      (a[7] = DepthX),
      (a[8] = -1 * F),
      (a[9] = -1 * Z),
      (a[10] = B * Y),
      (a[11] = 0),
      (a[12] = translate.x),
      (a[13] = translate.y),
      (a[14] = translate.z),
      (a[15] = 1)

    let matrix3d = ''
    for (let i = 0; i < a.length; i++) {
      const cm = i == 0 ? '' : ','
      matrix3d = matrix3d.concat(cm + a[i])
    }
    return matrix3d
  }

  // Transform
  function transform(matrix, target) {
    Array.prototype.forEach.call(target, (el, i) => {
      el.style[transformProperty] = `matrix3d(${matrix})`
    })
  }

  // Transition
  function transition(transition, target) {
    Array.prototype.forEach.call(target, (el, i) => {
      el.style[transitionProperty] = transition
    })
  }
}
