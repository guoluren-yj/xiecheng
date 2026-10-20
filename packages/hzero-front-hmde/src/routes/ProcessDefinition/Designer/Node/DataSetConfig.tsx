import React from 'react';
import { IntlField, Lov, TextField, Icon, TextArea } from 'choerodon-ui/pro';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const fieldsConfig = new Map<string, any>([
  [
    'curNodeName',
    {
      name: 'curNodeName',
      type: FieldType.intl,
      label: '名称',
      required: true,
      render: () => (
        <IntlField
          key="curNodeName"
          name="curNodeName"
          suffix={<Icon type="language" />}
          maxLength={30}
        />
      ),
    },
  ],
  [
    'nodeCode',
    {
      name: 'nodeCode',
      type: FieldType.string,
      label: '标识',
      required: true,
      // pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
      validator: (value) => {
        const pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
        if (!pattern.test(value)) {
          return '支持大小写及数字，必须以字母开头，可包含“-”、“_”、“.”、“/”，不能为纯数字';
        }
      },
      render: () => <TextField key="nodeCode" name="nodeCode" maxLength={50} />,
    },
  ],
  [
    'businessObject',
    {
      name: 'businessObject',
      type: FieldType.object,
      label: '业务对象',
      required: true,
      lovCode: 'HMDE.BUSINESS_OBJECT.SITE',
      computedProps: {
        lovPara: ({ record }) => {
          if (record?.get('type') === 'SR') {
            return {};
          } else {
            return {
              excludeSourceTypeList: ['PREDEFINE'].join(),
            };
          }
        },
      },
      ignore: FieldIgnore.always,
      render: () => <Lov key="businessObject" name="businessObject" />,
    },
  ],
  [
    'businessObjectCode',
    {
      name: 'businessObjectCode',
      type: FieldType.string,
      label: '业务对象code',
      bind: 'businessObject.businessObjectCode',
    },
  ],
  [
    'businessObjectName',
    {
      name: 'businessObjectName',
      type: FieldType.string,
      label: '业务对象name',
      bind: 'businessObject.businessObjectName',
    },
  ],
  [
    'businessObjectId',
    {
      name: 'businessObjectId',
      type: FieldType.string,
      label: '业务对象id',
      bind: 'businessObject.businessObjectId',
    },
  ],
  [
    'outputConfig',
    {
      name: 'outputConfig',
      type: FieldType.string,
      label: '出参配置',
      render: ({ handle }) => (
        <TextArea
          key="outputConfig"
          name="outputConfig"
          placeholder="构建出参..."
          readOnly
          onClick={handle}
        />
      ),
    },
  ],
  [
    'scriptObject',
    {
      name: 'scriptObject',
      type: FieldType.object,
      label: '脚本',
      textField: 'scriptName',
      valueField: 'scriptCode',
      lovCode: 'HMDE.SCRIPT',
      render: () => <Lov key="scriptObject" name="scriptObject" />,
    },
  ],
  [
    'scriptCode',
    {
      name: 'scriptCode',
      type: FieldType.string,
      bind: 'scriptObject.scriptCode',
    },
  ],
  [
    'message',
    {
      name: 'message',
      type: FieldType.object,
      label: '消息通知',
      lovCode: 'HMDE.MSG_SENG_CONFIG',
      ignore: FieldIgnore.always,
      render: () => <Lov key="message" name="message" />,
    },
  ],
  [
    'messageCode',
    {
      name: 'messageCode',
      type: FieldType.string,
      label: '消息通知',
      bind: 'message.messageCode',
    },
  ],
  [
    'conditionRelation',
    {
      name: 'conditionRelation',
      type: FieldType.string,
      label: '条件关系',
      render: () => <TextField key="conditionRelation" name="conditionRelation" />,
    },
  ],
  [
    'receiver',
    {
      name: 'receiver',
      type: FieldType.object,
      label: '接收人',
      lovCode: 'HMDE.MSG_RECEIVER_GROUP',
      textField: 'typeName',
      valueField: 'typeCode',
      ignore: FieldIgnore.always,
      multiple: true,
      render: () => <Lov key="receiver" name="receiver" />,
    },
  ],
  [
    'typeCode',
    {
      name: 'typeCode',
      type: FieldType.string,
      bind: 'receiver.typeCode',
    },
  ],
  [
    'receiverCode',
    {
      name: 'receiverCode',
      type: FieldType.string,
      bind: 'receiver.typeCode',
    },
  ],
  [
    'executeParameters',
    {
      name: 'executeParameters',
      label: '变量赋值',
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
  ],
  [
    'filterParameters',
    {
      name: 'filterParameters',
      label: '过滤条件',
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
  ],
  [
    'branches',
    {
      name: 'branches',
      label: '条件分支',
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
  ],
  [
    'setParams',
    {
      name: 'setParams',
      label: '设置参数',
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
  ],
  [
    'templateParams',
    {
      name: 'templateParams',
      label: '模板参数',
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
  ],
]);

const NodeConfig = new Map([
  [
    'IR',
    {
      headerArea: [
        'curNodeName',
        'nodeCode',
        'businessObject',
        'businessObjectCode',
        'businessObjectName',
        'businessObjectId',
        'executeParameters',
      ],
      assignmentArea: { FieldAssign: true },
      conditionArea: { FieldAssign: false },
      setTemplateParamArea: { FieldAssign: false },
    },
  ],
  [
    'DR',
    {
      headerArea: [
        'curNodeName',
        'nodeCode',
        'businessObject',
        'businessObjectCode',
        'businessObjectName',
        'businessObjectId',
      ],
      conditionArea: { FieldAssign: false },
      assignmentArea: { FieldAssign: false },
      setTemplateParamArea: { FieldAssign: false },
    },
  ],
  [
    'UR',
    {
      headerArea: [
        'curNodeName',
        'nodeCode',
        'businessObject',
        'businessObjectCode',
        'businessObjectName',
        'businessObjectId',
        'executeParameters',
      ],
      conditionArea: { FieldAssign: false },
      assignmentArea: { FieldAssign: true },
      setTemplateParamArea: { FieldAssign: false },
    },
  ],
  [
    'SR',
    {
      headerArea: [
        'curNodeName',
        'nodeCode',
        'businessObject',
        'businessObjectCode',
        'businessObjectName',
        'businessObjectId',
        'filterParameters',
        'conditionRelation',
      ],
      conditionArea: { FieldAssign: true },
      assignmentArea: { FieldAssign: false },
      setTemplateParamArea: { FieldAssign: false },
    },
  ],
  [
    'CONDITION',
    {
      headerArea: ['curNodeName', 'nodeCode', 'branches'],
      conditionArea: { FieldAssign: false },
      assignmentArea: { FieldAssign: false },
      conditionBranchArea: { FieldAssign: true },
      setTemplateParamArea: { FieldAssign: false },
    },
  ],
  [
    'END',
    {
      headerArea: ['curNodeName', 'nodeCode', 'outputConfig'],
      conditionArea: { FieldAssign: false },
      assignmentArea: { FieldAssign: false },
      conditionBranchArea: { FieldAssign: false },
      setTemplateParamArea: { FieldAssign: false },
    },
  ],
  [
    'SCRIPT',
    {
      headerArea: ['curNodeName', 'nodeCode', 'scriptCode', 'setParams', 'scriptObject'],
      conditionArea: { FieldAssign: false },
      assignmentArea: { FieldAssign: false },
      conditionBranchArea: { FieldAssign: false },
      setParamArea: { FieldAssign: true },
      setTemplateParamArea: { FieldAssign: false },
    },
  ],
  [
    'VA',
    {
      headerArea: ['curNodeName', 'nodeCode', 'executeParameters'],
      conditionArea: { FieldAssign: false },
      assignmentArea: { FieldAssign: true },
      conditionBranchArea: { FieldAssign: false },
      setParamArea: { FieldAssign: false },
      setTemplateParamArea: { FieldAssign: false },
    },
  ],
  [
    'MN',
    {
      headerArea: [
        'curNodeName',
        'nodeCode',
        'message',
        'messageCode',
        'receiver',
        'receiverCode',
        'templateParams',
        'typeCode',
      ],
      // headerArea: ['messageCode'],
      conditionArea: { FieldAssign: false },
      assignmentArea: { FieldAssign: false },
      conditionBranchArea: { FieldAssign: false },
      setParamArea: { FieldAssign: false },
      setTemplateParamArea: { FieldAssign: true },
    },
  ],
]);

export { NodeConfig, fieldsConfig };
