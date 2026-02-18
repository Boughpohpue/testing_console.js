import { TextHelper } from './text_helper.js';
import { DOMHelper } from './dom_helper.js';
import { Chronicler } from './chronicler.js';

export class DOMController {
  static #contentElement = undefined;
  static #userInputElement = undefined;
  static #userInputSubmitFn = undefined;

  static init(uiSubmitFn = undefined) {
    if (typeof uiSubmitFn !== "undefined"
      && typeof uiSubmitFn !== "function")
        throw new Error("Provided uiSubmitFn is not a function!");
    this.#userInputSubmitFn = uiSubmitFn;
    this.#addViewportElement();
    this.#addStylesLinkElement();
    this.#addOutputElement();
    this.#contentElement = DOMHelper.getElementById('log_content');
    if (typeof this.#userInputSubmitFn === "function") {
      this.#addInputElement();
      this.#userInputElement = DOMHelper.getElementById('user_input');
      DOMHelper.addListener(DOMHelper.body, "keyup", this.#onBodyKeyUp);
    }
  }

  static get #inputElem() { return this.#userInputElement; }
  static get #inputElemValue() { return this.#userInputElement.value; }
  static set #inputElemValue(val) { this.#userInputElement.value = val; }
  static get contentElement() { return this.#contentElement; }

  static #addViewportElement() {
    DOMHelper.addElement(
      document.head,
      "meta",
      new Map([
        ["name", "viewport"],
        ["content", "width=device-width, initial-scale=1.0"]]));
  }
  static #addStylesLinkElement() {
    const href = `${DOMHelper.getCurrentDirectoryUrl()}/console.css`;
    DOMHelper.addElement(
      document.head,
      "link",
      new Map([
        ["href", href],
        ["type", "text/css"],
        ["rel", "stylesheet"]]));
  }
  static #addOutputElement() {
    DOMHelper.addElement(
      DOMHelper.addElement(
        document.body,
        "div",
        new Map([
          ["id", "console_output"],
          ["classList", ["console-output"]]])),
      "pre",
      new Map([
        ["id", "log_content"],
        ["classList", ["log-content"]]]));
  }
  static #addInputElement() {
    DOMHelper.addElement(
      document.body,
      "textarea",
      new Map([
        ["id", "user_input"],
        ["rows", "1"],
        ["spellcheck", "false"],
        ["classList", ["user-input", "user-input-text", "user-input-hidden"]]]),
      new Map([
        ["keyup", this.#onInputElementKeyUp],
        ["focusout", this.#onInputElementFocusOut]]));
  }

  static #onBodyKeyUp(e) {
    if (e.key === 'Enter'
      && this.#inputElem.classList.contains('user-input-hidden')) {
        this.#showUserInputElement();
    }
  }
  static #onInputElementKeyUp(e) {
    this.#handleInputKey(e.key);
  }
  static #onInputElementFocusOut() {
    this.#hideUserInputElement();
  }

  static #showUserInputElement() {
    if (!this.#inputElem.classList.contains('user-input-hidden'))
    { return; }
    this.#inputElem.classList.remove('user-input-hidden');
    this.#orderHideUserInputElement();
    DOMHelper.focusElement(this.#inputElem);
    DOMHelper.orderScrollToBottom();
  }
  static #hideUserInputElement() {
    if (this.#inputElemValue.length > 0
      || this.#inputElem.classList.contains('user-input-hidden')) {
      return;
    }
    this.#inputElem.classList.add('user-input-hidden');
    DOMHelper.orderScrollToBottom();
    DOMHelper.focusElement(document.body);
  }
  static #orderHideUserInputElement() {
    setTimeout(this.#hideUserInputElement, 9369);
  }

  static #handleInputKey(key) {
    if (!this.#inputElem) { return; }
    const rawContent = this.#inputElemValue;
    if (key === 'ArrowUp') {
      this.#inputElemValue = Chronicler.prevScroll;
    }
    else if (key === 'ArrowDown') {
      this.#inputElemValue = Chronicler.nextScroll;
    }
    else if (key === '>'
      && rawContent === TextHelper.scriptBlockPrefix) {
        this.#inputElemValue = `${rawContent}\n`;
    }
    else if (key === 'Backspace'
      && rawContent === TextHelper.scriptBlockPrefix) {
        this.#inputElemValue = "";
    }
    else if(key === 'Enter') {
      let canSubmit = true;
      let content = TextHelper.clean(rawContent);
      if (TextHelper.isScript(rawContent)) {
        canSubmit = TextHelper.isSubmittableScript(rawContent);
        if (!canSubmit) {
          this.#inputElemValue = TextHelper.cleanScript(rawContent);
        }
      }
      else {
        canSubmit = TextHelper.isSubmittable(content);
        if (!canSubmit) {
          this.#inputElemValue = content;
        }
      }
      if (canSubmit) {
        this.#inputElemValue = "";
        Chronicler.inscribe(content);
        this.#userInputSubmitFn(content);
      }
    }

    this.#adjustUserInputElementClass();
    this.#adjustUserInputElementHeight();
    if (this.#inputElemValue.length === 0) {
      this.#orderHideUserInputElement();
    }
  }

  static #adjustUserInputElementHeight() {
    if (!this.#inputElem) { return; }
    let height = TextHelper.parseNumTxtPair(
      DOMHelper.getElementCssValue(this.#inputElem, 'height'));
    let fontSize = TextHelper.parseNumTxtPair(
      DOMHelper.getElementCssValue(this.#inputElem, 'font-size'));
    if (!height || !fontSize) { return; }
    let linesCount = TextHelper.countLines(this.#inputElemValue);
    let newHeight = linesCount * fontSize.num * 1.44;
    let newHeightStr = `${newHeight}${fontSize.txt}`;
    this.#inputElem.style.height = newHeightStr;
  }
  static #adjustUserInputElementClass() {
    if (!this.#inputElem) { return; }
    let valueIsScript = TextHelper.isScript(this.#inputElemValue);
    if ((!valueIsScript
        && this.#inputElem.classList.contains('user-input-text')
        && !this.#inputElem.classList.contains('user-input-script'))
      || (valueIsScript
        && this.#inputElem.classList.contains('user-input-script')
        && !this.#inputElem.classList.contains('user-input-text'))) {
      return;
    }
    this.#inputElem.classList.toggle('user-input-text');
    this.#inputElem.classList.toggle('user-input-script');
    DOMHelper.orderScrollToBottom();
  }
}

export default DOMController;
