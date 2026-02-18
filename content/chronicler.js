
export class Chronicler {
  static #scrollIdx = -1;
  static #shelfSize = 69;
  static #shelvedScrolls = [];
  static #nonScrollValue = "";

  static get shelfSize() { return this.#shelfSize; }
  static set shelfSize(val) {
    if (val === this.#shelfSize || val < 0) { return; }
    this.#resetIdx();
    this.#shelfSize = val;
    this.#cleanShelf();
  }

  static get count() { return this.#shelvedScrolls.length; }
  static get hasScrolls() { return this.count > 0; }

  static get currScroll() {
    return this.hasScrolls && this.#scrollIdx >= 0
      ? this.#shelvedScrolls[this.#scrollIdx]
      : this.#nonScrollValue;
  }
  static get prevScroll() {
    if (this.#scrollIdx === -1)
    { this.#scrollIdx = this.count - 1; }
    else if (this.#scrollIdx > 0)
    { this.#scrollIdx--; }
    return this.currScroll;
  }
  static get nextScroll() {
    if (this.#scrollIdx >= 0)
    { this.#scrollIdx++; }
    if (this.#scrollIdx === this.count)
    { this.#resetIdx(); }
    return this.currScroll;
  }

  static inscribe(str) {
    if (!str) { return; }
    this.#resetIdx();
    this.#shelvedScrolls = this.#shelvedScrolls.filter(s => s !== str);
    this.#shelvedScrolls.push(str);
    this.#cleanShelf();
  }
  static clearShelf() {
    this.#resetIdx();
    this.#shelvedScrolls = [];
  }
  static reset(shelfSize = 69, nonScrollValue = "") {
    this.shelfSize = shelfSize;
    this.#scrollIdx = -1;
    this.#shelvedScrolls = [];
    this.#nonScrollValue = nonScrollValue;
  }

  static #resetIdx() {
    this.#scrollIdx = -1;
  }
  static #cleanShelf() {
    while (this.count > this.#shelfSize) {
      this.#shelvedScrolls.shift();
    }
  }
}

export default Chronicler;
