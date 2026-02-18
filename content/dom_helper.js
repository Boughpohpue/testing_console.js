
export class DOMHelper {
  static get doc() { return document; }
  static get body() { return document.body; }
  static get head() { return document.head; }
  static get scrollingElement() { return (document.scrollingElement || document.body); }
  static get currentScriptUrl() { return (document.currentScript?.src || import.meta.url); }

  static getCurrentDirectoryUrl(withEndSeparator = false) {
    const currentUrl = this.currentScriptUrl;
    if (!currentUrl) return;
    const separator = currentUrl.includes("\\")
      ? "\\"
      : currentUrl.includes("/")
        ? "/"
        : undefined;
    if (!separator) return;
    const offset = withEndSeparator ? 1 : 0;
    return currentUrl.substring(0, currentUrl.lastIndexOf(separator) + offset);
  }

  static focusElement(elem) {
    if (!(elem instanceof HTMLElement))
      throw new Error("elem must be ad instance of HTMLElement!");
    elem.focus();
  }
  static getElementById(id) {
    return document.getElementById(id);
  }
  static getElement(tagName, attributesMap = undefined) {
    if (attributesMap?.has("id"))
      return document.getElementById(attributesMap.get("id"));
    if (!tagName) throw new Error("tagName is null or empty!");
    let selector = tagName;
    if (attributesMap?.size > 0)
      for (const [key, val] of attributesMap)
        if (typeof key === "string" && typeof val === "string")
          selector += `[${key}="${val}"]`;
    return document.querySelector(selector);
  }
  static getElements(tagName, attributesMap = undefined) {
    if (!tagName) throw new Error("tagName is null or empty!");
    let selector = tagName;
    if (attributesMap?.size > 0)
      for (const [key, val] of attributesMap)
        if (typeof key === "string" && typeof val === "string")
          selector += `[${key}="${val}"]`;
    return document.querySelectorAll(selector);
  }
  static elementExists(tagName, attributesMap = undefined) {
    return this.getElement(tagName, attributesMap) !== null;
  }
  static createElement(tagName, attributesMap = undefined, listenersMap = undefined) {
    if (attributesMap?.has("id") && this.elementExists(tagName, attributesMap))
      return null;
    let elem = document.createElement(tagName);
    if (elem instanceof HTMLUnknownElement)
      throw new Error("tagName must be a valid HTML tag name!");
    if (attributesMap?.size > 0)
      for (const [key, val] of attributesMap)
        if (key === "classList")
          this.addCssClasses(elem, val);
        else if (typeof key === "string")
          elem.setAttribute(key, String(val));
    if (listenersMap?.size > 0)
      this.addListeners(elem, listenersMap);
    return elem;
  }
  static addElement(targetElement, tagName, attributesMap = undefined, listenersMap = undefined) {
    if (!(targetElement instanceof HTMLElement))
      throw new Error("targetElement must be an instance of HTMLElement!");
    const elem = this.createElement(tagName, attributesMap, listenersMap);
    if (elem !== null) return targetElement.appendChild(elem);
  }
  static removeElement(targetElement, elemToRemove) {
    if (!(targetElement instanceof HTMLElement))
      throw new Error("targetElement must be an instance of HTMLElement!");
    return targetElement.removeChild(elemToRemove);
  }
  static clearElement(elem) {
    if (!(elem instanceof HTMLElement))
      throw new Error("elem must be an instance of HTMLElement!");
    while (elem.lastChild) elem.removeChild(elem.lastChild);
  }

  static addTextNode(targetElement, text) {
    if (!(targetElement instanceof HTMLElement))
      throw new Error("targetElement must be an instance of HTMLElement!");
    return targetElement.appendChild(document.createTextNode(text));
  }

  static addListener(elem, name, listener) {
    if (!(elem instanceof HTMLElement))
      throw new Error("elem must be ad instance of HTMLElement!");
    if (typeof name !== "string" || name.length === 0)
      throw new Error("Event name must be a non-empty string!");
    if (typeof listener !== "function")
      throw new Error("Event listener must be a function!");
    elem.addEventListener(name, listener);
  }
  static addListeners(elem, listenersMap) {
    if (!(elem instanceof HTMLElement))
      throw new Error("elem must be an instance of HTMLElement!");
    if (listenersMap?.size === 0) { return; }
    for (const [key, val] of listenersMap)
      this.addListener(elem, key, val);
  }

  static addCssClass(elem, className) {
    if (!(elem instanceof HTMLElement))
      throw new Error("elem must be an instance of HTMLElement!");
    if (typeof className !== "string" || className.length === 0) { return; }
    if (!elem.classList.contains(className)) elem.classList.add(className);
  }
  static addCssClasses(elem, classNames) {
    this.#validateElement(elem);
    if (typeof classNames === "string") classNames = [ classNames ];
    if (!Array.isArray(classNames)) { return; }
    classNames.forEach((cls) => this.addCssClass(elem, cls));
  }

  static getCssValue(style, cssPropertyName) {
    if (!style || !cssPropertyName) return null;
    return style.getPropertyValue(cssPropertyName);
  }
  static getElementCssValue(elem, cssPropertyName) {
    if (!elem || !cssPropertyName) return null;
    return this.getCssValue(window.getComputedStyle(elem), cssPropertyName);
  }
  static getElementCssValueById(elementId, cssPropertyName) {
    if (!elementId) return null;
    return this.getElementCssValue(document.getElementById(elementId), cssPropertyName);
  }

  static scrollToBottom() {
    DOMHelper.scrollingElement.scrollTop = DOMHelper.scrollingElement.scrollHeight;
  }
  static orderScrollToBottom(timeout = 240) {
    setTimeout(this.scrollToBottom, timeout);
  }

  static #validateElement(elem) {
    if (!(elem instanceof HTMLElement))
      throw new Error("Provided argument must be an instance of HTMLElement!");
  }
}

export default DOMHelper;
