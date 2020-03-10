webpackJsonp([2], [
/* 0 */
  /***/ function (module, exports) {
/**
 * Helpers
 */
    const escapeTest = /[&<>"']/
    const escapeReplace = /[&<>"']/g
    const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/
    const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g
    const escapeReplacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    const getEscapeReplacement = (ch) => escapeReplacements[ch]
    function escape (html, encode) {
      if (encode) {
        if (escapeTest.test(html)) {
          return html.replace(escapeReplace, getEscapeReplacement)
        }
      } else {
        if (escapeTestNoEncode.test(html)) {
          return html.replace(escapeReplaceNoEncode, getEscapeReplacement)
        }
      }

      return html
    }

    const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig

    function unescape (html) {
  // explicitly match decimal, hex, and named HTML entities
      return html.replace(unescapeTest, (_, n) => {
        n = n.toLowerCase()
        if (n === 'colon') return ':'
        if (n.charAt(0) === '#') {
          return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1))
        }
        return ''
      })
    }

    const caret = /(^|[^\[])\^/g
    function edit (regex, opt) {
      regex = regex.source || regex
      opt = opt || ''
      const obj = {
        replace: (name, val) => {
          val = val.source || val
          val = val.replace(caret, '$1')
          regex = regex.replace(name, val)
          return obj
        },
        getRegex: () => {
          return new RegExp(regex, opt)
        }
      }
      return obj
    }

    const nonWordAndColonTest = /[^\w:]/g
    const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i
    function cleanUrl (sanitize, base, href) {
      if (sanitize) {
        let prot
        try {
          prot = decodeURIComponent(unescape(href))
        .replace(nonWordAndColonTest, '')
        .toLowerCase()
        } catch (e) {
          return null
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
          return null
        }
      }
      if (base && !originIndependentUrl.test(href)) {
        href = resolveUrl(base, href)
      }
      try {
        href = encodeURI(href).replace(/%25/g, '%')
      } catch (e) {
        return null
      }
      return href
    }

    const baseUrls = {}
    const justDomain = /^[^:]+:\/*[^/]*$/
    const protocol = /^([^:]+:)[\s\S]*$/
    const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/

    function resolveUrl (base, href) {
      if (!baseUrls[' ' + base]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
        if (justDomain.test(base)) {
          baseUrls[' ' + base] = base + '/'
        } else {
          baseUrls[' ' + base] = rtrim(base, '/', true)
        }
      }
      base = baseUrls[' ' + base]
      const relativeBase = base.indexOf(':') === -1

      if (href.substring(0, 2) === '//') {
        if (relativeBase) {
          return href
        }
        return base.replace(protocol, '$1') + href
      } else if (href.charAt(0) === '/') {
        if (relativeBase) {
          return href
        }
        return base.replace(domain, '$1') + href
      } else {
        return base + href
      }
    }

    const noopTest = { exec: function noopTest () {} }

    function merge (obj) {
      let i = 1,
        target,
        key

      for (; i < arguments.length; i++) {
        target = arguments[i]
        for (key in target) {
          if (Object.prototype.hasOwnProperty.call(target, key)) {
            obj[key] = target[key]
          }
        }
      }

      return obj
    }

    function splitCells (tableRow, count) {
  // ensure that every cell-delimiting pipe has a space
  // before it to distinguish it from an escaped pipe
      const row = tableRow.replace(/\|/g, (match, offset, str) => {
          let escaped = false,
            curr = offset
          while (--curr >= 0 && str[curr] === '\\') escaped = !escaped
          if (escaped) {
        // odd number of slashes means | is escaped
        // so we leave it alone
            return '|'
          } else {
        // add space before unescaped |
            return ' |'
          }
        }),
        cells = row.split(/ \|/)
      let i = 0

      if (cells.length > count) {
        cells.splice(count)
      } else {
        while (cells.length < count) cells.push('')
      }

      for (; i < cells.length; i++) {
    // leading or trailing whitespace is ignored per the gfm spec
        cells[i] = cells[i].trim().replace(/\\\|/g, '|')
      }
      return cells
    }

// Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
// /c*$/ is vulnerable to REDOS.
// invert: Remove suffix of non-c chars instead. Default falsey.
    function rtrim (str, c, invert) {
      const l = str.length
      if (l === 0) {
        return ''
      }

  // Length of suffix matching the invert condition.
      let suffLen = 0

  // Step left until we fail to match the invert condition.
      while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1)
        if (currChar === c && !invert) {
          suffLen++
        } else if (currChar !== c && invert) {
          suffLen++
        } else {
          break
        }
      }

      return str.substr(0, l - suffLen)
    }

    function findClosingBracket (str, b) {
      if (str.indexOf(b[1]) === -1) {
        return -1
      }
      const l = str.length
      let level = 0,
        i = 0
      for (; i < l; i++) {
        if (str[i] === '\\') {
          i++
        } else if (str[i] === b[0]) {
          level++
        } else if (str[i] === b[1]) {
          level--
          if (level < 0) {
            return i
          }
        }
      }
      return -1
    }

    function checkSanitizeDeprecation (opt) {
      if (opt && opt.sanitize && !opt.silent) {
        console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options')
      }
    }

    module.exports = {
      escape,
      unescape,
      edit,
      cleanUrl,
      resolveUrl,
      noopTest,
      merge,
      splitCells,
      rtrim,
      findClosingBracket,
      checkSanitizeDeprecation
    }
  /***/ },, /* 1 */
/* 2 */
  /***/ function (module, exports) {
    function getDefaults () {
      return {
        baseUrl: null,
        breaks: false,
        gfm: true,
        headerIds: true,
        headerPrefix: '',
        highlight: null,
        langPrefix: 'language-',
        mangle: true,
        pedantic: false,
        renderer: null,
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        xhtml: false
      }
    }

    function changeDefaults (newDefaults) {
      module.exports.defaults = newDefaults
    }

    module.exports = {
      defaults: getDefaults(),
      getDefaults,
      changeDefaults
    }
  /***/ },
/* 3 */
  /***/ function (module, exports, __webpack_require__) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

    if (false) {
      var ReactIs = require('react-is')

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
      var throwOnDirectAccess = true
      module.exports = require('./factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess)
    } else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
      module.exports = __webpack_require__(13)()
    }
  /***/ },, /* 4 */
/* 5 */
  /***/ function (module, exports, __webpack_require__) {
    const { defaults } = __webpack_require__(2)
    const {
  cleanUrl,
  escape
} = __webpack_require__(0)

/**
 * Renderer
 */
    module.exports = class Renderer {
      constructor (options) {
        this.options = options || defaults
      }

      code (code, infostring, escaped) {
        const lang = (infostring || '').match(/\S*/)[0]
        if (this.options.highlight) {
          const out = this.options.highlight(code, lang)
          if (out != null && out !== code) {
            escaped = true
            code = out
          }
        }

        if (!lang) {
          return '<pre><code>' +
        (escaped ? code : escape(code, true)) +
        '</code></pre>'
        }

        return '<pre><code class="' +
      this.options.langPrefix +
      escape(lang, true) +
      '">' +
      (escaped ? code : escape(code, true)) +
      '</code></pre>\n'
      };

      blockquote (quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n'
      };

      html (html) {
        return html
      };

      heading (text, level, raw, slugger) {
        if (this.options.headerIds) {
          return '<h' +
        level +
        ' id="' +
        this.options.headerPrefix +
        slugger.slug(raw) +
        '">' +
        text +
        '</h' +
        level +
        '>\n'
        }
    // ignore IDs
        return '<h' + level + '>' + text + '</h' + level + '>\n'
      };

      hr () {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n'
      };

      list (body, ordered, start) {
        const type = ordered ? 'ol' : 'ul',
          startatt = (ordered && start !== 1) ? (' start="' + start + '"') : ''
        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n'
      };

      listitem (text) {
        return '<li>' + text + '</li>\n'
      };

      checkbox (checked) {
        return '<input ' +
      (checked ? 'checked="" ' : '') +
      'disabled="" type="checkbox"' +
      (this.options.xhtml ? ' /' : '') +
      '> '
      };

      paragraph (text) {
        return '<p>' + text + '</p>\n'
      };

      table (header, body) {
        if (body) body = '<tbody>' + body + '</tbody>'

        return '<table>\n' +
      '<thead>\n' +
      header +
      '</thead>\n' +
      body +
      '</table>\n'
      };

      tablerow (content) {
        return '<tr>\n' + content + '</tr>\n'
      };

      tablecell (content, flags) {
        const type = flags.header ? 'th' : 'td'
        const tag = flags.align
      ? '<' + type + ' align="' + flags.align + '">'
      : '<' + type + '>'
        return tag + content + '</' + type + '>\n'
      };

  // span level renderer
      strong (text) {
        return '<strong>' + text + '</strong>'
      };

      em (text) {
        return '<em>' + text + '</em>'
      };

      codespan (text) {
        return '<code>' + text + '</code>'
      };

      br () {
        return this.options.xhtml ? '<br/>' : '<br>'
      };

      del (text) {
        return '<del>' + text + '</del>'
      };

      link (href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href)
        if (href === null) {
          return text
        }
        let out = '<a href="' + escape(href) + '"'
        if (title) {
          out += ' title="' + title + '"'
        }
        out += '>' + text + '</a>'
        return out
      };

      image (href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href)
        if (href === null) {
          return text
        }

        let out = '<img src="' + href + '" alt="' + text + '"'
        if (title) {
          out += ' title="' + title + '"'
        }
        out += this.options.xhtml ? '/>' : '>'
        return out
      };

      text (text) {
        return text
      };
}
  /***/ },
/* 6 */
  /***/ function (module, exports, __webpack_require__) {
    !(function (n, t) { true ? t(exports, __webpack_require__(4)) : typeof define === 'function' && define.amd ? define(['exports', 'preact'], t) : t((n = n || self).preactContext = {}, n.preact) }(this, function (n, t) { 'use strict'; var i = function (n, t) { return (i = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (n, t) { n.__proto__ = t } || function (n, t) { for (var i in t)t.hasOwnProperty(i) && (n[i] = t[i]) })(n, t) }; function r (n, t) { function r () { this.constructor = n }i(n, t), n.prototype = t === null ? Object.create(t) : (r.prototype = t.prototype, new r()) } var e = {register: function (n) { console.warn('Consumer used without a Provider') }, unregister: function (n) {}, val: function (n) {}}; function u (n) { var t = n.children; return {child: t.length === 1 ? t[0] : null, children: t} } function o (n) { return u(n).child || 'render' in n && n.render } var c = 1073741823, f = function () { return c }, s = 0; function a (n, i) { var a = '_preactContextProvider-' + s++; return {Provider: (function (n) { function e (t) { var r = n.call(this, t) || this; return r.t = (function (n, t) { var i = [], r = n, e = function (n) { return 0 | t(r, n) }; return {register: function (n) { i.push(n), n(r, e(r)) }, unregister: function (n) { i = i.filter(function (t) { return t !== n }) }, val: function (n) { if (void 0 === n || n == r) return r; var t = e(n); return r = n, i.forEach(function (i) { return i(n, t) }), r }} }(t.value, i || f)), r } return r(e, n), e.prototype.getChildContext = function () { var n; return (n = {})[a] = this.t, n }, e.prototype.componentDidUpdate = function () { this.t.val(this.props.value) }, e.prototype.render = function () { var n = u(this.props), i = n.child, r = n.children; return i || t.h('span', null, r) }, e }(t.Component)), Consumer: (function (t) { function i (i, r) { var e = t.call(this, i, r) || this; return e.i = function (n, t) { var i = e.props.unstable_observedBits, r = void 0 === i || i === null ? c : i; ((r |= 0) & t) != 0 && e.setState({value: n}) }, e.state = {value: e.u().val() || n}, e } return r(i, t), i.prototype.componentDidMount = function () { this.u().register(this.i) }, i.prototype.shouldComponentUpdate = function (n, t) { return this.state.value !== t.value || o(this.props) !== o(n) }, i.prototype.componentWillUnmount = function () { this.u().unregister(this.i) }, i.prototype.componentDidUpdate = function (n, t, i) { var r = i[a]; r !== this.context[a] && ((r || e).unregister(this.i), this.componentDidMount()) }, i.prototype.render = function () { var n = 'render' in this.props && this.props.render, t = o(this.props); if (n && n !== t && console.warn('Both children and a render function are defined. Children will be used'), typeof t === 'function') return t(this.state.value); console.warn("Consumer is expecting a function as one and only child but didn't find any") }, i.prototype.u = function () { return this.context[a] || e }, i }(t.Component))} } var h = a; n.default = a, n.createContext = h, Object.defineProperty(n, '__esModule', {value: !0}) }))
  /***/ },
/* 7 */
  /***/ function (module, exports, __webpack_require__) {
    const {
  noopTest,
  edit,
  merge
} = __webpack_require__(0)

/**
 * Block-Level Grammar
 */
    const block = {
      newline: /^\n+/,
      code: /^( {4}[^\n]+\n*)+/,
      fences: /^ {0,3}(`{3,}|~{3,})([^`~\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
      html: '^ {0,3}(?:' + // optional indentation
    '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' + // (1)
    '|comment[^\\n]*(\\n+|$)' + // (2)
    '|<\\?[\\s\\S]*?\\?>\\n*' + // (3)
    '|<![A-Z][\\s\\S]*?>\\n*' + // (4)
    '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' + // (5)
    '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' + // (6)
    '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' + // (7) open tag
    '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' + // (7) closing tag
    ')',
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      nptable: noopTest,
      table: noopTest,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
  // regex template, placeholders will be replaced according to different paragraph
  // interruption rules of commonmark and the original markdown spec:
      _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
      text: /^[^\n]+/
    }

    block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/
    block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/
    block.def = edit(block.def)
  .replace('label', block._label)
  .replace('title', block._title)
  .getRegex()

    block.bullet = /(?:[*+-]|\d{1,9}\.)/
    block.item = /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/
    block.item = edit(block.item, 'gm')
  .replace(/bull/g, block.bullet)
  .getRegex()

    block.list = edit(block.list)
  .replace(/bull/g, block.bullet)
  .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
  .replace('def', '\\n+(?=' + block.def.source + ')')
  .getRegex()

    block._tag = 'address|article|aside|base|basefont|blockquote|body|caption' +
  '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' +
  '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' +
  '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' +
  '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' +
  '|track|ul'
    block._comment = /<!--(?!-?>)[\s\S]*?-->/
    block.html = edit(block.html, 'i')
  .replace('comment', block._comment)
  .replace('tag', block._tag)
  .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
  .getRegex()

    block.paragraph = edit(block._paragraph)
  .replace('hr', block.hr)
  .replace('heading', ' {0,3}#{1,6} +')
  .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
  .replace('blockquote', ' {0,3}>')
  .replace('fences', ' {0,3}(?:`{3,}|~{3,})[^`\\n]*\\n')
  .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
  .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
  .getRegex()

    block.blockquote = edit(block.blockquote)
  .replace('paragraph', block.paragraph)
  .getRegex()

/**
 * Normal Block Grammar
 */

    block.normal = merge({}, block)

/**
 * GFM Block Grammar
 */

    block.gfm = merge({}, block.normal, {
      nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
      table: /^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/
    })

/**
 * Pedantic grammar (original John Gruber's loose markdown specification)
 */

    block.pedantic = merge({}, block.normal, {
      html: edit(
    '^ *(?:comment *(?:\\n|\\s*$)' +
    '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' + // closed tag
    '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
    .replace('comment', block._comment)
    .replace(/tag/g, '(?!(?:' +
      'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' +
      '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' +
      '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
    .getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
      fences: noopTest, // fences not supported
      paragraph: edit(block.normal._paragraph)
    .replace('hr', block.hr)
    .replace('heading', ' *#{1,6} *[^\n]')
    .replace('lheading', block.lheading)
    .replace('blockquote', ' {0,3}>')
    .replace('|fences', '')
    .replace('|list', '')
    .replace('|html', '')
    .getRegex()
    })

/**
 * Inline-Level Grammar
 */
    const inline = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      url: noopTest,
      tag: '^comment' +
    '|^</[a-zA-Z][\\w:-]*\\s*>' + // self-closing tag
    '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' + // open tag
    '|^<\\?[\\s\\S]*?\\?>' + // processing instruction, e.g. <?php ?>
    '|^<![a-zA-Z]+\\s[\\s\\S]*?>' + // declaration, e.g. <!DOCTYPE html>
    '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
      link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      strong: /^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,
      em: /^_([^\s_])_(?!_)|^\*([^\s*<\[])\*(?!\*)|^_([^\s<][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_<][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s<"][\s\S]*?[^\s\*])\*(?!\*|[^\spunctuation])|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      del: noopTest,
      text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
    }

// list of punctuation marks from common mark spec
// without ` and ] to workaround Rule 17 (inline code blocks/links)
    inline._punctuation = '!"#$%&\'()*+,\\-./:;<=>?@\\[^_{|}~'
    inline.em = edit(inline.em).replace(/punctuation/g, inline._punctuation).getRegex()

    inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g

    inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/
    inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/
    inline.autolink = edit(inline.autolink)
  .replace('scheme', inline._scheme)
  .replace('email', inline._email)
  .getRegex()

    inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/

    inline.tag = edit(inline.tag)
  .replace('comment', block._comment)
  .replace('attribute', inline._attribute)
  .getRegex()

    inline._label = /(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?/
    inline._href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/
    inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/

    inline.link = edit(inline.link)
  .replace('label', inline._label)
  .replace('href', inline._href)
  .replace('title', inline._title)
  .getRegex()

    inline.reflink = edit(inline.reflink)
  .replace('label', inline._label)
  .getRegex()

/**
 * Normal Inline Grammar
 */

    inline.normal = merge({}, inline)

/**
 * Pedantic Inline Grammar
 */

    inline.pedantic = merge({}, inline.normal, {
      strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
      link: edit(/^!?\[(label)\]\((.*?)\)/)
    .replace('label', inline._label)
    .getRegex(),
      reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
    .replace('label', inline._label)
    .getRegex()
    })

/**
 * GFM Inline Grammar
 */

    inline.gfm = merge({}, inline.normal, {
      escape: edit(inline.escape).replace('])', '~|])').getRegex(),
      _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
      url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
      _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
      del: /^~+(?=\S)([\s\S]*?\S)~+/,
      text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
    })

    inline.gfm.url = edit(inline.gfm.url, 'i')
  .replace('email', inline.gfm._extended_email)
  .getRegex()
/**
 * GFM + Line Breaks Inline Grammar
 */

    inline.breaks = merge({}, inline.gfm, {
      br: edit(inline.br).replace('{2,}', '*').getRegex(),
      text: edit(inline.gfm.text)
    .replace('\\b_', '\\b_| {2,}\\n')
    .replace(/\{2,\}/g, '*')
    .getRegex()
    })

    module.exports = {
      block,
      inline
    }
  /***/ },
/* 8 */
  /***/ function (module, exports) {
/**
 * Slugger generates header id
 */
    module.exports = class Slugger {
      constructor () {
        this.seen = {}
      }

  /**
   * Convert string to unique id
   */
      slug (value) {
        let slug = value
      .toLowerCase()
      .trim()
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
      .replace(/\s/g, '-')

        if (this.seen.hasOwnProperty(slug)) {
          const originalSlug = slug
          do {
            this.seen[originalSlug]++
            slug = originalSlug + '-' + this.seen[originalSlug]
          } while (this.seen.hasOwnProperty(slug))
        }
        this.seen[slug] = 0

        return slug
      };
}
  /***/ },
/* 9 */
  /***/ function (module, exports, __webpack_require__) {
    const Renderer = __webpack_require__(5)
    const { defaults } = __webpack_require__(2)
    const { inline } = __webpack_require__(7)
    const {
  findClosingBracket,
  escape
} = __webpack_require__(0)

/**
 * Inline Lexer & Compiler
 */
    module.exports = class InlineLexer {
      constructor (links, options) {
        this.options = options || defaults
        this.links = links
        this.rules = inline.normal
        this.options.renderer = this.options.renderer || new Renderer()
        this.renderer = this.options.renderer
        this.renderer.options = this.options

        if (!this.links) {
          throw new Error('Tokens array requires a `links` property.')
        }

        if (this.options.pedantic) {
          this.rules = inline.pedantic
        } else if (this.options.gfm) {
          if (this.options.breaks) {
            this.rules = inline.breaks
          } else {
            this.rules = inline.gfm
          }
        }
      }

  /**
   * Expose Inline Rules
   */
      static get rules () {
        return inline
      }

  /**
   * Static Lexing/Compiling Method
   */
      static output (src, links, options) {
        const inline = new InlineLexer(links, options)
        return inline.output(src)
      }

  /**
   * Lexing/Compiling
   */
      output (src) {
        let out = '',
          link,
          text,
          href,
          title,
          cap,
          prevCapZero

        while (src) {
      // escape
          if (cap = this.rules.escape.exec(src)) {
            src = src.substring(cap[0].length)
            out += escape(cap[1])
            continue
          }

      // tag
          if (cap = this.rules.tag.exec(src)) {
            if (!this.inLink && /^<a /i.test(cap[0])) {
              this.inLink = true
            } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
              this.inLink = false
            }
            if (!this.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              this.inRawBlock = true
            } else if (this.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              this.inRawBlock = false
            }

            src = src.substring(cap[0].length)
            out += this.options.sanitize
          ? this.options.sanitizer
            ? this.options.sanitizer(cap[0])
            : escape(cap[0])
          : cap[0]
            continue
          }

      // link
          if (cap = this.rules.link.exec(src)) {
            const lastParenIndex = findClosingBracket(cap[2], '()')
            if (lastParenIndex > -1) {
              const start = cap[0].indexOf('!') === 0 ? 5 : 4
              const linkLen = start + cap[1].length + lastParenIndex
              cap[2] = cap[2].substring(0, lastParenIndex)
              cap[0] = cap[0].substring(0, linkLen).trim()
              cap[3] = ''
            }
            src = src.substring(cap[0].length)
            this.inLink = true
            href = cap[2]
            if (this.options.pedantic) {
              link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href)

              if (link) {
                href = link[1]
                title = link[3]
              } else {
                title = ''
              }
            } else {
              title = cap[3] ? cap[3].slice(1, -1) : ''
            }
            href = href.trim().replace(/^<([\s\S]*)>$/, '$1')
            out += this.outputLink(cap, {
              href: InlineLexer.escapes(href),
              title: InlineLexer.escapes(title)
            })
            this.inLink = false
            continue
          }

      // reflink, nolink
          if ((cap = this.rules.reflink.exec(src)) ||
          (cap = this.rules.nolink.exec(src))) {
            src = src.substring(cap[0].length)
            link = (cap[2] || cap[1]).replace(/\s+/g, ' ')
            link = this.links[link.toLowerCase()]
            if (!link || !link.href) {
              out += cap[0].charAt(0)
              src = cap[0].substring(1) + src
              continue
            }
            this.inLink = true
            out += this.outputLink(cap, link)
            this.inLink = false
            continue
          }

      // strong
          if (cap = this.rules.strong.exec(src)) {
            src = src.substring(cap[0].length)
            out += this.renderer.strong(this.output(cap[4] || cap[3] || cap[2] || cap[1]))
            continue
          }

      // em
          if (cap = this.rules.em.exec(src)) {
            src = src.substring(cap[0].length)
            out += this.renderer.em(this.output(cap[6] || cap[5] || cap[4] || cap[3] || cap[2] || cap[1]))
            continue
          }

      // code
          if (cap = this.rules.code.exec(src)) {
            src = src.substring(cap[0].length)
            out += this.renderer.codespan(escape(cap[2].trim(), true))
            continue
          }

      // br
          if (cap = this.rules.br.exec(src)) {
            src = src.substring(cap[0].length)
            out += this.renderer.br()
            continue
          }

      // del (gfm)
          if (cap = this.rules.del.exec(src)) {
            src = src.substring(cap[0].length)
            out += this.renderer.del(this.output(cap[1]))
            continue
          }

      // autolink
          if (cap = this.rules.autolink.exec(src)) {
            src = src.substring(cap[0].length)
            if (cap[2] === '@') {
              text = escape(this.mangle(cap[1]))
              href = 'mailto:' + text
            } else {
              text = escape(cap[1])
              href = text
            }
            out += this.renderer.link(href, null, text)
            continue
          }

      // url (gfm)
          if (!this.inLink && (cap = this.rules.url.exec(src))) {
            if (cap[2] === '@') {
              text = escape(cap[0])
              href = 'mailto:' + text
            } else {
          // do extended autolink path validation
              do {
                prevCapZero = cap[0]
                cap[0] = this.rules._backpedal.exec(cap[0])[0]
              } while (prevCapZero !== cap[0])
              text = escape(cap[0])
              if (cap[1] === 'www.') {
                href = 'http://' + text
              } else {
                href = text
              }
            }
            src = src.substring(cap[0].length)
            out += this.renderer.link(href, null, text)
            continue
          }

      // text
          if (cap = this.rules.text.exec(src)) {
            src = src.substring(cap[0].length)
            if (this.inRawBlock) {
              out += this.renderer.text(this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0])
            } else {
              out += this.renderer.text(escape(this.smartypants(cap[0])))
            }
            continue
          }

          if (src) {
            throw new Error('Infinite loop on byte: ' + src.charCodeAt(0))
          }
        }

        return out
      }

      static escapes (text) {
        return text ? text.replace(InlineLexer.rules._escapes, '$1') : text
      }

  /**
   * Compile Link
   */
      outputLink (cap, link) {
        const href = link.href,
          title = link.title ? escape(link.title) : null

        return cap[0].charAt(0) !== '!'
      ? this.renderer.link(href, title, this.output(cap[1]))
      : this.renderer.image(href, title, escape(cap[1]))
      }

  /**
   * Smartypants Transformations
   */
      smartypants (text) {
        if (!this.options.smartypants) return text
        return text
      // em-dashes
      .replace(/---/g, '\u2014')
      // en-dashes
      .replace(/--/g, '\u2013')
      // opening singles
      .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
      // closing singles & apostrophes
      .replace(/'/g, '\u2019')
      // opening doubles
      .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
      // closing doubles
      .replace(/"/g, '\u201d')
      // ellipses
      .replace(/\.{3}/g, '\u2026')
      }

  /**
   * Mangle Links
   */
      mangle (text) {
        if (!this.options.mangle) return text
        const l = text.length
        let out = '',
          i = 0,
          ch

        for (; i < l; i++) {
          ch = text.charCodeAt(i)
          if (Math.random() > 0.5) {
            ch = 'x' + ch.toString(16)
          }
          out += '&#' + ch + ';'
        }

        return out
      }
}
  /***/ },
/* 10 */
  /***/ function (module, exports) {
/**
 * TextRenderer
 * returns only the textual part of the token
 */
    module.exports = class TextRenderer {
  // no need for block level renderers
      strong (text) {
        return text
      }

      em (text) {
        return text
      }

      codespan (text) {
        return text
      }

      del (text) {
        return text
      }

      text (text) {
        return text
      }

      link (href, title, text) {
        return '' + text
      }

      image (href, title, text) {
        return '' + text
      }

      br () {
        return ''
      }
}
  /***/ },
/* 11 */
  /***/ function (module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
    module.exports = function (useSourceMap) {
      var list = []

	// return the list of modules as css string
      list.toString = function toString () {
        return this.map(function (item) {
          var content = cssWithMappingToString(item, useSourceMap)
          if (item[2]) {
            return '@media ' + item[2] + '{' + content + '}'
          } else {
            return content
          }
        }).join('')
      }

	// import a list of modules into the list
      list.i = function (modules, mediaQuery) {
        if (typeof modules === 'string') { modules = [[null, modules, '']] }
        var alreadyImportedModules = {}
        for (var i = 0; i < this.length; i++) {
          var id = this[i][0]
          if (typeof id === 'number') { alreadyImportedModules[id] = true }
        }
        for (i = 0; i < modules.length; i++) {
          var item = modules[i]
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
          if (typeof item[0] !== 'number' || !alreadyImportedModules[item[0]]) {
            if (mediaQuery && !item[2]) {
              item[2] = mediaQuery
            } else if (mediaQuery) {
              item[2] = '(' + item[2] + ') and (' + mediaQuery + ')'
            }
            list.push(item)
          }
        }
      }
      return list
    }

    function cssWithMappingToString (item, useSourceMap) {
      var content = item[1] || ''
      var cssMapping = item[3]
      if (!cssMapping) {
        return content
      }

      if (useSourceMap && typeof btoa === 'function') {
        var sourceMapping = toComment(cssMapping)
        var sourceURLs = cssMapping.sources.map(function (source) {
          return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
        })

        return [content].concat(sourceURLs).concat([sourceMapping]).join('\n')
      }

      return [content].join('\n')
    }

// Adapted from convert-source-map (MIT)
    function toComment (sourceMap) {
	// eslint-disable-next-line no-undef
      var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))))
      var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64

      return '/*# ' + data + ' */'
    }
  /***/ },, /* 12 */
/* 13 */
  /***/ function (module, exports, __webpack_require__) {
    'use strict'
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

    var ReactPropTypesSecret = __webpack_require__(14)

    function emptyFunction () {}
    function emptyFunctionWithReset () {}
    emptyFunctionWithReset.resetWarningCache = emptyFunction

    module.exports = function () {
      function shim (props, propName, componentName, location, propFullName, secret) {
        if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
          return
        }
        var err = new Error(
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    )
        err.name = 'Invariant Violation'
        throw err
      };
      shim.isRequired = shim
      function getShim () {
        return shim
      };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
      var ReactPropTypes = {
        array: shim,
        bool: shim,
        func: shim,
        number: shim,
        object: shim,
        string: shim,
        symbol: shim,

        any: shim,
        arrayOf: getShim,
        element: shim,
        elementType: shim,
        instanceOf: getShim,
        node: shim,
        objectOf: getShim,
        oneOf: getShim,
        oneOfType: getShim,
        shape: getShim,
        exact: getShim,

        checkPropTypes: emptyFunctionWithReset,
        resetWarningCache: emptyFunction
      }

      ReactPropTypes.PropTypes = ReactPropTypes

      return ReactPropTypes
    }
  /***/ },
/* 14 */
  /***/ function (module, exports, __webpack_require__) {
    'use strict'
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

    var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'

    module.exports = ReactPropTypesSecret
  /***/ },
/* 15 */
  /***/ function (module, exports, __webpack_require__) {
    module.exports = __webpack_require__(16)
  /***/ },
/* 16 */
  /***/ function (module, exports, __webpack_require__) {
    'use strict'

/* eslint-disable global-require */

    if (true) {
      module.exports = __webpack_require__(17)
    } else {
      module.exports = require('./index.dev')
    }
  /***/ },
/* 17 */
  /***/ function (module, exports, __webpack_require__) {
    'use strict'

    module.exports.AppContainer = __webpack_require__(18)
  /***/ },
/* 18 */
  /***/ function (module, exports, __webpack_require__) {
    'use strict'

/* eslint-disable global-require */

    if (true) {
      module.exports = __webpack_require__(19)
    } else {
      module.exports = require('./AppContainer.dev')
    }
  /***/ },
/* 19 */
  /***/ function (module, exports, __webpack_require__) {
    'use strict'

    var _createClass = (function () { function defineProperties (target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor) } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor } }())

    function _classCallCheck (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function') } }

    function _possibleConstructorReturn (self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called") } return call && (typeof call === 'object' || typeof call === 'function') ? call : self }

    function _inherits (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass) } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass }

/* eslint-disable react/prop-types */

    var React = __webpack_require__(1)

    var Component = React.Component

    var AppContainer = (function (_Component) {
      _inherits(AppContainer, _Component)

      function AppContainer () {
        _classCallCheck(this, AppContainer)

        return _possibleConstructorReturn(this, (AppContainer.__proto__ || Object.getPrototypeOf(AppContainer)).apply(this, arguments))
      }

      _createClass(AppContainer, [{
        key: 'render',
        value: function render () {
          if (this.props.component) {
            return React.createElement(this.props.component, this.props.props)
          }

          return React.Children.only(this.props.children)
        }
      }])

      return AppContainer
    }(Component))

    module.exports = AppContainer
  /***/ },, /* 20 */
/* 21 */
  /***/ function (module, exports, __webpack_require__) {
    const Lexer = __webpack_require__(22)
    const Parser = __webpack_require__(23)
    const Renderer = __webpack_require__(5)
    const TextRenderer = __webpack_require__(10)
    const InlineLexer = __webpack_require__(9)
    const Slugger = __webpack_require__(8)
    const {
  merge,
  checkSanitizeDeprecation,
  escape
} = __webpack_require__(0)
    const {
  getDefaults,
  changeDefaults,
  defaults
} = __webpack_require__(2)

/**
 * Marked
 */
    function marked (src, opt, callback) {
  // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked(): input parameter is undefined or null')
      }
      if (typeof src !== 'string') {
        throw new Error('marked(): input parameter is of type ' +
      Object.prototype.toString.call(src) + ', string expected')
      }

      if (callback || typeof opt === 'function') {
        if (!callback) {
          callback = opt
          opt = null
        }

        opt = merge({}, marked.defaults, opt || {})
        checkSanitizeDeprecation(opt)
        const highlight = opt.highlight
        let tokens,
          pending,
          i = 0

        try {
          tokens = Lexer.lex(src, opt)
        } catch (e) {
          return callback(e)
        }

        pending = tokens.length

        const done = function (err) {
          if (err) {
            opt.highlight = highlight
            return callback(err)
          }

          let out

          try {
            out = Parser.parse(tokens, opt)
          } catch (e) {
            err = e
          }

          opt.highlight = highlight

          return err
        ? callback(err)
        : callback(null, out)
        }

        if (!highlight || highlight.length < 3) {
          return done()
        }

        delete opt.highlight

        if (!pending) return done()

        for (; i < tokens.length; i++) {
          (function (token) {
            if (token.type !== 'code') {
              return --pending || done()
            }
            return highlight(token.text, token.lang, function (err, code) {
              if (err) return done(err)
              if (code == null || code === token.text) {
                return --pending || done()
              }
              token.text = code
              token.escaped = true
              --pending || done()
            })
          })(tokens[i])
        }

        return
      }
      try {
        opt = merge({}, marked.defaults, opt || {})
        checkSanitizeDeprecation(opt)
        return Parser.parse(Lexer.lex(src, opt), opt)
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.'
        if ((opt || marked.defaults).silent) {
          return '<p>An error occurred:</p><pre>' +
        escape(e.message + '', true) +
        '</pre>'
        }
        throw e
      }
    }

/**
 * Options
 */

    marked.options =
marked.setOptions = function (opt) {
  merge(marked.defaults, opt)
  changeDefaults(marked.defaults)
  return marked
}

    marked.getDefaults = getDefaults

    marked.defaults = defaults

/**
 * Expose
 */

    marked.Parser = Parser
    marked.parser = Parser.parse

    marked.Renderer = Renderer
    marked.TextRenderer = TextRenderer

    marked.Lexer = Lexer
    marked.lexer = Lexer.lex

    marked.InlineLexer = InlineLexer
    marked.inlineLexer = InlineLexer.output

    marked.Slugger = Slugger

    marked.parse = marked

    module.exports = marked
  /***/ },
/* 22 */
  /***/ function (module, exports, __webpack_require__) {
    const { defaults } = __webpack_require__(2)
    const { block } = __webpack_require__(7)
    const {
  rtrim,
  splitCells,
  escape
} = __webpack_require__(0)

/**
 * Block Lexer
 */
    module.exports = class Lexer {
      constructor (options) {
        this.tokens = []
        this.tokens.links = Object.create(null)
        this.options = options || defaults
        this.rules = block.normal

        if (this.options.pedantic) {
          this.rules = block.pedantic
        } else if (this.options.gfm) {
          this.rules = block.gfm
        }
      }

  /**
   * Expose Block Rules
   */
      static get rules () {
        return block
      }

  /**
   * Static Lex Method
   */
      static lex (src, options) {
        const lexer = new Lexer(options)
        return lexer.lex(src)
      };

  /**
   * Preprocessing
   */
      lex (src) {
        src = src
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, '    ')

        return this.token(src, true)
      };

  /**
   * Lexing
   */
      token (src, top) {
        src = src.replace(/^ +$/gm, '')
        let next,
          loose,
          cap,
          bull,
          b,
          item,
          listStart,
          listItems,
          t,
          space,
          i,
          tag,
          l,
          isordered,
          istask,
          ischecked

        while (src) {
      // newline
          if (cap = this.rules.newline.exec(src)) {
            src = src.substring(cap[0].length)
            if (cap[0].length > 1) {
              this.tokens.push({
                type: 'space'
              })
            }
          }

      // code
          if (cap = this.rules.code.exec(src)) {
            const lastToken = this.tokens[this.tokens.length - 1]
            src = src.substring(cap[0].length)
        // An indented code block cannot interrupt a paragraph.
            if (lastToken && lastToken.type === 'paragraph') {
              lastToken.text += '\n' + cap[0].trimRight()
            } else {
              cap = cap[0].replace(/^ {4}/gm, '')
              this.tokens.push({
                type: 'code',
                codeBlockStyle: 'indented',
                text: !this.options.pedantic
              ? rtrim(cap, '\n')
              : cap
              })
            }
            continue
          }

      // fences
          if (cap = this.rules.fences.exec(src)) {
            src = src.substring(cap[0].length)
            this.tokens.push({
              type: 'code',
              lang: cap[2] ? cap[2].trim() : cap[2],
              text: cap[3] || ''
            })
            continue
          }

      // heading
          if (cap = this.rules.heading.exec(src)) {
            src = src.substring(cap[0].length)
            this.tokens.push({
              type: 'heading',
              depth: cap[1].length,
              text: cap[2]
            })
            continue
          }

      // table no leading pipe (gfm)
          if (cap = this.rules.nptable.exec(src)) {
            item = {
              type: 'table',
              header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            }

            if (item.header.length === item.align.length) {
              src = src.substring(cap[0].length)

              for (i = 0; i < item.align.length; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right'
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center'
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left'
                } else {
                  item.align[i] = null
                }
              }

              for (i = 0; i < item.cells.length; i++) {
                item.cells[i] = splitCells(item.cells[i], item.header.length)
              }

              this.tokens.push(item)

              continue
            }
          }

      // hr
          if (cap = this.rules.hr.exec(src)) {
            src = src.substring(cap[0].length)
            this.tokens.push({
              type: 'hr'
            })
            continue
          }

      // blockquote
          if (cap = this.rules.blockquote.exec(src)) {
            src = src.substring(cap[0].length)

            this.tokens.push({
              type: 'blockquote_start'
            })

            cap = cap[0].replace(/^ *> ?/gm, '')

        // Pass `top` to keep the current
        // "toplevel" state. This is exactly
        // how markdown.pl works.
            this.token(cap, top)

            this.tokens.push({
              type: 'blockquote_end'
            })

            continue
          }

      // list
          if (cap = this.rules.list.exec(src)) {
            src = src.substring(cap[0].length)
            bull = cap[2]
            isordered = bull.length > 1

            listStart = {
              type: 'list_start',
              ordered: isordered,
              start: isordered ? +bull : '',
              loose: false
            }

            this.tokens.push(listStart)

        // Get each top-level item.
            cap = cap[0].match(this.rules.item)

            listItems = []
            next = false
            l = cap.length
            i = 0

            for (; i < l; i++) {
              item = cap[i]

          // Remove the list item's bullet
          // so it is seen as the next token.
              space = item.length
              item = item.replace(/^ *([*+-]|\d+\.) */, '')

          // Outdent whatever the
          // list item contains. Hacky.
              if (~item.indexOf('\n ')) {
                space -= item.length
                item = !this.options.pedantic
              ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
              : item.replace(/^ {1,4}/gm, '')
              }

          // Determine whether the next list item belongs here.
          // Backpedal if it does not belong in this list.
              if (i !== l - 1) {
                b = block.bullet.exec(cap[i + 1])[0]
                if (bull.length > 1 ? b.length === 1
              : (b.length > 1 || (this.options.smartLists && b !== bull))) {
                  src = cap.slice(i + 1).join('\n') + src
                  i = l - 1
                }
              }

          // Determine whether item is loose or not.
          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
          // for discount behavior.
              loose = next || /\n\n(?!\s*$)/.test(item)
              if (i !== l - 1) {
                next = item.charAt(item.length - 1) === '\n'
                if (!loose) loose = next
              }

              if (loose) {
                listStart.loose = true
              }

          // Check for task list items
              istask = /^\[[ xX]\] /.test(item)
              ischecked = undefined
              if (istask) {
                ischecked = item[1] !== ' '
                item = item.replace(/^\[[ xX]\] +/, '')
              }

              t = {
                type: 'list_item_start',
                task: istask,
                checked: ischecked,
                loose: loose
              }

              listItems.push(t)
              this.tokens.push(t)

          // Recurse.
              this.token(item, false)

              this.tokens.push({
                type: 'list_item_end'
              })
            }

            if (listStart.loose) {
              l = listItems.length
              i = 0
              for (; i < l; i++) {
                listItems[i].loose = true
              }
            }

            this.tokens.push({
              type: 'list_end'
            })

            continue
          }

      // html
          if (cap = this.rules.html.exec(src)) {
            src = src.substring(cap[0].length)
            this.tokens.push({
              type: this.options.sanitize
            ? 'paragraph'
            : 'html',
              pre: !this.options.sanitizer &&
            (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
              text: this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0]
            })
            continue
          }

      // def
          if (top && (cap = this.rules.def.exec(src))) {
            src = src.substring(cap[0].length)
            if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1)
            tag = cap[1].toLowerCase().replace(/\s+/g, ' ')
            if (!this.tokens.links[tag]) {
              this.tokens.links[tag] = {
                href: cap[2],
                title: cap[3]
              }
            }
            continue
          }

      // table (gfm)
          if (cap = this.rules.table.exec(src)) {
            item = {
              type: 'table',
              header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            }

            if (item.header.length === item.align.length) {
              src = src.substring(cap[0].length)

              for (i = 0; i < item.align.length; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right'
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center'
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left'
                } else {
                  item.align[i] = null
                }
              }

              for (i = 0; i < item.cells.length; i++) {
                item.cells[i] = splitCells(
              item.cells[i].replace(/^ *\| *| *\| *$/g, ''),
              item.header.length)
              }

              this.tokens.push(item)

              continue
            }
          }

      // lheading
          if (cap = this.rules.lheading.exec(src)) {
            src = src.substring(cap[0].length)
            this.tokens.push({
              type: 'heading',
              depth: cap[2].charAt(0) === '=' ? 1 : 2,
              text: cap[1]
            })
            continue
          }

      // top-level paragraph
          if (top && (cap = this.rules.paragraph.exec(src))) {
            src = src.substring(cap[0].length)
            this.tokens.push({
              type: 'paragraph',
              text: cap[1].charAt(cap[1].length - 1) === '\n'
            ? cap[1].slice(0, -1)
            : cap[1]
            })
            continue
          }

      // text
          if (cap = this.rules.text.exec(src)) {
        // Top-level should never reach here.
            src = src.substring(cap[0].length)
            this.tokens.push({
              type: 'text',
              text: cap[0]
            })
            continue
          }

          if (src) {
            throw new Error('Infinite loop on byte: ' + src.charCodeAt(0))
          }
        }

        return this.tokens
      };
}
  /***/ },
/* 23 */
  /***/ function (module, exports, __webpack_require__) {
    const Renderer = __webpack_require__(5)
    const Slugger = __webpack_require__(8)
    const InlineLexer = __webpack_require__(9)
    const TextRenderer = __webpack_require__(10)
    const { defaults } = __webpack_require__(2)
    const {
  merge,
  unescape
} = __webpack_require__(0)

/**
 * Parsing & Compiling
 */
    module.exports = class Parser {
      constructor (options) {
        this.tokens = []
        this.token = null
        this.options = options || defaults
        this.options.renderer = this.options.renderer || new Renderer()
        this.renderer = this.options.renderer
        this.renderer.options = this.options
        this.slugger = new Slugger()
      }

  /**
   * Static Parse Method
   */
      static parse (tokens, options) {
        const parser = new Parser(options)
        return parser.parse(tokens)
      };

  /**
   * Parse Loop
   */
      parse (tokens) {
        this.inline = new InlineLexer(tokens.links, this.options)
    // use an InlineLexer with a TextRenderer to extract pure text
        this.inlineText = new InlineLexer(
      tokens.links,
      merge({}, this.options, { renderer: new TextRenderer() })
    )
        this.tokens = tokens.reverse()

        let out = ''
        while (this.next()) {
          out += this.tok()
        }

        return out
      };

  /**
   * Next Token
   */
      next () {
        this.token = this.tokens.pop()
        return this.token
      };

  /**
   * Preview Next Token
   */
      peek () {
        return this.tokens[this.tokens.length - 1] || 0
      };

  /**
   * Parse Text Tokens
   */
      parseText () {
        let body = this.token.text

        while (this.peek().type === 'text') {
          body += '\n' + this.next().text
        }

        return this.inline.output(body)
      };

  /**
   * Parse Current Token
   */
      tok () {
        let body = ''
        switch (this.token.type) {
          case 'space': {
            return ''
          }
          case 'hr': {
            return this.renderer.hr()
          }
          case 'heading': {
            return this.renderer.heading(
          this.inline.output(this.token.text),
          this.token.depth,
          unescape(this.inlineText.output(this.token.text)),
          this.slugger)
          }
          case 'code': {
            return this.renderer.code(this.token.text,
          this.token.lang,
          this.token.escaped)
          }
          case 'table': {
            let header = '',
              i,
              row,
              cell,
              j

        // header
            cell = ''
            for (i = 0; i < this.token.header.length; i++) {
              cell += this.renderer.tablecell(
            this.inline.output(this.token.header[i]),
            { header: true, align: this.token.align[i] }
          )
            }
            header += this.renderer.tablerow(cell)

            for (i = 0; i < this.token.cells.length; i++) {
              row = this.token.cells[i]

              cell = ''
              for (j = 0; j < row.length; j++) {
                cell += this.renderer.tablecell(
              this.inline.output(row[j]),
              { header: false, align: this.token.align[j] }
            )
              }

              body += this.renderer.tablerow(cell)
            }
            return this.renderer.table(header, body)
          }
          case 'blockquote_start': {
            body = ''

            while (this.next().type !== 'blockquote_end') {
              body += this.tok()
            }

            return this.renderer.blockquote(body)
          }
          case 'list_start': {
            body = ''
            const ordered = this.token.ordered,
              start = this.token.start

            while (this.next().type !== 'list_end') {
              body += this.tok()
            }

            return this.renderer.list(body, ordered, start)
          }
          case 'list_item_start': {
            body = ''
            const loose = this.token.loose
            const checked = this.token.checked
            const task = this.token.task

            if (this.token.task) {
              if (loose) {
                if (this.peek().type === 'text') {
                  const nextToken = this.peek()
                  nextToken.text = this.renderer.checkbox(checked) + ' ' + nextToken.text
                } else {
                  this.tokens.push({
                    type: 'text',
                    text: this.renderer.checkbox(checked)
                  })
                }
              } else {
                body += this.renderer.checkbox(checked)
              }
            }

            while (this.next().type !== 'list_item_end') {
              body += !loose && this.token.type === 'text'
            ? this.parseText()
            : this.tok()
            }
            return this.renderer.listitem(body, task, checked)
          }
          case 'html': {
        // TODO parse inline content if parameter markdown=1
            return this.renderer.html(this.token.text)
          }
          case 'paragraph': {
            return this.renderer.paragraph(this.inline.output(this.token.text))
          }
          case 'text': {
            return this.renderer.paragraph(this.parseText())
          }
          default: {
            const errMsg = 'Token with "' + this.token.type + '" type was not found.'
            if (this.options.silent) {
              console.log(errMsg)
            } else {
              throw new Error(errMsg)
            }
          }
        }
      };
}
  /***/ },, /* 24 */,
/* 25 */
/* 26 */
  /***/ function (module, exports) {
/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

    module.exports = function (css) {
  // get current location
      var location = typeof window !== 'undefined' && window.location

      if (!location) {
        throw new Error('fixUrls requires window.location')
      }

	// blank or null?
      if (!css || typeof css !== 'string') {
	  return css
      }

      var baseUrl = location.protocol + '//' + location.host
      var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, '/')

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
      var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function (fullMatch, origUrl) {
		// strip quotes (if they exist)
        var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function (o, $1) { return $1 })
			.replace(/^'(.*)'$/, function (o, $1) { return $1 })

		// already a full url? no change
        if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch
        }

		// convert the url to a full url
        var newUrl

        if (unquotedOrigUrl.indexOf('//') === 0) {
		  	// TODO: should we add protocol?
          newUrl = unquotedOrigUrl
        } else if (unquotedOrigUrl.indexOf('/') === 0) {
			// path should be relative to the base url
          newUrl = baseUrl + unquotedOrigUrl // already starts with '/'
        } else {
			// path should be relative to current directory
          newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, '') // Strip leading './'
        }

		// send back the fixed url(...)
        return 'url(' + JSON.stringify(newUrl) + ')'
      })

	// send back the fixed css
      return fixedCss
    }
  /***/ },, /* 27 */
/* 28 */
  /***/ function (module, exports, __webpack_require__) {
    exports = module.exports = __webpack_require__(11)(false)
// imports

// module
    exports.push([module.i, '/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0}main{display:block}h1{font-size:2em;margin:.67em 0}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace,monospace;font-size:1em}a{background-color:transparent}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}img{border-style:none}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring,button:-moz-focusring{outline:1px dotted ButtonText}fieldset{padding:.35em .75em .625em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details{display:block}summary{display:list-item}[hidden],template{display:none}', ''])

// exports
  /***/ },
/* 29 */
  /***/ function (module, exports, __webpack_require__) {
    exports = module.exports = __webpack_require__(11)(false)
// imports

// module
    exports.push([module.i, '.hljs{display:block;overflow-x:auto;padding:.5em;background:#282a36}.hljs-keyword,.hljs-link,.hljs-literal,.hljs-section,.hljs-selector-tag{color:#8be9fd}.hljs-function .hljs-keyword{color:#ff79c6}.hljs,.hljs-subst{color:#f8f8f2}.hljs-addition,.hljs-attribute,.hljs-bullet,.hljs-name,.hljs-string,.hljs-symbol,.hljs-template-tag,.hljs-template-variable,.hljs-title,.hljs-type,.hljs-variable{color:#f1fa8c}.hljs-comment,.hljs-deletion,.hljs-meta,.hljs-quote{color:#6272a4}.hljs-doctag,.hljs-keyword,.hljs-literal,.hljs-name,.hljs-section,.hljs-selector-tag,.hljs-strong,.hljs-title,.hljs-type{font-weight:700}.hljs-emphasis{font-style:italic}', ''])

// exports
  /***/ },
/* 30 */
  /***/ function (module, exports, __webpack_require__) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

    var stylesInDom = {}

    var	memoize = function (fn) {
      var memo

      return function () {
        if (typeof memo === 'undefined') memo = fn.apply(this, arguments)
        return memo
      }
    }

    var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
      return window && document && document.all && !window.atob
    })

    var getElement = (function (fn) {
      var memo = {}

      return function (selector) {
        if (typeof memo[selector] === 'undefined') {
          memo[selector] = fn.call(this, selector)
        }

        return memo[selector]
      }
    })(function (target) {
      return document.querySelector(target)
    })

    var singleton = null
    var	singletonCounter = 0
    var	stylesInsertedAtTop = []

    var	fixUrls = __webpack_require__(26)

    module.exports = function (list, options) {
      if (typeof DEBUG !== 'undefined' && DEBUG) {
        if (typeof document !== 'object') throw new Error('The style-loader cannot be used in a non-browser environment')
      }

      options = options || {}

      options.attrs = typeof options.attrs === 'object' ? options.attrs : {}

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
      if (!options.singleton) options.singleton = isOldIE()

	// By default, add <style> tags to the <head> element
      if (!options.insertInto) options.insertInto = 'head'

	// By default, add <style> tags to the bottom of the target
      if (!options.insertAt) options.insertAt = 'bottom'

      var styles = listToStyles(list, options)

      addStylesToDom(styles, options)

      return function update (newList) {
        var mayRemove = []

        for (var i = 0; i < styles.length; i++) {
          var item = styles[i]
          var domStyle = stylesInDom[item.id]

          domStyle.refs--
          mayRemove.push(domStyle)
        }

        if (newList) {
          var newStyles = listToStyles(newList, options)
          addStylesToDom(newStyles, options)
        }

        for (var i = 0; i < mayRemove.length; i++) {
          var domStyle = mayRemove[i]

          if (domStyle.refs === 0) {
            for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]()

            delete stylesInDom[domStyle.id]
          }
        }
      }
    }

    function addStylesToDom (styles, options) {
      for (var i = 0; i < styles.length; i++) {
        var item = styles[i]
        var domStyle = stylesInDom[item.id]

        if (domStyle) {
          domStyle.refs++

          for (var j = 0; j < domStyle.parts.length; j++) {
            domStyle.parts[j](item.parts[j])
          }

          for (; j < item.parts.length; j++) {
            domStyle.parts.push(addStyle(item.parts[j], options))
          }
        } else {
          var parts = []

          for (var j = 0; j < item.parts.length; j++) {
            parts.push(addStyle(item.parts[j], options))
          }

          stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts}
        }
      }
    }

    function listToStyles (list, options) {
      var styles = []
      var newStyles = {}

      for (var i = 0; i < list.length; i++) {
        var item = list[i]
        var id = options.base ? item[0] + options.base : item[0]
        var css = item[1]
        var media = item[2]
        var sourceMap = item[3]
        var part = {css: css, media: media, sourceMap: sourceMap}

        if (!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]})
        else newStyles[id].parts.push(part)
      }

      return styles
    }

    function insertStyleElement (options, style) {
      var target = getElement(options.insertInto)

      if (!target) {
        throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.")
      }

      var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1]

      if (options.insertAt === 'top') {
        if (!lastStyleElementInsertedAtTop) {
          target.insertBefore(style, target.firstChild)
        } else if (lastStyleElementInsertedAtTop.nextSibling) {
          target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling)
        } else {
          target.appendChild(style)
        }
        stylesInsertedAtTop.push(style)
      } else if (options.insertAt === 'bottom') {
        target.appendChild(style)
      } else {
        throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.")
      }
    }

    function removeStyleElement (style) {
      if (style.parentNode === null) return false
      style.parentNode.removeChild(style)

      var idx = stylesInsertedAtTop.indexOf(style)
      if (idx >= 0) {
        stylesInsertedAtTop.splice(idx, 1)
      }
    }

    function createStyleElement (options) {
      var style = document.createElement('style')

      options.attrs.type = 'text/css'

      addAttrs(style, options.attrs)
      insertStyleElement(options, style)

      return style
    }

    function createLinkElement (options) {
      var link = document.createElement('link')

      options.attrs.type = 'text/css'
      options.attrs.rel = 'stylesheet'

      addAttrs(link, options.attrs)
      insertStyleElement(options, link)

      return link
    }

    function addAttrs (el, attrs) {
      Object.keys(attrs).forEach(function (key) {
        el.setAttribute(key, attrs[key])
      })
    }

    function addStyle (obj, options) {
      var style, update, remove, result

	// If a transform function was defined, run it on the css
      if (options.transform && obj.css) {
	    result = options.transform(obj.css)

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function () {
	    		// noop
	    	}
	    }
      }

      if (options.singleton) {
        var styleIndex = singletonCounter++

        style = singleton || (singleton = createStyleElement(options))

        update = applyToSingletonTag.bind(null, style, styleIndex, false)
        remove = applyToSingletonTag.bind(null, style, styleIndex, true)
      } else if (
		obj.sourceMap &&
		typeof URL === 'function' &&
		typeof URL.createObjectURL === 'function' &&
		typeof URL.revokeObjectURL === 'function' &&
		typeof Blob === 'function' &&
		typeof btoa === 'function'
	) {
        style = createLinkElement(options)
        update = updateLink.bind(null, style, options)
        remove = function () {
          removeStyleElement(style)

          if (style.href) URL.revokeObjectURL(style.href)
        }
      } else {
        style = createStyleElement(options)
        update = applyToTag.bind(null, style)
        remove = function () {
          removeStyleElement(style)
        }
      }

      update(obj)

      return function updateStyle (newObj) {
        if (newObj) {
          if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
            return
          }

          update(obj = newObj)
        } else {
          remove()
        }
      }
    }

    var replaceText = (function () {
      var textStore = []

      return function (index, replacement) {
        textStore[index] = replacement

        return textStore.filter(Boolean).join('\n')
      }
    })()

    function applyToSingletonTag (style, index, remove, obj) {
      var css = remove ? '' : obj.css

      if (style.styleSheet) {
        style.styleSheet.cssText = replaceText(index, css)
      } else {
        var cssNode = document.createTextNode(css)
        var childNodes = style.childNodes

        if (childNodes[index]) style.removeChild(childNodes[index])

        if (childNodes.length) {
          style.insertBefore(cssNode, childNodes[index])
        } else {
          style.appendChild(cssNode)
        }
      }
    }

    function applyToTag (style, obj) {
      var css = obj.css
      var media = obj.media

      if (media) {
        style.setAttribute('media', media)
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css
      } else {
        while (style.firstChild) {
          style.removeChild(style.firstChild)
        }

        style.appendChild(document.createTextNode(css))
      }
    }

    function updateLink (link, options, obj) {
      var css = obj.css
      var sourceMap = obj.sourceMap

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
      var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap

      if (options.convertToAbsoluteUrls || autoFixUrls) {
        css = fixUrls(css)
      }

      if (sourceMap) {
		// http://stackoverflow.com/a/26603875
        css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
      }

      var blob = new Blob([css], { type: 'text/css' })

      var oldSrc = link.href

      link.href = URL.createObjectURL(blob)

      if (oldSrc) URL.revokeObjectURL(oldSrc)
    }
  /***/ }
])
