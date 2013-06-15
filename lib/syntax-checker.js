var fs = require('fs'),
path = require('path'),
exec = require('child_process').exec,

args = process.argv.splice(2),

SLEEP_PER_DIRECTORY = 350,
SLEEP_PER_FILE = 20,
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
                            (function(filePath) {
                                setTimeout(function() {
                                    checkSyntax(filePath);
                                }, SLEEP_PER_DIRECTORY);
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
                                }, SLEEP_PER_FILE);
                            })(fileType, filePath);
                        }
                    });
                })(filePath);
            });
        });

    });
})(args[0]);
