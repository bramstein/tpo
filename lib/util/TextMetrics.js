goog.provide('tpo.util.TextMetrics');

goog.require('tpo.text.languages.en_us');

tpo.util.TextMetrics = function() {
    var container = window.document.getElementById('tpo-characters'),
        root = window.document.getElementById('tpo-content'),
        textNodes = root.querySelectorAll('.text'),
        cache = {};

    var language = tpo.text.languages.en_us,
        tokens = language.tokens,
        tokenKeys = Object.keys(tokens);

    function lookup(style, word) {
        var single = style.single,
            pair = style.pair;

        if (cache[word]) {
            return cache[word];
        }

        var width = 0,
            len = word.length;

        if (len === 1) {
            width = single[word];
        } else if (len === 2) {
            width = pair[word];
        } else if (len === 3) {
            width = pair[word[0] + word[1]] - single[word[1]] +
                    pair[word[1] + word[2]] - single[word[2]] +
                    single[word[2]];
        } else if (len === 4) {
            width = pair[word[0] + word[1]] - single[word[1]] +
                    pair[word[1] + word[2]] - single[word[2]] +
                    pair[word[2] + word[3]] - single[word[3]] +
                    single[word[3]];
        } else if (len === 5) {
            width = pair[word[0] + word[1]] - single[word[1]] +
                    pair[word[1] + word[2]] - single[word[2]] +
                    pair[word[2] + word[3]] - single[word[3]] +
                    pair[word[3] + word[4]] - single[word[4]] +
                    single[word[4]];
        } else if (len === 6) {
            width = pair[word[0] + word[1]] - single[word[1]] +
                    pair[word[1] + word[2]] - single[word[2]] +
                    pair[word[2] + word[3]] - single[word[3]] +
                    pair[word[3] + word[4]] - single[word[4]] +
                    pair[word[4] + word[5]] - single[word[5]] +
                    single[word[5]];
        } else {
            for (var i = 0; i < len; i += 1) {
                if (i === len - 1) {
                    width += single[word[i]];
                } else {
                    width += pair[word[i] + word[i + 1]] - single[word[i + 1]];
                }
            }
        }

        cache[word] = width;

        return width;
    }


    var texts = [],
        nodes = container.childNodes,
        styles = {};

    for (var i = 0; i < nodes.length; i += 1) {
        var style = nodes[i].style.cssText;

        styles[style] = {
            single: {},
            pair: {}
        };

        var chars = nodes[i].childNodes;

        for (var j = 0; j < chars.length; j += 1) {
            var text = chars[j].textContent;

            if (text.length === 1) {
                styles[style].single[text] = chars[j].clientWidth;
            } else {
                styles[style].pair[text] = chars[j].clientWidth;
            }
        }
    }

    var result = [],
        dimensions = [];


    for (var i = 0; i < textNodes.length; i += 1) {
        var str = textNodes[i].textContent;

        while (str) {
            for (var j = 0; j < tokenKeys.length; j += 1) {
                var m = tokens[tokenKeys[j]].exec(str);

                if (m) {
                    result.push(m[0]);
                    str = str.substring(m[0].length);
                }
            }
        }
    }


    var style = styles[Object.keys(styles)[2]];

    for (var i = 0; i < result.length; i += 1) {
        if (result[i] === ' ') {
            dimensions.push(lookup(style, '\u00A0'));
        } else {
            dimensions.push(lookup(style, result[i]));
        }
    }
};
