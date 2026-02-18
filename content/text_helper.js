
export class TextHelper {
  static #scriptBlockPrefix = '=>';

  static get #sbPrfx() { return this.#scriptBlockPrefix; }
  static get scriptBlockPrefix() { return this.#scriptBlockPrefix; }
  static set scriptBlockPrefix(val) { this.#scriptBlockPrefix = val; }

  static count(str, s) {
    if (!str || !s) { return; }
    let sub = str.replaceAll(s, "");
    return (str.length - sub.length) / s.length;
  }
  static countLines(str) {
    if (str === '') { return 1; }
    return this.count(str, '\n') + 1;
  }

  static clean(str) {
    while (str.includes('\n\n')) { str = str.replace('\n\n', '\n'); }
    while (str.endsWith('\n')) { str = str.substring(0, str.length - 1); }
    return str.trim();
  }
  static cleanScript(str) {
    while (str.endsWith('\n\n')) { str = str.substring(0, str.length - 1); }
    return str;
  }

  static isScript(str) {
    return str.startsWith(this.#sbPrfx);
  }
  static getScriptBody(str) {
    if (!this.isScript(str)) { return ""; }
    let scriptBody = str.substring(this.#sbPrfx.length);
    return this.clean(scriptBody);
  }
  static isSubmittable(str) {
    return this.isScript(str)
      ? this.getScriptBody(str).length > 0
      : this.clean(str).length > 0;
  }
  static isSubmittableScript(str) {
    return this.isSubmittable(str) && str.endsWith('\n\n');
  }

  static parseNumTxtPair(str) {
    if (!str) { return; }
    const match = str.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!match) { return; }
    const txt = match[2];
    const numStr = match[1];
    const num = numStr.includes('.')
      ? parseFloat(numStr)
      : parseInt(numStr, 10);
    return { num, txt };
  }
}

export default TextHelper;
