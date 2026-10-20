import React from 'react';
import { Output, NumberField } from 'choerodon-ui/pro';
import { round, isNumber } from 'lodash';
import intl from 'utils/intl';

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
    const strVal = String(value);
    const [prev, next] = strVal.split('.');
    if (next && next.length > precision) {
      newVal = Number(`${prev}.${next.slice(0, precision)}`);
    }
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

// 价格或数量整数位10位报错，开启validator，
export function integarValidator(value) {
  const limit = 10; // 暂时写死
  if (typeof value === 'number') {
    const valueStr = String(value);
    const [prev] = valueStr.split('.');
    if (prev && prev.length > 10) {
      return intl
        .get('smpc.product.view.integarOverLength', { num: limit })
        .d(`整数位不能超过${limit}位`);
    }
  }
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
      if (typeof oldVal === 'number') {
        const newVal = round(oldVal, _precision);
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
  text = showLine && !isNumber(value) ? '-' : text;
  return type === 'cell' ? <TableCell>{text}</TableCell> : text;
}
