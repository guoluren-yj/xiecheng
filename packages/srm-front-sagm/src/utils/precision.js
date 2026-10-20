import React from 'react';
import { Output, NumberField } from 'choerodon-ui/pro';
import intl from 'utils/intl';
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

export function numberChange({ value, name, record, precision }) {
  let newVal = value;
  if (value && precision !== 0) {
    newVal = new BigNumber(value).toFixed(precision, 3);
  }
  if (record && name) record.set(name, newVal);
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
    const prevLength = math.floor(value).toLocaleString().replace(/,/g, '').length;
    if (prevLength > 10) {
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
      const newVal = math.toFixed(oldVal, _precision);
      record.set(field, newVal);
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
export function precisionRender({ name, record, recordData }, type = 'text') {
  const meaningField = `${name}Meaning`;
  let value;
  if (recordData) {
    const _value = recordData[name];
    const strVal = isCustomNumber(_value) ? String(_value) : _value;
    value = recordData[meaningField] || strVal;
  } else {
    const _value = record.get(name);
    const strVal = isCustomNumber(_value) ? String(_value) : _value;
    value = record.get(meaningField) || strVal;
  }
  return type === 'cell' ? <TableCell>{value}</TableCell> : value;
}

// 根据未税单价计算出含税单价
export function caculateTaxPrice(unitPrice, tax, precision) {
  const _precision = precision >= 0 ? precision : 10;
  const _tax = math.plus(math.multipliedBy(tax, 0.01), 1);
  const taxPrice = math.multipliedBy(unitPrice, _tax);
  return math.toFixed(taxPrice, _precision);
}

// 根据含税单价计算出未税单价
export function caculateNoTaxPrice(taxPrice, tax, precision) {
  // 未税单价*(1+税率) = 含税单价
  const _precision = precision >= 0 ? precision : 10;
  const _tax = math.plus(math.multipliedBy(tax, 0.01), 1);
  const unitPrice = math.div(taxPrice, _tax);
  return math.toFixed(unitPrice, _precision);
}

export function isCustomNumber(val) {
  return typeof val === 'number' || math.isBigNumber(val);
}
