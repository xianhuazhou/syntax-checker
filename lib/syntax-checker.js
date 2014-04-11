var fs = require('fs'),
path = require('path'),
os = require('os'),
exec = require('child_process').exec,

args = process.argv.splice(2),

TIMEOUT = {
    start: 40,
    current: 40,
    step: 40,
    max: 1000,
    per_file: 20
},
ENCODING = 'utf8';
VERSION = '0.0.2';

var checkers = {
    'php': 'php -l',
    'rb': 'ruby -c',
    'py': 'python -m py_compile',
    'pl': 'perl -c',
    'lua': 'luac -p',
    'sh': 'bash -n',
    'c': 'gcc -fsyntax-only',
    'cpp': 'gcc -fsyntax-only',
    'js': 'uglifyjs -o /dev/null'
};

function exit() {
    process.exit(0);
}

console.log("Syntax checker version: v" + VERSION);

switch(args[0]) {
    case '-v':
    case '--version':
    exit();
    break;

    case '-h':
    case '--help':
    console.log("Usage: syntax-checker [path] [--output|-o=/path/to/log-file]");
    console.log("Example: ");
    console.log("       syntax-checker");
    console.log("       syntax-checker ./");
    console.log("       syntax-checker /var/www/website /tmp/check.txt");
    exit();
    break;
}

(function checkSyntax(dir, output) {
    if (/\/$/.test(dir)) {
        dir = dir.substr(0, dir.length - 1);
    }

    var outputFile = null;
    if (output && output.indexOf('=') !== -1) {
        outputs = output.split('=');
        if (outputs[0] == '-o' || outputs[0] == '--output') {
            outputFile = outputs[1];
        }
    }

    var $log = function(msg) {
        if (outputFile) {
            fs.appendFileSync(outputFile, msg + os.EOL, ENCODING);
        } else {
            console.error(msg);
        }
    }

    if (outputFile) {
        console.log("Checking results will be append into the file: " + outputFile);
    }

    fs.stat(dir, function(err, stats) {
        if (err) {
            $log("Can not open the '" + dir + "' directory: " + err);
            return;
        }
        if (!stats.isDirectory()) {
            $log("'" + dir + "' is not a directory.");
            return;
        }

        fs.readdir(dir, function(err, files) {
            if (err) {
                $log("Error: " + err);
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
                                            if (error || stderr) {
                                                $log(filePath + ": " + error + stderr + stdout);
                                            }
                                        });
                                    } catch (e) {
                                        $log(filePath + ": " + e);
                                    }
                                }, TIMEOUT.per_file);
                            })(fileType, filePath);
                        }
                    });
                })(filePath);
            });
        });

    });
})(args[0] || './', args[1]);
