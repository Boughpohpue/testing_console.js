import { DOMHelper } from './dom_helper.js';

export class Printer {
  static #queue = [];
  static #initiated = false;
  static #isPrinting = false;
  static #outputElement = undefined;
  static #useAnimationFrameRequest = false;

  static get #hasItems() { return this.#queue.length > 0; }
  static get #nextItem() { return this.#queue.shift(); }

  static useTimeouts() { this.#useAnimationFrameRequest = false; }
  static useAnimations() { this.#useAnimationFrameRequest = true; }

  static init(outputElement, useAnimationFrameRequest = false) {
    if (this.#initiated) { return; }
    if (!(outputElement instanceof HTMLElement))
      throw new Error('outputElement must be a instance of HTMLElement!');
    this.#queue = [];
    this.#isPrinting = false;
    this.#outputElement = outputElement;
    this.#useAnimationFrameRequest = useAnimationFrameRequest;
    this.#initiated = true;
  }
  static enqueue(msg) {
    if (!this.#initiated) throw new Error('Printer not initiated!');
    this.#queue.push(
      msg.message.split('\n')
      .map((line) => ({ content: line, attributes: msg.options })));
    if (!this.#isPrinting) { this.#print(); }
  }
  static clear() {
    if (!this.#initiated) throw new Error('Printer not initiated!');
    DOMHelper.clearElement(this.#outputElement);
  }
  static #print() {
    if (this.#isPrinting || !this.#hasItems) { return; }
    this.#isPrinting = true;
    this.#printItem(this.#nextItem);
  }
  static #printItem(item) {
    if (!item || item.length === 0) {
      this.#isPrinting = false;
      setTimeout(() => this.#print(), 369);
      return;
    }
    this.#addTextItem(item.shift());
    DOMHelper.scrollToBottom();
    if (this.#useAnimationFrameRequest) {
      requestAnimationFrame(() => this.#printItem(item));
    }
    else {
      setTimeout(() => this.#printItem(item), 144);
    }
  }
  static #addNewLine() {
    DOMHelper.addElement(this.#outputElement, "br")
  }
  static #addTextItem(itm) {
    this.#addNewLine();
    DOMHelper.addTextNode(
      DOMHelper.addElement(
        this.#outputElement,
        "span",
        itm.attributes),
      itm.content);
  }
}

export default Printer;
