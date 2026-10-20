/**
 * ProcessVariable
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useState } from 'react';
import { Form, TextField, Select, Lov, Switch, TreeSelect } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';
import intl from 'utils/intl';

const { Option } = Select;
const { TreeNode } = TreeSelect;

export default function ProcessVariableModal(props = {}) {
  const { record, customizeField, modelCode } = props;

  const [selectedSource, setSelectedSource] = useState(
    record.get('modelCode') ? 'model' : 'customize'
  );

  const renderTree = (list) => {
    return list.map((item) => (
      <TreeNode
        value={item.uniqueKey}
        title={`${item.businessObjectFieldName || '-'}(${item.businessObjectFieldCode || '-'})`}
      >
        {item.businessObjectRelationFieldList &&
          item.businessObjectRelationFieldList.length > 0 &&
          renderTree(item.businessObjectRelationFieldList)}
      </TreeNode>
    ));
  };

  const handleFieldArr = (oldArr, newArr) => {
    oldArr.forEach((item) => {
      newArr.push(item);
      if (item.businessObjectRelationFieldList && item.businessObjectRelationFieldList.length > 0) {
        handleFieldArr(item.businessObjectRelationFieldList, newArr);
      }
    });
    return newArr;
  };

  const handleTreeSelectChange = (value, dsRecord) => {
    const { businessObjectRelationFieldList = [] } = customizeField;
    const newCustomizeField = [];
    const newArr = handleFieldArr(businessObjectRelationFieldList, newCustomizeField);
    newArr.forEach((item) => {
      if (item.uniqueKey === value) {
        const {
          processVariableType,
          businessObjectFieldName,
          businessObjectRelationId,
          businessObjectName,
          componentType,
          fieldPath,
          lovCode,
          businessObjectRelationFieldId,
          businessObjectCode,
          businessObjectFieldCode,
        } = item;
        runInAction(() => {
          dsRecord.set('variableType', processVariableType);
          dsRecord.set('description', businessObjectFieldName);
          dsRecord.set('modelCode', businessObjectRelationId);
          dsRecord.set('modelName', businessObjectName);
          dsRecord.set('componentType', componentType);
          dsRecord.set('variablePath', fieldPath);
          dsRecord.set('lovCode', lovCode);
          dsRecord.set('businessObjectRelationFieldId', businessObjectRelationFieldId);
          dsRecord.set('businessObjectCode', businessObjectCode);
          dsRecord.set('businessObjectFieldCode', businessObjectFieldCode);
        });
      }
    });
  };

  const handleTreeSelect = (dsRecord) => {
    const { businessObjectRelationFieldList = [] } = customizeField;
    return (
      <TreeSelect
        name="variableName"
        style={{ width: '100%' }}
        onChange={(value) => handleTreeSelectChange(value, dsRecord)}
        searchable
      >
        {renderTree(businessObjectRelationFieldList)}
      </TreeSelect>
    );
  };

  return (
    <Form record={record} labelLayout="float">
      <Select
        name="fieldType"
        clearButton={false}
        onChange={(value) => {
          setSelectedSource(value);
        }}
      >
        <Option value="customize">{intl.get('hzero.common.custom').d('自定义')}</Option>
        {(record.get('modelCode') || modelCode) && (
          <Option value="model">{intl.get('hzero.common.model').d('模型')}</Option>
        )}
      </Select>
      {selectedSource === 'model' ? handleTreeSelect(record) : <TextField name="variableName" />}
      <Select name="variableType" />
      <TextField name="description" />
      <Select name="componentType" />
      <Lov name="sourceLov" />
      {selectedSource === 'model' && <TextField name="modelName" />}
      <Switch name="requiredFlag" />
    </Form>
  );
}
