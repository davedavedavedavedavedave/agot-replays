define(() => {
  let utils = {
    // remove css class from element
    removeClass: (el, className) => {
      let re = new RegExp('( |^)' + className + '( |$)','g');
      el.className = el.className.replace(re, ' ');
    },
    // add css class to element
    addClass: (el, className) => {
      if (!utils.hasClass(el, className)) {
        el.className += ' ' + className;
      }
    },
    // checks if given element has specified css class
    hasClass: (el, className) => {
      let re = new RegExp('( |^)' + className + '( |$)', 'g');
      if (!el.className) {
        return false;
      }
      return !!el.className.match(re);
    },
    // Helper to get height of element (including margin)
    getOuterHeight: (el) => {
      let styles = window.getComputedStyle(el);
      return parseInt(styles.marginTop, 10) + parseInt(styles.marginBottom, 10) + el.offsetHeight;
    },
    // find parent which matches selector
    findParent: (el, selector) => {
      let parent = el.parentNode;
      if (parent.matches && parent.matches(selector)) {
        return parent;
      } else if (parent.parentNode) {
        return utils.findParent(parent, selector);
      } else {
        return null;
      }
    },
    // if has class, remove class, otherwise add class
    toggleClass: (el, className) => {
      if (utils.hasClass(el, className)) {
        utils.removeClass(el, className);
      } else {
        utils.addClass(el, className);
      }
    }
  }
  return utils;
})