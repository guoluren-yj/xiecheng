import { isFunction, uniqBy } from 'lodash';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Form, Icon, Output, Tooltip, TreeSelect, DataSet, message } from 'choerodon-ui/pro';
import DrillComponent, { IParams } from '@/components/DrillComponent';
import { drillFormulaReg, IBlockDataItemProps } from '@/businessGlobalData/common';
import notification from 'utils/notification';
import MonacoEditor, { EditorDidMount } from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import intl from 'srm-front-boot/lib/utils/intl';

import { arithmetic, fun, getFlatFun } from './constants';
import { dataMapTransfer, formula2Desc } from './utils';
import EditHeaderFormDS from './EditHeaderFormDS';
import styles from './index.less';

const { TreeNode } = TreeSelect;

const formulaMappingList: any[] = []; // 用于做meaning和value的映射

const { Range, Selection, KeyCode } = monaco;

interface ISuggestions {
  label: string;
  kind: monaco.languages.CompletionItemKind;
  insertText: string;
  detail?: string;
}

interface FormulaEditorProps {
  name: string;
  formDs: DataSet;
  businessObjectCode: string;
  DrillComponentProps?: any;
  language?: string;
  businessObjectFieldCode?: string;
  editorOptions?: any;
  disabled?: boolean;
  initData?: {
    referenceInfoList: Array<any>;
    formula: string;
  };
}

let provider = {
  dispose: () => {},
};

export default function FormulaEditor({
  name,
  businessObjectCode,
  formDs,
  language = 'sql',
  initData,
  DrillComponentProps,
  disabled = false,
  editorOptions,
  businessObjectFieldCode = '',
}: FormulaEditorProps) {
  const editorIns = useRef<any>();
  const monacoInstance = useRef<any>();

  // 编辑器显示的内容和落库的内容是不一样的：比如钻取的的时候，显示的是带中文的内容，落库的是具体的字段id
  // 所以这里需要一个专门的字段去维护编辑器的现实内容
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    setTimeout(() => {
      init();
    }, 0);
  }, []);

  useEffect(
    () => () => {
      provider.dispose(); // 弹窗关闭后 销毁编辑器实例
    },
    []
  );

  // 客制化的数据初始化
  const init = () => {
    const _initData = formDs?.current?.toData();
    const { referenceInfoList = [], defaultValue: formula = '' } = initData || _initData || {};
    const transferList: any[] = [];
    // TODO: 获取到referenceList，然后去设置formulaMappingList
    referenceInfoList.forEach(item => {
      transferList.push({
        value: `${item.businessObjectCode}.${item.businessObjectFieldCode}`,
        meaning: `${item.businessObjectName}.${item.businessObjectFieldName}`,
        formula: item.referenceFormula,
      });
    });
    const desc = formula2Desc(formula, transferList);
    (uniqBy(referenceInfoList, 'referenceFormula') as any[]).forEach(i => {
      const list: any[] = [];
      referenceInfoList.forEach(r => {
        if (r.referenceFormula === i.referenceFormula) {
          list.push(r);
        }
      });
      const tranList = list.map(t => {
        return {
          value: `${t.businessObjectCode}.${t.businessObjectFieldCode}`,
          meaning: `${t.businessObjectName}.${t.businessObjectFieldName}`,
          formula: t.referenceFormula,
        };
      });
      const curMeaning = formula2Desc(i.referenceFormula, tranList);
      formulaMappingList.push({
        meaning: curMeaning,
        value: i.referenceFormula,
      });
    });
    setCode(desc);
    // 第一次进来时，不覆盖原有的值，在原有的值之后添加
    const selection = editorIns?.current?.getSelection?.();
    editorIns.current.setSelections([
      new Selection(
        selection.endLineNumber,
        selection.endColumn,
        selection.endLineNumber + 1,
        selection.endColumn + 1
      ),
    ]);
    setTimeout(() => {
      setEditorVal('');
    }, 500);
  };

  /**
   * 获取drill数据，回写到editor
   * @param dataSet drill的dataSet
   */
  const handleOk = (params: IParams | undefined) => {
    const { value, text } = params as IParams;
    formulaMappingList.push({
      value,
      meaning: text,
    });
    setEditorVal(`${text} `);
  };

  /**
   * 校验用户输入的公式，只是前端校验
   * @returns
   */
  const handleCheck = () => {
    const markers: monaco.editor.IMarker[] =
      monacoInstance?.current?.editor?.getModelMarkers({}) || [];
    const val = markers.length === 0 && code;
    if (!val) {
      notification.error({
        description:
          (markers?.[0] || {}).message ||
          intl.get('hmde.common.view.message.expressionNone').d('表达式不能为空'),
      } as any);
      return false;
    } else {
      message.success(
        intl.get('hmde.common.message.successValidation').d('校验成功'),
        3,
        () => {},
        'top'
      );
      return true;
    }
  };

  /**
   * 编辑器初始化成功回调函数
   * @param editor
   * @param monacoIns
   */
  const editorDidMountHandle = (editor, monacoIns) => {
    monacoInstance.current = monacoIns;
    editorIns.current = editor;
    const onEvent = (event: monaco.IKeyboardEvent) => {
      const val: string = editorIns?.current?.getValue?.();
      const matchs = val.match(drillFormulaReg) || [];
      const matchIndex = {
        // match: index,
      };
      const lines: string[] = val.split('\n');

      const blockDatas: IBlockDataItemProps[] = []; // 注意，这里的块的区域，'#field_标题#'，没算上引号的，但是选中要带上引号，
      lines.forEach((line, lineIndex) => {
        matchs.forEach(block => {
          let startIndex;
          if (matchIndex[block]) {
            startIndex = matchIndex[block];
          }
          const indexBlock = line.indexOf(block, startIndex);
          matchIndex[block] = indexBlock + block.length - 1;
          if (indexBlock > -1) {
            const lineNumber = lineIndex + 1;
            const startColumn = indexBlock + 2;
            blockDatas.push({
              endColumn: startColumn + block.length - 1,
              endLineNumber: lineNumber,
              startColumn,
              startLineNumber: lineNumber,
            });
          }
        });
      });

      if (editorIns.current) {
        blockDatas.forEach(bData => {
          const rData = [
            bData?.startLineNumber,
            bData?.startColumn,
            bData?.endLineNumber,
            bData?.endColumn,
          ];
          // 块的区域，'#field_标题#'，没算上引号的，但是选中要带上引号，所以startColumn - 1 且 data.endColumn + 1
          const selectData = [
            bData?.startLineNumber,
            bData?.startColumn - 1,
            bData?.endLineNumber,
            bData?.endColumn,
          ];
          // @ts-ignore
          const range = new Range(...rData);
          // @ts-ignore
          const selection = new Selection(...selectData);
          const currentPosition: monaco.Position = editorIns?.current?.getPosition?.();
          if (
            currentPosition && // 有光标
            range.containsPosition(currentPosition) // 光标在world里面
          ) {
            const cS: monaco.Selection = editorIns?.current?.getSelection?.();
            const selectEqual = cS.endColumn === selection.endColumn;
            if (
              selectEqual && // 当前选中的就是应该要选中的末尾
              currentPosition.column === selection.endColumn && // 光标在最右边
              event?.keyCode === KeyCode.RightArrow // 按了右方向键
            ) {
              const selectMoveRightOneCol = [...selectData];
              selectMoveRightOneCol[3] += 1; // 光标右移
              // eslint-disable-next-line prefer-destructuring
              selectMoveRightOneCol[1] = selectMoveRightOneCol[3]; // 没有选区（start === end
              // @ts-ignore
              editorIns.current.setSelections([new Selection(...selectMoveRightOneCol)]);
              // 为了保证代码的美观性，只有表达式位于最后才需要添加空的插入
              const transferStr = val.replace(/\s*CASCADE/, '').replace(/\s/g, '*');
              if (
                transferStr.length === currentPosition.column ||
                transferStr?.length + 1 === currentPosition.column
              ) {
                setEditorVal(''); // 塞入一个空指，保证代码块下一次能触发选中
              }
            } else {
              editorIns.current.setSelections([selection]); // 选中块
            }
          }
        });

        event.preventDefault();
        event.stopPropagation();
      }
    };

    if (editorIns.current) {
      editorIns.current.onMouseUp(({ event }) => {
        onEvent(event);
      });
      editorIns.current.onKeyUp(keyBoardEvent => {
        if (
          keyBoardEvent.keyCode === KeyCode.UpArrow ||
          keyBoardEvent.keyCode === KeyCode.DownArrow ||
          keyBoardEvent.keyCode === KeyCode.LeftArrow ||
          keyBoardEvent.keyCode === KeyCode.RightArrow ||
          keyBoardEvent.keyCode === KeyCode.Backspace
        ) {
          onEvent(keyBoardEvent);
        }
      });
    }

    // // Register a new language
    monaco.languages.register({ id: 'sql' });

    // // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider('sql', {
      tokenizer: {
        root: [[/CASCADE\(.*?\)/, 'block']],
      },
    });

    /**
     * 代码提示
     */
    provider = monaco.languages.registerCompletionItemProvider(language as string, {
      provideCompletionItems(/* model, position, context, token */) {
        const suggestions: ISuggestions[] = [];

        // 字段的提示
        getFlatFun().forEach(item => {
          suggestions.push(
            // 添加contact()函数
            {
              label: item, // 显示名称
              kind: monaco.languages.CompletionItemKind.Function, // 这里Function也可以是别的值，主要用来显示不同的图标
              insertText: item, // 实际粘贴上的值
            }
          );
        });
        return {
          suggestions,
        } as any;
      },
    });

    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme('myCoolTheme', {
      base: 'vs',
      inherit: true,
      rules: [{ token: 'block', foreground: '2b7de6', fontStyle: 'bold', background: 'EDF9FA' }],
      colors: {
        // 相关颜色属性配置
        'editor.background': '#fff', // 背景色
        'block.background': 'blue',
        'block.foreground': 'blue',
        //  'editor.selectionBackground': 'red',
        //  'editor.inactiveSelectionBackground': 'red',
      },
    });

    monaco.editor.setTheme('myCoolTheme');

    // 编辑器聚焦
    if (!disabled) {
      editor.focus();
    }
  };

  /**
   * 编辑器change回调
   * @param {String} val 当前编辑器的值
   */
  const onChangeHandle = (val: string): void => {
    setCode(val);
    if (isFunction(formDs?.current?.set) && name) {
      const temp = dataMapTransfer(val, formulaMappingList, 'meaning', 'value');
      // eslint-disable-next-line no-unused-expressions
      formDs?.current?.set(name, temp);
    }
  };

  /**
   * 设置编辑器的值
   * @param value 值
   * @param valType 类型
   * @param valueList 值列表
   */
  const setEditorVal = (value: string | undefined): void => {
    // 排除 value 为 null 的值
    if (value === undefined || value === null) return;
    if (editorIns?.current && (value || value === '')) {
      const selection = editorIns?.current?.getSelection?.();
      const range = new monaco.Range(
        selection?.startLineNumber,
        selection?.startColumn,
        selection?.endLineNumber,
        selection?.endColumn
      );
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: value || ' ', forceMoveMarkers: true };
      editorIns.current.executeEdits('', [op]);
      if (!disabled) {
        editorIns.current.focus();
      }
    }
  };

  /**
   * 渲染钻取组件
   * @returns
   */
  const drillRenderer = () => {
    return (
      <DrillComponent
        name="field"
        isWriteBack={false}
        curFieldCode={businessObjectFieldCode}
        {...DrillComponentProps}
        onOk={handleOk}
        businessObjectCode={businessObjectCode}
      />
    );
  };

  const editFormDS = useMemo(() => {
    return new DataSet({
      ...EditHeaderFormDS(),
      events: {
        update: ({ value, dataSet }) => {
          if (value) {
            const str = value.split('#')?.[0];
            if (str !== 'title') {
              setEditorVal(value);
            } else {
              dataSet.current.set('logic', undefined);
            }
          }
        },
      },
    });
  }, []);

  const options = {
    roundedSelection: false,
    cursorStyle: 'line',
    automaticLayout: true,
    selectOnLineNumbers: true,
    renderSideBySide: false,
    ...editorOptions,
    readOnly: disabled,
  };

  return (
    <div className={styles['formula-editor']}>
      <div className={styles['config-form']}>
        <Form dataSet={editFormDS} columns={3} disabled={disabled} style={{ width: '100%' }}>
          <Output name="field" renderer={drillRenderer} />
          <TreeSelect name="logic" searchable>
            {arithmetic.map(item => {
              return (
                <TreeNode value={`title#${item.value}`} title={item.meaning}>
                  {item.children.map(i => {
                    return <TreeNode value={i.value} title={i.meaning} />;
                  })}
                </TreeNode>
              );
            })}
          </TreeSelect>
          <TreeSelect name="fun" searchable>
            {fun.map(item => {
              return (
                <TreeNode value={`title#${item.value}`} title={item.meaning}>
                  {item.children.map(i => {
                    return <TreeNode value={i.value} title={i.meaning} />;
                  })}
                </TreeNode>
              );
            })}
          </TreeSelect>
        </Form>
      </div>
      <MonacoEditor
        width="100%"
        height="280px"
        theme="myCoolTheme"
        value={code}
        options={options as any}
        language={language}
        editorDidMount={editorDidMountHandle}
        onChange={onChangeHandle}
      />
      {disabled ? null : (
        <Tooltip title={intl.get('hmde.common.message.validete').d('校验')} placement="top">
          <Icon type="" className={styles['data-check-icon-page']} onClick={handleCheck} />
        </Tooltip>
      )}
    </div>
  );
}
