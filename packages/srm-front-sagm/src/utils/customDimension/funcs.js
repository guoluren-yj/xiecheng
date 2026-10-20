import React from 'react';
import { Lov, Select, TextField, DataSet } from 'choerodon-ui/pro';
import { isNumber, isEmpty } from 'lodash';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { openSelectList } from '@/utils/c7nModal';
import { rendererLovDimension } from './renderers';

const sortByOrderSeq = (list, orderSeqField = 'orderSeq') => {
  list.sort((next, current) => {
    const nOrder = next[orderSeqField];
    const cOrder = current[orderSeqField];
    if (!isNumber(nOrder) && !isNumber(cOrder)) {
      return 0;
    } else if (!isNumber(nOrder)) return 1;
    else if (!isNumber(cOrder)) return -1;
    else return nOrder - cOrder;
  });
};

const allValue = '__custDimensionAllValue';
const allValueKey = '__custDimensionAllValueKey';

// 根据组件类型的不同，不同的计算规则
const custDimCompConfig = {
  LOV: {
    getFieldProps: ({ lovCode }) => {
      return {
        lovCode,
        type: 'object',
        lovPara: { tenantId: getCurrentOrganizationId() },
      };
    },
    dataTransformRequest: ({ valueField, valueType, data = [] }) => {
      const isAll = data.some(s => s[allValueKey] === allValue);
      return isAll ? [] : data.map(m => ({ ...m, [`data${valueType}`]: m[valueField] }));
    },
    dataTransformResponse: ({ data, valueType, valueField, displayField, valueAllFlag }) => {
      if (isEmpty(data) && valueAllFlag) {
        return [
          {
            [valueField]: allValue,
            [allValueKey]: allValue,
            [displayField]: intl.get('sagm.common.view.all').d('所有'),
          },
        ];
      }
      return data.map(m => {
        const { lovValueDTO, [`data${valueType}`]: dataValue, ...other } = m;
        const { value, meaning, metadata } = lovValueDTO || {};
        const fieldValue = dataValue || (metadata ? metadata[valueField] : value);
        const fieldText = metadata ? metadata[displayField] : meaning;
        return {
          ...other,
          ...(metadata || {}),
          [valueField]: fieldValue,
          [displayField]: fieldText,
          [`data${valueType}`]: dataValue,
        };
      });
    },
    FormField: Lov,
  },
  SELECT: {
    getFieldProps: ({ lovCode }) => {
      return { lookupCode: lovCode, type: 'string' };
    },
    dataTransformRequest: ({ valueType, data = [] }) => {
      const isAll = data.includes(allValue);
      return isAll ? [] : data.map(m => ({ [`data${valueType}`]: m }));
    },
    dataTransformResponse: ({ data, valueType, valueAllFlag }) =>
      isEmpty(data) && valueAllFlag ? [allValue] : data.map(m => m[`data${valueType}`]),
    lookupAxiosConfig: {
      transformResponse(data) {
        const all = [{ value: allValue, meaning: intl.get('sagm.common.view.all').d('所有') }];
        try {
          if (typeof data === 'string') {
            const list = JSON.parse(data) || [];
            if (list.some(s => s.value === allValue)) {
              return list;
            }
            return list.concat(all);
          }
          return data;
        } catch (e) {
          return all;
          // 错误
        }
      },
    },
    FormField: Select,
  },
};

const getIsAllValue = (data = []) => {
  return (
    isEmpty(data) ||
    (data || []).some(s => (typeof s === 'object' ? s[allValueKey] === allValue : s === allValue))
  );
};

// 注册值集
export function registerCustDimFields(custDimensions) {
  const fields = (custDimensions || []).map(m => {
    const { dimensionCode, componentType } = m;
    const { getFieldProps = () => ({}), lookupAxiosConfig } =
      custDimCompConfig[componentType] || {};
    return { name: dimensionCode, lookupAxiosConfig, ...getFieldProps(m) };
  });
  return new DataSet({ fields });
}

/**
 * @description c7n表格动态维度列
 * @param {DataSet} dataSet 数据源，用于动态管理fields
 * @param {Array} custDimensions 查询出来的动态列配置
 * @param {Object} fieldConfig 全局控制字段的一些属性{ sort, required, readOnly, formField, valueAllFlag }
 * @returns columns
 */
export function getCustDimColumns(dataSet, custDimensions, fieldConfig = {}) {
  // 字段名
  const dataName = 'agreementDimensionRefs';
  const valueTypeDataName = valueType => `agreementDim${valueType}s`;
  const { sort, readOnly, required = false, formField, valueAllFlag = true } = fieldConfig;

  // 自定义维度列
  const custDimColumns = (custDimensions || []).map(m => {
    const { dimensionCode, dimensionName, orderSeq, componentType, valueType, lovCode } = m;
    const custDimFieldName = `custDim_${dimensionCode}`;
    // const lovTableFieldsState = `custDim_${dimensionCode}_lovTableFields`;
    const { getFieldProps = () => ({}), FormField = TextField, lookupAxiosConfig } =
      custDimCompConfig[componentType] || {};
    const getDefaultValue = (record, data) => {
      const custDimField = record.getField(custDimFieldName);
      const valueField = custDimField.get('valueField');
      const displayField = custDimField.get('textField');
      const { dataTransformResponse = e => e } = custDimCompConfig[componentType] || {};
      return dataTransformResponse({
        data: data || [],
        valueType,
        valueField,
        displayField,
        valueAllFlag,
      });
    };
    const dynamicFieldProps = {
      multiple: !readOnly,
    };
    const fieldProps = {
      ...getFieldProps(m),
      ...dynamicFieldProps,
      required,
      ignore: 'always',
      label: dimensionName,
      lookupAxiosConfig,
      optionsProps: {
        events: {
          load({ dataSet: lovDataSet }) {
            const allRecord = lovDataSet.selected.find(f => f.get(allValueKey) === allValue);
            if (allRecord) lovDataSet.unSelect(allRecord);
          },
        },
      },
      transformResponse: (val, record) => {
        // 获取数据、视图信息
        const { [valueTypeDataName(valueType)]: data, lovViewDTO } =
          (record[dataName] || []).find(f => f.dimensionCode === dimensionCode) || {};
        // 组件类型不同构建数据方式不同
        const { displayField, valueField } = lovViewDTO || {};
        const defaultValue = getDefaultValue(dataSet, data);
        // 存储
        const { dataTransformResponse = e => e } = custDimCompConfig[componentType] || {};
        return lovViewDTO
          ? dataTransformResponse({ data: data || [], valueType, valueField, displayField })
          : defaultValue;
      },
    };
    const field = dataSet.getField(custDimFieldName);
    if (field) {
      Object.keys(dynamicFieldProps).forEach(fieldProp => {
        const fieldPropValue = dynamicFieldProps[fieldProp];
        field.set(fieldProp, fieldPropValue);
      });
    } else {
      dataSet.addField(custDimFieldName, fieldProps);
    }
    const getEditorProps = record => {
      return {
        onChange: value => {
          if (valueAllFlag && record) {
            const defaultValue = getDefaultValue(record);
            if (value && value.length > 0) {
              const notAllValue = value.filter(f => {
                if (typeof f === 'object') {
                  return f[allValueKey] !== allValue;
                }
                return f !== allValue;
              });
              if (notAllValue.length < value.length) {
                record.set(custDimFieldName, notAllValue);
              }
            } else {
              record.set(custDimFieldName, defaultValue);
            }
          }
        },
        optionsFilter: r => r.get('value') !== allValue,
      };
    };
    const column = {
      name: custDimFieldName,
      orderSeq,
      width: 140,
      sort,
      editor: record => {
        if (readOnly) return false;
        return <FormField {...getEditorProps(record)} />;
      },
      renderer: ({ text, value, record }) => {
        if (readOnly) {
          if (getIsAllValue(value)) {
            return intl.get('sagm.common.view.all').d('所有');
          }

          const dimensionData = record.get(dataName) || [];
          // 获取数据、视图信息
          const { lovViewDTO } = dimensionData.find(f => f.dimensionCode === dimensionCode) || {};
          // 组件类型不同构建数据方式不同
          const { tableFields = [], displayField } = lovViewDTO || {};
          if (componentType === 'LOV') {
            return rendererLovDimension({
              data: value,
              columns: tableFields,
              title: dimensionName,
              textField: displayField,
              isAll: () => getIsAllValue(value),
            });
          }
          if (componentType === 'SELECT') {
            const recordField = record.getField(custDimFieldName);
            const viewTextBtn = (
              <a
                onClick={() => openSelectList({ title: dimensionName, data: value, code: lovCode })}
              >
                {intl.get('hzero.common.button.look').d('查看')}
              </a>
            );
            if (value.length === 1) {
              const { [displayField]: lovViewText, meaning: lookupViewText } =
                recordField.getLookupData(value[0]) || {};

              return lovViewText || lookupViewText || viewTextBtn;
            }
            return viewTextBtn;
          }
        }
        return text;
      },
    };
    if (formField) {
      column.FormField = FormField;
      column.fieldProps = getEditorProps(dataSet.current);
    }
    return column;
  });
  // 根据orderSeq排序
  sortByOrderSeq(custDimColumns);
  // 自定义维度存在并且还没有添加数据交互字段
  if (custDimColumns.length > 0 && !dataSet.getField(dataName)) {
    dataSet.addField(dataName, {
      transformRequest: (_, record) => {
        const dimRefs = custDimensions.reduce((dims, custDimension) => {
          const { dimensionCode, valueType, componentType } = custDimension;
          const custDimFieldName = `custDim_${dimensionCode}`;
          const custDimField = dataSet.getField(custDimFieldName);
          const valueField = custDimField.get('valueField');
          const data = record.get(custDimFieldName) || [];
          const { dataTransformRequest = e => e } = custDimCompConfig[componentType] || {};
          const dimData = dataTransformRequest({ data, valueField, valueType });
          const dim = {
            ...custDimension,
            [valueTypeDataName(valueType)]: dimData,
          };
          if (dimData.length > 0) {
            dims.push(dim);
          }
          return dims;
        }, []);
        return dimRefs.length > 0 ? dimRefs : null;
      },
    });
    // 或许可以在这里设置默认值，但是需要在组件销毁时调用removeEventListener
    // dataSet.addEventListener('create', () => {
    //   console.log('create');
    // });
  }
  return custDimColumns;
}

// h0表格渲染 => [{ title, render }]
export function getH0CustDimensions(custDimensions) {
  // 字段名
  const dataName = 'agreementDimensionRefs';
  const valueTypeDataName = valueType => `agreementDim${valueType}s`;
  const h0CustDimensions = (custDimensions || []).map(m => {
    const { dimensionCode, dimensionName, orderSeq, componentType, valueType, lovCode } = m;
    return {
      orderSeq,
      title: dimensionName,
      render: record => {
        const dimensionData = record[dataName] || [];
        // 获取数据、视图信息
        const { [valueTypeDataName(valueType)]: data, lovViewDTO } =
          dimensionData.find(f => f.dimensionCode === dimensionCode) || {};
        // 组件类型不同构建数据方式不同
        const { displayField, valueField, tableFields = [] } = lovViewDTO || {};
        const { dataTransformResponse = e => e } = custDimCompConfig[componentType] || {};
        const transformData = dataTransformResponse({
          data: data || [],
          valueType,
          valueField,
          displayField,
        });
        if (isEmpty(data)) {
          return intl.get('sagm.common.view.all').d('所有');
        }
        if (componentType === 'LOV') {
          return rendererLovDimension({
            data: transformData,
            columns: tableFields,
            title: dimensionName,
            textField: displayField,
          });
        }
        if (componentType === 'SELECT') {
          return (
            <a
              onClick={() =>
                openSelectList({
                  title: dimensionName,
                  data: transformData,
                  code: lovCode,
                })
              }
            >
              {intl.get('hzero.common.button.look').d('查看')}
            </a>
          );
        }
        return '-';
      },
    };
  });
  // 根据orderSeq排序
  sortByOrderSeq(h0CustDimensions);
  return h0CustDimensions;
}
