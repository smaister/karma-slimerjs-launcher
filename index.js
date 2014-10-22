var SlimerJSBrowser,
    fs = require('fs');

SlimerJSBrowser = function(id, baseBrowserDecorator, logger, args, config) {
    var options = args && args.options || config && config.options || {},
        log = logger.create('launcher');

    baseBrowserDecorator(this);

    this._getOptions = function(url) {
        var optionsCode, captureCode,
            self = this,
            captureFile = self._tempDir + '/capture.js';

        // create the js file, that will open karma
        optionsCode = Object.keys(options).map(function (key) {
            return 'page.' + key + ' = ' + JSON.stringify(options[key]) + ';';
        });

        captureCode = 'var page = require("webpage").create();\n'
            + optionsCode.join('\n')
            + '\npage.onConsoleMessage = function () {'
            + '\n	console.log.apply(console,'
            + '\n		Array.prototype.slice.call(arguments,0).forEach(function(item) {'
            + '\n			return JSON.stringify(item);'
            + '\n		})'
            + '\n	);'
            +' \n};'
            + '\npage.onCallback = function(arg) {'
            + '\n    return arg === "getCompletionFunc" && slimer.exit;'
            + '\n};'
            + '\npage.open("' + url + '");\n';

        log.debug(captureCode);

        fs.writeFileSync(captureFile, captureCode);

        // and start slimerjs
        return [log.level.levelStr=='DEBUG' ? '--debug=true':'', captureFile];
    };
};

SlimerJSBrowser.prototype = {
    name: 'SlimerJS',

    DEFAULT_CMD: {
        linux: 'xvfb-slimerjs',
        darwin: '/Applications/SlimerJS.app/Contents/MacOS/SlimerJS-bin',
        win32: process.env.ProgramFiles + '\\Mozilla SlimerJS\\SlimerJS.exe'
    },
    ENV_CMD: 'SLIMERJSLAUNCHER'
};

SlimerJSBrowser.$inject = ['id', 'baseBrowserDecorator', 'logger', 'args', 'config.slimerjsLauncher'];

// PUBLISH DI MODULE
module.exports = {'launcher:SlimerJS': ['type', SlimerJSBrowser]};
