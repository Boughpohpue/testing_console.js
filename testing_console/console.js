(function () {
    var logger = document.getElementById('log');
    var oldLog = console.log;
    var oldInfo = console.info;
    var oldWarn = console.warn;
    var oldError = console.error;
    var oldClear = console.clear;
    console.clear = function () {
        logger.innerHTML = '';
    }
    console.log = function (message) {
        consolePrint(message, 'log');
    }
    console.info = function (message) {
        consolePrint(message, 'info');
    }
    console.warn = function (message) {
        consolePrint(message, 'warn');
    }
    console.error = function (message) {
        consolePrint(message, 'error');
    }
    consolePrint = function (message, logType) {
        let msg = typeof message == 'object' && JSON && JSON.stringify
          ? JSON.stringify(message, null, 3) :
          message;
        logger.innerHTML += `<span class='${logType}'>${msg}</span><br />`;
    }
    loadScriptFile = function (url, type, callback) {
        var head = document.head;
        var script = document.createElement('script');
        script.type = type;
        script.src = url;
        // Bind the event to the callback function.
        script.onreadystatechange = callback;
        script.onload = callback;
        // Fire script loading
        head.appendChild(script);
    }
    loadScript = function (url, callback) {
        loadScriptFile(url, 'text/javascript', callback);
    }
    loadModule = function (url, callback) {
        loadScriptFile(url, 'module', callback);
    }
})();
