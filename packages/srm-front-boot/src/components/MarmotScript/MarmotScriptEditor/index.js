/**
 * MarmotScriptEditor
 * MarmotScriptEditor编辑器
 * @date: 2021-11-02
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CodeArea, Button, Row, Modal } from 'choerodon-ui/pro';
import { Card, Tooltip, Popover, message } from 'choerodon-ui';
import { Icon as HIcon } from 'hzero-ui';
import copy from 'copy-to-clipboard';
import crypto from 'crypto-js';
import { isEmpty, trim, isArray } from 'lodash';
import { getResponse, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import Cookies from 'universal-cookie';

// 引入格式化器
// import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { JSHINT } from 'jshint';
import jsonlint from 'jsonlint-mod';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
import { testScript, getAutoModelService } from '../marmotScriptService';
import marmotImg from '../../../assets/marmot3.png';
import VersionSpan from './VersionSpan';
import styles from './index.less';
import { HintJsWords, HintFunctionWords } from './complementaryWords';
import EditorModalRight from './EditorModalRight';
import { getMarmotScriptCache } from '../util';
import { marmotScriptMsg } from './complementaryWords/helpMsg';
import MoreVersion from './components/MoreVersion/MoreVersion';
import CommonFunctionMsg from './CommonFunctionMsg';
import TemplateLibraryModal from './components/TemplateLibrary';

// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
import 'codemirror/addon/display/autorefresh';
// import 'choerodon-ui/pro/lib/code-area/lint/javascript';
import 'codemirror/addon/lint/javascript-lint';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/sql/sql';
import 'codemirror/theme/material.css';
// 代码框背景颜色
import 'codemirror/theme/mbo.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
// 所在行高亮
import 'codemirror/addon/selection/active-line';
// 折叠代码
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';
// 代码补全
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/show-hint.css';
// 括号匹配 括号补全
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
// 全屏 支持浏览器全屏搜索
import 'codemirror/addon/display/fullscreen.css';
import 'codemirror/addon/display/fullscreen.js';
// 支持Ctrl+F的搜索
import 'codemirror/addon/search/search.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/search/jump-to-line.js';
import 'codemirror/addon/dialog/dialog.js';
import 'codemirror/addon/dialog/dialog.css';

window.JSHINT = JSHINT;
window.jsonlint = jsonlint;
// 代码框的 json 的配置信息
const jsonOptions = {
  mode: { name: 'javascript', json: true },
  lineWrapping: true,
  autoRefresh: true,
};
// 日志框的 shell 的配置信息
const jsxOptions = {
  mode: 'shell',
  lineWrapping: true,
};
// 日志框的 sql 的配置信息
const sqlOptions = {
  mode: 'sql',
  lineWrapping: true,
};
const modalKey = Modal.key();
const cookies = new Cookies();
const { loginName } = getCurrentUser();

function MarmotScriptEditor(props = {}) {
  /**
   * scriptOutputDs: DataSet - 代码执行结果 ds
   * helpDs: DataSet - 帮助信息 ds
   * complementaryWords: String - 自定义脚本编辑器关键字
   * scriptCodeDs: DataSet - 脚本编辑器 ds
   * scriptVersion: Number - 脚本版本默认为 3
   * testParam: Object - 外部传入的 debugger 参数
   * saveScriptKey: String - 缓存每行脚本数据的key
   * scriptCacheKey: String - 缓存脚本的类型key
   * saveScriptData: Function - 缓存脚本编辑器方法
   * bindRoutePrefix: String - 路由前缀，可以从行内数据获取，也可以自己传入固定值，默认值为 SRM_ADAPTOR = 'sada'，暂停使用
   * showSelectVersion: string - 是否显示历史版本选择框 默认false 不显示
   * relTableSelectVersion: Object - 专门给配置表中的脚本代码使用的历史版本 { textObj: {}, tableCode: '', associativeId: '', dataSource: '' } 前提showSelectVersion为true
   * showTemplateLibrary: string - 是否显示模板库按钮 默认true 显示
   */
  const {
    scriptOutputDs,
    helpDs,
    complementaryWords,
    scriptCodeDs,
    testParam = {},
    scriptVersion,
    saveScriptKey,
    scriptCacheKey,
    saveScriptData,
    lineId,
    showSelectVersion = false,
    relTableSelectVersion = {},
    showTemplateLibrary = true,
    // bindRoutePrefix,
  } = props;
  const codeAreaRef = useRef();
  const codeRef = useRef();
  // 时间 timer ref
  const saveTimerRef = useRef();
  const [isBlack, switchIsBlack] = useState(cookies.get('codeScriptColor'));
  const [onDebug, handOnDebug] = useState(false);
  const modelWords = useRef([]);
  const lastToken = useRef({ inFunction: 0, preList: [] });
  const markRef = useRef({
    markArr: [],
    markFlag: false,
    markIndex: 0,
    hasFlag: false,
    firstIn: true,
  });
  const [visiblePopover, handleVisiblePopover] = useState(false);
  const [openRightContent, handleOpenRightContent] = useState(false);
  // 用于代码提示的flag inFunction：当不为零时指符号.前是STD或者OTHER preList：存放上一次.时返回的列表，用于这次进行匹配
  const jsOptions = {
    name: 'javascript',
    lineWrapping: true,
    autoRefresh: true,
    lint: { esversion: 10 },
    styleActiveLine: true, // 高亮
    foldGutter: true,
    gutters: [
      'CodeMirror-lint-markers',
      'CodeMirror-linenumbers',
      'CodeMirror-foldgutter',
      'CodeMirror-focused',
    ], // 顺序不同 效果也不同
    matchBrackets: true, // 括号匹配
    autoCloseBrackets: true, // 括号补全
    theme: isBlack === 'default' ? 'default' : 'mbo',
    extraKeys: {
      F11: (cm) => {
        const fullScreen = cm.getOption('fullScreen');
        cm.setOption('fullScreen', !fullScreen);
      },
      Esc: (cm) => {
        cm.setOption('fullScreen', false);
      },
    },
  }; // 代码框的 js 的配置信息

  /**
   * 定时自动缓存数据
   */
  const handleTimer = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      const script = crypto.enc.Base64.stringify(
        // 使用 getTextNode获取当前正在编辑的内容
        crypto.enc.Utf16.parse(codeRef.current.getTextNode())
      );
      saveScriptData(script, true);
    }, 3000);
  };

  /**
   * 判断是否是json
   * @param {String} str
   * @returns
   */
  const isJSON = (str) => {
    if (typeof str === 'string') {
      try {
        const obj = JSON.parse(str);
        if (typeof obj === 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  };

  /**
   * debugger 脚本
   * @returns
   */
  const onTestScript = () => {
    handleOpenRightContent(true);
    handOnDebug(true);
    const { script, input } = scriptCodeDs.toData()[0];
    const param2Json = isJSON(input) ? JSON.parse(input) : input;
    let testInputType = '';
    if (Object.prototype.toString.call(param2Json) !== '[object Object]') {
      testInputType = { input: param2Json };
    } else {
      testInputType =
        Number(scriptVersion) === 3 ? { rawInputJsonStr: input } : { param: param2Json };
    }
    testScript({
      // bindRoutePrefix,
      scriptVersion,
      ...testParam,
      body: {
        script: crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(script)),
        ...testInputType,
      },
    }).then((res) => {
      if (getResponse(res)) {
        scriptOutputDs.current.set('output', res.result);
        scriptOutputDs.current.set('outPutLog', res.outPutLog);
        scriptOutputDs.current.set('queryBlockSql', res.queryBlockSql);
      }
      handOnDebug(false);
    });
  };

  /**
   * 展示帮助信息
   */
  const showHelpMsg = () => {
    const { msg = '' } = helpDs.current.toData();
    Modal.open({
      key: modalKey,
      title: intl.get('spfm.adaptorTaskDetail.view.modal.title').d('帮助信息'),
      children: <div style={{ whiteSpace: 'pre-line' }}>{msg}</div>,
      style: { width: 700 },
      closable: true,
      footer: null,
    });
  };

  /**
   * 展示快捷键帮助
   */
  const ShortcutHelp = () => (
    <div>
      <p>
        Ctrl-F / Cmd-F:&nbsp;{intl.get('spfm.adaptorTaskDetail.msg.search.start').d('开始搜索')}
      </p>
      <p>
        Ctrl-G / Cmd-G:&nbsp;
        {intl.get('spfm.adaptorTaskDetail.msg.search.next').d('下一个搜索内容')}
      </p>
      <p>
        Shift-Ctrl-G / Shift-Cmd-G:&nbsp;
        {intl.get('spfm.adaptorTaskDetail.msg.search.pre').d('上一个搜索内容')}
      </p>
      <p>
        Alt-G:&nbsp;{intl.get('spfm.adaptorTaskDetail.msg.goto.currentLine').d('光标跳至输入行')}
      </p>
      <p>
        Ctrl-D / Cmd-D:&nbsp;
        {intl.get('spfm.adaptorTaskDetail.msg.delete.currentLine').d('删除当前行')}
      </p>
      <p>ESC:&nbsp;{intl.get('spfm.adaptorTaskDetail.msg.esc.fullscreen').d('退出全屏')}</p>
    </div>
  );

  // 用于代码提示数组去重
  const unique = (arr) => {
    // 遍历arr，把元素分别放入tmp数组(不存在才放)
    const tmp = [];
    for (const item in arr) {
      // 该元素在tmp内部不存在才允许追加
      if (tmp.indexOf(arr[item]) === -1) {
        tmp.push(arr[item]);
      }
    }
    return tmp;
  };

  /**
   * 获取上下文中已经定义的变量
   * @param {Object} token Event
   */
  const getHasDefinedList = (token) => {
    const hasDefinedList = [];
    let current = token.state.localVars;
    let name = current && current.name ? current.name : null;
    while (name) {
      // 将其转化为数组
      hasDefinedList.push(name);
      current = current.next;
      if (current) {
        ({ name } = current);
      } else {
        name = '';
      }
    }
    // 获取他的所有上层代码块中已经定义的变量
    let currentPre = token.state.context;
    let prev = currentPre && currentPre.prev ? currentPre.prev : null;
    while (prev) {
      let vars = currentPre && currentPre.vars ? currentPre.vars : null;
      name = vars && vars.name ? vars.name : null;
      while (name) {
        hasDefinedList.push(name);
        vars = vars.next;
        if (vars) {
          ({ name } = vars);
        } else {
          name = '';
        }
      }
      currentPre = currentPre.prev;
      if (currentPre) {
        ({ prev } = currentPre);
      } else {
        prev = null;
      }
    }
    return hasDefinedList;
  };

  const hasLogger = (cm) => {
    markRef.current.markArr.forEach((res) => {
      res.value.clear();
    });
    markRef.current.markArr = [];
    markRef.current.markIndex = 0;
    // 进行全文检测
    if (!markRef.current.markFlag) {
      const { size } = cm.getDoc();
      for (let i = 0; i < size; i++) {
        loggerOfSTDCensor(cm, i);
      }
    }
    // 首次进入后会进行判断 没有则改变标记 减轻检测量
    if (!markRef.current.hasFlag) {
      markRef.current.markFlag = true;
    }
  };

  /**
   * STD中logger的语法检测
   * @param {Object} cm Event
   */
  const loggerOfSTDCensor = (cm, i) => {
    const lineData = cm.getLine(i);
    // 判断该行是否含有STD.Logger
    if (/STD.Logger\./g.test(lineData)) {
      if (markRef.current.firstIn) {
        markRef.current.firstIn = false;
        markRef.current.hasFlag = true;
      }
      const loggerIndex = Number(lineData.match(/STD.Logger/).index) + 11;
      let lineNumber = i;
      // 通过括号匹配来得到STD.Logger之后的参数字符串
      const arrStack = [];
      const arrDate = lineData.slice(loggerIndex);
      let num = 0;
      for (let j = loggerIndex; j < lineData.length; j++) {
        if (lineData[j] === '(') {
          arrStack.push(lineData[j]);
        } else if (lineData[j] === ')') {
          arrStack.pop();
        }
      }
      lineNumber++;
      while (arrStack.length > 0) {
        const lineString = cm.getLine(lineNumber);
        for (let j = 0; j < lineString.length; j++) {
          if (lineString[j] === '(') {
            arrStack.push(lineString[j]);
          } else if (lineString[j] === ')') {
            arrStack.pop();
          }
          if (arrStack.length === 0 && num === 0) {
            num = j;
          }
        }
        lineNumber++;
      }
      // 多行的时候进行拼接成一个string字符串
      let last = arrDate;
      for (let a = i; a < lineNumber - 1; a++) {
        if (a === lineNumber - 2) {
          last = last.concat(cm.getLine(a + 1).slice(0, num + 1));
        } else {
          last = last.concat(cm.getLine(a + 1));
        }
      }
      // 切割，并得到STD.logger之后的string参数信息
      // 存放单引号栈
      const stack1 = [];
      // 存放双引号栈
      const stack2 = [];
      // 存放切割结果
      const res = [];
      // 切割的开始位置
      let start = 0;
      // 存放第一次切割的结束位置，获取第一个参数
      let firstIndex = 0;
      for (let index = 0; index < last.length; index++) {
        if (last[index] === ',' && stack2.length === 0 && stack1.length === 0 && res.length === 0) {
          if (res.length === 0) {
            firstIndex = index + 1;
          }
          res.push(last.slice(start, index));
          start = index + 1;
        } else if (last[index] === '"') {
          if (stack2.length === 0) {
            stack2.push(last[index]);
          } else {
            stack2.pop();
          }
        } else if (last[index] === "'") {
          if (stack1.length === 0) {
            stack1.push(last[index]);
          } else {
            stack1.pop();
          }
        }
      }
      // 最后一个参数的切割
      if (start > 0 && start < last.length) {
        res.push(last.slice(start, last.length));
      }
      if (res.length > 0) {
        const firstRes = res[0].match(/}/g);
        const count = !firstRes ? 0 : firstRes.length;
        const indexFind = markRef.current.markArr.findIndex(
          (item) => item.line === markRef.current.markIndex
        );
        if (count !== res.length - 1 && indexFind === -1) {
          const backgroundColor =
            cm.getOption('theme') === 'default'
              ? 'background-color: lightBlue'
              : 'background-color: grey';
          let endMarkLine = i;
          let endMarkCh = loggerIndex + firstIndex;
          if (cm.getLine(i).length < loggerIndex + firstIndex) {
            endMarkLine = i + 1;
            endMarkCh = firstIndex;
          }
          const newMark = cm.markText(
            { line: i, ch: loggerIndex },
            { line: endMarkLine, ch: endMarkCh },
            {
              // atomic: true,
              // handleMouseEvents: true,
              css: backgroundColor,
              // selectRight: true,
            }
          );
          markRef.current.markArr.push({ line: markRef.current.markIndex, value: newMark });
        } else if (count === res.length - 1 && indexFind !== -1) {
          markRef.current.markArr[indexFind].value.clear();
          markRef.current.markArr.splice(indexFind, 1);
        }
      }
      markRef.current.markIndex++;
    }
  };

  /**
   * 提示框选中pick方法针对require
   * @param cm data completion
   */
  const pickRequireModelFunc = (cm, data, completion) => {
    const text = `require("${completion.text}");`;
    cm.replaceRange(text, data.from, data.to, 'completion');
  };

  /**
   * 处理自定义关键字
   * @param {Object} e Event
   */
  const promptBox = (e) => {
    const currentInput = e.display.input.prevInput;
    const inputParam = currentInput.substr(currentInput.length - 1, 1); // 判断最后一个是否为空格或者回车或者特殊字符
    // !inputParam?.match(/^\s*$/) && !inputParam.match(/[^0-9a-zA-Z_]/g)
    if (!inputParam.match(/^[ ]*$/)) {
      e.showHint({
        hint: (cm) => {
          // cm options 自定义hint方法，返回一个对象{ from: { line, ch }, to: { line, ch }, list: [ ] }，
          // 其中from和to中时一个对象还有两个key，分别时所在行和所在列位置信息，是个position对象实例，
          // list则是经过对输入字符判断判断之后给出的提示数据，list是一个数组，里面不仅可以是String还可以是个对象{text: value, hint: ()=>{} }
          // hint用于pick某个提示时，对最后显示的信息进行修改
          const token = cm.getTokenAt(cm.getCursor());
          // 获取上文中已经定义的变量
          const hasDefinedList = getHasDefinedList(token);
          const { line } = cm.getCursor();
          const toGetHasSTDLoggerLine = cm.getLine(line);
          if (/STD.Logger\./g.test(toGetHasSTDLoggerLine)) {
            // false时进行全文的检测
            markRef.current.markFlag = false;
          }
          hasLogger(cm);
          let hintList = HintJsWords;
          if (hasDefinedList.length > 0) {
            hintList = hasDefinedList.concat(HintJsWords); // 将上文中已经定义的变量加入自定义提示中
          }
          const str = token.string;
          const myHintList = !isEmpty(complementaryWords)
            ? JSON.parse(trim(complementaryWords))
            : {};
          // 当前符号是. 或者已经.了并且正在输入其他的字母
          if (str === '.' || lastToken.current.inFunction) {
            let list = [];
            const lineData = cm.getLine(line);
            const isSTD = lineData.slice(token.start - 3, token.start) === 'STD';
            const isOTHER = lineData.slice(token.start - 5, token.start) === 'OTHER';
            const isBIZ = lineData.slice(token.start - 3, token.start) === 'BIZ';
            // 判断上一次存的数组是否为空，空即获取字符串和数组方法
            if (lastToken.current.preList.length === 0) {
              list = HintFunctionWords;
            }
            // 有STD和OTHER的自定义时才进行判断，避免报错，并且进入时可以将之前的list进行替换
            if (!isEmpty(complementaryWords)) {
              if (isSTD || isOTHER || isBIZ) {
                // 判断符号.之前是不是 STD OTHER BIZ
                const whichOne = isSTD ? 'STD' : isOTHER ? 'OTHER' : 'BIZ';
                list = myHintList[whichOne];
              } else {
                // 当输入 STD OTHER BIZ 的孙子节点方法的时候
                const arr = cm.getLine(line).split('.');
                for (const key in myHintList) {
                  if (key === arr[arr.length - 2]) {
                    lastToken.current.preList = myHintList[key]; // 存放用于下次直接取这个list
                    list = myHintList[key];
                  }
                }
              }
            }
            if (lastToken.current.inFunction && str !== '.') {
              // 已经.了并且当前符号不是. 即正在输入.后面的字符，这时候就要用到上一次存的list数组
              list = lastToken.current.preList.filter((item) => {
                return item.indexOf(str) === 0;
              });
              lastToken.current.inFunction = list.length > 0; // 如果匹配不到，则还原inFunction标志
            }
            if (list.length > 0) {
              lastToken.current.inFunction = 1;
              lastToken.current.preList = list;
            }
            return {
              from: {
                line,
                ch: lastToken.current.inFunction && str !== '.' ? token.start : token.start + 1,
              },
              to: {
                line,
                ch: token.end,
              },
              list,
            };
          }
          // 将上一次存到数组进行初始化，用于判断字符串和数组方法
          lastToken.current.preList = [];
          let list = hintList.filter((item) => {
            return item.indexOf(str) === 0;
          });
          if (str === 'require' && isArray(modelWords.current)) {
            list = modelWords.current.map((res) => {
              return { text: res, hint: pickRequireModelFunc };
            });
          }
          return {
            from: {
              line,
              ch: token.start,
            },
            to: {
              line,
              ch: token.end,
            },
            list: unique(list), // [{ text: 'sqrt(x)', hint: pickOnlyBracketsFunc }, ...unique(list)],
          };
        },
        completeSingle: false, // 只有一个提示可用时，不直接填充
        container: codeAreaRef.current, // 需要传当前的element，防止由于z-index导致无法显示
      }); // 显示自动完成提示的框架
    }
  };

  /**
   * 从缓存中获取上次存储的代码
   */
  const getPreCode = () => {
    Modal.confirm({
      title: intl
        .get('spfm.adaptorTaskDetail.view.message.ifRemove')
        .d('确认恢复至上一次退出前代码？'),
      onOk: () => {
        // 从缓存中获取数据
        const res = getMarmotScriptCache(scriptCacheKey, saveScriptKey);
        if (!isEmpty(res)) {
          notification.success();
          scriptCodeDs.current.set(
            'script',
            crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res.script))
          );
        } else {
          notification.warning({
            message: intl.get('spfm.adaptorTaskDetail.view.message.noCode').d('暂无可恢复代码'),
          });
        }
      },
    });
  };

  /**
   * 左侧常见语法提示按钮复制之后自动关闭
   */
  const hidePopover = useCallback(() => {
    handleVisiblePopover(false);
  }, []);

  const handleVisibleChange = (visible) => {
    handleVisiblePopover(visible);
  };

  /**
   * 左侧常见语法提示按钮
   */
  const functionCodeHint = (
    <CommonFunctionMsg style={{ maxHeight: '80vh' }} hidePopover={hidePopover} />
  );

  /**
   * 使用useCallback固化方法
   */
  const changeScriptArea = useCallback((value) => {
    if (value) {
      codeRef.current.setValue(value);
    }
  }, []);

  // 打开案例库
  const openTemplateLibrary = () => {
    const thisTemplateLibraryModal = Modal.open({
      title: intl.get('spfm.adaptorTaskDetail.view.title.templateLibrary').d('案例库'),
      children: (
        <div>
          <TemplateLibraryModal
            closeModal={() => thisTemplateLibraryModal.close()}
            changeScriptArea={changeScriptArea}
            jsOptions={jsOptions}
          />
        </div>
      ),
      footer: null,
      closable: true,
      destroyOnClose: true,
      style: {
        width: '60vw',
        height: '70vh',
      },
      bodyStyle: {
        width: '100%',
        height: 'calc(100% - 80px)',
        overflow: 'auto',
        paddingBottom: 0,
      },
    });
  };

  const getDevTool = () => {
    const result = `devtools://devtools/bundled/js_app.html?wss=gateway.dev.isrm.going-link.com/ssc-ws/websocket/new-debugger/${loginName}`;
    copy(result);
    message.destroy();
    message.config({ duration: 2 });
    message.success(
      intl
        .get('spfm.adaptorTaskDetail.copy.devtool.success')
        .d('复制地址成功, 请手动粘贴至Chrome浏览器地址栏'),
      undefined,
      undefined,
      'bottomRight'
    );
  };

  useEffect(() => {
    // 使用闭包解决关闭时报错的问题
    (async () => {
      // 接口得到require提示
      const modelWordsList = await getAutoModelService().then((res) => {
        if (getResponse(res)) {
          try {
            const list = crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res));
            const resultList = JSON.parse(trim(list));
            if (resultList && resultList.body && isArray(resultList.body)) {
              return resultList.body;
            }
          } catch (err) {
            return [];
          }
        }
      });
      if (isArray(modelWordsList) && modelWordsList.length > 0) {
        modelWords.current = modelWordsList;
      }
    })();
  }, []);

  useEffect(() => {
    // 每24h弹出一次marmotScript编码规范提示框
    const showMarmotScriptMsg = cookies.get('marmotScriptMsg');
    if (!showMarmotScriptMsg) {
      // 使用定时器来解决 直接弹框导致代码编辑块行号样式偏移的问题
      const waitCodeMirrorDone = setTimeout(() => {
        Modal.open({
          key: modalKey,
          title: intl
            .get('spfm.adaptorTaskDetail.view.marmotScriptMsg.title')
            .d('MarmotScript-编码规范'),
          children: (
            <div style={{ whiteSpace: 'pre-line' }}>
              {crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(marmotScriptMsg))}
            </div>
          ),
          style: { width: 700 },
          closable: true,
          footer: null,
        });
        clearTimeout(waitCodeMirrorDone);
      }, 200);
      const expires = new Date();
      expires.setTime(new Date().getTime() + 1000 * 60 * 60 * 24);
      cookies.set('marmotScriptMsg', marmotScriptMsg, { expires });
    }
    helpDs.reset();
    helpDs.create();
    return () => {
      // 卸载清除定时器
      clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // 右侧展开后可拖拽改变其宽度
    const left = document.getElementById('left');
    if (openRightContent) {
      const resize = document.getElementById('resize');
      const right = document.getElementById('right');
      const box = document.getElementById('box');
      const listener = (e) => {
        const startX = e.clientX;
        resize.left = resize.offsetLeft;
        const addMouseMoveFunc = (ee) => {
          const endX = ee.clientX;

          let moveLen = resize.left + (endX - startX);
          const maxT = box.clientWidth - resize.offsetWidth;
          if (moveLen < 300) moveLen = 300;
          if (moveLen > maxT - 200) moveLen = maxT - 200;
          resize.style.left = moveLen;
          left.style.width = `${moveLen - box.clientWidth * 0.05}px`;
          right.style.width = `${box.clientWidth - moveLen - 8 + box.clientWidth * 0.02}px`;
        };
        const removeMouseMoveFunc = () => {
          document.body.removeEventListener('mousemove', addMouseMoveFunc);
          document.body.removeEventListener('mouseup', removeMouseMoveFunc);
        };
        document.body.addEventListener('mousemove', addMouseMoveFunc);
        document.body.addEventListener('mouseup', removeMouseMoveFunc);
        return false;
      };
      resize.addEventListener('mousedown', listener, true);
    } else {
      left.style.width = '95%';
    }
  }, [openRightContent]);

  const currentColor = isBlack === 'default' ? 0.2 : 0.5;

  return (
    <div className={styles.adaptorEditor}>
      <div className="adaptor-editor-content" id="box">
        <div
          className="editor-left"
          ref={(ref) => {
            codeAreaRef.current = ref;
          }}
          style={{ width: '95%' }}
          id="left"
        >
          {Number(scriptVersion) !== 3 ? (
            <div className="editor-left-message">
              <div>
                {intl
                  .get('spfm.adaptorTaskDetail.vTwo.message.developmentMethod')
                  .d('这是已经过时的V2脚本，开发方式请参考: ')}
                <p style={{ marginBottom: 0 }}>
                  https://lexiangla.com/teams/k100048/docs/3fef1198048011ec9b5e72142801607d
                </p>
              </div>
              <div style={{ marginLeft: '50px' }}>
                {intl.get('spfm.adaptorTaskDetail.vTwo.message.upgrade').d('是否要升级请参考: ')}
                <p style={{ marginBottom: 0 }}>
                  https://lexiangla.com/teams/k100048/docs/ef2ee1ea15d511ec878066bfd4da3584
                </p>
              </div>
            </div>
          ) : (
            ''
          )}
          <Card className="editor-left-scriptContent">
            {scriptVersion && (
              <VersionSpan description="MarmotScript" value={scriptVersion} bgColor="#f28040" />
            )}
            <div className="editor-left-scriptContent-topButton">
              {showSelectVersion && lineId ? (
                <div>
                  <MoreVersion
                    lineId={lineId}
                    relTableSelectVersion={relTableSelectVersion}
                    changeScriptArea={changeScriptArea}
                    scriptCodeDs={scriptCodeDs}
                  />
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="editor-left-scriptContent-Content">
              <div className="editor-left-scriptContent-button">
                {showTemplateLibrary && (
                  <Row>
                    <Tooltip
                      placement="right"
                      title={intl
                        .get('spfm.adaptorTaskDetail.view.title.templateLibrary')
                        .d('案例库')}
                    >
                      <Button
                        icon="template_configuration"
                        funcType="flat"
                        shape="circle"
                        onClick={() => openTemplateLibrary()}
                      />
                    </Tooltip>
                  </Row>
                )}
                <Row>
                  <Tooltip
                    placement="right"
                    title={intl
                      .get('spfm.adaptorTaskDetail.view.title.functionCodeHint')
                      .d('常用语法')}
                  >
                    <Popover
                      content={functionCodeHint}
                      title={() => (
                        <span style={{ fontSize: '1.5em' }}>
                          {intl
                            .get('spfm.adaptorTaskDetail.view.title.functionCodeHint')
                            .d('常用语法')}
                        </span>
                      )}
                      trigger="click"
                      placement="rightTop"
                      visible={visiblePopover}
                      onVisibleChange={handleVisibleChange}
                    >
                      <Button icon="document" funcType="flat" shape="circle" />
                    </Popover>
                  </Tooltip>
                </Row>
              </div>
              <CodeArea
                onCursorActivity={(e) => promptBox(e)}
                dataSet={scriptCodeDs}
                name="script"
                options={jsOptions}
                format={JSFormatter}
                ref={(ref) => {
                  codeRef.current = ref;
                }}
                onKeyDown={handleTimer}
                className={styles['editor-code-area']}
              />
            </div>
            <img
              draggable="false"
              src={marmotImg}
              className="edit-left-scriptContent-codeArea-img"
              alt="marmot"
              style={{ opacity: currentColor }}
            />
          </Card>
        </div>
        <div className="edit-action-button">
          <Row className="edit-action-button-menu">
            <div
              className="edit-action-button-ladder-shaped"
              onClick={() => handleOpenRightContent(!openRightContent)}
            >
              {openRightContent ? (
                <Tooltip
                  title={intl.get('spfm.adaptorTaskDetail.view.close.console').d('关闭控制台')}
                >
                  <HIcon type="menu-unfold" style={{ fontSize: 22 }} />
                </Tooltip>
              ) : (
                <Tooltip
                  title={intl.get('spfm.adaptorTaskDetail.view.open.console').d('展开控制台')}
                >
                  <HIcon type="menu-fold" style={{ fontSize: 22 }} />
                </Tooltip>
              )}
            </div>
          </Row>
          <Row>
            <Tooltip
              title={intl.get('spfm.adaptorTaskDetail.view.title.shortcutKey').d('快捷键帮助')}
            >
              <Popover
                content={ShortcutHelp}
                title={intl.get('spfm.adaptorTaskDetail.view.title.shortcutKey').d('快捷键帮助')}
                trigger="click"
                placement="left"
              >
                <Button icon="keyboard" funcType="flat" shape="circle" />
              </Popover>
            </Tooltip>
          </Row>
          <Row>
            <Tooltip
              title={intl.get('spfm.adaptorTaskDetail.view.title.fullscreen').d('编辑器全屏')}
            >
              <Button
                icon="open_with"
                funcType="flat"
                shape="circle"
                onClick={() => {
                  codeRef.current.element.editor.setOption('fullScreen', true);
                }}
              />
            </Tooltip>
          </Row>
          <Row>
            <Tooltip title={intl.get('spfm.adaptorTaskDetail.view.title.format').d('代码格式化')}>
              <Button
                icon="format_paint"
                funcType="flat"
                shape="circle"
                onClick={() => {
                  markRef.current.firstIn = true;
                  codeRef.current.setValue(JSFormatter.getFormatted(codeRef.current.getValue()));
                }}
              />
            </Tooltip>
          </Row>
          <Row>
            <Tooltip
              title={intl
                .get('spfm.adaptorTaskDetail.view.backgroundColor.switch')
                .d('切换背景颜色')}
            >
              <Button
                icon="palette"
                funcType="flat"
                shape="circle"
                onClick={() => {
                  const currentIsBlack = isBlack === 'default' ? 'black' : 'default';
                  switchIsBlack(currentIsBlack);
                  cookies.set('codeScriptColor', currentIsBlack);
                }}
              />
            </Tooltip>
          </Row>
          <Row>
            <Tooltip
              title={intl.get('spfm.adaptorTaskDetail.view.title.codeRecovery').d('代码恢复')}
            >
              <Button
                icon="cloud_download"
                funcType="flat"
                shape="circle"
                onClick={() => getPreCode()}
              />
            </Tooltip>
          </Row>
          <Row>
            <Tooltip title={intl.get('spfm.adaptorTaskDetail.view.modal.title').d('帮助信息')}>
              <Button icon="help" funcType="flat" shape="circle" onClick={() => showHelpMsg()} />
            </Tooltip>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 5, marginBottom: 5 }}>
            <div style={{ borderTop: '1px solid', width: 25 }} />
          </div>
          <Row>
            <Tooltip
              title={intl
                .get('spfm.adaptorTaskDetail.view.action.copyDevtool')
                .d('点击复制devtool地址')}
            >
              <Button onClick={getDevTool} icon="build" funcType="flat" shape="circle" />
            </Tooltip>
          </Row>
          <Row>
            <Tooltip
              title={intl.get('spfm.adaptorTaskDetail.view.action.tooltip').d('点击测试脚本')}
            >
              <Button
                onClick={!onDebug && onTestScript}
                icon="bug_report"
                funcType="flat"
                shape="circle"
                className={onDebug ? styles['button-debug-animation'] : ''}
              />
            </Tooltip>
          </Row>
        </div>
        {openRightContent ? (
          <>
            <div className="edit-right-resize" id="resize" />
            <div
              style={{ width: 'calc(35% - 8px)', marginTop: 30, height: 'calc(100% + 30px )' }}
              id="right"
            >
              <EditorModalRight
                queryParam={{
                  scriptOutputDs,
                  jsxOptions,
                  jsonOptions,
                  sqlOptions,
                  scriptCodeDs,
                }}
              />
            </div>
          </>
        ) : (
          <div className="edit-right-line" />
        )}
      </div>
    </div>
  );
}

export default MarmotScriptEditor;
