// https://d3js.org/d3-queue/ Version 3.0.5. Copyright 2017 Mike Bostock.
!function (t, i) { "object" == typeof exports && "undefined" != typeof module ? i(exports) : "function" == typeof define && define.amd ? define(["exports"], i) : i(t.d3 = t.d3 || {}) }(this, function (t) { "use strict"; function i(t) { if (!(t >= 1)) throw new Error; this._size = t, this._call = this._error = null, this._tasks = [], this._data = [], this._waiting = this._active = this._ended = this._start = 0 } function n(t) { if (!t._start) try { r(t) } catch (i) { if (t._tasks[t._ended + t._active - 1]) a(t, i); else if (!t._data) throw i } } function r(t) { for (; t._start = t._waiting && t._active < t._size;) { var i = t._ended + t._active, n = t._tasks[i], r = n.length - 1, a = n[r]; n[r] = e(t, i), --t._waiting, ++t._active, n = a.apply(null, n), t._tasks[i] && (t._tasks[i] = n || c) } } function e(t, i) { return function (r, e) { t._tasks[i] && (--t._active, ++t._ended, t._tasks[i] = null, null == t._error && (null != r ? a(t, r) : (t._data[i] = e, t._waiting ? n(t) : s(t)))) } } function a(t, i) { var n, r = t._tasks.length; for (t._error = i, t._data = void 0, t._waiting = NaN; --r >= 0;)if ((n = t._tasks[r]) && (t._tasks[r] = null, n.abort)) try { n.abort() } catch (t) { } t._active = NaN, s(t) } function s(t) { if (!t._active && t._call) { var i = t._data; t._data = void 0, t._call(t._error, i) } } function o(t) { return new i(arguments.length ? +t : 1 / 0) } var _ = [].slice, c = {}; i.prototype = o.prototype = { constructor: i, defer: function (t) { if ("function" != typeof t || this._call) throw new Error; if (null != this._error) return this; var i = _.call(arguments, 1); return i.push(t), ++this._waiting, this._tasks.push(i), n(this), this }, abort: function () { return null == this._error && a(this, new Error("abort")), this }, await: function (t) { if ("function" != typeof t || this._call) throw new Error; return this._call = function (i, n) { t.apply(null, [i].concat(n)) }, s(this), this }, awaitAll: function (t) { if ("function" != typeof t || this._call) throw new Error; return this._call = t, s(this), this } }, t.queue = o, Object.defineProperty(t, "__esModule", { value: !0 }) });