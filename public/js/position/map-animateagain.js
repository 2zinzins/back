class AnimateAgainControl extends ol.control.Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options) {
      const options = opt_options || {};
  
      const button = document.createElement('button');
      button.innerHTML = 'R';
  
      const element = document.createElement('div');
      element.className = 'animate-again ol-unselectable ol-control';
      element.appendChild(button);
  
      super({
        element: element,
        target: options.target,
      });
  
      button.addEventListener('click', this.handleAnimateAgain.bind(this), false);
    }
  
    handleAnimateAgain() {
      window.lc.set(LAST_ANIMATED_ID_LC_ITEM, undefined)
      location.reload()
    }
  }