/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import { Form, TextField, Lov, Select, TreeSelect, IntlField } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { fetchFieldsList } from '@/services/checkRuleService';

const { TreeNode } = TreeSelect;

export default function ProcessParamsForm({ dataSet, businessObjectId }) {
  const [selectType, setSelectType] = useState('');
  const [fieldList, setFieldList] = useState([]);
  const [selectFieldType, setSelectFieldType] = useState('');

  const fieldId =
    dataSet && dataSet?.current && dataSet?.current?.get ? dataSet.current.get('fieldId') : '';

  useEffect(() => {
    if (businessObjectId) {
      handleChangeBusiness(businessObjectId, 'fill'); // 新建或编辑时 动态填充fieldPrefix字段

      initFields(businessObjectId);
    }
  }, [businessObjectId]);

  useEffect(() => {
    const fieldType =
      dataSet && dataSet?.current && dataSet?.current?.get ? dataSet.current.get('fieldType') : '';
    const fieldProperty =
      dataSet && dataSet?.current && dataSet?.current?.get
        ? dataSet.current.get('fieldProperty')
        : '';
    setSelectType(fieldType);
    setSelectFieldType(fieldProperty);
  }, [dataSet]);

  const initFields = async (objectId) => {
    if (objectId) {
      const res = await fetchFieldsList({
        businessObjectId: objectId,
      });
      if (getResponse(res)) {
        // 立即对获取的数据进行扁平化处理
        const flattenedData = [];
        if (Array.isArray(res)) {
          res.forEach((businessObject) => {
            const flattened = flattenFieldData(businessObject);
            flattenedData.push(...flattened);
          });
        } else if (res && typeof res === 'object') {
          // 如果返回的是单个对象，也进行处理
          const flattened = flattenFieldData(res);
          flattenedData.push(...flattened);
        }

        setFieldList(flattenedData);

        // 编辑时，根据fieldCode设置正确的fieldCodeSelect值
        const currentFieldCode = dataSet?.current?.get('fieldCode');
        if (currentFieldCode && flattenedData && flattenedData.length > 0) {
          // 在扁平化数据中查找对应的字段
          let foundField = null;
          flattenedData.forEach((field) => {
            const fieldCode = field.fieldCode || field.businessObjectFieldCode;
            if (fieldCode === currentFieldCode) {
              foundField = field;
            }
            // 也检查子字段
            if (field.fields && field.fields.length > 0) {
              const subField = field.fields.find(
                (f) => (f.fieldCode || f.businessObjectFieldCode) === currentFieldCode
              );
              if (subField) {
                foundField = subField;
              }
            }
          });

          // 如果找到了对应的字段，设置正确的fieldCodeSelect值
          if (foundField) {
            // 需要构造完整的 uniqueKey 格式: ${businessObjectCode}_${fieldCode}_${index}
            let uniqueValue = '';
            flattenedData.forEach((field, index) => {
              const fieldCode = field.fieldCode || field.businessObjectFieldCode;
              if (fieldCode === currentFieldCode) {
                uniqueValue = `${field.businessObjectCode || 'unknown'}_${fieldCode}_${index}`;
              }
              // 也检查子字段
              if (field.fields && field.fields.length > 0) {
                field.fields.forEach((subField, subIndex) => {
                  const subFieldCode = subField.fieldCode || subField.businessObjectFieldCode;
                  if (subFieldCode === currentFieldCode) {
                    uniqueValue = `${
                      subField.businessObjectCode || 'unknown'
                    }_${subFieldCode}_${subIndex}`;
                  }
                });
              }
            });

            if (uniqueValue) {
              dataSet.current.set('fieldCodeSelect', uniqueValue);
            }
          }
        }
      }
    }
  };

  const handleChangeType = (value) => {
    setSelectType(value);
    if (dataSet && dataSet.current) {
      if (value === 'CUSTOM') {
        dataSet.current.set('businessObjectId', '');
        dataSet.current.set('fieldPrefix', 'CUSTOM');
      }
    }
  };

  const handleChangeBusiness = (value, type) => {
    if (dataSet && dataSet.current) {
      const valueList = dataSet.current?.getField('businessObjectId')?.options?.toData() ?? [];
      const obj = valueList.find((item) => String(item.businessObjectId) === String(value));

      const prefix = dataSet.current?.get('fieldPrefix') || '';
      if (!prefix) {
        // 已保存过，存在值 则不回填
        dataSet.current.set('fieldPrefix', obj?.businessObjectCode);
      }
      if (type !== 'fill') {
        dataSet.current.set('fieldCodeSelect', '');
        dataSet.current.set('fieldCode', '');
      }
    }
  };

  /**
   * 根据唯一键(value)获取业务对象编码
   * @param {string} value - 树节点的 value (uniqueKey)
   * @returns {Object} 包含业务对象编码和ID的对象
   */
  const getBusinessObjectCode = (value) => {
    if (!value || !fieldList || fieldList.length === 0) {
      return { businessObjectCode: '', objectId: '' };
    }

    // 在扁平化数据中通过生成相同的 uniqueKey 进行精确匹配查找字段
    let foundField = null;
    fieldList.forEach((field, index) => {
      const currentFieldCode = field.fieldCode || field.businessObjectFieldCode;
      const uniqueKey = `${field.businessObjectCode || 'unknown'}_${currentFieldCode}_${index}`;

      if (uniqueKey === value) {
        foundField = field;
      }

      // 也检查子字段
      if (field.fields && field.fields.length > 0) {
        field.fields.forEach((subField, subIndex) => {
          const subFieldCode = subField.fieldCode || subField.businessObjectFieldCode;
          const subUniqueKey = `${
            subField.businessObjectCode || 'unknown'
          }_${subFieldCode}_${subIndex}`;
          if (subUniqueKey === value) {
            foundField = subField;
          }
        });
      }
    });

    return {
      businessObjectCode: foundField?.businessObjectCode || '',
      objectId: foundField?.businessObjectId || '',
    };
  };

  /**
   * 根据唯一键(value)获取fieldName
   * @param {string} value - 树节点的 value (uniqueKey)
   * @returns {string} 字段名称，如果未找到则返回空字符串
   */
  const getFieldNameByCode = (value) => {
    if (!value || !fieldList || fieldList.length === 0) {
      return '';
    }

    // 通过生成相同的 uniqueKey 进行精确匹配查找字段
    let foundField = null;
    fieldList.forEach((field, index) => {
      const currentFieldCode = field.fieldCode || field.businessObjectFieldCode;
      const uniqueKey = `${field.businessObjectCode || 'unknown'}_${currentFieldCode}_${index}`;

      if (uniqueKey === value) {
        foundField = field;
      }

      // 检查子字段
      if (field.fields && field.fields.length > 0) {
        field.fields.forEach((subField, subIndex) => {
          const subFieldCode = subField.fieldCode || subField.businessObjectFieldCode;
          const subUniqueKey = `${
            subField.businessObjectCode || 'unknown'
          }_${subFieldCode}_${subIndex}`;
          if (subUniqueKey === value) {
            foundField = subField;
          }
        });
      }
    });

    return foundField?.businessObjectFieldName || '';
  };

  /**
   * 选择字段编码后，插入字段名
   * @param {*} value
   */
  const handleTreeSelectChange = (value) => {
    if (dataSet && dataSet.current) {
      if (value && value.includes('_')) {
        const parts = value.split('_');

        if (parts.length >= 3) {
          const fieldCode = parts[parts.length - 2]; // 倒数第二个是 fieldCode

          const { businessObjectCode = '', objectId = '' } = getBusinessObjectCode(value);
          const fieldName = getFieldNameByCode(value);

          dataSet.current.set('fieldCode', fieldCode);
          dataSet.current.set('fieldName', fieldName || '');
          dataSet.current.set('fieldPrefix', businessObjectCode || '');
          dataSet.current.set('businessObjectId', objectId || '');
        }
      }
    }
  };

  const searchMatcher = ({ text, record }) => {
    const label = record?.get('businessObjectName');
    return label.toLowerCase().indexOf(text.toLowerCase()) !== -1;
  };

  const optionRenderer = ({ record }) => {
    return `${record.get('businessObjectName')}（${record.get('businessObjectCode')}）`;
  };

  // 数据扁平化处理函数
  const flattenFieldData = (businessObject) => {
    if (!businessObject || !businessObject.fields) {
      return [];
    }

    const flattenedFields = [];

    businessObject.fields.forEach((field) => {
      if (field.refBo && field.refBo.fields && field.refBo.fields.length > 0) {
        // 如果有 refBo，将 refBo 的字段作为子字段处理
        const parentField = {
          ...field,
          businessObjectId: businessObject.businessObjectId,
          businessObjectCode: businessObject.businessObjectCode,
          businessObjectName: businessObject.businessObjectName,
          fields: field.refBo.fields.map((refField) => ({
            ...refField,
            businessObjectId: field.refBo.businessObjectId,
            businessObjectCode: field.refBo.businessObjectCode,
            businessObjectName: field.refBo.businessObjectName,
            refBo: null,
          })),
          refBo: null,
        };
        flattenedFields.push(parentField);
      } else {
        // 普通字段，直接添加业务对象信息
        flattenedFields.push({
          ...field,
          businessObjectId: businessObject.businessObjectId,
          businessObjectCode: businessObject.businessObjectCode,
          businessObjectName: businessObject.businessObjectName,
          refBo: null,
        });
      }
    });

    return flattenedFields;
  };

  // 渲染树形结构
  const renderTree = (arr) => {
    let list = [];
    // 如果传入的是单个对象，转换为数组
    if (arr && !Array.isArray(arr) && typeof arr === 'object') {
      list = [arr];
    }

    if (!arr || !Array.isArray(arr) || list.arr === 0) {
      return [];
    }

    list = [...arr];

    // 直接渲染已经扁平化的字段数据
    const result = list.map((field, index) => {
      const fieldCode = field?.businessObjectFieldCode || field?.fieldCode;
      const uniqueKey = `${field.businessObjectCode || 'unknown'}_${fieldCode}_${index}`;

      // 清理字段名称，移除可能存在的逗号和括号
      const cleanFieldName =
        field?.businessObjectFieldName || fieldCode
          ? (field?.businessObjectFieldName || fieldCode)
              .replace(/,\(,/g, '') // 移除 ,（, 格式
              .replace(/,\)/g, '') // 移除 ,) 格式
              .replace(/\(,/g, '') // 移除 (, 格式
              .replace(/（,/g, '') // 移除 （, 格式
              .replace(/,）/g, '') // 移除 ,） 格式
              .replace(/,/g, '') // 移除所有逗号
              .trim()
          : '';

      const displayTitle = `${fieldCode}(${cleanFieldName})`;

      // 检查是否有子字段
      if (field.fields && field.fields.length > 0) {
        return (
          <TreeNode key={uniqueKey} value={uniqueKey} title={displayTitle}>
            {field.fields.map((subField, subIndex) => {
              const subFieldCode = subField?.businessObjectFieldCode || subField.fieldCode;
              const subUniqueKey = `${
                subField.businessObjectCode || 'unknown'
              }_${subFieldCode}_${subIndex}`;
              const subCleanFieldName =
                subField?.businessObjectFieldName || subFieldCode
                  ? (subField?.businessObjectFieldName || subFieldCode)
                      .replace(/,\(,/g, '')
                      .replace(/,\)/g, '')
                      .replace(/\(,/g, '')
                      .replace(/（,/g, '')
                      .replace(/,）/g, '')
                      .replace(/,/g, '')
                      .trim()
                  : '';
              const subDisplayTitle = `${subFieldCode}(${subCleanFieldName})`;

              return (
                <TreeNode key={subUniqueKey} value={subUniqueKey} title={subDisplayTitle} isLeaf />
              );
            })}
          </TreeNode>
        );
      } else {
        // 没有子字段，创建叶子节点
        return <TreeNode key={uniqueKey} value={uniqueKey} title={displayTitle} isLeaf />;
      }
    });
    return result;
  };

  const handleChangeFieldType = (value) => {
    setSelectFieldType(value);
  };

  return (
    <Form dataSet={dataSet} labelLayout="float" columns={1}>
      <Select name="fieldType" onChange={handleChangeType} disabled={!!fieldId} />

      {selectType === 'CUSTOM' ? (
        <TextField name="fieldCode" disabled={!!fieldId} />
      ) : (
        <TreeSelect
          name="fieldCodeSelect"
          disabled={!!fieldId}
          onChange={handleTreeSelectChange}
          searchable
          clearButton
          style={{ width: '100%' }}
          treeDefaultExpandAll
        >
          {renderTree(fieldList)}
        </TreeSelect>
      )}
      {selectType !== 'CUSTOM' ? (
        <Select
          name="businessObjectId"
          searchable
          disabled
          searchMatcher={searchMatcher}
          optionRenderer={optionRenderer}
        />
      ) : null}
      <IntlField name="fieldName" />
      <Select name="fieldProperty" onChange={handleChangeFieldType} />
      {selectType !== 'CUSTOM' && selectFieldType === 'LOV' ? (
        <Lov name="fieldValueSetObj" />
      ) : null}
      {selectType !== 'CUSTOM' && selectFieldType === 'LOV' ? (
        <Select name="batchQueryFlag" />
      ) : null}
    </Form>
  );
}
