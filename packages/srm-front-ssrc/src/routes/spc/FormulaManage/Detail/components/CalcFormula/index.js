import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useDataSet, Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';
import { ReactComponent as CountFormulaImg } from '@/assets/count-formula.svg';
import intl from 'utils/intl';
import { FieldDS } from './store';
import styles from './style.less';
import TreeList from './TreeList';
import { formulaVerify, pasteHtmlAtCaret, autoFocusEnd, FormulaRender } from '../../../utils';

// const { TabPane } = Tabs;

const Index = (props) => {
  const originFormulaList = [
    {
      id: '9999',
      langStr: intl.get('spc.formulaManage.view.title.originFormula').d('原公式'),
      parentId: null,
      expand: true,
    },
    {
      dtoCode: 'originFormula',
      id: '1-1',
      isEnd: null,
      langStr: intl.get('spc.formulaManage.view.title.originFormula').d('原公式'),
      parentId: '9999',
    },
  ];

  const { isEdit, originFormula, record, onBlur = noop, functionList = [], fieldList = [] } = props;
  const { operationalFormulaName, operationalFormula } = record?.toData() || {};
  const [_currRange, setCurrRange] = useState(undefined);
  const [errorTips, setErrorTips] = useState(
    intl.get('spc.formulaManage.view.message.formulaRequired').d('计算公式不能为空')
  );
  const editableDivRef = useRef({});
  const treeListDS = useDataSet(() => FieldDS, []);
  // const originFormulaDS = useDataSet(() => FieldDS, []);
  const functionDS = useDataSet(() => FieldDS, []);

  const editableDivRefCurrent = useMemo(() => editableDivRef.current, [editableDivRef.current]);

  useEffect(() => {
    if (operationalFormula) {
      setErrorTips(null);
      onBlur({
        operationalFormula,
      });
    }
  }, [operationalFormula]);

  useEffect(() => {
    treeListDS.loadData(fieldList.map((item) => ({ ...item, expand: true })));
    if (originFormula) {
      treeListDS.appendData(originFormulaList);
    }
    // originFormulaDS.loadData(originFormulaList);
    functionDS.loadData(functionList);
  }, [fieldList, originFormula, functionList]);

  useEffect(() => {
    if (editableDivRefCurrent) {
      // 设置当前展示页面为传入值
      editableDivRef.current.innerHTML = operationalFormulaName || '';

      // 记录当前光标选中区域
      document.addEventListener('selectionchange', () => {
        if (document.activeElement === editableDivRef.current) {
          const currentRange = getRange();
          setCurrRange(currentRange);
        }
      });
    }
    return () => {
      document.removeEventListener('selectionchange', () => { });
    };
  }, []);

  useEffect(() => {
    if (editableDivRefCurrent) {
      // 设置当前展示页面为传入值
      editableDivRef.current.innerHTML = operationalFormulaName || '';
    }
  }, [operationalFormulaName]);

  const setTextArea = useCallback(
    (selectRecord, isFixed = true) => {
      const { dtoCode } = selectRecord;
      if (!dtoCode) return;
      let autoFocusRange = null;
      if (editableDivRefCurrent && selectRecord) {
        const currentDom = editableDivRef.current;
        // 如果未选中区域，自动聚焦到最后面，然后获取光标位置
        if (!_currRange) {
          autoFocusEnd(currentDom);
          autoFocusRange = getRange();
        }
        // 将字符插入光标所在位置，根据是否固定决定是否添加样式
        pasteHtmlAtCaret(selectRecord, currentDom, _currRange || autoFocusRange, isFixed);
        currentDom.focus();
      }
    },
    [_currRange]
  );

  const getCodeFromFormula = (dom) => {
    const codeList = [];
    const formulaList = [];
    const parseCodeVariable = (nodes) => {
      const list = Array.from(nodes);
      list.forEach((node) => {
        const { childNodes = [], id, data, contentEditable } = node;
        // 有子节点并且是可编辑的，进行递归遍历
        if (childNodes && childNodes.length !== 0 && contentEditable !== 'false') {
          return parseCodeVariable(childNodes);
        }
        codeList.push(id || data);
        // formulaList.push(id ? `\${${id}}` : data);
        formulaList.push(id || data);
      });
    };
    parseCodeVariable(dom);
    const _newCode = codeList.join('');
    const _newFormula = formulaList.join('');
    return { _newCode, _newFormula };
  };

  const handleBlur = (e) => {
    const {
      target: { innerHTML, childNodes },
    } = e;
    const { _newCode, _newFormula } = getCodeFromFormula(childNodes);
    // 校验输入公式
    const errorFlag = formulaVerify(_newFormula);
    if (errorFlag) {
      setErrorTips(errorFlag);
      onBlur({});
      return;
    }
    if (!_newFormula) {
      setErrorTips(
        intl.get('spc.formulaManage.view.message.formulaRequired').d('计算公式不能为空')
      );
      onBlur({});
      return;
    }
    if (errorTips) {
      setErrorTips(null);
    }
    onBlur({
      operationalFormula: _newCode,
      operationalFormulaName: innerHTML,
    });
  };

  // 保存选区（记录光标位置）
  const getRange = () => {
    const selection = window.getSelection();
    if (selection.getRangeAt && selection.rangeCount) {
      return selection.getRangeAt(0);
    }
  };

  return !isEdit ? (
    <>
      {operationalFormula ? (
        <Form
          labelLayout="vertical"
          className='c7n-pro-vertical-form-display'
          columns={1}
        >
          <Output
            label={intl.get('spc.formulaManage.view.title.calcFormula').d(`计算公式`)}
            renderer={() => FormulaRender(operationalFormulaName)}
          />
        </Form>
      ) : (
        <div className={styles['preview-no-content-wrapper']}>
          <span className={styles['no-content-img']}>
            <CountFormulaImg />
          </span>
          <span className={styles['no-content-text']}>
            {intl.get('spc.formulaManage.view.message.noCountFormula').d('暂无计算公式')}
          </span>
        </div>
      )}
    </>
  ) : (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <TreeList dataSet={treeListDS} onClick={setTextArea} />
      </div>
      <div className={styles.center}>
        <div className={styles.centerTop}>
          <h3 className={styles.calcFormulaTitle}>
            {intl.get('spc.formulaManage.view.title.editFormula').d('编辑公式')}
          </h3>
          <div
            ref={editableDivRef}
            contentEditable="true"
            className={styles.calcFormulaWrapper}
            placeholder={intl
              .get('spc.formulaManage.view.message.pleaseInputFormula')
              .d('请输入公式')}
            onBlur={handleBlur}
          />
        </div>
        {errorTips && <div className={styles.errorTips}>{errorTips}</div>}
      </div>
      <div className={styles.left}>
        <TreeList searchFieldPlaceholder={intl.get('spc.formulaManage.view.functionName').d('请输入函数名称查询')} dataSet={functionDS} onClick={(langStr) => setTextArea(langStr, false)} />
        {/* <Tabs defaultActiveKey="1">
          <TabPane tab={intl.get('spc.formulaManage.view.title.function').d('函数')} key="1">
            <TreeList showSearch={false} dataSet={functionDS} onClick={(langStr) => setTextArea(langStr, false)} />
          </TabPane>
          <TabPane tab={intl.get('spc.formulaManage.view.title.operator').d('运算符')} key="2">
            <div className={styles.operatorWrapper}>
              {operatorTypeList.map(type => (
                <div className={styles.line}>

                  {operatorList.filter(opeator => opeator.tag === type).map((opeator, index) => {
                    const { value, description } = opeator;
                    return (
                      <>
                        {index === 0 && (
                          <div className={styles.title}>
                            {description}
                          </div>
                        )}
                        <Tag color="#F2F3F5" style={{ color: '#101319' }} onClick={() => setTextArea(value)}>
                          {value}
                        </Tag>
                      </>
                    );
                  }
                  )}
                </div>
              ))}
            </div>
          </TabPane>
        </Tabs> */}
      </div>
    </div>
  );
};

export default observer(Index);
