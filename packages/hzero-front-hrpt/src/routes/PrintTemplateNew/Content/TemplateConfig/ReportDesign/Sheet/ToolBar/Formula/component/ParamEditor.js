import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import classnames from 'classnames';
import { Modal, Tooltip, Lov, DataSet } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { isNil, debounce } from 'lodash';

import { isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import ParamModal from './ParamModal';
import styles from '../index.less';
import { exitEditMode } from '../../../../utils/utils';
import DateFormatPicker from './DateFormatPicker';
import NumberFormatPicker from './NumberFormatPicker';
import Store from '../../../../store';

export default function ParamEditor({
  param,
  sheetRef,
  fieldTreeDs,
  cycleBlock,
  changeParamValue,
  setDescByClickFunc,
  onRemoveParam,
  isInFixedArea,
  parentFunc,
  nest, // 表明当前editor是嵌套函数的editor
  childMode, // 表明当前editor已经选择过函数，此时节点返回空
  labelCode,
}) {
  const [paramValue, setParamValue] = useState();
  const [invalid, setInvalid] = useState(true);
  const componentRef = useRef();
  const customeRenderRef = useRef();
  const componentDs = useMemo(() => {
    const lovPara = {
      lovGridQueryFlag: 0
    };
    if (!isTenantRoleLevel()) {
      lovPara.tenantId = 0;
    }
    if (labelCode) {
      lovPara.labelCode = labelCode;
    }
    const fields = [];
    if (param.type === 'component') {
      fields.push({
        name: param.name,
        lovPara,
        ...param.componentProps,
      });
    }
    return new DataSet({
      fields,
    });
  }, [param]);

  useEffect(() => {
    if (!param.child) {
      setParamValue(param.value);
    }
    setInvalid(param.invalid);
  }, [param.value, param.invalid]);
  const handleSubmit = useCallback((newParamValue) => {
    // nestFlag > 0时，changeParamValue不应该用newParam去更新，直接修改原参数对象引用的方式更新
    let nestFlag = nest ? 1 : 0;
    const newParam = {
      ...param,
      value: newParamValue,
    };

    if (nest) {
      nestFlag = 1;
      param.value = newParamValue;
    } else {
      nestFlag = 0;
      delete param.child;
      delete newParam.child;
    }
    if (newParamValue && newParamValue.type === "FUN") {
      nestFlag = 2;
      param.child = newParamValue;
      delete param.value;
      delete newParam.value;
    }

    setParamValue(nestFlag ? undefined : newParamValue);
    setInvalid(false);
    changeParamValue(nestFlag ? param : newParam, nestFlag);
    if (nestFlag) {
      setDescByClickFunc(undefined, param.child);
    }
  }, [nest, param, setParamValue, changeParamValue, parentFunc]);
  const handleOpenModal = useCallback(debounce((event) => {
    event.stopPropagation();
    event.preventDefault();
    if (param.type === 'component') {
      componentRef.current.handleButtonClick(event);
    } else if (param.type === 'custome') {
      const childrenProps = { customeRenderRef, param, onSubmit: handleSubmit };
      let children = param.customeRender ? param.customeRender(childrenProps) : undefined
      if (!children) {
        if (param.dataType === 'date') {
          children = <DateFormatPicker {...childrenProps} />;
        } else if (param.dataType === 'number') {
          children = <NumberFormatPicker {...childrenProps} />;
        } 
      } 
      Modal.open({
        title: param.label,
        children,
        onOk: () => {
          if (!customeRenderRef.current) {
            return;
          }
          customeRenderRef.current.submit();
        }
      });
    } else {
      exitEditMode();
      const modalRef = { current: null };
      Modal.open({
        title:
          param.type === 'formField'
            ? intl.get('hrpt.reportDesign.view.title.selectField').d('选择字段')
            : intl.get('hrpt.reportDesign.view.title.setParamValue').d('设置参数值'),
        className: styles['param-modal'],
        closable: true,
        destroyOnClose: true,
        style: { width: "742px" },
        children: (
          <ParamModal
            parentFunc={parentFunc}
            isInFixedArea={isInFixedArea}
            sheetRef={sheetRef}
            fieldTreeDs={fieldTreeDs}
            cycleBlock={cycleBlock}
            param={param}
            modalRef={modalRef}
            onSubmit={handleSubmit}
          />
        ),
        onOk: () => { return !!modalRef.current && modalRef.current.submit();},
      });
    }
  }, 50), [param, parentFunc, isInFixedArea, sheetRef, fieldTreeDs, cycleBlock, handleSubmit, setDescByClickFunc]);



  const handleClearValue = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();
    if (nest) {
      parentFunc.paramList = (parentFunc.paramList || []).map(p => {
        if (p.name === param.name) {
          delete p.value;
        }
        return p;
      }).filter((p) => {
        if (p.type === "dynamic" && !p.value) return false;
        return true;
      } );
    }
    if (param.type === 'dynamic') {
      onRemoveParam(param, nest);
    } else {
      changeParamValue(nest ? param : {
        ...param,
        value: null,
      }, nest);
    }
  }, [param, nest, parentFunc, changeParamValue, onRemoveParam]);


  const handleComponentChange = useCallback((value) => {
    const newParamValue = {
      value,
      text: value,
      type: 'component',
    };
    // nestFlag > 0时，changeParamValue不应该用newParam去更新，直接修改原参数对象引用的方式更新
    if (nest) {
      param.value = newParamValue;
    }

    setParamValue(newParamValue);
    setInvalid(false);
    changeParamValue(nest ? param : {
      ...param,
      value: newParamValue,
    }, nest);
  }, [param, nest, changeParamValue]);

  const isNilParam = isNil(paramValue) || isNil(paramValue.value);
  if (childMode) return <div onClick={handleOpenModal} className={styles['editor-for-func']} />;
  return (
    <span
      className={styles['editor-wrapper']}
      onClick={(e) => {
        if (e && e.target) {
          const container = document.querySelector("#print-tpl-formula-editor-container");
          const rootEditor = container.querySelector(".root-editor");
          const contentWidth = rootEditor.offsetWidth;
          let editor = e.target;
          while(editor) {
            if (editor.classList.contains(styles['editor-wrapper'])) {
              break;
            }
            editor = editor.parentNode;
          }

          if (!editor) return;
          let sumOffsetLeft = 0;
          let parentNode = editor.parentNode;
          while(rootEditor && parentNode && parentNode !== rootEditor) {
            if (getComputedStyle(parentNode).position === "relative") {
              sumOffsetLeft += parentNode.offsetLeft;
            }
            parentNode = parentNode.parentNode;
          }
          // 848为容器内容区域实际宽度
          if (contentWidth > 848) {
            const elePos = editor.offsetLeft + sumOffsetLeft;
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
            container.scrollTo({
              top: 0,
              left: moveX,
            });
          }
        }
    }}
    >
      <Tooltip
        theme="light"
        title={
          invalid ? (
            <div className={styles['editor-validation-message']}>
              <Icon type="error" />
              <span>
                {intl.get('hrpt.reportDesign.view.tooltip.paramNotBeNull').d('参数不能为空')}
              </span>
            </div>
          ) : null
        }
      >
        <span
          className={classnames({
            'editor-placeholder': isNilParam,
            'editor-value': !isNilParam,
            'editor-invalid': invalid,
          })}
          onClick={handleOpenModal}
        >
          {param.type === 'component' && (
            <span style={{ display: 'none' }}>
              <Lov
                name={param.name}
                mode="button"
                dataSet={componentDs}
                ref={componentRef}
                onChange={handleComponentChange}
              />
            </span>
          )}
          {isNilParam
            ? (
              <span>{intl.get('hrpt.reportDesign.view.tooltip.paramNotDefine').d('未定义')}</span>
            ) : (
              <span onClick={handleOpenModal}>{paramValue.text}</span>
            )}
          {isNilParam && <Icon type="mode_edit" />}
          {(param.type === 'dynamic' || !isNilParam) && (
            <Icon className='editor-icon-delete' type="close" onClick={handleClearValue} />
          )}
        </span>
      </Tooltip>
    </span>
  );
}
