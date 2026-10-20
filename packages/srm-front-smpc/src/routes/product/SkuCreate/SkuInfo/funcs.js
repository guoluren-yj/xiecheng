import React from 'react';
import ReactDom from 'react-dom';
import { Select, DataSet, Form } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import notification from 'utils/notification';
import customStore from '../customStore';

const resetAttrs = {
  attrType: 1,
  attrValueId: undefined,
  attrValueCode: undefined,
  attrValueName: undefined,
  description: undefined,
};

// 获取对象属性数组的有效值
function getValidValue(obj, valueFields = []) {
  return valueFields.reduce((res, currentField) => res || obj[currentField], null);
}

// 比较是否为同一属性
export function isEqualAttr(prevAttr, nextAttr) {
  const idFields = ['customAttrId', 'attrId', 'attrName'];
  return getValidValue(prevAttr, idFields) === getValidValue(nextAttr, idFields);
}

// 比较是否为同一属性值
export function isEqualAttrValue(prevAttr, nextAttr) {
  const idFields = ['customAttrValueId', 'attrValueId', 'attrValueName'];
  return (
    isEqualAttr(prevAttr, nextAttr) &&
    getValidValue(prevAttr, idFields) === getValidValue(nextAttr, idFields)
  );
}

// 更新动态列字段required
function fieldResetRequired(table) {
  const cacheSpecs = table.getState('cacheSpecs') || [];
  const resetRequired = (fieldRef) => {
    cacheSpecs.forEach((f) => {
      const field = fieldRef.getField(f);
      if (field) field.set('required', false);
    });
  };
  resetRequired(table);
  table.forEach(resetRequired);
}

// 初始化动态列字段属性
function fieldInitProps(table, fieldProps = {}) {
  const fieldInit = (fieldRef) => {
    const { name, ...others } = fieldProps;
    const field = fieldRef.getField(name);
    if (!field) {
      fieldRef.addField(name, {
        required: true,
        textField: 'attrValueName',
        valueField: 'attrValueId',
        type: 'object',
        ...others,
      });
    } else {
      field.set('required', true);
    }
  };
  fieldInit(table);
  table.forEach(fieldInit);
}

// 根据商品组名称以及销售规格属性值更新商品名称
export function setSkuNameBySpecs({ spuName: spu, record, dynamicColumns = [] }) {
  const {
    supplierItemCode: a,
    supplierItemName: b,
    manufacturerInfo: c,
    manufacturerItemCode: d,
    manufacturerItemName: e,
  } = record.toData();
  const spuName = spu || '';
  let skuName = record.get('initialSkuName') || '';
  let specName = '';
  dynamicColumns.forEach((s) => {
    const { attrValueName: text } = record.get(s.name) || {};
    if (text) {
      specName = `${specName}  ${text}`;
    }
  });
  if (specName) skuName = `${specName}  ${skuName}`;
  if (spuName) skuName = `${spuName}  ${skuName}`;
  if (a) skuName = `${skuName} ${a}`;
  if (b) skuName = `${skuName} ${b}`;
  if (d) skuName = `${skuName} ${d}`;
  if (e) skuName = `${skuName} ${e}`;
  if (c) skuName = `${skuName} ${c}`;
  record.set('skuName', skuName);
}

// 更新商品行上销售规格
function setSkuSpecs(record, value) {
  const data = record.get('skuSpecsList') || [];
  const ind = data.findIndex((f) => isEqualAttr(f, value));
  if (ind !== -1) {
    data[ind] = { ...data[ind], ...value, attrType: 1, skuAttrId: null };
  } else {
    data.push({ ...value, attrType: 1 });
  }

  record.set('skuSpecsList', data);
}

// 销售属性属性值变更
function saleAttrValueChange({
  record, // 商品行
  form, // 商品组表单
  table, // 商品表格
  value, // 当前属性值
  oldValue, // 上次属性值
  spuAttr, // 销售属性
  autoChange, // 是否自动触发
  valueChange = true, // 值是否发生改变
  dynamicColumns = [], // 动态列
}) {
  const { attrId, customAttrId, attrName, attributeName } = spuAttr;
  const dynamicFieldName = `spec_${customAttrId}`;
  let repeatFlag = false;
  // 自动改变不触发重复校验
  if (!autoChange) {
    const allAttrs = [];
    table.forEach((d) => {
      let allAttr = '';
      let allAttrFlag = true;
      dynamicColumns.forEach((_f) => {
        if (d.get(_f.name)) {
          const { attrValueId } = d.get(_f.name);
          allAttr = `${allAttr}_${attrValueId}`;
        } else {
          allAttrFlag = false;
        }
      });
      if (allAttrFlag) {
        if (allAttrs.includes(allAttr)) {
          repeatFlag = true;
          return false;
        } else {
          allAttrs.push(allAttr);
        }
      }
    });
  }
  // 如果重复 则将值还原为上次值
  if (repeatFlag) {
    notification.warning({
      message: intl.get('smpc.product.view.attrRepeatMsg').d('有相同属性值的SKU已存在'),
    });
    record.set(dynamicFieldName, oldValue);
    return;
  } else {
    const current = value || { ...resetAttrs };
    const skuAttr = {
      ...spuAttr,
      attrValueCode: undefined,
      ...current,
      attrId,
      customAttrId,
      attrName,
      attributeName,
    };
    setSkuSpecs(record, skuAttr);
    if (valueChange) {
      const { attributeCode, attrValueId, attrValueCode, attrValueName } = skuAttr;
      if (attributeCode === '000000000001') {
        record.set({
          brandId: attrValueCode ? attrValueId : null,
          brandCode: attrValueCode,
          brandName: attrValueName,
        });
      }
      if (attributeCode === '000000000002') {
        record.set('model', attrValueName);
      }
      record.set(dynamicFieldName, value);
    }
  }
  if (valueChange) {
    const spuName = form.current.get('spuName');
    setSkuNameBySpecs({ spuName, record, dynamicColumns });
  }
}

// 根据销售规格获取动态列
export function getDynamicColumns(form, table, saleSpecs) {
  if (!table || !saleSpecs.length) return [];
  const valueChangeProps = { form, table };
  fieldResetRequired(table);

  const columns = [];

  // 判断是否为审批拒绝tab
  const isReject = customStore.getState('req') === 'reject';

  // 记录销售规格
  const cacheSpecs = [];
  saleSpecs.forEach((f) => {
    const { customAttrId, attributeName, attrValLov = [] } = f;
    const dynamicFieldName = `spec_${customAttrId}`;
    cacheSpecs.push(dynamicFieldName);
    fieldInitProps(table, {
      label: attributeName,
      name: dynamicFieldName,
      disabled: isReject,
      // dynamicProps: {
      //   disabled: ({ record }) => {
      //     return skuAttrId && record.get('skuId');
      //   },
      // },
    });
    const columnIndex = columns.findIndex((s) => s.name === dynamicFieldName);
    // 动态列属性
    const dynamicColumn = {
      name: dynamicFieldName,
      width: 140,
      header: attributeName,
      editor: (record) => {
        return (
          <Select
            record={record}
            options={new DataSet({ paging: false, data: attrValLov || [] })}
            onChange={(value, oldValue) =>
              saleAttrValueChange({
                record,
                spuAttr: f,
                value,
                oldValue,
                ...valueChangeProps,
                dynamicColumns: columns,
              })
            }
          />
        );
      },
    };
    // 添加｜替换
    if (columnIndex === -1) {
      columns.push(dynamicColumn);
    } else {
      columns[columnIndex] = dynamicColumn;
    }
    // 更新属性值
    table.forEach((record) => {
      const oldValue = record.get(dynamicFieldName);
      if (!oldValue) return;
      const newValue = attrValLov?.find(
        (option) => option.customAttrValueId === oldValue.customAttrValueId
      );
      if (!newValue) return;
      if (
        newValue?.attrValueId !== oldValue?.attrValueId ||
        newValue?.attrId !== oldValue?.attrId
      ) {
        const valueChange = newValue?.attrValueId !== oldValue?.attrValueId;
        saleAttrValueChange({
          record,
          spuAttr: f,
          value: newValue,
          oldValue,
          valueChange,
          autoChange: true,
          ...valueChangeProps,
          dynamicColumns: columns,
        });
      }
    });
  });

  table.setState('cacheSpecs', cacheSpecs);

  return columns;
}

// 临时挂载个性化，只挂一次
function mountCust(element, fieldName) {
  // 创建用于临时挂载个性化的容器
  const customDom = document.createElement('div');
  customDom.setAttribute('id', `insert-cust-forms-${fieldName}`);
  const wrapper = document.getElementById('sku-wrapper');
  if (wrapper) wrapper.appendChild(customDom);
  const container = document.getElementById(`insert-cust-forms-${fieldName}`);
  if (container) {
    ReactDom.render(element, container);
    container.parentNode.removeChild(container);
  }
}

/**
 * fieldName：可以任意字符串， 构造唯一id容器（规范以name字段命名）
 * hole: 决定表头必输样式 true: dataSet所有字段中有一个为必输，表头即必输； false: dataSet 对应字段必输, 表头必输
 * @param {*} hole
 * @returns
 */
// 属性必输性获取,需要先挂载
export function getCustFieldRequired({ dataSet, code, fieldName, hole = false }) {
  if (code) {
    const { customizeForm } = customStore.getCustFuncs();
    const custForm = (
      <div style={{ display: 'none' }}>
        {customizeForm({ code: customStore.getCustomCode(code) }, <Form dataSet={dataSet} />)}
      </div>
    );
    mountCust(custForm, fieldName);
  }
  if (dataSet) {
    const record = dataSet.current || dataSet.create({});
    let required = false;
    if (hole) {
      dataSet.fields.forEach((s) => {
        required = required || s.get('required', record);
      });
    } else {
      dataSet.fields.forEach((s) => {
        if (s.get('name') === fieldName) {
          required = s.get('required', record);
        }
      });
    }
    return required;
  }
}

export function mountCustomizeCom({ dataSet, code, wrapperName }) {
  if (code) {
    const { customizeForm } = customStore.getCustFuncs();
    const custForm = (
      <div style={{ display: 'none' }}>
        {customizeForm({ code: customStore.getCustomCode(code) }, <Form dataSet={dataSet} />)}
      </div>
    );
    mountCust(custForm, wrapperName);
  }
}
