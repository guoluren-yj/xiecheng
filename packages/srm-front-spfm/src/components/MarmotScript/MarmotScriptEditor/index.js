/**
 * MarmotScriptEditor
 * MarmotScriptEditor编辑器
 * @date: 2021-11-02
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CodeArea, Button, Row, Modal, TextField, CheckBox } from 'choerodon-ui/pro';
import { Card, Tooltip, Popover, message, Tabs } from 'choerodon-ui';
import { Icon as HIcon } from 'hzero-ui';
import classnames from 'classnames';
import copy from 'copy-to-clipboard';
import crypto from 'crypto-js';
import { isEmpty, trim, isArray, isFunction } from 'lodash';
import { getResponse, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import Cookies from 'universal-cookie';

// 引入格式化器
// import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { JSHINT } from 'jshint';
import jsonlint from 'jsonlint-mod';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
import {
  testScript,
  getAutoModelService,
  getComplementaryWordsService,
  getSourceCodeService,
} from '../marmotScriptService';
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

import BotPanel from '../../../bot/components/BotPanel';

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
// 双击突出显示当前单词
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/dialog/dialog.js';
import 'codemirror/addon/dialog/dialog.css';
// 注释
import 'codemirror/addon/comment/comment.js';

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
const downLoadContentTypeArr = [
  'application/vnd.ms-excel',
  'application/pdf',
  'application/octet-stream',
];

function MarmotScriptEditor(props = {}) {
  /**
   * scriptOutputDs: DataSet - 代码执行结果 ds
   * complementaryWords: String - 自定义脚本编辑器关键字, 已更改，现在无需传入
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
   * setScriptChange: Function - 脚本是否改变flag方法
   * handleSave: Function - 快捷键保存
   */
  const {
    scriptOutputDs,
    // complementaryWords,
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
    setScriptChange,
    handleSave,
    // bindRoutePrefix,
  } = props;
  const codeAreaRef = useRef();
  const codeRef = useRef();
  // 时间 timer ref
  const saveTimerRef = useRef();
  const [isBlack, switchIsBlack] = useState(cookies.get('codeScriptColor'));
  const [onDebug, handOnDebug] = useState(false);
  const [alwaysDownFlag, setAlwaysDownFlag] = useState(false);
  const modelWords = useRef([]);
  const complementaryWords = useRef({});
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
  const [botOpen, handleBotOpen] = useState(false); // Bot 面板开关
  const handleBotToggle = useCallback(() => {
    handleBotOpen((prev) => {
      if (!prev && openRightContent) {
        handleOpenRightContent(false);
      }
      return !prev;
    });
  }, [openRightContent]);

  // Bot 入口开关 — 默认隐藏，控制台输入 enableBot() 后开启，持久化到 localStorage
  // 🏗️ 后续 Bot 功能完善后移除此开关
  const BOT_VISIBLE_KEY = 'bot_visible_flag';
  const [botVisible, setBotVisible] = useState(
    () => localStorage.getItem(BOT_VISIBLE_KEY) === 'true'
  );

  useEffect(() => {
    window.enableBot = () => {
      localStorage.setItem(BOT_VISIBLE_KEY, 'true');
      setBotVisible(true);
    };
    return () => {
      delete window.enableBot;
    };
  }, []);
  // 常用语法搜索
  const [functionCodeQuery, handleFunctionCodeQuery] = useState('');
  const [panes, setPanes] = useState([]); // 可删除的tabs
  const [activeKey, setActiveKey] = useState('guest');
  const [newTabTitle, setNewTabTitle] = useState(''); // 传入cm内部 提供useEffect监听改变触发add事件
  // 用于代码提示的flag inFunction：当不为零时指符号.前是STD或者OTHER preList：存放上一次.时返回的列表，用于这次进行匹配
  const jsOptions = {
    name: 'javascript',
    highlightSelectionMatches: {
      minChars: 2,
      trim: true,
      style: 'matchhighlight',
      showToken: false,
    }, // 双击突出显示当前单词背景颜色
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
      'Ctrl-/': (cm) => {
        cm.toggleComment();
      },
      'Cmd-/': (cm) => {
        cm.toggleComment();
      },
      'Ctrl-S': () => {
        if (codeRef.current && codeRef.current.getTextNode) {
          const script = codeRef.current.getTextNode();
          if (isFunction(handleSave)) {
            handleSave(script);
          }
        }
      },
      'Cmd-S': () => {
        if (codeRef.current && codeRef.current.getTextNode) {
          const script = codeRef.current.getTextNode();
          if (isFunction(handleSave)) {
            handleSave(script);
          }
        }
      },
      Ctrl: (cm) => {
        // 给cm对象上赋值，来判断ctrl按键是否抬起
        // eslint-disable-next-line
        cm.controlKeyUp = null;
        let currentToken = {};
        const findLink = (e) => {
          if (cm.controlKeyUp) {
            removeFunc();
            cm.getAllMarks().forEach((i) => i.clear());
            return false;
          }
          const y = e.target.getBoundingClientRect().top;
          const pos = cm.coordsChar({ left: e.clientX, top: y }, 'page');
          const token = cm.getTokenAt(pos);
          const { line } = pos;
          const preToken = cm.getTokenAt({ line, ch: token.start - 2 });
          cm.getAllMarks().forEach((i) => i.clear());
          if (
            preToken.string !== 'require' ||
            !/^@M\//.test((token.string || '').replace(/"|'/g, ''))
          ) {
            currentToken = {};
            return false;
          }
          // 清除之前所有的标记
          cm.getAllMarks().forEach((i) => i.clear());
          // 生成新的标记
          cm.markText(
            { line, ch: token.start },
            { line, ch: token.end },
            { css: 'text-decoration: underline' }
          );
          currentToken = token;
        };
        const linkString = (event) => {
          // eslint-disable-next-line
          cm.controlKeyUp = true;
          cm.getAllMarks().forEach((i) => i.clear());
          event.preventDefault();
          event.stopPropagation();
          if (
            currentToken &&
            currentToken.string &&
            /^@M\//.test(currentToken.string.replace(/"|'/g, ''))
          ) {
            setNewTabTitle(currentToken.string);
          }
        };
        const wrapperElement = cm.getWrapperElement();
        const removeFunc = () => {
          wrapperElement.removeEventListener('mousemove', findLink);
          wrapperElement.removeEventListener('mousedown', linkString);
          wrapperElement.removeEventListener('mouseup', removeFunc);
        };
        // 监听鼠标划过，ctr按下时，鼠标划过添加下划线
        wrapperElement.addEventListener('mousemove', findLink);
        wrapperElement.addEventListener('mousedown', linkString);
        wrapperElement.addEventListener('mouseup', removeFunc);
      },
    },
  }; // 代码框的 js 的配置信息

  /**
   * 定时自动缓存数据
   */
  const handleTimer = () => {
    // 更新脚本改变flag
    if (isFunction(setScriptChange)) {
      setScriptChange(true);
    }
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
        handleDownloadConfirm(res.result);
        scriptOutputDs.current.set('output', res.result);
        scriptOutputDs.current.set('outPutLog', res.outPutLog);
        scriptOutputDs.current.set('queryBlockSql', res.queryBlockSql);
        scriptOutputDs.current.set('executionInfo', res.executionInfo);
      }
      handOnDebug(false);
    });
  };

  // 检测代码执行结果是否要下载文件
  const handleDownloadConfirm = (jsonString) => {
    try {
      const { body, header } = JSON.parse(jsonString);
      const newHeader = {};
      if (!isEmpty(header)) {
        for (const [key, value] of Object.entries(header)) {
          const newKey = key.toLowerCase();
          newHeader[newKey] = value;
        }
      }
      const contentType = newHeader['content-type'];
      if (
        body &&
        body.data &&
        isArray(body.data) &&
        contentType &&
        downLoadContentTypeArr.indexOf(contentType) !== -1
      ) {
        // 下载文件
        const downLoadFunction = () => {
          // 提取文件名
          const contentDisposition = newHeader['content-disposition'];
          const temp =
            contentDisposition &&
            contentDisposition.match(/[fF][iI][Ll][Ee][Nn][Aa][Mm][Ee]=(.*)/)[1];
          const fileName = temp;
          const arrayBuffer = new Int8Array(body.data);
          const blob = new Blob([arrayBuffer], { type: contentType });
          const blobURL = window.URL.createObjectURL(blob);
          const tempLink = document.createElement('a');
          tempLink.style.display = 'none';
          tempLink.href = blobURL;
          tempLink.setAttribute('download', decodeURIComponent(fileName));
          if (tempLink.download === 'undefined') {
            tempLink.setAttribute('target', '_blank');
          }
          document.body.appendChild(tempLink);
          tempLink.click();
          document.body.removeChild(tempLink);
          window.URL.revokeObjectURL(blobURL);
        };
        if (alwaysDownFlag) {
          downLoadFunction();
        } else {
          Modal.confirm({
            title: (
              <>
                {intl
                  .get('spfm.adaptorTaskDetail.view.message.download.confirm')
                  .d('检测到代码执行结果包含文件，是否需要下载？')}
                <p style={{ fontSize: 'small', fontWeight: '400' }}>
                  {intl
                    .get('spfm.adaptorTaskDetail.view.message.download.remember')
                    .d('本次编辑中记住下载选择')}
                  <CheckBox
                    style={{ marginLeft: 10 }}
                    onChange={(value) => {
                      setAlwaysDownFlag(value);
                    }}
                  />
                </p>
              </>
            ),
            onOk: () => {
              downLoadFunction();
            },
          });
        }
      }
    } catch (e) {
      notification.error({ message: e });
    }
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
      <p>
        Ctrl-/ / Cmd-/:&nbsp;
        {intl.get('spfm.adaptorTaskDetail.msg.delete.notes').d('注释或取消注释')}
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
        if (lineString) {
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
          const myHintList = !isEmpty(complementaryWords.current)
            ? JSON.parse(trim(complementaryWords.current))
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
            if (!isEmpty(complementaryWords.current)) {
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
    <CommonFunctionMsg
      style={{ maxHeight: '80vh' }}
      hidePopover={hidePopover}
      functionCodeQuery={functionCodeQuery}
    />
  );

  const queryFunctionCodeHint = (value) => {
    handleFunctionCodeQuery(value);
  };

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

  // 得到打开源码的tabs内容
  const getTabContent = (key, value = '') => {
    if (key === 'guest') {
      return (
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
          onKeyUp={(cm, keyBoardEvent) => {
            if (keyBoardEvent.key === 'Control') {
              // eslint-disable-next-line
              cm.controlKeyUp = true;
            }
          }}
        />
      );
    } else {
      return (
        <CodeArea
          value={value}
          options={jsOptions}
          format={JSFormatter}
          // readOnly
          className={styles['editor-code-area']}
        />
      );
    }
  };

  const onTabsChange = (targetKey) => {
    setActiveKey(targetKey);
    setNewTabTitle('');
  };

  const onTabsEdit = (targetKey, action) => {
    if (action === 'remove') {
      removeTabs(targetKey);
    }
  };

  // 必须要通过监听newTabTitle改变才能取得最新的panes 直接在cm中调用add会取不到最新的panes
  useEffect(() => {
    if (newTabTitle) {
      const newTabKey = newTabTitle.replace(/"|'/g, '');
      getSourceCodeService(newTabKey)
        .then((res) => {
          if (getResponse(res) && !isEmpty(res)) {
            addTabs(newTabKey, res);
          } else {
            notification.warning({
              message: intl
                .get('spfm.adaptorTaskDetail.view.message.noSourceCode')
                .d('未找到源码或源码受保护'),
            });
          }
        })
        .catch(() => {
          notification.warning({
            message: intl
              .get('spfm.adaptorTaskDetail.view.message.noSourceCode')
              .d('未找到源码或源码受保护'),
          });
        });
    }
  }, [newTabTitle]);

  const addTabs = (newKey, sourceCode) => {
    const currentPanes = panes;
    const hasFlag = currentPanes.filter((i) => i.key === newKey);
    if (hasFlag.length > 0) {
      setActiveKey(newKey);
      return;
    }
    // 不加这段代码，codemirror的行号栏会错位
    if (currentPanes.length === 0) {
      currentPanes.push({
        title: 'guest',
        content: getTabContent('guest'),
        key: 'guest',
        closable: false,
      });
    }
    currentPanes.push({ title: newKey, content: getTabContent(newKey, sourceCode), key: newKey });
    setActiveKey(newKey);
    setPanes(currentPanes);
  };

  const removeTabs = (targetKey) => {
    let activeKeys = activeKey;
    let lastIndex = 0;
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = panes.filter((pane) => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKeys === targetKey) {
      activeKeys = panes[lastIndex].key;
    } else {
      activeKeys = 'guest';
    }
    setActiveKey(activeKeys);
    setPanes(newPanes);
    setNewTabTitle('');
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

      const hasComplementaryObj = cookies.get('hasComplementaryObj');
      const complementaryObjCache = localStorage.getItem('complementaryObj');
      if (!hasComplementaryObj || (hasComplementaryObj && !complementaryObjCache)) {
        // 内容过多，无法使用cookie储存，使用cookie存flag，localStorage存内容达到有过期时间的效果
        const complementaryObj = await getComplementaryWordsService().then((res) => {
          if (getResponse(res)) {
            try {
              const list = crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res));
              localStorage.setItem('complementaryObj', res);
              const resultObj = JSON.parse(trim(list));
              if (resultObj && !isEmpty(resultObj)) {
                return list;
              }
            } catch (err) {
              return {};
            }
          }
        });
        if (!isEmpty(complementaryObj)) {
          complementaryWords.current = complementaryObj;
        }
        const expires = new Date();
        expires.setTime(new Date().getTime() + 1000 * 60 * 60 * 72);
        cookies.set('hasComplementaryObj', 'true', { expires });
      } else {
        try {
          const list = crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(complementaryObjCache));
          const resultObj = JSON.parse(trim(list));
          if (resultObj && !isEmpty(resultObj)) {
            complementaryWords.current = list;
          }
        } catch (err) {
          complementaryWords.current = {};
        }
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
    // 针对mac 用于阻止ctrl+左键 = 右键
    const contextmenuFunc = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener('contextmenu', contextmenuFunc);
    return () => {
      // 卸载清除定时器
      clearTimeout(saveTimerRef.current);
      window.removeEventListener('contextmenu', contextmenuFunc);
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
            <div className={`editor-left-scriptContent-Content${botOpen ? ' bot-open' : ''}`}>
              <div className="editor-left-scriptContent-button">
                <Row>
                  {botVisible && (
                    <Tooltip
                      placement="top"
                      title={intl.get('spfm.bot.view.title.botToggle').d('Bot (AI 编程助手)')}
                    >
                      <Button
                        icon="smart_toy"
                        funcType="flat"
                        shape="circle"
                        onClick={handleBotToggle}
                      />
                    </Tooltip>
                  )}
                </Row>
                {showTemplateLibrary && (
                  <Row>
                    <Tooltip
                      placement="top"
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
                    placement="top"
                    title={intl
                      .get('spfm.adaptorTaskDetail.view.title.helpManual')
                      .d('Marmot帮助手册')}
                  >
                    <Button
                      icon="knowledge"
                      funcType="flat"
                      shape="circle"
                      onClick={() => {
                        window.open(`${window.$$env.BASE_PATH || '/'}pub/marmot-help-manual`);
                      }}
                    />
                  </Tooltip>
                </Row>
                <Row>
                  <Tooltip
                    placement="top"
                    title={intl
                      .get('spfm.adaptorTaskDetail.view.title.functionCodeHint')
                      .d('常用语法')}
                  >
                    <Popover
                      overlayStyle={{ width: 500 }}
                      content={functionCodeHint}
                      title={() => (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ fontSize: '1.5em' }}>
                            {intl
                              .get('spfm.adaptorTaskDetail.view.title.functionCodeHint')
                              .d('常用语法')}
                          </span>
                          <TextField
                            style={{ height: 26, width: 99, marginRight: 2 }}
                            placeholder={intl
                              .get('spfm.adaptorTaskDetail.view.functionCodeHint.query')
                              .d('搜索')}
                            clearButton
                            valueChangeAction="input"
                            onChange={queryFunctionCodeHint}
                            onClear={queryFunctionCodeHint}
                          />
                        </div>
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
                {showSelectVersion && lineId && (
                  <Row>
                    <Tooltip
                      placement="top"
                      title={intl
                        .get('spfm.adaptorTaskDetail.view.title.moreVersion')
                        .d('历史版本')}
                    >
                      <Popover
                        overlayStyle={{ width: 300 }}
                        content={
                          <MoreVersion
                            lineId={lineId}
                            relTableSelectVersion={relTableSelectVersion}
                            changeScriptArea={changeScriptArea}
                            scriptCodeDs={scriptCodeDs}
                            showSelectVersion={showSelectVersion}
                          />
                        }
                        placement="rightTop"
                      >
                        <Button icon="find_in_page" funcType="flat" shape="circle" />
                      </Popover>
                    </Tooltip>
                  </Row>
                )}
              </div>
              {botOpen && (
                <BotPanel
                  scriptCodeDs={scriptCodeDs}
                  scriptOutputDs={scriptOutputDs}
                  codeRef={codeRef}
                  testParam={testParam}
                />
              )}
              <Tabs
                onChange={onTabsChange}
                activeKey={activeKey}
                type="editable-card"
                onEdit={onTabsEdit}
                className={classnames({
                  [styles['script-editor-tabs']]: panes.length > 1,
                  [styles['script-editor-tabs-onlyOne']]: !(panes.length > 1),
                })}
                hideAdd
              >
                <Tabs.TabPane tab="guest" key="guest" closable={false}>
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
                    onKeyUp={(cm, keyBoardEvent) => {
                      if (keyBoardEvent.key === 'Control') {
                        // eslint-disable-next-line
                        cm.controlKeyUp = true;
                      }
                    }}
                  />
                </Tabs.TabPane>
                {panes.map((pane) => (
                  <Tabs.TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                    {pane.content}
                  </Tabs.TabPane>
                ))}
              </Tabs>
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
                  testParam,
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
