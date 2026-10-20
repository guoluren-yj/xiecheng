/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-shadow */
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { DataSet, Tree } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';
import { isNil } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import { transformTreeToArr } from 'hzero-front/lib/utils/utils';
import { getFormulaList } from '../../../utils/constant';
import styles from './index.less';
import ParamEditor from './component/ParamEditor';

const nodeRenderer = ({ record }) => {
  const isLeaf = !!record.get('parentCode');
  if (isLeaf) {
    return (
      <div className={styles['tree-leaf-node']}>
        <div>{record.get('text')}</div>
        <Tooltip title={record.get('desc')}>
          <div className="func-desc">
            <div className="desc-content">{record.get('desc')}<span className="mask-ellipsis" /></div>
            <div className='block-mask'>...</div>
          </div>
        </Tooltip>
      </div>
    );
  } else {
    return record.get('text');
  }
};

function FormulaEditor({ cell, editorRef, fieldTreeDs, cycleBlock, sheetRef, isInFixedArea, labelCode }) {
  const [func, setFunc] = useState(null);
  const [funcCache, setFuncCache] = useState({});
  const [activeFunc, setActiveFunc] = useState();
  const [paramList, setParamList] = useState([]);
  const [updateState, updateByStateChange] = useState(false);
  const treeDs = useMemo(() => {
    return new DataSet({
      selection: 'single',
      expandField: 'expand',
      idField: 'code',
      parentField: 'parentCode',
      fields: [
        { name: 'code' },
        { name: 'text' },
        { name: 'parentCode' },
        { name: 'expand', type: 'boolean' },
      ],
      data: transformTreeToArr(
        getFormulaList(),
        'code',
        'children',
        'code',
        'parentCode'
      ).map((i) => ({ ...i, key: i.code })),
    });
  }, []);

  useEffect(() => {
    if (cell && cell.extra) {
      const { funcCode, funcType, paramList } = cell.extra;
      treeDs.find((record) => {
        if (funcType && record.get('code') === funcType) {
          record.set('expand', true);
        } else if (record.get('code') === 'common') {
          record.set('expand', true);
        }
        if (funcCode && record.get('code') === funcCode) {
          record.isSelected = true;
          setParamList(paramList);
          const funcData = { ...record.toData(), paramList };
          setFuncCache({ [funcCode]: { funcData, paramList: null } });
          setActiveFunc(funcData);
          setFunc(funcData);
        }
      });
    } else {
      treeDs.find((record) => {
        if (record.get('code') === 'common') {
          record.set('expand', true);
        }
      });
    }
  }, [cell, treeDs]);

  const getData = useCallback(() => {
    let flag = true;
    let newParamList;
    if (paramList && paramList.length > 0) {
      const checkParams = (params = []) => {
        return params.map((p) => {
          if (p.required && isNil(p.value) && isNil(p.child)) {
            flag = false;
            p.invalid = true;
          }
          if (p.child && p.child.paramList) {
            p.child.paramList = checkParams(p.child.paramList);
          }
          return p;
        });
      };
      newParamList = checkParams(paramList);
      setParamList(newParamList);
    }
    if (!flag) {
      return false;
    }
    return {
      ...activeFunc,
      paramList: newParamList,
    };
  }, [activeFunc, paramList]);
  useImperativeHandle(editorRef, () => ({
    getData,
  }), [getData]);
  const handleSelect = useCallback(
    (_, { node }) => {
      const { isLeaf, record } = node;
      const funcData = record.toData();
      const { code } = funcData;
      if ((!activeFunc || activeFunc.code !== code) && isLeaf) {
        let lasFuncData = {};
        if (activeFunc) {
          lasFuncData = {
            [activeFunc.code]: { funcData, paramList },
          };
        }
        setFuncCache({ ...funcCache, ...lasFuncData });
        let newParamList = funcData.paramList;
        let newFuncData = funcData;
        if (funcCache[code]) {
          newParamList = funcCache[code].paramList || funcData.paramList;
          newFuncData = { ...funcCache[code].funcData, ...funcData };
        }
        setActiveFunc(newFuncData);
        setParamList(newParamList);
        setFunc(newFuncData);
      }
    },
    [activeFunc, funcCache, paramList]
  );
  const changeParamValue = useCallback((param, nest) => {
    const clearValidate = (params = []) => {
      return params.map((p) => {
        if (p === param) {
          delete p.invalid;
          return {
            ...p,
          };
        }
        if (p.child && p.child.paramList) {
          p.child.paramList = clearValidate(p.child.paramList);
        }
        return p;
      });
    };
    // 嵌套函数模式下，直接修改引用内的值，所以直接使用paramList的解构，以触发重新渲染
    if (nest > 0) {
      setParamList(clearValidate([...paramList]));
    } else {
      setParamList(clearValidate(paramList.map((p) => {
        if (p.name === param.name) {
          return param;
        } else {
          return p;
        }
      })));
    }
  }, [paramList]);

  const handleAddParam = useCallback((activeFunc, nest, { event: e }) => {
    const { paramListFormat } = activeFunc;
    let index = 0;
    let newParamList = [];
    if (nest) {
      index = activeFunc.paramList[activeFunc.paramList.length - 1].index + 1;
      newParamList = activeFunc.paramList.concat({
        index,
        name: paramListFormat.name.replace('${number}', index),
        label: paramListFormat.label,
        required: paramListFormat.required,
        type: 'dynamic',
      });
      activeFunc.paramList = newParamList;
      updateByStateChange(!updateState);
    } else {
      index = paramList[paramList.length - 1].index + 1;
      newParamList = paramList.concat({
        index,
        name: paramListFormat.name.replace('${number}', index),
        label: paramListFormat.label,
        required: paramListFormat.required,
        type: 'dynamic',
      });
      setParamList(newParamList);
    }
    if (e && e.target) {
      const editorEstimateOffsetWidth = 120;
      const container = document.querySelector("#print-tpl-formula-editor-container");
      const rootEditor = container.querySelector(".root-editor");
      const contentWidth = rootEditor.offsetWidth + editorEstimateOffsetWidth;

      let sumOffsetLeft = 0;
      let parentNode = e.target.parentNode;
      while(rootEditor && parentNode && parentNode !== rootEditor) {
        if (getComputedStyle(parentNode).position === "relative") {
          sumOffsetLeft += parentNode.offsetLeft;
        }
        parentNode = parentNode.parentNode;
      }
      // 848为容器内容区域实际宽度
      const elePos = e.target.offsetLeft + sumOffsetLeft + editorEstimateOffsetWidth;
      // 计算如果将点击的参数移动到容器中间时超出左右两侧边界的距离。
      const leftRemain = elePos - 424;
      const rightRemain = contentWidth - elePos - 424;
      // 计算元素当前所在位置，左侧超出容器的距离
      const currentLeftRemain = container.scrollLeft;
      // 计算尽可能移动到中心时，横坐标的位移距离
      let moveX = leftRemain;
      // leftRemain和rightRemain不可能同时小于0，否则不会通过contentWidth > 848的判断
      if (leftRemain < 0) moveX = -currentLeftRemain;
      if (rightRemain < 0) moveX = contentWidth - 848;
      setTimeout(() => {
        container.scrollTo({
          top: 0,
          left: moveX,
        });
      }, 0);
    }
  }, [updateState, paramList]);

  const handleRemoveNestFunc = useCallback((e, param) => {
    if (!param) return;
    delete param.child;
    updateByStateChange(!updateState);
    setFunc(activeFunc);
    e.stopPropagation();
    e.preventDefault();
  }, [updateState, paramList, func, activeFunc]);

  const onRemoveParam = useCallback((param, nest) => {
    const newParamList = paramList.filter((p) => p.name !== param.name);
    // 嵌套函数模式下，直接修改引用内的值，所以直接使用paramList的解构，以触发重新渲染
    setParamList(nest? [...paramList] : newParamList);
  }, [paramList]);

  const setDescByClickFunc = useCallback((e, funcInfo) => {
    setFunc(funcInfo);
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);
  return (
    <div className={styles.content}>
      <div className={styles['content-left']}>
        <div className='left-tree'>
          <Tree
            className={styles["tree-common"]}
            showIcon
            showLine={{ showLeafIcon: false }}
            dataSet={treeDs}
            renderer={nodeRenderer}
            onSelect={handleSelect}
            filter={(record) => isInFixedArea || record.get("code") !== "PAGE_TOTAL"}
          />
        </div>
      </div>
      <div className={styles['content-right']}>
        {renderExpression(activeFunc, {
          fieldTreeDs, cycleBlock, sheetRef,
          isInFixedArea, parentFunc: activeFunc,
          changeParamValue, onRemoveParam, setDescByClickFunc, labelCode,
        }, { handleAddParam, handleRemoveNestFunc, paramList, setDescByClickFunc })}
        {renderFormulaDesc(func)}
      </div>
    </div>
  );
}

function renderExpression(activeFunc, editorProps, renderOptions, editor) {
  if (!activeFunc) {
    return;
  }
  const { nest = false, handleAddParam, paramList, sourceParam, handleRemoveNestFunc, setDescByClickFunc } = renderOptions;
  const { code, dynamicParamList } = activeFunc;
  const paramListLength = paramList ? paramList.length : 0;
  const node = (
    <>
      <span className='expression-func-code'>{code}</span>
      <span className='expression-activeFunc-brackets'>(</span>
      {paramListLength > 0 &&
        paramList.map((param, index) => renderParamEditor(param, {
          ...renderOptions, index, count: paramListLength,
        }, editorProps))}
      {dynamicParamList && paramListLength < 20 && (
        <>
          <span>,</span>
          <Icon type="add" onClick={(e) => handleAddParam(activeFunc, nest, { event: e })} />
        </>
      )}
      <span className='expression-activeFunc-brackets'>)</span>
    </>
  );
  if (nest) {
    return (
      <div className={styles['nest-expression-editor']} onMouseLeave={clearNestHover} onClick={(e) => setDescByClickFunc(e, activeFunc)}>
        {editor}
        {node}
        <Icon type="close" className="nest-clear" onClick={(e) => handleRemoveNestFunc(e, sourceParam)} />
      </div>
    );
  }
  return (
    <div className={styles['expression-editor']} id="print-tpl-formula-editor-container">
      <div className="editor-title">{intl.get("hrpt.reportDesign.view.title.editFormula").d("编辑公式")}</div>
      {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
      <div onMouseOver={onNestHover} onMouseLeave={clearNestHover} className='root-editor' onClick={(e) => setDescByClickFunc(e, activeFunc)}>
        {node}
      </div>
    </div>
  );
}

function renderParamEditor(param, options, editorProps) {
  const { index, count, ...otherRenderOptions } = options;
  const { name, child } = param;
  // 是否是最后一个
  const isLast = count - index === 1;
  const editor = (
    <ParamEditor
      {...editorProps}
      key={name}
      // 注意嵌套函数的param一定是原对象引用
      param={param}
      childMode={!!child}
    />
  );
  return (
    <>
      {child ? renderExpression(child, {
        ...editorProps, parentFunc: child, nest: true,
      }, {
        ...otherRenderOptions, nest: true, sourceParam: param, paramList: child.paramList,
      }, editor) : editor}
      {!isLast && <span>,</span>}
    </>
  );
}

function renderFormulaDesc(func) {
  if (!func) {
    return;
  }
  return (
    <div className={styles['func-desc']}>
      <div className="func-code">{func.code}</div>
      <p>
        <span className={styles['func-desc-title']}>
          {intl.get('hrpt.reportDesign.view.title.formulaName').d('函数名')}：
        </span>
        {func.expression}
      </p>
      <p>
        <span className={styles['func-desc-title']}>
          {intl.get('hrpt.reportDesign.view.title.FunctionDesc').d('功能说明')}：
        </span>
        {func.desc}
      </p>
      {func.example && (
        <p>
          <span className={styles['func-desc-title']}>
            {intl.get('hrpt.reportDesign.view.title.exampleInput').d('示例')}：
          </span>
          <div className={styles['func-param-list']}>{func.example}</div>
        </p>
      )}
      {func.exampleResult && (
        <p>
          <span className={styles['func-desc-title']}>
            {intl.get('hrpt.reportDesign.view.title.exampleResult').d('返回')}：
          </span>
          <div className={styles['func-param-list']}>{func.exampleResult}</div>
        </p>
      )}
    </div>
  );
}

function onNestHover(e) {
  let node = e.target;
  while (node) {
    if (node.classList && (node.classList.contains(styles['nest-expression-editor']) || node.classList.contains("root-editor"))) {
      const oldList = document.querySelectorAll(`.${styles['expression-editor-hover']}`);
      if (oldList && oldList.length) {
        oldList.forEach(n => n.classList.remove(styles['expression-editor-hover']));
      }
      node.classList.add(styles['expression-editor-hover']);
      break;
    }
    node = node.parentNode;
  }
}
function clearNestHover() {
  const oldList = document.querySelectorAll(`.${styles['expression-editor-hover']}`);
  if (oldList && oldList.length) {
    oldList.forEach(n => n.classList.remove(styles['expression-editor-hover']));
  }
}
export default observer(FormulaEditor);
