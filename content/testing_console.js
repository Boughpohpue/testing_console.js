import { TextHelper } from './text_helper.js';
import { StdConsoleHandler } from './std_console_handler.js';
import { DOMController } from './dom_controller.js';
import { Printer } from './printer.js';

export class TestingConsole {
  static #initiated = false;
  static #loadedScripts = [];
  static #loadedStylesheets = [];

  static init(stdEnabled = false) {
    if (this.#initiated) { return; }
    console.log("Initializing this...");
    this.#loadedScripts = [];
    this.#loadedStylesheets = [];
    StdConsoleHandler.init(true);
    this.#overrideConsole();
    DOMController.init(this.#submit);
    Printer.init(DOMController.contentElement, true);
    StdConsoleHandler.log("TestingConsole initiated!");
    if (!stdEnabled) this.#disableStdConsole();
    this.#initiated = true;
  }

  static #enableStdConsole() { StdConsoleHandler.enable(); }
  static #disableStdConsole() { StdConsoleHandler.disable(); }
  static #printUsingTimeouts() { Printer.useTimeouts(); }
  static #printUsingAnimations() { Printer.useAnimations(); }

  static #clear() {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    Printer.clear();
    StdConsoleHandler.clear();
  }
  static #log(args) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = this.#formatArgs(args);
    msg.options.set("classList", ["log"]);
    Printer.enqueue(msg);
    StdConsoleHandler.info(msg.message);
  }
  static #info(args) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = this.#formatArgs(args);
    msg.options.set("classList", ["info"]);
    Printer.enqueue(msg);
    StdConsoleHandler.info(msg.message);
  }
  static #warn(args) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = this.#formatArgs(args);
    msg.options.set("classList", ["warn"]);
    Printer.enqueue(msg);
    StdConsoleHandler.warn(msg.message);
  }
  static #error(args) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = this.#formatArgs(args);
    msg.options.set("classList", ["error"]);
    Printer.enqueue(msg);
    StdConsoleHandler.error(msg.message);
  }
  static #submitText(message) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = this.#getMessageObj(message);
    msg.options.set("classList", ["text"]);
    Printer.enqueue(msg);
    StdConsoleHandler.log(msg.message);
  }
  static #submitScript(message) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = this.#getMessageObj(message);
    msg.options.set("classList", ["script"]);
    Printer.enqueue(msg);
    StdConsoleHandler.log(msg.message);
  }
  static #submitScriptEval(message) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    try {
      let evaluated = eval(message);
      //let evaluated = new Function(message)();
      if (!evaluated) { return; }
      let msg = this.#getMessageObj(`=> ${evaluated}`);
      msg.options.set("classList", ["script-eval"]);
      Printer.enqueue(msg);
      StdConsoleHandler.log(msg.message);
    } catch (e) {
      this.#error(e.message);
    }
  }
  static #submit(message) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    if (!TextHelper.isScript(message)) {
      TestingConsole.#submitText(message);
      return;
    }
    let scriptBody = TextHelper.getScriptBody(message);
    if (scriptBody.length === 0) { return; }
    TestingConsole.#submitScript(scriptBody);
    TestingConsole.#submitScriptEval(scriptBody);
  }

  static #loadScript(url, callback) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    this.#loadScriptFile(url, 'text/javascript', callback);
  }
  static #reloadScript(index) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let scripts = this.#loadedScripts.filter(s => s.type !== 'module');
    if (index <= 0 || index > scripts.length) {
      return 'Script index is out of range!';
    }
    let script = scripts[index - 1];
    return this.loadScript(script.src);
  }
  static #listScripts() {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let scripts = this.#loadedScripts.filter(s => s.type !== 'module').map(m => m.src);
    let retval = `Loaded scripts (${scripts.length}):`;
    for (let i = 0; i < scripts.length; i++) {
      retval += `\n${i+1}. ${scripts[i]}`;
    }
    return retval;
  }
  static #loadModule(url, callback) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    this.#loadScriptFile(url, 'module', callback);
  }
  static #reloadModule(index) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let modules = this.#loadedScripts.filter(s => s.type === 'module');
    if (index <= 0 || index > modules.length) {
      return 'Module index is out of range!';
    }
    let mod = modules[index - 1];
    return this.loadModule(mod.src);
  }
  static #listModules() {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let modules = this.#loadedScripts.filter(s => s.type === 'module').map(m => m.src);
    let retval = `Loaded modules (${modules.length}):`;
    for (let i = 0; i < modules.length; i++) {
      retval += `\n${i+1}. ${modules[i]}`;
    }
    return retval;
  }
  static #loadStylesheet(url) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    this.#loadStylesheetFile(url);
  }
  static #reloadStylesheet(index) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let sheets = this.#loadedStylesheets;
    if (index <= 0 || index > sheets.length) {
      return 'Stylesheet index is out of range!';
    }
    let sheet = sheets[index - 1];
    return this.loadStylesheet(sheet.href);
  }
  static #listStylesheets() {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let sheets = this.#loadedStylesheets.map(s => s.href);
    let retval = `Loaded stylesheets (${sheets.length}):`;
    for (let i = 0; i < sheets.length; i++) {
      retval += `\n${i+1}. ${sheets[i]}`;
    }
    return retval;
  }

  static #loadStylesheetFile(url) {
    if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
    const linkElement = document.createElement('link');
    linkElement.rel = "stylesheet";
    linkElement.type = "text/css";
    linkElement.href = url;
    this.#loadedStylesheets.push(document.head.appendChild(linkElement));
  }
  static #loadScriptFile(url, type, callback) {
    const existing = this.#loadedScripts.find(s => s.src === url);
    const scriptElement = document.createElement('script');
    scriptElement.onreadystatechange = callback;
    scriptElement.onload = callback;
    scriptElement.type = type;
    scriptElement.src = url;
    if (!existing) {
      this.#loadedScripts.push({
        src: url,
        type: type,
        counter: 1,
        element: document.head.appendChild(scriptElement)});
    }
    else {
      document.head.removeChild(existing.element);
      scriptElement.src = `${url}?c=${existing.counter++}`;
      existing.element = document.head.appendChild(scriptElement);
    }
  }

	static #getMessageObj(message, options = undefined) {
		const opts = options instanceof Map ? options : new Map();
		return { message: message, options: opts };
	}
  static #formatArgs(args) {
    if (args.length === 0) return;
    const [first, ...rest] = args;
    const opts = rest.length > 0 && rest[rest.length - 1] instanceof Map ? rest.pop() : new Map();
    const msgParts = [];
    if (typeof first === "string" && /%[sdifo]/.test(first)) {
      let i = 0;
      const formatted = first.replace(/%[sdifo]/g, () => {
        const val = rest[i++];
        return this.#formatArg(val);
      });
      msgParts.push(formatted);
      for (let j = i; j < rest.length; j++) {
        msgParts.push(this.#formatArg(rest[j]));
      }
    } else {
      msgParts.push(this.#formatArg(first));
      rest.forEach((arg) => { msgParts.push(this.#formatArg(arg)); });
    }
    return this.#getMessageObj(msgParts.join(' '),  opts);
  }
  static #formatArg(arg) {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object') return this.#formatObj(arg);
    if (typeof arg === 'symbol') return arg.toString();
    if (typeof arg === 'function') return arg.toString();
    return String(arg);
  }
  static #formatObj(obj) {
    let objStr = JSON.stringify(obj, null, 2);
    objStr = objStr.replace(/\s+/g, ' ');
    objStr = objStr.replace(/"/g, "'");
    if (!Array.isArray(obj))
      objStr = objStr.replace(/'([^']+)':/g, '$1:');
    return objStr;
  }

  static #overrideConsole() {
    console.init = () => this.init();
    console.clear = () => this.#clear();
    console.log = (...args) => this.#log([...args]);
    console.info = (...args) => this.#info([...args]);
    console.warn = (...args) => this.#warn([...args]);
    console.error = (...args) => this.#error([...args]);
    console.enableStdConsole = () => this.#enableStdConsole();
    console.disableStdConsole = () => this.#disableStdConsole();
    console.printUsingTimeouts =  () => this.#printUsingTimeouts();
    console.printUsingAnimations = () => this.#printUsingAnimations();
    console.loadScript = (url, callback) => this.#loadScript(url, callback);
    console.reloadScript = (index) => { return this.#reloadScript(index); };
    console.listScripts = () => { return this.#listScripts(); };
    console.loadModule = (url, callback) => this.#loadModule(url, callback);
    console.reloadModule = (index) => { return this.#reloadModule(index); };
    console.listModules = () => { return this.#listModules(); };
    console.loadStylesheet = (url) => this.#loadStylesheet(url);
    console.reloadStylesheet = (index) => { return this.#reloadStylesheet(index); };
    console.listStylesheets = () => { return this.#listStylesheets(); };
    console.help = function () {
      const availableFunctions = [];
      availableFunctions.push('console.init(stdEnabled)');
      availableFunctions.push('console.help()');
      availableFunctions.push('console.clear()');
      availableFunctions.push('console.log(...args, Map? opts)');
      availableFunctions.push('console.info(...args, Map? opts)');
      availableFunctions.push('console.warn(...args, Map? opts)');
      availableFunctions.push('console.error(...args, Map? opts)');
      availableFunctions.push('console.enableStdConsole()');
      availableFunctions.push('console.disableStdConsole()');
      availableFunctions.push('console.printUsingTimeouts()');
      availableFunctions.push('console.printUsingAnimations()');
      availableFunctions.push('console.loadScript(url)');
      availableFunctions.push('console.listScripts()');
      availableFunctions.push('console.reloadScript(index)');
      availableFunctions.push('console.loadModule(url)');
      availableFunctions.push('console.listModules()');
      availableFunctions.push('console.reloadModule(index)');
      availableFunctions.push('console.loadStylesheet(url)');
      availableFunctions.push('console.listStylesheets()');
      availableFunctions.push('console.reloadStylesheet(index)');
      return `Available functions:\n${availableFunctions.join("\n")}`;
    };
  }
}

export default TestingConsole;
