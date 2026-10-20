import React, { useMemo, useImperativeHandle, useState, useRef, useEffect } from 'react';
import {
  DataSet,
  Form,
  Icon,
  NumberField,
  Output,
  Select,
  TextField,
  Tooltip,
  CheckBox,
  TreeSelect,
  message,
  IntlField,
  Lov,
} from 'choerodon-ui/pro';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { uniqBy } from 'lodash';
import { observer } from 'mobx-react-lite';
import notification from 'hzero-front/lib/utils/notification';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { drillFormulaReg, IBlockDataItemProps, SourceType } from '@/businessGlobalData/common';
import DrillComponent, { IParams } from '@/components/DrillComponent';
import MultiIntlField from '@/businessComponents/MultiIntlField';
import ImgIcon from '@/utils/ImgIcon';
import { getArithmetic, fun } from '../../constants/constants';
import FormulaDS from './FormulaDS';
import FormDS from './FormDS';
import styles from './style.less';
import { dataMapTransfer, formula2Desc } from './utils';

let provider = {
  dispose: () => { },
};

const isTenant = isTenantRoleLevel();

interface ISuggestions {
  label: string;
  kind: monaco.languages.CompletionItemKind;
  insertText: string;
  detail?: string;
}
const formulaMappingList: any[] = []; // 用于做meaning和value的映射

interface IProps {
  childrenComRef: any;
  disabled?: boolean;
  businessObjectCode?: string | number;
  isExtensionField?: boolean;
  isFromDomain?: boolean;
  isEditMode?: boolean;
  customPrimaryKeyCode?: string;
  boSourceType?: string;
}

function Index(props: IProps) {
  const {
    isExtensionField,
    isFromDomain,
    businessObjectCode,
    customPrimaryKeyCode,
    disabled,
    isEditMode,
    boSourceType,
  } = props;

  // 代码块算法 start
  const { Range, Selection, KeyCode } = monaco;

  const { TreeNode } = TreeSelect;

  const monacoInstance = useRef<any>();

  const editorIns = useRef<any>();

  const [language] = useState(() => 'sql');

  const [code, setCode] = useState<string>('');

  const [curFieldCode, setCurFieldCode] = useState<string>('');

  const [type, setType] = useState<string>('');

  const [refList, setRefList] = useState<any>({});

  const [refState, setRefState] = useState<boolean>(true);

  const formulaDs = useMemo(
    () =>
      new DataSet({
        ...FormulaDS(isExtensionField, isFromDomain, customPrimaryKeyCode),
        events: {
          update: ({ record, name, value }) => {
            if (name === 'resultType') {
              record.set('timeZoneConvertFlag', value === 'ZonedDateTime');
              if (value) {
                setType(value);
                record.set("configLov", false);
                record.set("valueList", undefined);
                record.set("displayFormat", undefined);
                if (value === 'ZonedDateTime') {
                  record.set('displayFormat', 'YYYY-MM-DD HH:mm:ss');
                }
              }
            }
          },
        },
      }),
    [isExtensionField, isFromDomain, customPrimaryKeyCode, isExtensionField]
  );

  const formDs = useMemo(
    () =>
      new DataSet({
        ...FormDS(),
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
      }),
    []
  );

  const options = {
    roundedSelection: false,
    readOnly: disabled || (isTenant && isEditMode && !isExtensionField),
    cursorStyle: 'line',
    automaticLayout: true,
    selectOnLineNumbers: true,
    renderSideBySide: false,
  };

  useEffect(
    () => () => {
      provider.dispose(); // 弹窗关闭后 销毁编辑器实例
    },
    []
  );

  // useEffect(() => {
  //   console.log(formulaDs?.current?.get('formula'));
  // }, [formulaDs?.current?.get('formula')]);

  // 客制化的数据初始化
  const init = initData => {
    const { referenceInfoList = [], formula = '', formulaAnalyzeResult } = initData || {};
    if (formulaAnalyzeResult) {
      setRefList(formulaAnalyzeResult);
      setRefState(formulaAnalyzeResult?.success);
    }
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
    setType(initData?.attributeJson?.resultType);
    setCurFieldCode(initData?.businessObjectFieldCode);
    setCode(desc);
    if (formulaDs.current?.get('valueList')) {
      formulaDs.current.set('configLov', true);
    }
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

  // 维护需要暴露给父组件的api 一般是ds
  useImperativeHandle(props?.childrenComRef, () => ({
    formulaDs, // 务必维护和组件名称一致后缀加Ds 方便父组件调用
    customInitChild: initData => init(initData),
  }));

  /**
   *
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
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: value || ' ', forceMoveMarkers: true };
      editorIns.current.executeEdits('', [op]);
      editorIns.current.focus();
    }
  };

  /**
   * 编辑器change回调
   * @param {String} val 当前编辑器的值
   */
  const onChangeHandle = (val: string): void => {
    setCode(val);
    const temp = dataMapTransfer(val, formulaMappingList, 'meaning', 'value');
    // eslint-disable-next-line no-unused-expressions
    formulaDs?.current?.set('formula', temp);
  };

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
            bData.startLineNumber,
            bData.startColumn,
            bData.endLineNumber,
            bData.endColumn,
          ];
          // 块的区域，'#field_标题#'，没算上引号的，但是选中要带上引号，所以startColumn - 1 且 data.endColumn + 1
          const selectData = [
            bData.startLineNumber,
            bData.startColumn - 1,
            bData.endLineNumber,
            bData.endColumn,
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
        [
          'CASEWHEN(expression1, value1, expression2, value2, ..., else_value)',
          'CONCAT(str1, str2, ...)',
          'ISNULL (expression, defaultValue)',
          'DATEDIFF_YEAR(startdate,enddate)',
          'DATEDIFF_MONTH(startdate,enddate)',
          'DATEDIFF_DAY(startdate,enddate)',
          'SUM(expression)',
          'AVG(expression)',
          'MAX(expression)',
          'MIN(expression)',
          'COUNT(expression)',
          'DISTINCTCOUNT(expression)',
          'DISTINCTAVG(expression)',
          'DISTINCTSUM(expression)',
          'NOW()',
        ].forEach(item => {
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
    editor.focus();
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

  const drillRenderer = () => {
    return (
      <DrillComponent
        onOk={handleOk}
        name="field"
        businessObjectCode={businessObjectCode as string} // TODO: 这里目前写死了，因为没数据，后面要调整
        isWriteBack={false}
        curFieldCode={curFieldCode}
        initDrillParams={{
          drillPublishFlag: false, // 传false钻取非发布的数据
        }}
      />
    );
  };

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
        () => { },
        'top'
      );
      return true;
    }
  };

  const renderer = () => {
    return (
      <div className={styles['formula-editor']}>
        <div className={styles['config-form']}>
          <Form
            dataSet={formDs}
            columns={3}
            style={{ width: '100%' }}
            disabled={
              disabled ||
              (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
              (isEditMode && isTenant && !isExtensionField)
            }
          >
            <Output name="field" renderer={drillRenderer} />
            <TreeSelect name="logic" searchable>
              {getArithmetic().map(item => {
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
                return item.children.map(i => {
                  return <TreeNode value={i.value} title={i.meaning} />;
                });
                // <TreeNode value={item.value} title={item.meaning}>
                //   {item.children.map((i) => {
                //     return <TreeNode value={i.value} title={i.meaning} />;
                //   })}
                // </TreeNode>
              })}
            </TreeSelect>
          </Form>
        </div>
        <MonacoEditor
          width="100%"
          height="280px"
          language={language}
          value={code}
          options={options as any}
          onChange={onChangeHandle}
          editorDidMount={editorDidMountHandle}
          theme="myCoolTheme"
        />
        <Tooltip title={intl.get('hmde.common.message.validete').d('校验')} placement="top">
          <Icon type="" className={styles['data-check-icon-page']} onClick={handleCheck} />
        </Tooltip>
      </div>
    );
  };

  return (
    <>
      <Form
        dataSet={formulaDs}
        columns={4}
        labelLayout={LabelLayout.float}
        disabled={disabled || (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode)}
      >
        {!isFromDomain && !isExtensionField && (
          <>
            <IntlField
              name="businessObjectFieldName"
              colSpan={2}
              suffix={<Icon type="language" />}
            />
            <TextField name="businessObjectFieldCode" colSpan={2} disabled={isEditMode} />
          </>
        )}
        {!isFromDomain && isExtensionField && isTenant && (
          <>
            <IntlField name="inheritFieldName" colSpan={2} suffix={<Icon type="language" />} />
            <TextField name="inheritFieldCode" colSpan={2} disabled={isEditMode} />
          </>
        )}
        {isFromDomain && !isExtensionField && (
          <>
            <IntlField name="templateFieldName" colSpan={2} suffix={<Icon type="language" />} />
            <TextField name="templateFieldCode" colSpan={2} disabled={isEditMode} />
          </>
        )}
        <MultiIntlField
          name="helpText"
          record={formulaDs.current}
          init={formulaDs.current?.get('helpText')}
          textFieldStyle={{ height: '85px' }}
          disabled
        // disabled={
        //   (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
        //   (isTenant && isEditMode && !isExtensionField)
        // }
        />
        {/* <Output
          name="helpText"
          key="helpText"
          colSpan={2}
          renderer={({ record }) => {
            return (
              <MultiIntlField
                name="helpText"
                record={record}
                init={record?.get('helpText')}
                textFieldStyle={{ height: '85px' }}
                disabled
              // disabled={
              //   (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
              //   (isTenant && isEditMode && !isExtensionField)
              // }
              />
            );
          }}
        /> */}
        <IntlField
          name="remark"
          colSpan={2}
          style={{ height: '85px' }}
          suffix={<Icon type="language" />}
          disabled={isTenant && isEditMode && !isExtensionField}
        />
        <Select name="resultType" disabled={isTenant && !isExtensionField} />
        {['String', 'Long'].includes(type) && (
          <>
            <CheckBox name='configLov' />
            <Lov name='valueList' />
          </>
        )}
        {['BigDecimal'].includes(type) && (
          <NumberField
            name="digitalAccuracy"
            disabled={isEditMode && isTenant && !isExtensionField}
          />
        )}
        {['BigDecimal', 'Long'].includes(type) && (
          <CheckBox name="thousandsFlag" disabled={isEditMode && isTenant && !isExtensionField} />
        )}
        {['LocalDate'].includes(type) && (
          <Select name="displayFormat" disabled={isEditMode && isTenant && !isExtensionField} />
        )}
        {['ZonedDateTime'].includes(type) && (
          <CheckBox name="timeZoneConvertFlag" disabled={isEditMode && isTenant && !isExtensionField} />
        )}
      </Form>
      {!refState && (
        <div className={styles['tip-contain-warn']}>
          <div>
            <ImgIcon name="publish_fail_icon.svg" size={14} />
            <span>{refList?.message}</span>
          </div>
          <ImgIcon name="publish_fail_red.png" style={{ width: '195px', height: '28px' }} />
        </div>
      )}
      <Form
        dataSet={formulaDs}
        columns={4}
        labelLayout={LabelLayout.float}
        disabled={
          disabled ||
          (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
          (isEditMode && isTenant && !isExtensionField)
        }
      >
        <Output name="formula" colSpan={4} renderer={renderer} />
        <CheckBox
          key="exportableFlag"
          name="exportableFlag"
          disabled={isTenant && isEditMode && !isExtensionField}
        />
      </Form>
    </>
  );
}

export default formatterCollections({ code: ['hmde.common', 'hmde.bo', 'hzero.common'] })(
  observer(Index)
);
