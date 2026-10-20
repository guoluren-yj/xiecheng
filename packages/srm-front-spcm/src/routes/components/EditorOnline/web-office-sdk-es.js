/* eslint-disable */
var e = function () {
  return (e =
    Object.assign ||
    function (e) {
      for (var t, n = 1, r = arguments.length; n < r; n++)
        for (var a in (t = arguments[n]))
          Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
      return e;
    }).apply(this, arguments);
};
function t(e, t, n, r) {
  return new (n || (n = Promise))(function (a, i) {
    function o(e) {
      try {
        c(r.next(e));
      } catch (e) {
        i(e);
      }
    }
    function s(e) {
      try {
        c(r.throw(e));
      } catch (e) {
        i(e);
      }
    }
    function c(e) {
      var t;
      e.done
        ? a(e.value)
        : ((t = e.value),
          t instanceof n
            ? t
            : new n(function (e) {
                e(t);
              })).then(o, s);
    }
    c((r = r.apply(e, t || [])).next());
  });
}
function n(e, t) {
  var n,
    r,
    a,
    i,
    o = {
      label: 0,
      sent: function () {
        if (1 & a[0]) throw a[1];
        return a[1];
      },
      trys: [],
      ops: [],
    };
  return (
    (i = { next: s(0), throw: s(1), return: s(2) }),
    'function' == typeof Symbol &&
      (i[Symbol.iterator] = function () {
        return this;
      }),
    i
  );
  function s(i) {
    return function (s) {
      return (function (i) {
        if (n) throw new TypeError('Generator is already executing.');
        for (; o; )
          try {
            if (
              ((n = 1),
              r &&
                (a =
                  2 & i[0]
                    ? r.return
                    : i[0]
                    ? r.throw || ((a = r.return) && a.call(r), 0)
                    : r.next) &&
                !(a = a.call(r, i[1])).done)
            )
              return a;
            switch (((r = 0), a && (i = [2 & i[0], a.value]), i[0])) {
              case 0:
              case 1:
                a = i;
                break;
              case 4:
                return o.label++, { value: i[1], done: !1 };
              case 5:
                o.label++, (r = i[1]), (i = [0]);
                continue;
              case 7:
                (i = o.ops.pop()), o.trys.pop();
                continue;
              default:
                if (
                  !(a = (a = o.trys).length > 0 && a[a.length - 1]) &&
                  (6 === i[0] || 2 === i[0])
                ) {
                  o = 0;
                  continue;
                }
                if (3 === i[0] && (!a || (i[1] > a[0] && i[1] < a[3]))) {
                  o.label = i[1];
                  break;
                }
                if (6 === i[0] && o.label < a[1]) {
                  (o.label = a[1]), (a = i);
                  break;
                }
                if (a && o.label < a[2]) {
                  (o.label = a[2]), o.ops.push(i);
                  break;
                }
                a[2] && o.ops.pop(), o.trys.pop();
                continue;
            }
            i = t.call(e, o);
          } catch (e) {
            (i = [6, e]), (r = 0);
          } finally {
            n = a = 0;
          }
        if (5 & i[0]) throw i[1];
        return { value: i[0] ? i[1] : void 0, done: !0 };
      })([i, s]);
    };
  }
}
var r = (function () {
  function e() {}
  return (
    (e.add = function (t) {
      e.HANDLE_LIST.push(t), window.addEventListener('message', t, !1);
    }),
    (e.remove = function (t) {
      var n = e.HANDLE_LIST.indexOf(t);
      n >= 0 && e.HANDLE_LIST.splice(n, 1), window.removeEventListener('message', t, !1);
    }),
    (e.empty = function () {
      for (; e.HANDLE_LIST.length; )
        window.removeEventListener('message', e.HANDLE_LIST.shift(), !1);
    }),
    (e.parse = function (e) {
      try {
        return 'object' == typeof e ? e : e ? JSON.parse(e) : e;
      } catch (t) {
        return e;
      }
    }),
    (e.HANDLE_LIST = []),
    e
  );
})();
function a(e) {
  return '[object Function]' === {}.toString.call(e);
}
var i,
  o,
  s,
  c,
  u = { origin: '' };
function l(e) {
  return u[e];
}
function d(e) {
  return l('origin') !== e.origin && (console.error('postMessage 域名检查不通过'), !0);
}
!(function (e) {
  (e.unknown = 'unknown'),
    (e.spreadsheet = 's'),
    (e.writer = 'w'),
    (e.presentation = 'p'),
    (e.pdf = 'f');
})(i || (i = {})),
  (function (e) {
    (e.wps = 'w'), (e.et = 's'), (e.presentation = 'p'), (e.pdf = 'f');
  })(o || (o = {})),
  (function (e) {
    (e.nomal = 'nomal'), (e.simple = 'simple');
  })(s || (s = {})),
  (function (e) {
    (e[(e.requestFullscreen = 1)] = 'requestFullscreen'),
      (e[(e.exitFullscreen = 0)] = 'exitFullscreen');
  })(c || (c = {}));
var p,
  f,
  v =
    ((p = 0),
    function () {
      return (p += 1);
    }),
  b = function (e, t, n) {
    void 0 === n && (n = !0);
    var r = t;
    if (!f) {
      var a = function (e) {
        f.style.cssText += 'height: ' + e.clientHeight + 'px; width: ' + e.clientWidth + 'px';
      }.bind(null, r);
      (f = document.createElement('iframe')).classList.add('web-office-iframe');
      var i = {
        id: 'office-iframe',
        src: e,
        scrolling: 'no',
        frameborder: '0',
        allowfullscreen: 'allowfullscreen',
        webkitallowfullscreen: 'true',
        mozallowfullscreen: 'true',
      };
      for (var o in (r
        ? ((i.style = 'width: ' + r.clientWidth + 'px; height: ' + r.clientHeight + 'px;'),
          n && window.addEventListener('resize', a))
        : ((r = document.createElement('div')).classList.add('web-office-default-container'),
          (function (e) {
            var t = document.createElement('style');
            document.head.appendChild(t);
            var n = t.sheet;
            n.insertRule(e, n.cssRules.length);
          })(
            '.web-office-default-container {position: absolute; padding: 0;  margin: 0; width: 100vw; height: 100vh; left: 0; top: 0;}'
          ),
          document.body.appendChild(r),
          (i.style = 'width: 100vw; height: 100vh;')),
      i))
        f.setAttribute(o, i[o]);
      r.appendChild(f),
        (f.destroy = function () {
          f.parentNode.removeChild(f), (f = null), window.removeEventListener('resize', a);
        });
    }
    return f;
  };
var h = function (e) {
  var t = ['isParentFullscreen'];
  if ('setConfig' === e.eventName) {
    var n = e.data.commonOptions;
    for (var r in n) t.includes(r) && (n[r] = void 0);
    e.data.commonOptions = n;
  }
  b().contentWindow?.postMessage(JSON.stringify(e), l('origin'));
};
function m(e, t, n) {
  return new Promise(function (a) {
    var i = v(),
      o = function (e) {
        if (!d(e)) {
          var t = r.parse(e.data);
          t.eventName === n && t.msgId === i && (a(t.data), r.remove(o));
        }
      };
    r.add(o), h({ data: e, msgId: i, eventName: t });
  });
}
var g = function (e) {
    return m(e, 'wps.jssdk.api', 'wps.api.reply');
  },
  w = function (e) {
    return m(e, 'api.basic', 'api.basic.reply');
  },
  y = { idMap: {} };
function k(e) {
  return t(this, void 0, void 0, function () {
    var t, a, i, o, s, c, u, l, p, f;
    return n(this, function (n) {
      switch (n.label) {
        case 0:
          return d(e)
            ? [2]
            : ((t = r.parse(e.data)),
              (a = t.eventName),
              (i = t.callbackId),
              (o = t.data),
              i && (s = y.idMap[i])
                ? ((c = s.split(':')),
                  (u = c[0]),
                  (l = c[1]),
                  'api.callback' === a && y[u] && y[u][l]
                    ? [4, (f = y[u][l]).callback.apply(f, o.args)]
                    : [3, 2])
                : [3, 2]);
        case 1:
          (p = n.sent()),
            h({ result: p, callbackId: i, eventName: 'api.callback.reply' }),
            (n.label = 2);
        case 2:
          return [2];
      }
    });
  });
}
var j = function (e) {
    return t(void 0, void 0, void 0, function () {
      function t() {
        return Object.keys(y.idMap).find(function (e) {
          return y.idMap[e] === i + ':' + a;
        });
      }
      var a, i, o, s, c, u, l, d, p;
      return n(this, function (n) {
        switch (n.label) {
          case 0:
            return (a = e.prop), (i = e.parentObjId), [4, O([(o = e.value)])];
          case 1:
            return (
              (s = n.sent()),
              (c = s[0]),
              (u = s[1]),
              (e.value = c[0]),
              (l = Object.keys(u)[0]),
              (d = y[i]),
              null === o &&
                d &&
                d[a] &&
                ((p = t()) && delete y.idMap[p],
                delete d[a],
                Object.keys(d).length || delete y[i],
                Object.keys(y.idMap).length || r.remove(k)),
              l &&
                (Object.keys(y.idMap).length || r.add(k),
                y[i] || (y[i] = {}),
                (y[i][a] = { callbackId: l, callback: u[l] }),
                (p = t()) && delete y.idMap[p],
                (y.idMap[l] = i + ':' + a)),
              [2]
            );
        }
      });
    });
  },
  I = function (a, i, o, s) {
    return t(void 0, void 0, void 0, function () {
      var c, u, l, p, f, b, m, g;
      return n(this, function (w) {
        switch (w.label) {
          case 0:
            return (
              (c = v()),
              (p = new Promise(function (e, t) {
                (u = e), (l = t);
              })),
              (f = {}),
              i.args ? [4, O(i.args)] : [3, 2]
            );
          case 1:
            (b = w.sent()), (m = b[0]), (g = b[1]), (i.args = m), (f = g), (w.label = 2);
          case 2:
            return 'api.setter' !== a ? [3, 4] : [4, j(i)];
          case 3:
            w.sent(), (w.label = 4);
          case 4:
            return (
              (function (t) {
                var n = t[0],
                  r = t[1];
                'function' == typeof (n = e({}, n)).data && (n.data = n.data());
                r(), h(n);
              })([
                { eventName: a, data: i, msgId: c },
                function () {
                  var e = this,
                    i = function (p) {
                      return t(e, void 0, void 0, function () {
                        var e, t, v;
                        return n(this, function (n) {
                          switch (n.label) {
                            case 0:
                              return d(p)
                                ? [2]
                                : 'api.callback' === (e = r.parse(p.data)).eventName &&
                                  e.callbackId &&
                                  f[e.callbackId]
                                ? [4, f[e.callbackId].apply(f, e.data.args)]
                                : [3, 2];
                            case 1:
                              (t = n.sent()),
                                h({
                                  result: t,
                                  eventName: 'api.callback.reply',
                                  callbackId: e.callbackId,
                                }),
                                (n.label = 2);
                            case 2:
                              return (
                                e.eventName === a + '.reply' &&
                                  e.msgId === c &&
                                  (e.error
                                    ? (((v = new Error('')).stack = e.error + '\n' + o),
                                      s && s(),
                                      l(v))
                                    : u(e.result),
                                  r.remove(i)),
                                [2]
                              );
                          }
                        });
                      });
                    };
                  return r.add(i), p;
                },
              ]),
              [2, p]
            );
        }
      });
    });
  };
function O(e) {
  return t(this, void 0, void 0, function () {
    var t, r, a, i, o, s, c, u, l, d, p;
    return n(this, function (n) {
      switch (n.label) {
        case 0:
          (t = {}), (r = []), (a = e.slice(0)), (n.label = 1);
        case 1:
          return a.length ? ((i = void 0), [4, a.shift()]) : [3, 13];
        case 2:
          return (o = n.sent()) && o.done ? [4, o.done()] : [3, 4];
        case 3:
          n.sent(), (n.label = 4);
        case 4:
          if (
            !(function (e) {
              if (!e) return !1;
              for (var t = e; null !== Object.getPrototypeOf(t); ) t = Object.getPrototypeOf(t);
              return Object.getPrototypeOf(e) === t;
            })(i)
          )
            return [3, 11];
          for (c in ((i = {}), (s = []), o)) s.push(c);
          (u = 0), (n.label = 5);
        case 5:
          return u < s.length
            ? ((l = s[u]),
              (d = o[l]),
              /^[A-Z]/.test(l) ? (d && d.done ? [4, d.done()] : [3, 7]) : [3, 8])
            : [3, 10];
        case 6:
          n.sent(), (n.label = 7);
        case 7:
          d && d.objId
            ? (d = { objId: d.objId })
            : 'function' == typeof d && ((p = v()), (t[p] = d), (d = { callbackId: p })),
            (n.label = 8);
        case 8:
          (i[l] = d), (n.label = 9);
        case 9:
          return u++, [3, 5];
        case 10:
          return [3, 12];
        case 11:
          o && o.objId
            ? (i = { objId: o.objId })
            : 'function' == typeof o && void 0 === o.objId
            ? ((p = v()), (t[p] = o), (i = { callbackId: p }))
            : (i = o),
            (n.label = 12);
        case 12:
          return r.push(i), [3, 1];
        case 13:
          return [2, [r, t]];
      }
    });
  });
}
var x = function (t, n) {
    void 0 === n && (n = !0);
    var r = e({}, t),
      a = r.headers,
      i = void 0 === a ? {} : a,
      o = r.subscriptions,
      c = void 0 === o ? {} : o,
      u = r.mode,
      l = void 0 === u ? s.nomal : u,
      d = r.commonOptions,
      p = i.backBtn,
      f = void 0 === p ? {} : p,
      v = i.shareBtn,
      b = void 0 === v ? {} : v,
      h = i.otherMenuBtn,
      m = void 0 === h ? {} : h,
      g = function (e, t) {
        e.subscribe &&
          'function' == typeof e.subscribe &&
          ((e.callback = t), (c[t] = e.subscribe), n && delete e.subscribe);
      };
    if (
      (g(f, 'wpsconfig_back_btn'),
      g(b, 'wpsconfig_share_btn'),
      g(m, 'wpsconfig_other_menu_btn'),
      m.items && Array.isArray(m.items))
    ) {
      var w = [];
      m.items.forEach(function (e, t) {
        switch ((void 0 === e && (e = {}), e.type)) {
          case 'export_img':
            (e.type = 1), (e.callback = 'export_img');
            break;
          case 'export_pdf':
            (e.type = 1), (e.callback = 'export_pdf');
            break;
          case 'save_version':
            (e.type = 1), (e.callback = 'save_version');
            break;
          case 'about_wps':
            (e.type = 1), (e.callback = 'about_wps');
            break;
          case 'split_line':
            e.type = 2;
            break;
          case 'custom':
            (e.type = 3), g(e, 'wpsconfig_other_menu_btn_' + t), w.push(e);
        }
      }),
        w.length && (E || T) && (m.items = w);
    }
    r.url = r.url || r.wpsUrl;
    var y = [];
    if (
      ((l === s.simple || (d && !1 === d.isShowTopArea)) && y.push('simple', 'hidecmb'),
      r.debug && y.push('debugger'),
      r.url && y.length && (r.url = r.url + (r.url.indexOf('?') >= 0 ? '&' : '?') + y.join('&')),
      d &&
        (d.isParentFullscreen || d.isBrowserViewFullscreen) &&
        (document.addEventListener('fullscreenchange', N),
        document.addEventListener('webkitfullscreenchange', N),
        document.addEventListener('mozfullscreenchange', N)),
      r.wordOptions && (r.wpsOptions = r.wordOptions),
      r.excelOptions && (r.etOptions = r.excelOptions),
      r.pptOptions && (r.wppOptions = r.pptOptions),
      'object' == typeof c.print)
    ) {
      var k = 'wpsconfig_print';
      'function' == typeof c.print.subscribe &&
        ((c[k] = c.print.subscribe),
        (r.print = { callback: k }),
        void 0 !== c.print.custom && (r.print.custom = c.print.custom)),
        delete c.print;
    }
    'function' == typeof c.exportPdf &&
      ((c[(k = 'wpsconfig_export_pdf')] = c.exportPdf),
      (r.exportPdf = { callback: k }),
      delete c.exportPdf);
    return r.commandBars && C(r.commandBars, !1), e(e({}, r), { subscriptions: c });
  },
  _ = function (e) {
    void 0 === e && (e = '');
    var t = '';
    if (!t && e) {
      var n = e.toLowerCase();
      -1 !== n.indexOf('/office/s/') && (t = i.spreadsheet),
        -1 !== n.indexOf('/office/w/') && (t = i.writer),
        -1 !== n.indexOf('/office/p/') && (t = i.presentation),
        -1 !== n.indexOf('/office/f/') && (t = i.pdf);
    }
    if (!t) {
      var r = e.match(/[\?&]type=([a-z]+)/) || [];
      t = o[r[1]] || '';
    }
    return t;
  };
function C(e, t) {
  void 0 === t && (t = !0);
  var n = e.map(function (e) {
    var t = e.attributes;
    if (!Array.isArray(t)) {
      var n = [];
      for (var r in t)
        if (t.hasOwnProperty(r)) {
          var a = { name: r, value: t[r] };
          n.push(a);
        }
      e.attributes = n;
    }
    return e;
  });
  return t && h({ data: n, eventName: 'setCommandBars' }), n;
}
var S = window.navigator.userAgent.toLowerCase(),
  E = /Android|webOS|iPhone|iPod|BlackBerry|iPad/i.test(S),
  T = (function () {
    try {
      return -1 !== window._parent.location.search.indexOf('from=wxminiprogram');
    } catch (e) {
      return !1;
    }
  })();
function N() {
  var e = { status: c.requestFullscreen },
    t = document,
    n = t.fullscreenElement || t.webkitFullscreenElement || t.mozFullScreenElement;
  (e.status = n ? c.requestFullscreen : c.exitFullscreen),
    h({ data: e, eventName: 'fullscreenchange' });
}
var P = 0,
  F = new Set();
function L(e) {
  return (
    (P += 1),
    !e &&
      (function (e) {
        F.forEach(function (t) {
          return t(e);
        });
      })(P),
    P
  );
}
function A() {
  var e = new Error('');
  return (e.stack || e.message || '').split('\n').slice(2).join('\n');
}
function D(a, o) {
  var s,
    c = this,
    u = o.Events,
    l = o.Enum,
    p = o.Props,
    f = p[0],
    v = p[1],
    b = { objId: P };
  switch (
    ((function t(n, r, a) {
      var i = r.slice(0);
      var o = function () {
        var r = i.shift();
        !r.alias && ~B.indexOf(r.prop) && i.push(e(e({}, r), { alias: r.prop + 'Async' })),
          Object.defineProperty(n, r.alias || r.prop, {
            get: function () {
              var i = this,
                o = 1 === r.cache,
                s = o && this['__' + r.prop + 'CacheValue'];
              if (!s) {
                var c = A(),
                  u = L(o),
                  l = function () {
                    for (var t, i = [], o = 0; o < arguments.length; o++) i[o] = arguments[o];
                    void 0 !== r.caller
                      ? (function t(n, r, a) {
                          var i = r.slice(0);
                          var o = function () {
                            var r = i.shift();
                            !r.alias &&
                              ~B.indexOf(r.prop) &&
                              i.push(e(e({}, r), { alias: r.prop + 'Async' })),
                              Object.defineProperty(n, r.alias || r.prop, {
                                get: function () {
                                  var e = this,
                                    i = 1 === r.cache,
                                    o = i && this['__' + r.prop + 'CacheValue'];
                                  if (!o) {
                                    var s = A(),
                                      c = L(i),
                                      u = function () {
                                        for (var e, i = [], o = 0; o < arguments.length; o++)
                                          i[o] = arguments[o];
                                        void 0 !== r.caller
                                          ? t((e = { objId: L() }), a[r.caller], a)
                                          : (e = {});
                                        return (
                                          H(
                                            u,
                                            e,
                                            'api.caller',
                                            {
                                              obj: u,
                                              args: i,
                                              parentObjId: n.objId,
                                              objId: e.objId,
                                              prop: r.prop,
                                            },
                                            s
                                          ),
                                          e
                                        );
                                      };
                                    return (
                                      (u.objId = -1),
                                      void 0 !== r.getter && ((u.objId = c), t(u, a[r.getter], a)),
                                      H(
                                        n,
                                        u,
                                        'api.getter',
                                        { parentObjId: n.objId, objId: u.objId, prop: r.prop },
                                        s,
                                        function () {
                                          delete e['__' + r.prop + 'CacheValue'];
                                        }
                                      ),
                                      i && (this['__' + r.prop + 'CacheValue'] = u),
                                      u
                                    );
                                  }
                                  return o;
                                },
                                set: function (e) {
                                  var t = A();
                                  return H(
                                    n,
                                    {},
                                    'api.setter',
                                    { value: e, parentObjId: n.objId, objId: -1, prop: r.prop },
                                    t
                                  );
                                },
                              });
                          };
                          for (; i.length; ) o();
                        })((t = { objId: L() }), a[r.caller], a)
                      : (t = {});
                    return (
                      H(
                        l,
                        t,
                        'api.caller',
                        { obj: l, args: i, parentObjId: n.objId, objId: t.objId, prop: r.prop },
                        c
                      ),
                      t
                    );
                  };
                return (
                  (l.objId = -1),
                  void 0 !== r.getter && ((l.objId = u), t(l, a[r.getter], a)),
                  H(
                    n,
                    l,
                    'api.getter',
                    { parentObjId: n.objId, objId: l.objId, prop: r.prop },
                    c,
                    function () {
                      delete i['__' + r.prop + 'CacheValue'];
                    }
                  ),
                  o && (this['__' + r.prop + 'CacheValue'] = l),
                  l
                );
              }
              return s;
            },
            set: function (e) {
              var t = A();
              return H(
                n,
                {},
                'api.setter',
                { value: e, parentObjId: n.objId, objId: -1, prop: r.prop },
                t
              );
            },
          });
      };
      for (; i.length; ) o();
    })(b, f, v),
    (b.Events = u),
    (b.Enum = l),
    (a.Enum = b.Enum),
    (a.Events = b.Events),
    (a.Props = p),
    _(a.url))
  ) {
    case i.writer:
      a.WordApplication = a.WpsApplication = function () {
        return b;
      };
      break;
    case i.spreadsheet:
      a.ExcelApplication = a.EtApplication = function () {
        return b;
      };
      break;
    case i.presentation:
      a.PPTApplication = a.WppApplication = function () {
        return b;
      };
      break;
    case i.pdf:
      a.PDFApplication = function () {
        return b;
      };
  }
  (a.Application = b),
    (a.Free = function (e) {
      return I('api.free', { objId: e }, '');
    }),
    (a.Stack = b.Stack =
      ((s = function (e) {
        a && a.Free(e);
      }),
      function () {
        var e = [],
          t = function (t) {
            e.push(t);
          };
        return (
          F.add(t),
          {
            End: function () {
              s(e), F.delete(t);
            },
          }
        );
      }));
  var m = {};
  r.add(function (e) {
    return t(c, void 0, void 0, function () {
      var t, a, i, o, s;
      return n(this, function (n) {
        switch (n.label) {
          case 0:
            return d(e)
              ? [2]
              : 'api.event' === (t = r.parse(e.data)).eventName && t.data
              ? ((a = t.data), (i = a.eventName), (o = a.data), (s = m[i]) ? [4, s(o)] : [3, 2])
              : [3, 2];
          case 1:
            n.sent(), (n.label = 2);
          case 2:
            return [2];
        }
      });
    });
  }),
    (b.Sub = {});
  var g = function (e) {
    var t = u[e];
    Object.defineProperty(b.Sub, t, {
      set: function (e) {
        (m[t] = e),
          h({
            eventName: 'api.event.register',
            data: { eventName: t, register: !!e, objId: (P += 1) },
          });
      },
    });
  };
  for (var w in u) g(w);
}
var B = [
  'ExportAsFixedFormat',
  'GetOperatorsInfo',
  'ImportDataIntoFields',
  'ReplaceText',
  'ReplaceBookmark',
  'GetBookmarkText',
  'GetComments',
];
function V(t, n, r) {
  var a = n.slice(0);
  var i = function () {
    var n = a.shift();
    if (!n.alias && ~B.indexOf(n.prop)) {
      a.push(e(e({}, n), { alias: n.prop + 'Async' }));
    }
    Object.defineProperty(t, n.alias || n.prop, {
      get: function () {
        var e = this;
        var a = n.cache === 1;
        var i = a && this['__' + n.prop + 'CacheValue'];
        if (!i) {
          var o = A();
          var s = L(a);
          var c = function () {
            for (var e = [], a = 0, i; a < arguments.length; a++) {
              e[a] = arguments[a];
            }
            if (n.caller !== undefined) {
              i = { objId: L() };
              V(i, r[n.caller], r);
            } else {
              i = {};
            }
            return (
              H(
                u,
                i,
                'api.caller',
                { obj: u, args: e, parentObjId: t.objId, objId: i.objId, prop: n.prop },
                o
              ),
              i
            );
          };
          var u = c;
          u.objId = -1;
          if (n.getter !== undefined) {
            u.objId = s;
            V(u, r[n.getter], r);
          }
          H(
            t,
            u,
            'api.getter',
            { parentObjId: t.objId, objId: u.objId, prop: n.prop },
            o,
            function () {
              delete e['__' + n.prop + 'CacheValue'];
            }
          );
          if (a) {
            this['__' + n.prop + 'CacheValue'] = u;
          }
          return u;
        }
        return i;
      },
      set: function (e) {
        var r = A();
        return H(
          t,
          {},
          'api.setter',
          { value: e, parentObjId: t.objId, objId: -1, prop: n.prop },
          r
        );
      },
    });
  };
  while (a.length) {
    i();
  }
}
function H(e, t, n, r, a, i) {
  var o,
    s = (e.done ? e.done() : Promise.resolve()).then(function () {
      return o || (o = I(n, r, a, i)), o;
    });
  (t.done = function () {
    return s;
  }),
    (t.then = function (e, n) {
      return r.objId >= 0
        ? ((t.then = null),
          (t.catch = null),
          s
            .then(function () {
              e(t);
            })
            .catch(function (e) {
              return n(e);
            }))
        : s.then(e, n);
    }),
    (t.catch = function (e) {
      return s.catch(e);
    }),
    (t.Destroy = function () {
      return I('api.free', { objId: t.objId }, '');
    });
}
var M = null,
  R = {
    fileOpen: 'fileOpen',
    tabSwitch: 'tabSwitch',
    fileSaved: 'fileSaved',
    fileStatus: 'fileStatus',
    fullscreenChange: 'fullscreenChange',
    error: 'error',
    stage: 'stage',
  },
  W = {
    getToken: 'api.getToken',
    onToast: 'event.toast',
    onHyperLinkOpen: 'event.hyperLinkOpen',
    getClipboardData: 'api.getClipboardData',
  };
function z(a, i, o, s, c, u, l) {
  var p = this;
  void 0 === o && (o = {});
  r.add(function (f) {
    return t(p, void 0, void 0, function () {
      var t, p, v, b, m, g, w, y, k, j, I, O, x, _, C, S, E, T, N;
      return n(this, function (n) {
        switch (n.label) {
          case 0:
            return d(f)
              ? [2]
              : ((t = r.parse(f.data)),
                (p = t.eventName),
                (v = void 0 === p ? '' : p),
                (b = t.data),
                (m = void 0 === b ? null : b),
                (g = t.url),
                (w = void 0 === g ? null : g),
                -1 !== ['wps.jssdk.api'].indexOf(v)
                  ? [2]
                  : 'ready' !== v
                  ? [3, 1]
                  : (h({ eventName: 'setConfig', data: e(e({}, o), { version: a.version }) }),
                    a.tokenData &&
                      a.setToken(
                        e(e({}, a.tokenData), { hasRefreshTokenConfig: !!o.refreshToken })
                      ),
                    c.apiReadySended && h({ eventName: 'api.ready' }),
                    (a.iframeReady = !0),
                    [3, 17]));
          case 1:
            return 'error' !== v ? [3, 2] : (i.emit(R.error, m), [3, 17]);
          case 2:
            return 'open.result' !== v
              ? [3, 3]
              : (void 0 !==
                  (null === (E = null == m ? void 0 : m.fileInfo) || void 0 === E
                    ? void 0
                    : E.officeVersion) &&
                  ((a.mainVersion = m.fileInfo.officeVersion),
                  console.log('WebOfficeSDK Main Version: V' + a.mainVersion)),
                i.emit(R.fileOpen, m),
                [3, 17]);
          case 3:
            return 'file.saved' !== v
              ? [3, 4]
              : (i.emit(R.fileStatus, m), i.emit(R.fileSaved, m), [3, 17]);
          case 4:
            return 'tab.switch' !== v ? [3, 5] : (i.emit(R.tabSwitch, m), [3, 17]);
          case 5:
            return 'api.scroll' !== v ? [3, 6] : (window.scrollTo(m.x, m.y), [3, 17]);
          case 6:
            if (v !== W.getToken) return [3, 11];
            (y = { token: !1 }), (n.label = 7);
          case 7:
            return n.trys.push([7, 9, , 10]), [4, c.refreshToken()];
          case 8:
            return (y = n.sent()), [3, 10];
          case 9:
            return (k = n.sent()), console.error('refreshToken: ' + (k || 'fail to get')), [3, 10];
          case 10:
            return h({ eventName: W.getToken + '.reply', data: y }), [3, 17];
          case 11:
            if (v !== W.getClipboardData) return [3, 16];
            (j = { text: '', html: '' }), (n.label = 12);
          case 12:
            return n.trys.push([12, 14, , 15]), [4, c.getClipboardData()];
          case 13:
            return (j = n.sent()), [3, 15];
          case 14:
            return (
              (I = n.sent()), console.error('getClipboardData: ' + (I || 'fail to get')), [3, 15]
            );
          case 15:
            return h({ eventName: W.getClipboardData + '.reply', data: j }), [3, 17];
          case 16:
            v === W.onToast
              ? c.onToast(m)
              : v === W.onHyperLinkOpen
              ? c.onHyperLinkOpen(m)
              : 'stage' === v
              ? i.emit(R.stage, m)
              : 'event.callback' === v
              ? ((O = m.eventName),
                (x = m.data),
                (_ = O),
                'fullScreenChange' === O && (_ = R.fullscreenChange),
                ((null === (T = o.commonOptions) || void 0 === T
                  ? void 0
                  : T.isBrowserViewFullscreen) ||
                  (null === (N = o.commonOptions) || void 0 === N
                    ? void 0
                    : N.isParentFullscreen)) &&
                'fullscreenchange' === _
                  ? ((C = x.status),
                    (S = x.isDispatchEvent),
                    o.commonOptions.isBrowserViewFullscreen
                      ? (function (e, t, n, r) {
                          0 === e
                            ? (t.style =
                                'position: static; width: ' + n.width + '; height: ' + n.height)
                            : 1 === e &&
                              (t.style = 'position: absolute; width: 100%; height: 100%'),
                            r &&
                              (function (e) {
                                ['fullscreen', 'fullscreenElement'].forEach(function (t) {
                                  Object.defineProperty(document, t, {
                                    get: function () {
                                      return !!e.status;
                                    },
                                    configurable: !0,
                                  });
                                });
                                var t = new CustomEvent('fullscreenchange');
                                document?.dispatchEvent(t);
                              })({ status: e });
                        })(C, u, l, S)
                      : o.commonOptions.isParentFullscreen &&
                        (function (e, t, n) {
                          var r = n.mount && 1 === n.mount.nodeType ? n.mount : t;
                          if (0 === e) {
                            var a = document,
                              i =
                                a.exitFullscreen ||
                                a.mozCancelFullScreen ||
                                a.msExitFullscreen ||
                                a.webkitCancelFullScreen ||
                                a.webkitExitFullscreen;
                            i.call(document);
                          } else if (1 === e) {
                            var o =
                              r.requestFullscreen ||
                              r.mozRequestFullScreen ||
                              r.msRequestFullscreen ||
                              r.webkitRequestFullscreen;
                            o.call(r);
                          }
                        })(C, u, o.commonOptions.isParentFullscreen),
                    i.emit(_, x))
                  : i.emit(_, x))
              : 'api.ready' === v && D(a, m),
              (n.label = 17);
          case 17:
            return 'function' == typeof s[v] && s[v](a, w || m), [2];
        }
      });
    });
  });
}
function q(e) {
  return new Promise(function (t) {
    var n = function (a) {
      d(a) || (r.parse(a.data).eventName === e && (t(), r.remove(n)));
    };
    r.add(n);
  });
}
function G(e) {
  void 0 === e && (e = {}), M && M.destroy();
  try {
    var i = x(e),
      o = i.subscriptions,
      s = void 0 === o ? {} : o,
      c = i.mount,
      l = void 0 === c ? null : c,
      d = i.url,
      p = i.refreshToken,
      f = i.onToast,
      v = i.onHyperLinkOpen,
      m = i.getClipboardData;
    (T = 'origin'), (L = (d.match(/https*:\/\/[^\/]+/g) || [])[0]), (u[T] = L);
    var y = b(d, l),
      k = q('ready'),
      j = q('open.result'),
      I = q('api.ready'),
      O = l
        ? { width: l.clientWidth + 'px', height: l.clientHeight + 'px' }
        : { width: '100vw', height: '100vh' };
    delete i.mount, d && delete i.url, delete i.subscriptions;
    var _ =
        ((E = E || Object.create(null)),
        {
          on: function (e, t) {
            (E[e] || (E[e] = [])).push(t);
          },
          off: function (e, t) {
            E[e] && E[e].splice(E[e].indexOf(t) >>> 0, 1);
          },
          emit: function (e, t) {
            (E[e] || []).slice().map(function (e) {
              e(t);
            }),
              (E['*'] || []).slice().map(function (n) {
                n(e, t);
              });
          },
        }),
      S = { apiReadySended: !1 };
    return (
      (M = {
        url: d,
        iframe: y,
        version: '1.1.12',
        iframeReady: !1,
        tokenData: null,
        commandBars: null,
        tabs: {
          getTabs: function () {
            return t(this, void 0, void 0, function () {
              return n(this, function (e) {
                switch (e.label) {
                  case 0:
                    return [4, k];
                  case 1:
                    return e.sent(), [2, w({ api: 'tab.getTabs' })];
                }
              });
            });
          },
          switchTab: function (e) {
            return t(this, void 0, void 0, function () {
              return n(this, function (t) {
                switch (t.label) {
                  case 0:
                    return [4, k];
                  case 1:
                    return t.sent(), [2, w({ api: 'tab.switchTab', args: { tabKey: e } })];
                }
              });
            });
          },
        },
        setCooperUserColor: function (e) {
          return t(this, void 0, void 0, function () {
            return n(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, k];
                case 1:
                  return t.sent(), [2, w({ api: 'setCooperUserColor', args: e })];
              }
            });
          });
        },
        setToken: function (e) {
          return t(this, void 0, void 0, function () {
            return n(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, k];
                case 1:
                  return t.sent(), (M.tokenData = e), h({ eventName: 'setToken', data: e }), [2];
              }
            });
          });
        },
        ready: function () {
          return t(this, void 0, void 0, function () {
            return n(this, function (e) {
              switch (e.label) {
                case 0:
                  return S.apiReadySended ? [3, 2] : [4, j];
                case 1:
                  e.sent(), (S.apiReadySended = !0), h({ eventName: 'api.ready' }), (e.label = 2);
                case 2:
                  return [4, I];
                case 3:
                  return (
                    e.sent(),
                    [
                      2,
                      new Promise(function (e) {
                        return setTimeout(function () {
                          return e(null == M ? void 0 : M.Application);
                        }, 0);
                      }),
                    ]
                  );
              }
            });
          });
        },
        destroy: function () {
          y.destroy(),
            r.empty(),
            (M = null),
            (F = new Set()),
            (P = 0),
            document.removeEventListener('fullscreenchange', N);
        },
        save: function () {
          return t(this, void 0, void 0, function () {
            return n(this, function (e) {
              switch (e.label) {
                case 0:
                  return [4, k];
                case 1:
                  return e.sent(), [2, g({ api: 'save' })];
              }
            });
          });
        },
        setCommandBars: function (e) {
          return t(this, void 0, void 0, function () {
            return n(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, k];
                case 1:
                  return t.sent(), C(e), [2];
              }
            });
          });
        },
        updateConfig: function (e) {
          return (
            void 0 === e && (e = {}),
            t(this, void 0, void 0, function () {
              return n(this, function (t) {
                switch (t.label) {
                  case 0:
                    return [4, k];
                  case 1:
                    return (
                      t.sent(),
                      e.commandBars
                        ? (console.warn(
                            'Deprecated: `updateConfig()` 方法即将废弃，请使用`setCommandBars()`代替`updateConfig()`更新`commandBars`配置。'
                          ),
                          [4, C(e.commandBars)])
                        : [3, 3]
                    );
                  case 2:
                    t.sent(), (t.label = 3);
                  case 3:
                    return [2];
                }
              });
            })
          );
        },
        executeCommandBar: function (e) {
          return t(this, void 0, void 0, function () {
            return n(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, k];
                case 1:
                  return (
                    t.sent(), C([{ cmbId: e, attributes: [{ name: 'click', value: !0 }] }]), [2]
                  );
              }
            });
          });
        },
        on: function (e, r) {
          return t(this, void 0, void 0, function () {
            var t;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  return [4, k];
                case 1:
                  return (
                    n.sent(),
                    (t = e),
                    e === R.fileSaved &&
                      console.warn(
                        'fileSaved事件监听即将弃用， 推荐使用fileStatus进行文件状态的监听'
                      ),
                    e === R.fullscreenChange && (t = 'fullscreenchange'),
                    K(t, 'on'),
                    _.on(e, r),
                    [2]
                  );
              }
            });
          });
        },
        off: function (e, r) {
          return t(this, void 0, void 0, function () {
            return n(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, k];
                case 1:
                  return t.sent(), K(e, 'off'), _.off(e, r), [2];
              }
            });
          });
        },
      }),
      (function (e, t, n, r, i, o) {
        t && a(t) && ((i.refreshToken = t), (e.refreshToken = { eventName: W.getToken }));
        o &&
          a(o) &&
          ((i.getClipboardData = o), (e.getClipboardData = { eventName: W.getClipboardData }));
        n && a(n) && ((i.onToast = n), (e.onToast = { eventName: W.onToast }));
        r &&
          a(r) &&
          ((i.onHyperLinkOpen = r), (e.onHyperLinkOpen = { eventName: W.onHyperLinkOpen }));
      })(i, p, f, v, S, m),
      z(M, _, i, s, S, y, O),
      M
    );
  } catch (e) {
    console.error(e);
  }
  var E, T, L;
}
function K(e, t) {
  var n = e;
  ['error', 'fileOpen'].includes(n) ||
    ('fileSaved' === n && (n = 'fileStatus'),
    h({ eventName: 'basic.event', data: { eventName: n, action: t } }));
}
var J = Object.freeze({ __proto__: null, listener: z, config: G });
window.WPS = J;
var U = G;
export default { config: G };
export { U as config };
