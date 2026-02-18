# 🛠 TestingConsole

**TestingConsole** is a lightweight, browser-based **JavaScript developer console** for testing libraries, snippets, and modules interactively — all fully stylable and modular.

---

## ✨ Features

* 🖥 **On-page console output**: Nicely formats strings, numbers, objects, arrays, symbols, and functions.
* 🟢 **Console API override**: `console.log`, `console.info`, `console.warn`, `console.error` routed through TestingConsole.
* ⚡ **Dynamic script evaluation**: Run code blocks prefixed with `=>`.
* 📦 **Module & script loader**: Load and reload JS scripts/modules on the fly.
* 🎨 **Custom styling per log**: Pass a `Map` with style overrides to `log`, `warn`, `info`, `error`.
* ⏱ **Async printing**: Supports `setTimeout` or `requestAnimationFrame`.
* ⬆️ **Input history navigation**: Arrow keys cycle through previous submissions.

---

## 💻 Quick Start

### Include in HTML

* **As a regular script**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TestingConsole Example</title>
</head>
  <body>
    <script src='https://boughpohpue.github.io/testing_console.js/compiled/console.js'></script>
	<script>console.loadModule('test.js');</script>
  </body>
</html>
```

* **As a script module**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TestingConsole Example</title>
</head>
  <body>
    <script type="module">
      import 'https://boughpohpue.github.io/testing_console.js/content/console.js';
      console.loadModule('test.js');
    </script>
  </body>
</html>
```

---

## 📝 Logging Examples

```js
console.log("Hello world", { key: "value" }, [1,2,3]);
console.info("Info message");
console.warn("Warning!");
console.error("Error message");
```

✅ Supports formatting:
```js
console.log("Hello %s, your score is %d", "Alice", 42);
```

---

## 🛠️ Custom options:

Methods log, info, warn and error might be slightly personalized.
In that case provide custom configuration as a last argument (it must be a Map).

*  **Custom styling**:
```js
console.warn("Styled warning", new Map([["style", "color: antiquewhite; text-shadow: 3px 3px #708090;"]]));
```

*  **Preserve line breaking**:
```js
console.log(someObject, new Map([["breaklines", true]]));
```

---

## 🖥️ Live Command Execution

You can also run commands directly from the browser window after the page has loaded. 
Press Enter to reveal the input area, then type any JavaScript command and submit it. 
This includes all console.* methods, as well as quick expressions.

---

## ⚡ Script Evaluation

Prefix your submission with `=>` to evaluate it in the console:

```js
=> 2 + 2
=> console.log("Dynamic test")
```

---

## 📦 Module & Script Management

```js
console.loadScript('some_script.js');
console.reloadScript(1);
console.listScripts();

console.loadModule('some_module.js');
console.reloadModule(1);
console.listModules();
```

---

## ✨ Other Useful Methods

```js
console.help();                    // Show all available console methods
console.clear();                   // Clear console output
console.printUsingTimeouts();      // Use setTimeout for printing
console.printUsingAnimations();    // Use requestAnimationFrame
console.enableStdConsole();        // Enable showing output also on standard js console
console.disableStdConsole();       // Disable standard js console
```

---

## 🎨 Styling

Default classes:

```css
.log { color: lime; }
.info { color: gainsboro; }
.warn { color: yellow; }
.error {
  color: red;
  text-decoration: underline;
}
```

Override styles dynamically per log with a config `Map`:

```js
console.log("Custom style", new Map([["style", "color: gold; font-weight: bold;"]]));
```

---

## ⚙️ Notes

* Works in modern browsers supporting ES modules.
* Designed for **dev/test environments**, not production logging.
* Input supports multi-line scripts and preserves history.

---

## 📝 License

MIT License — free to use, modify, and share.

---

## 🔬 Examples

Check links below and see **TestingConsole** examples in action:

*  **Potions Brewery**:  https://boughpohpue.github.io/brewery/test_compiled/test.html
*  **JFATHER**:          https://boughpohpue.github.io/jfather.js/tests/compiled/test.html
*  **Just Reflector**:   https://boughpohpue.github.io/just.js/tests/compiled/reflector_test.html

---
