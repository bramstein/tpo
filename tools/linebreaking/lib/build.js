var parse = require('./parse');

function toChar(i) {
    return '\\u' + (i + 0x10000).toString(16).substr(-4).toUpperCase();
}

function build(lineBreaksFilename, includeBlocksFilename, ignoreClassesFilename) {
    parse(lineBreaksFilename, function (err, data) {
        var classes = {},
            result = {},
            tokenizer = {};

        // Filter out any control codes
        data = data.filter(function (item) {
            if (Array.isArray(item.value)) {
                return parseInt(item.value[0], 16) >= 32 && parseInt(item.value[1], 16) >= 32;
            } else {
                return parseInt(item.value, 16) >= 32;
            }
        });

        parse(includeBlocksFilename, function (err, blocks) {
            // Filter out unicode blocks we are not interested in
            data = data.filter(function (item) {
                return blocks.some(function (block) {
                    var start = parseInt(block.value[0], 16),
                        end = parseInt(block.value[1], 16);

                    if (Array.isArray(item.value)) {
                        return parseInt(item.value[0], 16) <= end && parseInt(item.value[1], 16) >= start;
                    } else {
                        return parseInt(item.value, 16) >= start && parseInt(item.value, 16) <= end;
                    }
                });
            });

            parse(ignoreClassesFilename, function (err, ignores) {
                ignores = ignores.map(function (ignore) {
                    return ignore.value;
                });

                // Filter out classes we like to ignore
                data = data.filter(function (item) {
                    return ignores.indexOf(item.type) === -1;
                });

                data.forEach(function (item) {
                    var i = null,
                        len = null;
                    if (!classes[item.type]) {
                        classes[item.type] = [];
                    }

                    if (Array.isArray(item.value)) {
                        i = parseInt(item.value[0], 16);
                        len = parseInt(item.value[1], 16);

                        for (; i <= len; i += 1) {
                            classes[item.type].push(parseInt(i, 10));
                        }
                    } else {
                        classes[item.type].push(parseInt(item.value, 16));
                    }

                    classes[item.type].sort(function (a, b) {
                        return a - b;
                    });
                });

                var AL = [];

                Object.keys(classes).forEach(function (c) {
                    AL = AL.concat(classes[c]);
                });

                AL.sort(function (a, b) {
                    return a - b;
                });

                classes['AL'] = AL;

                Object.keys(classes).forEach(function (c) {
                    result[c] = [];

                    classes[c].forEach(function (current, index) {
                        var previous = null,
                            next = null;

                        if (index > 0) {
                            previous = classes[c][index - 1];
                        } else {
                            previous = null;
                        }

                        if (index < classes[c].length - 1) {
                            next = classes[c][index + 1];
                        } else {
                            next = null;
                        }

                        if ((current - 1 !== previous || previous === null) && (current + 1 !== next || next === null)) {
                            result[c].push(toChar(current));
                        } else if ((current - 1 !== previous || previous === null) && (current + 1 === next || next === null)) {
                            result[c].push(toChar(current));
                        } else if ((current - 1 === previous || previous === null) && (current + 1 !== next || next === null)) {
                            result[c][result[c].length - 1] += '-' + toChar(current);
                        }
                    });

                    result[c] = result[c].join('');
                });

                Object.keys(result).forEach(function(c) {
                    var regex = '^';
                    if (c === 'AL') {
                        regex += '[^' + result[c] + ']+';
                    } else if (c === 'NU') {
                        regex += '[' + result[c] + ']+';
                    } else {
                        regex += '[' + result[c] + ']';
                    }

                    result[c] = new RegExp(regex);
                });

                console.log('// This file is auto-generated, do not modify.');
                console.log("goog.provide('tpo.text.XX');");
                console.log('');
                console.log('tpo.text.linebreak = {');
                console.log(Object.keys(result).map(function (c) {
                    return '\t' + c + ': ' + result[c];
                }).join(',\n'));
                console.log('};');
    /*
                text = text.replace(/\n/g, '');

                while (text) {
                    Object.keys(result).forEach(function (c) {
                        var m = result[c].exec(text);

                        if (m) {
                            //console.log('token: %s, value: %s', c, m[0]);
                            text = text.substring(m[0].length);
                        }
                    });
                }
    */
            });
        });
    });
}

module.exports = build;
