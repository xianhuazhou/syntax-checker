var fs = require('fs'),
path = require('path'),
exec = require('child_process').exec,

args = process.argv.splice(2),

TIMEOUT = {
    start: 40,
    current: 40,
    step: 40,
    max: 1000,
    per_file: 20
},
SLEEP_PER_FILE = 200,
VERSION = '0.0.1';

var checkers = {
    'php': 'php -l',
    'rb': 'ruby -c',
    'py': 'python -m py_compile',
    'pl': 'perl',
    'lua': 'luac -p'
};

console.log("Syntax checker version: v" + VERSION);

(function checkSyntax(dir) {
    if (/\/$/.test(dir)) {
        dir = dir.substr(0, dir.length - 1);
    }

    fs.stat(dir, function(err, stats) {
        if (err) {
            console.error("Can not open the '" + dir + "' directory: " + err);
            return;
        }
        if (!stats.isDirectory()) {
            console.error("'" + dir + "' is not a directory.");
            return;
        }

        fs.readdir(dir, function(err, files) {
            if (err) {
                console.error("Error: " + err);
                return;
            }

            files.forEach(function(file) {
                filePath = dir + path.sep + file;
                (function(filePath) {
                    fs.stat(filePath, function(err, stats) {
                        if (stats.isDirectory()) {
                            TIMEOUT.current += TIMEOUT.step;
                            if (TIMEOUT.current >= TIMEOUT.max) {
                                TIMEOUT.current = TIMEOUT.start;
                            }
                            (function(filePath) {
                                setTimeout(function() {
                                    checkSyntax(filePath);
                                }, TIMEOUT.current);
                            })(filePath);
                            return;
                        };

                        fileType = path.extname(filePath).substr(1);
                        if (checkers[fileType]) {
                            (function(fileType, filePath) {
                                setTimeout(function() {
                                    try {
                                        exec(checkers[fileType] + " " + filePath, function(error, stdout, stderr) {
                                            if (stderr) {
                                                console.error(filePath + ": " + error);
                                            }
                                        });
                                    } catch (e) {
                                        console.log(filePath + ": " + e);
                                    }
                                }, TIMEOUT.per_file);
                            })(fileType, filePath);
                        }
                    });
                })(filePath);
            });
        });

    });
})(args[0]);
