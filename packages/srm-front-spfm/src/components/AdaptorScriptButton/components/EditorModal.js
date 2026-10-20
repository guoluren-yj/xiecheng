/**
 * jsEditorModal.js
 * 适配器js编辑器
 * @date: 2020-08-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useRef, useState } from 'react';
import { CodeArea, Button, Row, Modal } from 'choerodon-ui/pro';
import { Card, Tooltip } from 'choerodon-ui';
import { Icon as HIcon } from 'hzero-ui';
import crypto from 'crypto-js';
import { isEmpty, trim } from 'lodash';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { queryScriptConfig, testScript, getScriptDataService } from '@/services/adaptorTaskService';
import Cookies from 'universal-cookie';

// 引入格式化器
// import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { JSHINT } from 'jshint';
import jsonlint from 'jsonlint-mod';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
import marmotImg from '../../../assets/marmot3.png';
import VersionSpan from '../../../routes/AdaptorTask/Detail/VersionSpan';
import styles from './EditorModal.less';
import { HintJsWords, HintFunctionWords } from './complementaryWords';
import EditorModalRight from './EditorModalRight';
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
import 'codemirror/theme/mbo.css'; // 代码框背景颜色
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
import 'codemirror/addon/edit/matchbrackets.js'; // 括号匹配
import 'codemirror/addon/edit/closebrackets.js'; // 括号补全
// 全屏 支持浏览器全屏搜索
import 'codemirror/addon/display/fullscreen.css';
import 'codemirror/addon/display/fullscreen.js';
// 类型推断
import 'codemirror/addon/tern/tern.js';
import 'codemirror/addon/tern/tern.css';
import 'codemirror/addon/tern/worker.js';

window.JSHINT = JSHINT;
window.jsonlint = jsonlint;
const jsonOptions = {
  mode: { name: 'javascript', json: true },
  lineWrapping: true,
  autoRefresh: true,
}; // 代码框的 json 的配置信息
const jsxOptions = {
  mode: 'shell',
  lineWrapping: true,
}; // 日志框的 shell 的配置信息
const sqlOptions = {
  mode: 'sql',
  lineWrapping: true,
}; // 日志框的 sql 的配置信息
const modalKey = Modal.key();
const cookies = new Cookies();
function EditorModal(props = {}) {
  const {
    inputEntityCode,
    outputEntityCode,
    scriptVersion,
    bindRoutePrefix,
    debugTenantNum,
    saveScriptKey,
    trustful,
  } = props.queryParam;
  const { scriptOutputDs, helpDs, complementaryWords } = props;
  const { scriptCodeDs } = props;
  const codeAreaRef = useRef();
  const codeRef = useRef();
  const [isBlack, switchIsBlack] = useState(cookies.get('codeScriptColor'));
  const [onDebug, handOnDebug] = useState(false);
  const lastToken = useRef({ inFunction: 0, preList: [] });
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
    },
    // enableSearchTools: true,
  }; // 代码框的 js 的配置信息

  const onTestScript = () => {
    handleOpenRightContent(true);
    handOnDebug(true);
    const { script, input } = scriptCodeDs.toData()[0];
    const throwErrorFunc = (err) => {
      handOnDebug(false);
      notification.error({
        message:
          err === 'notObject'
            ? intl
                .get('spfm.adaptorTaskDetail.view.error.notObject')
                .d('调试数据需为对象，请修改后再次调试')
            : intl
                .get('spfm.adaptorTaskDetail.view.error.debugger')
                .d('调试数据有误，请修改后再次调试'),
      });
    };
    try {
      const param2Json = JSON.parse(input);
      if (Object.prototype.toString.call(param2Json) !== '[object Object]') {
        throwErrorFunc('notObject');
        return false;
      }
      testScript({
        inputEntityCode,
        outputEntityCode,
        scriptVersion,
        debugTenantNum,
        bindRoutePrefix,
        body: {
          script: crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(script)),
          param: param2Json,
          trustful,
        },
      }).then((res) => {
        if (getResponse(res)) {
          scriptOutputDs.current.set('output', res.result);
          scriptOutputDs.current.set('outPutLog', res.outPutLog);
          scriptOutputDs.current.set('queryBlockSql', res.queryBlockSql);
        }
        handOnDebug(false);
      });
    } catch (error) {
      throwErrorFunc();
    }
  };

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

  // 自定义pick方法，对选择的提示进行处理，删除括号内的提示，也可以是其他的操作
  // const pickOnlyBracketsFunc = (self, data, completion) => {
  //   self.replaceRange(
  //     completion.text.replace(/\([^)]*\)/g, '()'),
  //     completion.from || data.from,
  //     completion.to || data.to,
  //     'complete'
  //   );
  // };

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
          const hasDefinedList = []; // 存放上文中已经定义的变量
          // 获取当前代码块中已经定义的变量
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
          const { line } = cm.getCursor();
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
            const lineData = cm.getDoc().children[0].lines[line].text;
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
                const arr = cm.getDoc().children[0].lines[line].text.split('.');
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
          const list = hintList.filter((item) => {
            return item.indexOf(str) === 0;
          });
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

  const getPreCode = () => {
    Modal.confirm({
      title: intl
        .get('spfm.adaptorTaskDetail.view.message.ifRemove')
        .d('确认恢复至上一次退出前代码？'),
      onOk: () => {
        getScriptDataService(
          crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(saveScriptKey))
        ).then((res) => {
          if (!isEmpty(res)) {
            notification.success();
            scriptCodeDs.current.set(
              'script',
              crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res))
            );
          } else {
            notification.warning({
              message: intl.get('spfm.adaptorTaskDetail.view.message.noCode').d('暂无可恢复代码'),
            });
          }
        });
      },
    });
  };

  useEffect(() => {
    queryScriptConfig().then((res) => {
      if (getResponse(res)) {
        helpDs.create({ msg: res.readme });
      }
    });
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
          <Card className="editor-left-scriptContent">
            {scriptVersion && (
              <VersionSpan description="MarmotScript" value={scriptVersion} bgColor="#f28040" />
            )}
            <CodeArea
              onCursorActivity={(e) => promptBox(e)}
              dataSet={scriptCodeDs}
              name="script"
              options={jsOptions}
              format={JSFormatter}
              style={{ height: 800 }}
              ref={(ref) => {
                codeRef.current = ref;
              }}
              className={styles['editor-right-outputLog']}
            />
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
            <Tooltip title={intl.get('spfm.adaptorTaskDetail.view.title.format').d('代码格式化')}>
              <Button
                icon="format_paint"
                funcType="flat"
                shape="circle"
                onClick={() =>
                  codeRef.current.setValue(JSFormatter.getFormatted(codeRef.current.getValue()))
                }
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
            <div style={{ width: 'calc(35% - 8px)', marginTop: 33 }} id="right">
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

export default EditorModal;
