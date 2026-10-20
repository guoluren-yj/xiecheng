import React from 'react';
import { Output, NumberField } from 'choerodon-ui/pro';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';

// 当表格rowHeight为auto时，可以设置type为cell
const TableCell = (props) => {
  const { children, title } = props;
  const styles = {
    display: 'block',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
  return (
    <span style={styles} title={title}>
      {children}
    </span>
  );
};

function numberChange({ value, name, record, precision }) {
  let newVal = value;
  if (value && precision !== 0) {
    newVal = new BigNumber(value).toFixed(precision, 3);
    record.set(name, newVal);
  } else {
    record.set(name, newVal);
  }
  return newVal;
}

// 精度表单字段展示组件
export function PrecisionField(props) {
  const { name, record, type, readOnly, precision, onChange = (e) => e, ...others } = props;
  const step = precision === 0 ? 1 : undefined;
  return readOnly ? (
    <Output
      renderer={({ record: r }) => {
        if (r) {
          const meaningField = `${name}Meaning`;
          return r.get(meaningField) || r.get(name);
        }
      }}
      {...props}
    />
  ) : (
    <NumberField
      {...others}
      name={name}
      step={step}
      onChange={(value, oldValue) => {
        const _precision = precision >= 0 ? precision : type === 'currency' ? 10 : 6;
        const newValue = numberChange({ value, name, record, precision: _precision });
        onChange(newValue, oldValue);
      }}
    />
  );
}

// 前置精度变化而清空联动
export function precisionUpdate({
  name,
  record,
  value,
  type,
  updateField,
  precisionField,
  changeFields,
}) {
  if (name === updateField) {
    const { [precisionField]: precision } = value || {};
    const _precision = precision >= 0 ? precision : type === 'currency' ? 10 : 6;
    changeFields.forEach((field) => {
      const oldVal = record.get(field);
      if (isCustomNumber(oldVal)) {
        const newVal = math.toFixed(oldVal, _precision);
        record.set(field, newVal);
      }
    });
  }
}

// 表格编辑
export function precisionEditor(props) {
  const { precision, type, name, record, onChange = (e) => e, ...other } = props;
  const step = precision === 0 ? 1 : undefined;
  return (
    <NumberField
      {...other}
      step={step}
      onChange={(val, oldVal) => {
        const _precision = precision >= 0 ? precision : type === 'currency' ? 10 : 6;
        const newVal = numberChange({ value: val, name, record, precision: _precision });
        onChange(newVal, oldVal);
      }}
    />
  );
}

// 精度表格渲染方法 type text | cell, default: text
export function precisionRender({ name, record, recordData, showLine = false }, type = 'text') {
  const meaningField = `${name}Meaning`;
  let value;
  let text;
  if (recordData) {
    value = recordData[name];
    text = recordData[meaningField] || value;
  } else {
    value = record.get(name);
    text = record.get(meaningField) || value;
  }
  text = showLine && !isCustomNumber(value) ? '-' : text;
  return type === 'cell' ? <TableCell>{text}</TableCell> : text;
}

export function isCustomNumber(val) {
  return typeof val === 'number' || math.isBigNumber(val);
}
