(function () {
	class TextHelper {
		static #scriptBlockPrefix = '=>';

		static get #sbPrfx() { return TextHelper.#scriptBlockPrefix; }
		static get scriptBlockPrefix() { return TextHelper.#scriptBlockPrefix; }
		static set scriptBlockPrefix(val) { TextHelper.#scriptBlockPrefix = val; }

		static clean(str) {
			while (str.includes('\n\n')) { str = str.replace('\n\n', '\n'); }
			while (str.endsWith('\n')) { str = str.substring(0, str.length - 1); }
			return str.trim();
		}
		static isScript(str) {
			return str.startsWith(TextHelper.#sbPrfx);
		}
		static getScriptBody(str) {
			if (!TextHelper.isScript(str)) { return ""; }
			let scriptBody = str.substring(TextHelper.#sbPrfx.length);
			return TextHelper.clean(scriptBody);
		}
		static isSubmittable(str) {
			return TextHelper.isScript(str)
				? TextHelper.getScriptBody(str).length > 0
				: TextHelper.clean(str).length > 0;
		}
		static isSubmittableScript(str) {
			return TextHelper.isSubmittable(str)
				&& str.endsWith('\n\n');
		}
		static cleanScript(str) {
			while (str.endsWith('\n\n')) { str = str.substring(0, str.length - 1); }
			return str;

		}
		static count(str, s) {
			if (!str || !s) { return; }
			let sub = str.replaceAll(s, "");
			return (str.length - sub.length) / s.length;
		}
		static countLines(str) {
			if (str === '') { return 1; }
			return TextHelper.count(str, '\n') + 1;
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
		static getPathToParent(path, withEndSeparator = false, pathSeparator = '/') {
			let offset = withEndSeparator ? 1 : 0;
			return path.substring(0, path.lastIndexOf(pathSeparator) + offset);
		}
	}

	class DOMHelper {
		static get doc() { return document; }
		static get body() { return document.body; }
		static get head() { return document.head; }
		static scrollingElement = (document.scrollingElement || document.body);

		static scrollToBottom() {
			DOMHelper.scrollingElement.scrollTop = DOMHelper.scrollingElement.scrollHeight;
		}
		static orderScrollToBottom() {
			setTimeout(DOMHelper.scrollToBottom, 240);
		}

		static getCurrentScriptUrl() {
			return document.currentScript.src;
		}
		static getCurrentDirectoryUrl(withEndSeparator = false) {
			return TextHelper.getPathToParent(DOMHelper.getCurrentScriptUrl(), withEndSeparator);
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
			return DOMHelper.getElement(tagName, attributesMap) !== null;
		}
		static createElement(tagName, attributesMap = undefined, listenersMap = undefined) {
			if (attributesMap?.has("id") && DOMHelper.elementExists(tagName, attributesMap))
				return null;
			let elem = document.createElement(tagName);
			if (elem instanceof HTMLUnknownElement)
				throw new Error("tagName must be a valid HTML tag name!");
			if (attributesMap?.size > 0)
				for (const [key, val] of attributesMap)
					if (key === "classList")
						DOMHelper.addCssClasses(elem, val);
					else if (typeof key === "string")
						elem.setAttribute(key, String(val));
			if (listenersMap?.size > 0)
				DOMHelper.addListeners(elem, listenersMap);
			return elem;
		}
		static addElement(targetElement, tagName, attributesMap = undefined, listenersMap = undefined) {
			if (!(targetElement instanceof HTMLElement))
				throw new Error("targetElement must be an instance of HTMLElement!");
			const elem = DOMHelper.createElement(tagName, attributesMap, listenersMap);
			if (elem !== null) return targetElement.appendChild(elem);
		}
		static removeElement(targetElement, elemToRemove) {
			if (!(targetElement instanceof HTMLElement))
				throw new Error("targetElement must be an instance of HTMLElement!");
			return targetElement.removeChild(elemToRemove);
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
				DOMHelper.addListener(elem, key, val);
		}

		static addCssClasses(elem, classNames) {
			if (!(elem instanceof HTMLElement))
				throw new Error("elem must be an instance of HTMLElement!");
			if (!Array.isArray(classNames)) { return; }
			for (const cls of classNames) {
				if (typeof cls === "string" && cls.length > 0) {
					elem.classList.add(cls);
				}
			}
		}
		static getCssValue(style, cssPropertyName) {
			if (!style || !cssPropertyName) return null;
			return style.getPropertyValue(cssPropertyName);
		}
		static getElementCssValue(elem, cssPropertyName) {
			if (!elem || !cssPropertyName) return null;
			return DOMHelper.getCssValue(window.getComputedStyle(elem), cssPropertyName);
		}
		static getElementCssValueById(elementId, cssPropertyName) {
			if (!elementId) return null;
			return DOMHelper.getElementCssValue(document.getElementById(elementId), cssPropertyName);
		}
	}

	class Chronicler {
		static #scrollIdx = -1;
		static #shelfSize = 69;
		static #shelvedScrolls = [];
		static #nonScrollValue = "";

		static reset(shelfSize = 69, nonScrollValue = "") {
			Chronicler.shelfSize = shelfSize;
			Chronicler.#scrollIdx = -1;
			Chronicler.#shelvedScrolls = [];
			Chronicler.#nonScrollValue = nonScrollValue;
		}

		static inscribe(str) {
			if (!str) { return; }
			Chronicler.#resetIdx();
			Chronicler.#shelvedScrolls = Chronicler.#shelvedScrolls.filter(s => s !== str);
			Chronicler.#shelvedScrolls.push(str);
			Chronicler.#cleanShelf();
		}
		static clearShelf() {
			Chronicler.#resetIdx();
			Chronicler.#shelvedScrolls = [];
		}

		static get shelfSize() { return Chronicler.#shelfSize; }
		static set shelfSize(val) {
			if (val === Chronicler.#shelfSize || val < 0) { return; }
			Chronicler.#resetIdx();
			Chronicler.#shelfSize = val;
			Chronicler.#cleanShelf();
		}

		static get count() { return Chronicler.#shelvedScrolls.length; }
		static get hasScrolls() { return Chronicler.count > 0; }

		static get currScroll() {
			return Chronicler.hasScrolls && Chronicler.#scrollIdx >= 0
				? Chronicler.#shelvedScrolls[Chronicler.#scrollIdx]
				: Chronicler.#nonScrollValue;
		}
		static get prevScroll() {
			if (Chronicler.#scrollIdx === -1)
			{ Chronicler.#scrollIdx = Chronicler.count - 1; }
			else if (Chronicler.#scrollIdx > 0)
			{ Chronicler.#scrollIdx--; }
			return Chronicler.currScroll;
		}
		static get nextScroll() {
			if (Chronicler.#scrollIdx >= 0)
			{ Chronicler.#scrollIdx++; }
			if (Chronicler.#scrollIdx === Chronicler.count)
			{ Chronicler.#resetIdx(); }
			return Chronicler.currScroll;
		}

		static #resetIdx() {
			Chronicler.#scrollIdx = -1;
		}
		static #cleanShelf() {
			while (Chronicler.count > Chronicler.#shelfSize) {
				Chronicler.#shelvedScrolls.shift();
			}
		}
	}

	class Printer {
		static #queue = [];
		static #initiated = false;
		static #isPrinting = false;
		static #outputElement = undefined;
		static #useAnimationFrameRequest = false;

		static get #hasItems() { return Printer.#queue.length > 0; }
		static get #nextItem() { return Printer.#queue.shift(); }

		static init(outputElement, useAnimationFrameRequest = false) {
			if (Printer.#initiated) { return; }
			if (!(outputElement instanceof HTMLElement))
				throw new Error('outputElement must be a instance of HTMLElement!');
			Printer.#useAnimationFrameRequest = useAnimationFrameRequest;
			Printer.#outputElement = outputElement;
			Printer.#isPrinting = false;
			Printer.#initiated = true;
		}

		static useTimeouts() {
			if (!Printer.#useAnimationFrameRequest) return false;
			Printer.#useAnimationFrameRequest = false;
			return true;
		}
		static useAnimations() {
			if (Printer.#useAnimationFrameRequest) return false;
			Printer.#useAnimationFrameRequest = true;
			return true;
		}

		static clear() {
			if (!Printer.#initiated)
				throw new Error('Printer not initiated!');
			Printer.#outputElement.innerHTML = "";
		}
		static enqueue(message, className, options = undefined) {
			if (!Printer.#initiated)
				throw new Error('Printer not initiated!');
			let msg = typeof message === 'object' && JSON && JSON.stringify
				? JSON.stringify(message, null, 3)
				: `${message}`;
			Printer.#queue.push(
				msg.split('\n')
				.map((ln) => ({ txt: ln, className: className, opts: options })));
			if (!Printer.#isPrinting) { Printer.#print(); }
		}
		static #print() {
			if (Printer.#isPrinting || !Printer.#hasItems) { return; }
			Printer.#isPrinting = true;
			Printer.#printItem(Printer.#nextItem);
		}
		static #printItem(item) {
			if (!item || item.length === 0) {
				Printer.#isPrinting = false;
				setTimeout(function() { Printer.#print(); }, 369);
				return;
			}
			Printer.#addNewLine();
			Printer.#addTextItem(item.shift());
			DOMHelper.scrollToBottom();
			if (Printer.#useAnimationFrameRequest) {
				requestAnimationFrame(() => Printer.#printItem(item));
			}
			else {
				setTimeout(function() { Printer.#printItem(item); }, 144);
			}
		}
		static #addNewLine() {
			DOMHelper.addElement(Printer.#outputElement, "br")
		}
		static #addTextItem(itm) {
			DOMHelper.addTextNode(
				DOMHelper.addElement(
					Printer.#outputElement,
					"span",
					Printer.#getItemAttributesMap(itm)),
				itm.txt);
		}
		static #getItemAttributesMap(itm) {
			let attrMap = new Map([["classList", [itm.className]]]);
			if (itm.opts && typeof itm.opts.style === 'string')
				attrMap.set("style", itm.opts.style);
			return attrMap;
		}
	}

	class StdConsole {
		static #log   = undefined;
		static #info  = undefined;
		static #warn  = undefined;
		static #error = undefined;
		static #clear = undefined;
		static #initiated = false;
		static #isEnabled = false;

		static get #isActive() {
			return StdConsole.#initiated && StdConsole.#isEnabled;
		}

		static enable() { StdConsole.#isEnabled = true; }
		static disable() { StdConsole.#isEnabled = false; }

		static init(enabled = false) {
			if (StdConsole.#initiated) { return; }
			StdConsole.#log   = console.log;
			StdConsole.#info  = console.info;
			StdConsole.#warn  = console.warn;
			StdConsole.#error = console.error;
			StdConsole.#clear = console.clear;
			StdConsole.#initiated = true;
			StdConsole.#isEnabled = enabled;
		}
		static release(destroy = true) {
			if (!StdConsole.#initiated) { return; }
			console.log   = StdConsole.#log;
			console.info  = StdConsole.#info;
			console.warn  = StdConsole.#warn;
			console.error = StdConsole.#error;
			console.clear = StdConsole.#clear;
			if (destroy) StdConsole.#destroy();
			StdConsole.#initiated = false;
			StdConsole.#isEnabled = false;
		}
		static #destroy() {
			StdConsole.#log   = undefined;
			StdConsole.#info  = undefined;
			StdConsole.#warn  = undefined;
			StdConsole.#error = undefined;
			StdConsole.#clear = undefined;
		}

		static log(message) {
			if (!StdConsole.#isActive) { return; }
			StdConsole.#log(message);
		}
		static info(message) {
			if (!StdConsole.#isActive) { return; }
			StdConsole.#info(message);
		}
		static warn(message) {
			if (!StdConsole.#isActive) { return; }
			StdConsole.#warn(message);
		}
		static error(message) {
			if (!StdConsole.#isActive) { return; }
			StdConsole.#error(message);
		}
		static clear() {
			if (!StdConsole.#isActive) { return; }
			StdConsole.#clear();
		}
		static print(message, type) {
			if (!StdConsole.#isActive) { return; }
			switch(type) {
				case 'error':
					StdConsole.error(message);
					break;
				case 'warn':
					StdConsole.warn(message);
					break;
				case 'info':
					StdConsole.info(message);
					break;
				case 'log':
				default:
					StdConsole.log(message);
					break;
			}
		}
	}

	class TCUIController {
		static #contentElement = undefined;
		static #userInputElement = undefined;
		static #userInputSubmitFn = undefined;

		static init(uiSubmitFn = undefined) {
			if (typeof uiSubmitFn !== "undefined"
				&& typeof uiSubmitFn !== "function")
					throw new Error("Provided uiSubmitFn is not a function!");
			TCUIController.#userInputSubmitFn = uiSubmitFn;
			TCUIController.#addViewportElement();
			TCUIController.#addStylesLinkElement();
			TCUIController.#addOutputElement();
			TCUIController.#contentElement = DOMHelper.getElementById('log_content');
			if (typeof TCUIController.#userInputSubmitFn === "function") {
				TCUIController.#addInputElement();
				TCUIController.#userInputElement = DOMHelper.getElementById('user_input');
				DOMHelper.addListener(DOMHelper.body, "keyup", TCUIController.#onBodyKeyUp);
			}
		}

		static get #inputElem() { return TCUIController.#userInputElement; }
		static get #inputElemValue() { return TCUIController.#userInputElement.value; }
		static set #inputElemValue(val) { TCUIController.#userInputElement.value = val; }
		static get contentElement() { return TCUIController.#contentElement; }

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
					["keyup", TCUIController.#onInputElementKeyUp],
					["focusout", TCUIController.#onInputElementFocusOut]]));
		}

		static #onBodyKeyUp(e) {
			if (e.key === 'Enter'
				&& TCUIController.#inputElem.classList.contains('user-input-hidden')) {
					TCUIController.#showUserInputElement();
			}
		}
		static #onInputElementKeyUp(e) {
			TCUIController.#handleInputKey(e.key);
		}
		static #onInputElementFocusOut() {
			TCUIController.#hideUserInputElement();
		}

		static #showUserInputElement() {
			if (!TCUIController.#inputElem.classList.contains('user-input-hidden'))
			{ return; }
			TCUIController.#inputElem.classList.remove('user-input-hidden');
			TCUIController.#orderHideUserInputElement();
			DOMHelper.focusElement(TCUIController.#inputElem);
			DOMHelper.orderScrollToBottom();
		}
		static #hideUserInputElement() {
			if (TCUIController.#inputElemValue.length > 0
				|| TCUIController.#inputElem.classList.contains('user-input-hidden')) {
				return;
			}
			TCUIController.#inputElem.classList.add('user-input-hidden');
			DOMHelper.orderScrollToBottom();
			DOMHelper.focusElement(document.body);
		}
		static #orderHideUserInputElement() {
			setTimeout(TCUIController.#hideUserInputElement, 9369);
		}

		static #handleInputKey(key) {
			if (!TCUIController.#inputElem) { return; }
			const rawContent = TCUIController.#inputElemValue;
			if (key === 'ArrowUp') {
				TCUIController.#inputElemValue = Chronicler.prevScroll;
			}
			else if (key === 'ArrowDown') {
				TCUIController.#inputElemValue = Chronicler.nextScroll;
			}
			else if (key === '>'
				&& rawContent === TextHelper.scriptBlockPrefix) {
					TCUIController.#inputElemValue = `${rawContent}\n`;
			}
			else if (key === 'Backspace'
				&& rawContent === TextHelper.scriptBlockPrefix) {
					TCUIController.#inputElemValue = "";
			}
			else if(key === 'Enter') {
				let canSubmit = true;
				let content = TextHelper.clean(rawContent);
				if (TextHelper.isScript(rawContent)) {
					canSubmit = TextHelper.isSubmittableScript(rawContent);
					if (!canSubmit) {
						TCUIController.#inputElemValue = TextHelper.cleanScript(rawContent);
					}
				}
				else {
					canSubmit = TextHelper.isSubmittable(content);
					if (!canSubmit) {
						TCUIController.#inputElemValue = content;
					}
				}
				if (canSubmit) {
					TCUIController.#inputElemValue = "";
					Chronicler.inscribe(content);
					TCUIController.#userInputSubmitFn(content);
				}
			}

			TCUIController.#adjustUserInputElementClass();
			TCUIController.#adjustUserInputElementHeight();
			if (TCUIController.#inputElemValue.length === 0) {
				TCUIController.#orderHideUserInputElement();
			}
		}

		static #adjustUserInputElementHeight() {
			if (!TCUIController.#inputElem) { return; }
			let height = TextHelper.parseNumTxtPair(
				DOMHelper.getElementCssValue(TCUIController.#inputElem, 'height'));
			let fontSize = TextHelper.parseNumTxtPair(
				DOMHelper.getElementCssValue(TCUIController.#inputElem, 'font-size'));
			if (!height || !fontSize) { return; }
			let linesCount = TextHelper.countLines(TCUIController.#inputElemValue);
			let newHeight = linesCount * fontSize.num * 1.44;
			let newHeightStr = `${newHeight}${fontSize.txt}`;
			TCUIController.#inputElem.style.height = newHeightStr;
		}
		static #adjustUserInputElementClass() {
			if (!TCUIController.#inputElem) { return; }
			let valueIsScript = TextHelper.isScript(TCUIController.#inputElemValue);
			if ((!valueIsScript
					&& TCUIController.#inputElem.classList.contains('user-input-text')
					&& !TCUIController.#inputElem.classList.contains('user-input-script'))
				|| (valueIsScript
					&& TCUIController.#inputElem.classList.contains('user-input-script')
					&& !TCUIController.#inputElem.classList.contains('user-input-text'))) {
				return;
			}
			TCUIController.#inputElem.classList.toggle('user-input-text');
			TCUIController.#inputElem.classList.toggle('user-input-script');
			DOMHelper.orderScrollToBottom();
		}
	}

	class TestingConsole {
		static #initiated = false;
		static #loadedScripts = [];
		static #loadedStylesheets = [];

		static init() {
			if (TestingConsole.#initiated) { return; }
			console.log("TestingConsole init...");
			TestingConsole.#loadedScripts = [];
			TestingConsole.#loadedStylesheets = [];
			StdConsole.init();
			TCUIController.init(TestingConsole.submit);
			Printer.init(TCUIController.contentElement, true);
			console.log("Init complete!");
			TestingConsole.#initiated = true;
		}

		static clear() {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			Printer.clear();
			StdConsole.clear();
		}
		static log(message, options = undefined) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			Printer.enqueue(message, 'log', options);
			StdConsole.log(message);
		}
		static info(message, options = undefined) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			Printer.enqueue(message, 'info', options);
			StdConsole.info(message);
		}
		static warn(message, options = undefined) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			Printer.enqueue(message, 'warn', options);
			StdConsole.warn(message);
		}
		static error(message, options = undefined) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			Printer.enqueue(message, 'error', options);
			StdConsole.error(message);
		}
		static submitText(message) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			Printer.enqueue(message, 'text');
			StdConsole.log(message);
		}
		static submitScript(message) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			Printer.enqueue(message, 'script');
			StdConsole.log(message);
		}
		static submitScriptEval(message) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			try {
				let evaluated = eval(message);
				if (!evaluated) { return; }
				Printer.enqueue(evaluated, 'script-eval');
				StdConsole.log(evaluated);
			} catch (e) {
				Printer.enqueue(e.message, 'error');
			}
		}
		static submit(message) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			if (!TextHelper.isScript(message)) {
				TestingConsole.submitText(message);
				return;
			}
			let scriptBody = TextHelper.getScriptBody(message);
			if (scriptBody.length === 0) { return; }
			TestingConsole.submitScript(scriptBody);
			TestingConsole.submitScriptEval(scriptBody);
		}

		static loadScript(url, callback) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			TestingConsole.#loadScriptFile(url, 'text/javascript', callback);
		}
		static reloadScript(index) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			let scripts = TestingConsole.#loadedScripts.filter(s => s.type !== 'module');
			if (index <= 0 || index > scripts.length) {
				return 'Script index is out of range!';
			}
			let script = scripts[index - 1];
			return TestingConsole.loadScript(script.src);
		}
		static listScripts() {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			let scripts = TestingConsole.#loadedScripts.filter(s => s.type !== 'module').map(m => m.src);
			let retval = `Loaded scripts (${scripts.length}):`;
			for (let i = 0; i < scripts.length; i++) {
				retval += `\n${i+1}. ${scripts[i]}`;
			}
			return retval;
		}
		static loadModule(url, callback) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			TestingConsole.#loadScriptFile(url, 'module', callback);
		}
		static reloadModule(index) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			let modules = TestingConsole.#loadedScripts.filter(s => s.type === 'module');
			if (index <= 0 || index > modules.length) {
				return 'Module index is out of range!';
			}
			let mod = modules[index - 1];
			return TestingConsole.loadModule(mod.src);
		}
		static listModules() {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			let modules = TestingConsole.#loadedScripts.filter(s => s.type === 'module').map(m => m.src);
			let retval = `Loaded modules (${modules.length}):`;
			for (let i = 0; i < modules.length; i++) {
				retval += `\n${i+1}. ${modules[i]}`;
			}
			return retval;
		}
		static loadStylesheet(url) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			TestingConsole.#loadStylesheetFile(url);
		}
		static reloadStylesheet(index) {
			if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
			let sheets = TestingConsole.#loadedStylesheets;
			if (index <= 0 || index > sheets.length) {
				return 'Stylesheet index is out of range!';
			}
			let sheet = sheets[index - 1];
			return TestingConsole.loadStylesheet(sheet.href);
		}
		static listStylesheets() {
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
	}


	TestingConsole.init();

	console.help = function () {
		return help();
	}
	console.init = function () {
		TestingConsole.init();
	}
  console.clear = function () {
  	TestingConsole.clear();
  }
  console.log = function (message, options = undefined) {
		TestingConsole.log(message, options);
  }
  console.info = function (message, options = undefined) {
		TestingConsole.info(message, options);
  }
  console.warn = function (message, options = undefined) {
		TestingConsole.warn(message, options);
  }
  console.error = function (message, options = undefined) {
		TestingConsole.error(message, options);
  }
	console.useTimeouts = function () {
		Printer.useTimeouts();
		console.log("Printing with timeouts.")
	}
	console.useAnimations = function () {
		Printer.useAnimations();
		console.log("Printing with animations.")
	}

  loadScript = function (url, callback) {
  	TestingConsole.loadScript(url, callback);
  }
  reloadScript = function (index) {
  	return TestingConsole.reloadScript(index);
  }
	listScripts = function () {
		return TestingConsole.listScripts();
	}
  loadModule = function (url, callback) {
  	TestingConsole.loadModule(url, callback);
  }
	reloadModule = function (index) {
		return TestingConsole.reloadModule(index);
	}
	listModules = function () {
		return TestingConsole.listModules();
	}
  loadStylesheet = function (url) {
  	TestingConsole.loadStylesheet(url);
  }
  reloadStylesheet = function (index) {
  	return TestingConsole.reloadStylesheet(index);
  }
	listStylesheets = function () {
		return TestingConsole.listModules();
	}

	help = function () {
		const availableFunctions = [];
		availableFunctions.push('help()');
		availableFunctions.push('console.init()');
		availableFunctions.push('console.clear()');
		availableFunctions.push('console.log(msg, opts?)');
		availableFunctions.push('console.info(msg, opts?)');
		availableFunctions.push('console.warn(msg, opts?)');
		availableFunctions.push('console.error(msg, opts?)');
		availableFunctions.push('console.useTimeouts()');
		availableFunctions.push('console.useAnimations()');
		availableFunctions.push('loadScript(url)');
		availableFunctions.push('listScripts()');
		availableFunctions.push('reloadScript(index)');
		availableFunctions.push('loadModule(url)');
		availableFunctions.push('listModules()');
		availableFunctions.push('reloadModule(index)');
		availableFunctions.push('loadStylesheet(url)');
		availableFunctions.push('listStylesheets()');
		availableFunctions.push('reloadStylesheet(index)');
		return `Available functions:\n${availableFunctions.join("\n")}`;
	}
})();
