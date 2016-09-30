if (typeof modules == 'undefined' && typeof require == 'function') {
    var modules = require('ym');
}

/**
 * @fileOverview
 * Парсер шаблонов.
 * Количество зависимостей было сведено к минимуму из-за того, что
 * тот класс используется в сборщике.
 */
modules.define("template.Parser", [
    "util.id"
], function (provide, utilId) {

    // TODO хорошо бы перенести в отдельный модуль. 
    // Главное не забыть в билдере подключить файл.
    var trimRegExp = /^\s+|\s+$/g,
        nativeTrim = typeof String.prototype.trim == 'function';

    function trim (str) {
        return nativeTrim ? str.trim() : str.replace(trimRegExp, '');
    }

    function escape (str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;');
    }

    function getKeyValuePairs (str) {
        var pairs = [],
            parts = trim(str).replace(/\s*=\s*/g, '=').replace(/\s+/g, ' ').split(' ');

        for (var i = 0, l = parts.length; i < l; i++) {
            pairs.push(parts[i].split('=', 2));
        }

        return pairs;
    }

    function removeQuotes (string) {
        var firstSymbol = trim(string).charAt(0);
        if (firstSymbol == "'" || firstSymbol == '"') {
            return string.slice(1, string.length - 1);
        }
        return string;
    }

    function parseExpression (expression) {
        var parenthesesRegExp = /'|"/g,
            l = 0,
            tokens = [],
            match;

        while (match = parenthesesRegExp.exec(expression)) {
            var pos = match.index;

            if (pos >= l) {
                var endPos = expression.indexOf(match[0], pos + 1);
                if (l != pos) {
                    parseExpressionSubstitutes(tokens, expression.slice(l, pos));
                }
                tokens.push(expression.slice(pos, endPos + 1));
                l = endPos + 1;
            }
        }

        if (l < expression.length) {
            parseExpressionSubstitutes(tokens, expression.slice(l));
        }

        return tokens.join('');
    }

    var DataLogger = function (dataManager) {
        this._dataManager = dataManager;
        this._renderedValues = {};
        this._contexts = {};
    };

    DataLogger.prototype.get = function (key) {
        if (this._renderedValues.hasOwnProperty(key)) {
            return this._renderedValues[key].value;
        }

        var dotIndex = key.indexOf('.'),
            keyPart = (dotIndex > -1) ? trim(key.substring(0, dotIndex)) : trim(key);
        if (this._contexts.hasOwnProperty(keyPart)) {
            key = key.replace(keyPart, this._contexts[keyPart]);
        }

        var value = this._dataManager.get(key);
        this.set(key, value);
        return value;
    };

    DataLogger.prototype.setContext = function (key1, key2) {
        this._contexts[key1] = key2;
    };

    DataLogger.prototype.set = function (key, value) {
        // http://jsperf.com/split-vs-indexof
        if (key.indexOf('.') > -1) {
            var parts = key.split('.'),
                currentKey = "";
            // Записываем все промежуточные значения. 
            for (var i = 0, l = parts.length - 1; i < l; i++) {
                currentKey += ((i === 0) ? "" : ".") + parts[i];
                this._renderedValues[currentKey] = { value: this._dataManager.get(currentKey) };
            }
        }
        this._renderedValues[key] = { value: value };
    };

    DataLogger.prototype.getRenderedValues = function () {
        return this._renderedValues;
    };

    var stopWords = {
        'true': true,
        'false': true,
        'undefined': true,
        'null': true,
        'typeof': true
    };

    function parseExpressionSubstitutes (tokens, expression) {
        var variablesRegExp = /(^|[^\w\$])([A-Za-z_\$][\w\$\.]*)(?:[^\w\d_\$]|$)/g,
            l = 0,
            match;

        while (match = variablesRegExp.exec(expression)) {
            var pos = match.index + match[1].length,
                key = match[2],
                endPos = pos + key.length;

            if (pos > l) {
                tokens.push(expression.slice(l, pos));
            }

            if (stopWords[key]) {
                tokens.push(key);
            } else {
                tokens.push('data.get("' + key + '")');
            }

            l = endPos;
        }

        if (l < expression.length) {
            tokens.push(expression.slice(l));
        }
    }

    function evaluateExpression (expression, data) {
        var result;
        eval('result = ' + expression);
        return result;
    }

    // Токен контента
    var CONTENT = 0,
        startTokenRegExp = new RegExp([
            '\\$\\[\\[', '\\$\\[(?!\\])', '\\[if',
            '\\[else\\]', '\\[endif\\]', '\\{\\{', '\\{%'].join('|'), 'g');

    /**
     * @ignore
     * @class Парсер шаблонов.
     */
    var Parser = function () { };

    /**
     * @ignore
     * @class Парсер шаблонов.
     */

    Parser.prototype.scanners = {};
    Parser.prototype.builders = {};

    Parser.prototype.parse = function (text) {
        var tokens = [],
            pos = 0, startTokenPos, endTokenPos, contentPos,
            match;

        startTokenRegExp.lastIndex = 0;

        while (match = startTokenRegExp.exec(text)) {
            if (match.index >= pos) {
                startTokenPos = match.index;
                contentPos = startTokenPos + match[0].length;

                if (pos != startTokenPos) {
                    tokens.push(CONTENT, text.slice(pos, startTokenPos));
                }

                var scanner = this.scanners[match[0]];

                if (scanner.token) {
                    tokens.push(scanner.token, null);
                    pos = contentPos;
                } else {
                    endTokenPos = text.indexOf(scanner.stopToken, contentPos);
                    scanner.scan(tokens, text.slice(contentPos, endTokenPos));
                    pos = endTokenPos + scanner.stopToken.length;
                }
            }
        }

        if (pos < text.length) {
            tokens.push(CONTENT, text.slice(pos));
        }

        return tokens;
    };

    Parser.prototype.build = function (tree, data) {
        var result = {
            nodes: tree,
            left: 0,
            right: tree.length,
            empty: true,
            subnodes: [],
            sublayouts: [],
            strings: [],
            data: new DataLogger(data)
        };
        this._buildTree(result);
        result.renderedValues = result.data.getRenderedValues();
        return result;
    };

    Parser.prototype._buildTree = function (tree) {
        var nodes = tree.nodes,
            strings = tree.strings;
        while (tree.left < tree.right) {
            var node = nodes[tree.left];
            if (node == CONTENT) {
                strings.push(nodes[tree.left + 1]);
                tree.empty = false;
                tree.left += 2;
            } else {
                this.builders[node](tree, this);
            }
        }
    };

    // Токены старого синтаксиса
    var OLD_SUBSTITUTE = 1001,
        OLD_SUBLAYOUT = 1002,
        OLD_IF = 1003,
        OLD_ELSE = 1004,
        OLD_ENDIF = 1005;

    Parser.prototype.scanners['$[['] = {
        stopToken: ']]',
        scan: function (tokens, text) {
            var parts = text.match(/^(\S+)\s*(\S.*)?$/);
            tokens.push(OLD_SUBLAYOUT, [parts[1], parts[2] ? getKeyValuePairs(parts[2]) : []]);
        }
    };

    Parser.prototype.scanners['$['] = {
        stopToken: ']',
        scan: function (tokens, text) {
            var parts = text.split('|', 2);
            tokens.push(OLD_SUBSTITUTE, parts);
        }
    };

    Parser.prototype.scanners['[if'] = {
        stopToken: ']',
        scan: function (tokens, text) {
            var parts = text.match(/^(def)? (.+)$/),
                substitutes = parseExpression(parts[2]);

            tokens.push(OLD_IF, [parts[1], substitutes]);
        }
    };

    Parser.prototype.scanners['[else]'] = {
        token: OLD_ELSE
    };

    Parser.prototype.scanners['[endif]'] = {
        token: OLD_ENDIF
    };

    Parser.prototype.builders[OLD_SUBSTITUTE] = function (tree, parser) {
        var key = tree.nodes[tree.left + 1][0],
            value = tree.data.get(key);

        if (typeof value == 'undefined') {
            value = tree.nodes[tree.left + 1][1];
        }

        tree.strings.push(value);
        tree.left += 2;
        tree.empty = tree.empty && !value;
    };

    Parser.prototype.builders[OLD_SUBLAYOUT] = function (tree, parser) {
        var id = utilId.prefix() + utilId.gen(),
            key = tree.nodes[tree.left + 1][0];

        tree.strings.push('<ymaps id="' + id + '"></ymaps>');

        var sublayoutInfo = {
                id: id,
                key: key,
                value: tree.data.get(key) || key
            },
            monitorValues = [],
            splitDefault = [];

        var params = tree.nodes[tree.left + 1][1];

        for (var i = 0, l = params.length; i < l; i++) {
            var pair = params[i],
                k = pair[0],
                v = pair[1] || "true",
                end = v.length - 1,
                val;

            // если значение в кавычках, парсим как строку
            if (
                (v.charAt(0) == '"' && v.charAt(end) == '"') ||
                (v.charAt(0) == '\'' && v.charAt(end) == '\'')
                ) {
                val = v.substring(1, end);

                // если цифра или true|false - как есть
            } else if (!isNaN(Number(v))) {
                val = v;

            } else if (v == "true") {
                val = true;

            } else if (v == "false") {
                val = false;

                // иначе - ищем в данных
            } else {
                splitDefault = v.split('|');
                val = tree.data.get(splitDefault[0], splitDefault[1]);
                monitorValues.push(splitDefault[0]);
            }

            sublayoutInfo[k] = val;
        }

        sublayoutInfo.monitorValues = monitorValues;

        tree.sublayouts.push(sublayoutInfo);
        tree.left += 2;
    };

    Parser.prototype.builders[OLD_IF] = function (tree, parser) {
        var nodes = tree.nodes,
            left = tree.left,
            ifdef = nodes[left + 1][0],
            expression = nodes[left + 1][1],
            result = evaluateExpression(expression, tree.data),
            isTrue = ifdef ? typeof result != "undefined" : !!result,
            l,
            i = tree.left + 2,
            r = tree.right,
            counter = 1,
            elsePosition,
            endIfPosition;

        while (i < r) {
            if (nodes[i] == OLD_IF) {
                counter++;
            } else if (nodes[i] == OLD_ELSE) {
                if (counter == 1) {
                    elsePosition = i;
                }
            } else if (nodes[i] == OLD_ENDIF) {
                if (!--counter) {
                    endIfPosition = i;
                }
            }
            if (endIfPosition) {
                break;
            }
            i += 2;
        }

        if (isTrue) {
            l = tree.left + 2;
            r = elsePosition ? elsePosition : endIfPosition;
        } else {
            l = elsePosition ? elsePosition + 2 : endIfPosition;
            r = endIfPosition;
        }

        if (l != r) {
            var oldRight = tree.right,
                oldEmpty = tree.empty;

            tree.left = l;
            tree.right = r;

            parser._buildTree(tree);

            tree.empty = tree.empty && oldEmpty;
            tree.right = oldRight;
        }

        tree.left = endIfPosition + 2;
    };

    // Токены нового синтаксиса
    var SUBSTITUTE = 2001,
        INCLUDE = 2002,
        IF = 2003,
        ELSE = 2004,
        ENDIF = 2005,
        FOR = 2006,
        ENDFOR = 2007,
        ELSEIF = 2008;

    Parser.prototype.scanners['{{'] = {
        stopToken: '}}',
        scan: function (tokens, text) {
            var parts = trim(text).split('|'),
                filters = [];
            for (var i = 1, l = parts.length; i < l; i++) {
                var match = parts[i].split(':', 2),
                    filter = trim(match[0]),
                    filterValue = match[1];//null;

                if (match[1]) {
                    if (filter != 'default') {
                        filterValue = parseExpression(removeQuotes(match[1]));
                    } else {
                        filterValue = trim(match[1]);
                    }
                }
                filters.push([filter, filterValue]);
            }
            tokens.push(SUBSTITUTE, [parts[0], filters]);
        }
    };

    Parser.prototype.scanners['{%'] = {
        stopToken: '%}',
        scan: function (tokens, text) {
            var match = trim(text).match(/^([A-Za-z]+)(\s+\S.*)?$/),
                operator = match[1],
                expression = match[2] ? trim(match[2]) : null;

            switch (operator) {
                case 'if':
                    tokens.push(IF, parseExpression(expression));
                    break;
                case 'else':
                    tokens.push(ELSE, null);
                    break;
                case 'elseif':
                    tokens.push(ELSEIF, parseExpression(expression));
                    break;
                case 'endif':
                    tokens.push(ENDIF, null);
                    break;
                case 'include':
                    var conditions = getKeyValuePairs(expression);
                    tokens.push(INCLUDE, [removeQuotes(conditions[0][0]), conditions.slice(1)]);
                    break;
                case 'for':
                    tokens.push(FOR, expression);
                    break;
                case 'endfor':
                    tokens.push(ENDFOR, null);
                    break;
            }
        }
    };

    Parser.prototype.builders[SUBSTITUTE] = function (tree, parser) {
        // Для ключей вида object[0], object["test"][0] и т.д.
        var keyWithSquareBracketsRegExp  = /\[\s*([0-9]+|\'[^\']+\'|\"[^\"]+\")\s*\]/g,
            treeValue = tree.nodes[tree.left + 1],
            key = treeValue[0],
            value,
            filters = treeValue[1],
            needEscape = true,
            i,
            l;

        if (!keyWithSquareBracketsRegExp.test(key)) {
            value = tree.data.get(key);
        } else {
            var path = key.match(keyWithSquareBracketsRegExp);
            key = key.split(path[0])[0];

            for (i = 0, l = path.length; i < l; i++) {
                path[i] = trim(path[i].replace('[', '').replace(']', ''));
                path[i] = removeQuotes(path[i]);

            }
            value = tree.data.get(key + '.' + path.join('.'));
        }

        for (i = 0, l = filters.length; i < l; i++) {
            var filter = filters[i];
            switch (filter[0]) {
                case 'default':
                    if (typeof value == 'undefined') {
                        key = filter[1];
                        var word = removeQuotes(key);
                        if (key.length == word.length) {
                            if (!isNaN(word)) {
                                value = word;
                            } else {
                                value = tree.data.get(key);
                            }
                        } else {
                            value = word;
                        }
                    }
                    break;
                case 'raw':
                    needEscape = false;
                    break;
            }
        }

        if (needEscape && typeof value == 'string') {
            value = escape(value);
        }

        tree.strings.push(value);
        tree.left += 2;
        tree.empty = tree.empty && !value;
    };

    Parser.prototype.builders[INCLUDE] = Parser.prototype.builders[OLD_SUBLAYOUT];

    Parser.prototype.builders[FOR] = function (tree, parser) {
        var nodes = tree.nodes,
            i = tree.left + 2,
            left,
            right = tree.right,
            counter = 1,
            endForPosition;

        // Определяем область действия for.
        while (i < right) {
            if (nodes[i] == FOR) {
                counter++;
            } else if (nodes[i] == ENDFOR) {
                if (!--counter) {
                    endForPosition = i;
                }
            }
            if (endForPosition) {
                break;
            }
            i += 2;
        }

        left = tree.left + 2;
        right = endForPosition;

        if (left != right) {
            var expressionParts = nodes[tree.left + 1].split(/\sin\s/),
                beforeIn = trim(expressionParts[0]),
                afterIn = trim(expressionParts[1]),
                list = tree.data.get(afterIn),
                params = beforeIn.split(','),
                paramsLength = params.length;

            // Создаем временное дерево для обработки блока. 
            var originRight = tree.right,
                originEmpty = tree.empty,
                originLogger = tree.data,
                tmpDataLogger = new DataLogger(originLogger);

            tree.data = tmpDataLogger;

            for (var property in list) {
                tree.left = left;
                tree.right = right;

                if (list.hasOwnProperty(property)) {
                    if (paramsLength == 1) {
                        tmpDataLogger.setContext(beforeIn, afterIn + "." + property);
                    } else {
                        tmpDataLogger.set(trim(params[0]), property);
                        tmpDataLogger.setContext(trim(params[1]), afterIn + "." + property);
                    }
                    parser._buildTree(tree);
                }
            }

            // Восстанавливаем состоянение оригинального блока с учетом данных временного дерева.
            tree.empty = tree.empty && originEmpty;
            tree.right = originRight;
            tree.data = originLogger;
        }

        tree.left = endForPosition + 2;
    };

    Parser.prototype.builders[IF] =
    Parser.prototype.builders[ELSEIF] = function (tree, parser) {
        var nodes = tree.nodes,
            left = tree.left,
            expression = nodes[left + 1],
            result = evaluateExpression(expression, tree.data),
            isTrue = !!result,
            l,
            i = tree.left + 2,
            r = tree.right,
            depth = 1,
            elsePosition,
            elseIfPosition,
            endIfPosition,
            node;

        while (i < r) {
            node = nodes[i];
            if (node == IF) {
                depth++;
            } else if (node == ELSEIF) {
                if (depth == 1 && !elseIfPosition) {
                    elseIfPosition = i;
                }
            } else if (node == ELSE) {
                if (depth == 1) {
                    elsePosition = i;
                }
            } else if (node == ENDIF) {
                if (!--depth) {
                    endIfPosition = i;
                }
            }
            if (endIfPosition) {
                break;
            }
            i += 2;
        }

        if (isTrue) {
            l = tree.left + 2;
            r = elseIfPosition || elsePosition || endIfPosition;
        } else {
            if (elseIfPosition) {
                l = elseIfPosition;
                r = endIfPosition + 1;
            } else {
                l = elsePosition ? elsePosition + 2 : endIfPosition;
                r = endIfPosition;
            }
        }

        if (l != r) {
            var oldRight = tree.right,
                oldEmpty = tree.empty;

            tree.left = l;
            tree.right = r;

            parser._buildTree(tree);

            tree.empty = tree.empty && oldEmpty;
            tree.right = oldRight;
        }

        tree.left = endIfPosition + 2;
    };

    provide(Parser);
});