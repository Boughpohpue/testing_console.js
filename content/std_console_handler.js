export class StdConsoleHandler {
  static #log   = undefined;
  static #info  = undefined;
  static #warn  = undefined;
  static #error = undefined;
  static #clear = undefined;
  static #initiated = false;
  static #isEnabled = false;

  static get #isActive() { return this.#initiated && this.#isEnabled; }

  static enable() { this.#isEnabled = true; }
  static disable() { this.#isEnabled = false; }
  static clear() { if (this.#isActive) { this.#clear(); } }
  static log(args) { if (this.#isActive) { this.#log(args); } }
  static info(args) { if (this.#isActive) { this.#info(args); } }
  static warn(args) { if (this.#isActive) { this.#warn(args); } }
  static error(args) { if (this.#isActive) { this.#error(args); } }

  static init(enabled = false) {
    if (this.#initiated) { return; }
    this.#log   = console.log;
    this.#info  = console.info;
    this.#warn  = console.warn;
    this.#error = console.error;
    this.#clear = console.clear;
    this.#isEnabled = enabled;
    this.#initiated = true;
  }
  static release(destroy = true) {
    if (!this.#initiated) { return; }
    console.log   = this.#log;
    console.info  = this.#info;
    console.warn  = this.#warn;
    console.error = this.#error;
    console.clear = this.#clear;
    if (destroy) this.#destroy();
    this.#isEnabled = false;
    this.#initiated = false;
  }
  static #destroy() {
    this.#log   = undefined;
    this.#info  = undefined;
    this.#warn  = undefined;
    this.#error = undefined;
    this.#clear = undefined;
  }
}

export default StdConsoleHandler;
