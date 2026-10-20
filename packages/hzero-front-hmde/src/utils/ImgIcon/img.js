/* eslint-disable */
/* eslint-disable no-new */
const __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
const __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    let _ = {
      label: 0,
      sent() {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: [],
    };
    let f;
    let y;
    let t;
    let g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_) {
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y.return
                  : op[0]
                  ? y.throw || ((t = y.return) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          ) {
            return t;
          }
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
const __spreadArrays =
  (this && this.__spreadArrays) ||
  function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++) {
      for (let a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
    }
    return r;
  };
const fs = require('fs');
const path = require('path');
const { promisify } = require('./util/promiseify.js');

const writeFilePro = promisify(fs.writeFile);
const readDirPro = promisify(fs.readdir);
const BASE_SRC = '/assets/icon';
const BASE_SRC_MENU = '/assets/menuicons';
const filterImgFile = function (fileNames) {
  return fileNames.filter(function (name) {
    return /\.(png|jpg|svg)$/.test(name);
  });
};
const getSrcPath = function (dir) {
  return path.join(__dirname, '..', '..', dir);
};
const getCurrentPath = function (dir) {
  return path.join(__dirname, dir);
};
(function () {
  return __awaiter(this, void 0, void 0, function () {
    let fileNames;
    let fileNamesHips;
    let e_1;
    let filesMap_1;
    let filesMapKeys_1;
    let fromSrcs;
    let importNames_1;
    let data;
    let e_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 7, , 8]);
          fileNames = [];
          fileNamesHips = [];
          _a.label = 1;
        case 1:
          _a.trys.push([1, 4, , 5]);
          return [4 /* yield */, readDirPro(getSrcPath(`.${BASE_SRC}`))];
        case 2:
          // 读取目录
          fileNames = _a.sent();
          return [4 /* yield */, readDirPro(getSrcPath(`.${BASE_SRC_MENU}`))];
        case 3:
          fileNamesHips = _a.sent();
          return [3 /* break */, 5];
        case 4:
          e_1 = _a.sent();
          // 没有起始目录，则创建
          return [2 /* return */, console.log(e_1)];
        case 5:
          filesMap_1 = new Map(
            __spreadArrays(
              filterImgFile(fileNames).map(function (filename) {
                return [filename, BASE_SRC];
              }),
              filterImgFile(fileNamesHips).map(function (filename) {
                return [filename, BASE_SRC_MENU];
              })
            )
          );
          filesMapKeys_1 = Array.from(filesMap_1.keys());
          fromSrcs = filesMapKeys_1.map(function (key) {
            return `@${filesMap_1.get(key)}/${key}`;
          });
          importNames_1 = filesMapKeys_1.map(function (key) {
            return key.replace(/(@|[.]|[-]|\s)/g, '_');
          });
          data = '';
          data +=
            '/* \u7531node\u7F16\u5199\uFF0C\u8BF7\u52FF\u624B\u5199\uFF0C\u4F7F\u7528yarn imglist \u81EA\u52A8\u751F\u6210 */\n';
          data += '/* eslint-disable */\n';
          data += fromSrcs
            .map(function (src, i) {
              return `import ${importNames_1[i]} from '${src}';\n`;
            })
            .join('');
          data += '\n';
          data +=
            '/* \u7531node\u7F16\u5199\uFF0C\u8BF7\u52FF\u624B\u5199\uFF0C\u4F7F\u7528yarn imglist \u81EA\u52A8\u751F\u6210 */\n';
          data += 'const icons = new Map([\n';
          data += importNames_1
            .map(function (name, i) {
              return `  ['${filesMapKeys_1[i]}', ${name}],\n`;
            })
            .join('');
          data += ']);\n';
          data +=
            '/* \u7531node\u7F16\u5199\uFF0C\u8BF7\u52FF\u624B\u5199\uFF0C\u4F7F\u7528yarn imglist \u81EA\u52A8\u751F\u6210 */\n';
          data += 'export default icons;';
          // 写入新的目录下
          return [4 /* yield */, writeFilePro(getCurrentPath('importImg.js'), data, 'UTF-8')];
        case 6:
          // 写入新的目录下
          _a.sent();
          return [
            2 /* return */,
            console.log(
              `\u8F7D\u5165\u5B8C\u6BD5\uFF01\u8F7D\u5165${importNames_1.length}\u5F20\u56FE\u7247`
            ),
          ];
        case 7:
          e_2 = _a.sent();
          console.log(e_2);
          return [3 /* break */, 8];
        case 8:
          return [2 /* return */];
      }
    });
  });
})();
