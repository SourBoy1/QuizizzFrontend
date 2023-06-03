class FocusRingsHandler {
  constructor(window) {
    this.window = window;
  }

  appendUsingMouseClassToBody() {
    this.window.document.body && this.window.document.body.classList.add('using-mouse');
  }

  removeUsingMouseClassFromBody(event) {
    if (event.keyCode === 9) {
      this.window.document.body && this.window.document.body.classList.remove('using-mouse');
    }
  }

  handleFocusRings() {
    this.window.addEventListener('mousedown', this.appendUsingMouseClassToBody);
    this.window.addEventListener('keydown', this.removeUsingMouseClassFromBody);
  }

  stopHandlingFocusRings() {
    this.window.removeEventListener('mousedown', this.appendUsingMouseClassToBody);
    this.window.removeEventListener('keydown', this.removeUsingMouseClassFromBody);
  }
}

let focusRingsHandler = null;
export function handleFocusRings(window) {
  if (!focusRingsHandler) {
    focusRingsHandler = new FocusRingsHandler(window);
    focusRingsHandler.handleFocusRings();
  }
}
export function stopHandlingFocusRings() {
  focusRingsHandler && focusRingsHandler.stopHandlingFocusRings();
}

export function appendUsingMouseClassToBody(window) {
  window.document.body && window.document.body.classList.add('using-mouse');
}
