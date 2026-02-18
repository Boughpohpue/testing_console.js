import { TextHelper } from './text_helper.js';
import { StdConsoleHandler } from './std_console_handler.js';
import { DOMController } from './dom_controller.js';
import { Printer } from './printer.js';

export class TestingConsole {
  static #initiated = false;
  static #loadedScripts = [];
  static #loadedStylesheets = [];

  static init(stdEnabled = false) {
    if (TestingConsole.#initiated) { return; }
    console.log("Initializing TestingConsole...");
    TestingConsole.#loadedScripts = [];
    TestingConsole.#loadedStylesheets = [];
    StdConsoleHandler.init(true);
    TestingConsole.#overrideConsole();
    DOMController.init(TestingConsole.#submit);
    Printer.init(DOMController.contentElement, true);
    StdConsoleHandler.log("TestingConsole initiated!");
    if (!stdEnabled) TestingConsole.#disableStdConsole();
    TestingConsole.#initiated = true;
    return Promise.resolve();
  }

  static #enableStdConsole() { StdConsoleHandler.enable(); }
  static #disableStdConsole() { StdConsoleHandler.disable(); }
  static #printUsingTimeouts() { Printer.useTimeouts(); }
  static #printUsingAnimations() { Printer.useAnimations(); }

  static #clear() {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    Printer.clear();
    StdConsoleHandler.clear();
  }
  static #log(args) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = TestingConsole.#formatArgs(args);
    msg.options.set("classList", ["log"]);
    Printer.enqueue(msg);
    StdConsoleHandler.info(msg.message);
  }
  static #info(args) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = TestingConsole.#formatArgs(args);
    msg.options.set("classList", ["info"]);
    Printer.enqueue(msg);
    StdConsoleHandler.info(msg.message);
  }
  static #warn(args) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = TestingConsole.#formatArgs(args);
    msg.options.set("classList", ["warn"]);
    Printer.enqueue(msg);
    StdConsoleHandler.warn(msg.message);
  }
  static #error(args) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = TestingConsole.#formatArgs(args);
    msg.options.set("classList", ["error"]);
    Printer.enqueue(msg);
    StdConsoleHandler.error(msg.message);
  }
  static #submitText(message) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = TestingConsole.#formatArgs(message);
    msg.options.set("classList", ["text"]);
    Printer.enqueue(msg);
    StdConsoleHandler.log(msg.message);
  }
  static #submitScript(message) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let msg = TestingConsole.#formatArgs(message);
    msg.options.set("classList", ["script"]);
    Printer.enqueue(msg);
    StdConsoleHandler.log(msg.message);
  }
  static #submitScriptEval(message) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    try {
      let evaluated = eval(message);
      //let evaluated = new Function(message)();
      if (!evaluated) { return; }
      let msg = TestingConsole.#formatArgs(evaluated);
      msg.options.set("classList", ["script-eval"]);
      Printer.enqueue(msg);
      StdConsoleHandler.log(msg.message);
    } catch (e) {
      TestingConsole.#error(e.message);
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
    TestingConsole.submitScript(scriptBody);
    TestingConsole.submitScriptEval(scriptBody);
  }

  static #loadScript(url, callback) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    TestingConsole.#loadScriptFile(url, 'text/javascript', callback);
  }
  static #reloadScript(index) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let scripts = TestingConsole.#loadedScripts.filter(s => s.type !== 'module');
    if (index <= 0 || index > scripts.length) {
      return 'Script index is out of range!';
    }
    let script = scripts[index - 1];
    return TestingConsole.loadScript(script.src);
  }
  static #listScripts() {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let scripts = TestingConsole.#loadedScripts.filter(s => s.type !== 'module').map(m => m.src);
    let retval = `Loaded scripts (${scripts.length}):`;
    for (let i = 0; i < scripts.length; i++) {
      retval += `\n${i+1}. ${scripts[i]}`;
    }
    return retval;
  }
  static #loadModule(url, callback) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    TestingConsole.#loadScriptFile(url, 'module', callback);
  }
  static #reloadModule(index) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let modules = TestingConsole.#loadedScripts.filter(s => s.type === 'module');
    if (index <= 0 || index > modules.length) {
      return 'Module index is out of range!';
    }
    let mod = modules[index - 1];
    return TestingConsole.loadModule(mod.src);
  }
  static #listModules() {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let modules = TestingConsole.#loadedScripts.filter(s => s.type === 'module').map(m => m.src);
    let retval = `Loaded modules (${modules.length}):`;
    for (let i = 0; i < modules.length; i++) {
      retval += `\n${i+1}. ${modules[i]}`;
    }
    return retval;
  }
  static #loadStylesheet(url) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    TestingConsole.#loadStylesheetFile(url);
  }
  static #reloadStylesheet(index) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let sheets = TestingConsole.#loadedStylesheets;
    if (index <= 0 || index > sheets.length) {
      return 'Stylesheet index is out of range!';
    }
    let sheet = sheets[index - 1];
    return TestingConsole.loadStylesheet(sheet.href);
  }
  static #listStylesheets() {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    let sheets = TestingConsole.#loadedStylesheets.map(s => s.href);
    let retval = `Loaded stylesheets (${sheets.length}):`;
    for (let i = 0; i < sheets.length; i++) {
      retval += `\n${i+1}. ${sheets[i]}`;
    }
    return retval;
  }

  static #loadStylesheetFile(url) {
    if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
    const linkElement = document.createElement('link');
    linkElement.rel = "stylesheet";
    linkElement.type = "text/css";
    linkElement.href = url;
    TestingConsole.#loadedStylesheets.push(document.head.appendChild(linkElement));
  }
  static #loadScriptFile(url, type, callback) {
    const existing = TestingConsole.#loadedScripts.find(s => s.src === url);
    const scriptElement = document.createElement('script');
    scriptElement.onreadystatechange = callback;
    scriptElement.onload = callback;
    scriptElement.type = type;
    scriptElement.src = url;
    if (!existing) {
      TestingConsole.#loadedScripts.push({
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

  static #formatArgs(args) {
    if (args.length === 0) return;
    const [first, ...rest] = args;
    const opts = rest.length > 0 && rest[rest.length - 1] instanceof Map ? rest.pop() : new Map();
    const msgParts = [];
    if (typeof first === "string" && /%[sdifo]/.test(first)) {
      let i = 0;
      const formatted = first.replace(/%[sdifo]/g, () => {
        const val = rest[i++];
        return TestingConsole.#formatArg(val);
      });
      msgParts.push(formatted);
      for (let j = i; j < rest.length; j++) {
        msgParts.push(TestingConsole.#formatArg(rest[j]));
      }
    } else {
      msgParts.push(TestingConsole.#formatArg(first));
      rest.forEach((arg) => { msgParts.push(TestingConsole.#formatArg(arg)); });
    }
    return { message: msgParts.join(' '), options: opts };
  }
  static #formatArg(arg) {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object') return TestingConsole.#formatObj(arg);
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
    console.init = () => TestingConsole.init();
    console.clear = () => TestingConsole.#clear();
    console.log = (...args) => TestingConsole.#log([...args]);
    console.info = (...args) => TestingConsole.#info([...args]);
    console.warn = (...args) => TestingConsole.#warn([...args]);
    console.error = (...args) => TestingConsole.#error([...args]);
    console.enableStdConsole = () => TestingConsole.#enableStdConsole();
    console.disableStdConsole = () => TestingConsole.#disableStdConsole();
    console.printUsingTimeouts =  () => TestingConsole.#printUsingTimeouts();
    console.printUsingAnimations = () => TestingConsole.#printUsingAnimations();
    console.loadScript = (url, callback) => TestingConsole.#loadScript(url, callback);
    console.reloadScript = (index) => { return TestingConsole.#reloadScript(index); };
    console.listScripts = () => { return TestingConsole.#listScripts(); };
    console.loadModule = (url, callback) => { TestingConsole.#loadModule(url, callback); };
    console.reloadModule = (index) => { return TestingConsole.#reloadModule(index); };
    console.listModules = () => { return TestingConsole.#listModules(); };
    console.loadStylesheet = (url) => TestingConsole.#loadStylesheet(url);
    console.reloadStylesheet = (index) => { return TestingConsole.#reloadStylesheet(index); };
    console.listStylesheets = () => { return TestingConsole.#listStylesheets(); };
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
