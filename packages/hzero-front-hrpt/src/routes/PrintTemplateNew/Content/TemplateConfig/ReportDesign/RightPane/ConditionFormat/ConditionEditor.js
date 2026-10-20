/* eslint-disable react/jsx-key */
import React, { useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Button,
  TextField,
  DataSet,
  Select,
  NumberField,
  DatePicker,
  Form,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { omit, pick } from 'lodash';
import intl from "hzero-front/lib/utils/intl";

import notification from 'utils/notification';

import styles from '../../index.less';
import Store from '../../store';
import { filterParentAndSelf } from '../../utils/utils';
import {
  getEditorFormDs,
  getFormatOptions,
  getFormatValueType,
  transformStyle,
} from './store';
import FontColor from './FontColor';
import BgColor from './BgColor';
import VariableSelect from './VariableSelect';

const ConditionEditor = ({ initData, onSubmit, onCancel, treeDs }) => {
  const { sheetPartRef, currentCell } = useContext(Store).store;
  const sheetRef = useMemo(
    () => sheetPartRef && sheetPartRef.current && sheetPartRef.current.sheetRef,
    [sheetPartRef]
  );
  const templateFields = useMemo(() => {
    if (sheetRef && currentCell && currentCell.position) {
      const cycleBlock = sheetRef.findCycleBlockByCell(currentCell.position);
      if (cycleBlock) {
        return filterParentAndSelf(treeDs.toData(), cycleBlock);
      }
    }
    return [];
  }, [treeDs, sheetRef]);
  const formDs = useMemo(() => new DataSet(getEditorFormDs()), []);
  const formatOptions = useMemo(() => getFormatOptions(), []);
  const valueType = formDs.current && formDs.current.get('valueType');
  const [format, setFormat] = useState({});
  const [range, setRange] = useState({});

  useEffect(() => {
    if (!formDs.current) {
      formDs.create();
    }
    if (initData) {  
      const { range = {}, style = {}, styleType, conditionType, type, targetValue, variable } = initData;
      let variableValue = variable;
      if (range && range.position && sheetRef) {
        const cell = sheetRef.getCellData(range.position.r || 0, range.position.c || 0,); 
        if (cell && cell.extra && cell.extra.code) {
          const field = treeDs.find(record => record.get('code') === cell.extra.code);
          if (field) {
            formDs.current.init('rangeFieldName', `${field.get('parentName')}.${field.get('name')}`);
            if (!variableValue) {
              variableValue = pick(field.toData(), ['code', 'name', 'parentCode', 'parentName']);
            }
          }
        }
      }
      formDs.current.init('variable', variableValue);
      formDs.current.init('valueType', conditionType);
      formDs.current.init('type', type || "number");
      formDs.current.init('targetValue', targetValue);
      if (range.value && range.value.includes(':')) {
        range.value = range.value.split(':')[0];
      }
      setRange(range);
      setFormat({
        type: styleType,
        style: styleType !== 'custom' ? {} : style,
      });
    } else {
      if (currentCell && currentCell.value && currentCell.value.extra) {
        const field = treeDs.find(record => record.get('code') === currentCell.value.extra.code)
        if (field) {
          const fieldData = pick(field.toData(), ['code', 'name', 'parentCode', 'parentName']);
          formDs.current.init('variable', fieldData);
          formDs.current.init('rangeFieldName', `${fieldData.parentName}.${fieldData.name}`);          
        }
      }
      setRange({ value: 'A1', position: { c: 0, r: 0 } });
      setFormat({ type: '1' });
    }
  }, []);

  useEffect(() => {
    if (initData) {
      return;
    }
    const newRange = {};
    if (sheetRef && sheetRef.getTxtByRange) {
      newRange.value = sheetRef.getTxtByRange() || '';
      if (newRange.value.includes(':')) {
        newRange.value = newRange.value.split(':')[0];
      }
    }
    if (currentCell && currentCell.position) {
      const { c, r } = currentCell.position;
      newRange.position = {
        c,
        r,
      };
    } else {
      newRange.position = {
        c: 0,
        r: 0,
      };
    }
    setRange(newRange);
  }, [currentCell, sheetRef]);


  const handleSubmit = useCallback(async () => {
    const flag = await formDs.validate();
    if (!flag || !formDs.current) {
      return;
    }
    if (!sheetPartRef || !sheetPartRef.current || !sheetPartRef.current.sheetRef) {
      return;
    }
    const sheetRef = sheetPartRef.current.sheetRef;
    const conditionItem = initData || { _status: 'create' };
    conditionItem.styleType = format.type;
    conditionItem.style =
      format.type !== 'custom' ? formatOptions[format.type].style : format.style;
    if (formDs.current) {
      const cell = {
        r: (range.position || {}).r,
        c: (range.position || {}).c,
      };
      const cellData = sheetRef.getCellData(cell.r, cell.c) || {};
      const { extra: { code: fieldCode = '', type } = {} } = cellData;
      if (type !== 'FIELD') {
        notification.warning({
          message: intl
            .get('hrpt.reportDesign.view.title.shouldSelectFieldCell')
            .d('请选择字段类型单元格'),
        });
        return;
      }
      const cellStyle = omit(cellData, ['ct', 'extra', 'm', 'mc', 'v']);
      conditionItem.style = {
        ...cellStyle,
        ...conditionItem.style,
      };
      let cycleBlock = sheetRef.findCycleBlockByCell(cell);
      let code = fieldCode;
      const variable = formDs.current.get('variable');
      if (variable) {
        conditionItem.variable = variable;
        code = variable ? variable.code : '';
        const cycleBlocks = sheetRef.getCycleBlock();
        if (cycleBlocks && cycleBlocks.length) {
          cycleBlock = cycleBlocks.find(block => block.code === variable.parentCode);
        }
      }
      let parentCycleBlock = sheetRef.findParentCycleBlock(cycleBlock) || {};
      const cType = formDs.current.get('type');
      const valueType = formDs.current.get('valueType');
      const value = formDs.current.get('targetValue');
      switch(valueType) {
        case "min": conditionItem.condition = `IS_NUM(${code}) && IS_NUM(MIN(${code},'${parentCycleBlock.code}',true)) && TO_NUM(MIN(${code},'${parentCycleBlock.code}',true)) == ${code}`; break;
        case "max": conditionItem.condition = `IS_NUM(${code}) && IS_NUM(MAX(${code},'${parentCycleBlock.code}',true)) && TO_NUM(MAX(${code},'${parentCycleBlock.code}',true)) == ${code}`; break;
        case "lt": conditionItem.condition = `IS_NUM(${code}) && TO_NUM(${code}) < ${value}`; break;
        case "gt": conditionItem.condition = `IS_NUM(${code}) && TO_NUM(${code}) > ${value}`; break;
        case "lte": conditionItem.condition = `IS_NUM(${code}) && TO_NUM(${code}) <= ${value}`; break;
        case "gte": conditionItem.condition = `IS_NUM(${code}) && TO_NUM(${code}) >= ${value}`; break;
        case "eq": conditionItem.condition = `IS_NUM(${code}) && TO_NUM(${code}) == ${value}`; break;
        case "neq": conditionItem.condition = `IS_NUM(${code}) && TO_NUM(${code}) != ${value}`; break;
        case 'with': conditionItem.condition = `!IS_EMPTY(${code}) && string.contains(str(${code}), '${value}')`; break;
        case 'notWith': conditionItem.condition = `IS_EMPTY(${code}) || !string.contains(str(${code}),'${value}')`; break;
        case '=': conditionItem.condition = `!IS_EMPTY(${code}) && str(${code}) == '${value}'`; break;
        case 'null': conditionItem.condition = `IS_EMPTY(${code})`; break;
        case 'notNull': conditionItem.condition = `!IS_EMPTY(${code})`; break;
      }
      conditionItem.type = cType;
      conditionItem.conditionType = valueType;
      conditionItem.targetValue = value;
      conditionItem.conditionDesc = (getFormatValueType().find(item => item.value === valueType) || {}).meaning;
    }
    conditionItem.range = range;
    onSubmit(conditionItem);
  }, [range, format, formDs]);

  const setFormatType = useCallback((value) => {
    setFormat((preFormat) => ({
      ...preFormat,
      type: value,
    }));
  }, []);

  const setFormatStyle = useCallback((key, value) => {
    setFormat((preFormat) => ({
      ...preFormat,
      type: 'custom',
      style: {
        ...(preFormat.style || {}),
        [key]: value,
      },
    }));
  }, []);

  const renderFormatOptions = useCallback(() => {
    const { style = {} } = format;
    return Object.keys(formatOptions).map((option) => (
      <Select.Option value={String(option)}>
        <div className={styles['format-select-option']}>
          <div
            className={styles['format-select-option-preview']}
            style={{
              ...formatOptions[option].showStyle,
              ...(option === 'custom' ? transformStyle(style) : {}),
            }}
          >
            {formatOptions[option].meaning}
          </div>
          <div className={styles['format-select-option-pre']}>
            {format.type === String(option) && (
              <Icon type="check" className={styles['format-select-option-selected']} />
            )}
          </div>
        </div>
      </Select.Option>
    ));
  }, [format, formatOptions]);

  const renderCustomFormat = useCallback(() => {
    const { type, style = {} } = format;
    const { color, backgroundColor, bg, fc } = style;
    if (type !== 'custom') {
      return null;
    }
    return (
      <div className={styles['custom-format']}>
        <span>
          <FontColor initialValue={color || fc} onChange={setFormatStyle} />
        </span>
        <span>
          <BgColor initialValue={backgroundColor || bg} onChange={setFormatStyle} />
        </span>
      </div>
    );
  }, [format]);

  return (
    <div className={styles['editor-content']}>
      <div  className={styles['editor-content-block-container']}>
        <div className={styles['editor-content-block']}>
          <div className={styles['label']}>
            {intl.get('hrpt.reportDesign.view.title.sourceField').d('来源变量字段')}
          </div>
          <Form dataSet={formDs} className={styles['editor']} labelLayout="none">
            <VariableSelect
              dataSet={formDs}
              name='variable'
              placeholder={intl.get('hrpt.reportDesign.view.title.variable.label').d('选择变量字段')}
              templateFields={templateFields}
            />
          </Form>
        </div>  
        <div className={styles['editor-content-block']}>
          <div className={styles['label']}>
            {intl.get('hrpt.reportDesign.view.title.followConditions').d('符合以下条件时')}
          </div>
          <Form dataSet={formDs} className={styles['editor']} labelLayout="none">
            <Select name="type" clearButton={false} />
            <Select name="valueType" clearButton={false} />
            {formDs.current && !['null', 'notNull', 'min', 'max'].includes(formDs.current.get("valueType")) && (
              <TextField name="targetValue" clearButton={false} />
            )}
          </Form>
        </div>
        <div className={styles['editor-content-block']}>
          <div className={styles['label']}>
            {intl.get('hrpt.reportDesign.view.title.applicationRange').d('应用范围')}
          </div>
          <div className={styles['editor']} style={{ display: 'flex', border: '1px solid #c9cdd4' }}>
            <TextField value={range.value} readOnly style={{ width: '60px', borderRight: '1px solid #c9cdd4' }} border={false} />
            <TextField dataSet={formDs} name='rangeFieldName' readOnly border={false} />
          </div>
        </div>
        <div className={styles['editor-content-block']}>
          <div className={styles['label']}>
            {intl.get('hrpt.reportDesign.view.title.showAs').d('显示为')}
          </div>
          <div className={styles['editor']}>
            <Select
              clearButton={false}
              value={format.type}
              onChange={setFormatType}
              className={styles['format-select']}
              popupCls={styles['format-select-options']}
            >
              {renderFormatOptions()}
            </Select>
          </div>
          {renderCustomFormat()}
        </div>
      </div>
      <div className={styles['editor-content-footer']}>
        <Button color="primary" onClick={handleSubmit}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button onClick={onCancel}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </div>
  );
};

export default observer(ConditionEditor);
